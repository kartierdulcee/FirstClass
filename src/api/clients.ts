import { useEffect, useMemo, useState } from 'react'
import { useApi } from './client'

export type AdminClient = {
  id: string
  name: string
  owner: string
  status: 'active' | 'paused'
}

export type ClientSortBy = 'name' | 'owner' | 'status'
export type SortDir = 'asc' | 'desc'

export function useAdminClients(query: {
  search?: string
  status?: 'all' | 'active' | 'paused'
  page?: number
  pageSize?: number
  sortBy?: ClientSortBy
  sortDir?: SortDir
} = {}) {
  const api = useApi()
  const [data, setData] = useState<AdminClient[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true) // first load
  const [fetching, setFetching] = useState(false) // subsequent refreshes
  const { search = '', status = 'all', page = 1, pageSize = 10, sortBy = 'name', sortDir = 'asc' } = query
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        if (loading) setLoading(true)
        else setFetching(true)
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (status && status !== 'all') params.set('status', status)
        params.set('page', String(page))
        params.set('pageSize', String(pageSize))
        params.set('sortBy', sortBy)
        params.set('sortDir', sortDir)
        const res = await api<AdminClient[]>(`/admin/clients${params.size ? `?${params.toString()}` : ''}`)
        if (!alive) return
        setData(res)
        setError(null)
      } catch (e) {
        if (!alive) return
        setError((e as Error).message)
        setData(mockClients)
      } finally {
        if (!alive) return
        if (loading) setLoading(false)
        setFetching(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [api, search, status, page, pageSize, sortBy, sortDir, version])

  const filtered = useMemo(() => {
    let rows = data ?? []
    if (status !== 'all') rows = rows.filter((r) => r.status === status)
    if (search) {
      const s = search.toLowerCase()
      rows = rows.filter((r) => r.name.toLowerCase().includes(s) || r.owner.toLowerCase().includes(s))
    }
    rows = [...rows].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortBy === 'name') return a.name.localeCompare(b.name) * dir
      if (sortBy === 'owner') return a.owner.localeCompare(b.owner) * dir
      return a.status.localeCompare(b.status) * dir
    })
    return rows
  }, [data, search, status, sortBy, sortDir])

  const total = filtered.length
  const start = Math.max(0, (page - 1) * pageSize)
  const paged = filtered.slice(start, start + pageSize)

  return { loading, fetching, error, rows: paged, total, refetch: () => setVersion((v) => v + 1) }
}

const mockClients: AdminClient[] = [
  { id: 'cl_001', name: 'GlowHaus MedSpa', owner: 'ava@glowhaus.com', status: 'active' },
  { id: 'cl_002', name: 'Nova Studios', owner: 'jordan@novastudios.io', status: 'active' },
  { id: 'cl_003', name: 'Radiant Aesthetics', owner: 'maya@radiant.co', status: 'paused' },
  { id: 'cl_004', name: 'Aero Performance', owner: 'dax@aero-performance.com', status: 'active' },
]
