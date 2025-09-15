import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { auth } from './admin/FB'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'

export default function Signup() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/dashboard'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      if (name) {
        try { await updateProfile(cred.user, { displayName: name }) } catch {}
      }
      nav(redirect)
    } catch (e: any) {
      setError(e?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm pt-24">
      <h1 className="text-xl font-semibold text-center">Create your account</h1>
      {error && (
        <div className="mt-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      <form onSubmit={onSignup} className="mt-4 space-y-3 rounded-lg border border-neutral-800/70 bg-neutral-950/60 p-4">
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Name (optional)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white" />
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white" />
        </div>
        <button type="submit" disabled={loading} className="w-full rounded-md border border-blue-700 bg-blue-600/90 px-3 py-2 text-sm text-white hover:bg-blue-600 disabled:opacity-50">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
        <div className="text-xs text-neutral-400 text-center">
          Already have an account? <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-neutral-200 underline">Sign in</Link>
        </div>
      </form>
    </div>
  )
}
