import { useUser, useClerk } from '../../auth/firebaseAuth'
import ProfileModal from '../../components/ProfileModal'
import { useEffect, useState } from 'react'
import { useApi } from '../../api/client'
import { Mail, User, Globe, Settings as Cog, Link as LinkIcon, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const api = useApi()
  const [connections, setConnections] = useState<{ id: string; provider: string; handle?: string; createdAt: string }[]>([])
  const [providers, setProviders] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const p = await api<{ providers: string[] }>('/social/providers')
        const c = await api<{ id: string; provider: string; handle?: string; createdAt: string }[]>('/social/connections')
        if (!alive) return
        setProviders(p.providers)
        setConnections(c)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [api])

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Manage your account, workspace, and channel connections.
        </p>
      </header>

      <Panel title="Account" icon={User}>
        <div className="space-y-3 text-sm text-neutral-300">
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-neutral-500" />
            <span>{(user as any)?.primaryEmailAddress?.emailAddress ?? (user as any)?.email ?? '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-neutral-500" />
            <span>Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setProfileOpen(true)}
            className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm hover:bg-neutral-800"
          >
            Manage profile
          </button>
          <button
            onClick={() => signOut(() => (window.location.href = '/login'))}
            className="rounded-lg border border-red-700/50 bg-red-900/30 px-3 py-2 text-sm text-red-300 hover:bg-red-800/50"
          >
            Sign out
          </button>
        </div>
      </Panel>

      <Panel title="Connected channels" icon={LinkIcon}>
        <div className="text-sm text-neutral-300">
          {loading ? (
            <div className="h-10 w-32 skeleton" />
          ) : (
            <>
              <ul className="space-y-2">
                {connections.map((c) => (
                  <li key={c.id} className="flex items-center justify-between rounded-lg border border-neutral-800/70 bg-neutral-950/60 p-3">
                    <span className="capitalize">{c.provider} {c.handle ? `• ${c.handle}` : ''}</span>
                    <button
                      onClick={async () => { await api(`/social/${c.id}`, { method: 'DELETE' }); setConnections((arr) => arr.filter((x) => x.id !== c.id)) }}
                      className="rounded-md border border-neutral-800 px-2 py-1 text-xs hover:bg-neutral-800/60"
                    >
                      Disconnect
                    </button>
                  </li>
                ))}
                {connections.length === 0 && (
                  <li className="rounded-lg border border-neutral-800/70 bg-neutral-950/60 p-3 text-neutral-400">No accounts connected.</li>
                )}
              </ul>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {providers.includes('google') && (
                  <a href="/api/social/google/auth" className="block rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-center text-sm hover:bg-neutral-800">Connect YouTube</a>
                )}
                {providers.includes('linkedin') && (
                  <a href="/api/social/linkedin/auth" className="block rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-center text-sm hover:bg-neutral-800">Connect LinkedIn</a>
                )}
                {!providers.length && (
                  <div className="text-xs text-neutral-500">No providers configured. Ask an admin to set OAuth keys.</div>
                )}
              </div>
            </>
          )}
        </div>
      </Panel>

      <Panel title="Workspace preferences" icon={Cog}>
        <div className="space-y-3 text-sm text-neutral-300">
          <div>
            <label className="block text-xs text-neutral-500">Default posting cadence</label>
            <select className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm text-white">
              <option>Daily</option>
              <option>3x per week</option>
              <option>Weekly</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-neutral-500">Timezone override</label>
            <input
              type="text"
              placeholder="e.g. America/New_York"
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm text-white placeholder-neutral-500"
            />
          </div>
        </div>
        <button className="mt-4 rounded-lg border border-red-700/50 bg-red-900/30 px-3 py-2 text-sm text-red-300 hover:bg-red-800/50 flex items-center gap-2">
          <Trash2 size={14} /> Delete workspace
        </button>
      </Panel>
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  )
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="flex items-center gap-2 text-neutral-200">
        <Icon size={16} />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

// Note: previously had an unused StatusBadge component here; removed to satisfy strict TS build.
