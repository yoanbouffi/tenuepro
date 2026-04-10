import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { user, signOut } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  const links = [
    { to: '/', label: 'Accueil' },
    { to: '/packs', label: 'Nos Packs' },
    { to: '/realisations', label: 'Réalisations' },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-[#7C3AED] rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold text-sm">TP</span>
            </div>
            <span className="font-extrabold text-xl text-gray-900">
              Tenue<span className="text-[#7C3AED]">Pro</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`font-medium text-sm transition-colors duration-200 ${
                  location.pathname === to
                    ? 'text-[#7C3AED]'
                    : 'text-gray-700 hover:text-[#7C3AED]'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* CTA Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/espace-client"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-[#7C3AED] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Mon espace
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-[#7C3AED] transition-colors">
                  Connexion client
                </Link>
                <Link to="/devis" className="btn-primary text-sm py-2 px-5">
                  Devis gratuit
                </Link>
              </>
            )}
          </div>

          {/* Burger Mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-[#7C3AED] hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-2">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`block py-3 px-4 rounded-lg font-medium transition-colors ${
                  location.pathname === to
                    ? 'text-[#7C3AED] bg-red-50'
                    : 'text-gray-700 hover:text-[#7C3AED] hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/espace-client" className="block py-3 px-4 rounded-lg font-medium text-gray-700 hover:text-[#7C3AED] hover:bg-gray-50 transition-colors">
                  Mon espace client
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left py-3 px-4 rounded-lg font-medium text-gray-500 hover:text-red-500 hover:bg-gray-50 transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-3 px-4 rounded-lg font-medium text-gray-700 hover:text-[#7C3AED] hover:bg-gray-50 transition-colors">
                  Connexion client
                </Link>
                <Link to="/devis" className="block mt-2 btn-primary justify-center text-center">
                  Devis gratuit
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
