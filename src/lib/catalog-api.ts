import { adminApi } from './admin-api'

export interface CatalogCategory {
  id: string
  slug: string
  name: string
  description: string | null
  position: number
  status: string
  templateCount: number
  createdAt: number
  updatedAt: number
}

export interface CatalogTemplate {
  id: string
  slug: string
  name: string
  categoryId: string
  categoryName: string | null
  description: string | null
  accessTier: string
  priceLabel: string | null
  status: string
  featured: boolean
  sortOrder: number
  screenshotCount: number
  readyScreenshotCount: number
  createdAt: number
  updatedAt: number
}

export interface PublicTemplate {
  id: string
  slug: string
  name: string
  category: { id: string; slug: string; name: string }
  description: string | null
  accessTier: string
  priceLabel: string | null
  featured: boolean
  sortOrder: number
  screenshots: Array<{ id: string; variant: string; position: number; url: string; altText: string }>
}

export function getAdminCategories(params = '') {
  return adminApi<{ data: { items: CatalogCategory[] } }>(`/api/v1/admin/catalog/categories${params}`)
}

export function getAdminTemplates(params = '') {
  return adminApi<{ data: { items: CatalogTemplate[]; nextCursor: string | null } }>(`/api/v1/admin/catalog/templates${params}`)
}

export async function getPublicTemplates(params = '') {
  const response = await fetch(`/api/v1/templates${params}`, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('Không thể tải catalog.')
  return response.json() as Promise<{ data: { items: PublicTemplate[]; nextCursor: string | null } }>
}
