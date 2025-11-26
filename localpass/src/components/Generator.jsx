import React, { useEffect, useMemo, useRef, useState } from 'react'
import { generatePassword, estimateStrength } from '../utils/pwgen.js'
import { encryptData, decryptData } from '../utils/crypto.js'
import { checkPasswordBreach, getSecurityRecommendation } from '../utils/breachCheck.js'

const STORAGE_KEY = 'localpass_entries_v1'
const PASSPHRASE_KEY = 'localpass_passphrase_v1'

export default function Generator({ entries, setEntries }) {
  const [length, setLength] = useState(16)
  const [lowercase, setLowercase] = useState(true)
  const [uppercase, setUppercase] = useState(true)
  const [numbers, setNumbers] = useState(true)
  const [symbols, setSymbols] = useState(false)
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(true)
  const [pronounceable, setPronounceable] = useState(false)

  const [label, setLabel] = useState('')
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const [passphrase, setPassphrase] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [breachCheckResult, setBreachCheckResult] = useState(null)
  const [isCheckingBreach, setIsCheckingBreach] = useState(false)
  const fileInputRef = useRef()

  const options = useMemo(() => ({ length, lowercase, uppercase, numbers, symbols, avoidAmbiguous, pronounceable }), [length, lowercase, uppercase, numbers, symbols, avoidAmbiguous, pronounceable])
  const strength = useMemo(() => estimateStrength(password || '', options), [password, options])

  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(false), 1200)
      return () => clearTimeout(t)
    }
  }, [copied])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PASSPHRASE_KEY)
      if (saved) setPassphrase(saved)
    } catch {}
  }, [])

  useEffect(() => {
    try {
      if (passphrase) localStorage.setItem(PASSPHRASE_KEY, passphrase)
      else localStorage.removeItem(PASSPHRASE_KEY)
    } catch {}
  }, [passphrase])

  // Debounced breach check for manually typed passwords
  useEffect(() => {
    if (!password) {
      setBreachCheckResult(null)
      return
    }
    
    const timeoutId = setTimeout(() => {
      checkBreachStatus(password)
    }, 1000) // Wait 1 second after user stops typing
    
    return () => clearTimeout(timeoutId)
  }, [password])

  async function checkBreachStatus(password) {
    if (!password) return
    
    setIsCheckingBreach(true)
    setBreachCheckResult(null)
    
    try {
      const result = await checkPasswordBreach(password)
      setBreachCheckResult(result)
    } catch (error) {
      setBreachCheckResult({
        isBreached: false,
        count: 0,
        message: `Breach check failed: ${error.message}`,
        error: true
      })
    } finally {
      setIsCheckingBreach(false)
    }
  }

  function onGenerate() {
    try {
      const pw = generatePassword(options)
      setPassword(pw)
      checkBreachStatus(pw)
    } catch (e) {
      alert(e.message)
    }
  }

  async function onAIGenerate() {
    try {
      if (!globalThis.crypto || !globalThis.crypto.getRandomValues || !globalThis.crypto.subtle || !globalThis.crypto.subtle.digest) {
        alert('Secure generation unavailable: Web Crypto API not supported in this environment')
        return
      }

      const { length: desiredLength, lowercase, uppercase, numbers, symbols, avoidAmbiguous } = options

      const AMBIGUOUS = new Set(['l','I','1','O','0','o','S','5','B','8'])
      const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
      const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      const NUMBERS = '0123456789'
      const SYMBOLS = "!@#$%^&*()-_=+[]{};:'\",.<>/?`~|"

      let charset = ''
      if (lowercase) charset += LOWERCASE
      if (uppercase) charset += UPPERCASE
      if (numbers) charset += NUMBERS
      if (symbols) charset += SYMBOLS
      if (avoidAmbiguous) charset = [...charset].filter(c => !AMBIGUOUS.has(c)).join('')
      if (!charset.length) {
        alert('Select at least one character set in settings')
        return
      }

      const promptText = prompt('Describe what you want (optional). This helps guide the local generator:') || ''
      const enc = new TextEncoder()
      const promptBytes = enc.encode(promptText)

      const rand = new Uint8Array(48)
      globalThis.crypto.getRandomValues(rand)

      const concat = new Uint8Array(promptBytes.length + rand.length)
      concat.set(promptBytes, 0)
      concat.set(rand, promptBytes.length)

      async function sha512(bytes) {
        const buf = await globalThis.crypto.subtle.digest('SHA-512', bytes)
        return new Uint8Array(buf)
      }

      let hash = await sha512(concat)
      let i = 0
      let out = ''
      const target = Math.min(64, Math.max(8, desiredLength|0))
      while (out.length < target) {
        out += charset[ hash[i % hash.length] % charset.length ]
        i++
        if (i >= hash.length && out.length < target) {
          hash = await sha512(hash)
          i = 0
        }
      }

      setPassword(out)
      checkBreachStatus(out)
    } catch (e) {
      alert('AI generate failed: ' + (e && e.message ? e.message : String(e)))
    }
  }

  async function onCopy(text) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      alert('Copy failed')
    }
  }

  function onSave() {
    if (!password) return alert('Generate a password first')
    const entry = {
      id: crypto.randomUUID(),
      label: label || 'Untitled',
      password,
      createdAt: new Date().toISOString()
    }
    setEntries(prev => [entry, ...prev])
    setLabel('')
  }

  async function onExport(encrypted) {
    try {
      const data = entries
      let blobContent
      if (encrypted) {
        if (!passphrase) return
        const payload = await encryptData(data, passphrase)
        blobContent = JSON.stringify(payload)
      } else {
        blobContent = JSON.stringify(data)
      }
      const blob = new Blob([blobContent], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = encrypted ? 'localpass_encrypted.json' : 'localpass.json'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      if (encrypted) {
        // Clear the passphrase so it is not left in the UI/localStorage after export
        setPassphrase('')
      }
    } catch (e) {}
  }

  async function onImport(file) {
    try {
      const text = await file.text()
      let imported
      try {
        const parsed = JSON.parse(text)
        if (parsed && parsed.v === 1 && parsed.ct) {
          const p = prompt('Enter passphrase to decrypt import:')
          if (!p) return
          imported = await decryptData(parsed, p)
        } else {
          imported = parsed
        }
      } catch (e) {
        throw new Error('Invalid file format')
      }
      if (!Array.isArray(imported)) throw new Error('Import expects an array')

      const existingIds = new Set(entries.map(e => e.id))
      const merged = [...imported.filter(e => !existingIds.has(e.id)), ...entries]
      setEntries(merged)
      alert('Import complete')
    } catch (e) {
      alert('Import failed: ' + e.message)
    }
  }

  function onSeed() {
    const demo = [
      { id: crypto.randomUUID(), label: 'Example Site', password: 'Xy7!gH9kLm', createdAt: new Date().toISOString() },
      { id: crypto.randomUUID(), label: 'Mail', password: 'correct-horse-battery-staple', createdAt: new Date().toISOString() },
    ]
    setEntries(prev => [...demo, ...prev])
  }

  return (
    <section className="card p-5" aria-label="Password generator">
      <h2 className="text-xl font-semibold mb-4">Password Generator</h2>

      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            aria-label="Generated password"
            className="input font-mono flex-1"
            value={password}
            onChange={e=>setPassword(e.target.value)}
          />
          <button className="btn-ghost" onClick={() => onCopy(password)} aria-label="Copy password">
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn-primary" onClick={onGenerate} aria-label="Generate password">Generate</button>
          <button className="btn-ghost" onClick={onAIGenerate} aria-label="AI Generate password" title="Generate a high-entropy password locally (no network)">AI Generate</button>
          <button 
            className="btn-ghost" 
            onClick={() => checkBreachStatus(password)} 
            disabled={!password || isCheckingBreach}
            aria-label="Check password breach status"
            title="Check if password has been found in data breaches"
          >
            {isCheckingBreach ? 'Checking...' : 'Check Breach'}
          </button>
          <div className="flex-1 h-2 rounded bg-slate-800 overflow-hidden" aria-label="Strength meter" title={`${Math.round(strength.entropy)} bits`}>
            <div
              className={`h-full transition-base ${strength.label === 'Strong' ? 'bg-emerald-400' : strength.label === 'Good' ? 'bg-brand' : strength.label === 'Fair' ? 'bg-yellow-400' : 'bg-red-400'}`}
              style={{ width: `${Math.round(strength.normalized * 100)}%` }}
            />
          </div>
          <span className="text-sm text-slate-400 w-16">{strength.label}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="col-span-2 md:col-span-3 flex items-center gap-3">
            <label htmlFor="length" className="text-sm text-slate-300">Length</label>
            <input id="length" className="flex-1" type="range" min="8" max="64" value={length} onChange={e=>setLength(Number(e.target.value))} aria-label="Length" />
            <span className="w-10 text-right text-sm tabular-nums">{length}</span>
          </div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={lowercase} onChange={e=>setLowercase(e.target.checked)} />Lowercase</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={uppercase} onChange={e=>setUppercase(e.target.checked)} />Uppercase</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={numbers} onChange={e=>setNumbers(e.target.checked)} />Numbers</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={symbols} onChange={e=>setSymbols(e.target.checked)} />Symbols</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={avoidAmbiguous} onChange={e=>setAvoidAmbiguous(e.target.checked)} />Avoid ambiguous</label>
          <label className="flex items-center gap-2 col-span-2 md:col-span-1"><input type="checkbox" checked={pronounceable} onChange={e=>setPronounceable(e.target.checked)} />Pronounceable</label>
        </div>

        {/* Breach Check Results */}
        {breachCheckResult && (
          <div className={`p-3 rounded-lg border ${
            breachCheckResult.error 
              ? 'bg-yellow-900/20 border-yellow-500/30' 
              : breachCheckResult.isBreached 
                ? 'bg-red-900/20 border-red-500/30' 
                : 'bg-green-900/20 border-green-500/30'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${
                breachCheckResult.error 
                  ? 'bg-yellow-400' 
                  : breachCheckResult.isBreached 
                    ? 'bg-red-400' 
                    : 'bg-green-400'
              }`} />
              <span className="font-medium text-sm">
                {breachCheckResult.error 
                  ? 'Breach Check Error' 
                  : breachCheckResult.isBreached 
                    ? 'Password Compromised' 
                    : 'Password Secure'
                }
              </span>
            </div>
            <p className="text-sm text-slate-300 mb-2">{breachCheckResult.message}</p>
            <p className="text-xs text-slate-400">{getSecurityRecommendation(breachCheckResult)}</p>
          </div>
        )}

        <div className="flex gap-2">
          <input className="input" placeholder="Label (e.g., Site name)" value={label} onChange={e=>setLabel(e.target.value)} aria-label="Label" />
          <button className="btn-secondary" onClick={onSave} aria-label="Save entry">Save</button>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed" disabled={!passphrase} onClick={() => onExport(true)} aria-label="Export encrypted JSON">Export Encrypted</button>
          <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={(e)=>{ if(e.target.files?.[0]) onImport(e.target.files[0]); e.target.value=''; }} />
          <button className="btn-ghost" onClick={() => fileInputRef.current?.click()} aria-label="Import JSON">Import</button>
          <button className="btn-ghost" onClick={onSeed} aria-label="Seed demo">Seed demo</button>
        </div>

        <div className="pt-2">
          <button className="btn-ghost" onClick={()=>setShowSettings(s=>!s)} aria-label="Toggle settings">Settings</button>
          {showSettings && (
            <div className="mt-2 flex items-center gap-2">
              <input className="input max-w-xs" placeholder="Set export passphrase" value={passphrase} onChange={e=>setPassphrase(e.target.value)} aria-label="Set passphrase" />
              <span className="text-xs text-slate-400">Used for encrypted export</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}


