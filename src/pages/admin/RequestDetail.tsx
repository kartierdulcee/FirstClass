import { Link, useParams } from 'react-router-dom'
import { useAdminRequests, type AdminRequest, type RequestStatus } from '../../api/requests'
import { useApi } from '../../api/client'
import { useEffect, useState } from 'react'
import { useToast } from '../../components/toast'

type TimelineEvent = { id: string; ts: string; who: string; text: string }

export default function RequestDetail() {
  const { id } = useParams()
  const { rows } = useAdminRequests()
  const api = useApi()
  const { show } = useToast()
  const req = rows.find((r) => r.id === id) as AdminRequest | undefined

  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<RequestStatus>(req?.status ?? 'open')

  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        const data = await api<TimelineEvent[]>(`/admin/requests/${id}/timeline`)
        if (!alive) return
        setTimeline(data)
      } catch {
        setTimeline([])
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [api, id])

  if (!req) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">Request not found</h1>
        <Link to="/admin/requests" className="text-sm text-neutral-400 hover:text-neutral-200">Back to Requests</Link>
      </div>
    )
  }

  async function saveStatus(next: RequestStatus) {
    try {
      await api(`/admin/requests/${req!.id}`, { method: 'PATCH', body: JSON.stringify({ status: next }) })
      setStatus(next)
      show({ title: 'Request updated', description: `Status set to ${next.replace('_', ' ')}`, variant: 'success' })
    } catch (e) {
      show({ title: 'Update failed', description: String(e), variant: 'error' })
    }
  }

  async function addNote() {
    if (!note.trim()) return
    try {
      await api(`/admin/requests/${req!.id}/notes`, { method: 'POST', body: JSON.stringify({ note }) })
      setTimeline((t) => [
        { id: Math.random().toString(36).slice(2), ts: new Date().toISOString(), who: 'you', text: note },
        ...t,
      ])
      setNote('')
      show({ title: 'Note added', variant: 'success' })
    } catch (e) {
      // Still add locally
      setTimeline((t) => [
        { id: Math.random().toString(36).slice(2), ts: new Date().toISOString(), who: 'you', text: note },
        ...t,
      ])
      setNote('')
      show({ title: 'Saved locally', description: 'API not available', variant: 'warning' })
    }
  }

  function fmt(ts: string) {
    return new Date(ts).toLocaleString()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{req.subject}</h1>
          <div className="mt-1 text-sm text-neutral-400">{req.requester} • {fmt(req.createdAt)} • <span className="capitalize">{req.type}</span></div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/requests" className="rounded-xl border border-neutral-800 px-3 py-1 text-sm hover:bg-neutral-800/50">Back</Link>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 text-sm">
            {(['open','in_progress','closed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => saveStatus(s)}
                className={[
                  'px-2.5 py-1 rounded-xl capitalize',
                  status === s ? 'bg-neutral-800 text-white' : 'hover:bg-neutral-800/60 text-neutral-300',
                ].join(' ')}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
          <h3 className="text-sm font-semibold text-neutral-200">Activity</h3>
          <ul className="mt-3 space-y-2">
            {loading && (
              <>
                {Array.from({ length: 4 }).map((_, i) => (
                  <li key={`s-${i}`} className="rounded-lg border border-neutral-800/70 bg-neutral-950/60 p-3">
                    <div className="h-4 w-56 rounded-md skeleton" />
                    <div className="mt-2 h-3 w-32 rounded-md skeleton" />
                  </li>
                ))}
              </>
            )}
            {!loading && timeline.map((e) => (
              <li key={e.id} className="rounded-lg border border-neutral-800/70 bg-neutral-950/60 p-3">
                <div className="text-sm text-neutral-300">{e.text}</div>
                <div className="mt-1 text-xs text-neutral-500">{e.who} • {fmt(e.ts)}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
          <h3 className="text-sm font-semibold text-neutral-200">Add note</h3>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={5} placeholder="Add internal note…" className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-900/70 p-3 text-sm outline-none placeholder:text-neutral-500 focus:border-neutral-700" />
          <div className="mt-3 flex items-center justify-end gap-2">
            <button onClick={() => setNote('')} className="rounded-xl border border-neutral-800 px-3 py-1 hover:bg-neutral-800/50">Clear</button>
            <button onClick={addNote} className="rounded-xl border border-neutral-700 bg-[hsl(var(--brand))]/10 px-3 py-1 text-white hover:bg-[hsl(var(--brand))]/20">Save Note</button>
          </div>
        </div>
      </div>
    </div>
  )
}
