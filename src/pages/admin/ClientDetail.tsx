import { useParams, Link } from 'react-router-dom'
import { useAdminClients } from '../../api/clients'
import { useApi } from '../../api/client'
import { useEffect, useState } from 'react'
import { useToast } from '../../components/toast'

type TimelineEvent = { id: string; ts: string; who: string; text: string }

export default function ClientDetail() {
  const { id } = useParams()
  const { rows } = useAdminClients()
  const client = rows.find((c) => c.id === id)
  const api = useApi()
  const { show } = useToast()
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [managers, setManagers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        const [tl, mgrs] = await Promise.all([
          api<TimelineEvent[]>(`/admin/clients/${id}/timeline`),
          api<string[]>(`/admin/clients/${id}/managers`),
        ])
        if (!alive) return
        setTimeline(tl)
        setManagers(mgrs)
      } catch (e) {
        setTimeline([])
        setManagers([])
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [api, id])

  if (!client) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">Client not found</h1>
        <Link to="/admin/clients" className="text-sm text-neutral-400 hover:text-neutral-200">Back to Clients</Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{client.name}</h1>
          <div className="mt-1 text-neutral-400 text-sm">ID: {client.id}</div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/clients" className="rounded-xl border border-neutral-800 px-3 py-1 text-sm hover:bg-neutral-800/50">Back</Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
          <h3 className="text-sm font-semibold text-neutral-200">Owner</h3>
          <div className="mt-2 text-neutral-300">{client.owner}</div>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
          <h3 className="text-sm font-semibold text-neutral-200">Status</h3>
          <div className="mt-2">
            <span className={`px-2 py-1 rounded-lg text-xs ${
              client.status === 'active'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-700/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-700/40'
            }`}>
              {client.status}
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
          <h3 className="text-sm font-semibold text-neutral-200">Managers</h3>
          <ul className="mt-2 space-y-2">
            {loading && Array.from({ length: 2 }).map((_, i) => (
              <li key={`m-s-${i}`} className="h-4 w-48 rounded-md skeleton" />
            ))}
            {!loading && managers.map((m) => (
              <li key={m} className="flex items-center justify-between">
                <span className="text-neutral-300">{m}</span>
                <button
                  onClick={async () => {
                    try {
                      await api(`/admin/clients/${id}/manager`, { method: 'DELETE', body: JSON.stringify({ email: m }) })
                      setManagers((arr) => arr.filter((x) => x !== m))
                      show({ title: 'Manager removed', description: m, variant: 'success' })
                    } catch (e) {
                      show({ title: 'Remove failed', description: String(e), variant: 'error' })
                    }
                  }}
                  className="rounded-lg border border-neutral-800 px-2 py-1 text-xs hover:bg-neutral-800/50"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-2">
            <input
              value={adding}
              onChange={(e) => setAdding(e.target.value)}
              placeholder="manager@company.com"
              className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm outline-none placeholder:text-neutral-500 focus:border-neutral-700"
            />
            <button
              onClick={async () => {
                try {
                  const email = adding.trim()
                  if (!email) return
                  await api(`/admin/clients/${id}/manager`, { method: 'POST', body: JSON.stringify({ email }) })
                  setManagers((arr) => Array.from(new Set([...arr, email])))
                  setAdding('')
                  show({ title: 'Manager added', description: email, variant: 'success' })
                } catch (e) {
                  show({ title: 'Add failed', description: String(e), variant: 'error' })
                }
              }}
              className="rounded-xl border border-neutral-700 bg-[hsl(var(--brand))]/10 px-3 py-2 text-sm text-white hover:bg-[hsl(var(--brand))]/20"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
        <h3 className="text-sm font-semibold text-neutral-200">Notes</h3>
        <p className="mt-2 text-sm text-neutral-300">Future: show billing, usage, managers, and automation settings here.</p>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
        <h3 className="text-sm font-semibold text-neutral-200">Activity</h3>
        <ul className="mt-3 space-y-2">
          {loading && Array.from({ length: 4 }).map((_, i) => (
            <li key={`t-s-${i}`} className="rounded-lg border border-neutral-800/70 bg-neutral-950/60 p-3">
              <div className="h-4 w-56 rounded-md skeleton" />
              <div className="mt-2 h-3 w-32 rounded-md skeleton" />
            </li>
          ))}
          {!loading && timeline.map((e) => (
            <li key={e.id} className="rounded-lg border border-neutral-800/70 bg-neutral-950/60 p-3">
              <div className="text-sm text-neutral-300">{e.text}</div>
              <div className="mt-1 text-xs text-neutral-500">{e.who} • {new Date(e.ts).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
