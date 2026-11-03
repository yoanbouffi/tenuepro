import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TECHNIQUES, ETAPES, PIECES, euro } from '../data/offre'
import { useOffre } from '../content/OffreContext'
import { Faq, Arrow } from '../components/ui'

const faq = (MINIMUM_PIECES) => [
  ['Quelle quantité minimum ?', `${MINIMUM_PIECES} pièces minimum par vêtement : par exemple ${MINIMUM_PIECES} t-shirts et ${MINIMUM_PIECES} casquettes. Les tailles peuvent être mélangées, et les prix baissent avec la quantité.`],
  ['Quels sont les délais ?', 'Comptez au minimum un mois entre la validation du devis et la livraison. Le délai exact dépend de la quantité, de la technique et des textiles, et il est confirmé sur votre devis. Une date impérative ? Indiquez-la dans votre demande.'],
  ['Mon logo doit-il être dans un format particulier ?', 'Un fichier vectoriel (AI, PDF, SVG) est idéal, mais un PNG ou un JPG de bonne qualité suffit pour démarrer. Nous préparons le fichier de broderie ou d’impression et vous montrons la maquette avant toute production.'],
  ['Pouvons-nous commencer par un seul service ?', 'Oui. Beaucoup de structures commencent par une équipe pilote. Votre logo est conservé : les commandes suivantes gardent exactement le même rendu.'],
  ['La livraison est-elle comprise ?', 'Nous livrons partout à La Réunion, à l’adresse de votre choix. La livraison est offerte à partir de 250 pièces ; en dessous, elle est facturée 15 € HT par commande.'],
  ['Travaillez-vous avec les collectivités ?', 'Oui. Nous établissons des devis détaillés pour les services publics, avec facturation via Chorus Pro.'],
]

