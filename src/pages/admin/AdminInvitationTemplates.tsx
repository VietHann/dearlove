import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileImage, FileText, ImagePlus, Loader2, RefreshCw, Search, Send, WandSparkles } from 'lucide-react'
import { AdminApiError } from '../../lib/admin-api'
import {
  getInvitationTemplateSchema,
  getInvitationTemplateStatus,
  getInvitationTemplates,
  previewInvitationTemplate,
  previewInvitationTemplateUpload,
  type InvitationImageField,
  type InvitationTemplateManifest,
  type InvitationTemplateSummary,
  type InvitationTextField,
} from '../../lib/invitation-template-api'

const MAX_PREVIEW_IMAGE_BYTES = 8 * 1024 * 1024
const TEXT_FIELDS_PER_PAGE = 12
const IMAGE_FIELDS_PER_PAGE = 8

function fieldLabel(field: InvitationTextField | InvitationImageField): string {
  return field.label?.trim() || field.id
}

function isLongTextField(field: InvitationTextField): boolean {
  return field.type === 'text' && (field.default.includes('\n') || field.default.length > 140)
}

function inputType(field: InvitationTextField): 'text' | 'email' | 'tel' | 'time' {
  if (field.type === 'email') return 'email'
  if (field.type === 'phone') return 'tel'
  if (field.type === 'time') return 'time'
  return 'text'
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AdminInvitationTemplates() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<InvitationTemplateSummary[]>([])
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [manifest, setManifest] = useState<InvitationTemplateManifest | null>(null)
  const [fields, setFields] = useState<Record<string, string>>({})
  const [files, setFiles] = useState<Record<string, File>>({})
  const [activeTab, setActiveTab] = useState<'text' | 'images'>('text')
  const [fieldQuery, setFieldQuery] = useState('')
  const [fieldPage, setFieldPage] = useState(0)
  const [rendererAvailable, setRendererAvailable] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingSchema, setIsLoadingSchema] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [error, setError] = useState('')
  const [previewError, setPreviewError] = useState('')

  const loadTemplates = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const statusResponse = await getInvitationTemplateStatus()
      const available = statusResponse.data.configured && statusResponse.data.available
      setRendererAvailable(available)
      if (!available) {
        setTemplates([])
        setSelectedId('')
        return
      }
      const response = await getInvitationTemplates()
      setTemplates(response.data.items)
      setSelectedId(current => current && response.data.items.some(item => item.id === current) ? current : response.data.items[0]?.id || '')
    } catch (cause) {
      setRendererAvailable(false)
      setError(cause instanceof Error ? cause.message : 'Không thể tải danh sách template.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { void loadTemplates() }, [loadTemplates])

  useEffect(() => {
    if (!selectedId || rendererAvailable !== true) return
    let active = true
    setIsLoadingSchema(true)
    setManifest(null)
    setFields({})
    setFiles({})
    setActiveTab('text')
    setFieldQuery('')
    setFieldPage(0)
    setPreviewError('')
    getInvitationTemplateSchema(selectedId)
      .then(response => {
        if (!active) return
        setManifest(response.data)
        setFields(Object.fromEntries(response.data.fields.map(field => [field.id, field.default || ''])))
      })
      .catch(cause => {
        if (!active) return
        setError(cause instanceof Error ? cause.message : 'Không thể tải schema template.')
      })
      .finally(() => {
        if (active) setIsLoadingSchema(false)
      })
    return () => { active = false }
  }, [rendererAvailable, selectedId])

  const filteredTemplates = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return templates
    return templates.filter(template => `${template.id} ${template.name}`.toLowerCase().includes(normalized))
  }, [query, templates])

  const filteredFields = useMemo(() => {
    if (!manifest) return []
    const normalized = fieldQuery.trim().toLowerCase()
    if (!normalized) return activeTab === 'text' ? manifest.fields : manifest.images
    return (activeTab === 'text' ? manifest.fields : manifest.images).filter(field => `${field.id} ${fieldLabel(field)}`.toLowerCase().includes(normalized))
  }, [activeTab, fieldQuery, manifest])

  const pageSize = activeTab === 'text' ? TEXT_FIELDS_PER_PAGE : IMAGE_FIELDS_PER_PAGE
  const pageCount = Math.max(1, Math.ceil(filteredFields.length / pageSize))
  const currentPage = Math.min(fieldPage, pageCount - 1)
  const visibleFields = filteredFields.slice(currentPage * pageSize, (currentPage + 1) * pageSize)

  const updateFieldSearch = (value: string) => {
    setFieldQuery(value)
    setFieldPage(0)
  }

  const updateActiveTab = (tab: 'text' | 'images') => {
    setActiveTab(tab)
    setFieldQuery('')
    setFieldPage(0)
  }

  const updateField = (fieldId: string, value: string) => {
    setFields(current => ({ ...current, [fieldId]: value }))
  }

  const updateFile = (fieldId: string, file: File | undefined) => {
    setFiles(current => {
      const next = { ...current }
      if (file) next[fieldId] = file
      else delete next[fieldId]
      return next
    })
  }

  const createPreview = async () => {
    if (!manifest) return
    setIsPreviewing(true)
    setPreviewError('')
    try {
      const selectedFiles = Object.entries(files)
      const oversized = selectedFiles.find(([, file]) => file.size > MAX_PREVIEW_IMAGE_BYTES)
      if (oversized) {
        setPreviewError(`Ảnh “${oversized[1].name}” vượt quá giới hạn 8 MB.`)
        return
      }
      const response = selectedFiles.length > 0
        ? await previewInvitationTemplateUpload(manifest.id, fields, files)
        : await previewInvitationTemplate(manifest.id, fields)
      try {
        sessionStorage.setItem(`dearlove:invitation-preview:${manifest.id}`, JSON.stringify(response.data))
      } catch {
        // Router state still carries the preview for the current navigation.
      }
      navigate(`/admin/invitation-templates/${encodeURIComponent(manifest.id)}/preview`, {
        state: { preview: response.data },
      })
    } catch (cause) {
      if (cause instanceof AdminApiError && cause.status === 413) setPreviewError('Ảnh preview quá lớn. Hãy chọn ảnh nhỏ hơn 8 MB.')
      else setPreviewError(cause instanceof Error ? cause.message : 'Không thể tạo preview template.')
    } finally {
      setIsPreviewing(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">Content / Template Studio</p>
          <h1 className="admin-page-title">Template Studio</h1>
          <p className="admin-page-description">Chọn một mẫu thiệp, điền nội dung và xem bản preview nội bộ từ manifest.</p>
        </div>
        <button type="button" className="admin-secondary-button" onClick={() => void loadTemplates()} disabled={isLoading}>
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" /> Làm mới
        </button>
      </div>

      {error && <div className="admin-alert admin-alert-error" role="alert"><strong>Template Studio có lỗi.</strong><span>{error}</span><button type="button" onClick={() => void loadTemplates()}>Thử lại</button></div>}

      {isLoading && rendererAvailable === null && (
        <div className="admin-template-unavailable" role="status" aria-live="polite">
          <Loader2 size={24} className="animate-spin" aria-hidden="true" />
          <strong>Đang kết nối renderer</strong>
          <p>Đang kiểm tra registry template nội bộ.</p>
        </div>
      )}

      {rendererAvailable === false && !error && (
        <div className="admin-template-unavailable" role="status">
          <WandSparkles size={24} aria-hidden="true" />
          <strong>Renderer chưa sẵn sàng</strong>
          <p>Hãy chạy `local_invite` ở local hoặc cấu hình `INVITATION_RENDERER_URL` cho Worker production.</p>
          <button type="button" className="admin-secondary-button" onClick={() => void loadTemplates()}>Kiểm tra lại</button>
        </div>
      )}

      {rendererAvailable === true && (
        <div className="admin-template-studio-layout">
          <section className="admin-template-library" aria-labelledby="template-library-title">
            <div className="admin-template-panel-heading">
              <div>
                <p className="admin-panel-kicker">Registry</p>
                <h2 id="template-library-title">Mẫu thiệp</h2>
              </div>
              <span className="admin-template-count">{templates.length} mẫu</span>
            </div>
            <label className="admin-search-field admin-template-search">
              <span className="sr-only">Tìm template</span>
              <Search size={16} aria-hidden="true" />
              <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm theo tên hoặc ID..." />
            </label>
            <div className="admin-template-list" aria-live="polite">
              {isLoading ? <div className="admin-template-list-state"><Loader2 size={19} className="animate-spin" aria-hidden="true" /> Đang tải registry...</div> : filteredTemplates.map(template => (
                <button
                  type="button"
                  key={template.id}
                  className={`admin-template-list-item ${selectedId === template.id ? 'is-active' : ''}`}
                  aria-pressed={selectedId === template.id}
                  onClick={() => setSelectedId(template.id)}
                >
                  <span className="admin-template-list-icon"><FileText size={16} aria-hidden="true" /></span>
                  <span className="admin-template-list-copy"><strong>{template.name}</strong><small>{template.id} · {template.text_fields} text · {template.image_fields} ảnh</small></span>
                  <span className="admin-template-list-arrow" aria-hidden="true">→</span>
                </button>
              ))}
              {!isLoading && filteredTemplates.length === 0 && <div className="admin-template-list-state">Không tìm thấy mẫu phù hợp.</div>}
            </div>
          </section>

          <section className="admin-template-workspace" aria-labelledby="template-workspace-title">
            {isLoadingSchema ? <div className="admin-template-workspace-state"><Loader2 size={22} className="animate-spin" aria-hidden="true" /> Đang tải manifest...</div> : manifest ? <>
              <div className="admin-template-panel-heading">
                <div>
                  <p className="admin-panel-kicker">{manifest.id}</p>
                  <h2 id="template-workspace-title">{manifest.name}</h2>
                  <p className="admin-template-meta">{manifest.fields.length} trường text · {manifest.images.length} trường ảnh</p>
                </div>
                <button type="button" className="admin-primary-button" onClick={() => void createPreview()} disabled={isPreviewing}>
                  {isPreviewing ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
                  {isPreviewing ? 'Đang render...' : 'Xem preview'}
                </button>
              </div>
              {previewError && <p className="admin-inline-error" role="alert">{previewError}</p>}

              <div className="admin-template-editor-grid">
                <div className="admin-template-fields">
                  <div className="admin-template-editor-tabs" role="tablist" aria-label="Nội dung template">
                    <button type="button" role="tab" aria-selected={activeTab === 'text'} className={activeTab === 'text' ? 'is-active' : ''} onClick={() => updateActiveTab('text')}>
                      <FileText size={15} aria-hidden="true" /> Nội dung text <span>{manifest.fields.length}</span>
                    </button>
                    <button type="button" role="tab" aria-selected={activeTab === 'images'} className={activeTab === 'images' ? 'is-active' : ''} onClick={() => updateActiveTab('images')}>
                      <ImagePlus size={15} aria-hidden="true" /> Hình ảnh <span>{manifest.images.length}</span>
                    </button>
                  </div>

                  <div className="admin-template-field-toolbar">
                    <label className="admin-search-field">
                      <span className="sr-only">Tìm trường {activeTab === 'text' ? 'text' : 'hình ảnh'}</span>
                      <Search size={15} aria-hidden="true" />
                      <input value={fieldQuery} onChange={event => updateFieldSearch(event.target.value)} placeholder={activeTab === 'text' ? 'Tìm theo label hoặc field ID...' : 'Tìm theo label hoặc image ID...'} />
                    </label>
                    <span className="admin-template-field-count">{filteredFields.length} trường</span>
                  </div>

                  {activeTab === 'text' ? (
                    <div className="admin-template-fields-grid">
                      {visibleFields.map(field => {
                        const textField = field as InvitationTextField
                        const label = fieldLabel(textField)
                        const id = `invitation-field-${textField.id}`
                        return <label className="admin-template-field" key={textField.id} htmlFor={id}>
                          <span>{label}<small>{textField.id} · {textField.occurrences} vị trí</small></span>
                          {isLongTextField(textField) ? <textarea id={id} rows={3} value={fields[textField.id] || ''} onChange={event => updateField(textField.id, event.target.value)} /> : <input id={id} type={inputType(textField)} value={fields[textField.id] || ''} onChange={event => updateField(textField.id, event.target.value)} />}
                        </label>
                      })}
                    </div>
                  ) : (
                    <div className="admin-template-images-grid">
                      {visibleFields.map(field => {
                        const imageField = field as InvitationImageField
                        const label = fieldLabel(imageField)
                        const id = `invitation-image-${imageField.id}`
                        const file = files[imageField.id]
                        return <label className="admin-template-file-field" key={imageField.id} htmlFor={id}>
                          <span><strong>{label}</strong><small>{imageField.id} · {imageField.strategy || 'image'}</small></span>
                          <input id={id} type="file" accept="image/*" onChange={event => updateFile(imageField.id, event.target.files?.[0])} />
                          {file && <em><FileImage size={14} aria-hidden="true" /> {file.name} · {formatBytes(file.size)}</em>}
                        </label>
                      })}
                    </div>
                  )}

                  {visibleFields.length === 0 && <div className="admin-template-fields-empty">Không tìm thấy trường phù hợp.</div>}
                  {pageCount > 1 && <div className="admin-template-pagination"><button type="button" className="admin-secondary-button" onClick={() => setFieldPage(currentPage - 1)} disabled={currentPage === 0}>Trước</button><span>Trang {currentPage + 1} / {pageCount}</span><button type="button" className="admin-secondary-button" onClick={() => setFieldPage(currentPage + 1)} disabled={currentPage === pageCount - 1}>Sau</button></div>}
                </div>
              </div>
            </> : <div className="admin-template-workspace-state"><WandSparkles size={22} aria-hidden="true" /> Chọn một mẫu để bắt đầu.</div>}
          </section>
        </div>
      )}
    </div>
  )
}
