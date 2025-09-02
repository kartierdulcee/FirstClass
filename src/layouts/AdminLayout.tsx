import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useClerk, useUser } from '@clerk/clerk-react'
import { Users, LayoutDashboard, FileText, Settings } from 'lucide-react'
import FounderBanner from '../components/FounderBanner'
import { getRole } from '../auth/roles'

export default function AdminLayout() {
  const { signOut } = useClerk()
  const { user } = useUser()
  const nav = useNavigate()

  const tabs = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Clients', path: '/admin/clients', icon: Users },
    { name: 'Requests', path: '/admin/requests', icon: FileText },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="flex h-screen text-neutral-100">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col">
        <div className="h-14 flex items-center justify-between px-4 border-b border-neutral-800">
          <div className="text-lg font-bold">Admin Panel</div>
          {getRole(user) === 'founder' && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-md border border-amber-700/50 bg-amber-900/30 px-2 py-1 text-[10px] uppercase tracking-wider text-amber-200">
              Founder
            </span>
          )}
        </div>
        <nav className="flex-1 p-3">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-300 hover:bg-neutral-800/50 hover:text-white'
                }`
              }
            >
              <tab.icon size={16} />
              {tab.name}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-neutral-800 p-3 text-sm text-neutral-400">
          <div>{user?.fullName}</div>
          <div className="truncate">{user?.primaryEmailAddress?.emailAddress}</div>
          <button
            onClick={() => signOut(() => nav('/'))}
            className="mt-2 w-full rounded-lg border border-neutral-700 px-3 py-1.5 text-left text-neutral-300 hover:bg-neutral-800 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-neutral-900 p-6 relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid" />
        <Outlet />
        <FounderBanner />
      </main>
    </div>
  )
}
