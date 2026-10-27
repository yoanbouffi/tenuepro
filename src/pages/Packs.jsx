import { Link } from 'react-router-dom'
import { euro, lc } from '../data/offre'
import { useOffre } from '../content/OffreContext'
import { SectionHead, PackCard, Faq, CtaBand, Arrow } from '../components/ui'

const faq = ({ MINIMUM_PIECES, PALIERS, SEUIL_DEVIS }) => [
  ['Les prix comprennent-ils le textile ?', 'Oui. Le prix par pièce comprend la pièce textile et le marquage décrit. La TVA (8,5 % à La Réunion) s’ajoute au prix hors taxes.'],
  ['Puis-je changer de pièce ou de couleur ?', 'Oui. Les packs sont un point de départ : modèle, coloris, tailles et emplacements s’ajustent dans votre demande. Le devis tient compte de vos choix.'],
  [`Pourquoi ${MINIMUM_PIECES} pièces minimum par vêtement ?`, `Chaque série demande un réglage machine et la préparation de votre logo. À partir de ${MINIMUM_PIECES} pièces par vêtement, nous pouvons vous proposer un prix juste et un rendu identique sur toute la série. Les tailles peuvent être mélangées.`],
  [`Et à partir de ${SEUIL_DEVIS} pièces ?`, 'Nous établissons un prix sur devis, plus bas que la grille, car les grandes séries se fabriquent à meilleur coût. Le contrôle et la livraison restent assurés par TenuePro.'],
]

export default function Packs() {
  const offre = useOffre()
  const { PACKS, OPTIONS_PACKS, MINIMUM_PIECES, PALIERS, SEUIL_DEVIS } = offre
  const FAQ = faq(offre)
  const entete = PALIERS.map((q, i) => `${q} à ${(PALIERS[i + 1] || SEUIL_DEVIS) - 1} pièces`)
  return (
    <>
      <section className="bg-paper pt-16">
        <div className="wrap py-14 md:py-20">
          <p className="eyebrow">Packs & tarifs</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-indigo sm:text-5xl">
            Équiper une équipe, à prix connu d’avance.
          </h1>
          <p className="lead mt-5 max-w-2xl">
            Six formules pensées pour les professionnels. Prix par pièce hors taxes, textile et marquage compris, dégressifs selon la quantité.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="wrap py-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PACKS.map((p) => <PackCard key={p.id} p={p} />)}
          </div>
        </div>
      </section>

      {/* Grille récapitulative */}
      <section className="bg-white">
        <div className="wrap pb-20">
          <SectionHead eyebrow="Récapitulatif" title="Prix par pièce, hors taxes." />
          <div className="mt-8 overflow-x-auto rounded-xl border border-ink-line">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">Prix des packs par pièce selon la quantité</caption>
              <thead className="bg-indigo-mist text-indigo">
                <tr>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Pack</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Contenu</th>
                  {entete.map((t) => <th key={t} scope="col" className="px-5 py-3.5 text-right font-semibold">{t}</th>)}
                  <th scope="col" className="px-5 py-3.5 text-right font-semibold">{SEUIL_DEVIS} et plus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-line">
                {PACKS.map((p) => (
                  <tr key={p.id}>
                    <th scope="row" className="px-5 py-4 font-display font-bold text-indigo">{p.nom}</th>
                    <td className="px-5 py-4 text-ink-muted">{p.contenu} — {lc(p.marquage)}</td>
                    {p.paliers.map(([q, prix]) => (
                      <td key={q} className="px-5 py-4 text-right font-semibold tabular-nums text-ink">{euro(prix)}{p.unite ? <span className="block text-xs font-normal text-ink-muted">{p.unite}</span> : null}</td>
                    ))}
                    <td className="px-5 py-4 text-right text-ink-muted">Sur devis</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-6 grid gap-3 text-sm md:grid-cols-3">
            {OPTIONS_PACKS.map((o) => (
              <li key={o.label} className="stitch pl-3">
                <span className="font-semibold text-ink">{o.label}</span>
                <span className="block text-ink-muted">{o.prix}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-ink-muted">Prix indicatifs pour des pièces standard et un logo jusqu’à trois couleurs. Le prix définitif figure sur votre devis.</p>
        </div>
      </section>

      {/* Sur mesure */}
      <section className="bg-paper">
        <div className="wrap grid items-center gap-10 py-20 md:grid-cols-2">
          <div>
            <SectionHead eyebrow="Sur mesure" title="Aucun pack ne correspond ?">
              {`Composez votre commande librement, dès ${MINIMUM_PIECES} pièces par vêtement : chemises, vestes, sweats, sacs, plusieurs emplacements, plusieurs techniques.`}
            </SectionHead>
            <Link to="/devis" className="btn-primary mt-8">Composer ma demande <Arrow /></Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['chemise', 'veste', 'totebag'].map((k) => (
              <img key={k} src={`/images/${k}.webp`} alt="" loading="lazy" className="aspect-[4/5] w-full rounded-lg object-cover" />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="wrap grid gap-10 py-20 md:grid-cols-[1fr_2fr]">
          <SectionHead eyebrow="Questions" title="Bon à savoir." />
          <Faq items={FAQ} />
        </div>
      </section>

      <CtaBand />
    </>
  )
}
