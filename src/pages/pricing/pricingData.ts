/**
 * Pricing data — single source of truth for the /pricing page.
 *
 * Plan tiers and limits are mirrored from the zenlove reference HTML
 * (see pricing-package/pages/pricing/index.html). All numbers are
 * displayed exactly as provided; no values are made up.
 */

export type BillingCycle = 'monthly' | 'yearly'

export interface PlanLimit {
  label: string
  value: string
}

export interface PlanFeature {
  label: string
  /** true = supported, false = not in plan */
  included: boolean
}

export interface PricingPlan {
  id: 'free' | 'basic' | 'premium'
  name: string
  /** Hero currency display — empty string means free plan */
  priceLabel: string
  /** Strikethrough original price, only shown when present */
  originalPriceLabel?: string
  /** Discount badge content, e.g. "-43%" */
  discountBadge?: string
  /** Optional countdown / urgency line shown under the price */
  countdown?: string
  /** CTA button label */
  ctaLabel: string
  /** Highlight this card (popular / featured) */
  featured?: boolean
  /** Featured ribbon text */
  ribbon?: string
  /** Border accent colour for the price — matches zenlove source */
  priceColorClass: string
  limits: PlanLimit[]
  features: PlanFeature[]
  footerNote?: string
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    priceLabel: 'Miễn phí',
    ctaLabel: 'Tạo tài khoản miễn phí',
    priceColorClass: 'text-green-600',
    limits: [
      { label: 'Giới hạn hình ảnh', value: '10 ảnh' },
      { label: 'Lượt xem tối đa', value: '300 lượt' },
      { label: 'Số thiệp có thể tạo', value: '1 thiệp' },
      { label: 'Thời hạn lưu thiệp', value: '6 tháng' },
      { label: 'Sử dụng mẫu thiệp', value: 'Miễn phí' },
    ],
    features: [
      { label: 'Tạo website cưới cơ bản', included: true },
      { label: 'Quản lý khách mời', included: true },
      { label: 'Hiệu ứng động cơ bản', included: true },
      { label: 'Nhạc nền thư viện', included: true },
      { label: 'Tùy chỉnh màu sắc', included: true },
      { label: 'Album ảnh không giới hạn', included: false },
      { label: 'Video nền & hiệu ứng cao cấp', included: false },
      { label: 'Tên khách mời tự động', included: false },
      { label: 'Hỗ trợ ưu tiên 24/7', included: false },
    ],
  },
  {
    id: 'basic',
    name: 'Basic Plan',
    priceLabel: '169,000',
    originalPriceLabel: '299,000',
    discountBadge: '-43%',
    countdown: 'Ưu đãi kết thúc sau 14:31:27',
    ctaLabel: 'Nâng cấp Basic Plan ngay',
    priceColorClass: 'text-blue-600',
    limits: [
      { label: 'Giới hạn hình ảnh', value: '50 ảnh' },
      { label: 'Lượt xem tối đa', value: '10K lượt' },
      { label: 'Số thiệp có thể tạo', value: '5 thiệp' },
      { label: 'Thời hạn lưu thiệp', value: '2 năm' },
      { label: 'Sử dụng mẫu thiệp', value: 'Cơ bản' },
    ],
    features: [
      { label: 'Tạo website cưới cơ bản', included: true },
      { label: 'Quản lý khách mời', included: true },
      { label: 'Hiệu ứng động cơ bản', included: true },
      { label: 'Nhạc nền thư viện', included: true },
      { label: 'Tùy chỉnh màu sắc', included: true },
      { label: 'Album ảnh không giới hạn', included: true },
      { label: 'Video nền & hiệu ứng cao cấp', included: false },
      { label: 'Tên khách mời tự động', included: false },
      { label: 'Hỗ trợ ưu tiên 24/7', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    priceLabel: '269,000',
    originalPriceLabel: '499,000',
    discountBadge: '-46%',
    countdown: 'Ưu đãi kết thúc sau 14:31:26',
    ctaLabel: 'Nâng cấp Premium Plan ngay',
    featured: true,
    ribbon: 'Gói tốt nhất',
    priceColorClass: 'text-orange-500',
    limits: [
      { label: 'Giới hạn hình ảnh', value: '100 ảnh' },
      { label: 'Lượt xem tối đa', value: '50K lượt' },
      { label: 'Số thiệp có thể tạo', value: '10 thiệp' },
      { label: 'Thời hạn lưu thiệp', value: '5 năm' },
      { label: 'Sử dụng mẫu thiệp', value: 'Toàn bộ' },
    ],
    features: [
      { label: 'Tạo website cưới cơ bản', included: true },
      { label: 'Quản lý khách mời', included: true },
      { label: 'Hiệu ứng động cơ bản', included: true },
      { label: 'Nhạc nền thư viện', included: true },
      { label: 'Tùy chỉnh màu sắc', included: true },
      { label: 'Album ảnh không giới hạn', included: true },
      { label: 'Video nền & hiệu ứng cao cấp', included: true },
      { label: 'Tên khách mời tự động', included: true },
      { label: 'Hỗ trợ ưu tiên 24/7', included: true },
    ],
  },
]

export interface ComparisonRow {
  /** Section header rendered across the full row */
  category?: string
  label: string
  values: [string, string, string]
}

export const COMPARISON_TABLE: ComparisonRow[] = [
  { category: 'Giới hạn gói', label: '', values: ['', '', ''] },
  { label: 'Giới hạn hình ảnh', values: ['10 ảnh', '50 ảnh', '100 ảnh'] },
  { label: 'Lượt xem tối đa', values: ['300 lượt', '10K lượt', '50K lượt'] },
  { label: 'Số thiệp có thể tạo', values: ['1 thiệp', '5 thiệp', '10 thiệp'] },
  { label: 'Thời hạn lưu thiệp', values: ['6 tháng', '2 năm', '5 năm'] },
  { label: 'Sử dụng mẫu thiệp', values: ['Miễn phí', 'Cơ bản', 'Toàn bộ'] },
  { category: 'Tính năng', label: '', values: ['', '', ''] },
  { label: 'Tạo website cưới cơ bản', values: ['✓', '✓', '✓'] },
  { label: 'Quản lý khách mời', values: ['✓', '✓', '✓'] },
  { label: 'Hiệu ứng động cơ bản', values: ['✓', '✓', '✓'] },
  { label: 'Nhạc nền thư viện', values: ['✓', '✓', '✓'] },
  { label: 'Tùy chỉnh màu sắc', values: ['✓', '✓', '✓'] },
  { label: 'Album ảnh không giới hạn', values: ['—', '✓', '✓'] },
  { label: 'Video nền & hiệu ứng cao cấp', values: ['—', '—', '✓'] },
  { label: 'Tên khách mời tự động', values: ['—', '—', '✓'] },
  { label: 'Hỗ trợ ưu tiên 24/7', values: ['—', '—', '✓'] },
]

export interface PricingFaq {
  q: string
  a: string
}

export const PRICING_FAQS: PricingFaq[] = [
  {
    q: 'Tôi có thể nâng cấp gói dịch vụ sau khi đăng ký không?',
    a: 'Tất nhiên rồi! Bạn hoàn toàn có thể nâng cấp lên gói cao hơn bất cứ lúc nào để mở khóa thêm nhiều tính năng hấp dẫn. Chỉ cần đăng nhập và chọn mục nâng cấp, hệ thống sẽ hỗ trợ bạn ngay lập tức.',
  },
  {
    q: 'Thời hạn lưu trữ website/thiệp là gì?',
    a: 'Đây là khoảng thời gian thiệp cưới online của bạn "sống" trên internet để mọi người có thể vào xem. Tại ZenLove, thời gian này rất dài để bạn lưu giữ kỷ niệm: 6 tháng với gói Free, 2 năm với gói Basic và tới 5 năm với gói Premium. Sau khi hết hạn lưu trữ, website sẽ dừng hoạt động và dữ liệu sẽ được xóa sau 30 ngày.',
  },
  {
    q: 'Tôi có thể tạo bao nhiêu thiệp hoặc website?',
    a: 'Tùy vào nhu cầu sử dụng của bạn, ZenLove hỗ trợ số lượng khác nhau: Gói Free tạo được 1 thiệp, Basic 5 thiệp và Premium 10 thiệp. Nếu bạn là đơn vị dịch vụ hoặc cần nhiều hơn, bạn luôn có thể mua thêm số lượng một cách dễ dàng.',
  },
  {
    q: 'Lượt xem trang/thiệp tối đa là gì?',
    a: 'Hiểu đơn giản là tổng số lần khách mời mở thiệp của bạn ra xem. Mỗi lần ai đó bấm vào link (hoặc tải lại trang) đều được tính là 1 lượt. Gói Free hỗ trợ 300 lượt, Basic là 10.000 và Premium lên tới 50.000 lượt xem - thoải mái cho đám cưới quy mô lớn. Nếu hết lượt xem, bạn chỉ cần nâng cấp hoặc mua thêm gói bổ trợ (addon) để thiệp hoạt động trở lại nhé.',
  },
  {
    q: 'Tôi có được sử dụng template Basic và Premium không?',
    a: 'Gói Basic sẽ mở khóa kho giao diện (template) chuyên nghiệp, tinh tế. Đặc biệt, nếu chọn gói Premium, bạn sẽ sở hữu "đặc quyền" truy cập toàn bộ kho giao diện, bao gồm cả các mẫu Premium độc quyền với hiệu ứng và tính năng cao cấp nhất tại ZenLove.',
  },
  {
    q: 'Gói dịch vụ có thời hạn bao lâu?',
    a: 'Các gói trả phí (Basic/Premium) có hiệu lực tài khoản là 1 năm. Trong 1 năm này, bạn được toàn quyền tạo và chỉnh sửa thiệp. Sau khi hết 1 năm, nếu không gia hạn, bạn sẽ không thể tạo mới hay chỉnh sửa, NHƯNG các thiệp bạn đã xuất bản vẫn sẽ hoạt động bình thường cho đến khi hết "Thời hạn lưu trữ" (2 năm hoặc 5 năm tùy gói bạn đã mua).',
  },
  {
    q: 'Tôi có thể tạo bao nhiêu Tên khách mời tự động?',
    a: 'Tin vui là ZenLove không giới hạn số lượng khách mời! Bạn có thể nhập danh sách hàng trăm người chỉ với 1 cú click (nhập thủ công hoặc tải lên file Excel/CSV). Hệ thống cũng giúp bạn quản lý xem ai đã nhận được thiệp, ai chưa, cực kỳ tiện lợi.',
  },
]

export interface PricingReason {
  emoji: string
  title: string
  body: string
}

export const PRICING_REASONS: PricingReason[] = [
  {
    emoji: '💯',
    title: 'Thiết kế độc quyền',
    body: 'Truy cập các mẫu thiệp cao cấp, độc quyền chỉ có tại ZenLove, được thiết kế bởi các chuyên gia',
  },
  {
    emoji: '🎥',
    title: 'Đa phương tiện',
    body: 'Tích hợp video, album ảnh và âm nhạc cho thiệp cưới ấn tượng',
  },
  {
    emoji: '🔧',
    title: 'Tùy chỉnh hoàn toàn',
    body: 'Điều chỉnh mọi chi tiết để phản ánh phong cách riêng của bạn',
  },
]
