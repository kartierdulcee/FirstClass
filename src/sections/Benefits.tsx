import { Check, TrendingDown, TrendingUp } from 'lucide-react'

export default function Benefits() {
  const items = [
    {
      icon: <TrendingDown size={18} />,
      title: 'Zero content ops overhead',
      desc: 'Send us raw footage, notes, or ideas — we plan, script, edit, design, publish, and follow-up so your team doesn’t have to.',
    },
    {
      icon: <Check size={18} />,
      title: 'Consistent, on-brand output',
      desc: 'Daily, multi-platform publishing with approvals and QA. Your voice, your strategy — reliably executed without the busywork.',
    },
    {
      icon: <TrendingUp size={18} />,
      title: 'Time back to grow',
      desc: 'Refocus on product and sales while we own the content engine and report on what’s working each week.',
    },
  ]

  return (
    <section id="benefits" className="section">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <div
          className="inline-flex items-center gap-2 rounded-full border border-neutral-800/70 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-300"
          data-reveal
        >
          Benefits
        </div>

        <h2
          className="mt-4 text-3xl md:text-5xl font-bold tracking-tight"
          data-reveal
        >
          We run content. You grow.
        </h2>
        <p className="mt-2 text-neutral-300" data-reveal>
          Done-for-you content operations for creators, brands, and agencies.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3" data-reveal>
          {items.map((b) => (
            <div
              key={b.title}
              className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 relative overflow-hidden text-left"
            >
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800/70 text-[hsl(var(--brand))]">
                {b.icon}
              </div>
              <h3 className="text-lg font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm text-neutral-300">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
