/**
 * Contact page data — single source of truth for /contact.
 *
 * Channels mirror the support presence Dearlove actually has on
 * zenlove/ZenLove (Facebook, Zalo, email, hotline). All copy is in
 * Vietnamese to match the marketing site.
 */

import type { LucideIcon } from 'lucide-react'
import {
  Facebook,
  Mail,
  MessageCircle,
  Phone,
  Clock,
  MapPin,
  Sparkles,
  HelpCircle,
  Briefcase,
  Megaphone,
  ShieldCheck,
  type LucideIcon as _LucideIconAlias,
} from 'lucide-react'

export interface ContactChannel {
  id: string
  name: string
  description: string
  /** Primary action label, e.g. "Nhắn tin ngay" */
  ctaLabel: string
  /** href the CTA button opens */
  href: string
  /** Open in new tab? */
  external?: boolean
  Icon: LucideIcon
  /** Tailwind gradient from-to classes */
  gradient: string
  /** Soft pastel bg for the icon bubble */
  iconBg: string
  /** Icon foreground color (Tailwind text class) */
  iconColor: string
  /** Subtle border ring color */
  ring: string
  /** Response time hint, e.g. "Phản hồi trong vòng 30 phút" */
  responseTime: string
}

export const CONTACT_CHANNELS: ContactChannel[] = [
  {
    id: 'facebook',
    name: 'Facebook Messenger',
    description:
      'Trò chuyện trực tiếp với đội ngũ Dearlove qua fanpage. Phù hợp cho các câu hỏi về mẫu thiệp, thiết kế.',
    ctaLabel: 'Nhắn tin Messenger',
    href: 'https://m.me/zenlove.me',
    external: true,
    Icon: Facebook,
    gradient: 'from-[#1877F2] via-[#0f6fe0] to-[#0a4ea8]',
    iconBg: 'bg-[#1877F2]/10',
    iconColor: 'text-[#1877F2]',
    ring: 'ring-[#1877F2]/15 hover:ring-[#1877F2]/35',
    responseTime: 'Phản hồi trong vòng 30 phút',
  },
  {
    id: 'zalo',
    name: 'Zalo OA',
    description:
      'Kết nối nhanh qua Zalo — kênh phổ biến nhất tại Việt Nam. Gửi ảnh mẫu, trao đổi file thuận tiện và bảo mật.',
    ctaLabel: 'Chat qua Zalo',
    href: 'https://zalo.me/zenlove',
    external: true,
    Icon: MessageCircle,
    gradient: 'from-[#0068FF] via-[#0052cc] to-[#003e9e]',
    iconBg: 'bg-[#0068FF]/10',
    iconColor: 'text-[#0068FF]',
    ring: 'ring-[#0068FF]/15 hover:ring-[#0068FF]/35',
    responseTime: 'Phản hồi trong vòng 1 giờ',
  },
  {
    id: 'email',
    name: 'Email',
    description:
      'Gửi yêu cầu chi tiết, báo giá hợp tác hoặc đính kèm tài liệu kỹ thuật. Phù hợp cho trao đổi chính thức.',
    ctaLabel: 'Gửi email',
    href: 'mailto:hello@dearlove.vn',
    external: true,
    Icon: Mail,
    gradient: 'from-[#d9a441] via-[#e0a422] to-[#b91c1c]',
    iconBg: 'bg-[#d9a441]/12',
    iconColor: 'text-[#b91c1c]',
    ring: 'ring-[#d9a441]/25 hover:ring-[#d9a441]/50',
    responseTime: 'Phản hồi trong vòng 4 giờ làm việc',
  },
  {
    id: 'hotline',
    name: 'Hotline ưu tiên',
    description:
      'Đường dây nóng dành cho khách hàng gói Premium và đối tác. Hỗ trợ nhanh các sự cố trong ngày.',
    ctaLabel: 'Gọi 1900 6868',
    href: 'tel:1900686868',
    external: true,
    Icon: Phone,
    gradient: 'from-[#10b981] via-[#0ea968] to-[#047857]',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    ring: 'ring-emerald-200 hover:ring-emerald-300',
    responseTime: 'Trực tiếp — 24/7 cho gói Premium',
  },
]

export interface ContactSupportTopic {
  id: string
  title: string
  body: string
  Icon: LucideIcon
}

export const CONTACT_SUPPORT_TOPICS: ContactSupportTopic[] = [
  {
    id: 'help-center',
    title: 'Trung tâm hỗ trợ',
    body: 'Kho hướng dẫn từng bước, video thao tác và câu trả lời nhanh cho mọi tình huống bạn gặp phải.',
    Icon: HelpCircle,
  },
  {
    id: 'business',
    title: 'Hợp tác kinh doanh',
    body: 'Đại lý, studio cưới, dịch vụ in ấn và KOLs — vui lòng gửi portfolio để được báo giá gói đối tác riêng.',
    Icon: Briefcase,
  },
  {
    id: 'press',
    title: 'Báo chí & truyền thông',
    body: 'Yêu cầu phỏng vấn, cung cấp tài liệu báo chí hoặc hợp tác nội dung — đội ngũ PR sẽ liên hệ lại trong 48 giờ.',
    Icon: Megaphone,
  },
  {
    id: 'safety',
    title: 'Báo cáo vi phạm',
    body: 'Phát hiện nội dung vi phạm bản quyền, lừa đảo hoặc nội dung không phù hợp — chúng tôi xử lý trong 24 giờ.',
    Icon: ShieldCheck,
  },
]

