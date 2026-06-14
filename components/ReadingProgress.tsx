'use client'

import { useEffect, useState } from 'react'

export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div className="reading-progress" aria-hidden="true">
      <div className="reading-progress__bar" style={{ transform: `scaleX(${progress})` }} />
      <style>{`
        .reading-progress {
          position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 60;
          background: transparent; pointer-events: none;
        }
        .reading-progress__bar {
          height: 100%; width: 100%; transform-origin: left center;
          background: linear-gradient(to right, #facc15, #fde047);
          transition: transform 0.08s linear;
        }
      `}</style>
    </div>
  )
}
