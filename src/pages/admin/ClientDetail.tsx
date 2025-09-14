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
  const [onboarding, setOnboarding] = useState<{ createdAt: string; data: any } | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        const [tl, mgrs, ob] = await Promise.all([
          api<TimelineEvent[]>(`/admin/clients/${id}/timeline`),
          api<string[]>(`/admin/clients/${id}/managers`),
          api<{ createdAt: string; data: any } | null>(`/admin/clients/${id}/onboarding`).catch(() => null),
        ])
        if (!alive) return
        setTimeline(tl)
        setManagers(mgrs)
        setOnboarding(ob)
        setForm(ob?.data || null)
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
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-200">Onboarding Details</h3>
          <div className="flex items-center gap-2">
            {onboarding && !editing && (
              <button onClick={() => { setEditing(true); setForm(onboarding.data) }} className="rounded-xl border border-neutral-800 px-3 py-1 text-sm hover:bg-neutral-800/50">Edit</button>
            )}
          </div>
        </div>

        {!onboarding && (
          <p className="mt-2 text-sm text-neutral-400">No onboarding captured yet.</p>
        )}

        {onboarding && !editing && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <Field label="Name" value={onboarding.data?.name} />
            <Field label="Email" value={onboarding.data?.email} />
            <Field label="Brand" value={onboarding.data?.brand} />
            <Field label="Website" value={onboarding.data?.website} link />
            <Field label="Instagram" value={onboarding.data?.instagram} />
            <Field label="Twitter/X" value={onboarding.data?.twitter} />
            <Field label="YouTube" value={onboarding.data?.youtube} />
            <Field label="Cadence" value={onboarding.data?.cadence} />
            <div className="md:col-span-2">
              <div className="text-xs text-neutral-400">Channels</div>
              <div className="mt-1 flex flex-wrap gap-2">
                {(onboarding.data?.channels || []).map((c: string) => (
                  <span key={c} className="px-2 py-0.5 rounded-full border border-neutral-700 text-neutral-300 text-xs">{c}</span>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs text-neutral-400">Goals</div>
              <div className="mt-1 text-neutral-300 whitespace-pre-wrap">{onboarding.data?.goals}</div>
            </div>
            {onboarding.data?.pillars && (
              <div className="md:col-span-2">
                <div className="text-xs text-neutral-400">Pillars / Voice</div>
                <div className="mt-1 text-neutral-300 whitespace-pre-wrap">{onboarding.data?.pillars}</div>
              </div>
            )}
            {onboarding.data?.approvalFlow && (
              <div className="md:col-span-2">
                <div className="text-xs text-neutral-400">Approval Workflow</div>
                <div className="mt-1 text-neutral-300 whitespace-pre-wrap">{onboarding.data?.approvalFlow}</div>
              </div>
            )}
            {onboarding.data?.assetsUrl && (
              <Field label="Brand Assets" value={onboarding.data?.assetsUrl} link className="md:col-span-2" />
            )}
            {onboarding.data?.notes && (
              <div className="md:col-span-2">
                <div className="text-xs text-neutral-400">Notes</div>
                <div className="mt-1 text-neutral-300 whitespace-pre-wrap">{onboarding.data?.notes}</div>
              </div>
            )}
            <div className="md:col-span-2 text-xs text-neutral-500">Submitted {new Date(onboarding.createdAt).toLocaleString()}</div>
          </div>
        )}

        {onboarding && editing && (
          <div className="mt-3 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="Name" value={form?.name || ''} onChange={(v) => setForm({ ...form, name: v })} />
              <Input label="Email" type="email" value={form?.email || ''} onChange={(v) => setForm({ ...form, email: v })} />
              <Input label="Brand" value={form?.brand || ''} onChange={(v) => setForm({ ...form, brand: v })} />
              <Input label="Website" value={form?.website || ''} onChange={(v) => setForm({ ...form, website: v })} />
              <Input label="Instagram" value={form?.instagram || ''} onChange={(v) => setForm({ ...form, instagram: v })} />
              <Input label="Twitter/X" value={form?.twitter || ''} onChange={(v) => setForm({ ...form, twitter: v })} />
              <Input label="YouTube" value={form?.youtube || ''} onChange={(v) => setForm({ ...form, youtube: v })} />
              <Input label="Cadence" value={form?.cadence || ''} onChange={(v) => setForm({ ...form, cadence: v })} />
            </div>
            <div>
              <div className="text-xs text-neutral-400">Channels</div>
              <div className="mt-1 flex flex-wrap gap-2">
                {['YouTube','Instagram','X/Twitter','LinkedIn','TikTok','Blog','Newsletter'].map((c) => (
                  <label key={c} className={`px-2 py-0.5 rounded-full border text-xs cursor-pointer ${form?.channels?.includes(c) ? 'bg-[hsl(var(--brand))]/20 border-[hsl(var(--brand))]' : 'border-neutral-700 hover:border-neutral-600'}`}>
                    <input type="checkbox" className="hidden" checked={!!form?.channels?.includes(c)} onChange={(e) => {
                      const checked = e.target.checked
                      setForm((f: any) => ({ ...f, channels: checked ? Array.from(new Set([...(f?.channels || []), c])) : (f?.channels || []).filter((x: string) => x !== c) }))
                    }} />
                    {c}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Textarea label="Goals" value={form?.goals || ''} onChange={(v) => setForm({ ...form, goals: v })} />
              <Textarea label="Pillars / Voice" value={form?.pillars || ''} onChange={(v) => setForm({ ...form, pillars: v })} />
              <Textarea label="Approval Workflow" value={form?.approvalFlow || ''} onChange={(v) => setForm({ ...form, approvalFlow: v })} />
              <Input label="Brand Assets" value={form?.assetsUrl || ''} onChange={(v) => setForm({ ...form, assetsUrl: v })} />
              <Textarea label="Notes" value={form?.notes || ''} onChange={(v) => setForm({ ...form, notes: v })} />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => { setEditing(false); setForm(onboarding.data) }} className="rounded-xl border border-neutral-800 px-3 py-1 text-sm hover:bg-neutral-800/50">Cancel</button>
              <button disabled={saving} onClick={async () => {
                try {
                  setSaving(true)
                  await api(`/admin/clients/${id}/onboarding`, { method: 'PUT', body: JSON.stringify(form) })
                  setEditing(false)
                  // refetch
                  const ob = await api<{ createdAt: string; data: any } | null>(`/admin/clients/${id}/onboarding`).catch(() => null)
                  setOnboarding(ob)
                  show({ title: 'Onboarding updated', variant: 'success' })
                } catch (e) {
                  show({ title: 'Save failed', description: String(e), variant: 'error' })
                } finally {
                  setSaving(false)
                }
              }} className="rounded-xl border border-neutral-700 bg-[hsl(var(--brand))]/10 px-3 py-1 text-sm text-white hover:bg-[hsl(var(--brand))]/20 disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
              <button disabled={saving} onClick={async () => {
                try {
                  setSaving(true)
                  await api(`/admin/clients/${id}/onboarding?sync=1`, { method: 'PUT', body: JSON.stringify(form) })
                  setEditing(false)
                  const ob = await api<{ createdAt: string; data: any } | null>(`/admin/clients/${id}/onboarding`).catch(() => null)
                  setOnboarding(ob)
                  show({ title: 'Saved & synced to Airtable', variant: 'success' })
                } catch (e) {
                  show({ title: 'Sync failed', description: String(e), variant: 'error' })
                } finally {
                  setSaving(false)
                }
              }} className="rounded-xl border border-neutral-700 bg-[hsl(var(--brand))] px-3 py-1 text-sm text-white hover:opacity-90 disabled:opacity-60">Save & Sync</button>
            </div>
          </div>
        )}
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

function Field({ label, value, link, className }: { label: string; value?: string; link?: boolean; className?: string }) {
  if (!value) return null
  return (
    <div className={className}>
      <div className="text-xs text-neutral-400">{label}</div>
      {link ? (
        <a href={value} target="_blank" rel="noreferrer" className="mt-1 block text-neutral-200 hover:underline break-all">{value}</a>
      ) : (
        <div className="mt-1 text-neutral-300 break-all">{value}</div>
      )}
    </div>
  )
}

function Input({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block text-sm">
      <span className="text-neutral-300">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} type={type} className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900/70 px-3 py-2 outline-none placeholder:text-neutral-500 focus:border-neutral-700" />
    </label>
  )
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="text-neutral-300">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-900/70 px-3 py-2 outline-none placeholder:text-neutral-500 focus:border-neutral-700 min-h-[100px]" />
    </label>
  )
}
