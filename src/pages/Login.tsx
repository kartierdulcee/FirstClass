import { auth } from './admin/FB'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'

export default function Login() {
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/dashboard'

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

  return (
    <div className="mx-auto max-w-sm pt-24">
      {error && (
        <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <button
        onClick={callSignIn}
        className="mt-4 inline-flex items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:shadow"
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
    </div>
  )
}
