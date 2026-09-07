import { useState } from 'react'
import { Mail, ArrowRight, Loader2 } from 'lucide-react'

export function BlogNewsletter() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); if (!email.trim()) return
    setState('loading'); setError('')
    try {
      const response = await fetch('/api/v1/newsletter-subscriptions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() }, body: JSON.stringify({ email }) })
      const body = await response.json() as { error?: { message?: string } }
      if (!response.ok) throw new Error(body.error?.message || 'Không thể đăng ký nhận tin.')
      setState('success')
    } catch (cause) { setState('error'); setError(cause instanceof Error ? cause.message : 'Không thể đăng ký nhận tin.') }
  }
  return <section id="newsletter" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><div className="overflow-hidden rounded-2xl border border-[#d9a441]/25 bg-gradient-to-r from-[#8d1216] to-[#d9a441] px-6 py-8 sm:px-10 sm:py-10"><div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between"><div className="text-center sm:text-left"><h2 className="font-heading text-xl font-bold text-white sm:text-2xl">Nhận tin mới nhất</h2><p className="mt-1 text-sm text-white/80">Đăng ký để cập nhật xu hướng và ưu đãi</p></div>{state === 'success' ? <p className="text-sm font-medium text-white" role="status">Cảm ơn bạn đã đăng ký!</p> : <form onSubmit={handleSubmit} className="w-full sm:w-auto"><div className="flex gap-2"><label className="relative flex-1 sm:w-64"><span className="sr-only">Email nhận tin</span><Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7c3f06]/50" aria-hidden="true" /><input type="email" placeholder="Email của bạn..." value={email} onChange={event => setEmail(event.target.value)} required className="h-11 w-full rounded-full border-0 bg-white pl-10 pr-4 text-sm text-[#7c3f06] placeholder-[#7c3f06]/40 focus:outline-none focus:ring-2 focus:ring-white/30 sm:text-base" /></label><button type="submit" disabled={state === 'loading'} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#d9a441] px-5 text-sm font-semibold text-white transition hover:bg-[#f7c948] hover:text-[#8d1216] disabled:cursor-wait disabled:opacity-60"><span>{state === 'loading' ? 'Đang gửi' : 'Đăng ký'}</span>{state === 'loading' ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}</button></div>{state === 'error' && <p className="mt-2 text-xs text-white" role="alert">{error}</p>}</form>}</div></div></section>
}
