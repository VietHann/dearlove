import type { ReactNode } from 'react'

interface HeadingProps {
  eyebrow: string
  children: ReactNode
}

export function Heading({ eyebrow, children }: HeadingProps) {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <div className="flex items-center justify-center gap-3">
        <span className="h-px w-12 bg-[#d9a441]" />
        <p className="eyebrow">{eyebrow}</p>
        <span className="h-px w-12 bg-[#d9a441]" />
      </div>
      <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-.045em] text-[#8d1216] sm:text-5xl lg:text-6xl">{children}</h2>
    </div>
  )
}