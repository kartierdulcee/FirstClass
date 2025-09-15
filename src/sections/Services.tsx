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
            Workflow automation
          </div>
          <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight" data-reveal>
            Your video creation process — now on autopilot
          </h2>
          <p className="mt-2 text-neutral-300" data-reveal>
            Create and publish videos 5× faster with our web app and API, so you can go on vacation and still keep your content rolling.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-4 md:grid-cols-3" data-reveal>
          {/* Auto import */}
          <ServiceCard
            title="Auto import"
            desc="Automatically pulls the latest videos from your YouTube or the cloud, so you never miss a moment to clip and share."
          >
            <MockPanel>
              <div className="rounded-2xl bg-neutral-800/70 h-28 grid place-items-center text-neutral-300 text-xs">
                New video
              </div>
              <div className="mt-3 flex items-center gap-2 text-[10px] text-neutral-400">
                <span className="px-2 py-1 rounded-lg bg-neutral-800/70">YouTube</span>
                <span className="px-2 py-1 rounded-lg bg-neutral-800/70">Drive</span>
                <span className="px-2 py-1 rounded-lg bg-neutral-800/70">S3</span>
                <span className="px-2 py-1 rounded-lg bg-neutral-800/70">Dropbox</span>
              </div>
            </MockPanel>
          </ServiceCard>

          {/* Auto editing */}
          <ServiceCard
            title="Auto editing"
            desc="AI clips, captions, reframes, adds B‑roll, and enhances audio — ready to post with no extra editing."
          >
            <MockPanel>
              <div className="rounded-xl bg-neutral-800/80 h-10 px-3 flex items-center text-neutral-400 text-xs">
                Analyze & clip…
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
              <Lines n={4} />
            </MockPanel>
          </ServiceCard>

          {/* Auto scheduling */}
          <ServiceCard
            title="Auto scheduling"
            desc="Automatically schedules your videos across platforms, so you stay consistent without lifting a finger."
          >
            <MockPanel>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-neutral-300">
                <Tile label="YouTube Shorts" />
                <Tile label="TikTok" />
                <Tile label="Instagram Reels" />
                <Tile label="LinkedIn" />
              </div>
              <div className="mt-3 rounded-xl bg-neutral-800/70 h-10 grid place-items-center text-xs text-neutral-300">
                9:00 AM • every day
              </div>
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
function Tile({ label }: { label: string }) {
  return (
    <div className="rounded-xl bg-neutral-800/70 h-16 grid place-items-center text-xs text-neutral-300">
      {label}
    </div>
  )
}
