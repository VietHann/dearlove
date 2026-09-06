import type { ReactNode } from 'react'

interface DarkButtonProps {
  children: ReactNode
  className?: string
  href?: string
}

export function DarkButton({ children, className = '', href = '/templates' }: DarkButtonProps) {
  return (
    <a href={href} className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#8d1216] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#7c3f06] ${className}`}>
      {children}
    </a>
  )
}