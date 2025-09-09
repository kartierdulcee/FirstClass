import { useEffect, useMemo, useState } from 'react'
import { useApi } from './client'

export type RequestStatus = 'open' | 'in_progress' | 'closed'
export type RequestType = 'onboarding' | 'support'

export type AdminRequest = {
  id: string
  type: RequestType
  requester: string
  subject: string
  createdAt: string // ISO string
  status: RequestStatus
}

export type RequestSortBy = 'createdAt' | 'subject' | 'requester' | 'status' | 'type'
export type SortDir = 'asc' | 'desc'

export function useAdminRequests(query: {
  search?: string
  status?: 'all' | RequestStatus
  type?: 'all' | RequestType
  page?: number
  pageSize?: number
  sortBy?: RequestSortBy
  sortDir?: SortDir
} = {}) {
  const api = useApi()
  const [data, setData] = useState<AdminRequest[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true) // first load
  const [fetching, setFetching] = useState(false) // subsequent refreshes
  const { search = '', status = 'all', type = 'all', page = 1, pageSize = 10, sortBy = 'createdAt', sortDir = 'desc' } = query
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
        if (type && type !== 'all') params.set('type', type)
        params.set('page', String(page))
        params.set('pageSize', String(pageSize))
        params.set('sortBy', sortBy)
        params.set('sortDir', sortDir)
        const res = await api<AdminRequest[]>(`/admin/requests${params.size ? `?${params.toString()}` : ''}`)
        if (!alive) return
        setData(res)
        setError(null)
      } catch (e) {
        if (!alive) return
        setError((e as Error).message)
        setData([])
      } finally {
        if (!alive) return
        if (loading) setLoading(false)
        setFetching(false)
      }
    })()
    return () => { alive = false }
  }, [api, search, status, type, page, pageSize, sortBy, sortDir, version])

  const filtered = useMemo(() => {
    let rows = data ?? []
    if (status !== 'all') rows = rows.filter((r) => r.status === status)
    if (type !== 'all') rows = rows.filter((r) => r.type === type)
    if (search) {
      const s = search.toLowerCase()
      rows = rows.filter((r) => r.subject.toLowerCase().includes(s) || r.requester.toLowerCase().includes(s))
    }
    rows = [...rows].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortBy === 'createdAt') return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir
      if (sortBy === 'subject') return a.subject.localeCompare(b.subject) * dir
      if (sortBy === 'requester') return a.requester.localeCompare(b.requester) * dir
      if (sortBy === 'type') return a.type.localeCompare(b.type) * dir
      return a.status.localeCompare(b.status) * dir
    })
    return rows
  }, [data, search, status, type, sortBy, sortDir])

  const total = filtered.length
  const start = Math.max(0, (page - 1) * pageSize)
  const paged = filtered.slice(start, start + pageSize)

  return { loading, fetching, error, rows: paged, total, refetch: () => setVersion((v) => v + 1) }
}

// Removed mock requests: results now come only from the API.
