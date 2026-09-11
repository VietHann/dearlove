import { ArrowLeft, ExternalLink, Loader2, WandSparkles } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { InvitationPreview } from '../../lib/invitation-template-api'

function readStoredPreview(templateId: string): InvitationPreview | null {
  try {
    const raw = sessionStorage.getItem(`dearlove:invitation-preview:${templateId}`)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    const value = parsed as Record<string, unknown>
    if (typeof value.templateId !== 'string' || typeof value.html !== 'string' || !Array.isArray(value.warnings)) return null
    return {
      templateId: value.templateId,
      html: value.html,
      warnings: value.warnings.filter(item => typeof item === 'string'),
    }
  } catch {
    return null
  }
}

export default function AdminInvitationTemplatePreview() {
  const { templateId = '' } = useParams()
  const location = useLocation()
  const routeState = location.state as { preview?: InvitationPreview } | null
  const [preview, setPreview] = useState<InvitationPreview | null>(() => routeState?.preview || readStoredPreview(templateId))

  useEffect(() => {
    if (routeState?.preview) {
      setPreview(routeState.preview)
      try {
        sessionStorage.setItem(`dearlove:invitation-preview:${templateId}`, JSON.stringify(routeState.preview))
      } catch {
        // The current route still has the preview in router state.
      }
      return
    }
    setPreview(readStoredPreview(templateId))
  }, [routeState?.preview, templateId])

  return (
    <div className="admin-template-preview-page">
      <header className="admin-template-preview-header">
        <div>
          <Link to="/admin/invitation-templates" className="admin-back-link">
            <ArrowLeft size={16} aria-hidden="true" /> Template Studio
          </Link>
          <p className="admin-eyebrow">Invitation preview</p>
          <h1 className="admin-page-title">Bản xem trước mẫu {templateId}</h1>
          <p className="admin-page-description">Preview nội bộ được render từ dữ liệu bạn vừa nhập.</p>
        </div>
        <Link to="/admin/invitation-templates" className="admin-secondary-button">
          <WandSparkles size={15} aria-hidden="true" /> Chỉnh sửa mẫu
        </Link>
      </header>

      {preview?.warnings.length ? <div className="admin-template-warning" role="status">{preview.warnings.join(' ')}</div> : null}
      {preview ? <main className="admin-template-preview-stage"><iframe title={`Bản xem trước mẫu ${templateId}`} sandbox="" srcDoc={preview.html} className="admin-template-preview-page-frame" /></main> : <main className="admin-template-preview-missing" role="status"><Loader2 size={24} aria-hidden="true" /><strong>Không tìm thấy preview trong phiên này</strong><span>Hãy quay lại Template Studio và tạo preview mới.</span><Link to="/admin/invitation-templates" className="admin-primary-button">Quay lại Template Studio <ExternalLink size={15} aria-hidden="true" /></Link></main>}
    </div>
  )
}
