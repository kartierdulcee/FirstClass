/* Testimonials — cinematic cards with soft gradients */
export default function Testimonials() {
  const items: Testimonial[] = [
    {
      quote:
        'FirstClass turned our content engine into a machine — 5x more posts with higher quality. Unreal.',
      name: 'Ava Martinez',
      title: 'Founder · GlowHaus MedSpa',
      avatar: 'https://i.pravatar.cc/48?img=25',
    },
    {
      quote:
        'We automated repurposing across TikTok, Reels, Shorts, and LinkedIn. Engagement up 62% in 30 days.',
      name: 'Jordan Lee',
      title: 'Creative Director · Nova Studios',
      avatar: 'https://i.pravatar.cc/48?img=12',
    },
    {
      quote:
        'DM follow-ups booked us 41 extra consults last month. FirstClass is our quiet unfair advantage.',
      name: 'Maya Patel',
      title: 'COO · Radiant Aesthetics',
      avatar: 'https://i.pravatar.cc/48?img=3',
    },
    {
      quote:
        'Content ops went from chaos to calm. Workflows, queues, approvals — finally in one place.',
      name: 'Zach Nguyen',
      title: 'Head of Content · Apex Wear',
      avatar: 'https://i.pravatar.cc/48?img=33',
    },
    {
      quote:
        'Our team posts daily without burnout. The AI briefs and auto-edits are scary good.',
      name: 'Elena Rossi',
      title: 'Agency Partner · Rossi & Co.',
      avatar: 'https://i.pravatar.cc/48?img=45',
    },
    {
      quote:
        'From zero to a consistent multi-platform presence. Revenue followed.',
      name: 'Chris Johnson',
      title: 'Founder · Northbound Fitness',
      avatar: 'https://i.pravatar.cc/48?img=7',
    },
  ]

  return (
    <section id="testimonials" className="section">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-neutral-800/70 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-300"
            data-reveal
          >
            Testimonials
          </div>
          <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight" data-reveal>
            Trusted by teams who outsourced content ops
          </h2>
          <p className="mt-2 text-neutral-300" data-reveal>
            See how done-for-you content unlocked consistency, engagement, and growth.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3" data-reveal>
          {items.map((t) => (
            <Card key={t.name} {...t} />
          ))}
        </div>
      </div>
    </section>
  )
}

type Testimonial = {
  quote: string
  name: string
  title: string
  avatar: string
}

function Card({ quote, name, title, avatar }: Testimonial) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-5 relative overflow-hidden">
      {/* soft diagonal gradient */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(80%_60%_at_100%_0%,rgba(3,116,255,.15),transparent_60%)]" />
      <p className="relative text-neutral-200">
        “{quote}”
      </p>
      <div className="relative mt-5 flex items-center gap-3">
        <img src={avatar} alt={name} className="h-10 w-10 rounded-xl object-cover" />
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-sm text-neutral-400">{title}</div>
        </div>
      </div>
    </div>
  )
}
