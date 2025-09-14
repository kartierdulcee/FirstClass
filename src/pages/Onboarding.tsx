
export default function Onboarding() {
  const externalFormUrl = import.meta.env.VITE_ONBOARDING_FORM_URL as string | undefined

  // Simple multi-step form state
  const [step, setStep] = React.useState(0)
  const [submitting, setSubmitting] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [data, setData] = React.useState({
    // Step 1: Contact & brand
    name: '',
    email: '',
    brand: '',
    website: '',
    instagram: '',
    twitter: '',
    youtube: '',
    // Step 2: Strategy
    goals: '',
    pillars: '',
    // Step 3: Ops
    channels: [] as string[],
    cadence: '',
    approvalFlow: '',
    // Step 4: Assets
    assetsUrl: '',
    notes: '',
  })

  const channels = ['YouTube', 'Instagram', 'X/Twitter', 'LinkedIn', 'TikTok', 'Blog', 'Newsletter']

  function next() {
    setError(null)
    // Minimal validation per step
    if (step === 0) {
      if (!data.name || !data.email || !data.brand) {
        setError('Please fill your name, email, and brand.')
        return
      }
    }
    if (step === 1) {
      if (!data.goals) {
        setError('Please describe your goals.')
        return
      }
    }
    if (step === 2) {
      if (!data.cadence) {
        setError('Please note your desired cadence.')
        return
      }
    }
    setStep((s) => s + 1)
  }
  function back() {
    setError(null)
    setStep((s) => Math.max(0, s - 1))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `Submit failed (${res.status})`)
      }
      setSubmitted(true)
    } catch (err: any) {
      setError(err?.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Thanks — you’re in.</h1>
        <p className="text-neutral-300">We’ve recorded your onboarding details. We’ll reach out shortly.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Get Content Done For You</h1>
        {externalFormUrl && (
          <a
            href={externalFormUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl px-3 py-2 text-sm border border-neutral-700 hover:border-neutral-600 text-neutral-200"
          >
            Prefer external form?
          </a>
        )}
      </div>

      <p className="text-neutral-300">
        Tell us about your brand and goals. This takes ~5 minutes. We’ll use this to set up your content engine.
      </p>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Step indicators */}
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          {['Contact', 'Strategy', 'Ops', 'Assets'].map((label, i) => (
            <div key={label} className={`px-2 py-1 rounded ${step === i ? 'bg-neutral-800 text-neutral-100' : 'bg-neutral-900'}`}>{label}</div>
          ))}
        </div>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        {step === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Your Name" value={data.name} onChange={(v) => setData({ ...data, name: v })} required />
            <Input label="Email" type="email" value={data.email} onChange={(v) => setData({ ...data, email: v })} required />
            <Input label="Brand/Company" value={data.brand} onChange={(v) => setData({ ...data, brand: v })} required />
            <Input label="Website" value={data.website} onChange={(v) => setData({ ...data, website: v })} placeholder="https://" />
            <Input label="Instagram" value={data.instagram} onChange={(v) => setData({ ...data, instagram: v })} placeholder="@handle or URL" />
            <Input label="Twitter/X" value={data.twitter} onChange={(v) => setData({ ...data, twitter: v })} placeholder="@handle or URL" />
            <Input label="YouTube" value={data.youtube} onChange={(v) => setData({ ...data, youtube: v })} placeholder="Channel URL" />
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 gap-4">
            <Textarea label="Goals" value={data.goals} onChange={(v) => setData({ ...data, goals: v })} placeholder="What outcomes are you aiming for in the next 30–60 days?" required />
            <Textarea label="Content Pillars / Voice" value={data.pillars} onChange={(v) => setData({ ...data, pillars: v })} placeholder="Pillars, do/don’t, examples you like" />
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm mb-1 text-neutral-300">Channels</label>
              <div className="flex flex-wrap gap-2">
                {channels.map((c) => (
                  <label key={c} className={`px-3 py-1 rounded-full border cursor-pointer text-sm ${data.channels.includes(c) ? 'bg-[hsl(var(--brand))]/20 border-[hsl(var(--brand))]' : 'border-neutral-700 hover:border-neutral-600'}`}>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={data.channels.includes(c)}
                      onChange={(e) => {
                        const checked = e.target.checked
                        setData((d) => ({ ...d, channels: checked ? [...d.channels, c] : d.channels.filter((x) => x !== c) }))
                      }}
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>
            <Input label="Cadence" value={data.cadence} onChange={(v) => setData({ ...data, cadence: v })} placeholder="e.g., 3 IG Reels + 1 YT/wk" required />
            <Textarea label="Approval Workflow" value={data.approvalFlow} onChange={(v) => setData({ ...data, approvalFlow: v })} placeholder="Who approves posts? Any constraints or legal checks?" />
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 gap-4">
            <Input label="Brand Assets Link" value={data.assetsUrl} onChange={(v) => setData({ ...data, assetsUrl: v })} placeholder="Google Drive/Dropbox/Notion" />
            <Textarea label="Anything else?" value={data.notes} onChange={(v) => setData({ ...data, notes: v })} />
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-neutral-500">Step {step + 1} of 4</div>
          <div className="flex gap-2">
            {step > 0 && (
              <button type="button" onClick={back} className="px-4 py-2 rounded-lg border border-neutral-700 hover:border-neutral-600">
                Back
              </button>
            )}
            {step < 3 ? (
              <button type="button" onClick={next} className="px-4 py-2 rounded-lg bg-[hsl(var(--brand))] text-white disabled:opacity-60" disabled={submitting}>
                Next
              </button>
            ) : (
              <button type="submit" className="px-4 py-2 rounded-lg bg-[hsl(var(--brand))] text-white disabled:opacity-60" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
            )}
          </div>
        </div>
      </form>

      <p className="text-xs text-neutral-500">Your info is kept private and only used to deliver your content.</p>
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', placeholder, required }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="block text-sm mb-1 text-neutral-300">{label}{required ? ' *' : ''}</span>
      <input
        className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 outline-none focus:border-neutral-600"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        required={required}
      />
    </label>
  )
}

function Textarea({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="block text-sm mb-1 text-neutral-300">{label}{required ? ' *' : ''}</span>
      <textarea
        className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 outline-none focus:border-neutral-600 min-h-[100px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </label>
  )
}
