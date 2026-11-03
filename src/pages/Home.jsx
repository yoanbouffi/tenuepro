import { Link } from 'react-router-dom'
import { TECHNIQUES, ETAPES } from '../data/offre'
import { useOffre } from '../content/OffreContext'
import { SectionHead, SceneCard, PackCard, Faq, CtaBand, Arrow } from '../components/ui'

const faq = (MINIMUM_PIECES) => [
  ['Quelle quantité minimum ?', `${MINIMUM_PIECES} pièces minimum par vêtement : par exemple ${MINIMUM_PIECES} t-shirts et ${MINIMUM_PIECES} casquettes. Les tailles peuvent être mélangées, et les prix baissent avec la quantité.`],
  ['Quels sont les délais ?', 'Comptez au minimum un mois entre la validation du devis et la livraison. Le délai exact dépend de la quantité, de la technique et de la provenance des textiles, et il est confirmé sur votre devis. Si vous avez une date impérative, précisez-la dans votre demande.'],
  ['Mon logo doit-il être dans un format particulier ?', 'Un fichier vectoriel (AI, PDF, SVG) est idéal, mais un PNG ou un JPG de bonne qualité suffit pour démarrer. Nous préparons le fichier de broderie ou d’impression et vous montrons la maquette avant toute production.'],
  ['Pouvons-nous commencer par un seul service ?', 'Oui. Beaucoup de structures commencent par une équipe pilote. Le fichier de votre logo est conservé : les commandes suivantes gardent exactement le même rendu.'],
  ['Travaillez-vous avec les collectivités ?', 'Oui. Nous établissons des devis détaillés pour les services publics, avec facturation via Chorus Pro.'],
]

