import type { LucideIcon } from 'lucide-react'
import {
  Heart, Cake, PartyPopper, Sparkles, GraduationCap, Baby,
  Briefcase, MessageCircleHeart,
} from 'lucide-react'

/**
 * Centralized site data.
 *
 * Anything that's content/configuration lives here so sections stay
 * declarative and App.tsx remains a thin orchestrator.
 */

export const IMAGES = {
  wedding: '/images/lifestyle.png',
  birthday: '/images/editorial.png',
  congrats: '/images/clinical-product.png',
  festival: '/images/supplements.png',
  gift1: '/images/lifestyle.png',
  gift2: '/images/editorial.png',
  gift3: '/images/clinical-product.png',
  gift4: '/images/supplements.png',
  logo: '/logo.png',
  // Hero wedding gallery
  hero1: '/images/wedding-1.jpg',
  hero2: '/images/wedding-2.jpg',
  hero3: '/images/wedding-3.jpg',
  hero4: '/images/wedding-4.jpg',
  hero5: '/images/wedding-5.jpg',
  hero6: '/images/wedding-6.jpg',
} as const

export interface Category {
  id: string
  name: string
  icon: LucideIcon
  from: string
  to: string
  shadow: string
}

export const CATEGORIES: Category[] = [
  { id: 'wedding',   name: 'Thiệp Cưới',   icon: Heart,              from: '#be123c', to: '#e0a422', shadow: 'rgba(190, 18, 60, 0.45)'  },
  { id: 'birthday',  name: 'Sinh Nhật',    icon: Cake,               from: '#f59e0b', to: '#ea580c', shadow: 'rgba(234, 88, 12, 0.45)'  },
  { id: 'congrats',  name: 'Chúc Mừng',    icon: PartyPopper,        from: '#a855f7', to: '#db2777', shadow: 'rgba(219, 39, 119, 0.45)' },
  { id: 'festival',  name: 'Lễ Tết',       icon: Sparkles,           from: '#dc2626', to: '#f59e0b', shadow: 'rgba(220, 38, 38, 0.45)'  },
  { id: 'graduate',  name: 'Tốt Nghiệp',   icon: GraduationCap,      from: '#4f46e5', to: '#7c3aed', shadow: 'rgba(124, 58, 237, 0.45)' },
  { id: 'baby',      name: 'Thai Sản',     icon: Baby,               from: '#f472b6', to: '#ec4899', shadow: 'rgba(236, 72, 153, 0.45)' },
  { id: 'career',    name: 'Thăng Tiến',   icon: Briefcase,          from: '#10b981', to: '#047857', shadow: 'rgba(4, 120, 87, 0.45)'   },
  { id: 'love',      name: 'Tình Yêu',     icon: MessageCircleHeart, from: '#ec4899', to: '#be185d', shadow: 'rgba(190, 24, 93, 0.45)'  },
]

export const FAQS: Array<[string, string]> = [
  ['Tôi có thể tạo thiệp miễn phí không?', 'Có! Chúng tôi cung cấp hơn 100 mẫu thiệp miễn phí cho tất cả các dịp. Bạn chỉ cần đăng ký tài khoản và bắt đầu thiết kế ngay.'],
  ['Có thể tùy chỉnh nội dung thiệp không?', 'Hoàn toàn có thể. Bạn có thể thay đổi văn bản, hình ảnh, màu sắc, font chữ và thêm nhạc nền cho mỗi thiệp của mình.'],
  ['Làm sao để gửi thiệp cho bạn bè?', 'Sau khi hoàn tất thiết kế, bạn có thể gửi qua đường link, email, Zalo hoặc QR code. Thiệp sẽ được gửi đến người nhận trong vài giây.'],
  ['Có thể in thiệp ra giấy không?', 'Có. Chúng tôi hỗ trợ in thiệp chất lượng cao với nhiều kích thước và chất liệu giấy khác nhau, giao hàng tận nơi trong 2-3 ngày.'],
  ['Thiệp của tôi có được bảo mật không?', 'Mọi thiệp đều có mật khẩu riêng nếu bạn muốn. Chỉ những người bạn chia sẻ mới có thể xem được thiệp của bạn.'],
  ['Có chính sách hoàn tiền không?', 'Có. Nếu không hài lòng với mẫu thiệp, bạn có thể yêu cầu hoàn tiền trong vòng 7 ngày.'],
]

export const BLOG_POSTS: Array<[string, string, string, string]> = [
  ['Mẹo thiết kế', '10 mẹo tạo thiệp cưới đẹp và ấn tượng', 'Chọn tone màu, font chữ, bố cục và những chi tiết nhỏ giúp thiệp cưới của bạn thật sự nổi bật và giàu cảm xúc.', IMAGES.wedding],
  ['Xu hướng 2026', 'Những xu hướng thiệp mời hot nhất năm 2026', 'Cập nhật phong cách thiết kế, hiệu ứng động và chất liệu được yêu thích nhất trong năm nay.', IMAGES.birthday],
  ['Hướng dẫn', 'Cách tạo thiệp sinh nhật độc đáo trong 5 phút', 'Bốn bước đơn giản từ chọn mẫu, cá nhân hoá nội dung đến gửi thiệp đến bạn bè, người thân.', IMAGES.congrats],
  ['Cảm hứng', 'Ý tưởng thiệp Tết handmade đầy ý nghĩa', 'Gợi ý những ý tưởng làm thiệp Tết thủ công tinh tế, gửi gắm lời chúc ấm áp đến người thân yêu.', IMAGES.festival],
]

export const NAV_LINKS = ['Trang Chủ', 'Mẫu Thiệp', 'Giá Cả', 'Blog', 'Liên Hệ'] as const

export const FOOTER_SECTIONS: Array<[string, ...string[]]> = [
  ['Sản phẩm', 'Thiệp cưới', 'Thiệp sinh nhật', 'Thiệp chúc mừng', 'Thiệp lễ Tết'],
  ['Công ty', 'Giới thiệu', 'Tuyển dụng', 'Báo chí', 'Đối tác'],
  ['Hỗ trợ', 'Trung tâm hỗ trợ', 'Điều khoản', 'Bảo mật', 'Liên hệ'],
]

/**
 * Canonical label → URL mapping shared by <Header /> and the
 * placeholder page. Keep in sync with the <Route /> declarations in
 * App.tsx — any new public page should be added here too.
 */
export const ROUTE_BY_LABEL: Record<string, string> = {
  'Trang Chủ': '/',
  'Mẫu Thiệp': '/templates',
  'Giá Cả': '/pricing',
  'Blog': '/blog',
  'Liên Hệ': '/contact',
  'Hỗ Trợ': '/support',
}