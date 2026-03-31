import { useState } from 'react'
import { Link } from 'react-router-dom'

const filters = ['Tous', 'Restauration', 'Hôtellerie', 'Sport', 'Santé', 'Commerce', 'Associations']

const realisations = [
  // Restauration
  {
    id: 1, sector: 'Restauration', client: 'Le Lagon Bleu', location: 'Saint-Gilles-les-Bains',
    description: '25 polos brodés + tabliers flocagés pour l\'équipe de salle et de cuisine.',
    products: ['Polos brodés', 'Tabliers flocagés'], qty: 25,
    color: 'bg-orange-500', emoji: '🍽️',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2, sector: 'Restauration', client: 'Snack Ti Punch', location: 'Saint-Pierre',
    description: '15 t-shirts flocagés recto-verso pour le personnel de service.',
    products: ['T-shirts flocagés'], qty: 15,
    color: 'bg-orange-600', emoji: '🥘',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3, sector: 'Restauration', client: 'La Table Créole', location: 'Saint-Denis',
    description: '40 polos + casquettes brodées pour toute la brigade.',
    products: ['Polos brodés', 'Casquettes'], qty: 40,
    color: 'bg-amber-600', emoji: '🍳',
    image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=600&q=80',
  },
  // Hôtellerie
  {
    id: 4, sector: 'Hôtellerie', client: 'Hôtel Alamanda', location: 'Saint-Gilles',
    description: '60 pièces : polos réception + t-shirts ménage + casquettes concierge.',
    products: ['Polos brodés', 'T-shirts', 'Casquettes'], qty: 60,
    color: 'bg-blue-500', emoji: '🏨',
    image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 5, sector: 'Hôtellerie', client: 'Villa Bougainville', location: 'Hell-Bourg',
    description: '20 chemises brodées pour le personnel de la réception et du spa.',
    products: ['Chemises brodées'], qty: 20,
    color: 'bg-blue-600', emoji: '🌺',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
  },
  // Sport
  {
    id: 6, sector: 'Sport', client: 'FC Saint-Pierre', location: 'Saint-Pierre',
    description: '50 maillots + vestes de survêtement flocagés nom et numéro.',
    products: ['Maillots flocagés', 'Vestes'], qty: 50,
    color: 'bg-green-600', emoji: '⚽',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 7, sector: 'Sport', client: 'Réunion Trail Club', location: 'Cilaos',
    description: '30 t-shirts techniques personnalisés pour les membres du club.',
    products: ['T-shirts techniques'], qty: 30,
    color: 'bg-green-700', emoji: '🏃',
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 8, sector: 'Sport', client: 'Académie de Judo 974', location: 'Le Tampon',
    description: '45 kimonos personnalisés + t-shirts de cours brodés.',
    products: ['Kimonos', 'T-shirts brodés'], qty: 45,
    color: 'bg-emerald-700', emoji: '🥋',
    image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=600&q=80',
  },
  // Santé
  {
    id: 9, sector: 'Santé', client: 'Clinique Sainte-Clotilde', location: 'Saint-Denis',
    description: '80 tuniques médicales brodées pour les infirmières et aide-soignantes.',
    products: ['Tuniques médicales'], qty: 80,
    color: 'bg-teal-600', emoji: '🏥',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 10, sector: 'Santé', client: 'Cabinet Dr. Fontaine', location: 'Saint-Paul',
    description: '10 blouses brodées nom + spécialité pour l\'équipe médicale.',
    products: ['Blouses brodées'], qty: 10,
    color: 'bg-teal-700', emoji: '🩺',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
  },
  // Commerce
  {
    id: 11, sector: 'Commerce', client: 'Bijouterie Éclat d\'Or', location: 'Saint-Denis',
    description: '12 vestes brodées avec logo discret pour les vendeurs.',
    products: ['Vestes brodées'], qty: 12,
    color: 'bg-purple-600', emoji: '💍',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 12, sector: 'Commerce', client: 'Super Marché Réunion', location: 'Saint-Benoît',
    description: '100 t-shirts flocagés + tabliers pour caissiers et agents de rayon.',
    products: ['T-shirts flocagés', 'Tabliers'], qty: 100,
    color: 'bg-purple-700', emoji: '🛒',
    image: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=600&q=80',
  },
  // Associations
  {
    id: 13, sector: 'Associations', client: 'Association Ti Kréol', location: 'Saint-Louis',
    description: '20 polos brodés pour les bénévoles de l\'association culturelle.',
    products: ['Polos brodés'], qty: 20,
    color: 'bg-yellow-600', emoji: '🤝',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 14, sector: 'Associations', client: 'Lions Club La Réunion', location: 'Saint-Denis',
    description: '35 polos brodés avec emblème du club pour les membres actifs.',
    products: ['Polos brodés'], qty: 35,
    color: 'bg-yellow-700', emoji: '🦁',
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=600&q=80',
  },
]

function RealisationCard({ r }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
      {/* Visual */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={r.image}
          alt={r.client}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className={`absolute inset-0 ${r.color} opacity-50`} />
        <div className="absolute inset-0 flex flex-col items-end justify-start p-3">
          <span className="bg-black/40 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
            {r.sector}
          </span>
        </div>
      </div>
      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-900 text-base leading-tight">{r.client}</h3>
          <span className="flex-shrink-0 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{r.qty} pièces</span>
        </div>
        <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {r.location}
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">{r.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {r.products.map((p, i) => (
            <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{p}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Realisations() {
  const [activeFilter, setActiveFilter] = useState('Tous')

  const filtered = activeFilter === 'Tous'
    ? realisations
    : realisations.filter(r => r.sector === activeFilter)

  return (
    <div className="pt-16">
      {/* Header */}
      <section className="bg-gray-900 py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <span className="inline-block bg-[#7C3AED]/20 text-[#7C3AED] text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-[#7C3AED]/30">
            Nos réalisations
          </span>
          <h1 className="text-4xl font-extrabold text-white mb-4">Ils nous ont fait confiance</h1>
          <p className="text-gray-400 text-lg">Restaurants, hôtels, clubs sportifs, commerces… découvrez quelques-unes de nos réalisations à La Réunion.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#7C3AED] py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {[
              { val: '+500', label: 'Clients satisfaits' },
              { val: '+15 000', label: 'Pièces produites' },
              { val: '6', label: 'Secteurs couverts' },
              { val: '< 15j', label: 'Délai moyen' },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-3xl font-extrabold">{s.val}</div>
                <div className="text-red-200 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filtres + Grille */}
      <section className="py-16 bg-gray-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filtres */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeFilter === f
                    ? 'bg-[#7C3AED] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Count */}
          <p className="text-center text-sm text-gray-500 mb-8">
            {filtered.length} réalisation{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}
          </p>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(r => (
              <RealisationCard key={r.id} r={r} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white text-center border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Votre projet, notre prochaine réalisation</h2>
          <p className="text-gray-500 mb-8">Rejoignez les centaines d'entreprises réunionnaises qui nous font confiance pour habiller leurs équipes.</p>
          <Link to="/devis" className="btn-primary text-base py-3.5 px-10">
            Demander un devis gratuit
          </Link>
        </div>
      </section>
    </div>
  )
}
