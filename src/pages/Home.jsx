import { Link } from 'react-router-dom'
import { DevisButton } from '../components/DevisButton'

const arguments_ = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    title: 'Qualité broderie',
    desc: 'Fils haute résistance, rendu impeccable sur chaque pièce. Votre logo valorisé comme il se doit.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Livraison La Réunion',
    desc: 'Livraison partout à La Réunion sous 10 à 15 jours. Saint-Denis, Saint-Pierre, Saint-Paul et tout le département.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Devis en 24h',
    desc: 'Envoyez votre logo, recevez votre maquette et votre devis personnalisé en moins de 24 heures.',
  },
]

const steps = [
  {
    num: '01', title: 'Envoyez votre logo', desc: 'Transmettez votre logo (PNG, SVG ou PDF) via notre formulaire. Plus il est vectorisé, meilleur sera le rendu.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    num: '02', title: 'Maquette gratuite sous 24h', desc: 'Notre équipe prépare une simulation visuelle de votre broderie ou flocage, entièrement gratuite et sans engagement.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
  {
    num: '03', title: 'Validation + acompte 50%', desc: 'Vous validez la maquette et réglez 50% pour lancer la production. Le solde est dû à la livraison.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    num: '04', title: 'Livraison sous 10–15 jours', desc: 'Vos tenues personnalisées sont livrées à votre adresse à La Réunion, soigneusement emballées et prêtes à porter.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
  },
]

const packs = [
  {
    name: 'PACK STARTER',
    subtitle: 'Idéal association / petit commerce',
    price: '290€',
    oldPrice: '340€',
    color: 'from-amber-500 to-amber-700',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    items: ['10 polos brodés', 'Logo poitrine', 'Couleur au choix', 'Livraison incluse'],
  },
  {
    name: 'PACK ÉQUIPE',
    subtitle: 'Idéal restaurant / hôtel',
    price: '790€',
    oldPrice: '890€',
    color: 'from-[#7C3AED] to-violet-800',
    badge: 'Populaire',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80',
    items: ['30 polos brodés', 'Logo + prénom', 'Flocage dos', 'Livraison incluse'],
  },
  {
    name: 'PACK PREMIUM',
    subtitle: 'Idéal entreprise / chaîne',
    price: '1 290€',
    oldPrice: '1 590€',
    color: 'from-gray-800 to-gray-950',
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',
    items: ['50 pièces mixtes', 'Polos + tabliers + casquettes', 'Broderie + flocage recto-verso', 'Livraison prioritaire'],
  },
]

const sectors = [
  { label: 'Restauration', color: 'bg-orange-500', emoji: '🍽️', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80' },
  { label: 'Hôtellerie', color: 'bg-blue-500', emoji: '🏨', image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=600&q=80' },
  { label: 'Sport', color: 'bg-green-600', emoji: '⚽', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80' },
  { label: 'Santé', color: 'bg-teal-600', emoji: '🏥', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80' },
  { label: 'Commerce', color: 'bg-purple-600', emoji: '🛍️', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80' },
  { label: 'Associations', color: 'bg-yellow-600', emoji: '🤝', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80' },
]

export default function Home() {
  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center bg-gray-900 overflow-hidden pt-16">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#7C3AED] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500 rounded-full blur-3xl" />
        </div>
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-[#7C3AED]/20 text-[#7C3AED] text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-[#7C3AED]/30">
              <span className="w-2 h-2 bg-[#7C3AED] rounded-full animate-pulse" />
              Spécialiste à La Réunion
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Votre équipe,
              <br />
              <span className="text-[#7C3AED]">votre image.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-lg">
              Broderie & flocage professionnel à La Réunion.
              Des tenues qui reflètent votre identité, livrées en 10 à 15 jours.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <DevisButton className="btn-primary text-base py-3.5 px-8 justify-center">
                Demander un devis gratuit
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </DevisButton>
              <Link to="/realisations" className="btn-secondary text-base py-3.5 px-8 justify-center">
                Voir les réalisations
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-4 text-sm text-gray-400">
              {['Maquette offerte', 'Devis sous 24h', 'Qualité professionnelle garantie'].map((label) => (
                <div key={label} className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative">
              {/* Main image */}
              <div className="w-80 h-80 rounded-3xl overflow-hidden shadow-2xl rotate-3">
                <img
                  src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=640&q=80"
                  alt="Équipe en tenues professionnelles"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-3xl" />
              </div>
              {/* Second image card */}
              <div className="absolute -bottom-6 -left-6 w-44 h-44 rounded-2xl overflow-hidden shadow-xl border-2 border-white -rotate-3">
                <img
                  src="https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?auto=format&fit=crop&w=400&q=80"
                  alt="Broderie sur polo"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Badge */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-3 text-center z-10">
                <p className="text-2xl font-extrabold text-[#7C3AED]">+500</p>
                <p className="text-xs text-gray-600 font-medium">clients satisfaits</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ARGUMENTS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Pourquoi choisir TenuePro ?</h2>
            <p className="section-subtitle">Des tenues professionnelles qui font la différence, livrées à La Réunion.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {arguments_.map((arg, i) => (
              <div key={i} className="group p-8 rounded-2xl border border-gray-100 hover:border-[#7C3AED]/30 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-[#7C3AED]/10 rounded-xl flex items-center justify-center text-[#7C3AED] mb-5 group-hover:bg-[#7C3AED] group-hover:text-white transition-colors duration-300">
                  {arg.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{arg.title}</h3>
                <p className="text-gray-500 leading-relaxed">{arg.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PACKS APERÇU ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Nos packs tout compris</h2>
            <p className="section-subtitle">Des formules claires, sans surprise, adaptées à chaque besoin.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packs.map((pack, i) => (
              <div key={i} className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                {pack.badge && (
                  <div className="absolute top-4 right-4 bg-white text-[#7C3AED] text-xs font-bold px-3 py-1 rounded-full shadow z-10">
                    {pack.badge}
                  </div>
                )}
                {/* Image header */}
                <div className="relative h-44 overflow-hidden">
                  <img src={pack.image} alt={pack.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${pack.color} opacity-80`} />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h3 className="font-extrabold text-lg leading-tight">{pack.name}</h3>
                    <p className="text-white/80 text-xs mt-0.5">{pack.subtitle}</p>
                  </div>
                </div>
                {/* Price */}
                <div className={`bg-gradient-to-r ${pack.color} px-5 py-3 flex items-baseline gap-2`}>
                  <span className="text-3xl font-extrabold text-white">{pack.price}</span>
                  <span className="text-white/60 line-through text-sm">{pack.oldPrice}</span>
                </div>
                <div className="bg-white p-6">
                  <ul className="space-y-2.5 mb-6">
                    {pack.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-4 h-4 text-[#7C3AED] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <DevisButton className="block text-center btn-primary w-full justify-center">
                    Choisir ce pack
                  </DevisButton>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/packs" className="btn-outline">
              Voir tous les packs
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">Comment ça marche ?</h2>
            <p className="section-subtitle">4 étapes simples pour avoir vos tenues professionnelles personnalisées.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Ligne connecteur (desktop) */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gray-200 z-0" />
            {steps.map((step, i) => (
              <div key={i} className="relative text-center z-10">
                <div className="relative inline-block mb-5">
                  <div className="w-20 h-20 rounded-2xl border-2 border-[#7C3AED] bg-white flex items-center justify-center mx-auto text-[#7C3AED] shadow-sm">
                    {step.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#7C3AED] text-white text-xs font-bold rounded-full flex items-center justify-center shadow">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <DevisButton className="btn-primary text-base py-3.5 px-10">
              Démarrer maintenant — c'est gratuit
            </DevisButton>
          </div>
        </div>
      </section>

      {/* ── RÉALISATIONS APERÇU ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Ils nous font confiance</h2>
            <p className="section-subtitle">Restaurants, hôtels, clubs sportifs, commerces… découvrez nos réalisations.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {sectors.map((s, i) => (
              <Link key={i} to="/realisations" className="relative rounded-2xl aspect-video overflow-hidden shadow-md hover:scale-105 hover:shadow-xl transition-all duration-300 group block">
                <img
                  src={s.image}
                  alt={s.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className={`absolute inset-0 ${s.color} opacity-50 group-hover:opacity-40 transition-opacity duration-300`} />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <span className="text-sm sm:text-base font-bold drop-shadow">{s.label}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/realisations" className="btn-outline">
              Voir toutes les réalisations
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-20 bg-[#7C3AED]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Prêt à habiller votre équipe ?
          </h2>
          <p className="text-violet-100 text-lg mb-8 max-w-2xl mx-auto">
            Demandez votre devis gratuit dès maintenant. Maquette sous 24h, sans engagement.
            On s'occupe de tout à La Réunion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <DevisButton
              className="bg-white text-[#7C3AED] font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-base shadow-lg"
            >
              Demander mon devis gratuit
            </DevisButton>
            <a
              href="tel:+262692105217"
              className="border-2 border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-white/10 transition-colors text-base"
            >
              +262 692 10 52 17
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
