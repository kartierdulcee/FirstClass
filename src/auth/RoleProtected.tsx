import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { Outlet, useLocation } from 'react-router-dom'

export default function Protected() {
  const loc = useLocation()
  const redirectUrl = `${loc.pathname}${loc.search}${loc.hash}`

  return (
    <>
      {/* Only render the nested routes when signed in */}
      <SignedIn>
        <Outlet />
      </SignedIn>

      {/* Otherwise, send to Clerk Sign In and come back */}
      <SignedOut>
        <RedirectToSignIn {...({ forceRedirectUrl: redirectUrl } as any)} />
      </SignedOut>
    </>
  )
}
