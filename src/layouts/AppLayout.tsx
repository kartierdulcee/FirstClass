import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import FounderBanner from '../components/FounderBanner'

export default function AppLayout() {
  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Background glow / vignette */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 [background:radial-gradient(60%_40%_at_50%_0%,rgba(3,116,255,.25),transparent_60%)]" />
        <div className="absolute inset-0 [background:radial-gradient(40%_30%_at_80%_20%,rgba(255,255,255,.06),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,.0),rgba(0,0,0,.6)_70%)]" />
      </div>

      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <Outlet />
        </div>
      </main>
      <footer className="border-t border-neutral-800 py-6 text-center text-neutral-400">
        © {new Date().getFullYear()} FirstClass AI — Automations for creators & brands
      </footer>
      <FounderBanner />
    </div>
  )
}
