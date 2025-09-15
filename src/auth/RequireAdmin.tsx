import { RedirectToSignIn, useUser } from '../auth/firebaseAuth'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { isAdminish } from './roles'

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser()

  if (!isLoaded) return null

  if (!isSignedIn) {
    return <RedirectToSignIn />
  }

  const allowed = isAdminish(user)

  if (!allowed) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
