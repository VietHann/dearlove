import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { authClient } from '../../lib/auth-client'
import { getPublicTemplates, type PublicTemplate } from '../../lib/catalog-api'
import { TemplatesHero } from './TemplatesHero'
import { FilterBar } from './CategoryFilter'
import { TemplatesGrid } from './TemplatesGrid'
import type { Template, TemplateCategory } from './templatesData'
import './templates.css'

const TEMPLATE_CATEGORIES: TemplateCategory[] = ['wedding', 'graduation', 'birthday', 'event', 'anniversary', 'wishes']

function toTemplate(template: PublicTemplate): Template {
  const category = TEMPLATE_CATEGORIES.includes(template.category.slug as TemplateCategory) ? template.category.slug as TemplateCategory : 'wedding'
  const screenshot = template.screenshots.find(item => item.variant === 'thumbnail') || template.screenshots[0]
  return {
    id: template.id,
    name: template.name,
    category,
    type: template.accessTier === 'premium' ? 'form' : 'free',
    image: screenshot?.url || '',
    viewCount: 0,
    useCount: 0,
    premium: template.accessTier === 'premium',
  }
}

export default function Templates() {
  const [selectedCategory, setSelectedCategory] = useState('wedding')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedSort, setSelectedSort] = useState('recent')
  const [catalog, setCatalog] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { data: session } = authClient.useSession()

  useEffect(() => {
    let active = true
    setIsLoading(true)
    getPublicTemplates('?limit=50')
      .then(response => { if (active) setCatalog(response.data.items.map(toTemplate)) })
      .catch(() => { if (active) { setCatalog([]); setError('Catalog đang được cập nhật. Vui lòng thử lại sau.') } })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [])

  const filteredTemplates = useMemo(() => {
    let result = [...catalog]
    if (selectedCategory !== 'all') result = result.filter(template => template.category === selectedCategory)
    if (selectedType !== 'all') result = result.filter(template => template.type === selectedType)
    if (selectedSort === 'popular') result.sort((a, b) => b.useCount - a.useCount)
    if (selectedSort === 'views') result.sort((a, b) => b.viewCount - a.viewCount)
    return result
  }, [catalog, selectedCategory, selectedSort, selectedType])

  const handleViewClick = (template: Template) => {
    const orderPath = `/order/${encodeURIComponent(template.id)}?templateName=${encodeURIComponent(template.name)}`
    const target = session ? orderPath : `/auth?mode=register&returnTo=${encodeURIComponent(orderPath)}`
    window.location.assign(target)
  }

  return <main className="min-h-screen bg-background"><TemplatesHero /><section className="px-4 sm:px-6 lg:px-8"><FilterBar selectedCategory={selectedCategory} selectedType={selectedType} selectedSort={selectedSort} onCategoryChange={setSelectedCategory} onTypeChange={setSelectedType} onSortChange={setSelectedSort} totalCount={catalog.length} filteredCount={filteredTemplates.length} /></section><div className="page-content-body px-4 sm:px-6 lg:px-8">{isLoading ? <div className="flex min-h-56 items-center justify-center gap-3 text-sm text-[#7c3f06]/70"><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Đang tải catalog...</div> : error ? <div className="mx-auto flex max-w-xl flex-col items-center gap-3 py-20 text-center text-sm text-[#7c3f06]/70"><AlertCircle size={26} className="text-[#8d1216]" aria-hidden="true" /><strong className="text-[#8d1216]">Không tải được catalog</strong><p>{error}</p><button type="button" className="rounded-full border border-[#d9a441]/40 px-4 py-2 font-semibold text-[#8d1216]" onClick={() => window.location.reload()}>Thử lại</button></div> : <TemplatesGrid templates={filteredTemplates} onViewClick={handleViewClick} />}</div></main>
}
