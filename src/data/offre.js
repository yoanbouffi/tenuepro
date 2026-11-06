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

// Minimum par type de vêtement (ex. 20 t-shirts ET 20 casquettes)
export const MINIMUM_PIECES = 50

// Identifiants = ceux attendus par n8n et les maquettes Cloudinary (src/lib/mockups.js)
export const PIECES = [
  { id: 'polos',      label: 'Polos',            usage: 'Accueil, salle, équipes terrain', img: '/images/polo.webp' },
  { id: 'tshirts',    label: 'T-shirts',         usage: 'Équipes, événements, clubs',      img: '/images/tshirt.webp' },
  { id: 'chemises',   label: 'Chemises',         usage: 'Hôtellerie, accueil, bureau',     img: '/images/chemise.webp' },
  { id: 'vestes',     label: 'Vestes & sweats',  usage: 'Extérieur, chantiers, saison fraîche', img: '/images/veste.webp' },
  { id: 'vestescuisine', label: 'Vestes de cuisine', usage: 'Chefs, brigades, traiteurs',   img: '/images/veste-cuisine.webp' },
  { id: 'tabliers',   label: 'Tabliers',         usage: 'Cuisine, service, commerce',      img: '/images/tablier.webp' },
  { id: 'blouses',    label: 'Blouses & tuniques', usage: 'Santé, beauté, aide à domicile', img: '/images/blouse.webp' },
  { id: 'hautevis',   label: 'Haute visibilité', usage: 'Gilets et vestes pour chantiers et voirie', img: '/images/haute-visibilite.webp' },
  { id: 'maillots',   label: 'Maillots de sport', usage: 'Clubs, tournois, écoles de sport', img: '/images/maillot.webp' },
  { id: 'shorts',     label: 'Shorts de sport',  usage: 'Match et entraînement',           img: '/images/short.webp' },
  { id: 'survetements', label: 'Survêtements',   usage: 'Déplacements, entraînement, encadrement', img: '/images/survetement.webp' },
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
  { id: 'coeur',    label: 'Poitrine gauche', aide: 'côté cœur, le plus courant pour un logo' },
  { id: 'droite',   label: 'Poitrine droite', aide: 'souvent pour un prénom ou un second logo' },
  { id: 'dos',      label: 'Dos', aide: 'grand format, entre les omoplates' },
  { id: 'nuque',    label: 'Nuque', aide: 'petit marquage juste sous le col, au dos' },
  { id: 'manche',   label: 'Manche', aide: 'haut du bras' },
  { id: 'prenom',   label: 'Prénom ou nom', aide: 'personnalisé pour chaque pièce' },
  { id: 'face',     label: 'Face avant', aide: 'devant, au-dessus de la visière' },
  { id: 'cote',     label: 'Côté', aide: 'sur le côté gauche' },
  { id: 'arriere',  label: 'Arrière', aide: 'au-dessus de la boucle de réglage' },
  { id: 'poitrine', label: 'Haut du tablier', aide: 'au niveau de la poitrine' },
  { id: 'bas',      label: 'Bas du tablier', aide: 'sur la poche ou le bas' },
  { id: 'recto',    label: 'Recto', aide: 'face principale du sac' },
  { id: 'verso',    label: 'Verso', aide: 'face arrière du sac' },
  { id: 'numero',   label: 'Numéro', aide: 'au dos du maillot ou sur le short' },
  { id: 'jambe',    label: 'Jambe', aide: 'bas de la jambe, devant' },
]

// Emplacements proposés selon la pièce
export const EMPLACEMENTS_PAR_PIECE = {
  casquettes: ['face', 'cote', 'arriere'],
  tabliers: ['poitrine', 'bas', 'prenom'],
  sacs: ['recto', 'verso'],
  maillots: ['coeur', 'droite', 'dos', 'prenom', 'numero', 'manche'],
  shorts: ['jambe', 'numero'],
  survetements: ['coeur', 'dos', 'manche', 'nuque', 'prenom'],
  vestescuisine: ['coeur', 'droite', 'manche', 'prenom'],
  hautevis: ['coeur', 'dos'],
  blouses: ['coeur', 'droite', 'dos', 'prenom'],
  default: ['coeur', 'droite', 'dos', 'nuque', 'manche', 'prenom'],
}
export const emplacementsPour = (pieceId) => EMPLACEMENTS_PAR_PIECE[pieceId] || EMPLACEMENTS_PAR_PIECE.default

