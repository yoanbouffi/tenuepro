// Titres et descriptions de chaque page (Google et partages sur les réseaux)
export const SITE_URL = 'https://tenuepro.re'

export const SEO = {
  '/': {
    title: 'TenuePro — Broderie, flocage et impression DTF à La Réunion',
    description: 'Tenues professionnelles brodées et marquées à votre logo à La Réunion : polos, t-shirts, tabliers, casquettes. Dès 10 pièces, devis en ligne avec maquette.',
  },
  '/packs': {
    title: 'Packs et tarifs — Tenues personnalisées pour professionnels | TenuePro',
    description: 'Prix HT par pièce, textile et marquage compris : polos brodés, t-shirts, tenues de restauration, clubs, casquettes. Tarifs dégressifs dès 20 pièces à La Réunion.',
  },
  '/solutions': {
    title: 'Tenues de travail par métier : restauration, hôtellerie, BTP, clubs | TenuePro',
    description: 'Les bonnes pièces et le bon marquage pour votre activité à La Réunion : restaurants, hôtels, entreprises, collectivités, artisans du BTP, associations et clubs sportifs.',
  },
  '/devis': {
    title: 'Demande de devis en ligne — Tenues brodées et marquées | TenuePro',
    description: 'Décrivez votre projet en deux minutes, sans création de compte : pièces, quantités, emplacements et logo. Devis détaillé et maquette envoyés par e-mail.',
  },
  '/cgv': {
    title: 'Conditions générales de vente | TenuePro',
    description: 'Conditions générales de vente de TenuePro, marquage textile à La Réunion.',
  },
}

export const PAGES_PUBLIQUES = Object.keys(SEO)

export const seoFor = (path) => SEO[path] || null
