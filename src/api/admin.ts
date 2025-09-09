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
        if (!alive) return
        setError((e as Error).message)
        setData(null)
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

// Removed mockOverview: we now rely solely on the API.
