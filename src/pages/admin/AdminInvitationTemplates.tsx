import { useCallback, useEffect, useMemo, useState } from 'react'
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
  type InvitationPreview,
} from '../../lib/invitation-template-api'

const MAX_PREVIEW_IMAGE_BYTES = 8 * 1024 * 1024

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
  const [templates, setTemplates] = useState<InvitationTemplateSummary[]>([])
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [manifest, setManifest] = useState<InvitationTemplateManifest | null>(null)
  const [fields, setFields] = useState<Record<string, string>>({})
  const [files, setFiles] = useState<Record<string, File>>({})
  const [preview, setPreview] = useState<InvitationPreview | null>(null)
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
    setPreview(null)
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
      setPreview(response.data)
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
                  {isPreviewing ? 'Đang render...' : 'Tạo preview'}
                </button>
              </div>

              <div className="admin-template-editor-grid">
                <div className="admin-template-fields">
                  <div className="admin-template-subheading"><FileText size={16} aria-hidden="true" /><h3>Nội dung text</h3></div>
                  {manifest.fields.map(field => {
                    const label = fieldLabel(field)
                    const id = `invitation-field-${field.id}`
                    return <label className="admin-template-field" key={field.id} htmlFor={id}>
                      <span>{label}<small>{field.id} · {field.occurrences} vị trí</small></span>
                      {isLongTextField(field) ? <textarea id={id} rows={4} value={fields[field.id] || ''} onChange={event => updateField(field.id, event.target.value)} /> : <input id={id} type={inputType(field)} value={fields[field.id] || ''} onChange={event => updateField(field.id, event.target.value)} />}
                    </label>
                  })}

                  {manifest.images.length > 0 && <div className="admin-template-image-section"><div className="admin-template-subheading"><ImagePlus size={16} aria-hidden="true" /><h3>Ảnh trong template</h3></div>{manifest.images.map(field => {
                    const label = fieldLabel(field)
                    const id = `invitation-image-${field.id}`
                    const file = files[field.id]
                    return <label className="admin-template-file-field" key={field.id} htmlFor={id}><span><strong>{label}</strong><small>{field.id} · {field.strategy || 'image'}</small></span><input id={id} type="file" accept="image/*" onChange={event => updateFile(field.id, event.target.files?.[0])} />{file && <em><FileImage size={14} aria-hidden="true" /> {file.name} · {formatBytes(file.size)}</em>}</label>
                  })}</div>}
                </div>

                <div className="admin-template-preview-panel">
                  <div className="admin-template-subheading"><WandSparkles size={16} aria-hidden="true" /><h3>Preview nội bộ</h3></div>
                  {previewError && <p className="admin-inline-error" role="alert">{previewError}</p>}
                  {preview?.warnings.length ? <div className="admin-template-warning" role="status">{preview.warnings.join(' ')}</div> : null}
                  {preview ? <iframe title={`Bản xem trước mẫu ${manifest.id}`} sandbox="" srcDoc={preview.html} className="admin-template-preview-frame" /> : <div className="admin-template-preview-empty"><WandSparkles size={28} aria-hidden="true" /><strong>Chưa có preview</strong><span>Điền nội dung rồi chọn “Tạo preview”.</span></div>}
                </div>
              </div>
            </> : <div className="admin-template-workspace-state"><WandSparkles size={22} aria-hidden="true" /> Chọn một mẫu để bắt đầu.</div>}
          </section>
        </div>
      )}
    </div>
  )
}
