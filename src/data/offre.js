// ─────────────────────────────────────────────────────────────────────────────
// Toute l'offre TenuePro au même endroit : pièces, techniques, packs, métiers.
// Les prix des packs sont calculés avec le calculateur TenuePro (prix pro, HT),
// sur la base d'hypothèses de prix d'achat textile indiquées dans `textileHT`.
// Pour changer un prix : modifier uniquement ce fichier.
// ─────────────────────────────────────────────────────────────────────────────

export const CONTACT = {
  tel: '0692 10 52 17',
  telHref: 'tel:+262692105217',
  email: 'contact@tenuepro.re',
  zone: 'Basé à La Réunion — Intervention sur toute l’île',
}

export const MINIMUM_PIECES = 10

// Identifiants = ceux attendus par n8n et les maquettes Cloudinary (src/lib/mockups.js)
export const PIECES = [
  { id: 'polos',      label: 'Polos',            usage: 'Accueil, salle, équipes terrain', img: '/images/polo.webp' },
  { id: 'tshirts',    label: 'T-shirts',         usage: 'Équipes, événements, clubs',      img: '/images/tshirt.webp' },
  { id: 'chemises',   label: 'Chemises',         usage: 'Hôtellerie, accueil, bureau',     img: '/images/chemise.webp' },
  { id: 'vestes',     label: 'Vestes & sweats',  usage: 'Extérieur, chantiers, saison fraîche', img: '/images/veste.webp' },
  { id: 'tabliers',   label: 'Tabliers',         usage: 'Cuisine, service, commerce',      img: '/images/tablier.webp' },
  { id: 'casquettes', label: 'Casquettes',       usage: 'Visibilité et protection au soleil', img: '/images/casquette.webp' },
  { id: 'sacs',       label: 'Sacs & tote bags', usage: 'Salons, goodies, événements',     img: '/images/totebag.webp' },
]

export const TECHNIQUES = [
  {
    id: 'broderie',
    label: 'Broderie',
    img: '/images/broderie.webp',
    accroche: 'Le logo cousu, en relief.',
    texte: 'Le rendu le plus haut de gamme pour un logo côté cœur, une casquette ou un prénom. Tient au lavage industriel.',
    ideal: ['Logo côté cœur', 'Casquettes', 'Prénoms'],
  },
  {
    id: 'flocage',
    label: 'Flocage',
    img: '/images/flocage.webp',
    accroche: 'Net, monocouleur, efficace.',
    texte: 'Découpé dans un film textile puis pressé à chaud. Idéal pour les textes, noms et numéros d’une seule couleur.',
    ideal: ['Noms et numéros', 'Textes au dos', 'Logos une couleur'],
  },
  {
    id: 'dtf',
    label: 'Impression DTF',
    img: '/images/dtf.webp',
    accroche: 'Toutes les couleurs, tous les détails.',
    texte: 'Pour les visuels en couleurs, les dégradés et les grands formats au dos, avec un toucher souple.',
    ideal: ['Visuels couleur', 'Grands dos', 'Événements'],
  },
]

export const EMPLACEMENTS = [
  { id: 'coeur',  label: 'Côté cœur' },
  { id: 'dos',    label: 'Dos' },
  { id: 'manche', label: 'Manche' },
  { id: 'nuque',  label: 'Nuque' },
  { id: 'prenom', label: 'Prénom ou nom' },
  { id: 'face',   label: 'Face casquette' },
]

// Hypothèses de prix d'achat textile (HT, rendu atelier) utilisées pour les packs
export const textileHT = { polo: 9, tshirt: 4.5, tablier: 8, casquette: 4 }

// Prix par pièce, HT. `paliers` : quantité minimum → prix unitaire.
export const PACKS = [
  {
    id: 'accueil',
    nom: 'Accueil',
    pour: 'Bureaux, commerces, accueil du public',
    img: '/images/polo.webp',
    contenu: 'Polo',
    marquage: 'Logo brodé côté cœur',
    paliers: [[20, 24], [50, 23.5]],
    devis: { produits: ['polos'], quantities: { polos: 20 }, technique: 'broderie', emplacements: ['coeur'] },
  },
  {
    id: 'terrain',
    nom: 'Terrain',
    pour: 'BTP, services techniques, équipes d’intervention',
    img: '/images/scene-btp.webp',
    contenu: 'T-shirt',
    marquage: 'Logo brodé côté cœur + logo imprimé au dos (A4)',
    paliers: [[20, 25], [50, 24]],
    devis: { produits: ['tshirts'], quantities: { tshirts: 20 }, technique: 'mix', emplacements: ['coeur', 'dos'] },
  },
  {
    id: 'restauration',
    nom: 'Salle & cuisine',
    pour: 'Restaurants, bars, snacks, traiteurs',
    img: '/images/scene-restauration.webp',
    contenu: 'Polo + tablier',
    marquage: 'Logo brodé sur les deux pièces',
    unite: 'la tenue',
    paliers: [[20, 46], [50, 45.5]],
    devis: { produits: ['polos', 'tabliers'], quantities: { polos: 20, tabliers: 20 }, technique: 'broderie', emplacements: ['coeur'] },
  },
  {
    id: 'evenement',
    nom: 'Événement',
    pour: 'Associations, salons, séminaires, collectivités',
    img: '/images/scene-association.webp',
    contenu: 'T-shirt',
    marquage: 'Visuel couleur côté cœur + grand visuel au dos (A3)',
    paliers: [[20, 20.5], [50, 20]],
    devis: { produits: ['tshirts'], quantities: { tshirts: 20 }, technique: 'dtf', emplacements: ['coeur', 'dos'] },
  },
  {
    id: 'club',
    nom: 'Club',
    pour: 'Clubs sportifs, écoles de sport, tournois',
    img: '/images/scene-club.webp',
    contenu: 'Maillot ou t-shirt technique',
    marquage: 'Écusson couleur + nom et numéro floqués au dos',
    paliers: [[20, 23], [50, 22]],
    devis: { produits: ['tshirts'], quantities: { tshirts: 20 }, technique: 'mix', emplacements: ['coeur', 'dos', 'prenom'] },
  },
  {
    id: 'casquettes',
    nom: 'Casquettes',
    pour: 'Équipes en extérieur, goodies, événements',
    img: '/images/casquette.webp',
    contenu: 'Casquette',
    marquage: 'Logo brodé en face avant',
    paliers: [[20, 16.5], [50, 16]],
    devis: { produits: ['casquettes'], quantities: { casquettes: 20 }, technique: 'broderie', emplacements: ['face'] },
  },
]