/** Barre de devis rapide : pièce + quantité, puis le formulaire complet pré-rempli */
function DevisRapide({ minimum }) {
  const navigate = useNavigate()
  const [piece, setPiece] = useState('polos')
  const [qte, setQte] = useState(25)
  const go = (e) => {
    e.preventDefault()
    navigate(`/devis?piece=${piece}&qte=${Math.max(minimum, parseInt(qte, 10) || minimum)}`)
  }
  return (
    <form onSubmit={go} className="grid gap-2 rounded-[22px] bg-white p-2 shadow-[0_20px_50px_-20px_rgba(20,16,60,.55)] sm:grid-cols-[1.4fr_0.8fr_auto]">
      <label className="rounded-2xl px-4 py-2.5 hover:bg-paper focus-within:bg-paper">
        <span className="block text-xs font-medium text-ink-muted">Vous cherchez</span>
        <select value={piece} onChange={(e) => setPiece(e.target.value)} className="mt-0.5 w-full appearance-none bg-transparent font-semibold text-ink focus:outline-none">
          {PIECES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </label>
      <label className="rounded-2xl px-4 py-2.5 hover:bg-paper focus-within:bg-paper sm:border-l sm:border-ink-line sm:rounded-l-none">
        <span className="block text-xs font-medium text-ink-muted">Quantité</span>
        <input type="number" min={minimum} inputMode="numeric" value={qte} onChange={(e) => setQte(e.target.value)} className="mt-0.5 w-full bg-transparent font-semibold tabular-nums text-ink focus:outline-none" />
      </label>
      <button type="submit" className="btn-primary h-full min-h-[52px] rounded-2xl px-7">Recevoir mon devis</button>
    </form>
  )
}

/** Tarifs : un sélecteur de quantité qui met à jour toute la grille */
function Tarifs({ PACKS, PALIERS, SEUIL_DEVIS }) {
  const [i, setI] = useState(0)
  return (
    <section id="tarifs" className="scroll-mt-20 bg-white">
      <div className="wrap grid gap-12 py-20 md:py-28 lg:grid-cols-[0.9fr_1.4fr]">
        <div>
          <h2 className="h-section">Plus vous commandez, moins vous payez.</h2>
          <p className="lead mt-5 max-w-md">Prix par pièce, hors taxes, textile et marquage compris. Choisissez une quantité pour voir le prix de chaque pack.</p>
          <div role="radiogroup" aria-label="Quantité commandée" className="mt-8 inline-grid grid-cols-4 rounded-full bg-paper p-1">
            {PALIERS.map((q, j) => (
              <button key={q} type="button" role="radio" aria-checked={i === j} onClick={() => setI(j)}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold tabular-nums transition-colors sm:px-5 ${i === j ? 'bg-indigo text-white' : 'text-ink-muted hover:text-ink'}`}>
                {q}+
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-ink-muted">Au-delà de {SEUIL_DEVIS} pièces, prix sur devis.</p>
          <Link to="/packs" className="btn-link mt-8">Détail des packs et options <Arrow /></Link>
        </div>
        <ul className="divide-y divide-ink-line border-y border-ink-line">
          {PACKS.map((p) => {
            const prix = (p.paliers[i] || p.paliers.at(-1))[1]
            return (
              <li key={p.id}>
                <Link to={`/devis?pack=${p.id}`} className="group grid grid-cols-[64px_1fr_auto] items-center gap-4 py-4 sm:grid-cols-[88px_1fr_auto] sm:gap-6">
                  <img src={p.img} alt="" loading="lazy" className="aspect-square w-full rounded-xl object-cover" />
                  <div className="min-w-0">
                    <p className="font-display text-lg font-bold text-ink">{p.nom}</p>
                    <p className="truncate text-sm text-ink-muted">{p.contenu} · {p.marquage}</p>
                  </div>
                  <p className="text-right">
                    <span className="block font-display text-2xl font-extrabold tabular-nums text-indigo">{euro(prix)}</span>
                    <span className="text-xs text-ink-muted">HT / {p.unite || 'pièce'}</span>
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export default function Home() {
  const { METIERS, PACKS, MINIMUM_PIECES, PALIERS, SEUIL_DEVIS } = useOffre()
  const FAQ = faq(MINIMUM_PIECES)
  const parId = Object.fromEntries(METIERS.map((m) => [m.id, m]))
  const grands = ['restauration', 'hotellerie', 'btp', 'entreprise'].map((id) => parId[id]).filter(Boolean)
  const autres = METIERS.filter((m) => !grands.includes(m))

  return (
    <>
      {/* ── Ouverture : photo plein cadre + devis rapide ─────────────── */}
      <section className="bg-white px-3 pt-[76px] sm:px-4">
        <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[28px] bg-indigo-deep">
          <img src="/images/hero-equipe.webp" alt="Équipe en polos marine brodés au logo de l’entreprise, devant une case créole à La Réunion"
            className="absolute inset-0 h-full w-full object-cover object-[62%_35%]" fetchpriority="high" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#120c3f]/90 via-[#120c3f]/55 to-transparent" aria-hidden="true" />
          <div className="relative flex min-h-[620px] flex-col justify-end px-6 pb-8 pt-28 sm:px-10 md:min-h-[680px] md:px-14 md:pb-12">
            <h1 className="max-w-[13ch] font-display text-[2.7rem] font-extrabold leading-[0.98] tracking-[-0.03em] text-white sm:text-6xl lg:text-[5rem]">
              Les tenues de vos équipes, à vos couleurs.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
              Polos, vestes, maillots, tabliers : un seul interlocuteur à La Réunion, de la maquette de votre logo à la livraison.
            </p>
            <div className="mt-9 max-w-3xl">
              <DevisRapide minimum={MINIMUM_PIECES} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Garanties ────────────────────────────────────────────── */}
      <section className="bg-white">
        <ul className="wrap grid gap-x-8 gap-y-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [`Dès ${MINIMUM_PIECES} pièces`, 'par vêtement, tailles mélangées'],
            ['Prix dégressifs', `jusqu’à ${PALIERS.at(-1)} pièces et plus`],
            ['Maquette avant production', 'rien n’est fabriqué sans votre accord'],
            ['Livraison offerte dès 250 pièces', 'partout à La Réunion, 15 € HT en dessous'],
          ].map(([t, d]) => (
            <li key={t} className="flex gap-3">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-signal" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m4.5 10.5 3.5 3.5 7.5-8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <p><span className="block font-semibold text-ink">{t}</span><span className="text-sm text-ink-muted">{d}</span></p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Métiers : mosaïque ───────────────────────────────────── */}
      <section className="bg-paper">
        <div className="wrap py-20 md:py-28">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="h-section max-w-xl">Une tenue pensée pour chaque métier.</h2>
            <Link to="/solutions" className="btn-link shrink-0">Toutes les solutions <Arrow /></Link>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-4 md:grid-rows-[300px_300px]">
            {grands.map((m, k) => (
              <Link key={m.id} to={`/solutions#${m.id}`}
                className={`group relative overflow-hidden rounded-[22px] bg-indigo-deep ${['md:col-span-2 md:row-span-2 min-h-[380px]', 'md:col-span-2 min-h-[260px]', 'md:col-span-1 min-h-[260px]', 'md:col-span-1 min-h-[260px]'][k]}`}>
                <img src={m.img} alt={`Tenues personnalisées — ${m.nom}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120c3f]/85 via-[#120c3f]/10 to-transparent" aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                  <p className={`font-display font-extrabold leading-tight text-white ${k === 0 ? 'text-3xl' : 'text-xl'}`}>{m.nom}</p>
                  {k < 2 && <p className="mt-1 text-sm text-white/80">{m.pieces.join(', ')}</p>}
                </div>
              </Link>
            ))}
          </div>
          {autres.length > 0 && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {autres.map((m) => (
                <Link key={m.id} to={`/solutions#${m.id}`} className="group flex min-w-0 items-center gap-4 rounded-[22px] bg-white p-3 pr-5 transition-colors hover:bg-indigo-mist sm:gap-5">
                  <img src={m.img} alt="" loading="lazy" className="h-16 w-20 shrink-0 rounded-2xl object-cover sm:h-20 sm:w-28" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-bold text-ink">{m.nom}</span>
                    <span className="block truncate text-sm text-ink-muted">{m.pieces.join(', ')}</span>
                  </span>
                  <Arrow className="h-5 w-5 shrink-0 text-indigo" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Tarifs ───────────────────────────────────────────────── */}
      <Tarifs PACKS={PACKS} PALIERS={PALIERS} SEUIL_DEVIS={SEUIL_DEVIS} />

      {/* ── Techniques ───────────────────────────────────────────── */}
      <section id="techniques" className="scroll-mt-20 bg-paper">
        <div className="wrap py-20 md:py-28">
          <h2 className="h-section max-w-2xl">La bonne technique pour votre logo.</h2>
          <p className="lead mt-5 max-w-2xl">Broderie, flocage ou impression DTF : nous vous conseillons selon le logo, la pièce et son usage. Une même commande peut combiner plusieurs techniques.</p>
          <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
            {TECHNIQUES.map((t) => (
              <article key={t.id}>
                <img src={t.img} alt={`Exemple de ${t.label.toLowerCase()}`} loading="lazy" className="aspect-[4/3] w-full rounded-[22px] object-cover" />
                <h3 className="mt-6 font-display text-2xl font-extrabold text-ink">{t.label}</h3>
                <p className="mt-2 leading-relaxed text-ink-muted">{t.texte}</p>
                <p className="mt-3 text-sm text-ink"><span className="font-semibold">Idéal pour</span> {t.ideal.join(', ').toLowerCase()}.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Méthode : vraie séquence, donc numérotée ─────────────── */}
      <section id="methode" className="scroll-mt-20 bg-white">
        <div className="wrap py-20 md:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.6fr]">
            <div>
              <h2 className="h-section">De votre logo à la tenue livrée.</h2>
              <p className="lead mt-5">Vous validez chaque étape avant que nous passions à la suivante. Les pièces sont fabriquées par nos ateliers partenaires et contrôlées une à une par TenuePro.</p>
            </div>
            <ol className="grid gap-px overflow-hidden rounded-[22px] bg-ink-line sm:grid-cols-2">
              {ETAPES.map((e, i) => (
                <li key={e.titre} className={`bg-paper p-6 ${i === ETAPES.length - 1 ? 'sm:col-span-2' : ''}`}>
                  <span className="font-display text-sm font-bold tabular-nums text-signal-deep">Étape {i + 1}</span>
                  <h3 className="mt-2 font-display text-xl font-bold text-ink">{e.titre}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{e.texte}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Questions ────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="wrap grid gap-10 pb-20 md:grid-cols-[0.8fr_1.6fr] md:pb-28">
          <h2 className="h-section">Avant de commander</h2>
          <Faq items={FAQ} />
        </div>
      </section>

      {/* ── Appel final ──────────────────────────────────────────── */}
      <section className="bg-white px-3 pb-3 sm:px-4 sm:pb-4">
        <div className="mx-auto grid max-w-[1400px] items-center gap-8 overflow-hidden rounded-[28px] bg-indigo px-6 py-14 sm:px-10 md:grid-cols-[1.3fr_1fr] md:px-14 md:py-20">
          <div>
            <h2 className="font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.02em] text-white md:text-5xl">Votre devis en deux minutes.</h2>
            <p className="mt-4 max-w-lg text-lg text-indigo-soft">Décrivez vos pièces et vos quantités. Vous recevez un devis détaillé et une maquette de votre logo, sans engagement.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <Link to="/devis" className="btn-gold">Demander un devis</Link>
            <a href="tel:+262692105217" className="btn-secondary">0692 10 52 17</a>
          </div>
        </div>
      </section>
    </>
  )
}
