import { useState } from 'react'
import { useAdminRequests, type RequestStatus, type RequestType } from '../../api/requests'
import { useDebounce } from '../../hooks/useDebounce'
import { Link } from 'react-router-dom'

export default function Requests() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | RequestStatus>('all')
  const [type, setType] = useState<'all' | RequestType>('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState<'createdAt' | 'subject' | 'requester' | 'status' | 'type'>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const debounced = useDebounce(search, 300)
  const { rows, total, loading, fetching, error } = useAdminRequests({ search: debounced, status, type, page, pageSize, sortBy, sortDir })

  function fmt(ts: string) {
    const d = new Date(ts)
    return d.toLocaleString()
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Requests</h1>
        <p className="mt-1 text-neutral-300">Incoming onboarding & support requests from clients.</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-2 py-1 text-xs text-neutral-300">
            {(['all','open','in_progress','closed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setStatus(s); setPage(1) }}
                className={[
                  'px-2.5 py-1 rounded-xl capitalize',
                  status === s ? 'bg-neutral-800 text-white' : 'hover:bg-neutral-800/60',
                ].join(' ')}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-2 py-1 text-xs text-neutral-300">
            {(['all','onboarding','support'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setType(t); setPage(1) }}
                className={[
                  'px-2.5 py-1 rounded-xl capitalize',
                  type === t ? 'bg-neutral-800 text-white' : 'hover:bg-neutral-800/60',
                ].join(' ')}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="text-xs text-neutral-400">{total} total</div>
        </div>

        <div className="relative">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search subject or requester…"
            className="w-72 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm outline-none placeholder:text-neutral-500 focus:border-neutral-700"
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
              <th className="px-3 py-2 text-left">
                <button className="hover:text-white" onClick={() => { if (sortBy === 'createdAt') setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); setSortBy('createdAt'); setPage(1) }}>
                  Created {sortBy === 'createdAt' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </button>
              </th>
              <th className="px-3 py-2 text-left">
                <button className="hover:text-white" onClick={() => { if (sortBy === 'type') setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); setSortBy('type'); setPage(1) }}>
                  Type {sortBy === 'type' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </button>
              </th>
              <th className="px-3 py-2 text-left">
                <button className="hover:text-white" onClick={() => { if (sortBy === 'subject') setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); setSortBy('subject'); setPage(1) }}>
                  Subject {sortBy === 'subject' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </button>
              </th>
              <th className="px-3 py-2 text-left">
                <button className="hover:text-white" onClick={() => { if (sortBy === 'requester') setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); setSortBy('requester'); setPage(1) }}>
                  Requester {sortBy === 'requester' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </button>
              </th>
              <th className="px-3 py-2 text-left">
                <button className="hover:text-white" onClick={() => { if (sortBy === 'status') setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); setSortBy('status'); setPage(1) }}>
                  Status {sortBy === 'status' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </button>
              </th>
              <th className="px-3 py-2 text-right">
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
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`s-${i}`}>
                    <td className="px-3 py-3"><div className="h-4 w-40 rounded-md skeleton" /></td>
                    <td className="px-3 py-3"><div className="h-4 w-24 rounded-md skeleton" /></td>
                    <td className="px-3 py-3"><div className="h-4 w-80 rounded-md skeleton" /></td>
                    <td className="px-3 py-3"><div className="h-4 w-56 rounded-md skeleton" /></td>
                    <td className="px-3 py-3"><div className="h-4 w-20 rounded-md skeleton" /></td>
                    <td className="px-3 py-3 text-right"><div className="h-8 w-20 ml-auto rounded-md skeleton" /></td>
                  </tr>
                ))}
              </>
            )}
            {!loading && rows.map((r) => (
              <tr key={r.id} className="hover:bg-neutral-900/40 transition-colors">
                <td className="px-3 py-2">{fmt(r.createdAt)}</td>
                <td className="px-3 py-2 capitalize">{r.type}</td>
                <td className="px-3 py-2">
                  <Link to={`/admin/requests/${r.id}`} className="text-neutral-200 hover:underline">{r.subject}</Link>
                </td>
                <td className="px-3 py-2 text-neutral-300">{r.requester}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-3 py-2 text-right">
                  <Link to={`/admin/requests/${r.id}`} className="rounded-xl border border-neutral-800 px-3 py-1 hover:bg-neutral-800/50">Open</Link>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-neutral-400">
                  No requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-neutral-300">
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-neutral-800 px-2 py-1 disabled:opacity-50" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            Prev
          </button>
          <button className="rounded-lg border border-neutral-800 px-2 py-1 disabled:opacity-50" onClick={() => setPage((p) => p + 1)} disabled={rows.length < pageSize || (page * pageSize) >= total}>
            Next
          </button>
          <span className="ml-2 text-xs text-neutral-500">Page {page}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">Rows per page</span>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }} className="rounded-lg border border-neutral-800 bg-neutral-900/70 px-2 py-1 text-xs">
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

      {/* Legacy in-page modal removed in favor of dedicated route */}
    </div>
  )
}

function StatusBadge({ status }: { status: RequestStatus }) {
  if (status === 'open') return <span className="inline-flex items-center gap-2 rounded-md border border-amber-700/50 bg-amber-900/30 px-2 py-1 text-xs text-amber-300">Open</span>
  if (status === 'in_progress') return <span className="inline-flex items-center gap-2 rounded-md border border-sky-700/50 bg-sky-900/30 px-2 py-1 text-xs text-sky-300">In progress</span>
  return <span className="inline-flex items-center gap-2 rounded-md border border-emerald-700/50 bg-emerald-900/30 px-2 py-1 text-xs text-emerald-300">Closed</span>
}

// imports kept minimal; request actions handled in detail route

// (removed legacy in-page modal to use dedicated detail route)
