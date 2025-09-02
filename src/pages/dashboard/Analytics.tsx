// src/pages/dashboard/Analytics.tsx
import React from 'react'

export default function AnalyticsPage() {
  // ----- Demo data (wire to real APIs later) -----
  const kpis = [
    { label: 'Total reach (30d)', value: '182k' },
    { label: 'Engagement rate', value: '4.7%' },
    { label: 'Click-through rate', value: '2.1%' },
    { label: 'Bookings from content', value: '86' },
  ]

  const series = [
    1200, 1400, 1600, 1300, 1800, 2000, 2100, 2200, 1900, 2400,
    2500, 2300, 2600, 2700, 2500, 2800, 3000, 3200, 3100, 3300,
    3400, 3600, 3500, 3700, 3800, 3600, 3900, 4000, 4200, 4100,
  ]

  const channels: Array<{ name: string; posts: number; reach: number; eng?: number }> = [
    { name: 'Instagram', posts: 42, reach: 92000, eng: 5.2 },
    { name: 'Twitter/X', posts: 58, reach: 41000, eng: 3.4 },
    { name: 'YouTube', posts: 12, reach: 36000, eng: 6.8 },
    { name: 'LinkedIn', posts: 18, reach: 13000, eng: 2.9 },
  ]

  // Heatmap: rows = days, cols = hours (8, 10, 12, 14, 16, 18, 20)
  const heatmapHours = [8, 10, 12, 14, 16, 18, 20]
  const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const heatData = heatmapDays.map(() =>
    heatmapHours.map(() => Math.floor(Math.random() * 100))
  )

  const topPosts: Array<{ id: string; title: string; channel: string; reach?: number; eng?: number }> = [
    { id: 'p1', title: 'How we batch 30 days of content', channel: 'YouTube', reach: 18400, eng: 6.3 },
    { id: 'p2', title: 'Before/after carousel (case study)', channel: 'Instagram', reach: 17300, eng: 7.1 },
    { id: 'p3', title: 'Cold DM opener that converts', channel: 'Twitter/X', reach: 15100, eng: 4.2 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Analytics</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Performance across channels — last 30 days snapshot.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 md:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border border-neutral-800/80 bg-neutral-900/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
          >
            <div className="text-sm text-neutral-400">{k.label}</div>
            <div className="mt-1 text-3xl font-bold">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Line chart + Channel table */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-neutral-800/80 bg-neutral-900/70 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-200">Reach (last 30 days)</h3>
            <div className="text-xs text-neutral-500">Daily totals</div>
          </div>
          <LineChart className="mt-4" data={series} height={160} />
          <div className="mt-3 text-sm text-neutral-400">
            Trend up <span className="text-white font-medium">+15%</span> vs prior period.
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/70 p-5">
          <h3 className="text-sm font-semibold text-neutral-200">Channel breakdown</h3>
          <table className="mt-3 w-full text-sm">
            <thead className="text-neutral-500">
              <tr className="text-left">
                <th className="py-2 font-medium">Channel</th>
                <th className="py-2 font-medium">Posts</th>
                <th className="py-2 font-medium">Reach</th>
                <th className="py-2 font-medium">Eng%</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((c) => (
                <tr key={c.name} className="border-t border-neutral-800/60">
                  <td className="py-2">{c.name}</td>
                  <td className="py-2 text-neutral-300">{safeNumber(c.posts)}</td>
                  <td className="py-2 text-neutral-300">{formatNumber(safeNumber(c.reach))}</td>
                  <td className="py-2 text-neutral-300">{safeFixed(c.eng, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 text-xs text-neutral-500">
            Engagement is avg reactions/comments divided by reach.
          </div>
        </div>
      </div>

      {/* Heatmap + Top posts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/70 p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-200">Best posting times</h3>
            <div className="text-xs text-neutral-500">Local timezone</div>
          </div>
          <Heatmap
            className="mt-4"
            days={heatmapDays}
            hours={heatmapHours}
            values={heatData}
          />
          <div className="mt-3 text-xs text-neutral-500">
            Darker = higher average engagement at that time.
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/70 p-5">
          <h3 className="text-sm font-semibold text-neutral-200">Top posts</h3>
          <ul className="mt-3 space-y-3 text-sm">
            {topPosts.map((p) => (
              <li key={p.id} className="rounded-lg border border-neutral-800/60 bg-neutral-950/60 p-3">
                <div className="font-medium text-neutral-100">{p.title}</div>
                <div className="mt-0.5 text-xs text-neutral-500">
                  {p.channel} • Reach {formatNumber(safeNumber(p.reach))} • Eng {safeFixed(p.eng, 1)}%
                </div>
              </li>
            ))}
          </ul>
          <button className="mt-4 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm hover:bg-neutral-800">
            View all posts
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Components ---------------- */

function LineChart({
  data,
  className,
  height = 160,
}: {
  data: number[]
  className?: string
  height?: number
}) {
  const width = 560
  const pad = 24
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = Math.max(max - min, 1)
  const stepX = (width - pad * 2) / Math.max(1, data.length - 1)

  const points = data.map((v, i) => {
    const x = pad + i * stepX
    const y = pad + (height - pad * 2) * (1 - (v - min) / range)
    return [x, y] as const
  })

  const path = points.map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`)).join(' ')

  return (
    <svg className={className} width="100%" viewBox={`0 0 ${width} ${height}`} height={height}>
      {/* axes */}
      <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#2a2a2a" />
      <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#2a2a2a" />

      {/* area */}
      <path
        d={`${path} L ${width - pad} ${height - pad} L ${pad} ${height - pad} Z`}
        fill="url(#lineGrad)"
        opacity="0.3"
      />
      {/* line */}
      <path d={path} stroke="#4aa3ff" strokeWidth="2.5" fill="none" />
      {/* dots */}
      {points.map(([x, y], idx) => (
        <circle key={idx} cx={x} cy={y} r="3" fill="#4aa3ff" />
      ))}

      <defs>
        <linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#4aa3ff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4aa3ff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function Heatmap({
  days,
  hours,
  values,
  className,
}: {
  days: string[]
  hours: number[]
  values: number[][]
  className?: string
}) {
  const max = Math.max(...values.flat(), 1)

  return (
    <div className={className}>
      <div className="grid grid-cols-[80px_1fr] gap-2">
        {/* Row labels */}
        <div />
        <div className="grid grid-cols-7 text-xs text-neutral-500">
          {hours.map((h) => (
            <div key={h} className="text-center">{h}:00</div>
          ))}
        </div>

        {values.map((row, ri) => (
          <React.Fragment key={days[ri]}>
            <div className="text-xs text-neutral-500 h-8 flex items-center">{days[ri]}</div>
            <div className="grid grid-cols-7 gap-2">
              {row.map((v, ci) => {
                const intensity = v / max // 0..1
                const bg = `rgba(74,163,255,${0.12 + intensity * 0.68})`
                const border = `rgba(74,163,255,${0.18 + intensity * 0.5})`
                return (
                  <div
                    key={`${ri}-${ci}`}
                    title={`${days[ri]} ${hours[ci]}:00 — score ${v}`}
                    className="h-8 rounded-md"
                    style={{ background: bg, border: `1px solid ${border}` }}
                  />
                )
              })}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

/* ---------------- Utils ---------------- */

function safeFixed(n: number | undefined, digits = 1) {
  return Number.isFinite(n as number) ? (n as number).toFixed(digits) : '0.0'
}

function safeNumber(n: number | undefined) {
  return Number.isFinite(n as number) ? (n as number) : 0
}

function formatNumber(n: number) {
  return new Intl.NumberFormat().format(n)
}
