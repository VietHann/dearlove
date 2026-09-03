import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Eye, EyeOff, Loader2, ArrowRight, Phone } from 'lucide-react'
import { IMAGES } from '../../lib/constants'
import { SOCIAL_PROVIDERS, LOGIN_FIELDS, REGISTER_FIELDS, AUTH_PAGE_CONTENT } from './authData'

import './auth.css'

/**
 * Auth — centered form with 6 decorative wedding-card mockups surrounding it.
 *
 * Layout:
 * - Full-page soft gradient background
 * - 6 wedding card mockups (CSS-only, no images) positioned around center
 * - Form card locked in the middle
 * - Mobile: cards scale down / hide, form takes full width
 */
export default function Auth() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (activeTab === 'login') {
      if (!formData.email) newErrors.email = 'Vui lòng nhập email'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email không hợp lệ'
      }
      if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu'
    } else {
      if (!formData.fullName) newErrors.fullName = 'Vui lòng nhập họ và tên'
      if (!formData.email) newErrors.email = 'Vui lòng nhập email'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email không hợp lệ'
      }
      if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu'
      else if (formData.password.length < 8) {
        newErrors.password = 'Mật khẩu phải ít nhất 8 ký tự'
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
  }

  const handleSocialLogin = (providerId: string) => {
    console.log(`Login with ${providerId}`)
  }

  const currentFields = activeTab === 'login' ? LOGIN_FIELDS : REGISTER_FIELDS
  const content = AUTH_PAGE_CONTENT[activeTab]

  return (
    <div className="auth-root">
      {/* ===== WEDDING CARD MOCKUPS (decorative background) ===== */}

      {/* Card 1 — Top Left: Classic Red & Gold Vietnamese */}
      <div className="auth-card-mock auth-card-1" aria-hidden="true">
        <div className="acm-border-top" />
        <div className="acm-inner">
          <div className="acm-ornament acm-ornament--top">✦ ✦ ✦</div>
          <p className="acm-pre">Save the Date</p>
          <div className="acm-couple">Minh & Lan</div>
          <div className="acm-date">14 · 02 · 2026</div>
          <div className="acm-divider" />
          <p className="acm-venue">Nhà hàng Thiên Đường</p>
          <p className="acm-address">123 Nguyễn Trãi, Q.1, TP.HCM</p>
          <div className="acm-ornament acm-ornament--bottom">♥</div>
        </div>
        <div className="acm-border-bottom" />
      </div>

      {/* Card 2 — Top Right: Blush Pink & Floral */}
      <div className="auth-card-mock auth-card-2" aria-hidden="true">
        <div className="acm-inner">
          <div className="acm-rose-border" />
          <p className="acm-pre acm-pre--blush">We're getting married</p>
          <div className="acm-couple acm-couple--blush">Thu & Khoa</div>
          <div className="acm-divider acm-divider--blush" />
          <p className="acm-venue acm-venue--blush">Garden Villa Resort</p>
          <div className="acm-date acm-date--blush">08 · 03 · 2026</div>
          <div className="acm-ornament acm-ornament--roses">🌸 🌷 🌹</div>
        </div>
      </div>

      {/* Card 3 — Right Middle: Burgundy & Botanical */}
      <div className="auth-card-mock auth-card-3" aria-hidden="true">
        <div className="acm-inner">
          <div className="acm-monogram acm-monogram--dark">TK</div>
          <p className="acm-pre acm-pre--dark">Together with their families</p>
          <div className="acm-couple acm-couple--dark">Trung & Kim</div>
          <div className="acm-divider acm-divider--dark" />
          <div className="acm-details">
            <span>Ngày</span>
            <strong>20 · 04 · 2026</strong>
          </div>
          <div className="acm-details">
            <span>Địa điểm</span>
            <strong>Palm Garden</strong>
          </div>
          <div className="acm-ornament acm-ornament--botanical">🍃 ✦ 🍂</div>
        </div>
      </div>

      {/* Card 4 — Bottom Right: Navy & Rose Gold Modern */}
      <div className="auth-card-mock auth-card-4" aria-hidden="true">
        <div className="acm-inner">
          <div className="acm-pre acm-pre--navy">Formal Announcement</div>
          <div className="acm-initials">H & A</div>
          <div className="acm-date acm-date--navy">25 · 05 · 2026</div>
          <div className="acm-divider acm-divider--navy" />
          <p className="acm-venue acm-venue--navy">Saigon Marriott Hotel</p>
          <p className="acm-address acm-address--navy"> Đường Nguyễn Huệ, Q.1</p>
          <div className="acm-ornament acm-ornament--gold">✦ ✦ ✦</div>
        </div>
      </div>

      {/* Card 5 — Bottom Left: Sage Green & Botanical */}
      <div className="auth-card-mock auth-card-5" aria-hidden="true">
        <div className="acm-inner">
          <div className="acm-ornament acm-ornament--leaf">🌿 ✦ 🌿</div>
          <p className="acm-pre acm-pre--sage">Wedding Celebration</p>
          <div className="acm-couple acm-couple--sage">Nam & Phương</div>
          <div className="acm-divider acm-divider--sage" />
          <div className="acm-details acm-details--sage">
            <span>Ngày</span>
            <strong>10 · 06 · 2026</strong>
          </div>
          <div className="acm-details acm-details--sage">
            <span>Địa điểm</span>
            <strong>Vườn HOA Villa</strong>
          </div>
        </div>
      </div>

      {/* Card 6 — Left Middle: Purple & Gold Luxury */}
      <div className="auth-card-mock auth-card-6" aria-hidden="true">
        <div className="acm-inner">
          <div className="acm-ornament acm-ornament--crown">♕</div>
          <p className="acm-pre acm-pre--purple">You're invited to</p>
          <div className="acm-couple acm-couple--purple">Văn & My</div>
          <div className="acm-divider acm-divider--purple" />
          <p className="acm-venue acm-venue--purple">Riverside Palace</p>
          <div className="acm-date acm-date--purple">18 · 07 · 2026</div>
          <div className="acm-ornament acm-ornament--sparkle">✦ ♥ ✦</div>
        </div>
      </div>

      {/* ===== CENTER FORM CARD ===== */}
      <main className="auth-center">
        {/* Logo */}
        <Link to="/" className="auth-logo" aria-label="Dearlove - Trang chủ">
          <img src={IMAGES.logo} alt="Dearlove" className="auth-logo-img" />
        </Link>

        <div className="auth-form-card">
          {/* Brand tagline above tabs */}
          <p className="auth-brand-tagline">
            <Heart size={14} className="auth-brand-heart" />
            Thiệp cưới đẹp cho ngày trọng đại
          </p>

          {/* Tab switcher */}
          <div className="auth-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'login'}
              className={`auth-tab ${activeTab === 'login' ? 'auth-tab--active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Đăng nhập
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'register'}
              className={`auth-tab ${activeTab === 'register' ? 'auth-tab--active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              Đăng ký
            </button>
          </div>

          {/* Heading */}
          <h1 className="auth-form-title">
            {activeTab === 'login'
              ? 'Chào mừng bạn quay lại!'
              : 'Tạo tài khoản miễn phí'}
          </h1>
          <p className="auth-form-subtitle">
            {activeTab === 'login'
              ? 'Đăng nhập để quản lý thiệp và đơn hàng'
              : 'Bắt đầu tạo thiệp đẹp cho ngày trọng đại'}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {currentFields.map(field => (
              <div key={field.id} className="auth-form-group">
                <label htmlFor={field.id} className="auth-label">
                  {field.label}
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id={field.id}
                    name={field.name}
                    type={
                      field.id === 'password'
                        ? showPassword ? 'text' : 'password'
                        : field.id === 'confirmPassword'
                        ? showConfirmPassword ? 'text' : 'password'
                        : field.type
                    }
                    placeholder={field.placeholder}
                    autoComplete={field.autoComplete}
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    className={`auth-input ${errors[field.id] ? 'auth-input--error' : ''}`}
                    aria-invalid={!!errors[field.id]}
                    aria-describedby={errors[field.id] ? `${field.id}-error` : undefined}
                  />
                  {(field.id === 'password' || field.id === 'confirmPassword') && (
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() =>
                        field.id === 'password'
                          ? setShowPassword(!showPassword)
                          : setShowConfirmPassword(!showConfirmPassword)
                      }
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {field.id === 'password' ? (
                        showPassword ? <EyeOff size={16} /> : <Eye size={16} />
                      ) : showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  )}
                </div>
                {errors[field.id] && (
                  <p id={`${field.id}-error`} className="auth-error" role="alert">
                    {errors[field.id]}
                  </p>
                )}
              </div>
            ))}

            {/* Forgot Password (Login only) */}
            {activeTab === 'login' && (
              <div className="auth-forgot-row">
                <Link to="/forgot-password" className="auth-forgot-link">
                  Quên mật khẩu?
                </Link>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="auth-btn-loading">
                  <Loader2 size={18} className="auth-spin" />
                  Đang xử lý...
                </span>
              ) : (
                <span className="auth-btn-content">
                  {content.submitLabel}
                  <ArrowRight size={16} />
                </span>
              )}
            </button>

            {/* Social Divider */}
            <div className="auth-social-divider">
              <span className="auth-social-divider-text">{content.orText}</span>
            </div>

            {/* Social Login Buttons */}
            <div className="auth-social-buttons">
              {SOCIAL_PROVIDERS.map(provider => (
                <button
                  key={provider.id}
                  type="button"
                  className={`auth-social-btn auth-social-btn--${provider.id}`}
                  onClick={() => handleSocialLogin(provider.id)}
                >
                  <provider.Icon />
                  <span>{provider.label}</span>
                </button>
              ))}
            </div>

            {/* Footer Links */}
            <div className="auth-footer">
              {activeTab === 'login' ? (
                <p className="auth-footer-text">
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    className="auth-switch-link"
                    onClick={() => setActiveTab('register')}
                  >
                    Đăng ký ngay
                  </button>
                </p>
              ) : (
                <>
                  <p className="auth-terms-text">
                    Khi đăng ký, bạn đồng ý với{' '}
                    <Link to="/terms" className="auth-terms-link">Điều khoản</Link>
                    {' '}và{' '}
                    <Link to="/privacy" className="auth-terms-link">Chính sách bảo mật</Link>
                  </p>
                  <p className="auth-footer-text">
                    Đã có tài khoản?{' '}
                    <button
                      type="button"
                      className="auth-switch-link"
                      onClick={() => setActiveTab('login')}
                    >
                      Đăng nhập
                    </button>
                  </p>
                </>
              )}
            </div>
          </form>
        </div>

        {/* Help section */}
        <div className="auth-help-section">
          <p className="auth-help-text">
            Cần hỗ trợ?{' '}
            <a href="tel:19006868" className="auth-help-link">
              <Phone size={13} />
              1900 6868
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
