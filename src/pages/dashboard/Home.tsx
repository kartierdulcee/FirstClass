// src/pages/dashboard/Home.tsx
import { CalendarDays, MessageSquare, ListChecks, PlugZap, RefreshCw, AlertTriangle } from 'lucide-react'

export default function DashboardHome() {
  // ----- Fake data (wire this up to real APIs later) -----
  const kpis = [
    { label: 'Queue', value: '48 posts', icon: ListChecks, accent: 'from-[#1b1f2a] to-[#111318]' },
    { label: 'DM Follow-ups', value: '312 pending', icon: MessageSquare, accent: 'from-[#1a2130] to-[#10141b]' },
    { label: 'Appointments', value: '21 this week', icon: CalendarDays, accent: 'from-[#1b1d24] to-[#101115]' },
  ]

  const perfSeries = [
    { d: 'Mon', v: 8 },
    { d: 'Tue', v: 11 },
    { d: 'Wed', v: 9 },
    { d: 'Thu', v: 14 },
    { d: 'Fri', v: 13 },
    { d: 'Sat', v: 7 },
    { d: 'Sun', v: 10 },
  ]

  const channels = [
    { name: 'Instagram', status: 'connected' as const },
    { name: 'Twitter/X', status: 'connected' as const },
    { name: 'YouTube', status: 'needs_reauth' as const },
    { name: 'Calendars', status: 'disconnected' as const },
  ]

  const activity = [
    { ts: '2h ago', text: 'Published 3 posts to Instagram queue.' },
    { ts: '5h ago', text: 'Sent 47 automated DM replies.' },
    { ts: 'Yesterday', text: 'Scheduled 6 posts for LinkedIn.' },
    { ts: 'Yesterday', text: 'Booked 2 consults via DM flow.' },
  ]

  const upcoming = [
    { when: 'Today • 3:30 PM', what: 'Instagram Reel: “Behind the scenes”' },
    { when: 'Tomorrow • 10:00 AM', what: 'YouTube Short: “Automation tip #3”' },
    { when: 'Fri • 9:00 AM', what: 'LinkedIn Carousel: Case study results' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Your cross-channel automations, at a glance.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((k) => (
          <KPI key={k.label} {...k} />
        ))}
      </div>

      {/* Middle row: Performance + Channel status */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border border-neutral-800/80 bg-neutral-900/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-200">Performance (last 7 days)</h3>
            <span className="text-xs text-neutral-500">Posts published</span>
          </div>
          <MiniLineChart className="mt-3" data={perfSeries} />
          <div className="mt-3 text-sm text-neutral-400">
            Trend up <span className="text-white font-medium">+12%</span> vs prior 7 days.
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-200">Channel health</h3>
            <button className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-950/70 px-2.5 py-1.5 text-xs text-neutral-300 hover:bg-neutral-900">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          <ul className="mt-3 space-y-2 text-sm">
            {channels.map((c) => (
              <li
                key={c.name}
                className="flex items-center justify-between rounded-lg border border-neutral-800/70 bg-neutral-950/60 px-3 py-2"
              >
                <span className="text-neutral-300">{c.name}</span>
                <ChannelBadge status={c.status} />
              </li>
            ))}
          </ul>

          <button className="mt-3 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm hover:bg-neutral-800">
            Manage connections
          </button>
        </div>
      </div>

      {/* Bottom row: Activity + Upcoming + CTA */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border border-neutral-800/80 bg-neutral-900/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <h3 className="text-sm font-semibold text-neutral-200">Recent activity</h3>
          <ul className="mt-3 space-y-3">
            {activity.map((a, i) => (
              <li
                key={i}
                className="rounded-lg border border-neutral-800/70 bg-neutral-950/60 p-3 text-sm text-neutral-300"
              >
                <span className="mr-2 text-neutral-500">{a.ts}</span>
                {a.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <h3 className="text-sm font-semibold text-neutral-200">Upcoming</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {upcoming.map((u, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-neutral-800/70 bg-neutral-950/60 p-3"
                >
                  <div className="font-medium text-neutral-200">{u.what}</div>
                  <div className="text-xs text-neutral-500">{u.when}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-neutral-800/80 bg-gradient-to-b from-[#0b1220] to-[#0a0d14] p-5">
            <div className="flex items-start gap-3">
              <PlugZap className="mt-0.5 text-[hsl(var(--brand),_#0374FF)]" size={18} />
              <div>
                <h4 className="text-sm font-semibold text-neutral-100">
                  Boost output with more channels
                </h4>
                <p className="mt-1 text-sm text-neutral-400">
                  Connect another platform to repurpose content automatically and widen reach.
                </p>
                <button className="mt-3 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs hover:bg-neutral-800">
                  Connect a channel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Components ---------- */

function KPI({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  accent: string
}) {
  return (
    <div
      className={[
        'rounded-2xl border border-neutral-800/80 bg-gradient-to-b',
        accent,
        'p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]',
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-400">{label}</div>
        <div className="rounded-lg border border-neutral-700/70 bg-neutral-900/70 p-2 text-neutral-300">
          <Icon size={16} />
        </div>
      </div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  )
}

function ChannelBadge({ status }: { status: 'connected' | 'needs_reauth' | 'disconnected' }) {
  if (status === 'connected') {
    return (
      <span className="inline-flex items-center gap-2 rounded-md border border-emerald-700/50 bg-emerald-900/30 px-2 py-1 text-xs text-emerald-300">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        Connected
      </span>
    )
  }
  if (status === 'needs_reauth') {
    return (
      <span className="inline-flex items-center gap-2 rounded-md border border-amber-700/50 bg-amber-900/30 px-2 py-1 text-xs text-amber-300">
        <AlertTriangle size={12} />
        Re-auth needed
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-neutral-700/70 bg-neutral-900 px-2 py-1 text-xs text-neutral-400">
      Disconnected
    </span>
  )
}

function MiniLineChart({
  data,
  className,
  height = 140,
}: {
  data: { d: string; v: number }[]
  className?: string
  height?: number
}) {
  // Simple SVG line path
  const width = 520
  const pad = 24
  const max = Math.max(...data.map((d) => d.v)) || 1
  const stepX = (width - pad * 2) / Math.max(1, data.length - 1)
  const points = data.map((p, i) => {
    const x = pad + i * stepX
    const y = pad + (height - pad * 2) * (1 - p.v / max)
    return [x, y]
  })

  const path = points
    .map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`))
    .join(' ')

  return (
    <svg className={className} width="100%" viewBox={`0 0 ${width} ${height}`} height={height}>
      {/* grid */}
      <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#2a2a2a" />
      <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#2a2a2a" />

      {/* area fill */}
      <path
        d={`${path} L ${width - pad} ${height - pad} L ${pad} ${height - pad} Z`}
        fill="url(#grad)"
        opacity="0.3"
      />
      {/* line */}
      <path d={path} stroke="#4aa3ff" strokeWidth="2.5" fill="none" />

      {/* dots */}
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#4aa3ff" />
      ))}

      {/* defs */}
      <defs>
        <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#4aa3ff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4aa3ff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
