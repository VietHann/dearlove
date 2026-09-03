import { BlogContent } from './BlogContent'
import { BlogNewsletter } from './BlogNewsletter'
import { BLOG_POSTS } from './blogData'

/**
 * Blog — the /blog route.
 */
export default function Blog() {
  return (
    <>
      <BlogContent posts={BLOG_POSTS} />
      <BlogNewsletter />
    </>
  )
}
