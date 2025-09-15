import React, { useEffect, useState } from 'react'
import { updateProfile, reload } from 'firebase/auth'
import { useUser } from '../auth/firebaseAuth'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export default function ProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, isLoaded } = useUser()
  const [displayName, setDisplayName] = useState('')
  const [photoURL, setPhotoURL] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (open && isLoaded) {
      setDisplayName((user as any)?.displayName || '')
      setPhotoURL((user as any)?.photoURL || '')
      setError(null)
      setSaved(false)
    }
  }, [open, isLoaded, user])

  if (!open) return null

  async function onSave() {
    if (!user) return
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      await updateProfile(user as any, { displayName: displayName || null as any, photoURL: photoURL || null as any })
      try { await reload(user as any) } catch {}
      setSaved(true)
    } catch (e: any) {
      setError(e?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    setError(null)
    try {
      const storage = getStorage()
      const path = `avatars/${(user as any).uid}/${Date.now()}-${file.name}`
      const r = ref(storage, path)
      await uploadBytes(r, file)
      const url = await getDownloadURL(r)
      setPhotoURL(url)
    } catch (e: any) {
      setError(e?.message || 'Failed to upload avatar')
    } finally {
      setUploading(false)
      // reset input value to allow re-uploading the same file if desired
      e.currentTarget.value = ''
    }
  }

  function onBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm"
      onMouseDown={onBackdrop}
    >
      <div className="w-full md:max-w-md rounded-t-2xl md:rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-xl" role="dialog" aria-modal>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Edit Profile</h2>
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-800 text-neutral-300 hover:bg-neutral-800"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-neutral-800 flex items-center justify-center">
              {photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoURL} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-neutral-400 text-sm">No photo</span>
              )}
            </div>
            <div className="text-sm text-neutral-400">
              <div className="text-neutral-200 font-medium">{(user as any)?.email}</div>
              <div className="text-xs">UID: {(user as any)?.uid}</div>
            </div>
          </div>

          <label className="block">
            <span className="block text-xs text-neutral-400 mb-1">Display name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder-neutral-500"
              placeholder="Your name"
            />
          </label>

          <label className="block">
            <span className="block text-xs text-neutral-400 mb-1">Photo URL</span>
            <input
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder-neutral-500"
              placeholder="https://..."
            />
          </label>

          <div>
            <span className="block text-xs text-neutral-400 mb-1">Upload new avatar</span>
            <input type="file" accept="image/*" onChange={onFileSelected} />
            {uploading && (
              <div className="mt-2 text-xs text-neutral-400">Uploading…</div>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}
          {saved && !error && (
            <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Profile updated</div>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="rounded-md border border-blue-700 bg-blue-600/90 px-3 py-2 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
            onClick={onSave}
            disabled={saving || uploading}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
