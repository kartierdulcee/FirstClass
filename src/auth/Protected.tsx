import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '../auth/firebaseAuth'
import { Outlet, useLocation } from 'react-router-dom'

export default function Protected() {
  const loc = useLocation()
  // Use a relative path to avoid cross-origin whitelist issues
  const redirectUrl = `${loc.pathname}${loc.search}${loc.hash}`
  const { isLoaded } = useUser()

  return (
    <>
      {!isLoaded ? (
        <div className="min-h-screen grid place-items-center text-neutral-400">Loading…</div>
      ) : (
        <>
          <SignedIn>
            <Outlet />
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn {...({ forceRedirectUrl: redirectUrl } as any)} />
          </SignedOut>
        </>
      )}
    </>
  )
}
