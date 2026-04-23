import { Link } from 'react-router-dom'

const packs = [
  {
    id: 'starter',
    name: 'PACK STARTER',
    tag: 'Association & Petit commerce',
    price: 290,
    oldPrice: 340,
    saving: 50,
    gradient: 'from-amber-500 to-amber-700',
    image: 'https://res.cloudinary.com/djq5gqxmj/image/upload/v1776790598/Packstarter_tug8cg.png',
    description: 'La solution idéale pour se lancer. 10 polos brodés avec votre logo poitrine pour une image professionnelle dès le premier jour.',
    includes: [
      '10 polos manches courtes (coloris au choix)',
      'Broderie logo poitrine gauche (jusqu\'à 8 cm)',
      'Numérisation logo offerte',
      'Maquette gratuite sous 24h',
      'Livraison partout à La Réunion',
    ],
    options: ['Ajout prénom : +1,50€/pièce', 'Broderie dos : +3€/pièce', 'Coloris mixtes possible'],
    ideal: 'Associations, auto-entrepreneurs, petits commerces, coiffeurs, artisans',
    delay: '10 à 12 jours ouvrés',
  },
  {
    id: 'equipe',
    name: 'PACK ÉQUIPE',
    tag: 'Restaurant & Hôtellerie',
    price: 790,
    oldPrice: 890,
    saving: 100,
    gradient: 'from-[#7C3AED] to-violet-800',
    badge: 'Populaire',
    image: 'https://res.cloudinary.com/djq5gqxmj/image/upload/v1776790598/PackEquipe_q6tl0f.png',
    description: 'La formule complète pour une brigade homogène. Logo brodé + prénom personnalisé + flocage dos pour une identité visuelle forte.',
    includes: [
      '30 polos manches courtes ou longues',
      'Broderie logo poitrine + prénom',
      'Flocage ou broderie dos (jusqu\'à 25 cm)',
      'Numérisation logo offerte',
      'Maquette gratuite sous 24h',
      'Livraison partout à La Réunion',
    ],
    options: ['Tabliers en remplacement de polos', 'Casquettes +8€/pièce', 'Tailles spéciales sur demande'],
    ideal: 'Restaurants, hôtels, snacks, bars, résidences touristiques',
    delay: '12 à 14 jours ouvrés',
  },
  {
    id: 'premium',
    name: 'PACK PREMIUM',
    tag: 'Entreprise & Chaîne',
    price: 1290,
    oldPrice: 1590,
    saving: 300,
    gradient: 'from-gray-800 to-gray-950',
    image: 'https://res.cloudinary.com/djq5gqxmj/image/upload/v1776790598/PackPremium_cobrdq.png',
    description: 'La solution globale pour les grandes équipes. Mix de produits, broderie et flocage recto-verso pour une identité professionnelle complète.',
    includes: [
      '50 pièces mixtes au choix (polos, tabliers, casquettes)',
      'Broderie + flocage recto-verso sur chaque pièce',
      'Prénom et poste brodés',
      'Numérisation logo offerte',
      'Maquette gratuite sous 24h',
      'Livraison prioritaire à La Réunion',
      'Responsable de compte dédié',
    ],
    options: ['Vestes, chemises, sacs en option', 'Commandes récurrentes avec tarif préférentiel', 'Conditionnement individuel nominatif'],
    ideal: 'Chaînes de restaurants, hôtels, cliniques, grandes entreprises, franchises',
    delay: '14 à 15 jours ouvrés',
  },
]

const faqs = [
  {
    q: 'Quel format de logo fournir ?',
    a: 'Idéalement un fichier vectoriel (.ai, .svg, .eps). Un .pdf ou .png haute résolution (300 dpi minimum) fonctionne aussi très bien. On s\'occupe de la numérisation pour la broderie.',
  },
  {
    q: 'Peut-on mélanger les couleurs de polos ?',
    a: 'Oui, vous pouvez choisir plusieurs coloris au sein d\'un même pack. Précisez vos préférences lors de votre devis.',
  },
  {
    q: 'Qu\'est-ce qui différencie broderie et flocage ?',
    a: 'La broderie est cousue sur le tissu (relief, durabilité, haut de gamme). Le flocage est une impression thermocollée (idéal pour les grands visuels dos, souple et léger).',
  },
  {
    q: 'Est-ce que vous fournissez les polos ou on envoie les nôtres ?',
    a: 'Nous fournissons des polos de qualité professionnelle inclus dans nos packs. Si vous avez des pièces spécifiques (marque ou stock existant), contactez-nous pour un devis personnalisé.',
  },
]

