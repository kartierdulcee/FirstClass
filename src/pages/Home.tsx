// src/pages/Home.tsx
import { Link, Navigate } from 'react-router-dom'
import { Instagram, Twitter, Youtube, Globe } from 'lucide-react'
import { SignedIn, SignedOut } from '../auth/firebaseAuth'

import Benefits from '../sections/Benefits'
import Services from '../sections/Services'
import Pricing from '../sections/Pricing'
import Testimonials from '../sections/Testimonials'
import ArrowDivider from '../components/ArrowDivider'
import { useReveal } from '../hooks/useReveal'

// NOTE: Name this component LandingPage (not Home) to avoid any confusion
// with src/pages/dashboard/Home.tsx
function LandingPage() {
  useReveal()

  return (
    <>
      {/* If already signed in, skip landing page */}
      <SignedIn>
        <Navigate to="/dashboard" replace />
      </SignedIn>
      {/* HERO */}
      <section className="relative min-h-[60dvh] flex flex-col items-center justify-start text-center pt-32">
        {/* Subtle animated glow behind the headline */}
        <div className="hero-glow" aria-hidden="true">
          <div className="blue-glow" />
        </div>

        <div className="max-w-3xl mx-auto px-4">
          {/* What’s new pill */}
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-neutral-800/70 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-300"
            data-reveal
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand))]" />
            Done-for-you content ops
          </div>

          {/* Headline */}
          <h1
            className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight"
            data-reveal
          >
            <span className="font-serif italic text-neutral-300">Send us your raw content.</span>
            <span className="mx-2">We handle the rest.</span>
          </h1>

          {/* Subcopy */}
          <p className="mt-4 text-neutral-300" data-reveal>
            We run your entire content process end to end — planning, captions, editing, design,
            publishing, and follow-ups across every channel. You focus on your business; we deliver
            consistent, on-brand content that compounds.
          </p>

          {/* Primary CTA */}
          <div className="mt-6 flex items-center justify-center gap-3" data-reveal>
            <SignedIn>
              <Link
                to="/dashboard"
                className="rounded-2xl px-5 py-2.5 bg-gradient-to-r from-[#0374FF] to-[#0a5ce0] text-white font-semibold border border-neutral-800 shadow-[0_0_25px_rgba(3,116,255,.3)]"
              >
                Go to Dashboard
              </Link>
            </SignedIn>

            <SignedOut>
              <Link
                to="/onboarding"
                className="rounded-2xl px-5 py-2.5 bg-gradient-to-r from-[#0374FF] to-[#0a5ce0] text-white font-semibold border border-neutral-800 shadow-[0_0_25px_rgba(3,116,255,.3)]"
              >
                Get Content Done For You
              </Link>
            </SignedOut>
          </div>

          {/* Socials */}
          <div className="mt-8 flex items-center justify-center gap-4 text-neutral-400" data-reveal>
            <a href="#" aria-label="Website"><Globe size={18} /></a>
            <a href="#" aria-label="Twitter"><Twitter size={18} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="#" aria-label="YouTube"><Youtube size={18} /></a>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <Benefits />

      {/* Arrow divider */}
      <ArrowDivider />

      {/* SERVICES */}
      <Services />

      {/* PRICING */}
      <Pricing />

      {/* TESTIMONIALS */}
      <Testimonials />
    </>
  )
}

export default LandingPage
