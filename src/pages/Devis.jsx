import { useState } from 'react'
import { Link } from 'react-router-dom'
import { submitDevisForm } from '../lib/webhook'

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

const quantites = ['Moins de 10', '10 à 30', '31 à 50', '51 à 100', 'Plus de 100']

const delais = [
  'Le plus vite possible (urgent)',
  'Sous 3 semaines',
  'Sous 1 mois',
  'Sous 2 mois',
  'Pas de contrainte particulière',
]

const initialForm = {
  nom: '', prenom: '', entreprise: '', siret: '', email: '', telephone: '',
  secteur: '', produits: [], marquage: '', quantite: '', delai: '',
  description: '', logo: null,
}

export default function Devis() {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [webhookError, setWebhookError] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleCheckbox = (id) => {
    setForm(prev => ({
      ...prev,
      produits: prev.produits.includes(id)
        ? prev.produits.filter(p => p !== id)
        : [...prev.produits, id],
    }))
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
    if (!form.quantite) e.quantite = 'Veuillez estimer la quantité'
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
    const result = await submitDevisForm({
      contact_name:  `${form.prenom} ${form.nom}`.trim(),
      contact_email: form.email,
      contact_phone: form.telephone,
      company_name:  form.entreprise,
      siret:         form.siret,
      sector:        form.secteur,
      products:      form.produits,
      quantity:      form.quantite,
      description:   form.description,
      deadline:      form.delai,
      logo_url:      null,
    })
    setLoading(false)
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
            <p>Produits : {form.produits.map(p => produits.find(x => x.id === p)?.label).join(', ')}</p>
            <p>Quantité estimée : {form.quantite}</p>
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
      <section className="bg-gray-900 py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <span className="inline-block bg-[#7C3AED]/20 text-[#7C3AED] text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-[#7C3AED]/30">
            Devis gratuit
          </span>
          <h1 className="text-4xl font-extrabold text-white mb-4">Décrivez votre projet</h1>
          <p className="text-gray-400 text-lg">Maquette + devis personnalisé sous 24h, sans engagement. 100% gratuit.</p>
        </div>
      </section>

      {/* Avantages */}
      <div className="bg-[#7C3AED] py-4">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white text-sm font-medium">
            {['Maquette gratuite sous 24h', 'Sans engagement', 'Livraison à La Réunion', 'Acompte 50% à la commande'].map((t, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {submitted && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-800 font-medium">Votre demande a bien été envoyée ! Nous vous contactons sous 24h.</p>
            </div>
          )}
          {webhookError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-800 font-medium">Une erreur s'est produite. Appelez-nous au <strong>0692 10 52 17</strong></p>
            </div>
          )}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 text-sm text-red-700">
              Veuillez corriger les erreurs indiquées dans le formulaire.
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg p-8 space-y-8">

            {/* Infos personnelles */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#7C3AED] rounded-full text-white text-xs font-bold flex items-center justify-center">1</span>
                Vos coordonnées
              </h2>
              <p className="text-sm text-gray-500 mb-4 ml-9">Pour vous envoyer votre devis personnalisé</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'prenom',     label: 'Prénom *',                  placeholder: 'Jean',                  type: 'text',  span: false },
                  { name: 'nom',        label: 'Nom *',                     placeholder: 'Dupont',                type: 'text',  span: false },
                  { name: 'entreprise', label: 'Entreprise / Organisation',  placeholder: 'Restaurant Le Lagon',  type: 'text',  span: true  },
                  { name: 'siret',      label: 'SIRET',                     placeholder: '12345678901234',        type: 'text',  span: true, maxLength: 14 },
                  { name: 'email',      label: 'Email *',                   placeholder: 'jean@monentreprise.re', type: 'email', span: false },
                  { name: 'telephone',  label: 'Téléphone *',               placeholder: '+262 692 XX XX XX',    type: 'tel',   span: false },
                ].map(field => (
                  <div key={field.name} className={field.span ? 'sm:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      maxLength={field.maxLength}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] transition-colors ${
                        errors[field.name] ? 'border-red-400 bg-violet-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    />
                    {errors[field.name] && <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>}
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Secteur */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#7C3AED] rounded-full text-white text-xs font-bold flex items-center justify-center">2</span>
                Secteur d'activité
              </h2>
              <p className="text-sm text-gray-500 mb-4 ml-9">Pour mieux adapter nos recommandations</p>
              <select
                name="secteur"
                value={form.secteur}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] transition-colors ${
                  errors.secteur ? 'border-red-400 bg-violet-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <option value="">Sélectionnez votre secteur...</option>
                {secteurs.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.secteur && <p className="text-red-500 text-xs mt-1">{errors.secteur}</p>}
            </div>

            <hr className="border-gray-100" />

            {/* Produits */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span className="w-7 h-7 bg-[#7C3AED] rounded-full text-white text-xs font-bold flex items-center justify-center">3</span>
                Produits souhaités *
              </h2>
              <p className="text-sm text-gray-500 mb-4 ml-9">Cochez tout ce qui vous intéresse</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {produits.map(p => (
                  <label
                    key={p.id}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      form.produits.includes(p.id)
                        ? 'border-[#7C3AED] bg-violet-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.produits.includes(p.id)}
                      onChange={() => handleCheckbox(p.id)}
                      className="sr-only"
                    />
                    <span className="text-xs font-semibold text-gray-700 text-center">{p.label}</span>
                    {form.produits.includes(p.id) && (
                      <svg className="w-4 h-4 text-[#7C3AED]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </label>
                ))}
              </div>
              {errors.produits && <p className="text-red-500 text-xs mt-2">{errors.produits}</p>}
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

            {/* Quantité + Délai */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#7C3AED] rounded-full text-white text-xs font-bold flex items-center justify-center">5</span>
                  Quantité estimée *
                </h2>
                <div className="mt-3 space-y-2 ml-9">
                  {quantites.map(q => (
                    <label key={q} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="quantite"
                        value={q}
                        checked={form.quantite === q}
                        onChange={handleChange}
                        className="accent-[#7C3AED]"
                      />
                      <span className="text-sm text-gray-700">{q}</span>
                    </label>
                  ))}
                </div>
                {errors.quantite && <p className="text-red-500 text-xs mt-2 ml-9">{errors.quantite}</p>}
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <span className="w-7 h-7 bg-[#7C3AED] rounded-full text-white text-xs font-bold flex items-center justify-center">6</span>
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
                    Envoi en cours…
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
