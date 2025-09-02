import { useEffect } from 'react'

export function useReveal(selector = '[data-reveal]') {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(selector))
    if (els.length === 0) return

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-revealed')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 }
    )

    els.forEach((el) => {
      el.classList.add('reveal') // start hidden
      io.observe(el)
    })

    return () => io.disconnect()
  }, [selector])
}
