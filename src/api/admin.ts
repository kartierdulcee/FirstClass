import { useEffect, useMemo, useState } from 'react'
import { useApi } from './client'

export type SystemHealth = 'healthy' | 'degraded' | 'down'
export type AdminOverviewData = {
  kpis: {
    totalClients: number
    activeWorkspaces: number
    pendingRequests: number
    mrrUsd: number
  }
  weeklyJobs: number[]
  health: { name: string; status: SystemHealth }[]
  topClients: { name: string; owner: string; posts: number; status: 'active' | 'paused' }[]
  recent: { when: string; what: string; who: string }[]
}

export function useAdminOverview(range: '7d' | '30d' | '90d' = '7d') {
  const api = useApi()
  const [data, setData] = useState<AdminOverviewData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await api<AdminOverviewData>(`/admin/overview?range=${range}`)
        if (!alive) return
        setData(res)
        setError(null)
      } catch (e) {
        // Fallback to mock data if API not ready
        if (!alive) return
        setError((e as Error).message)
        setData(mockOverview)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [api, range])

  const formatted = useMemo(() => {
    if (!data) return null
    return {
      kpis: [
        { label: 'Total Clients', value: String(data.kpis.totalClients) },
        { label: 'Active Workspaces', value: String(data.kpis.activeWorkspaces) },
        { label: 'Pending Requests', value: String(data.kpis.pendingRequests) },
        { label: 'Est. MRR', value: `$${data.kpis.mrrUsd.toLocaleString()}` },
      ] as const,
      weekly: data.weeklyJobs,
      health: data.health,
      topClients: data.topClients,
      recent: data.recent,
    }
  }, [data])

  return { loading, error, data: formatted }
}

const mockOverview: AdminOverviewData = {
  kpis: {
    totalClients: 128,
    activeWorkspaces: 212,
    pendingRequests: 9,
    mrrUsd: 86400,
  },
  weeklyJobs: [8, 9, 7, 11, 12, 10, 14],
  health: [
    { name: 'API', status: 'healthy' },
    { name: 'Webhooks', status: 'degraded' },
    { name: 'Queues', status: 'healthy' },
    { name: 'Worker', status: 'healthy' },
  ],
  topClients: [
    { name: 'GlowHaus MedSpa', owner: 'ava@glowhaus.com', posts: 842, status: 'active' },
    { name: 'Nova Studios', owner: 'jordan@novastudios.io', posts: 733, status: 'active' },
    { name: 'Radiant Aesthetics', owner: 'maya@radiant.co', posts: 321, status: 'paused' },
  ],
  recent: [
    { when: '5m ago', what: 'New onboarding request', who: 'bruce@northpeak.io' },
    { when: '1h ago', what: 'Workspace created', who: 'alina@hauslabs.com' },
    { when: 'Yesterday', what: 'Plan upgraded to Pro', who: 'ops@novastudios.io' },
  ],
}
