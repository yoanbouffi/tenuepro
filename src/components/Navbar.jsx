import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { DevisButton } from './DevisButton' // Ajuste le chemin si besoin

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { user, signOut } = useAuth()

  // Gestion de l'ombre au scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fermer le menu mobile en changeant de page
  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  const links = [
    { to: '/', label: 'Accueil' },
    { to: '/packs', label: 'Nos Packs' },
    { to: '/realisations', label: 'Réalisations' },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link title="Retour à l'accueil" to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <img
              src="https://res.cloudinary.com/djq5gqxmj/image/upload/v1776790674/Tenuepro_logo-01_ljmuen.png"
              alt="TenuePro"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Nav Desktop (Liens) */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`font-medium text-sm transition-all duration-200 relative pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#7C3AED] after:transition-all hover:after:w-full ${
                  location.pathname === to ? 'text-[#7C3AED] after:w-full' : 'text-gray-700 hover:text-[#7C3AED]'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Actions Desktop */}
          <div className="hidden md:flex items-center gap-3">
            
            {user ? (
              /* MENU MON ESPACE AU SURVOL */
              <div className="relative group">
                <button className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 hover:border-[#7C3AED] transition-all">
                  <svg className="w-4 h-4 text-[#7C3AED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Mon Espace</span>
                  <svg className="w-4 h-4 text-gray-400 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Déconnexion / Tableau de bord */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <Link to="/espace-client" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#7C3AED]/5 hover:text-[#7C3AED] rounded-md transition-colors">
                      Mon tableau de bord
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button 
                      onClick={() => signOut()}
                      className="flex w-full text-left px-4 py-2 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-md transition-colors"
                    >
                      Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* LIEN CONNEXION VISITEUR */
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-[#7C3AED] transition-colors px-2">
                Connexion
              </Link>
            )}

            {/* BOUTON DEVIS TOUJOURS VISIBLE */}
            <DevisButton className="bg-[#7C3AED] text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:bg-[#6D28D9] transition-all hover:scale-105 active:scale-95">
              Demander un devis gratuit
            </DevisButton>
            
          </div>

          {/* Menu Hamburger Mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
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

      {/* MOBILE MENU DROPDOWN */}
      <div className={`md:hidden absolute w-full bg-white border-t border-gray-100 shadow-lg transition-all duration-300 ease-in-out ${
        menuOpen ? 'max-h-[500px] opacity-100 visible' : 'max-h-0 opacity-0 invisible overflow-hidden'
      }`}>
        <div className="px-4 py-4 space-y-2">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`block py-3 px-4 rounded-lg font-medium transition-colors ${
                location.pathname === to ? 'text-[#7C3AED] bg-[#7C3AED]/5' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {label}
            </Link>
          ))}
          
          <hr className="my-2 border-gray-100" />
          
          <div className="flex flex-col gap-2 pt-2">
            {user ? (
              <>
                <Link to="/espace-client" className="block py-3 px-4 rounded-lg font-medium text-gray-700 hover:bg-gray-50">
                  Mon tableau de bord
                </Link>
                <button onClick={() => signOut()} className="block w-full text-left py-3 px-4 rounded-lg font-medium text-gray-500 hover:bg-red-50 hover:text-red-500">
                  Déconnexion
                </button>
              </>
            ) : (
              <Link to="/login" className="block py-3 px-4 rounded-lg font-medium text-gray-700 hover:bg-gray-50">
                Connexion
              </Link>
            )}
            
            <DevisButton className="bg-[#7C3AED] text-white text-center py-3 rounded-lg font-medium shadow-sm w-full block mt-2">
              Demander un devis gratuit
            </DevisButton>
          </div>
        </div>
      </div>
    </header>
  )
}