import { useState, useMemo, useRef } from 'react'

type ChatMessage = { id: string; role: 'user' | 'assistant'; text: string }

export default function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  // Ensure a unique id for aria relationships if multiple widgets ever exist
  const ids = useMemo(() => {
    const rand = Math.random().toString(36).slice(2, 8)
    return {
      panel: `assistant-panel-${rand}`,
      button: `assistant-button-${rand}`,
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-[90]">
      {/* Panel */}
      {open && (
        <div
          id={ids.panel}
          role="dialog"
          aria-labelledby={`${ids.panel}-label`}
          aria-modal="true"
          className="mb-3 w-[360px] overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/90 shadow-2xl backdrop-blur"
        >
          <div className="flex items-center justify-between border-b border-neutral-800 px-3 py-2">
            <div id={`${ids.panel}-label`} className="flex items-center gap-2 text-sm font-medium">
              <img src="/firstclass-logo.svg" alt="FirstClass" className="h-5 w-5" />
              FirstClass Assistant
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800/60 hover:text-white"
            >
              Close
            </button>
          </div>
          <div ref={scrollerRef} className="h-80 space-y-3 overflow-y-auto p-3 text-sm text-neutral-300">
            {messages.length === 0 ? (
              <div className="text-neutral-400">
                Hi! I’m your AI assistant. Ask me anything about your dashboard.
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={m.role === 'assistant' ? 'flex items-start gap-2' : 'flex items-start justify-end gap-2'}>
                  {m.role === 'assistant' && (
                    <img src="/firstclass-logo.svg" alt="AI" className="mt-0.5 h-4 w-4 opacity-80" />
                  )}
                  <div
                    className={[
                      'max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2',
                      m.role === 'assistant'
                        ? 'bg-neutral-900/80 text-neutral-200 ring-1 ring-neutral-800'
                        : 'bg-[hsl(var(--brand),_#0374FF)]/15 text-neutral-100 ring-1 ring-[rgba(3,116,255,0.35)]',
                    ].join(' ')}
                  >
                    {m.text}
                  </div>
                </div>
              ))
            )}
            {sending && (
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-500" />
                Thinking…
              </div>
            )}
          </div>
          <div className="border-t border-neutral-800 p-2">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const text = input.trim()
                if (!text || sending) return
                const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', text }
                setMessages((prev) => [...prev, userMsg])
                setInput('')
                setSending(true)

                // Scroll to bottom on new message
                queueMicrotask(() => {
                  scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' })
                })

                fetch('/api/assistant', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.text })) }),
                })
                  .then(async (r) => {
                    if (!r.ok) {
                      const t = await r.text()
                      throw new Error(t || `Request failed: ${r.status}`)
                    }
                    return r.json()
                  })
                  .then((data: { reply: string }) => {
                    const aiMsg: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', text: data.reply || '(no response)' }
                    setMessages((prev) => [...prev, aiMsg])
                  })
                  .catch((err) => {
                    const aiMsg: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', text: `Error: ${err.message}` }
                    setMessages((prev) => [...prev, aiMsg])
                  })
                  .finally(() => setSending(false))
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={sending}
                className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none focus:border-neutral-600 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={sending}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:border-neutral-600 hover:bg-neutral-700 disabled:opacity-60"
              >
                {sending ? 'Sending…' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Logo Button */}
      <button
        id={ids.button}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={ids.panel}
        onClick={() => setOpen((v) => !v)}
        className="group inline-flex h-14 w-14 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/40 shadow-xl ring-1 ring-black/20 backdrop-blur transition hover:border-neutral-700 hover:bg-neutral-800/50"
        title="Open FirstClass Assistant"
      >
        <img
          src="/firstclass-logo.svg"
          alt="FirstClass Assistant"
          className="h-8 w-8 select-none opacity-90 transition group-hover:opacity-100"
          draggable={false}
        />
      </button>
    </div>
  )
}
