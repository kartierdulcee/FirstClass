import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './auth/firebaseAuth'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { ToastProvider } from './components/toast'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>
)
