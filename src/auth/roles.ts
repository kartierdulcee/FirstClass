import type { UserResource } from '@clerk/types'

export function getRole(user: UserResource | null | undefined): string | undefined {
  const pm = (user?.publicMetadata ?? {}) as Record<string, unknown>
  const role = typeof pm.role === 'string' ? pm.role : undefined
  if (role) return role

  const founderEmail = import.meta.env.VITE_FOUNDER_EMAIL as string | undefined
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase()
  if (founderEmail && email && email === founderEmail.toLowerCase()) return 'founder'
  return undefined
}

export function isAdminish(user: UserResource | null | undefined): boolean {
  const role = getRole(user)
  return role === 'admin' || role === 'manager' || role === 'founder'
}

