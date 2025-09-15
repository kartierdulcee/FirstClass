import { SignedIn, SignedOut, useUser, useClerk } from '../auth/firebaseAuth'
import { useState } from 'react'
import ProfileModal from './ProfileModal'
import { Link } from 'react-router-dom'
import { getRole } from '../auth/roles'

function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const offset = 80 // leave room for floating bar
  const y = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top: y, behavior: 'smooth' })
}

export default function Navbar() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    // Wrapper makes bar float & non-blocking outside pill
    <div className="pointer-events-none fixed top-4 left-0 right-0 z-[60] flex justify-center">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-neutral-800/70 bg-neutral-950/80 px-3 py-2 shadow-lg backdrop-blur">
        {/* Brand → scroll to top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="px-2 text-sm font-bold text-white"
          aria-label="FirstClass AI"
        >
          <span className="text-[hsl(var(--brand))]">First</span>Class AI
        </button>

        {/* Center nav pills */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-3 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg"
          >
            Home
          </button>
          <button
            onClick={() => scrollToId('benefits')}
            className="px-3 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg"
          >
            Benefits
          </button>
          <button
            onClick={() => scrollToId('services')}
            className="px-3 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg"
          >
            Services
          </button>
          <button
            onClick={() => scrollToId('pricing')}
            className="px-3 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg"
          >
            Pricing
          </button>

          {/* Admin link (staff only) */}
          <SignedIn>
            {(user?.publicMetadata?.role === 'manager' || user?.publicMetadata?.role === 'admin' || (user?.publicMetadata as any)?.role === 'founder') && (
              <Link
                to="/admin"
                className="px-3 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg"
              >
                Admin
              </Link>
            )}
          </SignedIn>

          {/* Dashboard link (any signed-in user) */}
          <SignedIn>
            <Link
              to="/dashboard"
              className="px-3 py-1.5 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg"
            >
              Dashboard
            </Link>
          </SignedIn>
        </nav>

        {/* Auth controls */}
        <div className="flex items-center gap-2">
          <SignedOut>
            <Link
              to="/login"
              className="rounded-2xl px-3 py-1.5 bg-gradient-to-r from-[#0374FF] to-[#0a5ce0] text-white text-sm font-semibold border border-neutral-800 shadow-[0_0_12px_rgba(3,116,255,.35)]"
            >
              Sign In
            </Link>
          </SignedOut>

          <SignedIn>
            <button
              onClick={() => setProfileOpen(true)}
              className="rounded-2xl px-3 py-1.5 bg-neutral-800 text-white text-sm border border-neutral-700 hover:bg-neutral-700"
            >
              Manage Profile
            </button>
            <button
              onClick={() => signOut(() => (window.location.href = '/login'))}
              className="rounded-2xl px-3 py-1.5 bg-neutral-800 text-white text-sm border border-neutral-700 hover:bg-neutral-700"
            >
              Sign Out
            </button>
            {getRole(user) === 'founder' && (
              <span className="ml-1 inline-flex items-center gap-1 rounded-md border border-amber-700/50 bg-amber-900/30 px-2 py-1 text-[10px] uppercase tracking-wider text-amber-200">
                Founder
              </span>
            )}
          </SignedIn>
        </div>
        {/* Profile modal mount */}
        <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      </div>
    </div>
  )
}
