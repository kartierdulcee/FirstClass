import { useUser, useClerk } from '@clerk/clerk-react'
import { Mail, User, Globe, Settings as Cog, Link as LinkIcon, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useUser()
  const { openUserProfile, signOut } = useClerk()

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
            <span>{user?.primaryEmailAddress?.emailAddress ?? '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-neutral-500" />
            <span>Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => openUserProfile()}
            className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm hover:bg-neutral-800"
          >
            Manage profile
          </button>
          <button
            onClick={() => signOut({ redirectUrl: '/login' })}
            className="rounded-lg border border-red-700/50 bg-red-900/30 px-3 py-2 text-sm text-red-300 hover:bg-red-800/50"
          >
            Sign out
          </button>
        </div>
      </Panel>

      <Panel title="Connected channels" icon={LinkIcon}>
        <ul className="space-y-2 text-sm text-neutral-400">
          <li className="flex items-center justify-between rounded-lg border border-neutral-800/70 bg-neutral-950/60 p-3">
            <span>Instagram</span>
            <StatusBadge status="connected" />
          </li>
          <li className="flex items-center justify-between rounded-lg border border-neutral-800/70 bg-neutral-950/60 p-3">
            <span>Twitter/X</span>
            <StatusBadge status="connected" />
          </li>
          <li className="flex items-center justify-between rounded-lg border border-neutral-800/70 bg-neutral-950/60 p-3">
            <span>YouTube</span>
            <StatusBadge status="needs_reauth" />
          </li>
          <li className="flex items-center justify-between rounded-lg border border-neutral-800/70 bg-neutral-950/60 p-3">
            <span>LinkedIn</span>
            <StatusBadge status="disconnected" />
          </li>
        </ul>
        <button className="mt-3 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm hover:bg-neutral-800">
          Manage connections
        </button>
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

function StatusBadge({ status }: { status: 'connected' | 'needs_reauth' | 'disconnected' }) {
  if (status === 'connected') {
    return (
      <span className="rounded-md border border-emerald-700/50 bg-emerald-900/30 px-2 py-1 text-xs text-emerald-300">
        Connected
      </span>
    )
  }
  if (status === 'needs_reauth') {
    return (
      <span className="rounded-md border border-amber-700/50 bg-amber-900/30 px-2 py-1 text-xs text-amber-300">
        Re-auth needed
      </span>
    )
  }
  return (
    <span className="rounded-md border border-neutral-700/70 bg-neutral-900 px-2 py-1 text-xs text-neutral-400">
      Disconnected
    </span>
  )
}
