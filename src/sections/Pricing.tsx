import { Link } from 'react-router-dom'

type Tier = {
  name: string
  price: string
  blurb: string
  features: string[]
  cta: string
  highlight?: boolean
}

const tiers: Tier[] = [
  {
    name: 'Self-Serve',
    price: '$29/mo',
    blurb: 'DIY with our tools. Great if you want to keep production in-house.',
    features: [
      '1 brand/workspace',
      'Repurpose to 3 platforms',
      'Basic templates & queues',
      'Email support',
    ],
    cta: 'Start self-serve',
  },
  {
    name: 'Managed',
    price: 'From $2,000/mo',
    blurb: 'Done-for-you content operations. You send raw content — we handle everything else.',
    features: [
      'Strategy, scripting, editing, design',
      'Publishing across 6+ platforms',
      'DM/email follow-ups & comment triage',
      'Weekly reports & A/B testing',
      'Priority Slack support',
    ],
    cta: 'Get managed',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    blurb: 'For agencies & franchises at scale — custom workflows, security, and support.',
    features: [
      'Unlimited workspaces',
      'SLA, SSO, audit logs',
      'Custom workflows & webhooks',
      'Dedicated success manager',
    ],
    cta: 'Book a call',
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="section">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight" data-reveal>
          Pricing that grows with you
        </h2>
        <p className="mt-3 text-neutral-300 max-w-2xl mx-auto" data-reveal>
          Simple plans for creators, agencies, and brands. Cancel anytime.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3" data-reveal>
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`rounded-3xl border p-6 text-left ${
                t.highlight
                  ? 'border-[hsl(var(--brand))]/50 bg-neutral-900/50 shadow-[0_0_45px_rgba(3,116,255,.15)]'
                  : 'border-neutral-800 bg-neutral-900/40'
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-semibold">{t.name}</h3>
                <div className="text-lg font-bold">{t.price}</div>
              </div>
              <p className="mt-2 text-neutral-300">{t.blurb}</p>
              <ul className="mt-5 space-y-2 text-sm text-neutral-300">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand))]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={t.name === 'Enterprise' ? '/contact' : '/signup'}
                className={`mt-6 inline-block rounded-2xl px-4 py-2 font-semibold border ${
                  t.highlight
                    ? 'bg-gradient-to-r from-[#0374FF] to-[#0a5ce0] text-white border-neutral-800'
                    : 'text-white border-neutral-800 hover:bg-neutral-800/50'
                }`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-neutral-400" data-reveal>
          Need help choosing? <a href="#contact" className="underline">Chat with us</a>.
        </p>
      </div>
    </section>
  )
}
