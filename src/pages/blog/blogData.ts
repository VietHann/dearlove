/**
 * Blog page data.
 */

import type { LucideIcon } from 'lucide-react'
import {
  Heart,
  TrendingUp,
  Lightbulb,
  Camera,
  Sparkles,
  BookOpen,
} from 'lucide-react'

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  category: BlogCategory
  image: string
  author: Author
  publishedAt: string
  readTime: number
  tags: string[]
  slug: string
}

export interface Author {
  name: string
  avatar: string
  role: string
}

export interface BlogCategory {
  id: string
  name: string
  icon: LucideIcon
}

// Categories
export const BLOG_CATEGORIES: BlogCategory[] = [
  { id: 'all', name: 'Tất cả', icon: BookOpen },
  { id: 'tips', name: 'Mẹo hay', icon: Lightbulb },
  { id: 'trends', name: 'Xu hướng', icon: TrendingUp },
  { id: 'guides', name: 'Hướng dẫn', icon: Camera },
  { id: 'inspiration', name: 'Cảm hứng', icon: Heart },
  { id: 'stories', name: 'Câu chuyện', icon: Sparkles },
]

// Authors
const AUTHORS: Record<string, Author> = {
  linh: {
    name: 'Minh Linh',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    role: 'Creative Director',
  },
  hoang: {
    name: 'Hoàng Phạm',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    role: 'Design Lead',
  },
  thinh: {
    name: 'Thu Thịnh',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    role: 'Content Writer',
  },
}

