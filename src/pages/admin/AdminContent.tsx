import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Eye, FileText, Loader2, Plus, RefreshCw, RotateCcw, Save, Send, Settings2 } from 'lucide-react'
import { AdminApiError } from '../../lib/admin-api'
import { getAdminPage, getAdminPages, getAdminSettings, publishAdminPage, rollbackAdminPage, saveAdminDraft, updateAdminSettings, type AdminPage, type AdminPageDocument } from '../../lib/content-api'
import type { ContentSection } from '../../lib/content-api'
import ContentBlockEditor, { BLOCK_TYPES, BLOCK_TYPE_LABELS, createDefaultSection } from './ContentBlockEditor'

interface SettingsResponse { settings: Record<string, unknown>; updatedAt: number }

export default function AdminContent() {
  const [pages, setPages] = useState<AdminPage[]>([])
  const [selectedKey, setSelectedKey] = useState('home')
  const [document, setDocument] = useState<AdminPageDocument | null>(null)
  const [settings, setSettings] = useState<Record<string, string>>({ brand_name: 'Dearlove', hotline: '', email: '', domain: 'https://dearlove.click', default_seo_title: '', default_seo_description: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isDirty, setIsDirty] = useState(false)

  const loadPages = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const [pageResponse, settingsResponse] = await Promise.all([getAdminPages(), getAdminSettings()])
      setPages(pageResponse.data.items)
      const nextSettings: Record<string, string> = { ...settings }
      for (const [key, value] of Object.entries((settingsResponse.data as SettingsResponse).settings)) nextSettings[key] = typeof value === 'string' ? value : JSON.stringify(value)
      setSettings(nextSettings)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể tải danh sách nội dung.') }
    finally { setIsLoading(false) }
  }, [])

  const loadDocument = useCallback(async (key: string) => {
    setIsLoading(true)
    setError('')
    try { const response = await getAdminPage(key); setDocument(response.data); setIsDirty(false) }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể tải nội dung trang.') }
    finally { setIsLoading(false) }
  }, [])

  useEffect(() => { void loadPages() }, [loadPages])
  useEffect(() => { void loadDocument(selectedKey) }, [loadDocument, selectedKey])

  const updateSection = (index: number, section: ContentSection) => {
    if (!document?.draft) return
    const sections = document.draft.snapshot.sections.map((item, itemIndex) => itemIndex === index ? section : item).map((item, itemIndex) => ({ ...item, position: itemIndex }))
    setDocument(current => current?.draft ? { ...current, draft: { ...current.draft, snapshot: { sections } } } : current)
    setIsDirty(true)
  }

  const removeSection = (index: number) => {
    if (!document?.draft) return
    const sections = document.draft.snapshot.sections.filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({ ...item, position: itemIndex }))
    setDocument(current => current?.draft ? { ...current, draft: { ...current.draft, snapshot: { sections } } } : current)
    setIsDirty(true)
  }

  const moveSection = (index: number, direction: -1 | 1) => {
    if (!document?.draft) return
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= document.draft.snapshot.sections.length) return
    const sections = [...document.draft.snapshot.sections]
    const [section] = sections.splice(index, 1)
    sections.splice(nextIndex, 0, section)
    setDocument(current => current?.draft ? { ...current, draft: { ...current.draft, snapshot: { sections: sections.map((item, itemIndex) => ({ ...item, position: itemIndex })) } } } : current)
    setIsDirty(true)
  }

  const addSection = (blockType: string) => {
    if (!document?.draft) return
    const sections = [...document.draft.snapshot.sections, createDefaultSection(blockType, document.draft.snapshot.sections.length)]
    setDocument(current => current?.draft ? { ...current, draft: { ...current.draft, snapshot: { sections } } } : current)
    setIsDirty(true)
  }

  const saveDraft = async () => {
    if (!document?.draft) return
    setIsSaving(true); setError(''); setNotice('')
    try {
      const response = await saveAdminDraft(selectedKey, { title: document.page.title, seoTitle: document.page.seoTitle, seoDescription: document.page.seoDescription, sections: document.draft.snapshot.sections.map((section, index) => ({ ...section, position: index })), expectedVersion: document.draft.version })
      setDocument(response.data); setIsDirty(false); setNotice('Đã lưu bản nháp.')
      await loadPages()
    } catch (cause) { setError(cause instanceof AdminApiError && cause.status === 409 ? 'Nội dung đã bị thay đổi. Hãy tải lại rồi thao tác lại.' : cause instanceof Error ? cause.message : 'Không thể lưu bản nháp.') }
    finally { setIsSaving(false) }
  }

  const publish = async () => {
    if (!document?.draft) return
    if (isDirty) { setError('Hãy lưu bản nháp trước khi publish.'); return }
    setIsSaving(true); setError(''); setNotice('')
    try { const response = await publishAdminPage(selectedKey, { expectedVersion: document.draft.version, publishNote: 'Publish từ admin studio' }); setDocument(response.data); await loadPages(); setNotice('Đã publish nội dung.') }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể publish nội dung.') }
    finally { setIsSaving(false) }
  }

  const rollback = async (revisionId: string) => {
    if (!revisionId || !window.confirm('Rollback về revision này? Bản hiện tại vẫn được giữ trong lịch sử.')) return
    setIsSaving(true); setError(''); setNotice('')
    try { const response = await rollbackAdminPage(selectedKey, { revisionId, publishNote: 'Rollback từ admin studio' }); setDocument(response.data); await loadPages(); setNotice('Đã rollback và publish revision mới.') }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể rollback nội dung.') }
    finally { setIsSaving(false) }
  }

  const saveSettings = async () => {
    setIsSaving(true); setError(''); setNotice('')
    try { await updateAdminSettings(Object.fromEntries(Object.entries(settings).filter(([, value]) => value.trim()))); setNotice('Đã lưu settings thương hiệu.'); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể lưu settings.') }
    finally { setIsSaving(false) }
  }

  const draftSections = document?.draft?.snapshot.sections || []
  return <div className="admin-page"><div className="admin-page-heading"><div><p className="admin-eyebrow">Content / CMS</p><h1 className="admin-page-title">Trang & section</h1><p className="admin-page-description">Chỉnh sửa nội dung theo block có schema, lưu nháp rồi publish khi đã kiểm tra.</p></div><button type="button" className="admin-secondary-button" onClick={() => { void loadPages(); void loadDocument(selectedKey) }} disabled={isLoading}><RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" /> Làm mới</button></div>
    {error && <div className="admin-alert admin-alert-error" role="alert"><AlertCircle size={16} aria-hidden="true" /><span>{error}</span><button type="button" onClick={() => void loadDocument(selectedKey)}>Tải lại</button></div>}
    {notice && <div className="admin-alert admin-alert-success" role="status"><span>{notice}</span></div>}
    <div className="admin-content-layout"><aside className="admin-content-pages"><div className="admin-panel-heading"><div><p className="admin-panel-kicker">Pages</p><h2>Nội dung</h2></div><FileText size={18} className="text-[#d9a441]" aria-hidden="true" /></div><div className="admin-content-page-list">{pages.map(page => <button type="button" key={page.key} className={`admin-content-page-item ${page.key === selectedKey ? 'is-active' : ''}`} onClick={() => { if (isDirty && !window.confirm('Bạn có thay đổi chưa lưu. Chuyển trang?')) return; setSelectedKey(page.key) }}><span><strong>{page.title}</strong><small>{page.slug}</small></span><span className={`admin-status-badge ${page.status === 'published' ? 'admin-tone-success' : 'admin-tone-neutral'}`}>{page.status === 'published' ? 'Live' : 'Draft'}</span></button>)}{!pages.length && <p className="admin-muted-copy">Đang khởi tạo pages...</p>}</div><div className="admin-settings-box"><div className="admin-panel-heading"><div><p className="admin-panel-kicker">Global</p><h2>Brand settings</h2></div><Settings2 size={17} className="text-[#d9a441]" aria-hidden="true" /></div><div className="admin-settings-fields"><label className="admin-field"><span>Tên thương hiệu</span><input value={settings.brand_name || ''} onChange={event => setSettings(current => ({ ...current, brand_name: event.target.value }))} /></label><label className="admin-field"><span>Hotline</span><input value={settings.hotline || ''} onChange={event => setSettings(current => ({ ...current, hotline: event.target.value }))} /></label><label className="admin-field"><span>Email</span><input type="email" value={settings.email || ''} onChange={event => setSettings(current => ({ ...current, email: event.target.value }))} /></label><label className="admin-field"><span>Domain</span><input value={settings.domain || ''} onChange={event => setSettings(current => ({ ...current, domain: event.target.value }))} /></label><button type="button" className="admin-secondary-button" onClick={() => void saveSettings()} disabled={isSaving}><Save size={14} aria-hidden="true" /> Lưu settings</button></div></div></aside>
      <section className="admin-content-editor"><div className="admin-content-editor-header"><div><p className="admin-panel-kicker">{document?.page.title || 'Page'}</p><h2>Draft editor</h2><span>{document?.draft ? `Revision v${document.draft.version}` : 'Đang tải...'}</span></div><div className="admin-editor-actions"><a href={document?.page.slug || '/'} target="_blank" rel="noreferrer" className="admin-secondary-button"><Eye size={14} aria-hidden="true" /> Preview</a><button type="button" className="admin-secondary-button" onClick={() => void saveDraft()} disabled={isSaving || !document?.draft}><Save size={14} aria-hidden="true" /> {isSaving ? 'Đang lưu' : 'Lưu nháp'}</button><button type="button" className="admin-primary-button" onClick={() => void publish()} disabled={isSaving || !document?.draft || isDirty}><Send size={14} aria-hidden="true" /> Publish</button></div></div>{isDirty && <p className="admin-unsaved-note">Có thay đổi chưa lưu</p>}{document?.draft && <div className="admin-block-list">{draftSections.map((section, index) => <ContentBlockEditor key={section.stableKey} section={section} index={index} total={draftSections.length} onChange={next => updateSection(index, next)} onRemove={() => removeSection(index)} onMove={direction => moveSection(index, direction)} />)}{draftSections.length === 0 && <div className="admin-empty-state"><FileText size={24} aria-hidden="true" /><strong>Trang chưa có section</strong><p>Thêm block typed ở phía dưới.</p></div>}</div>}<div className="admin-add-block"><label className="admin-field"><span>Thêm block</span><select defaultValue="" onChange={event => { if (event.target.value) { addSection(event.target.value); event.target.value = '' } }}><option value="">Chọn loại block...</option>{BLOCK_TYPES.map(type => <option key={type} value={type}>{BLOCK_TYPE_LABELS[type]}</option>)}</select></label><Plus size={17} aria-hidden="true" /></div><div className="admin-revision-panel"><div className="admin-panel-heading"><div><p className="admin-panel-kicker">History</p><h2>Revision gần đây</h2></div><RotateCcw size={17} className="text-[#d9a441]" aria-hidden="true" /></div><div className="admin-revision-list">{document?.revisions.map(revision => <div className="admin-revision-row" key={revision.id}><div><strong>v{revision.version}</strong><span>{revision.authorName} · {new Date(revision.createdAt).toLocaleString('vi-VN')}</span></div>{revision.id === document.page.publishedRevisionId ? <span className="admin-status-badge admin-tone-success">Đang live</span> : <button type="button" className="admin-row-edit" onClick={() => void rollback(revision.id)} aria-label={`Rollback về revision ${revision.version}`}><RotateCcw size={15} aria-hidden="true" /></button>}</div>)}</div></div></section>
    </div>
  </div>
}
