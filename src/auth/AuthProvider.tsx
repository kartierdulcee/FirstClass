import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Role = 'client' | 'manager' | 'admin'
export type User = { email: string; role: Role }

type AuthContextType = {
  user: User | null
  isAuthed: boolean
  isAdminish: boolean // manager or admin
  loginWithEmail: (email: string) => void
  logout: () => void
}

/** Allowlist for FirstClass staff accounts */
const MANAGER_ALLOWLIST = [
  'manager@firstclass.ai',
  'ops@firstclass.ai',
]
const ADMIN_ALLOWLIST = [
  'admin@firstclass.ai',
  'founder@firstclass.ai',
]

const LS_KEY = 'fc_user'

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      try {
        setUser(JSON.parse(raw))
      } catch {}
    }
  }, [])

  const isAuthed = !!user
  const isAdminish = user?.role === 'admin' || user?.role === 'manager'

  function loginWithEmail(email: string) {
    const e = email.trim().toLowerCase()
    let role: Role = 'client'
    if (ADMIN_ALLOWLIST.includes(e)) role = 'admin'
    else if (MANAGER_ALLOWLIST.includes(e)) role = 'manager'

    const next: User = { email: e, role }
    setUser(next)
    localStorage.setItem(LS_KEY, JSON.stringify(next))
  }

  function logout() {
    setUser(null)
    localStorage.removeItem(LS_KEY)
  }

  const value = useMemo(
    () => ({ user, isAuthed, isAdminish, loginWithEmail, logout }),
    [user, isAuthed, isAdminish]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
