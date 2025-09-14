import React from 'react'

export default function Onboarding() {
  const formUrl = import.meta.env.VITE_ONBOARDING_FORM_URL as string | undefined

  if (!formUrl) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Get Content Done For You</h1>
        <p className="text-neutral-300">
          The onboarding form isn’t configured yet. Set <code className="font-mono">VITE_ONBOARDING_FORM_URL</code> in <code className="font-mono">.env.local</code> to a hosted form (Typeform, Tally, Fillout, etc.).
        </p>
        <p className="text-neutral-400 text-sm">
          Example: <code className="font-mono">VITE_ONBOARDING_FORM_URL=https://tally.so/r/your-form-id</code>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Get Content Done For You</h1>
        <a
          href={formUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl px-3 py-2 text-sm border border-neutral-700 hover:border-neutral-600 text-neutral-200"
        >
          Open in new tab
        </a>
      </div>

      <p className="text-neutral-300">
        Tell us about your brand and goals. This takes ~5 minutes. We’ll use this to set up your content engine.
      </p>

      <div className="rounded-xl overflow-hidden border border-neutral-800 bg-black/40">
        <iframe
          src={formUrl}
          title="Onboarding Form"
          className="w-full"
          style={{ height: '75vh' }}
          allow="payment *; microphone *; camera *; clipboard-write *;"
        />
      </div>

      <p className="text-xs text-neutral-500">
        Your info is kept private and only used to deliver your content.
      </p>
    </div>
  )
}

