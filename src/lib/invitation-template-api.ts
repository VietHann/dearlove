import { adminApi } from './admin-api'

export interface InvitationTemplateSummary {
  id: string
  name: string
  text_fields: number
  image_fields: number
  ready: boolean
}

export interface InvitationTextField {
  id: string
  type: string
  label: string | null
  default: string
  occurrences: number
  tag: string | null
}

export interface InvitationImageField {
  id: string
  type: 'image'
  label: string | null
  default: string
  occurrences: number
  strategy: string | null
}

export interface InvitationTemplateManifest extends InvitationTemplateSummary {
  source_file?: string | null
  fields: InvitationTextField[]
  images: InvitationImageField[]
  warnings: string[]
  metadata?: Record<string, unknown>
}

export interface InvitationPreview {
  templateId: string
  html: string
  warnings: string[]
}

export function getInvitationTemplates() {
  return adminApi<{ data: { items: InvitationTemplateSummary[] } }>('/api/v1/admin/invitation-templates')
}

export function getInvitationTemplateSchema(templateId: string) {
  return adminApi<{ data: InvitationTemplateManifest }>(`/api/v1/admin/invitation-templates/${encodeURIComponent(templateId)}/schema`)
}

export function previewInvitationTemplate(templateId: string, fields: Record<string, string>) {
  return adminApi<{ data: InvitationPreview }>(`/api/v1/admin/invitation-templates/${encodeURIComponent(templateId)}/preview`, {
    method: 'POST',
    body: JSON.stringify({ fields, images: {}, standalone: false, strip_editable_attributes: false }),
  })
}

export function previewInvitationTemplateUpload(
  templateId: string,
  fields: Record<string, string>,
  files: Record<string, File>,
) {
  const formData = new FormData()
  formData.set('template_id', templateId)
  formData.set('fields', JSON.stringify(fields))
  formData.set('images', '{}')
  formData.set('output_mode', 'html')
  formData.set('standalone', 'true')
  formData.set('strip_editable_attributes', 'false')
  for (const [fieldId, file] of Object.entries(files)) formData.set(fieldId, file, file.name)

  return adminApi<{ data: InvitationPreview }>(`/api/v1/admin/invitation-templates/${encodeURIComponent(templateId)}/preview/upload`, {
    method: 'POST',
    body: formData,
  })
}

export function getInvitationTemplateStatus() {
  return adminApi<{ data: { configured: boolean; available: boolean } }>('/api/v1/admin/invitation-templates/status')
}