export const OPTIONS_PACKS = [
  { label: 'Prénom brodé', prix: '+ 7 € HT / pièce' },
  { label: 'Numérisation du logo pour la broderie', prix: 'forfait unique dès 25 € HT, offerte dès 50 pièces' },
  { label: '100 pièces et plus', prix: 'prix sur devis' },
]

export const METIERS = [
  {
    id: 'restauration',
    nom: 'Restauration & bars',
    img: '/images/scene-restauration.webp',
    label: 'Broderie · tablier et polo',
    texte: 'Des tenues qui tiennent au lavage quotidien et qui rendent votre équipe reconnaissable en salle comme au comptoir.',
    pieces: ['Polos', 'Tabliers', 'Casquettes'],
    pack: 'restauration',
    secteur: 'Restauration',
  },
  {
    id: 'hotellerie',
    nom: 'Hôtellerie & tourisme',
    img: '/images/scene-hotellerie.webp',
    label: 'Broderie · côté cœur',
    texte: 'Chemises et polos brodés discrets pour l’accueil, la réception et les équipes au contact des clients.',
    pieces: ['Chemises', 'Polos', 'Vestes'],
    pack: 'accueil',
    secteur: 'Hôtellerie',
  },
  {
    id: 'entreprise',
    nom: 'Entreprises & collectivités',
    img: '/images/scene-entreprise.webp',
    label: 'Broderie · côté cœur',
    texte: 'Une image cohérente pour tous les services, du bureau au terrain, avec la possibilité de commencer par un service pilote.',
    pieces: ['Polos', 'T-shirts', 'Vestes'],
    pack: 'accueil',
    secteur: 'Entreprise & collectivité',
  },
  {
    id: 'btp',
    nom: 'BTP & artisans',
    img: '/images/scene-btp.webp',
    label: 'Broderie cœur · DTF dos',
    texte: 'Votre logo bien visible sur les chantiers : brodé à l’avant, imprimé en grand au dos.',
    pieces: ['T-shirts', 'Vestes & sweats', 'Casquettes'],
    pack: 'terrain',
    secteur: 'Bâtiment & Artisanat',
  },
  {
    id: 'association',
    nom: 'Associations & événements',
    img: '/images/scene-association.webp',
    label: 'DTF · cœur et dos',
    texte: 'T-shirts couleur pour une course, une fête, un salon ou une campagne, prêts pour le jour J.',
    pieces: ['T-shirts', 'Tote bags', 'Casquettes'],
    pack: 'evenement',
    secteur: 'Associations & Événementiel',
  },
  {
    id: 'club',
    nom: 'Clubs sportifs',
    img: '/images/scene-club.webp',
    label: 'Flocage · nom et numéro',
    texte: 'Maillots, tenues d’entraînement et de déplacement aux couleurs du club, avec noms et numéros.',
    pieces: ['Maillots', 'T-shirts', 'Sweats'],
    pack: 'club',
    secteur: 'Sport & Loisirs',
  },
]

export const SECTEURS = [
  'Restauration', 'Hôtellerie', 'Entreprise & collectivité', 'Commerce de détail',
  'Bâtiment & Artisanat', 'Associations & Événementiel', 'Sport & Loisirs',
  'Santé & Bien-être', 'Transport & Logistique', 'Autre',
]

export const DELAIS = [
  'Date précise (à indiquer dans le message)',
  'Sous 3 semaines',
  'Sous 1 mois',
  'Sous 2 mois',
  'Pas de contrainte particulière',
]

export const ETAPES = [
  { titre: 'Votre demande en ligne', texte: 'Pièces, quantités, emplacements et logo : deux minutes suffisent.' },
  { titre: 'Conseil et maquette', texte: 'Nous vous proposons la technique adaptée, un devis détaillé et une maquette de votre logo.' },
  { titre: 'Validation', texte: 'Vous validez la maquette et le devis. Un acompte lance la production.' },
  { titre: 'Production contrôlée', texte: 'Petites séries dans notre atelier, grandes séries chez nos partenaires textile. Chaque pièce est contrôlée par TenuePro.' },
  { titre: 'Livraison', texte: 'Livraison ou remise en main propre partout à La Réunion.' },
]

export const euro = (n) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + ' €'

export const lc = (t) => t.charAt(0).toLowerCase() + t.slice(1)
