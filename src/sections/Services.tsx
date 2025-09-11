/* Services grid with cinematic cards */
export default function Services() {
  return (
    <section id="services" className="section">
      <div className="mx-auto max-w-6xl px-4">
        {/* Section header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-neutral-800/70 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-300"
            data-reveal
          >
            Done-for-you services
          </div>
          <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight" data-reveal>
            Done-for-You Content Operations
          </h2>
          <p className="mt-2 text-neutral-300" data-reveal>
            Send raw footage, voice notes, or bullet points. We plan, script, edit, design, publish, and follow-up across channels.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-4 md:grid-cols-3" data-reveal>
          <ServiceCard
            title="Strategy & Planning"
            desc="Monthly content plans, hooks, briefs, and shot lists aligned to your goals and brand voice."
          >
            <MockPanel>
              <Bar w="70%" />
              <Bar w="52%" />
              <Bar w="62%" />
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 rounded-xl bg-neutral-800/80 h-8 flex items-center px-3 text-neutral-400 text-xs">
                  Ask me something…
                </div>
                <div className="h-8 w-8 rounded-xl bg-[hsl(var(--brand))]/80" />
              </div>
            </MockPanel>
          </ServiceCard>

          <ServiceCard
            title="Editing & Repurposing"
            desc="Turn long-form into shorts, carousels, threads, blogs, and emails — with tight captions and CTAs."
          >
            <MockPanel>
              <div className="rounded-xl bg-neutral-800/80 h-10 px-3 flex items-center text-neutral-400 text-xs">
                Generate content…
              </div>
              <div className="mt-3 rounded-xl bg-[hsl(var(--brand))]/20 h-9 w-32 grid place-items-center text-xs text-neutral-300">
                Generate
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                <Mini />
                <Mini />
                <Mini />
                <Mini />
              </div>
              <Lines n={5} />
            </MockPanel>
          </ServiceCard>

          <ServiceCard
            title="Publishing & Follow-ups"
            desc="Schedule across platforms, handle DM/email follow-ups, and triage comments to drive conversations."
          >
            <MockPanel>
              <Profile name="Jack Daniel" role="Founder" />
              <Profile name="Justin Rocks" role="Marketing head" secondary />
              <div className="grid grid-cols-2 gap-2 mt-3 text-[10px] text-neutral-400">
                <Field label="E-mail" />
                <Field label="Phone" />
                <Field label="Company" />
                <Field label="Verified" />
              </div>
              <div className="mt-4 rounded-xl bg-[hsl(var(--brand))]/25 h-9 grid place-items-center text-neutral-200 text-xs">
                Generate Leads
              </div>
            </MockPanel>
          </ServiceCard>

          <ServiceCard
            title="Analytics & Iteration"
            desc="Weekly reporting, A/B tests, and continuous improvements based on what resonates with your audience."
          >
            <MockPanel>
              <Pills labels={['Work Efficiency', 'Cost Reduction', 'Automated Tasks', 'Lead Nurturing']} />
              <Chart />
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-neutral-300">
                <KPI label="Overall" value="48.9%" />
                <div className="rounded-xl bg-neutral-800/70 h-9 grid place-items-center">Export</div>
              </div>
            </MockPanel>
          </ServiceCard>

          <ServiceCard
            title="Design & Thumbnails"
            desc="On-brand creatives, thumbnails, and graphics that lift click-through and retention."
          >
            <MockPanel>
              <PillRow labels={['On Call…', 'Mic On', 'Video Off', 'Caption On', 'Present']} />
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Tile label="AI Developer" />
                <Tile label="Sales expert" />
                <Tile label="You" />
              </div>
              <div className="mt-3 rounded-xl bg-neutral-800/70 h-16" />
            </MockPanel>
          </ServiceCard>

          <ServiceCard
            title="Creator Ops & Calendar"
            desc="Recording guides, approvals, and a predictable calendar so content happens without chaos."
          >
            <MockPanel>
              <div className="grid grid-cols-3 gap-2">
                <Mini long />
                <Mini />
                <Mini />
              </div>
              <Lines n={6} />
            </MockPanel>
          </ServiceCard>
        </div>
      </div>
    </section>
  )
}

/* ----- helpers ----- */

function ServiceCard({
  title,
  desc,
  children,
}: {
  title: string
  desc: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-4 md:p-5">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">{children}</div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-neutral-300">{desc}</p>
    </div>
  )
}

function MockPanel({ children }: { children: React.ReactNode }) {
  return <div className="text-left">{children}</div>
}
function Bar({ w = '60%' }: { w?: string }) {
  return <div className="h-2 rounded bg-neutral-800/80 my-2" style={{ width: w }} />
}
function Mini({ long }: { long?: boolean }) {
  return (
    <div className={`rounded-xl bg-neutral-800/70 h-10 ${long ? 'col-span-2' : ''}`} />
  )
}
function Lines({ n = 4 }: { n?: number }) {
  return (
    <div className="mt-3 space-y-2">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="h-2 rounded bg-neutral-800/70 w-[90%]" />
      ))}
    </div>
  )
}
function Profile({ name, role, secondary }: { name: string; role: string; secondary?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-xl ${secondary ? 'bg-neutral-900/50' : 'bg-neutral-900/70'} p-3 mt-2`}>
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-neutral-800" />
        <div className="text-xs">
          <div className="text-neutral-200">{name}</div>
          <div className="text-neutral-400">{role}</div>
        </div>
      </div>
      <div className="h-5 w-5 rounded-full bg-neutral-800" />
    </div>
  )
}
function Field({ label }: { label: string }) {
  return (
    <div className="rounded-xl bg-neutral-800/70 h-9 grid place-items-start px-3">{label}</div>
  )
}
function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-neutral-800/70 h-16 p-3">
      <div className="text-[10px] text-neutral-400">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  )
}
function Pills({ labels }: { labels: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((l) => (
        <span key={l} className="px-3 py-1 rounded-xl text-[10px] bg-neutral-800/70 text-neutral-300">
          {l}
        </span>
      ))}
    </div>
  )
}
function PillRow({ labels }: { labels: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((l) => (
        <span key={l} className="px-2.5 py-1 rounded-xl text-[10px] bg-neutral-800/70 text-neutral-300">
          {l}
        </span>
      ))}
    </div>
  )
}
function Tile({ label }: { label: string }) {
  return (
    <div className="rounded-xl bg-neutral-800/70 h-16 grid place-items-center text-xs text-neutral-300">
      {label}
    </div>
  )
}

/* ✅ NEW: simple mocked chart so no external lib needed */
function Chart() {
  const bars = [10, 22, 16, 30, 24, 36, 18, 28, 20, 34, 26, 40] // heights in px
  return (
    <div className="mt-3 rounded-xl bg-neutral-800/70 h-28 p-3">
      <div className="h-full flex items-end gap-1">
        {bars.map((h, i) => (
          <div
            key={i}
            className="w-2 rounded-t bg-[hsl(var(--brand))]/45"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
    </div>
  )
}
