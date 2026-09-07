import { Hono } from 'hono'
import { jsonData, parseJsonObject } from '../../lib/http'
import { validateSnapshot, type ContentSnapshot } from '../../lib/content-schema'

function parseJsonValue(value: string | null | undefined): unknown {
  if (!value) return null
  try { return JSON.parse(value) as unknown } catch { return null }
}

export const publicContentApi = new Hono<{ Bindings: Env }>()

publicContentApi.get('/', async c => {
  const [settingsResult, pagesResult] = await c.env.DB.batch([
    c.env.DB.prepare('SELECT key, value_json AS valueJson FROM site_settings ORDER BY key ASC LIMIT 100'),
    c.env.DB.prepare(
      `SELECT p.id, p.key, p.slug, p.title, p.seo_title AS seoTitle, p.seo_description AS seoDescription,
              p.published_revision_id AS publishedRevisionId, r.snapshot_json AS snapshotJson,
              r.version, r.published_at AS publishedAt
       FROM pages p
       JOIN content_revisions r ON r.id = p.published_revision_id
       WHERE p.status = 'published' AND p.published_revision_id IS NOT NULL
       ORDER BY p.key ASC LIMIT 50`,
    ),
  ])

  const settings: Record<string, unknown> = {}
  for (const row of settingsResult.results as Array<Record<string, unknown>>) settings[String(row.key)] = parseJsonValue(row.valueJson as string | null)
  const pages: Record<string, unknown> = {}
  for (const row of pagesResult.results as Array<Record<string, unknown>>) {
    const parsed = parseJsonObject<ContentSnapshot>(row.snapshotJson as string | null)
    const validated = validateSnapshot(parsed)
    if (!validated.ok) continue
    pages[String(row.key)] = {
      key: String(row.key),
      slug: String(row.slug),
      title: String(row.title),
      seoTitle: row.seoTitle ? String(row.seoTitle) : null,
      seoDescription: row.seoDescription ? String(row.seoDescription) : null,
      version: Number(row.version || 0),
      publishedAt: row.publishedAt ? Number(row.publishedAt) : null,
      sections: validated.snapshot.sections,
    }
  }

  let latest = 0
  for (const row of pagesResult.results as Array<Record<string, unknown>>) latest = Math.max(latest, Number(row.version || 0))
  return jsonData(c, { settings, pages, version: latest }, 200, 'public, max-age=60, s-maxage=300')
})
