import { useEffect, useState } from 'react'
import { useAdminSettings } from '../../api/settings'
import { useToast } from '../../components/toast'

export default function AdminSettings() {
  const { data, loading, saving, error, save } = useAdminSettings()
  const { show } = useToast()
  const [supportEmail, setSupportEmail] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [allowSelfSignup, setAllowSelfSignup] = useState(true)

  useEffect(() => {
    if (!data) return
    setSupportEmail(data.supportEmail)
    setWebhookUrl(data.webhookUrl)
    setAllowSelfSignup(data.allowSelfSignup)
  }, [data])

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    if (!data) return
    const next = { supportEmail, webhookUrl, brandHue: data.brandHue, allowSelfSignup }
    const ok = await save(next)
    if (ok) show({ title: 'Settings saved', variant: 'success' })
    else show({ title: 'Save failed', description: error ?? 'Unknown error', variant: 'error' })
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Admin Settings</h1>
      <p className="mt-2 text-neutral-300">Brand, webhooks, access control, and more.</p>

      <form onSubmit={onSave} className="mt-6 grid gap-5 max-w-2xl">

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
          <h2 className="text-sm font-semibold text-neutral-200">Contact</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="grid gap-1">
              <span className="text-sm text-neutral-300">Support email</span>
              <input
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 outline-none"
                placeholder="support@firstclass.ai"
              />
            </label>
            <label className="grid gap-1 md:col-span-2">
              <span className="text-sm text-neutral-300">Webhook URL</span>
              <input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 outline-none"
                placeholder="https://api.firstclass.ai/webhooks"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
          <h2 className="text-sm font-semibold text-neutral-200">Access Control</h2>
          <label className="mt-3 flex items-center gap-2 text-sm text-neutral-300">
            <input
              type="checkbox"
              checked={allowSelfSignup}
              onChange={(e) => setAllowSelfSignup(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-[hsl(var(--brand))]"
            />
            Allow public signups
          </label>
        </section>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={saving || loading}
            className="rounded-2xl px-4 py-2 bg-[hsl(var(--brand))] text-white font-semibold border border-neutral-800 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          {error && (
            <span className="text-xs text-amber-300">Using defaults — API error: {error}</span>
          )}
        </div>
      </form>
    </div>
  )
}
