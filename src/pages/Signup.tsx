import { SignUp } from '@clerk/clerk-react'

export default function Signup() {
  return (
    <div className="mx-auto max-w-sm pt-24">
      {/* Use new redirect prop to avoid deprecation warning */}
      <SignUp
        routing="path"
        path="/signup"
        afterSignUpUrl="/dashboard"
        signInUrl="/login"
      />
    </div>
  )
}
