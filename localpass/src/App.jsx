import React, { useEffect, useMemo, useState } from 'react'
import Generator from './components/Generator.jsx'
import Vault from './components/Vault.jsx'

const STORAGE_KEY = 'localpass_entries_v1'

export default function App() {
  const [entries, setEntries] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    } catch {}
  }, [entries])

  const strings = useMemo(() => ({
    title: 'LocalPass',
    subtitle: 'Client-only password generator and local vault',
    privacy: 'All data stored locally. Use Export for encrypted backup.'
  }), [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight text-brand">{strings.title}</h1>
        <p className="text-slate-400">{strings.subtitle}</p>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-8 grid gap-6 md:grid-cols-2">
        <Generator entries={entries} setEntries={setEntries} />
        <Vault entries={entries} setEntries={setEntries} />
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-10 text-sm text-slate-400">
        {strings.privacy}
      </footer>
    </div>
  )
}