// Tailles proposées (null = taille unique)
export const TAILLES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
export const TAILLES_ENFANT = ['6 ans', '8 ans', '10 ans', '12 ans', '14 ans']
const AVEC_ENFANT = ['tshirts', 'maillots', 'shorts', 'survetements']
export const taillesPour = (pieceId) => (['casquettes', 'tabliers', 'sacs'].includes(pieceId) ? null : AVEC_ENFANT.includes(pieceId) ? [...TAILLES_ENFANT, ...TAILLES] : TAILLES)

// Hypothèses de prix d'achat textile (HT, rendu La Réunion) utilisées pour les packs
export const textileHT = { polo: 9, tshirt: 4.5, tablier: 8, casquette: 4 }

// Prix par pièce, HT : un prix par palier de quantité (voir PALIERS).
export const PACKS = [
  {
    id: 'accueil',
    nom: 'Accueil',
    pour: 'Bureaux, commerces, accueil du public',
    img: '/images/polo.webp',
    contenu: 'Polo',
    marquage: 'Logo brodé côté cœur',
    prix: [22.9, 20.9, 18.9, 17.9],
    devis: { quantities: { polos: 50 }, marquages: { polos: { coeur: 'broderie' } } },
  },
  {
    id: 'terrain',
    nom: 'Terrain',
    pour: 'BTP, services techniques, équipes d’intervention',
    img: '/images/scene-btp.webp',
    contenu: 'T-shirt',
    marquage: 'Logo brodé côté cœur',
    prix: [16.9, 15.9, 13.9, 12.9],
    devis: { quantities: { tshirts: 50 }, marquages: { tshirts: { coeur: 'broderie' } } },
  },
  {
    id: 'restauration',
    nom: 'Salle & cuisine',
    pour: 'Restaurants, bars, snacks, traiteurs',
    img: '/images/tablier.webp',
    contenu: 'Polo + tablier',
    marquage: 'Logo brodé sur les deux pièces',
    unite: 'la tenue',
    prix: [38.9, 36.9, 32.9, 30.9],
    devis: { quantities: { polos: 50, tabliers: 50 }, marquages: { polos: { coeur: 'broderie' }, tabliers: { poitrine: 'broderie' } } },
  },
  {
    id: 'evenement',
    nom: 'Événement',
    pour: 'Associations, salons, séminaires, collectivités',
    img: '/images/tshirt.webp',
    contenu: 'T-shirt',
    marquage: 'Visuel couleur côté cœur + grand visuel au dos (A3)',
    prix: [17.9, 15.9, 13.9, 12.9],
    devis: { quantities: { tshirts: 50 }, marquages: { tshirts: { coeur: 'dtf', dos: 'dtf' } } },
  },
  {
    id: 'club',
    nom: 'Club',
    pour: 'Clubs sportifs, écoles de sport, tournois',
    img: '/images/scene-club.webp',
    contenu: 'Maillot de sport',
    marquage: 'Écusson couleur + nom et numéro floqués au dos',
    prix: [24.9, 22.9, 20.9, 18.9],
    devis: { quantities: { maillots: 50 }, marquages: { maillots: { coeur: 'dtf', prenom: 'flocage', numero: 'flocage' } } },
  },
  {
    id: 'casquettes',
    nom: 'Casquettes',
    pour: 'Équipes en extérieur, goodies, événements',
    img: '/images/casquette.webp',
    contenu: 'Casquette',
    marquage: 'Logo brodé en face avant',
    prix: [13.9, 12.9, 10.9, 9.9],
    devis: { quantities: { casquettes: 50 }, marquages: { casquettes: { face: 'broderie' } } },
  },
]

