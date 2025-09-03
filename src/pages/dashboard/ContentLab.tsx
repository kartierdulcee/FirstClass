import { useMemo, useRef, useState } from 'react'

type ChatMessage = { id: string; role: 'user' | 'assistant'; text: string }

export default function ContentLab() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  const systemPrompt = useMemo(
    () =>
      [
        'You are FirstClass Content Lab, an AI copy partner.',
        'Produce concise, on-brand content across channels (Twitter, IG, LinkedIn, YouTube).',
        'Defaults: punchy hooks, clear structure, optional CTA. Keep outputs ready-to-post.',
      ].join(' '),
    []
  )

  async function send() {
    const text = input.trim()
    if (!text || sending) return
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setSending(true)
    queueMicrotask(() => scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight }))

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemPrompt,
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.text })),
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = (await res.json()) as { reply?: string; error?: string }
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: data.reply || data.error || '(no response)'
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', text: `Error: ${err.message || 'Failed to reply'}` },
      ])
    } finally {
      setSending(false)
      queueMicrotask(() => scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' }))
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Content Lab</h2>
        <p className="mt-1 text-sm text-neutral-400">Generate posts, hooks, scripts, and captions with AI.</p>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60">
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2 text-sm">
          <div className="flex items-center gap-2">
            <img src="/firstclass-logo.svg" className="h-4 w-4" alt="FirstClass" />
            FirstClass Content Lab
          </div>
          <div className="text-[11px] text-neutral-500">On-brand, ready-to-post outputs</div>
        </div>
        <div ref={scrollerRef} className="h-[480px] space-y-3 overflow-y-auto p-4 text-sm">
          {messages.length === 0 ? (
            <div className="text-neutral-400">
              Try: "Write 5 hook ideas for a YouTube short about automating client onboarding." Or paste a draft to polish.
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={m.role === 'assistant' ? 'flex items-start gap-2' : 'flex items-start justify-end gap-2'}>
                {m.role === 'assistant' && (
                  <img src="/firstclass-logo.svg" alt="AI" className="mt-0.5 h-4 w-4 opacity-80" />
                )}
                <div
                  className={[
                    'max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2',
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
              Generating…
            </div>
          )}
        </div>
        <div className="border-t border-neutral-800 p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
              placeholder="Describe what to create… e.g., 3 LinkedIn hooks about B2B lead gen"
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
    </div>
  )
}

