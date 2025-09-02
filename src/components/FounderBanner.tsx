import { useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { getRole } from '../auth/roles'

export default function FounderBanner() {
  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded || !isSignedIn) return null
  const role = getRole(user)
  if (role !== 'founder') return null

  const email = user?.primaryEmailAddress?.emailAddress

  return (
    <div className="fixed bottom-4 right-4 z-[70]">
      <div className="flex items-center gap-2 rounded-full border border-amber-600/40 bg-amber-900/30 px-3 py-1.5 text-xs text-amber-200 shadow-lg backdrop-blur">
        <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
        Founder: {email}
        <Link
          to="/admin"
          className="rounded-md border border-amber-700/50 bg-amber-900/40 px-2 py-0.5 text-[11px] text-amber-100 hover:bg-amber-800/50"
        >
          Admin Panel
        </Link>
      </div>
    </div>
  )
}

