import { useEffect, useState } from 'react'
import { getPublicBlog, toBlogPost } from '../../lib/marketing-api'
import { BlogContent } from './BlogContent'
import { BlogNewsletter } from './BlogNewsletter'
import { BLOG_POSTS } from './blogData'

export default function Blog() {
  const [posts, setPosts] = useState(BLOG_POSTS)
  useEffect(() => { getPublicBlog().then(response => { if (response.data.items.length > 0) setPosts(response.data.items.map(toBlogPost)) }).catch(() => undefined) }, [])
  return <><BlogContent posts={posts} /><BlogNewsletter /></>
}
