import { BookOpen } from 'lucide-react'
import type { PricingPlan } from '../pages/pricing/pricingData'
import type { BlogPost } from '../pages/blog/blogData'

export interface ApiPricingPlan {
  id: string
  slug: string
  name: string
  priceLabel: string
  originalPriceLabel: string | null
  description: string | null
  payload: Record<string, unknown>
  position: number
  status: string
}

export interface ApiBlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  category: { id: string; slug: string; name: string } | null
  author: { id: string; name: string }
  coverUrl: string | null
  status: string
  publishedAt: number | null
  seoTitle: string | null
  seoDescription: string | null
}

export function getPublicPricing() {
  return fetch('/api/v1/pricing', { headers: { Accept: 'application/json' } }).then(async response => { if (!response.ok) throw new Error('Không thể tải bảng giá.'); return response.json() as Promise<{ data: { items: ApiPricingPlan[] } }> })
}

export function getPublicBlog() {
  return fetch('/api/v1/blog', { headers: { Accept: 'application/json' } }).then(async response => { if (!response.ok) throw new Error('Không thể tải blog.'); return response.json() as Promise<{ data: { items: ApiBlogPost[] } }> })
}

export function toPricingPlan(plan: ApiPricingPlan, index: number): PricingPlan {
  const payload = plan.payload || {}
  return {
    id: (['free', 'basic', 'premium'].includes(plan.slug) ? plan.slug : `custom-${index}`) as PricingPlan['id'],
    name: plan.name,
    priceLabel: plan.priceLabel,
    originalPriceLabel: plan.originalPriceLabel || undefined,
    ctaLabel: typeof payload.ctaLabel === 'string' ? payload.ctaLabel : 'Liên hệ Dearlove',
    featured: Boolean(payload.featured),
    ribbon: typeof payload.ribbon === 'string' ? payload.ribbon : undefined,
    discountBadge: typeof payload.discountBadge === 'string' ? payload.discountBadge : undefined,
    countdown: undefined,
    priceColorClass: typeof payload.priceColorClass === 'string' ? payload.priceColorClass : 'text-[#8d1216]',
    limits: Array.isArray(payload.limits) ? payload.limits.filter(item => item && typeof item === 'object').map(item => ({ label: String((item as Record<string, unknown>).label || ''), value: String((item as Record<string, unknown>).value || '') })) : [],
    features: Array.isArray(payload.features) ? payload.features.filter(item => item && typeof item === 'object').map(item => ({ label: String((item as Record<string, unknown>).label || ''), included: Boolean((item as Record<string, unknown>).included) })) : [],
    footerNote: plan.description || undefined,
  }
}

export function toBlogPost(post: ApiBlogPost, index: number): BlogPost {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt || '',
    category: { id: post.category?.slug || 'all', name: post.category?.name || 'Dearlove', icon: BookOpen },
    image: post.coverUrl || '/favicon_io/android-chrome-512x512.png',
    author: { name: post.author.name, avatar: '/favicon_io/android-chrome-192x192.png', role: 'Dearlove' },
    publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    readTime: Math.max(1, Math.ceil(post.content.split(/\s+/).length / 180)),
    tags: [],
    slug: post.slug,
  }
}
