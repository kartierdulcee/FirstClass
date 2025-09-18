import { useMemo, useState, type FormEvent } from 'react'

interface ClipSummary {
  clip_number: number
  start_time: number
  end_time: number
  duration: number
  virality_score: number
  text_preview: string
  source_video: string
  file_name: string
  download_url: string
}

interface VideoMetadata {
  title?: string
  uploader?: string
  duration?: number
  [key: string]: unknown
}

interface ProcessResponse {
  job_id: string
  status_message: string
  metadata: VideoMetadata
  clips: ClipSummary[]
  expires_in_seconds: number
}

const INPUT_LABEL_UPLOAD = 'Upload Video File'
const INPUT_LABEL_YOUTUBE = 'YouTube URL'

function secondsLabel(value: number): string {
  if (!Number.isFinite(value)) return '—'
  if (value < 60) return `${value.toFixed(1)}s`
  const minutes = Math.floor(value / 60)
  const seconds = value % 60
  return `${minutes}m ${seconds.toFixed(0)}s`
}

export default function VideoClipper() {
  const apiBase = useMemo(() => {
    const raw = import.meta.env.VITE_VIDEO_CLIPPER_URL as string | undefined
    if (!raw) return ''
    return raw.endsWith('/') ? raw.slice(0, -1) : raw
  }, [])

  const [inputType, setInputType] = useState<'upload' | 'youtube'>('upload')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [clipDuration, setClipDuration] = useState(30)
  const [numClips, setNumClips] = useState(3)
  const [addSubtitles, setAddSubtitles] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [clips, setClips] = useState<ClipSummary[]>([])
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [expiresIn, setExpiresIn] = useState<number | null>(null)

  const configured = Boolean(apiBase)

  const resetOutputs = () => {
    setClips([])
    setMetadata(null)
    setStatusMessage(null)
    setJobId(null)
    setExpiresIn(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setStatusMessage('Preparing request...')
    setIsSubmitting(true)

    try {
      if (!configured) throw new Error('Video clipper API is not configured.')

      const form = new FormData()
      form.append('input_type', inputType === 'upload' ? INPUT_LABEL_UPLOAD : INPUT_LABEL_YOUTUBE)
      form.append('clip_duration', String(clipDuration))
      form.append('num_clips', String(numClips))
      form.append('add_subtitles', addSubtitles ? 'true' : 'false')

      if (inputType === 'upload') {
        if (!videoFile) throw new Error('Please choose a video file to upload.')
        form.append('video_file', videoFile)
      } else {
        if (!youtubeUrl.trim()) throw new Error('Please enter a YouTube URL.')
        form.append('youtube_url', youtubeUrl.trim())
      }

      const response = await fetch(`${apiBase}/api/process`, {
        method: 'POST',
        body: form,
      })

      const payload = (await response.json().catch(() => ({}))) as Partial<ProcessResponse> & {
        detail?: string
      }

      if (!response.ok) {
        throw new Error(payload?.detail || 'Failed to generate clips. Please try again.')
      }

      setStatusMessage(payload.status_message || 'Clips generated successfully.')
      setClips(payload.clips || [])
      setMetadata(payload.metadata || null)
      setJobId(payload.job_id || null)
      setExpiresIn(payload.expires_in_seconds ?? null)
    } catch (error) {
      resetOutputs()
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onFileChange = (fileList: FileList | null) => {
    const first = fileList?.[0] ?? null
    setVideoFile(first)
  }

  const anyClips = clips.length > 0

  return (
    <div className="space-y-6 text-neutral-100">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold text-white">AI Video Clipper</h2>
        <p className="text-sm text-neutral-400">
          Transform long-form recordings into short, vertical highlights without leaving the dashboard.
        </p>
      </header>

      {!configured ? (
        <div className="glass-panel border border-dashed border-sky-500/20 p-6 text-sm text-neutral-300/80">
          <p className="font-medium">Configuration required</p>
          <p className="mt-2 text-neutral-400">
            Set <code>VITE_VIDEO_CLIPPER_URL</code> in your client environment to the public base URL of the deployed
            clipper service (for example <code>https://your-domain.onrender.com</code>), then restart the dashboard.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
          <form
            onSubmit={handleSubmit}
            className="glass-panel space-y-6 p-6 sm:p-8"
          >
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-200">Source</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <label
                  className={`glass-toggle p-3 text-sm transition ${
                    inputType === 'upload'
                      ? 'glass-toggle--active text-white'
                      : 'text-neutral-300 hover:border-sky-400/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="clip-source"
                    value="upload"
                    className="hidden"
                    checked={inputType === 'upload'}
                    onChange={() => {
                      setInputType('upload')
                      setYoutubeUrl('')
                      resetOutputs()
                    }}
                  />
                  <span className="font-medium">Upload video</span>
                  <p className="mt-1 text-xs text-neutral-300/70">MP4, MOV, AVI, MKV, WebM up to ~2 hours.</p>
                </label>
                <label
                  className={`glass-toggle p-3 text-sm transition ${
                    inputType === 'youtube'
                      ? 'glass-toggle--active text-white'
                      : 'text-neutral-300 hover:border-sky-400/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="clip-source"
                    value="youtube"
                    className="hidden"
                    checked={inputType === 'youtube'}
                    onChange={() => {
                      setInputType('youtube')
                      setVideoFile(null)
                      resetOutputs()
                    }}
                  />
                  <span className="font-medium">YouTube URL</span>
                  <p className="mt-1 text-xs text-neutral-300/70">Public or unlisted links, up to 60 minutes.</p>
                </label>
              </div>
            </div>

            {inputType === 'upload' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-200">Video file</label>
                <div className="glass-panel flex h-32 flex-col items-center justify-center gap-2 border border-transparent p-4 text-center text-neutral-200">
                  <input
                    type="file"
                    accept="video/mp4,video/mpeg,video/quicktime,video/x-matroska,video/webm"
                    onChange={(event) => onFileChange(event.target.files)}
                    className="block text-sm text-neutral-100 file:mr-3 file:rounded-lg file:border file:border-slate-500/60 file:bg-slate-900/70 file:px-3 file:py-2 file:text-sm file:text-sky-100 file:hover:border-sky-400"
                  />
                  <p className="text-xs text-neutral-300/75">
                    {videoFile ? videoFile.name : 'Choose a file to process. Audio-focused videos work best.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-200">YouTube URL</label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(event) => setYoutubeUrl(event.target.value)}
                  className="glass-input w-full px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
                />
                <p className="text-xs text-neutral-500">
                  Supports <code>youtube.com/watch</code>, <code>youtu.be</code>, and <code>youtube.com/embed</code> formats.
                </p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="glass-chip space-y-2 p-4 text-sm text-neutral-200">
                <span className="flex items-center justify-between">
                  <span>Clip duration</span>
                  <span className="text-xs text-neutral-400">{clipDuration}s</span>
                </span>
                <input
                  type="range"
                  min={15}
                  max={90}
                  step={5}
                  value={clipDuration}
                  onChange={(event) => setClipDuration(Number(event.target.value))}
                  className="w-full accent-sky-400"
                />
                <p className="text-xs text-neutral-300/70">Sweet spot for short-form is 25–65 seconds.</p>
              </label>

              <label className="glass-chip space-y-2 p-4 text-sm text-neutral-200">
                <span className="flex items-center justify-between">
                  <span># of clips</span>
                  <span className="text-xs text-neutral-400">{numClips}</span>
                </span>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={numClips}
                  onChange={(event) => setNumClips(Number(event.target.value))}
                  className="w-full accent-sky-400"
                />
                <p className="text-xs text-neutral-300/70">We cap at five to keep processing time reasonable.</p>
              </label>
            </div>

            <label className="glass-chip flex items-center gap-3 p-3 text-sm text-neutral-200">
              <input
                type="checkbox"
                checked={addSubtitles}
                onChange={(event) => setAddSubtitles(event.target.checked)}
                className="h-4 w-4 cursor-pointer accent-sky-500"
              />
              <div className="space-y-1">
                <span className="block font-medium">Auto subtitles with emoji emphasis</span>
                <span className="block text-xs text-neutral-500">
                  Toggle off if you already apply branded captions downstream.
                </span>
              </div>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-glass flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold"
            >
              {isSubmitting && <span className="h-2 w-2 animate-ping rounded-full bg-slate-900" />}
              {isSubmitting ? 'Generating clips…' : 'Generate clips'}
            </button>

            <div className="glass-chip p-3 text-xs text-neutral-300/80">
              <p className="font-medium text-neutral-200">Production tips</p>
              <ul className="mt-2 space-y-1 list-inside list-disc">
                <li>Clear speech and consistent pacing improve transcription accuracy.</li>
                <li>For YouTube, ensure the video is public or unlisted and not age restricted.</li>
                <li>Clips older than two hours are automatically purged from the service.</li>
              </ul>
            </div>
          </form>

          <section className="glass-panel space-y-4 p-6 sm:p-8">
            <header className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Results</h3>
                <p className="text-xs text-neutral-500">
                  {jobId && expiresIn
                    ? `Job #${jobId.slice(0, 8)} • clips expire in ${(expiresIn / 3600).toFixed(1)}h`
                    : 'Run the clipper to populate results.'}
                </p>
              </div>
            </header>

            {errorMessage && (
              <div className="glass-chip border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">
                {errorMessage}
              </div>
            )}

            {statusMessage && !errorMessage && (
              <div className="glass-chip border border-sky-500/40 bg-sky-500/10 p-3 text-sm text-sky-100">
                {statusMessage}
              </div>
            )}

            {metadata && (
              <div className="glass-chip grid gap-3 p-4 text-sm text-neutral-200">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Title</span>
                  <span className="font-medium text-white">{metadata.title || '—'}</span>
                </div>
                {metadata.uploader && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Uploader</span>
                    <span>{metadata.uploader}</span>
                  </div>
                )}
                {metadata.duration && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Duration</span>
                    <span>{secondsLabel(Number(metadata.duration))}</span>
                  </div>
                )}
              </div>
            )}

            {anyClips ? (
              <div className="space-y-4">
                {clips.map((clip) => (
                  <article
                    key={clip.file_name}
                    className="glass-panel overflow-hidden border border-transparent"
                  >
                    <video
                      controls
                      preload="metadata"
                      className="aspect-[9/16] w-full bg-black"
                      src={clip.download_url}
                    />
                    <div className="space-y-3 p-4 text-sm text-neutral-200">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Clip #{clip.clip_number}</span>
                        <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-xs text-sky-200">
                          Virality {clip.virality_score.toFixed(2)} / 10
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400">
                        {secondsLabel(clip.start_time)} → {secondsLabel(clip.end_time)} • {secondsLabel(clip.duration)}
                      </p>
                      <p className="text-sm text-neutral-300">{clip.text_preview}</p>
                      <div className="flex items-center justify-between text-xs text-neutral-300">
                        <span>{clip.source_video}</span>
                        <a
                          href={clip.download_url}
                          download={clip.file_name}
                          className="glass-chip border border-sky-500/40 px-3 py-1 text-xs text-sky-100 transition hover:border-sky-300/60"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="glass-panel flex h-64 flex-col items-center justify-center gap-3 border border-dashed border-sky-500/15 text-center text-neutral-300/70">
                <span className="text-sm">No clips yet.</span>
                <p className="max-w-xs text-xs text-neutral-500">
                  Submit a video or YouTube URL to generate highlights. We&apos;ll list them here once ready.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
