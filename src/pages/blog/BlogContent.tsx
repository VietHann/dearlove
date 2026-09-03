import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { BlogPost, formatDate, BLOG_CATEGORIES } from './blogData'
import { PostCard } from './PostCard'
import { motion, AnimatePresence } from 'framer-motion'

interface BlogContentProps {
  posts: BlogPost[]
}

/**
 * BlogContent - clean blog page with carousel featured.
 */
export function BlogContent({ posts }: BlogContentProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [featuredIndex, setFeaturedIndex] = useState(0)

  // Top 3 posts featured in carousel
  const featuredPosts = posts.slice(0, 3)
  const featuredPost = featuredPosts[featuredIndex]
  const gridPosts = posts.slice(3)

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % featuredPosts.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [featuredPosts.length])

  const filteredPosts = selectedCategory === 'all'
    ? gridPosts
    : gridPosts.filter(p => p.category.id === selectedCategory)

  const nextFeatured = () => setFeaturedIndex(prev => (prev + 1) % featuredPosts.length)
  const prevFeatured = () => setFeaturedIndex(prev => (prev - 1 + featuredPosts.length) % featuredPosts.length)

  return (
    <div className="bg-background text-foreground">
      <main>
        {/* Compact header */}
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-[#7c3f06]/60 mb-3">
            <Link to="/" className="hover:text-[#8d1216]">Trang chủ</Link>
            <span>/</span>
            <span className="text-[#8d1216] font-medium">Blog</span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold text-[#8d1216] sm:text-3xl">
                Blog Dearlove
              </h1>
              <p className="mt-1 text-sm text-[#7c3f06]/70">
                Mẹo thiết kế, xu hướng và cảm hứng thiệp cưới.
              </p>
            </div>
          </div>
        </div>

        {/* Featured carousel */}
        <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-[#d9a441]/20 bg-white shadow-soft">
            <AnimatePresence mode="wait">
              <motion.article
                key={featuredPost.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-5"
              >
                {/* Image */}
                <div className="relative aspect-video sm:aspect-auto sm:col-span-2">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#8d1216]">
                    {featuredPost.category.name}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center p-5 sm:col-span-3 sm:p-7">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#d9a441]">
                    Bài viết nổi bật
                  </span>
                  <h2 className="mt-2 font-heading text-lg font-bold text-[#8d1216] sm:text-2xl line-clamp-2">
                    <Link to={`/blog/${featuredPost.slug}`} className="hover:text-[#d9a441] transition-colors">
                      {featuredPost.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-sm text-[#7c3f06]/70 line-clamp-2">
                    {featuredPost.excerpt}
                  </p>

                  <div className="mt-4 flex items-center gap-3 border-t border-[#d9a441]/15 pt-3">
                    <img
                      src={featuredPost.author.avatar}
                      alt={featuredPost.author.name}
                      className="h-7 w-7 rounded-full object-cover ring-1 ring-[#d9a441]/30"
                    />
                    <div className="text-xs flex-1">
                      <p className="font-medium text-[#7c3f06]">{featuredPost.author.name}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#7c3f06]/50">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {formatDate(featuredPost.publishedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {featuredPost.readTime} phút
                      </span>
                    </div>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>

            {/* Carousel controls */}
            <div className="absolute inset-y-0 left-0 flex items-center pl-2">
              <button
                onClick={prevFeatured}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#8d1216] shadow hover:bg-white"
                aria-label="Bài trước"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <button
                onClick={nextFeatured}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#8d1216] shadow hover:bg-white"
                aria-label="Bài sau"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {featuredPosts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setFeaturedIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === featuredIndex ? 'w-6 bg-[#8d1216]' : 'w-1.5 bg-white/70'
                  }`}
                  aria-label={`Bài ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Category filters + Grid */}
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap gap-2">
            {BLOG_CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#8d1216] text-white'
                      : 'border border-[#d9a441]/30 bg-white text-[#7c3f06] hover:border-[#d9a441]'
                  }`}
                >
                  {cat.name}
                </button>
              )
            })}
          </div>

          {filteredPosts.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[#d9a441]/20 bg-[#fdf2e3]/50 py-12 text-center">
              <p className="text-[#7c3f06]/70">Chưa có bài viết trong danh mục này.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
