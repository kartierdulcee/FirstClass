import { useEffect, useState, useCallback } from 'react'
import { useApi } from './client'

export type AdminSettings = {
  supportEmail: string
  webhookUrl: string
  brandHue: number // 0-360, we use 212 by default
  allowSelfSignup: boolean
}

const defaults: AdminSettings = {
  supportEmail: 'support@firstclass.ai',
  webhookUrl: 'https://api.firstclass.ai/webhooks',
  brandHue: 212,
  allowSelfSignup: true,
}

export function useAdminSettings() {
  const api = useApi()
  const [data, setData] = useState<AdminSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await api<AdminSettings>('/admin/settings')
        if (!alive) return
        setData({ ...defaults, ...res })
        setError(null)
      } catch (e) {
        if (!alive) return
        setData(defaults)
        setError((e as Error).message)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [api])

  const save = useCallback(async (next: AdminSettings) => {
    setSaving(true)
    try {
      await api('/admin/settings', { method: 'PUT', body: JSON.stringify(next) })
      setData(next)
      setError(null)
      return true
    } catch (e) {
      setError((e as Error).message)
      return false
    } finally {
      setSaving(false)
    }
  }, [api])

  return { data, setData, loading, saving, error, save }
}

