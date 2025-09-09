import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import React from 'react'
import { useClerk, useUser } from '@clerk/clerk-react'
import {
  LayoutDashboard,
  FileText,
  BarChart2,
  Settings,
} from 'lucide-react'
import FounderBanner from '../components/FounderBanner'
import AssistantWidget from '../components/AssistantWidget'

export default function DashboardLayout() {
  const { signOut } = useClerk()
  const { user } = useUser()
  const nav = useNavigate()
  const location = useLocation()

  const tabs = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Content', path: '/dashboard/content', icon: FileText },
    { name: 'Content Lab', path: '/dashboard/content-lab', icon: FileText },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart2 },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ]

  const [mobileOpen, setMobileOpen] = React.useState(false)
  const sidebarRef = React.useRef<HTMLDivElement | null>(null)

  // Close the mobile drawer when navigating
  React.useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Close on Escape and lock body scroll when open on mobile
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    if (mobileOpen) {
      document.addEventListener('keydown', onKey)
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      // focus first focusable element in the sidebar
      const el = sidebarRef.current as HTMLElement | null
      const first = el?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      first?.focus()
      return () => {
        document.removeEventListener('keydown', onKey)
        document.body.style.overflow = prev
      }
    }
  }, [mobileOpen])

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
      <aside
        id="dashboard-sidebar"
        className={[
          'border-r border-neutral-800 bg-gradient-to-b from-neutral-950 to-neutral-900/95',
          // Desktop: static column
          'md:relative md:w-64 md:shrink-0',
          // Mobile: slide-in drawer
          'fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-out md:transform-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
        aria-hidden={!mobileOpen && typeof window !== 'undefined' && window.innerWidth < 768}
        aria-modal={mobileOpen ? true : undefined}
        role="dialog"
        ref={sidebarRef as any}
      >
        {/* Brand */}
        <div className="flex h-14 items-center gap-2 border-b border-neutral-800/80 px-4">
          <div className="h-2 w-2 rounded-full bg-[hsl(var(--brand),_#0374FF)] shadow-[0_0_8px_rgba(3,116,255,.8)]" />
          <div className="text-sm font-semibold tracking-wide">FirstClass AI</div>
          {/* Close button (mobile) */}
          <button
            type="button"
            className="ml-auto md:hidden inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-800 text-neutral-300 hover:bg-neutral-800"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
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
            onClick={() => signOut(() => nav('/login'))}
            className="w-full rounded-lg border border-neutral-700/80 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-300 hover:border-neutral-600 hover:bg-neutral-800/70 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main className="relative flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 border-b border-neutral-800/80 bg-neutral-950/70 backdrop-blur">
          <div className="mx-auto max-w-6xl px-5 py-3">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                type="button"
                className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
                onClick={() => setMobileOpen((v) => !v)}
                aria-expanded={mobileOpen}
                aria-controls="dashboard-sidebar"
                aria-label="Toggle menu"
              >
                {/* simple hamburger */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
              <h1 className="text-lg font-semibold">Dashboard</h1>
            </div>
          </div>
        </div>

        {/* Content container */}
        <div className="mx-auto max-w-6xl px-5 py-6">
          <Outlet />
        </div>
        <FounderBanner />
        {/* Hide assistant while in Content Lab */}
        {!location.pathname.startsWith('/dashboard/content-lab') && (
          <AssistantWidget />
        )}
      </main>
    </div>
  )
}
