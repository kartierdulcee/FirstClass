import { useAuth } from '../auth/firebaseAuth'
import { useCallback } from 'react'

/**
 * Small fetch wrapper that adds base URL and Clerk auth header.
 */
export function useApi() {
  const { getToken } = useAuth()
  const base = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api'

  const api = useCallback(async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
    const url = `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
    const token = await getToken().catch(() => undefined)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string> | undefined),
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(url, { ...init, headers })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`${res.status} ${res.statusText}${text ? `: ${text}` : ''}`)
    }
    return (await res.json()) as T
  }, [getToken, base])

  return api
}
