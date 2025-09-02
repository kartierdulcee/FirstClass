import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from '@clerk/clerk-react'
import { Outlet, useLocation } from 'react-router-dom'

export default function Protected() {
  const loc = useLocation()
  // Use absolute URL when available so Clerk can safely round-trip
  // across its domain and back to the exact in-app location.
  const redirectUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `${loc.pathname}${loc.search}${loc.hash}`

  return (
    <>
      {/* Wait for Clerk to boot before deciding */}
      <ClerkLoading>
        <div className="min-h-screen grid place-items-center text-neutral-400">
          Loading…
        </div>
      </ClerkLoading>

      <ClerkLoaded>
        <SignedIn>
          <Outlet />
        </SignedIn>

        <SignedOut>
          <RedirectToSignIn redirectUrl={redirectUrl} />
        </SignedOut>
      </ClerkLoaded>
    </>
  )
}
