import { SignIn } from '@clerk/clerk-react'

export default function Login() {
  return (
    <div className="mx-auto max-w-sm pt-24">
      {/* Use new redirect prop to avoid deprecation warning */}
      <SignIn
        routing="path"
        path="/login"
        forceRedirectUrl="/dashboard"
        signUpUrl="/signup"
      />
    </div>
  )
}