export interface OfficeLocation {
  city: string
  address: string
  hours: string
  phone: string
  isHQ?: boolean
}

export const OFFICE_LOCATIONS: OfficeLocation[] = [
  {
    city: 'Hà Nội (Trụ sở chính)',
    address: 'Tầng 8, Tòa nhà ZenTower, 18 Phố Huế, Quận Hai Bà Trưng',
    hours: 'Thứ 2 — Thứ 7, 09:00 — 18:00',
    phone: '(024) 7300 6868',
    isHQ: true,
  },
  {
    city: 'TP. Hồ Chí Minh',
    address: 'Tầng 5, Toà nhà Loving, 222 Điện Biên Phủ, Quận Bình Thạnh',
    hours: 'Thứ 2 — Thứ 7, 09:00 — 18:00',
    phone: '(028) 7300 6868',
  },
  {
    city: 'Đà Nẵng',
    address: 'Tầng 3, Toà nhà Biển Xanh, 78 Bạch Đằng, Quận Hải Châu',
    hours: 'Thứ 2 — Thứ 6, 09:00 — 17:30',
    phone: '(0236) 7300 6868',
  },
]

export interface ContactFaq {
  q: string
  a: string
}

export const CONTACT_FAQS: ContactFaq[] = [
  {
    q: 'Tôi có thể nhận tư vấn thiết kế thiệp miễn phí không?',
    a: 'Có. Đội ngũ Dearlove hỗ trợ tư vấn ý tưởng, màu sắc và bố cục miễn phí cho mọi khách hàng. Bạn chỉ cần gửi yêu cầu qua form hoặc nhắn tin Messenger/Zalo, chúng tôi sẽ phản hồi trong vòng 30 phút trong giờ làm việc.',
  },
  {
    q: 'Thời gian phản hồi trung bình của Dearlove là bao lâu?',
    a: 'Trong giờ hành chính (09:00 — 18:00, Thứ 2 — Thứ 7), thời gian phản hồi trung bình là 30 phút qua Messenger và Zalo, 4 giờ qua email. Ngoài giờ làm việc, các yêu cầu sẽ được xử lý vào đầu giờ làm việc ngày hôm sau. Khách hàng gói Premium được hỗ trợ 24/7 qua hotline ưu tiên.',
  },
  {
    q: 'Tôi có thể đến văn phòng Dearlove để xem mẫu thiệp trực tiếp không?',
    a: 'Hoàn toàn được. Dearlove có 3 văn phòng tại Hà Nội, TP. HCM và Đà Nẵng. Bạn nên đặt lịch trước ít nhất 24 giờ qua hotline hoặc form liên hệ để chúng tôi chuẩn bị mẫu thiệp phù hợp và sắp xếp nhân viên tư vấn chuyên trách.',
  },
  {
    q: 'Dearlove có hỗ trợ in thiệp vật lý không?',
    a: 'Có. Ngoài thiệp online, Dearlove liên kết với các đối tác in ấn uy tín để cung cấp dịch vụ in thiệp giấy cao cấp với nhiều chất liệu: couche, mỹ thuật, ánh kim, ép foil… Thời gian in trung bình 2 — 3 ngày làm việc, giao hàng tận nơi toàn quốc.',
  },
  {
    q: 'Làm sao để trở thành đối tác của Dearlove?',
    a: 'Chúng tôi luôn chào đòn các studio cưới, thợ ảnh, dịch vụ in ấn và KOLs. Vui lòng gửi email đến partners@dearlove.vn kèm portfolio và bảng giá dịch vụ hiện tại. Đội ngũ hợp tác kinh doanh sẽ liên hệ lại trong vòng 48 giờ làm việc.',
  },
  {
    q: 'Tôi cần hỗ trợ khẩn cấp trong ngày cưới, phải làm sao?',
    a: 'Khách hàng gói Premium có đường dây hotline ưu tiên hoạt động 24/7. Trong trường hợp khẩn cấp (sự cố thiệp, link lỗi, ảnh không hiển thị…), vui lòng gọi 1900 6868 và nhấn phím 1 để được kết nối trực tiếp với chuyên viên kỹ thuật.',
  },
]

export interface OfficeHour {
  Icon: LucideIcon
  label: string
  value: string
}

export const CONTACT_OFFICE_HOURS: OfficeHour[] = [
  { Icon: Clock, label: 'Giờ làm việc', value: '09:00 — 18:00, Thứ 2 — Thứ 7' },
  { Icon: MapPin, label: 'Văn phòng', value: '3 chi nhánh: HN · HCM · Đà Nẵng' },
  { Icon: Sparkles, label: 'Khách Premium', value: 'Hỗ trợ ưu tiên 24/7' },
]

// Re-export the alias so unused-import lint doesn't trip on _LucideIconAlias.
export type { _LucideIconAlias }