export default function Home() {
  const { METIERS, PACKS, MINIMUM_PIECES, CONTACT } = useOffre()
  const FAQ = faq(MINIMUM_PIECES)
  return (
    <>
      {/* ── Ouverture ─────────────────────────────────────────────── */}
      <section className="bg-paper pt-16">
        <div className="wrap grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <p className="eyebrow">Fournisseur de tenues professionnelles · La Réunion</p>
            <h1 className="mt-4 font-display text-[2.5rem] font-extrabold leading-[1.04] tracking-tight text-indigo sm:text-[3.4rem]">
              Équipez vos équipes à vos couleurs.
            </h1>
            <p className="lead mt-6 max-w-xl">
              Polos, vestes, maillots, tabliers : un seul interlocuteur à La Réunion pour les tenues de votre entreprise, de votre club ou de votre collectivité. Devis détaillé, maquette avant production, chaque pièce contrôlée et livrée.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/devis" className="btn-primary">Demander un devis <Arrow /></Link>
              <Link to="/packs" className="btn-outline">Voir les packs et tarifs</Link>
            </div>
            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 text-sm">
              {[
                [`Dès ${MINIMUM_PIECES}`, 'pièces par vêtement'],
                ['Dégressif', 'prix en baisse avec la quantité'],
                ['Livraison', 'offerte partout à La Réunion'],
              ].map(([k, v]) => (
                <div key={k} className="border-l-2 border-indigo/20 pl-3">
                  <dt className="font-display text-lg font-extrabold text-indigo">{k}</dt>
                  <dd className="text-ink-muted">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className="relative mx-auto w-full max-w-[600px]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-indigo shadow-[0_24px_60px_-30px_rgba(36,22,117,.45)]">
              <img src="/images/hero-equipe.webp" alt="Équipe en polos marine brodés au logo de l’entreprise, devant une case créole à La Réunion" className="h-full w-full object-cover object-[50%_40%]" fetchpriority="high" />
            </div>
            <figcaption className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-xl bg-white/95 px-4 py-3 text-sm shadow-md sm:left-auto sm:right-4 sm:max-w-[330px]">
              <span><span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-deep">Exemple client</span><span className="font-semibold text-indigo">25 polos, logo brodé côté cœur</span></span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── Bandeau conditions ───────────────────────────────────── */}
      <div className="border-y border-ink-line bg-white">
        <ul className="wrap flex flex-wrap justify-center gap-x-10 gap-y-2 py-4 text-sm text-ink-muted">
          <li>Prix HT dégressifs</li>
          <li>Devis détaillé + maquette</li>
          <li>Logo conservé pour vos recommandes</li>
          <li className="font-semibold text-indigo">{CONTACT.zone}</li>
        </ul>
      </div>

      {/* ── Techniques ───────────────────────────────────────────── */}
      <section id="techniques" className="scroll-mt-20 bg-white">
        <div className="wrap py-20 md:py-24">
          <SectionHead eyebrow="Techniques" title="Trois façons de marquer, une seule exigence.">
            Nous vous orientons vers la technique la plus juste pour votre logo, vos pièces et leur usage. Une même commande peut les combiner.
          </SectionHead>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {TECHNIQUES.map((t) => (
              <article key={t.id}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-indigo-mist md:aspect-[4/5]">
                  <img src={t.img} alt={`Exemple de ${t.label.toLowerCase()}`} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div className="stitch mt-5 pl-4">
                  <h3 className="font-display text-2xl font-bold text-indigo">{t.label}</h3>
                  <p className="mt-1 font-medium text-ink">{t.accroche}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t.texte}</p>
                  <p className="mt-3 text-sm text-ink-muted"><span className="font-semibold text-ink">Idéal pour :</span> {t.ideal.join(', ').toLowerCase()}.</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Métiers ──────────────────────────────────────────────── */}
      <section className="bg-paper">
        <div className="wrap py-20 md:py-24">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHead eyebrow="Solutions par métier" title="Chaque métier a sa tenue.">
              Restaurant, hôtel, chantier, club ou collectivité : les bonnes pièces et le bon marquage pour votre activité.
            </SectionHead>
            <Link to="/solutions" className="btn-link shrink-0">Toutes les solutions <Arrow /></Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {METIERS.map((m) => <SceneCard key={m.id} m={m} to={`/solutions#${m.id}`} />)}
          </div>
        </div>
      </section>

      {/* ── Packs ────────────────────────────────────────────────── */}
      <section className="bg-indigo">
        <div className="wrap py-20 md:py-24">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">Packs professionnels</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-white md:text-[2.6rem]">Des prix clairs pour équiper une équipe.</h2>
              <p className="mt-4 text-lg leading-relaxed text-indigo-soft">Prix par pièce, hors taxes, textile et marquage compris. Plus la quantité augmente, plus le prix baisse.</p>
            </div>
            <Link to="/packs" className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-white underline decoration-gold decoration-2 underline-offset-4">Les 6 packs <Arrow /></Link>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PACKS.slice(0, 3).map((p) => <PackCard key={p.id} p={p} dark />)}
          </div>
        </div>
      </section>

      {/* ── Méthode ──────────────────────────────────────────────── */}
      <section id="methode" className="scroll-mt-20 bg-white">
        <div className="wrap py-20 md:py-24">
          <SectionHead eyebrow="Méthode" title="De votre logo à la tenue livrée.">
            Vous validez chaque étape avant que nous passions à la suivante.
          </SectionHead>
          <ol className="relative mt-14 grid gap-10 md:grid-cols-5 md:gap-6">
            <span className="absolute left-[18px] top-0 h-full border-l-2 border-dashed border-gold md:left-0 md:top-[18px] md:h-0 md:w-full md:border-l-0 md:border-t-2" aria-hidden="true" />
            {ETAPES.map((e, i) => (
              <li key={e.titre} className="relative pl-14 md:pl-0">
                <span className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-indigo font-display text-sm font-bold text-white ring-4 ring-white md:relative">{i + 1}</span>
                <h3 className="font-display text-lg font-bold text-indigo md:mt-5">{e.titre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{e.texte}</p>
              </li>
            ))}
          </ol>

          <div className="mt-16 grid gap-6 rounded-2xl bg-indigo-mist p-8 md:grid-cols-[1.2fr_1fr_1fr] md:p-10">
            <div>
              <h3 className="font-display text-2xl font-bold text-indigo">Un seul interlocuteur, de la maquette à la livraison.</h3>
            </div>
            <div className="stitch pl-4">
              <p className="font-semibold text-ink">Fabrication chez nos partenaires</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">Vos pièces sont brodées et marquées par des ateliers partenaires sélectionnés, à partir des fichiers que vous avez validés.</p>
            </div>
            <div className="stitch pl-4">
              <p className="font-semibold text-ink">Contrôle et livraison à La Réunion</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">Chaque pièce est vérifiée par TenuePro avant de vous être remise. En cas de défaut, nous le réglons avec le fabricant, pas vous.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Questions ────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="wrap grid gap-10 pb-20 md:grid-cols-[1fr_2fr] md:pb-24">
          <SectionHead eyebrow="Questions fréquentes" title="Avant de commander." />
          <Faq items={FAQ} />
        </div>
      </section>

      <CtaBand />
    </>
  )
}
