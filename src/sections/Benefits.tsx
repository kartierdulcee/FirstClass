import { Check, TrendingDown, TrendingUp } from 'lucide-react'

export default function Benefits() {
  const items = [
    {
      icon: <TrendingDown size={18} />,
      title: 'Cost reduction',
      desc: 'Optimize business processes and streamline operations to significantly minimize costs and maximize overall efficiency.',
    },
    {
      icon: <Check size={18} />,
      title: 'Improved outcomes',
      desc: 'Leverage powerful data-driven insights and innovative strategies to enhance business performance and achieve superior outcomes.',
    },
    {
      icon: <TrendingUp size={18} />,
      title: 'Increased productivity',
      desc: 'Enhance team output by automating redundant tasks, refining processes, and speeding up business functions.',
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
          Maximize efficiency and impact
        </h2>
        <p className="mt-2 text-neutral-300" data-reveal>
          Discover the key benefits of partnering with FirstClass.
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
