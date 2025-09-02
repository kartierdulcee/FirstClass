import React, { createContext, useContext, useMemo, useState } from 'react'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'
export type Toast = {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number // ms
}

type ToastContextValue = {
  show: (t: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  function show(t: Omit<Toast, 'id'>) {
    const id = Math.random().toString(36).slice(2)
    const toast: Toast = { id, duration: 3500, variant: 'info', ...t }
    setToasts((prev) => [...prev, toast])
    window.setTimeout(() => dismiss(id), toast.duration)
  }

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const value = useMemo(() => ({ show }), [])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[80] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              'pointer-events-auto w-80 rounded-xl border p-3 shadow-lg backdrop-blur transition-all',
              'bg-neutral-950/95',
              t.variant === 'success' && 'border-emerald-700/50',
              t.variant === 'error' && 'border-rose-700/50',
              t.variant === 'warning' && 'border-amber-700/50',
              t.variant === 'info' && 'border-neutral-700/60',
            ].filter(Boolean).join(' ')}
          >
            {t.title && <div className="text-sm font-semibold text-neutral-100">{t.title}</div>}
            {t.description && <div className="mt-0.5 text-sm text-neutral-300">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

