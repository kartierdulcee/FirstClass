import { useState, useMemo } from 'react'

export default function AssistantWidget() {
  const [open, setOpen] = useState(false)

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
          className="mb-3 w-[320px] overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/90 shadow-2xl backdrop-blur"
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
          <div className="h-64 space-y-3 overflow-y-auto p-3 text-sm text-neutral-300">
            <div className="text-neutral-400">
              Hi! I’m your AI assistant. Ask me anything about your dashboard.
            </div>
            {/* Placeholder messages area */}
          </div>
          <div className="border-t border-neutral-800 p-2">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                // Placeholder submit; backend integration can be added later
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none focus:border-neutral-600"
              />
              <button
                type="submit"
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:border-neutral-600 hover:bg-neutral-700"
              >
                Send
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

