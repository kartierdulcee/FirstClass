import { useMemo } from 'react'

export default function VideoClipper() {
  const appUrl = useMemo(() => {
    const raw = import.meta.env.VITE_VIDEO_CLIPPER_URL as string | undefined
    return raw?.trim() ?? ''
  }, [])

  const isConfigured = Boolean(appUrl)
  const isWebUrl = appUrl.startsWith('http://') || appUrl.startsWith('https://')
  const canRender = isConfigured && isWebUrl

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold">AI Video Clipper</h2>
        <p className="text-sm text-neutral-400">
          Generate vertical clips automatically by embedding the hosted Gradio workspace below.
        </p>
      </header>

      {!canRender ? (
        <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-950/60 p-6 text-sm text-neutral-300">
          <p className="font-medium">Configuration required</p>
          <p className="mt-2 text-neutral-400">
            Set <code>VITE_VIDEO_CLIPPER_URL</code> in your client environment to the public URL of the deployed Gradio
            service in order to render it here. The URL should include the scheme, for example{' '}
            <code>https://your-domain.onrender.com</code>.
          </p>
        </div>
      ) : (
        <div className="h-[720px] overflow-hidden rounded-2xl border border-neutral-800 bg-black/40 shadow-inner">
          <iframe
            src={appUrl}
            title="AI Video Clipper"
            className="h-full w-full border-0"
            allow="clipboard-write; encrypted-media; accelerometer; autoplay;"
            allowFullScreen
          />
        </div>
      )}

      {canRender && (
        <div className="flex items-center justify-between rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-4 text-sm text-neutral-300">
          <div>
            <p className="font-medium text-white">Open in new tab</p>
            <p className="text-xs text-neutral-400">Use the dedicated window for full-screen editing or sharing.</p>
          </div>
          <a
            href={canRender ? appUrl : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-neutral-600 px-3 py-2 text-sm text-white hover:border-neutral-400"
          >
            Launch Workspace
          </a>
        </div>
      )}
    </div>
  )
}
