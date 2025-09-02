import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ToastProvider } from './components/toast'
import './index.css'

// 👇 Load Clerk publishable key from .env.local
const pk = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string

if (!pk) {
  throw new Error(
    'Missing VITE_CLERK_PUBLISHABLE_KEY. Set it in a .env.local at the project root.'
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={pk}
      routerPush={(to) => router.navigate(to)}
      routerReplace={(to) => router.navigate(to, { replace: true })}
    >
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </ClerkProvider>
  </React.StrictMode>
)
