import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { submitDevisForm, uploadLogoToCloudinary } from '../lib/webhook'
import { buildAllMockupUrls } from '../lib/mockups'

const secteurs = [
  'Restauration', 'Hôtellerie', 'Commerce de détail', 'Sport & Loisirs',
  'Santé & Bien-être', 'Associations & Événementiel', 'Bâtiment & Artisanat',
  'Transport & Logistique', 'Services à la personne', 'Autre',
]

const produits = [
  { id: 'polos', label: 'Polos' },
  { id: 'tshirts', label: 'T-shirts' },
  { id: 'vestes', label: 'Vestes & Sweats' },
  { id: 'casquettes', label: 'Casquettes' },
  { id: 'tabliers', label: 'Tabliers' },
  { id: 'chemises', label: 'Chemises' },
  { id: 'sacs', label: 'Sacs & Tote bags' },
]

const marquages = [
  { id: 'broderie', label: 'Broderie', desc: 'Relief cousu, haut de gamme' },
  { id: 'flocage', label: 'Flocage', desc: 'Impression thermocollée' },
  { id: 'les_deux', label: 'Les deux', desc: 'Broderie + flocage' },
  { id: 'ne_sait_pas', label: 'Je ne sais pas encore', desc: 'On vous conseille' },
]

const delais = [
  'Le plus vite possible (urgent)',
  'Sous 3 semaines',
  'Sous 1 mois',
  'Sous 2 mois',
  'Pas de contrainte particulière',
]

const PACK_CONFIG = {
  starter: {
    label: 'Pack Starter',
    summary: '10 polos',
    produits: ['polos'],
    quantities: { polos: 10 },
    marquage: 'broderie',
  },
  equipe: {
    label: 'Pack Équipe',
    summary: '30 polos',
    produits: ['polos'],
    quantities: { polos: 30 },
    marquage: 'les_deux',
  },
  premium: {
    label: 'Pack Premium',
    summary: '50 pièces mixtes (polos, tabliers, casquettes)',
    produits: ['polos', 'tabliers', 'casquettes'],
    quantities: { polos: 25, tabliers: 15, casquettes: 10 },
    marquage: 'les_deux',
  },
}

const initialForm = {
  nom: '', prenom: '', entreprise: '', siret: '', email: '', telephone: '',
  secteur: '', produits: [], marquage: '', quantities: {}, delai: '',
  description: '', logo: null,
}

