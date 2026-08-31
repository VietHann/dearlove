import { useEffect } from 'react'
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

/**
 * App — page orchestrator.
 *
 * Each visual region lives in its own section under ./sections.
 * App.tsx just declares the page composition and runs cross-cutting
 * side effects (JS-ready class on <html>).
 */
function App() {
  useEffect(() => {
    // Signal JS is ready so legacy CSS classes can hide elements
    document.documentElement.classList.add('js-ready')
    return () => document.documentElement.classList.remove('js-ready')
  }, [])

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <Header />

      <main className="relative">
        {/* Parallax floating petals — driven by Framer Motion + Lenis */}
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

      <Footer />
    </div>
  )
}

export default App