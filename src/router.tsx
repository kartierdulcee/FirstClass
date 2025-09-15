import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import DashboardLayout from './layouts/DashboardLayout'
import AdminLayout from './layouts/AdminLayout'
import RequireAdmin from './auth/RequireAdmin'
import Protected from './auth/Protected'

import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'

import DashboardHome from './pages/dashboard/Home'
import Content from './pages/dashboard/Content'
import ContentLab from './pages/dashboard/ContentLab'
import Analytics from './pages/dashboard/Analytics'
import Settings from './pages/dashboard/Settings'

import AdminOverview from './pages/admin/Overview'
import AdminClients from './pages/admin/Clients'
import AdminRequests from './pages/admin/Requests'
import AdminSettings from './pages/admin/Settings'
import AdminClientDetail from './pages/admin/ClientDetail'
import AdminRequestDetail from './pages/admin/RequestDetail'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'sign-in', element: <Login /> },
      { path: 'signin', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'sign-up', element: <Signup /> },
      { path: 'onboarding', element: <Onboarding /> },
    ],
  },
  {
    path: '/dashboard',
    element: <Protected />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardHome /> },
          { path: 'content', element: <Content /> },
          { path: 'content-lab', element: <ContentLab /> },
          { path: 'analytics', element: <Analytics /> },
          { path: 'settings', element: <Settings /> },
          { path: '*', element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { index: true, element: <AdminOverview /> },
      { path: 'clients', element: <AdminClients /> },
      { path: 'clients/:id', element: <AdminClientDetail /> },
      { path: 'requests', element: <AdminRequests /> },
      { path: 'requests/:id', element: <AdminRequestDetail /> },
      { path: 'settings', element: <AdminSettings /> },
      { path: '*', element: <Navigate to="/admin" replace /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

// No default export; `router` is consumed in `src/main.tsx`.