// All posts
export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'featured-2026-wedding-trends',
    title: 'Top 15 xu hướng thiệp cưới 2026: Từ công nghệ AI đến phong cách tối giản',
    excerpt: 'Năm 2026 đánh dấu bước ngoặt lớn trong ngành thiệp cưới kỹ thuật số. Báo cáo mới nhất từ Dearlove hé lộ những xu hướng thiết kế đang làm mưa làm gió.',
    category: BLOG_CATEGORIES[2],
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=500&fit=crop',
    author: AUTHORS.linh,
    publishedAt: '2026-08-15',
    readTime: 8,
    tags: ['Xu hướng 2026', 'Thiệp cưới', 'AI'],
    slug: 'top-15-xu-huong-thiep-cuoi-2026',
  },
  {
    id: 'wedding-card-typography',
    title: '10 nguyên tắc chọn font chữ cho thiệp cưới hoàn hảo',
    excerpt: 'Font chữ không chỉ là phương tiện truyền tải nội dung — nó là linh hồn của thiệp. Cùng khám phá những nguyên tắc vàng giúp chọn font phù hợp.',
    category: BLOG_CATEGORIES[1],
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=400&fit=crop',
    author: AUTHORS.hoang,
    publishedAt: '2026-08-20',
    readTime: 6,
    tags: ['Typography', 'Thiệp cưới'],
    slug: '10-nguyen-tac-chon-font-chu-thiep-cuoi',
  },
  {
    id: 'color-psychology-wedding',
    title: 'Tâm lý màu sắc: Ý nghĩa các gam màu trong thiệp cưới',
    excerpt: 'Mỗi gam màu mang một thông điệp riêng. Từ đỏ thắm truyền thống đến tím lavender hiện đại — hiểu ý nghĩa màu sắc giúp bạn chọn palette hoàn hảo.',
    category: BLOG_CATEGORIES[4],
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&h=400&fit=crop',
    author: AUTHORS.thinh,
    publishedAt: '2026-08-18',
    readTime: 5,
    tags: ['Màu sắc', 'Thiệp cưới'],
    slug: 'tam-ly-mau-sac-y-nghia-gam-mau-thiep-cuoi',
  },
  {
    id: 'ai-card-design',
    title: 'Cách Dearlove sử dụng AI để cá nhân hóa thiệp cho bạn',
    excerpt: 'Công nghệ AI không chỉ là xu hướng — nó là tương lai của thiệp kỹ thuật số. Tìm hiểu cách Dearlove ứng dụng machine learning để tạo thiệp độc đáo.',
    category: BLOG_CATEGORIES[3],
    image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=600&h=400&fit=crop',
    author: AUTHORS.linh,
    publishedAt: '2026-08-16',
    readTime: 7,
    tags: ['AI', 'Công nghệ'],
    slug: 'cach-dearlove-su-dung-ai-ca-nhan-hoa-thiep',
  },
  {
    id: 'minimalist-wedding-cards',
    title: 'Phong cách Minimalism trong thiệp cưới: Đơn giản nhưng không tầm thường',
    excerpt: 'Less is more — triết lý thiết kế tối giản đang được giới trẻ yêu thích. Những chiếc thiệp cưới minimal đầy sang trọng với vài nét chạm khắc tinh tế.',
    category: BLOG_CATEGORIES[2],
    image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&h=400&fit=crop',
    author: AUTHORS.hoang,
    publishedAt: '2026-08-14',
    readTime: 5,
    tags: ['Minimalism', 'Xu hướng'],
    slug: 'phong-cach-minimalism-thiep-cuoi',
  },
  {
    id: 'cultural-wedding-cards-vn',
    title: 'Kết hợp văn hóa Việt vào thiệp cưới hiện đại',
    excerpt: 'Từ hoa văn áo dài đến họa tiết gốm sứ, văn hóa Việt Nam mang đến nguồn cảm hứng bất tận. Cùng khám phá cách các cặp đôi đang sáng tạo thiệp cưới đậm chất Việt.',
    category: BLOG_CATEGORIES[4],
    image: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=600&h=400&fit=crop',
    author: AUTHORS.thinh,
    publishedAt: '2026-08-12',
    readTime: 6,
    tags: ['Văn hóa Việt', 'Truyền thống'],
    slug: 'ket-hop-van-hoa-viet-thiep-cuoi-hien-dai',
  },
  {
    id: 'wedding-photography-tips',
    title: '5 tips chụp ảnh cưới để thiệp của bạn thêm phần ấn tượng',
    excerpt: 'Một bức ảnh đẹp là nền tảng cho thiệp cưới hoàn hảo. Nhiếp ảnh gia chuyên nghiệp chia sẻ những mẹo quý giá giúp bạn có những khoảnh khắc đáng nhớ.',
    category: BLOG_CATEGORIES[1],
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop',
    author: AUTHORS.hoang,
    publishedAt: '2026-08-10',
    readTime: 4,
    tags: ['Nhiếp ảnh', 'Tips'],
    slug: '5-tips-chup-anh-cuoi-thiep-dep',
  },
  {
    id: 'dearlove-story',
    title: 'Câu chuyện Dearlove: Hành trình 5 năm kiến tạo thiệp cưới số',
    excerpt: 'Từ một startup nhỏ trong căn phòng trọ đến nền tảng thiệp số hàng đầu Việt Nam — hành trình của Dearlove là câu chuyện về đam mê, sáng tạo và không ngừng học hỏi.',
    category: BLOG_CATEGORIES[5],
    image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=600&h=400&fit=crop',
    author: AUTHORS.linh,
    publishedAt: '2026-08-08',
    readTime: 10,
    tags: ['Câu chuyện', 'Dearlove'],
    slug: 'cau-chuyen-dearlove-hanh-trinh-5-nam',
  },
  {
    id: 'choosing-color-palette',
    title: 'Chọn bảng màu thiệp cưới hoàn hảo cho mùa thu',
    excerpt: 'Mùa thu với sắc vàng, cam, đỏ rust mang đến nguồn cảm hứng tuyệt vời cho thiệp cưới ấm áp. Cùng khám phá những bảng màu hot nhất 2026.',
    category: BLOG_CATEGORIES[4],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
    author: AUTHORS.hoang,
    publishedAt: '2026-08-06',
    readTime: 5,
    tags: ['Màu sắc', 'Mùa thu'],
    slug: 'chon-bang-mau-thiep-cuoi-mua-thu',
  },
  {
    id: 'music-wedding-cards',
    title: 'Thiệp cưới có nhạc nền: Xu hướng mới gây sốt 2026',
    excerpt: 'Khi thiệp cưới không chỉ hiển thị mà còn "kể chuyện" qua âm nhạc — bạn đã sẵn sàng cho cuộc cách mạng này chưa?',
    category: BLOG_CATEGORIES[2],
    image: 'https://images.unsplash.com/photo-1500627965408-b5f2c8793d4d?w=600&h=400&fit=crop',
    author: AUTHORS.thinh,
    publishedAt: '2026-08-04',
    readTime: 6,
    tags: ['Nhạc', 'Xu hướng 2026'],
    slug: 'thiep-cuoi-co-nhac-nen-xu-huong-moi',
  },
  {
    id: 'save-the-date',
    title: 'Save the date thông minh: 5 lời khuyên để khách không quên',
    excerpt: 'Làm sao để thiệp Save the date của bạn thật ấn tượng và khách mời không thể quên? Đây là 5 bí quyết từ chuyên gia.',
    category: BLOG_CATEGORIES[3],
    image: 'https://images.unsplash.com/photo-1525258946800-98cfd641d0de?w=600&h=400&fit=crop',
    author: AUTHORS.linh,
    publishedAt: '2026-08-02',
    readTime: 4,
    tags: ['Save the date', 'Hướng dẫn'],
    slug: 'save-the-date-thong-minh-5-loi-khuyen',
  },
]

// Helper to format date
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
