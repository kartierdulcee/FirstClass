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
  // Use a relative path to avoid cross-origin whitelist issues
  const redirectUrl = `${loc.pathname}${loc.search}${loc.hash}`

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
          <RedirectToSignIn {...({ forceRedirectUrl: redirectUrl } as any)} />
        </SignedOut>
      </ClerkLoaded>
    </>
  )
}