export default function Devis() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  // ─── LES HOOKS DOIVENT ÊTRE APPELÉS AU DÉBUT DU COMPOSANT ───────────────────────────────────
  const [searchParams] = useSearchParams()
  const packParam  = searchParams.get('pack')
  const selectedPack = PACK_CONFIG[packParam] ?? null

  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [webhookError, setWebhookError] = useState(false)
  const [loadingMsg,   setLoadingMsg]   = useState('')

  // ─── Scroll en haut à chaque arrivée sur la page ────────────────────────────
  useEffect(() => { window.scrollTo(0, 0) }, [])

  // ─── Pré-remplissage si un pack est sélectionné ──────────────────────────────
  useEffect(() => {
    if (!selectedPack) return
    setForm(prev => ({
      ...prev,
      produits:   [...selectedPack.produits],
      quantities: { ...selectedPack.quantities },
      marquage:   selectedPack.marquage,
    }))
  }, [packParam]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── PROTECTION: Rediriger si non connecté ───────────────────────────────────
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('❌ Utilisateur non connecté sur /devis, redirection vers /login')
      navigate('/login', { state: { from: `/devis${packParam ? `?pack=${packParam}` : ''}` } })
    }
  }, [user, authLoading, navigate, packParam])

  // Si en train de charger l'authentification
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Vérification de votre connexion...</p>
        </div>
      </div>
    )
  }

  // Si pas connecté (pendant la redirection)
  if (!user) {
    return null
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleCheckbox = (id) => {
    setForm(prev => {
      const isSelected = prev.produits.includes(id)
      const newQuantities = { ...prev.quantities }
      if (isSelected) delete newQuantities[id]
      return {
        ...prev,
        produits: isSelected ? prev.produits.filter(p => p !== id) : [...prev.produits, id],
        quantities: newQuantities,
      }
    })
  }

  const handleQuantityChange = (productId, value) => {
    setForm(prev => ({ ...prev, quantities: { ...prev.quantities, [productId]: value } }))
    if (errors.quantite) setErrors(prev => ({ ...prev, quantite: '' }))
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (file) setForm(prev => ({ ...prev, logo: file }))
  }

  const validate = () => {
    const e = {}
    if (!form.nom.trim()) e.nom = 'Le nom est requis'
    if (!form.prenom.trim()) e.prenom = 'Le prénom est requis'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide'
    if (!form.telephone.trim()) e.telephone = 'Le téléphone est requis'
    if (!form.secteur) e.secteur = 'Veuillez sélectionner votre secteur'
    if (form.produits.length === 0) e.produits = 'Sélectionnez au moins un produit'
    const missingQty = form.produits.some(id => {
      const q = parseInt(form.quantities[id], 10)
      return !form.quantities[id] || isNaN(q) || q < 1
    })
    if (missingQty) e.quantite = 'Veuillez indiquer une quantité pour chaque produit sélectionné'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setLoading(true)
    setWebhookError(false)

    // ── 1. Upload logo vers Cloudinary ───────────────────────────────────────
    let logoUrl       = null
    let logoPublicId  = null
    let mockupUrls    = []

    if (form.logo) {
      setLoadingMsg('Upload du logo en cours…')
      try {
        const upload = await uploadLogoToCloudinary(form.logo)
        if (upload) {
          logoUrl      = upload.url
          logoPublicId = upload.public_id
          // ── 2. Construire les URLs de maquettes via overlay Cloudinary ────
          mockupUrls = buildAllMockupUrls(logoPublicId, form.produits)
        }
      } catch (err) {
        // Non bloquant : on continue sans maquettes
        console.warn('Upload logo échoué, demande soumise sans maquettes :', err.message)
      }
    }

    // ── 3. Soumettre la demande ───────────────────────────────────────────────
    setLoadingMsg('Envoi de votre demande…')
    const result = await submitDevisForm({
      contact_name:   `${form.prenom} ${form.nom}`.trim(),
      contact_email:  form.email,
      contact_phone:  form.telephone,
      company_name:   form.entreprise,
      siret:          form.siret,
      sector:         form.secteur,
      products:       form.produits,
      quantity:       Object.fromEntries(
        form.produits.map(id => [id, parseInt(form.quantities[id], 10)])
      ),
      description:    form.description,
      deadline:       form.delai,
      logo_url:       logoUrl,
      logo_public_id: logoPublicId,
      mockup_urls:    mockupUrls,
    })

    setLoading(false)
    setLoadingMsg('')

    if (result.success) {
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setWebhookError(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (submitted) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Demande envoyée !</h2>
          <p className="text-gray-600 mb-2">
            Merci <strong>{form.prenom} {form.nom}</strong> pour votre demande de devis.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Notre équipe analyse votre projet et vous revient avec une maquette et un devis
            personnalisé <strong>sous 24 heures</strong> à l'adresse <strong>{form.email}</strong>.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left text-sm text-gray-600 space-y-1">
            {form.produits.map(id => {
              const label = produits.find(x => x.id === id)?.label ?? id
              return (
                <p key={id}>{label} : <strong>{form.quantities[id]} pièce{form.quantities[id] > 1 ? 's' : ''}</strong></p>
              )
            })}
            <p>Délai souhaité : {form.delai || 'Non précisé'}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => { setSubmitted(false); setForm(initialForm) }}
              className="btn-outline justify-center"
            >
              Nouvelle demande
            </button>
            <Link to="/" className="btn-primary justify-center">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16">
      {/* Header */}
      <section className="bg-[#7C3AED] text-white py-12 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl font-extrabold mb-3">Demande de devis</h1>
          <p className="text-violet-100">Complétez ce formulaire, et recevez une maquette gratuite sous 24h</p>
        </div>
      </section>

      {/* Formulaire */}
      <section className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Erreur webhook */}
          {webhookError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">
                Une erreur s'est produite lors de l'envoi. Veuillez réessayer.
              </p>
            </div>
          )}

          {/* ── Bandeau pack sélectionné ── */}
          {selectedPack && (
            <div className="mb-6 flex items-center justify-between gap-4 p-4 bg-violet-50 border border-[#7C3AED]/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#7C3AED] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[#7C3AED] text-sm leading-tight">
                    {selectedPack.label} sélectionné
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedPack.summary} — formulaire pré-rempli, vous pouvez modifier
                  </p>
                </div>
              </div>
              <Link
                to="/packs"
                className="text-xs font-medium text-[#7C3AED] underline underline-offset-2 hover:text-violet-800 flex-shrink-0 transition-colors"
              >
                Changer de pack
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            {/* Coordonnées */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#7C3AED] rounded-full text-white text-xs font-bold flex items-center justify-center">1</span>
                Vos coordonnées *
              </h2>
              <p className="text-sm text-gray-500 mb-4 ml-9">Pour qu'on vous recontacte rapidement</p>
              <div className="grid grid-cols-2 gap-4 ml-0">
                <div>
                  <input
                    type="text"
                    name="prenom"
                    value={form.prenom}
                    onChange={handleChange}
                    placeholder="Prénom"
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] hover:border-gray-300 transition-colors ${errors.prenom ? 'border-red-500' : 'border-gray-200'}`}
                  />
                  {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                    placeholder="Nom"
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] hover:border-gray-300 transition-colors ${errors.nom ? 'border-red-500' : 'border-gray-200'}`}
                  />
                  {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3 ml-0">
                <div>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] hover:border-gray-300 transition-colors ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <input
                    type="tel"
                    name="telephone"
                    value={form.telephone}
                    onChange={handleChange}
                    placeholder="Téléphone"
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] hover:border-gray-300 transition-colors ${errors.telephone ? 'border-red-500' : 'border-gray-200'}`}
                  />
                  {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Entreprise */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#7C3AED] rounded-full text-white text-xs font-bold flex items-center justify-center">2</span>
                Votre entreprise / Organisation
              </h2>
              <p className="text-sm text-gray-500 mb-4 ml-9">Le nom et le SIRET (optionnel)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-0">
                <input
                  type="text"
                  name="entreprise"
                  value={form.entreprise}
                  onChange={handleChange}
                  placeholder="Nom de l'entreprise"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] hover:border-gray-300 transition-colors"
                />
                <input
                  type="text"
                  name="siret"
                  value={form.siret}
                  onChange={handleChange}
                  placeholder="SIRET"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] hover:border-gray-300 transition-colors"
                />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Secteur */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#7C3AED] rounded-full text-white text-xs font-bold flex items-center justify-center">3</span>
                Secteur d'activité *
              </h2>
              <p className="text-sm text-gray-500 mb-4 ml-9">Quel est votre domaine ?</p>
              <select
                name="secteur"
                value={form.secteur}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] hover:border-gray-300 transition-colors ${errors.secteur ? 'border-red-500' : 'border-gray-200'}`}
              >
                <option value="">Sélectionnez un secteur</option>
                {secteurs.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.secteur && <p className="text-red-500 text-xs mt-1">{errors.secteur}</p>}
            </div>

            <hr className="border-gray-100" />

            {/* Produits */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#7C3AED] rounded-full text-white text-xs font-bold flex items-center justify-center">3</span>
                Vos produits *
              </h2>
              <p className="text-sm text-gray-500 mb-4 ml-9">Quel(s) produit(s) ?</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {produits.map(p => {
                  const selected = form.produits.includes(p.id)
                  return (
                    <div
                      key={p.id}
                      className={`rounded-xl border-2 transition-all duration-200 ${
                        selected ? 'border-[#7C3AED] bg-violet-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {/* Ligne sélection */}
                      <label className="flex items-center gap-2 cursor-pointer p-3">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => handleCheckbox(p.id)}
                          className="accent-[#7C3AED] cursor-pointer flex-shrink-0"
                        />
                        <span className="text-sm font-medium text-gray-900 flex-1 leading-tight">{p.label}</span>
                        {selected && (
                          <svg className="w-4 h-4 text-[#7C3AED] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        )}
                      </label>
                      {/* Champ quantité si sélectionné */}
                      {selected && (
                        <div className="px-3 pb-3">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={form.quantities[p.id] || ''}
                            onChange={e => handleQuantityChange(p.id, e.target.value)}
                            onKeyDown={e => ['e','E','+','-','.'].includes(e.key) && e.preventDefault()}
                            placeholder="Qté"
                            className={`w-full px-3 py-1.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] ${
                              errors.quantite && !form.quantities[p.id]
                                ? 'border-red-400'
                                : 'border-[#7C3AED]/30'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              {errors.produits && <p className="text-red-500 text-xs mt-2">{errors.produits}</p>}
              {errors.quantite && <p className="text-red-500 text-xs mt-1">{errors.quantite}</p>}
            </div>

            <hr className="border-gray-100" />

            {/* Marquage */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#7C3AED] rounded-full text-white text-xs font-bold flex items-center justify-center">4</span>
                Type de marquage
              </h2>
              <p className="text-sm text-gray-500 mb-4 ml-9">Broderie, flocage, ou les deux ?</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {marquages.map(m => (
                  <label
                    key={m.id}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      form.marquage === m.id
                        ? 'border-[#7C3AED] bg-violet-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="marquage"
                      value={m.id}
                      checked={form.marquage === m.id}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <p className="font-semibold text-sm text-gray-900">{m.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Délai */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#7C3AED] rounded-full text-white text-xs font-bold flex items-center justify-center">5</span>
                Délai souhaité
              </h2>
              <div className="mt-3 space-y-2 ml-9">
                {delais.map(d => (
                  <label key={d} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="delai"
                      value={d}
                      checked={form.delai === d}
                      onChange={handleChange}
                      className="accent-[#7C3AED]"
                    />
                    <span className="text-sm text-gray-700">{d}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Description */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#7C3AED] rounded-full text-white text-xs font-bold flex items-center justify-center">7</span>
                Décrivez votre projet
              </h2>
              <p className="text-sm text-gray-500 mb-4 ml-9">Couleurs, positionnement, textes, contraintes particulières…</p>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Ex : 20 polos blancs pour mon équipe de salle, logo brodé côté cœur, prénom en dessous, couleur bordeaux pour le fil…"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] hover:border-gray-300 transition-colors resize-none"
              />
            </div>

            {/* Upload logo */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#7C3AED] rounded-full text-white text-xs font-bold flex items-center justify-center">8</span>
                Votre logo
              </h2>
              <p className="text-sm text-gray-500 mb-4 ml-9">Formats acceptés : SVG, AI, PDF, PNG haute résolution (max 10 Mo)</p>
              <label className="block ml-0">
                <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  form.logo ? 'border-[#7C3AED] bg-violet-50' : 'border-gray-300 hover:border-[#7C3AED] hover:bg-gray-50'
                }`}>
                  {form.logo ? (
                    <div>
                      <svg className="w-8 h-8 text-[#7C3AED] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-medium text-[#7C3AED]">{form.logo.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Cliquez pour changer</p>
                    </div>
                  ) : (
                    <div>
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm font-medium text-gray-700">Glissez votre logo ici</p>
                      <p className="text-xs text-gray-500 mt-1">ou cliquez pour parcourir</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept=".svg,.ai,.pdf,.png,.jpg,.jpeg,.eps"
                  onChange={handleFile}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-400 mt-2 ml-0">
                Pas de logo pour l'instant ? Pas de problème — on peut le faire sans pour commencer.
              </p>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full btn-primary text-base py-4 justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {loadingMsg || 'Envoi en cours…'}
                  </>
                ) : (
                  <>
                    Envoyer ma demande de devis
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                En soumettant ce formulaire, vous acceptez d'être contacté par TenuePro concernant votre demande. Aucun démarchage.
              </p>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
