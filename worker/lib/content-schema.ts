export const BLOCK_TYPES = [
  'hero',
  'banner',
  'cta',
  'faq',
  'stats',
  'testimonials',
  'feature_grid',
  'footer_links',
  'contact_info',
  'seo_defaults',
] as const

export type BlockType = typeof BLOCK_TYPES[number]

export interface ContentSection {
  stableKey: string
  blockType: BlockType
  position: number
  visible: boolean
  payload: Record<string, unknown>
}

export interface ContentSnapshot {
  sections: ContentSection[]
}

const STRING_LIMITS: Record<string, number> = {
  eyebrow: 120,
  title: 240,
  description: 1000,
  text: 1000,
  label: 120,
  href: 500,
  value: 160,
  author: 160,
  quote: 1000,
  question: 300,
  answer: 1200,
}

function validText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length <= max
}

function validHref(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true
  if (!validText(value, STRING_LIMITS.href)) return false
  return (value as string).startsWith('/') && !(value as string).startsWith('//') || /^https:\/\/([a-z0-9-]+\.)*dearlove\.click(?:\/|$)/i.test(value as string)
}

function validImageAsset(value: unknown): boolean {
  return value === undefined || value === null || value === '' || typeof value === 'string' && /^[a-zA-Z0-9_-]{10,128}$/.test(value)
}

function validatePayload(type: BlockType, payload: unknown): payload is Record<string, unknown> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false
  const data = payload as Record<string, unknown>
  switch (type) {
    case 'hero':
      return validText(data.eyebrow ?? '', STRING_LIMITS.eyebrow) && validText(data.title ?? '', STRING_LIMITS.title) && validText(data.description ?? '', STRING_LIMITS.description) && validHref(data.primaryHref) && validHref(data.secondaryHref) && validImageAsset(data.imageAssetId)
    case 'banner':
    case 'cta':
      return validText(data.text ?? data.title ?? '', STRING_LIMITS.text) && validHref(data.href) && validImageAsset(data.imageAssetId)
    case 'faq':
      return Array.isArray(data.items) && data.items.length <= 30 && data.items.every(item => item && typeof item === 'object' && validText((item as Record<string, unknown>).question, STRING_LIMITS.question) && validText((item as Record<string, unknown>).answer, STRING_LIMITS.answer))
    case 'stats':
      return Array.isArray(data.items) && data.items.length <= 12 && data.items.every(item => item && typeof item === 'object' && validText((item as Record<string, unknown>).label, STRING_LIMITS.label) && validText((item as Record<string, unknown>).value, STRING_LIMITS.value))
    case 'testimonials':
      return Array.isArray(data.items) && data.items.length <= 12 && data.items.every(item => item && typeof item === 'object' && validText((item as Record<string, unknown>).author, STRING_LIMITS.author) && validText((item as Record<string, unknown>).quote, STRING_LIMITS.quote))
    case 'feature_grid':
      return Array.isArray(data.items) && data.items.length <= 12 && data.items.every(item => item && typeof item === 'object' && validText((item as Record<string, unknown>).title, STRING_LIMITS.title) && validText((item as Record<string, unknown>).description, STRING_LIMITS.description))
    case 'footer_links':
      return Array.isArray(data.items) && data.items.length <= 30 && data.items.every(item => item && typeof item === 'object' && validText((item as Record<string, unknown>).label, STRING_LIMITS.label) && validHref((item as Record<string, unknown>).href))
    case 'contact_info':
      return validText(data.phone ?? '', 80) && validText(data.email ?? '', 320) && validText(data.address ?? '', 300) && validHref(data.mapHref)
    case 'seo_defaults':
      return validText(data.title ?? '', 160) && validText(data.description ?? '', 320) && validImageAsset(data.imageAssetId)
  }
}

export function validateSnapshot(value: unknown): { ok: true; snapshot: ContentSnapshot } | { ok: false; message: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ok: false, message: 'Snapshot nội dung không hợp lệ.' }
  const sectionsValue = (value as Record<string, unknown>).sections
  if (!Array.isArray(sectionsValue) || sectionsValue.length > 40) return { ok: false, message: 'Trang chỉ được có tối đa 40 section.' }
  const sections: ContentSection[] = []
  for (let index = 0; index < sectionsValue.length; index += 1) {
    const raw = sectionsValue[index]
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, message: `Section ${index + 1} không hợp lệ.` }
    const section = raw as Record<string, unknown>
    const stableKey = section.stableKey
    const blockType = section.blockType
    if (typeof stableKey !== 'string' || !/^[a-z0-9_-]{1,80}$/.test(stableKey) || typeof blockType !== 'string' || !BLOCK_TYPES.includes(blockType as BlockType)) return { ok: false, message: `Section ${index + 1} có loại hoặc key không hợp lệ.` }
    const position = section.position
    if (typeof position !== 'number' || !Number.isSafeInteger(position) || position < 0 || position >= 40) return { ok: false, message: `Section ${stableKey} có vị trí không hợp lệ.` }
    if (!validatePayload(blockType as BlockType, section.payload)) return { ok: false, message: `Nội dung section ${stableKey} không hợp lệ.` }
    sections.push({ stableKey, blockType: blockType as BlockType, position, visible: section.visible !== false, payload: section.payload as Record<string, unknown> })
  }
  const keys = new Set(sections.map(section => section.stableKey))
  if (keys.size !== sections.length) return { ok: false, message: 'Các section phải có stable key khác nhau.' }
  return { ok: true, snapshot: { sections: sections.sort((a, b) => a.position - b.position) } }
}

export const DEFAULT_HOME_SNAPSHOT: ContentSnapshot = {
  sections: [
    {
      stableKey: 'announcement',
      blockType: 'banner',
      position: 0,
      visible: true,
      payload: { text: 'Dearlove giúp bạn lưu giữ ngày trọng đại bằng một tấm thiệp thật riêng.', href: '/templates' },
    },
  ],
}
