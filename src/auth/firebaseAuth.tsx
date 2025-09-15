import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, getIdToken, signOut as fbSignOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from '../pages/admin/FB'

type FirebaseUserLike = User & {
  primaryEmailAddress?: { emailAddress?: string | null }
  publicMetadata?: Record<string, unknown>
}

type AuthContextValue = {
  isLoaded: boolean
  user: FirebaseUserLike | null
  getToken: () => Promise<string | undefined>
  signOut: (cb?: () => void) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setIsLoaded(true)
    })
    return () => unsub()
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    isLoaded,
    user: user as FirebaseUserLike | null,
    async getToken() {
      try {
        if (!user) return undefined
        return await getIdToken(user)
      } catch {
        return undefined
      }
    },
    async signOut(cb?: () => void) {
      await fbSignOut(auth)
      cb?.()
    },
  }), [isLoaded, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// ----- Clerk-like shims -----
export function SignedIn({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useAuth()
  if (!isLoaded) return null
  return user ? <>{children}</> : null
}

export function SignedOut({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useAuth()
  if (!isLoaded) return null
  return !user ? <>{children}</> : null
}

export function RedirectToSignIn({ forceRedirectUrl }: { forceRedirectUrl?: string }) {
  // Navigate via location to avoid hook usage here
  const to = '/login' + (forceRedirectUrl ? `?redirect=${encodeURIComponent(forceRedirectUrl)}` : '')
  if (typeof window !== 'undefined') {
    window.location.replace(to)
  }
  return null
}

export function useUser() {
  const { user, isLoaded } = useAuth()
  // isSignedIn for API-compat
  return { isLoaded, isSignedIn: !!user, user: user as FirebaseUserLike | null }
}

export function useClerk() {
  const { signOut } = useAuth()
  return { signOut, openUserProfile: () => {} }
}
