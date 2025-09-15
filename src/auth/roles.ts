export function getRole(user: any | null | undefined): string | undefined {
  // Try Clerk-like publicMetadata.role
  const pm = (user?.publicMetadata ?? {}) as Record<string, unknown>
  const metaRole = typeof pm.role === 'string' ? (pm.role as string) : undefined
  if (metaRole) return metaRole

  // Try Firebase custom claims via user.stsTokenManager?.claims or token processing elsewhere
  const fbRole = typeof (user as any)?.role === 'string' ? (user as any).role : undefined
  if (fbRole) return fbRole

  // Founder email override via env
  const founderEmail = (import.meta as any)?.env?.VITE_FOUNDER_EMAIL as string | undefined
  const email = (user?.primaryEmailAddress?.emailAddress || user?.email || '').toLowerCase()
  if (founderEmail && email && email === founderEmail.toLowerCase()) return 'founder'
  return undefined
}

export function isAdminish(user: any | null | undefined): boolean {
  const role = getRole(user)
  return role === 'admin' || role === 'manager' || role === 'founder'
}
