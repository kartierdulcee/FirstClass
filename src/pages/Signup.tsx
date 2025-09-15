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
    <div className="relative py-20">
      {/* Local blue glow behind the auth card */}
      <div className="pointer-events-none absolute inset-0 -z-10 grid place-items-center">
        <div className="h-80 w-80 rounded-full blur-3xl opacity-70"
             style={{ background: 'radial-gradient(closest-side, rgba(3,116,255,.35), transparent 70%)' }} />
      </div>

      <div className="mx-auto max-w-sm">
        <h1 className="text-2xl font-semibold text-center">Create your account</h1>
        <p className="mt-1 text-center text-neutral-400 text-sm">Start your content workflow</p>
        {error && (
          <div className="mt-3 rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>
        )}
        <form onSubmit={onSignup} className="mt-4 space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 backdrop-blur-sm shadow-[0_0_60px_rgba(3,116,255,.12)]">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Name (optional)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border border-neutral-700/80 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-[hsl(var(--brand))] focus:ring-2 focus:ring-[hsl(var(--brand))]/40" />
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-neutral-700/80 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-[hsl(var(--brand))] focus:ring-2 focus:ring-[hsl(var(--brand))]/40" />
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-neutral-700/80 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-[hsl(var(--brand))] focus:ring-2 focus:ring-[hsl(var(--brand))]/40" />
          </div>
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-[hsl(var(--brand))] px-4 py-2 text-sm font-medium text-white shadow hover:opacity-95 disabled:opacity-50">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
        <div className="text-xs text-neutral-400 text-center">
          Already have an account? <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-neutral-200 underline">Sign in</Link>
        </div>
        </form>
      </div>
    </div>
  )
}
