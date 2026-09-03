/**
 * Auth page data — single source of truth for /auth.
 *
 * Social login options, form field configs, and copy in Vietnamese
 * to match the marketing site's voice.
 */

import type { LucideIcon } from 'lucide-react'
import { FacebookIcon, GoogleIcon } from './AuthIcons'

type SocialIcon = (props: { className?: string }) => JSX.Element

export interface SocialProvider {
  id: 'facebook' | 'google'
  name: string
  Icon: SocialIcon
  /** Background gradient for the button */
  gradient: string
  /** Hover gradient */
  gradientHover: string
  /** Brand colors */
  brandColor: string
  /** Short label shown on the button */
  label: string
}

export const SOCIAL_PROVIDERS: SocialProvider[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    Icon: FacebookIcon,
    gradient: 'from-[#1877F2] to-[#0a4ea8]',
    gradientHover: 'hover:from-[#0a4ea8] hover:to-[#1877F2]',
    brandColor: '#1877F2',
    label: 'Facebook',
  },
  {
    id: 'google',
    name: 'Google',
    Icon: GoogleIcon,
    gradient: 'from-white to-gray-50',
    gradientHover: 'hover:from-gray-50 hover:to-white',
    brandColor: '#4285F4',
    label: 'Google',
  },
]

export interface AuthField {
  id: string
  name: string
  label: string
  type: 'text' | 'email' | 'password'
  placeholder: string
  autoComplete?: string
  required?: boolean
}

export const LOGIN_FIELDS: AuthField[] = [
  {
    id: 'email',
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'email@example.com',
    autoComplete: 'email',
    required: true,
  },
  {
    id: 'password',
    name: 'password',
    label: 'Mật khẩu',
    type: 'password',
    placeholder: 'Nhập mật khẩu của bạn',
    autoComplete: 'current-password',
    required: true,
  },
]

export const REGISTER_FIELDS: AuthField[] = [
  {
    id: 'fullName',
    name: 'fullName',
    label: 'Họ và tên',
    type: 'text',
    placeholder: 'Nguyễn Văn A',
    autoComplete: 'name',
    required: true,
  },
  {
    id: 'email',
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'email@example.com',
    autoComplete: 'email',
    required: true,
  },
  {
    id: 'password',
    name: 'password',
    label: 'Mật khẩu',
    type: 'password',
    placeholder: 'Ít nhất 8 ký tự',
    autoComplete: 'new-password',
    required: true,
  },
  {
    id: 'confirmPassword',
    name: 'confirmPassword',
    label: 'Xác nhận mật khẩu',
    type: 'password',
    placeholder: 'Nhập lại mật khẩu',
    autoComplete: 'new-password',
    required: true,
  },
]

export const AUTH_PAGE_CONTENT = {
  login: {
    title: 'Đăng nhập',
    subtitle: 'Chào mừng bạn quay trở lại!',
    description: 'Đăng nhập để quản lý thiệp, theo dõi đơn hàng và nhận ưu đãi đặc biệt.',
    submitLabel: 'Đăng nhập',
    switchText: 'Chưa có tài khoản?',
    switchLink: 'Đăng ký ngay',
    forgotPassword: 'Quên mật khẩu?',
    orText: 'Hoặc đăng nhập với',
  },
  register: {
    title: 'Tạo tài khoản',
    subtitle: 'Tham gia cùng Dearlove',
    description: 'Tạo tài khoản miễn phí để bắt đầu tạo những thiệp đẹp cho dịp đặc biệt của bạn.',
    submitLabel: 'Tạo tài khoản',
    switchText: 'Đã có tài khoản?',
    switchLink: 'Đăng nhập',
    termsText: 'Khi đăng ký, bạn đồng ý với',
    termsLink: 'Điều khoản sử dụng',
    orText: 'Hoặc đăng ký với',
  },
}
