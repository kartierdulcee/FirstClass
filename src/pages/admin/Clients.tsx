import { useState } from 'react'
import { useAdminClients } from '../../api/clients'
import { useToast } from '../../components/toast'
import { useDebounce } from '../../hooks/useDebounce'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../../api/client'

export default function Clients() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'paused'>('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState<'name' | 'owner' | 'status'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const debounced = useDebounce(search, 300)
  const { rows, total, loading, fetching, error, refetch } = useAdminClients({ search: debounced, status, page, pageSize, sortBy, sortDir })
  const [assignFor, setAssignFor] = useState<{ id: string; name: string } | null>(null)
  const [managerEmail, setManagerEmail] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newOwner, setNewOwner] = useState('')
  const [newStatus, setNewStatus] = useState<'active' | 'paused'>('active')
  const nav = useNavigate()
  const api = useApi()
  const { show } = useToast()

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="mt-1 text-neutral-300">Assign managers, open workspaces, and control plan limits.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800">
          New Client
        </button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-2 py-1 text-xs text-neutral-300">
            {(['all','active','paused'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={[
                  'px-2.5 py-1 rounded-xl capitalize',
                  status === s ? 'bg-neutral-800 text-white' : 'hover:bg-neutral-800/60',
                ].join(' ')}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="text-xs text-neutral-400">{total} total</div>
        </div>

        <div className="relative">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name or owner…"
            className="w-64 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm outline-none placeholder:text-neutral-500 focus:border-neutral-700"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(1) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-neutral-800 px-2 py-0.5 text-xs text-neutral-400 hover:bg-neutral-800/60"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900/70 text-neutral-300">
            <tr>
              <th className="px-4 py-2 text-left">
                <button
                  className="inline-flex items-center gap-1 hover:text-white"
                  onClick={() => {
                    if (sortBy === 'name') setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                    setSortBy('name')
                    setPage(1)
                  }}
                >
                  Client {sortBy === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </button>
              </th>
              <th className="px-4 py-2 text-left">
                <button
                  className="inline-flex items-center gap-1 hover:text-white"
                  onClick={() => {
                    if (sortBy === 'owner') setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                    setSortBy('owner')
                    setPage(1)
                  }}
                >
                  Owner Email {sortBy === 'owner' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </button>
              </th>
              <th className="px-4 py-2 text-left">
                <button
                  className="inline-flex items-center gap-1 hover:text-white"
                  onClick={() => {
                    if (sortBy === 'status') setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
                    setSortBy('status')
                    setPage(1)
                  }}
                >
                  Status {sortBy === 'status' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </button>
              </th>
              <th className="px-4 py-2 text-right">Actions</th>
              <th className="px-4 py-2 text-right">
                {fetching && (
                  <span className="inline-flex items-center gap-2 text-xs text-neutral-400">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-neutral-500" /> Refreshing
                  </span>
                )}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/70">
            {loading && (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`s-${i}`}>
                    <td className="px-4 py-3"><div className="h-4 w-48 rounded-md skeleton" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-56 rounded-md skeleton" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 rounded-md skeleton" /></td>
                    <td className="px-4 py-3 text-right"><div className="h-8 w-28 ml-auto rounded-md skeleton" /></td>
                  </tr>
                ))}
              </>
            )}
            {!loading && rows.map((r) => (
              <tr key={r.id} className="hover:bg-neutral-900/40 transition-colors">
                <td className="px-4 py-2">{r.name}</td>
                <td className="px-4 py-2 text-neutral-300">{r.owner}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-lg text-xs ${
                    r.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-700/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-700/40'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => nav(`/admin/clients/${r.id}`)}
                    className="rounded-xl border border-neutral-800 px-3 py-1 hover:bg-neutral-800/50"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => {
                      setAssignFor({ id: r.id, name: r.name })
                      setManagerEmail('')
                    }}
                    className="ml-2 rounded-xl border border-neutral-800 px-3 py-1 hover:bg-neutral-800/50"
                  >
                    Assign Manager
                  </button>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-400">
                  No clients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-neutral-300">
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-neutral-800 px-2 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Prev
          </button>
          <button
            className="rounded-lg border border-neutral-800 px-2 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => p + 1)}
            disabled={rows.length < pageSize || (page * pageSize) >= total}
          >
            Next
          </button>
          <span className="ml-2 text-xs text-neutral-500">Page {page}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
            className="rounded-lg border border-neutral-800 bg-neutral-900/70 px-2 py-1 text-xs"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-700/50 bg-amber-900/20 px-3 py-2 text-xs text-amber-200">
          API error: {error}
        </div>
      )}

      {/* Assign manager modal */}
      {assignFor && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-xl">
            <h3 className="text-lg font-semibold">Assign Manager</h3>
            <p className="mt-1 text-sm text-neutral-400">Map a staff user to “{assignFor.name}”.</p>
            <label className="mt-4 block text-sm text-neutral-300">Manager email</label>
            <input
              autoFocus
              value={managerEmail}
              onChange={(e) => setManagerEmail(e.target.value)}
              placeholder="name@company.com"
              className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm outline-none placeholder:text-neutral-500 focus:border-neutral-700"
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => setAssignFor(null)} className="rounded-xl border border-neutral-800 px-3 py-1 hover:bg-neutral-800/50">
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await api(`/admin/clients/${assignFor.id}/manager`, {
                      method: 'POST',
                      body: JSON.stringify({ email: managerEmail.trim() }),
                    })
                    show({ title: 'Manager assigned', description: managerEmail, variant: 'success' })
                  } catch (e) {
                    console.warn('Assign manager failed, using mock only', e)
                    show({ title: 'Assign failed', description: String(e), variant: 'error' })
                  } finally {
                    setAssignFor(null)
                    setManagerEmail('')
                    refetch()
                  }
                }}
                className="rounded-xl border border-neutral-700 bg-[hsl(var(--brand))]/10 px-3 py-1 text-white hover:bg-[hsl(var(--brand))]/20"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New client modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-xl">
            <h3 className="text-lg font-semibold">New Client</h3>
            <p className="mt-1 text-sm text-neutral-400">Create a workspace and owner account.</p>
            <label className="mt-4 block text-sm text-neutral-300">Client name</label>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Acme Labs"
              className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm outline-none placeholder:text-neutral-500 focus:border-neutral-700"
            />
            <label className="mt-3 block text-sm text-neutral-300">Owner email</label>
            <input
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              placeholder="owner@acme.com"
              className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm outline-none placeholder:text-neutral-500 focus:border-neutral-700"
            />
            <label className="mt-3 block text-sm text-neutral-300">Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as any)}
              className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm outline-none focus:border-neutral-700"
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => setShowNew(false)} className="rounded-xl border border-neutral-800 px-3 py-1 hover:bg-neutral-800/50">
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await api('/admin/clients', {
                      method: 'POST',
                      body: JSON.stringify({ name: newName, owner: newOwner, status: newStatus }),
                    })
                    // Auto-open onboarding request
                    try {
                      await api('/admin/requests', {
                        method: 'POST',
                        body: JSON.stringify({ type: 'onboarding', subject: `Onboarding: ${newName}`, requester: newOwner }),
                      })
                    } catch (e) {
                      console.warn('Auto-open onboarding request failed', e)
                    }
                    show({ title: 'Client created', description: newName, variant: 'success' })
                  } catch (e) {
                    console.warn('Create client failed, using mock only', e)
                    show({ title: 'Create failed', description: String(e), variant: 'error' })
                  } finally {
                    setShowNew(false)
                    setNewName('')
                    setNewOwner('')
                    setNewStatus('active')
                    refetch()
                  }
                }}
                className="rounded-xl border border-neutral-700 bg-[hsl(var(--brand))]/10 px-3 py-1 text-white hover:bg-[hsl(var(--brand))]/20"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Removed sample-data note; this page now reflects live API data. */}
    </div>
  )
}
