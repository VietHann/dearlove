import { useEffect } from 'react'
import { BrowserRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { ParallaxPetals } from './components'
import { Header } from './sections/Header'
import { HeroSection } from './sections/HeroSection'
import { ProblemsSection } from './sections/ProblemsSection'
import { CategoriesSection } from './sections/CategoriesSection'
import ImageStreamHeroSection from './sections/ImageStreamHeroSection'
import { FeaturesSection } from './sections/FeaturesSection'
import TemplatesSection from './sections/TemplatesSection'
import WhyChooseSection from './sections/WhyChooseSection'
import { BlogSection } from './sections/BlogSection'
import { FaqSection } from './sections/FaqSection'
import { Footer } from './sections/Footer'
import Pricing from './pages/pricing/Pricing'
import Templates from './pages/templates/Templates'
import Contact from './pages/contact/Contact'
import Blog from './pages/blog/Blog'
import Auth from './pages/auth/Auth'
import PlaceholderPage from './pages/PlaceholderPage'
import { LegalPage } from './pages/LegalPage'
import Account from './pages/account/Account'
import OrderPage from './pages/orders/OrderPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminOrderDetail from './pages/admin/AdminOrderDetail'
import AdminMedia from './pages/admin/AdminMedia'
import AdminCatalog from './pages/admin/AdminCatalog'
import AdminContent from './pages/admin/AdminContent'
import AdminPricing from './pages/admin/AdminPricing'
import AdminBlog from './pages/admin/AdminBlog'
import { PublishedHomeContent } from './pages/content/PublishedContent'

/**
 * Shared layout — used by most pages so the Header / Footer / global
 * petals stay in sync across the site. Pages render their own content
 * via <Outlet />.
 */
function Layout() {
  const location = useLocation()

  // Scroll-to-top on route change so each page starts at the top instead
  // of preserving the previous page's scroll position.
  useEffect(() => {
    const lenis = (window as any).__lenis as
      | { scrollTo: (target: number | string, opts?: object) => void }
      | undefined
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <Header />
      <Outlet />
      <Footer />
    </div>
  )
}

function HomePage() {
  const fallback = (
    <>
      <main className="relative">
        <ParallaxPetals />

        <HeroSection />
        <ProblemsSection />
        <CategoriesSection />
        <ImageStreamHeroSection />
        <FeaturesSection />
        <TemplatesSection />
        <WhyChooseSection />
        <BlogSection />
        <FaqSection />
      </main>
    </>
  )

  return <PublishedHomeContent fallback={fallback} />
}

/**
 * App — page orchestrator.
 *
 * Each visual region lives in its own section under ./sections.
 * App.tsx just declares the page composition and runs cross-cutting
 * side effects (JS-ready class on <html>).
 */
function App() {
  useEffect(() => {
    document.documentElement.classList.add('js-ready')
    return () => document.documentElement.classList.remove('js-ready')
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth page — full-screen split layout, no Header/Footer */}
        <Route path="/auth" element={<Auth />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:orderId" element={<AdminOrderDetail />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="catalog" element={<AdminCatalog />} />
          <Route path="catalog/templates" element={<AdminCatalog />} />
          <Route path="catalog/categories" element={<AdminCatalog />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="pricing" element={<AdminPricing />} />
          <Route path="blog" element={<AdminBlog />} />
        </Route>

        {/* All other pages share the Layout with Header + Footer */}
        <Route element={<Layout />}>
          <Route
            path="/"
            element={<HomePage />}
          />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/categories" element={<PlaceholderPage />} />
          <Route path="/about" element={<PlaceholderPage />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/support" element={<PlaceholderPage />} />
          <Route path="/forgot-password" element={<PlaceholderPage />} />
          <Route path="/terms" element={<LegalPage kind="terms" />} />
          <Route path="/privacy" element={<LegalPage kind="privacy" />} />
          <Route path="/account" element={<Account />} />
          <Route path="/order/:templateId" element={<OrderPage />} />
          {/* Catch-all: send unknown routes to a friendly placeholder */}
          <Route path="*" element={<PlaceholderPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
