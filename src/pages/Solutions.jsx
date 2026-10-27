import { Link } from 'react-router-dom'
import { euro, lc } from '../data/offre'
import { useOffre } from '../content/OffreContext'
import { CtaBand, Arrow, Bandeau, Etiquette } from '../components/ui'

export default function Solutions() {
  const { METIERS, PACKS } = useOffre()
  return (
    <>
      <section className="bg-paper pt-16">
        <div className="wrap py-14 md:py-20">
          <p className="eyebrow">Solutions par métier</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-indigo sm:text-5xl">
            La bonne tenue pour votre activité.
          </h1>
          <p className="lead mt-5 max-w-2xl">
            Chaque métier a ses contraintes : lavages fréquents, soleil, chantier, image de marque. Voici ce que nous recommandons, secteur par secteur.
          </p>
          <nav className="mt-8 flex flex-wrap gap-2" aria-label="Métiers">
            {METIERS.map((m) => (
              <a key={m.id} href={`#${m.id}`} className="rounded-full border border-ink-line bg-white px-4 py-2 text-sm font-medium text-indigo hover:border-indigo">{m.nom}</a>
            ))}
          </nav>
        </div>
      </section>

      <div className="bg-white">
        {METIERS.map((m, i) => {
          const pack = PACKS.find((p) => p.id === m.pack)
          if (!pack) return null
          const [, prix] = pack.paliers[pack.paliers.length - 1]
          return (
            <section key={m.id} id={m.id} className="scroll-mt-20 border-b border-ink-line last:border-0">
              <div className={`wrap grid items-center gap-10 py-16 md:grid-cols-2 md:gap-16 ${i % 2 ? 'md:[&>*:first-child]:order-2' : ''}`}>
                <div className="relative overflow-hidden rounded-2xl bg-indigo-mist">
                  <img src={m.img} alt={`Tenues personnalisées — ${m.nom}`} loading="lazy" className="aspect-[16/11] w-full object-cover" />
                  <Bandeau m={m} grand />
                  <Etiquette>{m.label}</Etiquette>
                </div>
                <div>
                  <p className="eyebrow">{String(i + 1).padStart(2, '0')}</p>
                  <h2 className="mt-2 font-display text-3xl font-extrabold text-indigo">{m.nom}</h2>
                  <p className="lead mt-4">{m.texte}</p>
                  <div className="stitch mt-6 pl-4">
                    <p className="text-sm font-semibold text-ink">Pièces recommandées</p>
                    <p className="text-ink-muted">{m.pieces.join(' · ')}</p>
                  </div>
                  <div className="mt-6 rounded-xl bg-indigo-mist p-5">
                    <p className="text-sm text-ink-muted">Pack conseillé : <span className="font-semibold text-indigo">{pack.nom}</span> — {lc(pack.contenu)}, {lc(pack.marquage)}</p>
                    <p className="mt-1 font-display text-xl font-bold text-indigo">dès {euro(prix)} HT / {pack.unite || 'pièce'}</p>
                  </div>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link to={`/devis?pack=${pack.id}&secteur=${encodeURIComponent(m.secteur)}`} className="btn-primary">Demander un devis <Arrow /></Link>
                    <Link to="/packs" className="btn-outline">Comparer les packs</Link>
                  </div>
                </div>
              </div>
            </section>
          )
        })}
      </div>

      <CtaBand />
    </>
  )
}
