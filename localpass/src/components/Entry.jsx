import React, { useState } from 'react'

export default function Entry({ entry, onDelete, onUpdateLabel }) {
  const [revealed, setRevealed] = useState(false)
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(entry.label || '')
  const created = new Date(entry.createdAt)

  async function copy() {
    try {
      await navigator.clipboard.writeText(entry.password)
    } catch {}
  }

  function saveLabel() {
    onUpdateLabel(entry.id, label || 'Untitled')
    setEditing(false)
  }

  return (
    <div className="grid gap-1 md:grid-cols-12 rounded-lg bg-slate-800 px-3 py-2 overflow-hidden">
      <div className="md:col-span-6 min-w-0">
        {editing ? (
          <input className="input py-1" value={label} onChange={e=>setLabel(e.target.value)} onBlur={saveLabel} onKeyDown={e=>{ if(e.key==='Enter') saveLabel() }} />
        ) : (
          <div className="font-medium truncate" title={entry.label}>{entry.label || 'Untitled'}</div>
        )}
        <div className="text-[11px] leading-4 text-slate-400">{created.toLocaleString()}</div>
      </div>
      <div className="md:col-span-3 font-mono text-sm text-slate-300 md:text-right truncate min-w-0">
        {revealed ? entry.password : '•'.repeat(Math.min(10, entry.password.length))}
      </div>
      <div className="md:col-span-3 flex items-center justify-end gap-1 flex-wrap">
        <button className="btn-ghost px-2 py-1" onClick={()=>setRevealed(r=>!r)} aria-label={revealed ? 'Hide password' : 'Reveal password'} title={revealed ? 'Hide' : 'Reveal'}>
          {revealed ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M3.53 2.47a.75.75 0 1 0-1.06 1.06l2.137 2.136C2.5 7.13 1.248 8.96.53 10.42a1.125 1.125 0 0 0 0 1.16C2.266 14.53 6.17 18.75 12 18.75c1.79 0 3.37-.36 4.74-.98l3.73 3.73a.75.75 0 1 0 1.06-1.06L3.53 2.47ZM12 17.25c-5.13 0-8.6-3.85-10.14-6.17.6-.92 1.58-2.18 2.92-3.34l2.36 2.36A4.5 4.5 0 0 0 12 16.5c.75 0 1.46-.18 2.09-.49l1.64 1.64c-1.02.32-2.18.6-3.73.6Zm0-3.75a2.999 2.999 0 0 1-2.83-2l4.83 4.83c-.59.38-1.29.62-2 .62Zm7.33-1.95 2.81-2.81c.39.43.74.86 1.02 1.23.43.55.43 1.32 0 1.87C21.73 13.66 17.83 18 12 18c-1.21 0-2.33-.16-3.36-.44l1.43-1.43c.63.19 1.3.3 1.99.3 4.75 0 8.1-3.57 9.27-5.23Z"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 5.25c-5.83 0-9.73 4.34-11.16 6.31a1.125 1.125 0 0 0 0 1.16C2.27 14.7 6.17 19.05 12 19.05s9.73-4.34 11.16-6.31a1.125 1.125 0 0 0 0-1.16C21.73 9.59 17.83 5.25 12 5.25Zm0 11.25a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Zm0-2.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"/></svg>
          )}
        </button>
        <button className="btn-ghost px-2 py-1" onClick={copy} aria-label="Copy password" title="Copy">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M8 2.75A2.75 2.75 0 0 0 5.25 5.5v9A2.75 2.75 0 0 0 8 17.25h7A2.75 2.75 0 0 0 17.75 14.5v-9A2.75 2.75 0 0 0 15 2.75H8Zm-1.5 2.75c0-.83.67-1.5 1.5-1.5h7c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5H8c-.83 0-1.5-.67-1.5-1.5v-9Zm-.25 14a.75.75 0 0 1 .75-.75h9.5a.75.75 0 0 1 0 1.5H7a.75.75 0 0 1-.75-.75Z"/></svg>
        </button>
        <button className="btn-ghost px-2 py-1" onClick={()=>setEditing(true)} aria-label="Edit label" title="Edit">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M3 17.25V21h3.75l11-11.03-3.75-3.75L3 17.25Zm18.71-11.21a1.004 1.004 0 0 0 0-1.42l-2.33-2.33a1.004 1.004 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83Z"/></svg>
        </button>
        <button className="btn-ghost px-2 py-1" onClick={()=>onDelete(entry.id)} aria-label="Delete entry" title="Delete">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M9 3.75A1.75 1.75 0 0 1 10.75 2h2.5A1.75 1.75 0 0 1 15 3.75V5h4.25a.75.75 0 0 1 0 1.5H4.75a.75.75 0 0 1 0-1.5H9V3.75ZM5.75 7h12.5l-.73 12.04A2.25 2.25 0 0 1 15.28 21H8.72a2.25 2.25 0 0 1-2.24-1.96L5.75 7Z"/></svg>
        </button>
      </div>
    </div>
  )
}


