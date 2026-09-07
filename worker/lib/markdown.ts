export function sanitizeMarkdown(value: string, maxLength = 30000): string {
  return value
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label: string, href: string) => {
      const safeHref = /^https:\/\//i.test(href) || href.startsWith('/') && !href.startsWith('//') ? href : '#'
      return `[${label.slice(0, 300)}](${safeHref})`
    })
    .replace(/\bon[a-z]+\s*=\s*(['"]).*?\1/gi, '')
    .trim()
}

export function markdownToPlainText(value: string): string {
  return sanitizeMarkdown(value)
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~`]/g, '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
}
