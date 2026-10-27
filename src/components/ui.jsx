import { Link } from 'react-router-dom'
import { euro, lc } from '../data/offre'
import { useOffre } from '../content/OffreContext'

export function SectionHead({ eyebrow, title, children, align = 'left', className = '' }) {
  return (
    <div className={`${align === 'center' ? 'mx-auto text-center' : ''} max-w-2xl ${className}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="h-section mt-3">{title}</h2>
      {children && <p className="lead mt-4">{children}</p>}
    </div>
  )
}

export function Arrow({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 10h11M11 5.5 15.5 10 11 14.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Titre posé en haut à gauche de la photo catalogue (ne masque pas les vêtements) */
export function Bandeau({ m, grand = false }) {
  return (
    <div className="absolute left-4 top-4 max-w-[80%] rounded-lg bg-indigo px-4 py-2.5 shadow-md">
      <p className={`font-display font-extrabold leading-[1.05] text-white ${grand ? 'text-xl sm:text-2xl' : 'text-lg'}`}>{m.nom}</p>
      {grand && m.pieces?.length > 0 && <p className="mt-1 truncate text-xs font-medium text-gold sm:text-sm">{m.pieces.join(' · ')}</p>}
    </div>
  )
}

export function Etiquette({ children, className = '' }) {
  return (
    <span className={`absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-indigo shadow-sm ${className}`}>
      <span className="h-2 w-2 rounded-full ring-2 ring-gold" aria-hidden="true" />{children}
    </span>
  )
}

/** Scène métier : photo + bandeau-titre + étiquette « technique · emplacement » */
export function SceneCard({ m, to }) {
  return (
    <Link to={to} className="group block">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#d6d5d3]">
        <img src={m.img} alt={`Tenues personnalisées — ${m.nom}`} loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" style={{ transformOrigin: 'bottom' }} />
        <Bandeau m={m} />
        <Etiquette>{m.label}</Etiquette>
      </div>
    </Link>
  )
}

export function PackCard({ p, dark = false }) {
  const [min, prix] = p.paliers[p.paliers.length - 1]
  const [min0, prix0] = p.paliers[0]
  return (
    <article className={`flex flex-col overflow-hidden rounded-xl border ${dark ? 'border-white/10 bg-white/5' : 'border-ink-line bg-white'}`}>
      <div className="relative aspect-[16/10] overflow-hidden bg-indigo-mist">
        <img src={p.img} alt="" loading="lazy" className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${dark ? 'text-gold' : 'text-gold-deep'}`}>Pack {p.nom}</p>
        <h3 className={`mt-2 font-display text-lg font-bold leading-snug ${dark ? 'text-white' : 'text-indigo'}`}>{p.contenu} — {lc(p.marquage)}</h3>
        <p className={`mt-2 text-sm ${dark ? 'text-indigo-soft' : 'text-ink-muted'}`}>{p.pour}</p>
        <div className={`mt-5 pt-4 ${dark ? 'border-t border-dashed border-gold/60' : 'stitch-top'}`}>
          <p className={`text-sm ${dark ? 'text-indigo-soft' : 'text-ink-muted'}`}>dès {min} pièces</p>
          <p className={`font-display text-3xl font-extrabold ${dark ? 'text-white' : 'text-indigo'}`}>
            {euro(prix)} <span className="font-sans text-sm font-medium opacity-70">HT / {p.unite || 'pièce'}</span>
          </p>
          <p className={`mt-1 text-xs ${dark ? 'text-indigo-soft/80' : 'text-ink-muted'}`}>{euro(prix0)} HT dès {min0} pièces</p>
        </div>
        <Link to={`/devis?pack=${p.id}`} className={`mt-6 ${dark ? 'btn-gold' : 'btn-outline'} py-2.5 text-sm`}>Demander ce pack</Link>
      </div>
    </article>
  )
}

export function Faq({ items }) {
  return (
    <div className="divide-y divide-ink-line border-y border-ink-line">
      {items.map(([q, a]) => (
        <details key={q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-display text-lg font-semibold text-indigo [&::-webkit-details-marker]:hidden">
            {q}
            <span className="mt-1 text-gold-deep transition-transform group-open:rotate-45" aria-hidden="true">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 4v12M4 10h12" strokeLinecap="round" /></svg>
            </span>
          </summary>
          <p className="mt-3 max-w-3xl leading-relaxed text-ink-muted">{a}</p>
        </details>
      ))}
    </div>
  )
}

export function CtaBand() {
  const { CONTACT } = useOffre()
  return (
    <section className="bg-paper">
      <div className="wrap py-16 md:py-20">
        <div className="relative overflow-hidden rounded-2xl bg-indigo px-6 py-12 text-center md:px-16">
          <span className="stitch-frame !inset-3" aria-hidden="true" />
          <h2 className="font-display text-3xl font-extrabold text-white md:text-4xl">Un projet de tenues pour vos équipes ?</h2>
          <p className="mx-auto mt-4 max-w-xl text-indigo-soft">Décrivez-le en deux minutes. Vous recevez un devis détaillé et une maquette de votre logo.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/devis" className="btn-gold">Demander un devis <Arrow /></Link>
            <a href={CONTACT.telHref} className="btn-secondary">Appeler le {CONTACT.tel}</a>
          </div>
        </div>
      </div>
    </section>
  )
}
