import { auth } from './admin/FB'
import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { signInWithPopup, GoogleAuthProvider, OAuthProvider, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'

export default function Login() {
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/dashboard'
  const [message, setMessage] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function callSignIn() {
    setError(null)
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      nav(redirect)
    } catch (e: any) {
      setError(e?.message || 'Sign-in failed')
    }
  }

  async function callAppleSignIn() {
    setError(null)
    try {
      const provider = new OAuthProvider('apple.com')
      try { provider.addScope('email'); provider.addScope('name') } catch {}
      await signInWithPopup(auth, provider)
      nav(redirect)
    } catch (e: any) {
      setError(e?.message || 'Apple sign-in failed')
    }
  }

  async function onEmailPasswordSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      nav(redirect)
    } catch (e: any) {
      setError(e?.message || 'Sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  async function onForgotPassword() {
    setError(null)
    setMessage(null)
    if (!email) {
      setError('Enter your email above to reset your password.')
      return
    }
    try {
      await sendPasswordResetEmail(auth, email)
      setMessage('Password reset email sent. Check your inbox.')
    } catch (e: any) {
      setError(e?.message || 'Failed to send reset email')
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
        <h1 className="mb-3 text-center text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mb-4 text-center text-neutral-400 text-sm">Sign in to continue</p>

        {error && (
          <div className="mb-3 rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-3 rounded-md border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            {message}
          </div>
        )}

        <form onSubmit={onEmailPasswordSignIn} className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 backdrop-blur-sm shadow-[0_0_60px_rgba(3,116,255,.12)]">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-neutral-700/80 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-[hsl(var(--brand))] focus:ring-2 focus:ring-[hsl(var(--brand))]/40"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-neutral-700/80 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-[hsl(var(--brand))] focus:ring-2 focus:ring-[hsl(var(--brand))]/40"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
            className="rounded-lg bg-[hsl(var(--brand))] px-4 py-2 text-sm font-medium text-white shadow hover:opacity-95 disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <button type="button" onClick={onForgotPassword} className="text-xs text-neutral-400 hover:text-neutral-200">
              Forgot password?
            </button>
          </div>
        <div className="text-xs text-neutral-400">
          Don’t have an account?{' '}
          <Link to={`/signup?redirect=${encodeURIComponent(redirect)}`} className="text-neutral-200 underline">Sign up</Link>
        </div>
        </form>

        {/* Divider */}
        <div className="mt-4 flex items-center gap-3 text-xs text-neutral-500">
          <div className="h-px flex-1 bg-neutral-800" />
          <span>or</span>
          <div className="h-px flex-1 bg-neutral-800" />
        </div>

        <button
          onClick={callSignIn}
          className="mt-4 inline-flex w-full items-center justify-center gap-3 rounded-lg bg-white/95 px-4 py-2 text-sm font-medium text-gray-800 shadow hover:bg-white"
          aria-label="Sign in with Google"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="h-5 w-5"
            aria-hidden
          >
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.602 31.91 29.197 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.869 5.041 29.702 3 24 3 12.955 3 4 11.955 4 23s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/>
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.814C14.413 16.108 18.853 13 24 13c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.869 5.041 29.702 3 24 3 16.318 3 9.656 7.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 43c5.137 0 9.73-1.977 13.191-5.191l-6.086-5.158C29.02 34.861 26.7 36 24 36c-5.176 0-9.571-3.066-11.292-7.43l-6.53 5.027C9.5 39.632 16.195 43 24 43z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.01 2.91-3.215 5.243-6.198 6.566l.003-.002 6.086 5.158C33.606 40.176 38.5 37 41.5 32.5c2-3 2.111-7.167 2.111-12.417z"/>
          </svg>
          <span>Sign in with Google</span>
        </button>

        <button
          onClick={callAppleSignIn}
          className="mt-3 inline-flex w-full items-center justify-center gap-3 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white shadow hover:bg-black/90 border border-white/10"
          aria-label="Sign in with Apple"
        >
          {/* Apple logo */}
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
            <path fill="currentColor" d="M16.365 1.43c.01 1.02-.386 1.916-1.088 2.66-.817.86-1.8 1.37-2.898 1.29-.116-1.01.37-2.03 1.058-2.73.82-.85 1.96-1.41 2.928-1.22zm4.053 16.38c-.54 1.24-1.18 2.42-2.12 3.47-.8.9-1.77 2.01-3.08 2.03-1.22.02-1.61-.79-3.3-.79-1.69 0-2.13.77-3.37.81-1.36.05-2.39-1.21-3.2-2.11-1.74-1.94-3.1-4.93-2.59-7.7.28-1.49 1.14-2.88 2.47-3.67 1.07-.64 2.5-1.03 3.74-.8.51.09.97.3 1.41.52.42.21.91.45 1.41.44.45-.01.89-.23 1.31-.43.55-.26 1.12-.52 1.74-.59 1.61-.2 3.13.42 4.18 1.6-1.57.93-2.49 2.43-2.47 4.2.02 1.67.88 3.2 2.27 4.02.27.16.56.3.86.4-.08.22-.16.44-.25.66z"/>
          </svg>
          <span>Sign in with Apple</span>
        </button>
      </div>
    </div>
  )
}