export const OPTIONS_PACKS = [
  { label: 'Prénom brodé', prix: '+ 7 € HT / pièce' },
  { label: 'Numérisation du logo pour la broderie', prix: 'offerte' },
  { label: 'Livraison partout à La Réunion', prix: '15 € HT par commande, offerte dès 250 pièces' },
]

export const METIERS = [
  {
    id: 'restauration',
    bande: 40, // hauteur du bandeau-titre en haut de la photo (%)
    nom: 'Restauration & bars',
    img: '/images/scene-restauration.webp',
    label: 'Broderie · veste de cuisine',
    texte: 'Des tenues qui tiennent au lavage quotidien et qui rendent votre équipe reconnaissable en salle comme au comptoir.',
    pieces: ['Vestes de cuisine', 'Tabliers', 'Polos'],
    pack: 'restauration',
    secteur: 'Restauration',
  },
  {
    id: 'hotellerie',
    bande: 38, // hauteur du bandeau-titre en haut de la photo (%)
    nom: 'Hôtellerie & tourisme',
    img: '/images/scene-hotellerie.webp',
    label: 'Broderie dorée · côté cœur',
    texte: 'Chemises et polos brodés discrets pour l’accueil, la réception et les équipes au contact des clients.',
    pieces: ['Chemises', 'Polos', 'Vestes'],
    pack: 'accueil',
    secteur: 'Hôtellerie',
  },
  {
    id: 'entreprise',
    bande: 55, // hauteur du bandeau-titre en haut de la photo (%)
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
    bande: 30, // hauteur du bandeau-titre en haut de la photo (%)
    nom: 'BTP & artisans',
    img: '/images/scene-btp.webp',
    label: 'Logo imprimé au dos',
    texte: 'Votre logo bien visible sur les chantiers : brodé à l’avant, imprimé en grand au dos.',
    pieces: ['Vestes haute visibilité', 'T-shirts', 'Casquettes'],
    pack: 'terrain',
    secteur: 'Bâtiment & Artisanat',
  },
  {
    id: 'association',
    bande: 52, // hauteur du bandeau-titre en haut de la photo (%)
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
    bande: 30, // hauteur du bandeau-titre en haut de la photo (%)
    nom: 'Clubs sportifs',
    img: '/images/scene-club.webp',
    label: 'Flocage · nom et numéro',
    texte: 'Maillots, tenues d’entraînement et de déplacement aux couleurs du club, avec noms et numéros.',
    pieces: ['Maillots', 'Shorts', 'Survêtements'],
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
  'Dans 4 à 6 semaines',
  'Dans 2 à 3 mois',
  'Date précise (à indiquer dans les précisions)',
  'Pas de contrainte particulière',
]
export const DELAI_MINIMUM = 'Comptez 4 à 6 semaines entre la validation du devis et la livraison.'

export const ETAPES = [
  { titre: 'Votre demande en ligne', texte: 'Pièces, quantités, emplacements et logo : deux minutes suffisent.' },
  { titre: 'Conseil et maquette', texte: 'Nous vous proposons la technique adaptée, un devis détaillé et une maquette de votre logo.' },
  { titre: 'Validation', texte: 'Vous validez la maquette et le devis. Un acompte lance la production.' },
  { titre: 'Fabrication et contrôle', texte: 'Vos pièces sont fabriquées par nos ateliers partenaires, puis contrôlées une à une par TenuePro.' },
  { titre: 'Livraison', texte: 'Livraison partout à La Réunion : offerte dès 250 pièces, 15 € HT en dessous.' },
]

export const euro = (n) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + ' €'

export const lc = (t) => t.charAt(0).toLowerCase() + t.slice(1)

// Contenu modifiable depuis l'admin (onglet « Contenu »). Ces valeurs servent
// de base ; ce qui est enregistré dans Supabase (table site_content) les remplace.
export const DEFAULT_OFFRE = {
  MINIMUM_PIECES,
  PALIERS: [50, 100, 250, 500],   // quantités à partir desquelles chaque prix s'applique
  SEUIL_DEVIS: 1000,    // au-delà : prix sur devis
  CONTACT,
  PACKS,
  OPTIONS_PACKS,
  METIERS,
}
