import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Boxes,
  ChevronRight,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Mail,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'
import { authClient } from '../../lib/auth-client'
import { adminReturnTo } from '../../lib/admin-api'
import './admin.css'

const NAV_GROUPS = [
  {
    label: 'Điều hành',
    items: [
      { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard, end: true },
      { to: '/admin/orders', label: 'Đơn hàng', icon: ClipboardList },
      { to: '/admin/contacts', label: 'Liên hệ', icon: Mail },
    ],
  },
  {
    label: 'Nội dung',
    items: [
      { to: '/admin/content', label: 'Content Hub', icon: FileText },
      { to: '/admin/catalog', label: 'Catalog', icon: Boxes },
    ],
  },
  {
    label: 'Vận hành',
    items: [
      { to: '/admin/contacts', label: 'Liên hệ', icon: Mail },
      { to: '/admin/newsletter', label: 'Newsletter', icon: Mail },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      { to: '/admin/users', label: 'Người dùng', icon: Users },
      { to: '/admin/audit-log', label: 'Audit log', icon: ShieldCheck },
    ],
  },
] as const

function isAdminSession(session: unknown): boolean {
  const user = (session as { user?: { role?: string; status?: string } } | null)?.user
  return user?.role === 'admin' && user.status !== 'suspended'
}

function LoadingScreen() {
  return (
    <main className="admin-loading" aria-live="polite">
      <div className="admin-loading-mark"><Settings2 size={20} aria-hidden="true" /></div>
      <p>Đang xác thực quyền quản trị...</p>
    </main>
  )
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: session, isPending } = authClient.useSession()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isPending && (!session || !isAdminSession(session))) {
      navigate(adminReturnTo(location.pathname, location.search), { replace: true })
    }
  }, [isPending, location.pathname, location.search, navigate, session])

  if (isPending || !session || !isAdminSession(session)) return <LoadingScreen />

  const user = session.user

  return (
    <div className="admin-app">
      <a className="admin-skip-link" href="#admin-main">Bỏ qua điều hướng</a>
      <button
        type="button"
        className={`admin-backdrop ${drawerOpen ? 'is-visible' : ''}`}
        aria-label="Đóng menu quản trị"
        onClick={() => setDrawerOpen(false)}
      />
      <aside className={`admin-sidebar ${drawerOpen ? 'is-open' : ''}`} aria-label="Điều hướng quản trị">
        <div className="admin-sidebar-top">
          <NavLink to="/admin" className="admin-brand" aria-label="Dearlove Admin - Tổng quan">
            <span className="admin-brand-mark">D</span>
            <span>
              <strong>Dearlove</strong>
              <small>Admin studio</small>
            </span>
          </NavLink>
          <button type="button" className="admin-icon-button admin-sidebar-close" aria-label="Đóng menu quản trị" onClick={() => setDrawerOpen(false)}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <nav className="admin-nav">
          {NAV_GROUPS.map(group => (
            <div className="admin-nav-group" key={group.label}>
              <p className="admin-nav-label">{group.label}</p>
              <div className="admin-nav-list">
                {group.items.map(item => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={'end' in item && item.end}
                      className={({ isActive }) => `admin-nav-link ${isActive ? 'is-active' : ''}`}
                    >
                      <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                      <span>{item.label}</span>
                      <ChevronRight className="admin-nav-chevron" size={15} aria-hidden="true" />
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-card">
            <div className="admin-user-avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</div>
            <div className="admin-user-copy">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <button type="button" className="admin-signout" onClick={async () => { await authClient.signOut(); navigate('/auth?mode=login', { replace: true }) }}>
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="admin-content-shell">
        <header className="admin-mobile-header">
          <button type="button" className="admin-icon-button" aria-label="Mở menu quản trị" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(true)}>
            {drawerOpen ? <PanelLeftClose size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
          <NavLink to="/admin" className="admin-mobile-brand">Dearlove <span>Admin</span></NavLink>
          <NavLink to="/" className="admin-view-site">Xem site</NavLink>
        </header>
        <main id="admin-main" className="admin-main">
          <div className="admin-breadcrumb" aria-label="Breadcrumb">
            <NavLink to="/admin">Admin</NavLink>
            {location.pathname !== '/admin' && <><ChevronRight size={14} aria-hidden="true" /><span>{location.pathname.split('/').filter(Boolean).slice(-1)[0]}</span></>}
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
