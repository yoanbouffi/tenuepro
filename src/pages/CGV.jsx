import { Link } from 'react-router-dom'

const sections = [
  {
    title: '1. Objet',
    content: `Les présentes Conditions Générales de Vente (CGV) régissent l'ensemble des relations commerciales entre TenuePro, prestataire spécialisé en marquage textile (broderie et flocage), basé à La Réunion, ci-après dénommé « le Prestataire », et tout client professionnel ou toute entité passant commande, ci-après dénommé « le Client ».

Toute commande implique l'acceptation pleine et entière des présentes CGV, qui prévalent sur tout autre document du Client.`,
  },
  {
    title: '2. Devis et commandes',
    content: `2.1. Tout devis établi par TenuePro est gratuit et valable 30 jours à compter de sa date d'émission.

2.2. La commande devient ferme et définitive après :
- Validation écrite du devis et de la maquette par le Client (par email ou bon pour accord signé),
- Versement de l'acompte de 50 % du montant total TTC.

2.3. TenuePro se réserve le droit de refuser toute commande incompatible avec ses capacités de production ou contraire aux lois en vigueur.`,
  },
  {
    title: '3. Fourniture des éléments graphiques',
    content: `3.1. Le Client s'engage à fournir ses fichiers logo dans un format exploitable (vectoriel SVG, AI, EPS ou PDF haute résolution). Un fichier de mauvaise qualité peut entraîner un résultat dégradé dont TenuePro ne saurait être tenu responsable.

3.2. Une maquette numérique de simulation est fournie gratuitement avant tout lancement en production. Elle doit être validée expressément par le Client.

3.3. Le Client garantit être titulaire ou disposer de tous les droits nécessaires sur les éléments graphiques transmis. TenuePro ne pourra être tenu responsable de toute violation de droits de tiers.`,
  },
  {
    title: '4. Prix et modalités de paiement',
    content: `4.1. Les prix sont exprimés en euros TTC. Ils sont valables pour les quantités et produits définis dans le devis accepté.

4.2. Modalités de règlement :
- Acompte de 50 % à la commande, par virement bancaire ou paiement en ligne sécurisé,
- Solde de 50 % à la livraison ou avant expédition.

4.3. Tout retard de paiement entraîne de plein droit l'application de pénalités de retard au taux légal en vigueur, ainsi qu'une indemnité forfaitaire de recouvrement de 40 € conformément à l'article L. 441-10 du Code de commerce.`,
  },
  {
    title: '5. Délais de production et de livraison',
    content: `5.1. Les délais de production standard sont de 10 à 15 jours ouvrés à compter de la validation de la maquette et du règlement de l'acompte.

5.2. La livraison s'effectue à l'adresse indiquée par le Client sur toute l'île de La Réunion. Les frais de port sont inclus dans les packs TenuePro, sauf mention contraire dans le devis.

5.3. Les délais sont donnés à titre indicatif. Tout retard ne peut donner lieu à des pénalités ni à l'annulation de la commande, sauf accord contractuel écrit préalable.`,
  },
  {
    title: '6. Contrôle qualité et réclamations',
    content: `6.1. TenuePro s'engage à livrer des produits conformes à la maquette validée par le Client, en termes de colorimétrie, positionnement et technique de marquage.

6.2. Toute réclamation doit être formulée par écrit (email) dans un délai de 5 jours ouvrés suivant la réception de la commande, accompagnée de photos illustrant le défaut constaté.

6.3. En cas de défaut avéré imputable à TenuePro, celui-ci s'engage à reprendre les pièces concernées ou à accorder un avoir, selon les modalités convenues. Aucun retour ne sera accepté sans accord préalable.`,
  },
  {
    title: '7. Propriété intellectuelle',
    content: `7.1. Les fichiers, maquettes et visuels créés par TenuePro pour le compte du Client restent la propriété de TenuePro jusqu'au complet paiement de la commande.

7.2. TenuePro se réserve le droit d'utiliser les réalisations effectuées à des fins de communication commerciale (portfolio, réseaux sociaux, site web), sauf opposition écrite du Client formulée avant la commande.`,
  },
  {
    title: '8. Responsabilité',
    content: `8.1. TenuePro ne saurait être tenu responsable des dommages indirects subis par le Client (perte d'exploitation, préjudice commercial, etc.) résultant d'un retard ou d'un défaut de livraison.

8.2. La responsabilité de TenuePro est en tout état de cause limitée au montant de la commande concernée.`,
  },
  {
    title: '9. Annulation',
    content: `9.1. Toute annulation après validation de la maquette et versement de l'acompte entraîne la perte définitive de l'acompte, qui couvre les frais de préparation et de numérisation engagés.

9.2. Si la production a déjà débuté, TenuePro pourra facturer jusqu'à 100 % du montant de la commande.`,
  },
  {
    title: '10. Loi applicable et litiges',
    content: `Les présentes CGV sont soumises au droit français. En cas de litige, les parties s'engagent à rechercher une solution amiable avant tout recours judiciaire.

À défaut d'accord amiable, tout litige relatif à l'exécution ou à l'interprétation des présentes CGV sera soumis à la compétence exclusive des tribunaux de Saint-Denis de La Réunion.`,
  },
]

export default function CGV() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#7C3AED] transition-colors mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à l'accueil
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Conditions Générales de Vente</h1>
          <p className="text-gray-500 text-sm">TenuePro — Marquage textile professionnel à La Réunion</p>
          <p className="text-gray-400 text-sm mt-1">Version en vigueur au 1er janvier 2026</p>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {sections.map((section) => (
            <div key={section.title} className="px-8 py-7">
              <h2 className="text-base font-bold text-gray-900 mb-3">{section.title}</h2>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{section.content}</div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-8 bg-violet-50 border border-violet-100 rounded-2xl px-8 py-6">
          <h3 className="font-semibold text-gray-900 mb-1">Une question sur nos CGV ?</h3>
          <p className="text-sm text-gray-600 mb-3">Contactez-nous par email ou téléphone, nous vous répondons sous 24h.</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="mailto:contact@tenuepro.re" className="text-[#7C3AED] font-medium hover:underline">contact@tenuepro.re</a>
            <a href="tel:+262692105217" className="text-[#7C3AED] font-medium hover:underline">0692 10 52 17</a>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          © 2026 TenuePro. Tous droits réservés.
        </p>
      </div>
    </div>
  )
}
