import { Link } from 'react-router-dom'
import { useOffre } from '../content/OffreContext'

export default function Footer() {
  const { CONTACT } = useOffre()
  return (
    <footer className="bg-indigo-deep text-indigo-soft">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link to="/" className="flex items-center gap-2.5" aria-label="TenuePro, accueil">
            <img src="/images/mark-white.png" alt="" className="h-7 w-auto" />
            <span className="font-display text-xl font-extrabold text-white">TenuePro</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            Tenues professionnelles personnalisées pour les entreprises : broderie, flocage et impression DTF, contrôlées et livrées à La Réunion.
          </p>
          <p className="mt-4 text-sm font-semibold text-gold">{CONTACT.zone}</p>
        </div>
        <div>
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white">Offre</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/solutions" className="hover:text-white">Solutions par métier</Link></li>
            <li><Link to="/packs" className="hover:text-white">Packs & tarifs</Link></li>
            <li><Link to="/#techniques" className="hover:text-white">Techniques</Link></li>
            <li><Link to="/devis" className="hover:text-white">Demander un devis</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-white">Contact</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><a href={CONTACT.telHref} className="hover:text-white">{CONTACT.tel}</a></li>
            <li><a href={`mailto:${CONTACT.email}`} className="hover:text-white">{CONTACT.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-2 py-5 text-xs text-indigo-soft/70 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} TenuePro — Nexova EI</span>
          <Link to="/cgv" className="hover:text-white">Conditions générales de vente</Link>
        </div>
      </div>
    </footer>
  )
}
