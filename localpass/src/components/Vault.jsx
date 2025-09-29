import React, { useState } from 'react'
import Entry from './Entry.jsx'

const STORAGE_KEY = 'localpass_entries_v1'

export default function Vault({ entries, setEntries }) {
  const [query, setQuery] = useState('')

  function onDelete(id) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }
  function onUpdateLabel(id, label) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, label } : e))
  }
  function onClear() {
    if (confirm('Clear all entries?')) setEntries([])
  }

  const filtered = entries.filter(e => e.label.toLowerCase().includes(query.toLowerCase()))

  return (
    <section className="card p-5" aria-label="Saved vault">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Saved Vault <span className="text-slate-400 text-sm">({entries.length})</span></h2>
        <button className="btn-ghost" onClick={onClear} aria-label="Clear all">Clear all</button>
      </div>
      <input
        aria-label="Search entries"
        className="input mb-3"
        placeholder="Search by label"
        value={query}
        onChange={e=>setQuery(e.target.value)}
      />
      <div className="space-y-1 max-h-[65vh] overflow-auto pr-1" role="list" aria-label="Vault entries">
        {filtered.length === 0 ? (
          <div className="text-slate-400 text-sm">No entries yet.</div>
        ) : filtered.map(e => (
          <div key={e.id} role="listitem">
            <Entry entry={e} onDelete={onDelete} onUpdateLabel={onUpdateLabel} />
          </div>
        ))}
      </div>
    </section>
  )
}


