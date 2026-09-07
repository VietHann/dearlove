import { adminApi } from './admin-api'

export interface ContentSection {
  stableKey: string
  blockType: string
  position: number
  visible: boolean
  payload: Record<string, unknown>
}

export interface AdminPage {
  id: string
  key: string
  slug: string
  title: string
  seoTitle: string | null
  seoDescription: string | null
  status: string
  publishedRevisionId: string | null
  createdAt: number
  updatedAt: number
}

export interface ContentRevision {
  id: string
  version: number
  snapshot: { sections: ContentSection[] }
  authorName: string
  publishNote: string | null
  publishedAt: number | null
  createdAt: number
}

export interface AdminPageDocument {
  page: AdminPage
  revisions: ContentRevision[]
  draft: ContentRevision | null
  published: ContentRevision | null
}

export function getAdminPages() {
  return adminApi<{ data: { items: AdminPage[] } }>('/api/v1/admin/content/pages')
}

export function getAdminPage(key: string) {
  return adminApi<{ data: AdminPageDocument }>(`/api/v1/admin/content/pages/${encodeURIComponent(key)}`)
}

export function saveAdminDraft(key: string, body: unknown) {
  return adminApi<{ data: AdminPageDocument }>(`/api/v1/admin/content/pages/${encodeURIComponent(key)}/draft`, { method: 'PUT', body: JSON.stringify(body) })
}

export function publishAdminPage(key: string, body: unknown) {
  return adminApi<{ data: AdminPageDocument }>(`/api/v1/admin/content/pages/${encodeURIComponent(key)}/publish`, { method: 'POST', body: JSON.stringify(body) })
}

export function rollbackAdminPage(key: string, body: unknown) {
  return adminApi<{ data: AdminPageDocument }>(`/api/v1/admin/content/pages/${encodeURIComponent(key)}/rollback`, { method: 'POST', body: JSON.stringify(body) })
}

export function getAdminSettings() {
  return adminApi<{ data: { settings: Record<string, unknown>; updatedAt: number } }>('/api/v1/admin/content/settings')
}

export function updateAdminSettings(settings: Record<string, unknown>) {
  return adminApi<{ data: { settings: Record<string, unknown>; updatedAt: number } }>('/api/v1/admin/content/settings', { method: 'PUT', body: JSON.stringify({ settings }) })
}

export interface PublicBootstrap {
  data: {
    settings: Record<string, unknown>
    pages: Record<string, { key: string; slug: string; title: string; sections: ContentSection[]; version: number }>
    version: number
  }
}

export function getPublicBootstrap(signal?: AbortSignal) {
  return fetch('/api/v1/site/bootstrap', { headers: { Accept: 'application/json' }, signal }).then(async response => {
    if (!response.ok) throw new Error('Không thể tải nội dung đã publish.')
    return response.json() as Promise<PublicBootstrap>
  })
}
