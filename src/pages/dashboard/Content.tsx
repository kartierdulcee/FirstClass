import React, { useMemo, useState } from 'react'
import {
  Plus,
  Play,
  Pause,
  UploadCloud,
  Image as ImageIcon,
  Video,
  Hash,
  AlignLeft,
  X,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Send,
  CheckCircle2,
  Loader2,
  Calendar,
} from 'lucide-react'

type Draft = {
  id: string
  channel: 'instagram' | 'twitter' | 'youtube' | 'linkedin'
  type: 'post' | 'reel' | 'thread' | 'video'
  text: string
  media?: string
  scheduledAt?: string
  status: 'draft' | 'queued' | 'publishing' | 'published'
}

const initialDrafts: Draft[] = []

export default function ContentPage() {
  const [drafts, setDrafts] = useState<Draft[]>(initialDrafts)
  const [filter, setFilter] = useState<'all' | Draft['channel']>('all')
  const [showNew, setShowNew] = useState(false)

  const filtered = useMemo(
    () => (filter === 'all' ? drafts : drafts.filter((d) => d.channel === filter)),
    [drafts, filter]
  )

  function onCreate(type: Draft['type']) {
    const d: Draft = {
      id: crypto.randomUUID(),
      channel: 'instagram',
      type,
      text: '',
      status: 'draft',
    }
    setDrafts((prev) => [d, ...prev])
    setShowNew(false)
  }

  function onDelete(id: string) {
    setDrafts((prev) => prev.filter((d) => d.id !== id))
  }

  function onPublish(id: string) {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'publishing' } : d))
    )
    setTimeout(() => {
      setDrafts((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, status: 'published', scheduledAt: new Date().toISOString() } : d
        )
      )
    }, 1200)
  }

  function onQueue(id: string) {
    setDrafts((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: 'queued', scheduledAt: new Date(Date.now() + 3600_000).toISOString() }
          : d
      )
    )
  }

  function onChange(
    id: string,
    patch: Partial<Pick<Draft, 'text' | 'channel' | 'type' | 'scheduledAt' | 'media'>>
  ) {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Content</h2>
          <p className="mt-1 text-sm text-neutral-400">
            Draft, queue, and publish across all channels.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
          >
            <option value="all">All channels</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">Twitter/X</option>
            <option value="youtube">YouTube</option>
            <option value="linkedin">LinkedIn</option>
          </select>

          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-700/50 bg-blue-900/30 px-3 py-2 text-sm text-blue-200 hover:bg-blue-800/50"
          >
            <Plus size={16} />
            New
          </button>
        </div>
      </div>

      {/* New sheet */}
      {showNew && (
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/70 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-neutral-200">Create</div>
            <button
              onClick={() => setShowNew(false)}
              className="rounded-md border border-neutral-700 px-2 py-1 text-xs hover:bg-neutral-800"
            >
              <X size={14} />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <CreateTile icon={<AlignLeft size={16} />} label="Post" onClick={() => onCreate('post')} />
            <CreateTile icon={<ImageIcon size={16} />} label="Reel/Short" onClick={() => onCreate('reel')} />
            <CreateTile icon={<Hash size={16} />} label="Thread" onClick={() => onCreate('thread')} />
            <CreateTile icon={<Video size={16} />} label="Video" onClick={() => onCreate('video')} />
          </div>
        </div>
      )}

      {/* Queue */}
      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/70 p-8 text-center text-neutral-300">
            <div>No drafts yet.</div>
            <button onClick={() => setShowNew(true)} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-blue-700/50 bg-blue-900/30 px-3 py-2 text-sm text-blue-200 hover:bg-blue-800/50">
              <Plus size={16} /> Create your first draft
            </button>
          </div>
        )}
        {filtered.map((d) => (
          <div key={d.id} className="rounded-2xl border border-neutral-800/80 bg-neutral-900/70 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-neutral-300">
                <ChannelBadge channel={d.channel} />
                <span className="text-neutral-500">•</span>
                <span className="capitalize">{d.type}</span>
              </div>
              <div className="text-xs text-neutral-500 flex items-center gap-2">
                <Calendar size={14} />
                {d.scheduledAt ? new Date(d.scheduledAt).toLocaleString() : 'Not scheduled'}
              </div>
            </div>

            <textarea
              value={d.text}
              onChange={(e) => onChange(d.id, { text: e.target.value })}
              placeholder="Write something that converts…"
              className="mt-3 w-full rounded-lg border border-neutral-700 bg-neutral-950 p-3 text-sm text-neutral-100 placeholder-neutral-500"
              rows={4}
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('Media upload coming soon')}
                  className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs hover:bg-neutral-800 inline-flex items-center gap-1"
                >
                  <UploadCloud size={14} />
                  Add media
                </button>
              </div>

              <div className="flex items-center gap-2">
                {d.status === 'publishing' ? (
                  <button
                    disabled
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-700/50 bg-blue-900/30 px-3 py-2 text-sm text-blue-200"
                  >
                    <Loader2 className="animate-spin" size={16} />
                    Publishing…
                  </button>
                ) : d.status === 'published' ? (
                  <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-700/50 bg-emerald-900/30 px-3 py-2 text-sm text-emerald-200">
                    <CheckCircle2 size={16} />
                    Published
                  </span>
                ) : d.status === 'queued' ? (
                  <>
                    <button
                      onClick={() => onPublish(d.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-700/50 bg-blue-900/30 px-3 py-2 text-sm text-blue-200 hover:bg-blue-800/50"
                    >
                      <Play size={16} />
                      Publish now
                    </button>
                    <button
                      onClick={() => onQueue(d.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm hover:bg-neutral-800"
                    >
                      <Pause size={16} />
                      Re-queue
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onQueue(d.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm hover:bg-neutral-800"
                    >
                      <Send size={16} />
                      Queue
                    </button>
                    <button
                      onClick={() => onPublish(d.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-700/50 bg-blue-900/30 px-3 py-2 text-sm text-blue-200 hover:bg-blue-800/50"
                    >
                      <Play size={16} />
                      Publish now
                    </button>
                  </>
                )}

                <button
                  onClick={() => onDelete(d.id)}
                  className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm hover:bg-neutral-800"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChannelBadge({ channel }: { channel: Draft['channel'] }) {
  const map = {
    instagram: { icon: <Instagram size={14} />, label: 'Instagram', color: 'text-pink-300' },
    twitter: { icon: <Twitter size={14} />, label: 'Twitter/X', color: 'text-sky-300' },
    youtube: { icon: <Youtube size={14} />, label: 'YouTube', color: 'text-red-300' },
    linkedin: { icon: <Linkedin size={14} />, label: 'LinkedIn', color: 'text-blue-300' },
  } as const
  const c = map[channel]
  return (
    <span className={`inline-flex items-center gap-1 ${c.color}`}>
      {c.icon}
      {c.label}
    </span>
  )
}

function CreateTile({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-20 flex-col items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950/70 hover:bg-neutral-900"
    >
      {icon}
      <span className="text-xs text-neutral-300">{label}</span>
    </button>
  )
}
