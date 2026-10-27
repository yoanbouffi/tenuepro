import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const LINKS = [
  { to: '/solutions', label: 'Solutions par métier' },
  { to: '/packs', label: 'Packs & tarifs' },
  { to: '/#techniques', label: 'Techniques' },
  { to: '/#methode', label: 'Méthode' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { user, signOut } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => setOpen(false), [location])

  // Ancre (/#techniques) : défilement après navigation
  useEffect(() => {
    if (!location.hash) { window.scrollTo(0, 0); return }
    const t = setTimeout(() => document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' }), 60)
    return () => clearTimeout(t)
  }, [location.pathname, location.hash])

  const linkCls = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-indigo' : 'text-ink-muted hover:text-indigo'}`

  return (
    <header className={`fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur transition-shadow ${scrolled ? 'shadow-[0_1px_0_#DCD8EA]' : ''}`}>
      <div className="wrap flex h-16 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="TenuePro, accueil">
          <img src="/images/mark-indigo.png" alt="" className="h-7 w-auto" />
          <span className="font-display text-xl font-extrabold tracking-tight text-indigo">TenuePro</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigation principale">
          {LINKS.map((l) => l.to.includes('#')
            ? <Link key={l.to} to={l.to} className="text-sm font-medium text-ink-muted transition-colors hover:text-indigo">{l.label}</Link>
            : <NavLink key={l.to} to={l.to} className={linkCls}>{l.label}</NavLink>)}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          {user ? (
            <div className="group relative">
              <button className="text-sm font-medium text-ink-muted hover:text-indigo">Mon espace</button>
              <div className="invisible absolute right-0 top-full w-52 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="rounded-lg border border-ink-line bg-white p-1.5 shadow-lg">
                  <Link to="/espace-client" className="block rounded-md px-3 py-2 text-sm hover:bg-indigo-mist">Suivi de mes commandes</Link>
                  <button onClick={() => signOut()} className="block w-full rounded-md px-3 py-2 text-left text-sm text-ink-muted hover:bg-indigo-mist">Déconnexion</button>
                </div>
              </div>
            </div>
          ) : (
            null
          )}
          <Link to="/devis" className="btn-primary px-4 py-2 text-sm">Demander un devis</Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="-mr-2 rounded-md p-2 text-indigo lg:hidden"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            {open ? <path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" /> : <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-line bg-white lg:hidden">
          <nav className="wrap flex flex-col py-3" aria-label="Navigation mobile">
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="py-3 font-medium text-ink">{l.label}</Link>
            ))}
            {user ? (
              <>
                <Link to="/espace-client" className="py-3 font-medium text-ink">Suivi de mes commandes</Link>
                <button onClick={() => signOut()} className="py-3 text-left font-medium text-ink-muted">Déconnexion</button>
              </>
            ) : (
              null
            )}
            <Link to="/devis" className="btn-primary mt-2 mb-2">Demander un devis</Link>
          </nav>
        </div>
      )}
    </header>
  )
}
