import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Packs from './pages/Packs'
import Solutions from './pages/Solutions'
import Devis from './pages/Devis'
import CGV from './pages/CGV'
import Login from './pages/Login'
import EspaceClient from './pages/EspaceClient'
import Admin from './pages/Admin'
import ResetPassword from './pages/ResetPassword'
import ForgotPassword from './pages/ForgotPassword'
import { OffreProvider } from './content/OffreContext'
import { SITE_URL, seoFor } from './seo'

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el) }
  el.setAttribute('content', content)
}

/** Met à jour titre, description et adresse canonique à chaque changement de page. */
function useSeo() {
  const { pathname } = useLocation()
  useEffect(() => {
    const seo = seoFor(pathname)
    const robots = document.head.querySelector('meta[name="robots"]')
    if (!seo) {
      if (robots) robots.setAttribute('content', 'noindex')
      return
    }
    robots?.remove()
    document.title = seo.title
    setMeta('name', 'description', seo.description)
    setMeta('property', 'og:title', seo.title)
    setMeta('property', 'og:description', seo.description)
    setMeta('property', 'og:url', SITE_URL + pathname)
    let link = document.head.querySelector('link[rel="canonical"]')
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link) }
    link.href = SITE_URL + (pathname === '/' ? '/' : pathname)
  }, [pathname])
}

export function AppRoutes() {
  useSeo()
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/packs"         element={<Packs />} />
          <Route path="/solutions"     element={<Solutions />} />
          <Route path="/realisations"  element={<Navigate to="/solutions" replace />} />
          <Route path="/devis"         element={<Devis />} />
          <Route path="/cgv"           element={<CGV />} />
          <Route path="/login"                  element={<Login />} />
          <Route path="/espace-client"         element={<EspaceClient />} />
          <Route path="/admin-tenuepro-2026"   element={<Admin />} />
          <Route path="/reset-password"        element={<ResetPassword />} />
          <Route path="/forgot-password"       element={<ForgotPassword />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App({ initialOffre = null }) {
  return (
    <BrowserRouter>
      <OffreProvider initial={initialOffre}>
        <AppRoutes />
      </OffreProvider>
    </BrowserRouter>
  )
}