export default function Packs() {
  return (
    <div className="pt-16">
      {/* Header */}
      <section className="bg-gray-900 py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <span className="inline-block bg-[#7C3AED]/20 text-[#7C3AED] text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-[#7C3AED]/30">
            Packs tout compris
          </span>
          <h1 className="text-4xl font-extrabold text-white mb-4">Des formules claires,<br />des prix transparents</h1>
          <p className="text-gray-400 text-lg">Chaque pack inclut la maquette, la numérisation et la livraison à La Réunion. Sans frais cachés.</p>
        </div>
      </section>

      {/* Packs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {packs.map((pack, i) => (
            <div key={pack.id} className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 group">
              {/* Image + titre */}
              <div className="relative h-56 md:h-64 overflow-hidden">
                <img
                  src={pack.image}
                  alt={pack.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${pack.gradient} opacity-75`} />
                <div className="absolute inset-0 flex flex-col md:flex-row md:items-end justify-end md:justify-between p-8 md:p-10 gap-4">
                  <div>
                    {pack.badge && (
                      <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full mb-3 border border-white/30">
                        {pack.badge}
                      </span>
                    )}
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow">{pack.name}</h2>
                    <p className="text-white/80 mt-1 text-sm">{pack.tag}</p>
                  </div>
                  <div className="text-left md:text-right flex-shrink-0">
                    <div className="flex items-baseline gap-3 md:justify-end">
                      <span className="text-4xl md:text-5xl font-extrabold text-white drop-shadow">{pack.price}€</span>
                      <span className="text-white/60 line-through text-lg">{pack.oldPrice}€</span>
                    </div>
                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-3 py-1 rounded-full mt-2 border border-white/30">
                      Économie : {pack.saving}€
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 md:p-10">
                <p className="text-gray-600 mb-8 text-base leading-relaxed">{pack.description}</p>
                <div className="grid md:grid-cols-3 gap-8">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Inclus dans le pack</h3>
                    <ul className="space-y-2">
                      {pack.includes.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                          <svg className="w-4 h-4 text-[#7C3AED] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Options disponibles</h3>
                    <ul className="space-y-2">
                      {pack.options.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-500">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1 text-sm uppercase tracking-wider">Idéal pour</h3>
                      <p className="text-sm text-gray-600">{pack.ideal}</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1 text-sm uppercase tracking-wider">Délai</h3>
                      <p className="text-sm text-gray-600">⏱️ {pack.delay}</p>
                    </div>
                    <Link
                      to={`/devis?pack=${pack.id}`}
                      className="btn-primary w-full justify-center mt-4"
                    >
                      Choisir ce pack
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Pack sur mesure */}
          <div className="rounded-3xl border-2 border-dashed border-gray-300 p-10 text-center hover:border-[#7C3AED] transition-colors duration-300 group">
            <div className="w-16 h-16 rounded-2xl border-2 border-[#7C3AED] text-[#7C3AED] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">PACK SUR MESURE</h2>
            <p className="text-gray-500 max-w-xl mx-auto mb-6">
              Vous avez des besoins spécifiques ? Quantité différente, produits particuliers, délai urgent ?
              Décrivez votre projet et nous vous préparons un devis personnalisé sous 24h.
            </p>
            <Link to="/devis" className="btn-primary text-base py-3.5 px-8">
              Demander un devis sur mesure
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-10">Questions fréquentes</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#7C3AED] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-white mb-4">Vous hésitez encore ?</h2>
          <p className="text-violet-100 mb-6">Appelez-nous directement — on vous conseille gratuitement.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/devis" className="bg-white text-[#7C3AED] font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors">
              Demander un devis gratuit
            </Link>
            <a href="tel:+262692000000" className="border-2 border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-white/10 transition-colors">
              Nous appeler
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
