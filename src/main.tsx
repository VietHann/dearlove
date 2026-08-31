import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// ── DEBUG instrumentation (temporary) ────────────────────────────────────────
// #region agent log
const sendLog = (location: string, message: string, data: Record<string, unknown>, hypothesisId: string) => {
  fetch('http://127.0.0.1:7844/ingest/b61ad20c-b717-4f4c-88c8-36e318e577ed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'a77e2d' },
    body: JSON.stringify({
      sessionId: 'a77e2d',
      location,
      message,
      data,
      timestamp: Date.now(),
      hypothesisId,
      runId: 'post-fix-accordion',
    }),
  }).catch(() => {})
}

// Capture unhandled runtime errors
window.addEventListener('error', (ev) => {
  sendLog('window:error', 'unhandled error', {
    msg: ev.message,
    filename: ev.filename,
    lineno: ev.lineno,
    colno: ev.colno,
    stack: ev.error ? (ev.error.stack || '').slice(0, 1500) : null,
  }, 'H0')
})
window.addEventListener('unhandledrejection', (ev) => {
  const reason: any = ev.reason
  sendLog('window:unhandledrejection', 'unhandled promise rejection', {
    msg: reason?.message || String(reason),
    stack: reason?.stack ? String(reason.stack).slice(0, 1500) : null,
  }, 'H0')
})

// Hook console.error to catch React render errors
const _origConsoleError = console.error
console.error = (...args: unknown[]) => {
  sendLog('console.error', 'console.error called', {
    args: args.map(a => {
      try {
        if (a instanceof Error) return { msg: a.message, stack: (a.stack || '').slice(0, 1500) }
        if (typeof a === 'string') return a.slice(0, 500)
        return JSON.stringify(a).slice(0, 500)
      } catch { return '[unserializable]' }
    }),
  }, 'H0')
  _origConsoleError.apply(console, args)
}

function debugProbe() {
  // H1: Check computed opacity of templates section
  const section = document.getElementById('templatesSection')
  if (section) {
    const cs = getComputedStyle(section)
    sendLog('main.tsx:probe', 'templatesSection computed style', {
      opacity: cs.opacity,
      transform: cs.transform,
      classList: section.className,
      hasJsReveal: section.classList.contains('js-reveal'),
      hasIsVisible: section.classList.contains('is-visible'),
    }, 'H1')
  } else {
    sendLog('main.tsx:probe', 'templatesSection NOT FOUND', {
      bodyChildren: document.body.children.length,
      rootHTML: document.getElementById('root')?.innerHTML?.slice(0, 200) || '<empty>',
    }, 'H1')
  }

  // H5: Check if React rendered anything at all
  const root = document.getElementById('root')
  sendLog('main.tsx:probe', 'root contents', {
    rootChildCount: root?.children.length ?? -1,
    rootInnerLen: root?.innerHTML.length ?? 0,
    bodyLen: document.body.innerHTML.length,
  }, 'H5')

  // H2: Check html class
  sendLog('main.tsx:probe', 'html classes after load', {
    htmlClass: document.documentElement.className,
    hasLenisEnabled: document.documentElement.classList.contains('lenis-enabled'),
    hasLenisActive: document.documentElement.classList.contains('lenis-active'),
    computedScrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
  }, 'H2')

  // H3: Check all ScrollReveal motion.div opacity after small delay
  setTimeout(() => {
    const motionDivs = document.querySelectorAll('[data-scroll-reveal], .motion-safe, [style*="opacity"]')
    const visibleStates: Array<{ tag: string; opacity: string; transform: string }> = []
    motionDivs.forEach((el, i) => {
      if (i > 20) return
      const cs = getComputedStyle(el as HTMLElement)
      if (parseFloat(cs.opacity) < 1) {
        visibleStates.push({
          tag: (el as HTMLElement).tagName + '.' + ((el as HTMLElement).className || '').slice(0, 60),
          opacity: cs.opacity,
          transform: cs.transform.slice(0, 80),
        })
      }
    })
    sendLog('main.tsx:probe', 'elements with opacity<1 after 800ms', {
      count: visibleStates.length,
      samples: visibleStates.slice(0, 5),
    }, 'H3')
  }, 800)
}
// #endregion agent log

// ── Lenis smooth scroll ──────────────────────────────────────────────────────
// Initialize Lenis globally and drive it via requestAnimationFrame.
// This keeps Framer Motion scroll reads in sync with Lenis without conflicts.
function initLenis() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) return

  import('lenis').then(({ default: Lenis }) => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })

    // Signal CSS that Lenis is in control — disables native scroll-behavior
    document.documentElement.classList.add('lenis-enabled')

    // Expose on window so any code can call lenis.scrollTo(...)
    ;(window as any).__lenis = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)
  })
}

// Run debug probe after DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', debugProbe)
} else {
  debugProbe()
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Init after render so DOM is ready
initLenis()
