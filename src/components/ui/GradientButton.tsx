import type { ReactNode } from 'react'

interface GradientButtonProps {
  children: ReactNode
  className?: string
  innerClassName?: string
  href?: string
}

export function GradientButton({ children, className = '', innerClassName = '', href = '#templates' }: GradientButtonProps) {
  return (
    <a href={href} className={`gradient-frame group inline-flex rounded-full p-[2px] ${className}`}>
      <span className={`flex h-full w-full items-center justify-center gap-2 rounded-full bg-[#fcfbf8] px-6 py-3 text-sm font-semibold text-[#8d1216] transition-colors group-hover:bg-white ${innerClassName}`}>
        {children}
      </span>
    </a>
  )
}
