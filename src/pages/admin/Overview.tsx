import { Link } from 'react-router-dom'
import {
  Users,
  Building2,
  FileClock,
  DollarSign,
  Activity,
  ShieldCheck,
  ServerCog,
  TrendingUp,
} from 'lucide-react'
import { useAdminOverview } from '../../api/admin'
import { useState } from 'react'
import { useReveal } from '../../hooks/useReveal'

export default function AdminOverview() {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d')
  const { data, error } = useAdminOverview(range)
  useReveal()
  const kpis = [
    {
      label: data?.kpis[0].label ?? 'Total Clients',
      value: data?.kpis[0].value ?? '—',
      icon: Users,
      accent: 'from-[#0c1220] to-[#0a0f18]',
      spark: [8, 9, 10, 9, 11, 12, 13],
    },
    {
      label: data?.kpis[1].label ?? 'Active Workspaces',
      value: data?.kpis[1].value ?? '—',
      icon: Building2,
      accent: 'from-[#0b101e] to-[#090e16]',
      spark: [5, 6, 7, 7, 8, 9, 9],
    },
    {
      label: data?.kpis[2].label ?? 'Pending Requests',
      value: data?.kpis[2].value ?? '—',
      icon: FileClock,
      accent: 'from-[#1b1710] to-[#130f0a]',
      spark: [3, 2, 4, 5, 3, 4, 2],
    },
    {
      label: data?.kpis[3].label ?? 'Est. MRR',
      value: data?.kpis[3].value ?? '—',
      icon: DollarSign,
      accent: 'from-[#0b141f] to-[#090d13]',
      spark: [60, 62, 61, 64, 66, 68, 70],
    },
  ]
  const weekly = data?.weekly ?? [8, 9, 7, 11, 12, 10, 14]
  const health = data?.health ?? [
    { name: 'API', status: 'healthy' as const },
    { name: 'Webhooks', status: 'degraded' as const },
  ]
  const topClients = data?.topClients ?? []
  const recent = data?.recent ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between" data-reveal>
        <div>
          <h1 className="text-2xl font-semibold">Admin Overview</h1>
          <p className="mt-1 text-neutral-300">Manage clients, staff access, and global automations.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="mr-2 rounded-xl border border-neutral-800 bg-neutral-900/70 text-xs text-neutral-300">
            {(['7d','30d','90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={[
                  'px-2.5 py-1 rounded-xl',
                  range === r ? 'bg-neutral-800 text-white' : 'hover:bg-neutral-800/60',
                ].join(' ')}
              >
                {r}
              </button>
            ))}
          </div>
          <Link
            to="/admin/clients"
            className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            View Clients
          </Link>
          <Link
            to="/admin/requests"
            className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            View Requests
          </Link>
          <Link
            to="/admin/settings"
            className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            Settings
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4" data-reveal>
        {kpis.map((k) => (
          <KPI key={k.label} {...k} />
        ))}
      </div>

      {/* Charts + Health */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" data-reveal>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-neutral-300" />
              <h3 className="text-sm font-semibold text-neutral-200">Weekly activity</h3>
            </div>
            <span className="text-xs text-neutral-500">Jobs processed</span>
          </div>
          <MiniBars className="mt-3" data={weekly} />
          <div className="mt-3 text-sm text-neutral-400">+18% vs previous week</div>
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" data-reveal>
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-neutral-300" />
            <h3 className="text-sm font-semibold text-neutral-200">System health</h3>
          </div>

          <ul className="mt-3 space-y-2 text-sm">
            {health.map((h) => (
              <li
                key={h.name}
                className="flex items-center justify-between rounded-lg border border-neutral-800/70 bg-neutral-950/60 px-3 py-2"
              >
                <span className="text-neutral-300">{h.name}</span>
                <Health status={h.status} />
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
            <ShieldCheck size={14} /> SLA 99.95%
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-5 lg:col-span-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" data-reveal>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-200">Top clients</h3>
            <Link to="/admin/clients" className="text-xs text-neutral-400 hover:text-neutral-200">
              Manage
            </Link>
          </div>

          <div className="mt-3 overflow-hidden rounded-xl border border-neutral-800/70">
            <table className="w-full text-sm">
              <thead className="bg-neutral-900/70 text-neutral-300">
                <tr>
                  <th className="px-3 py-2 text-left">Client</th>
                  <th className="px-3 py-2 text-left">Owner</th>
                  <th className="px-3 py-2 text-left">Posts</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/70">
                {topClients.map((c, i) => (
                  <tr key={i} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="px-3 py-2">{c.name}</td>
                    <td className="px-3 py-2 text-neutral-300">{c.owner}</td>
                    <td className="px-3 py-2">{c.posts}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-md px-2 py-1 text-xs ${
                          c.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-700/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-700/40'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" data-reveal>
          <div className="flex items-center gap-2">
            <ServerCog size={16} className="text-neutral-300" />
            <h3 className="text-sm font-semibold text-neutral-200">Recent activity</h3>
          </div>

          <ul className="mt-3 space-y-2 text-sm">
            {recent.map((r, i) => (
              <li key={i} className="rounded-lg border border-neutral-800/70 bg-neutral-950/60 p-3 hover:bg-neutral-900/60 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="text-neutral-200">{r.what}</div>
                  <div className="text-xs text-neutral-500">{r.when}</div>
                </div>
                <div className="text-xs text-neutral-400">{r.who}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {error && (
        <div className="rounded-lg border border-amber-700/50 bg-amber-900/20 px-3 py-2 text-xs text-amber-200">
          API error: {error}
        </div>
      )}
    </div>
  )
}

function KPI({
  label,
  value,
  icon: Icon,
  accent,
  spark,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  accent: string
  spark: number[]
}) {
  const to =
    label.toLowerCase().includes('request') ? '/admin/requests' :
    label.toLowerCase().includes('client') || label.toLowerCase().includes('workspace') ? '/admin/clients' :
    '/admin'

  return (
    <Link to={to} className="block group">
      <div
        className={[
          'rounded-2xl border border-neutral-800/80 bg-gradient-to-b',
          accent,
          'p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-shadow group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
        ].join(' ')}
        data-reveal
      >
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-400">{label}</div>
          <div className="rounded-lg border border-neutral-700/70 bg-neutral-900/70 p-2 text-neutral-300">
            <Icon size={16} />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold">{value}</div>
        <Sparkline className="mt-2" data={spark} />
      </div>
    </Link>
  )
}

function Health({ status }: { status: 'healthy' | 'degraded' | 'down' }) {
  if (status === 'healthy') {
    return (
      <span className="inline-flex items-center gap-2 rounded-md border border-emerald-700/50 bg-emerald-900/30 px-2 py-1 text-xs text-emerald-300">
        <span className="h-2 w-2 rounded-full bg-emerald-400" /> Healthy
      </span>
    )
  }
  if (status === 'degraded') {
    return (
      <span className="inline-flex items-center gap-2 rounded-md border border-amber-700/50 bg-amber-900/30 px-2 py-1 text-xs text-amber-300">
        <span className="h-2 w-2 rounded-full bg-amber-400" /> Degraded
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-rose-700/50 bg-rose-900/30 px-2 py-1 text-xs text-rose-300">
      <span className="h-2 w-2 rounded-full bg-rose-400" /> Down
    </span>
  )
}

function MiniBars({ data, className, height = 140 }: { data: number[]; className?: string; height?: number }) {
  const width = 520
  const pad = 24
  const max = Math.max(1, ...data)
  const barW = (width - pad * 2) / data.length - 8
  return (
    <svg className={[className, 'text-[hsl(var(--brand))]'].join(' ')} width="100%" viewBox={`0 0 ${width} ${height}`} height={height}>
      <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#2a2a2a" />
      <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#2a2a2a" />
      {data.map((v, i) => {
        const x = pad + i * (barW + 8)
        const h = ((height - pad * 2) * v) / max
        const y = height - pad - h
        return <rect key={i} x={x} y={y} width={barW} height={h} fill="currentColor" rx={3} />
      })}
    </svg>
  )
}

function Sparkline({ data, className, height = 36 }: { data: number[]; className?: string; height?: number }) {
  const width = 160
  const pad = 6
  const max = Math.max(1, ...data)
  const stepX = (width - pad * 2) / Math.max(1, data.length - 1)
  const points = data.map((v, i) => [pad + i * stepX, pad + (height - pad * 2) * (1 - v / max)])
  const path = points.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(' ')
  return (
    <svg className={[className, 'text-[hsl(var(--brand))]'].join(' ')} width="100%" viewBox={`0 0 ${width} ${height}`} height={height}>
      <path
        d={`${path} L ${width - pad} ${height - pad} L ${pad} ${height - pad} Z`}
        fill="url(#sgrad)"
        opacity="0.35"
      />
      <path d={path} stroke="currentColor" strokeWidth="2" fill="none" />
      <defs>
        <linearGradient id="sgrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
