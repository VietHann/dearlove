import { useState } from 'react'

/**
 * FloatingSupport — bottom-right floating chat bubble.
 *
 * A dismissible support widget that links to the Facebook page.
 * Uses an inline SVG icon so no external asset is needed.
 */
export function FloatingSupport() {
  const [open, setOpen] = useState(true)

  if (!open) return null

  return (
    <div className="pointer-events-none fixed bottom-24 left-0 right-0 z-40 mx-auto flex w-full items-end justify-end px-4 md:bottom-20 md:px-8">
      <div className="floating-support-bubble pointer-events-auto relative">
        {/* Speech bubble */}
        <div className="absolute right-[calc(100%+12px)] top-4 w-max max-w-[250px] rounded-lg bg-white px-3 py-3 shadow-2xl ring-1 ring-black/5 md:max-w-[280px]">
          <p className="text-xs leading-relaxed text-gray-700 md:text-sm">
            Bạn cần tư vấn gói dịch vụ phù hợp? Liên hệ ngay để được hỗ trợ!
          </p>
          <span
            aria-hidden="true"
            className="absolute -right-[7px] top-1/2 z-0 h-[14px] w-[14px] -translate-y-1/2 rotate-45 rounded-[2px] bg-white"
          />
          <button
            type="button"
            aria-label="Đóng"
            onClick={() => setOpen(false)}
            className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            ×
          </button>
        </div>

        {/* Support icon link */}
        <a
          href="https://fb.com/zenlove.me"
          target="_blank"
          rel="noreferrer"
          aria-label="Liên hệ hỗ trợ"
          className="block transition hover:opacity-90 active:scale-95"
        >
          {/* Messenger-style support icon — inline SVG, no external asset needed */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 120 120"
            className="floating-support-bubble img"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#e54153" />
                <stop offset="100%" stopColor="#f26b76" />
              </linearGradient>
              <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00B2FF" />
                <stop offset="100%" stopColor="#0090E7" />
              </linearGradient>
            </defs>
            {/* Outer ring */}
            <circle cx="60" cy="60" r="56" fill="url(#bg)" />
            {/* White circle */}
            <circle cx="60" cy="60" r="48" fill="white" />
            {/* Messenger chat bubble */}
            <rect x="24" y="32" width="72" height="50" rx="16" fill="url(#bg)" />
            {/* Chat bubble tail */}
            <path d="M46 82 L38 100 L56 82 Z" fill="url(#bg)" />
            {/* Chat dots */}
            <circle cx="45" cy="57" r="5" fill="white" />
            <circle cx="60" cy="57" r="5" fill="white" />
            <circle cx="75" cy="57" r="5" fill="white" />
          </svg>
        </a>
      </div>
    </div>
  )
}
