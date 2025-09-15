import { Link } from 'react-router-dom'

export default function Signup() {
  return (
    <div className="mx-auto max-w-sm pt-24 text-center">
      <h1 className="text-xl font-semibold">Create your account</h1>
      <p className="mt-2 text-sm text-neutral-400">Use Google to continue.</p>
      <Link
        to="/login"
        className="mt-5 inline-flex items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
      >
        Go to Sign In
      </Link>
    </div>
  )
}
