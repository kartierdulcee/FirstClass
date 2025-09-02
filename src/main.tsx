import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ToastProvider } from './components/toast'
import './index.css'

// 👇 Load Clerk publishable key from .env.local
const pk = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string
const frontendApi = import.meta.env.VITE_CLERK_FRONTEND_API as string | undefined

if (!pk) {
  throw new Error(
    'Missing VITE_CLERK_PUBLISHABLE_KEY. Set it in a .env.local at the project root.'
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={pk}
      // If provided, this forces Clerk to use the specified
      // Frontend API domain (handy to bypass a misconfigured
      // custom domain).
      frontendApi={frontendApi}
      routerPush={(to) => router.navigate(to)}
      routerReplace={(to) => router.navigate(to, { replace: true })}
    >
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </ClerkProvider>
  </React.StrictMode>
)
