import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useClerk, useUser } from '@clerk/clerk-react'
import {
  LayoutDashboard,
  FileText,
  BarChart2,
  Settings,
} from 'lucide-react'
import FounderBanner from '../components/FounderBanner'

export default function DashboardLayout() {
  const { signOut } = useClerk()
  const { user } = useUser()
  const nav = useNavigate()

  const tabs = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Content', path: '/dashboard/content', icon: FileText },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart2 },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ]

  return (
    <div className="flex h-screen bg-[#0b0b0c] text-white">
      {/* Subtle background glow for the content area */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(800px 400px at 70% -10%, rgba(3,116,255,.10), transparent 60%)',
        }}
      />

      {/* Sidebar */}
      <aside className="relative w-64 shrink-0 border-r border-neutral-800 bg-gradient-to-b from-neutral-950 to-neutral-900/95">
        {/* Brand */}
        <div className="flex h-14 items-center gap-2 border-b border-neutral-800/80 px-4">
          <div className="h-2 w-2 rounded-full bg-[hsl(var(--brand),_#0374FF)] shadow-[0_0_8px_rgba(3,116,255,.8)]" />
          <div className="text-sm font-semibold tracking-wide">FirstClass AI</div>
        </div>

        {/* Nav */}
        <nav className="p-3">
          <div className="mb-2 px-2 text-[11px] uppercase tracking-wider text-neutral-500">
            Workspace
          </div>
          <ul className="space-y-1">
            {tabs.map((t) => (
              <li key={t.path}>
                <NavLink
                  end={t.path === '/dashboard'}
                  to={t.path}
                  className={({ isActive }) =>
                    [
                      'group flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-neutral-800/70 text-white ring-1 ring-neutral-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]'
                        : 'text-neutral-300 hover:bg-neutral-800/40 hover:text-white',
                    ].join(' ')
                  }
                >
                  <t.icon size={16} className="opacity-90" />
                  {t.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer / Account */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-neutral-800/80 p-3">
          <div className="mb-2 truncate px-2 text-xs text-neutral-400">
            {user?.fullName ?? user?.username}
          </div>
          <button
            onClick={() => signOut(() => nav('/'))}
            className="w-full rounded-lg border border-neutral-700/80 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-300 hover:border-neutral-600 hover:bg-neutral-800/70 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="relative flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 border-b border-neutral-800/80 bg-neutral-950/70 backdrop-blur">
          <div className="mx-auto max-w-6xl px-5 py-3">
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
        </div>

        {/* Content container */}
        <div className="mx-auto max-w-6xl px-5 py-6">
          <Outlet />
        </div>
        <FounderBanner />
      </main>
    </div>
  )
}
