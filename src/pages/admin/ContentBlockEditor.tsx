import { useMemo } from 'react'
import { ArrowDown, ArrowUp, GripVertical, Trash2 } from 'lucide-react'
import type { ContentSection } from '../../lib/content-api'

export const BLOCK_TYPE_LABELS: Record<string, string> = {
  hero: 'Hero',
  banner: 'Banner',
  cta: 'CTA',
  faq: 'FAQ',
  stats: 'Số liệu',
  testimonials: 'Đánh giá',
  feature_grid: 'Lưới tính năng',
  footer_links: 'Liên kết footer',
  contact_info: 'Thông tin liên hệ',
  seo_defaults: 'SEO mặc định',
}

export const BLOCK_TYPES = Object.keys(BLOCK_TYPE_LABELS)

export function createDefaultSection(blockType: string, position: number): ContentSection {
  const payload: Record<string, unknown> = blockType === 'faq' ? { items: [] } : blockType === 'stats' || blockType === 'testimonials' || blockType === 'feature_grid' || blockType === 'footer_links' ? { items: [] } : blockType === 'contact_info' ? { phone: '', email: '', address: '', mapHref: '' } : blockType === 'seo_defaults' ? { title: '', description: '', imageAssetId: '' } : { title: '', description: '', text: '', href: '' }
  return { stableKey: `${blockType}-${position + 1}`, blockType, position, visible: true, payload }
}

function listToText(payload: Record<string, unknown>, blockType: string) {
  const items = Array.isArray(payload.items) ? payload.items as Array<Record<string, unknown>> : []
  return items.map(item => {
    if (blockType === 'faq') return `${String(item.question || '')} | ${String(item.answer || '')}`
    if (blockType === 'stats') return `${String(item.label || '')} | ${String(item.value || '')}`
    if (blockType === 'testimonials') return `${String(item.author || '')} | ${String(item.quote || '')}`
    if (blockType === 'feature_grid') return `${String(item.title || '')} | ${String(item.description || '')}`
    return `${String(item.label || '')} | ${String(item.href || '')}`
  }).join('\n')
}

function textToList(value: string, blockType: string): Array<Record<string, string>> {
  return value.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
    const separator = line.indexOf('|')
    const first = (separator < 0 ? line : line.slice(0, separator)).trim()
    const second = (separator < 0 ? '' : line.slice(separator + 1)).trim()
    const item: Record<string, string> = {}
    if (blockType === 'faq') { item.question = first; item.answer = second }
    else if (blockType === 'stats') { item.label = first; item.value = second }
    else if (blockType === 'testimonials') { item.author = first; item.quote = second }
    else if (blockType === 'feature_grid') { item.title = first; item.description = second }
    else { item.label = first; item.href = second }
    return item
  })
}

interface Props {
  section: ContentSection
  index: number
  total: number
  onChange: (section: ContentSection) => void
  onRemove: () => void
  onMove: (direction: -1 | 1) => void
}

export default function ContentBlockEditor({ section, index, total, onChange, onRemove, onMove }: Props) {
  const payload = section.payload || {}
  const listValue = useMemo(() => listToText(payload, section.blockType), [payload, section.blockType])
  const updatePayload = (key: string, value: unknown) => onChange({ ...section, payload: { ...payload, [key]: value } })
  const input = (key: string, label: string, placeholder = '', multiline = false) => <label className="admin-field"><span>{label}</span>{multiline ? <textarea rows={3} value={String(payload[key] || '')} onChange={event => updatePayload(key, event.target.value)} placeholder={placeholder} /> : <input value={String(payload[key] || '')} onChange={event => updatePayload(key, event.target.value)} placeholder={placeholder} />}</label>

  return <article className={`admin-block-editor ${section.visible ? '' : 'is-hidden'}`}><div className="admin-block-heading"><div className="admin-block-title"><GripVertical size={16} aria-hidden="true" /><div><strong>{BLOCK_TYPE_LABELS[section.blockType] || section.blockType}</strong><span>Section {index + 1} · {section.stableKey}</span></div></div><div className="admin-block-controls"><button type="button" className="admin-row-edit" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Đưa section lên"><ArrowUp size={15} aria-hidden="true" /></button><button type="button" className="admin-row-edit" onClick={() => onMove(1)} disabled={index === total - 1} aria-label="Đưa section xuống"><ArrowDown size={15} aria-hidden="true" /></button><button type="button" className="admin-row-edit is-danger" onClick={onRemove} aria-label={`Xóa section ${section.stableKey}`}><Trash2 size={15} aria-hidden="true" /></button></div></div><div className="admin-block-fields"><label className="admin-field"><span>Stable key</span><input value={section.stableKey} onChange={event => onChange({ ...section, stableKey: event.target.value })} pattern="[a-z0-9_-]{1,80}" required /></label><label className="admin-field admin-checkbox-field"><input type="checkbox" checked={section.visible} onChange={event => onChange({ ...section, visible: event.target.checked })} /><span>Hiển thị section</span></label>{section.blockType === 'hero' && <>{input('eyebrow', 'Eyebrow', 'Ví dụ: Thiệp cưới online')}{input('title', 'Tiêu đề', 'Tiêu đề chính')}{input('description', 'Mô tả', 'Mô tả ngắn', true)}{input('primaryLabel', 'Nhãn CTA chính', 'Khám phá mẫu')}{input('primaryHref', 'Link CTA chính', '/templates')}{input('secondaryLabel', 'Nhãn CTA phụ', 'Liên hệ')}{input('secondaryHref', 'Link CTA phụ', '/contact')}{input('imageAssetId', 'Media asset ID', 'UUID ảnh public')}</>}{(section.blockType === 'banner' || section.blockType === 'cta') && <>{input('title', 'Tiêu đề', 'Tiêu đề section')}{input('text', 'Nội dung', 'Nội dung hiển thị', true)}{input('href', 'Link', '/contact')}{input('imageAssetId', 'Media asset ID', 'UUID ảnh public')}</>}{['faq', 'stats', 'testimonials', 'feature_grid', 'footer_links'].includes(section.blockType) && <label className="admin-field admin-field-full"><span>{section.blockType === 'faq' ? 'Danh sách FAQ' : 'Danh sách item'} · mỗi dòng dùng dấu | để ngăn cách</span><textarea rows={6} value={listValue} onChange={event => updatePayload('items', textToList(event.target.value, section.blockType))} placeholder={section.blockType === 'faq' ? 'Câu hỏi | Câu trả lời' : 'Nhãn | Nội dung'} /></label>}{section.blockType === 'contact_info' && <>{input('phone', 'Hotline', '090...')}{input('email', 'Email', 'hello@...')}{input('address', 'Địa chỉ', 'Địa chỉ studio', true)}{input('mapHref', 'Link bản đồ', 'https://...')}</>}{section.blockType === 'seo_defaults' && <>{input('title', 'SEO title', 'Tiêu đề SEO')}{input('description', 'SEO description', 'Mô tả SEO', true)}{input('imageAssetId', 'Media asset ID', 'UUID ảnh social')}</>}</div></article>
}
