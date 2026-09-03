import { Link } from 'react-router-dom'
import { Clock, Calendar } from 'lucide-react'
import { BlogPost, formatDate } from './blogData'

interface PostCardProps {
  post: BlogPost
}

/**
 * PostCard — clean article card for blog grid.
 */
export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-xl border border-[#d9a441]/15 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Category */}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-[#8d1216]">
          {post.category.name}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-heading text-base font-semibold text-[#8d1216] line-clamp-2 group-hover:text-[#d9a441] transition-colors">
          <Link to={`/blog/${post.slug}`} className="before:absolute before:inset-0">
            {post.title}
          </Link>
        </h3>

        <p className="mt-2 text-sm text-[#7c3f06]/70 line-clamp-2">
          {post.excerpt}
        </p>

        {/* Meta */}
        <div className="mt-3 flex items-center justify-between border-t border-[#d9a441]/10 pt-3 text-xs text-[#7c3f06]/50">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(post.publishedAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {post.readTime} phút
          </span>
        </div>
      </div>
    </article>
  )
}
