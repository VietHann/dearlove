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
  'contact_channels',
  'support_topics',
  'office_locations',
  'contact_faq',
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
  iconKey: 40,
  city: 120,
  address: 300,
  hours: 120,
  phone: 80,
  ctaLabel: 120,
  responseTime: 160,
}

function validText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length <= max
}

function validHref(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true
  if (!validText(value, STRING_LIMITS.href)) return false
  return (value as string).startsWith('/') && !(value as string).startsWith('//') || /^(?:https:\/\/|mailto:|tel:)/i.test(value as string)
}

function validImageAsset(value: unknown): boolean {
  return value === undefined || value === null || value === '' || typeof value === 'string' && /^[a-zA-Z0-9_-]{10,128}$/.test(value)
}

const CONTACT_ICON_KEYS = ['facebook', 'message', 'mail', 'phone', 'help', 'briefcase', 'megaphone', 'shield', 'building'] as const

function validIconKey(value: unknown): value is string {
  return value === undefined || value === null || value === '' || typeof value === 'string' && CONTACT_ICON_KEYS.includes(value as typeof CONTACT_ICON_KEYS[number])
}

function validItems(value: unknown, max: number, validator: (item: Record<string, unknown>) => boolean): boolean {
  return Array.isArray(value) && value.length <= max && value.every(item => item && typeof item === 'object' && !Array.isArray(item) && validator(item as Record<string, unknown>))
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
    case 'contact_channels':
      return validItems(data.items, 12, item => validText(item.name, 160) && validText(item.description, STRING_LIMITS.description) && validText(item.ctaLabel, STRING_LIMITS.ctaLabel) && validHref(item.href) && validText(item.responseTime, STRING_LIMITS.responseTime) && validIconKey(item.iconKey))
    case 'support_topics':
      return validItems(data.items, 12, item => validText(item.title, STRING_LIMITS.title) && validText(item.body, STRING_LIMITS.description) && validIconKey(item.iconKey))
    case 'office_locations':
      return validItems(data.items, 12, item => validText(item.city, STRING_LIMITS.city) && validText(item.address, STRING_LIMITS.address) && validText(item.hours, STRING_LIMITS.hours) && validText(item.phone, STRING_LIMITS.phone) && (item.isHQ === undefined || typeof item.isHQ === 'boolean'))
    case 'contact_faq':
      return validItems(data.items, 30, item => validText(item.question, STRING_LIMITS.question) && validText(item.answer, STRING_LIMITS.answer))
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
