import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { submitDevisForm, uploadLogoToCloudinary } from '../lib/webhook'
import { buildAllMockupUrls } from '../lib/mockups'
import { PIECES, EMPLACEMENTS, SECTEURS, DELAIS, DELAI_MINIMUM, euro, emplacementsPour, taillesPour } from '../data/offre'
import { useOffre } from '../content/OffreContext'
import { Arrow } from '../components/ui'

const TECHS = [
  { id: 'broderie', label: 'Broderie' },
  { id: 'flocage', label: 'Flocage' },
  { id: 'dtf', label: 'DTF' },
  { id: 'conseil', label: 'À conseiller' },
]
const techLabel = (id) => TECHS.find((t) => t.id === id)?.label || id
const techTexte = (id) => (id === 'conseil' ? 'technique à conseiller' : id === 'dtf' ? 'impression DTF' : techLabel(id).toLowerCase())
const emplLabel = (id) => EMPLACEMENTS.find((e) => e.id === id)?.label || id
const emplAide = (id) => EMPLACEMENTS.find((e) => e.id === id)?.aide || ''
const pieceLabel = (id) => PIECES.find((p) => p.id === id)?.label || id

/** Marquages d'un pack ; accepte aussi l'ancien format (technique + emplacements communs). */
function marquagesDuPack(devis) {
  if (devis.marquages) return JSON.parse(JSON.stringify(devis.marquages))
  const tech = { broderie: 'broderie', flocage: 'flocage', dtf: 'dtf' }[devis.technique] || 'conseil'
  return Object.fromEntries(Object.keys(devis.quantities || {}).map((id) => [id, Object.fromEntries((devis.emplacements || []).map((e) => [e, tech]))]))
}

const HAUTS = ['polos', 'tshirts', 'chemises', 'vestes']

/** Petit schéma devant / dos qui montre où se trouve chaque emplacement */
function Schema({ selection }) {
  const forme = 'M30 8 L42 4 Q50 12 58 4 L70 8 L92 22 L84 38 L74 32 L74 94 L26 94 L26 32 L16 38 L8 22 Z'
  const points = { coeur: [62, 34, 0], droite: [38, 34, 0], manche: [84, 27, 0], nuque: [50, 15, 1], prenom: [50, 30, 1], dos: [50, 52, 1] }
  return (
    <svg viewBox="0 0 220 112" className="h-28 w-auto shrink-0" role="img" aria-label="Schéma des emplacements, devant et dos">
      {[0, 1].map((cote) => (
        <g key={cote} transform={`translate(${cote * 118} 0)`}>
          <path d={forme} fill="#F4F2FA" stroke="#241675" strokeWidth="1.5" strokeLinejoin="round" />
          {cote === 1 && <path d="M42 4 Q50 9 58 4" fill="none" stroke="#241675" strokeWidth="1.5" />}
          <text x="50" y="108" textAnchor="middle" fontSize="9" fontWeight="600" fill="#5E5A78" fontFamily="Inter, sans-serif">{cote ? 'Dos' : 'Devant'}</text>
          {Object.entries(points).filter(([, [, , c]]) => c === cote).map(([id, [x, y]]) => {
            const on = !!selection[id]
            return id === 'dos' || id === 'prenom'
              ? <rect key={id} x={x - (id === 'dos' ? 14 : 12)} y={y - (id === 'dos' ? 12 : 4)} width={id === 'dos' ? 28 : 24} height={id === 'dos' ? 24 : 8} rx="2" fill={on ? '#E8A33D' : 'none'} stroke={on ? '#241675' : '#C9C3E0'} strokeWidth="1.2" strokeDasharray={on ? '' : '2 2'} />
              : <circle key={id} cx={x} cy={y} r={on ? 5 : 3.5} fill={on ? '#E8A33D' : 'none'} stroke={on ? '#241675' : '#C9C3E0'} strokeWidth="1.2" strokeDasharray={on ? '' : '2 2'} />
          })}
        </g>
      ))}
    </svg>
  )
}

/** Résumé pour n8n : une technique, plusieurs, ou à conseiller. */
function techniqueGlobale(marquages) {
  const t = [...new Set(Object.values(marquages).flatMap((m) => Object.values(m)).filter((x) => x !== 'conseil'))]
  return t.length === 0 ? 'ne_sait_pas' : t.length === 1 ? t[0] : 'les_deux'
}

const STEPS = ['Pièces', 'Marquage', 'Tailles & délai', 'Coordonnées']

const initial = {
  produits: [], quantities: {}, marquages: {}, logo: null,
  secteur: '', delai: '', tailles: {}, description: '',
  prenom: '', nom: '', entreprise: '', siret: '', email: '', telephone: '',
}

export default function Devis() {
  const { PACKS, MINIMUM_PIECES, CONTACT } = useOffre()
  const [params] = useSearchParams()
  // Le pack (paramètre d'URL) n'est lu qu'une fois la page chargée : la page pré-générée n'en a pas
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const pack = (mounted && PACKS.find((p) => p.id === params.get('pack'))) || null
  const { user } = useAuth()

  const [form, setForm] = useState(initial)
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [sendMsg, setSendMsg] = useState('')
  const [sendError, setSendError] = useState(false)
  const [mailto, setMailto] = useState('')
  const [done, setDone] = useState(false)
  const topRef = useRef(null)
  const logoPreview = useMemo(() => (form.logo?.type?.startsWith('image/') ? URL.createObjectURL(form.logo) : null), [form.logo])
  useEffect(() => () => logoPreview && URL.revokeObjectURL(logoPreview), [logoPreview])

  // Le prix du pack ne s'affiche que tant que la demande correspond encore au pack
  const memes = (a, b) => JSON.stringify(Object.entries(a || {}).sort()) === JSON.stringify(Object.entries(b || {}).sort())
  const packIntact = !!pack && (() => {
    const ref = marquagesDuPack(pack.devis)
    const ids = Object.keys(pack.devis.quantities || {})
    return form.produits.length === ids.length && ids.every((id) => form.produits.includes(id) && memes(form.marquages[id], ref[id]))
  })()
  const qtePack = packIntact ? Math.min(...form.produits.map((id) => parseInt(form.quantities[id], 10) || 0)) : 0

  // Pré-remplissage depuis un pack, un métier, ou le compte client
  useEffect(() => {
    setForm((f) => ({
      ...f,
      ...(pack ? {
        produits: Object.keys(pack.devis.quantities || {}),
        quantities: { ...pack.devis.quantities },
        marquages: marquagesDuPack(pack.devis),
      } : {}),
      secteur: params.get('secteur') || f.secteur,
      email: f.email || user?.email || '',
    }))
  }, [pack?.id, user?.email]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }))
  }
  const total = useMemo(
    () => form.produits.reduce((s, id) => s + (parseInt(form.quantities[id], 10) || 0), 0),
    [form.produits, form.quantities]
  )

  const togglePiece = (id) => {
    setForm((f) => {
      const on = f.produits.includes(id)
      const quantities = { ...f.quantities }
      const marquages = { ...f.marquages }
      if (on) { delete quantities[id]; delete marquages[id] }
      else quantities[id] = quantities[id] || ''
      return { ...f, produits: on ? f.produits.filter((p) => p !== id) : [...f.produits, id], quantities, marquages }
    })
    setErrors((e) => ({ ...e, produits: '' }))
  }
  const toggleEmplacement = (piece, empl) => {
    setForm((f) => {
      const m = { ...(f.marquages[piece] || {}) }
      if (m[empl]) delete m[empl]
      else m[empl] = 'conseil'
      return { ...f, marquages: { ...f.marquages, [piece]: m } }
    })
    setErrors((e) => ({ ...e, marquages: '' }))
  }
  const setTech = (piece, empl, tech) =>
    setForm((f) => ({ ...f, marquages: { ...f.marquages, [piece]: { ...f.marquages[piece], [empl]: tech } } }))

  const sommeTailles = (id) => Object.values(form.tailles[id] || {}).reduce((a, n) => a + (parseInt(n, 10) || 0), 0)
  const setTaille = (id, t, v) => {
    setForm((f) => ({ ...f, tailles: { ...f.tailles, [id]: { ...(f.tailles[id] || {}), [t]: v } } }))
    setErrors((e) => ({ ...e, tailles: '' }))
  }
  const taillesTexte = (id) => {
    if (!taillesPour(id)) return 'taille unique'
    const t = Object.entries(form.tailles[id] || {}).filter(([, n]) => parseInt(n, 10) > 0)
    return t.length ? t.map(([k, n]) => `${k} ${n}`).join(' · ') : 'à préciser'
  }

  const validate = (s) => {
    const e = {}
    if (s === 0) {
      if (!form.produits.length) e.produits = 'Choisissez au moins une pièce.'
      else if (form.produits.some((id) => !(parseInt(form.quantities[id], 10) > 0))) e.produits = 'Indiquez une quantité pour chaque pièce choisie.'
      else {
        const bas = form.produits.filter((id) => parseInt(form.quantities[id], 10) < MINIMUM_PIECES)
        if (bas.length) e.produits = `Il faut au moins ${MINIMUM_PIECES} pièces par vêtement. À compléter : ${bas.map((id) => `${pieceLabel(id)} (${form.quantities[id]})`).join(', ')}.`
      }
    }
    if (s === 1) {
      const sans = form.produits.filter((id) => !Object.keys(form.marquages[id] || {}).length)
      if (sans.length) e.marquages = `Choisissez au moins un emplacement pour : ${sans.map(pieceLabel).join(', ')}.`
    }
    if (s === 2) {
      if (!form.secteur) e.secteur = 'Choisissez votre secteur.'
      const mal = form.produits.filter((id) => taillesPour(id) && sommeTailles(id) > 0 && sommeTailles(id) !== parseInt(form.quantities[id], 10))
      if (mal.length) e.tailles = `La répartition ne correspond pas à la quantité pour : ${mal.map((id) => `${pieceLabel(id)} (${sommeTailles(id)} sur ${form.quantities[id]})`).join(', ')}. Corrigez-la, ou laissez tout à zéro pour la préciser plus tard.`
    }
    if (s === 3) {
      if (!form.prenom.trim()) e.prenom = 'Indiquez votre prénom.'
      if (!form.nom.trim()) e.nom = 'Indiquez votre nom.'
      if (!form.entreprise.trim()) e.entreprise = 'Indiquez votre entreprise ou structure.'
      if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Adresse e-mail invalide.'
      if (form.telephone.replace(/\D/g, '').length < 9) e.telephone = 'Numéro de téléphone invalide.'
    }
    setErrors(e)
    return !Object.keys(e).length
  }

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const next = () => { if (validate(step)) { setStep(step + 1); scrollTop() } }
  const back = () => { setErrors({}); setStep(step - 1); scrollTop() }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (step < 3) return next()
    if (!validate(3)) return
    setSending(true); setSendError(false)

    let logoUrl = null, logoPublicId = null, mockupUrls = []
    if (form.logo) {
      setSendMsg('Envoi du logo…')
      try {
        const up = await Promise.race([uploadLogoToCloudinary(form.logo), new Promise((_, rej) => setTimeout(() => rej(new Error('délai dépassé')), 30000))])
        if (up) {
          logoUrl = up.url; logoPublicId = up.public_id
          mockupUrls = buildAllMockupUrls(logoPublicId, form.produits)
        }
      } catch (err) { console.error('Upload logo', err) /* non bloquant */ }
    }

    const description = [
      pack ? `Pack : ${pack.nom}${packIntact ? '' : ' (modifié par le client)'}` : null,
      'Marquage :',
      ...form.produits.map((id) => `- ${pieceLabel(id)} (${form.quantities[id]}) : ${Object.entries(form.marquages[id] || {}).map(([e, t]) => `${emplLabel(e)} : ${techTexte(t)}`).join(', ')}`),
      'Tailles :',
      ...form.produits.map((id) => `- ${pieceLabel(id)} : ${taillesTexte(id)}`),
      form.description.trim() ? `\n${form.description.trim()}` : null,
    ].filter(Boolean).join('\n')

    setSendMsg('Envoi de votre demande…')
    const result = await submitDevisForm({
      contact_name: `${form.prenom} ${form.nom}`.trim(),
      contact_email: form.email.trim(),
      contact_phone: form.telephone.trim(),
      company_name: form.entreprise.trim(),
      siret: form.siret.trim(),
      sector: form.secteur,
      products: form.produits,
      quantity: JSON.stringify(Object.fromEntries(form.produits.map((id) => [id, parseInt(form.quantities[id], 10)]))),
      description,
      deadline: form.delai,
      marquage: techniqueGlobale(form.marquages),
      emplacements: [...new Set(Object.values(form.marquages).flatMap((m) => Object.keys(m)))],
      marquages: form.marquages,
      tailles: Object.fromEntries(form.produits.filter(taillesPour).map((id) => [id, Object.fromEntries(Object.entries(form.tailles[id] || {}).filter(([, n]) => parseInt(n, 10) > 0).map(([k, n]) => [k, parseInt(n, 10)]))])),
      pack: packIntact ? pack.id : null,
      logo_url: logoUrl,
      logo_public_id: logoPublicId,
      mockup_urls: mockupUrls,
    })
    setSending(false); setSendMsg('')
    if (result.success) { setDone(true); window.scrollTo({ top: 0 }) }
    else {
      const corps = [
        'Bonjour,', '', 'Voici ma demande de devis (le formulaire du site n\'a pas pu l\'envoyer) :', '',
        `${form.prenom} ${form.nom} — ${form.entreprise}`, `Tél. : ${form.telephone} · E-mail : ${form.email}`, form.siret ? `SIRET : ${form.siret}` : '',
        `Secteur : ${form.secteur}`, `Pièces : ${form.produits.map((id) => `${pieceLabel(id)} × ${form.quantities[id]}`).join(', ')}`, '', description, '',
        form.delai ? `Délai souhaité : ${form.delai}` : '', form.logo ? '(Je joins mon logo à ce mail.)' : '',
      ].filter((l) => l !== null).join('\n')
      setMailto(`mailto:${CONTACT.email}?subject=${encodeURIComponent('Demande de devis — ' + (form.entreprise || form.nom))}&body=${encodeURIComponent(corps.slice(0, 1800))}`)
      setSendError(true)
    }
  }

  if (done) {
    return (
      <section className="bg-paper pt-16">
        <div className="wrap flex min-h-[70vh] items-center justify-center py-16">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-10 text-center shadow-sm">
            <span className="stitch-frame" aria-hidden="true" />
            <p className="eyebrow">Demande envoyée</p>
            <h1 className="mt-3 font-display text-3xl font-extrabold text-indigo">Merci {form.prenom}.</h1>
            <p className="lead mt-4">
              Nous étudions votre projet et revenons vers vous avec un devis détaillé et une maquette, à l’adresse <strong className="text-ink">{form.email}</strong>.
            </p>
            <p className="mt-4 text-sm text-ink-muted">Une question d’ici là ? <a className="btn-link" href={CONTACT.telHref}>{CONTACT.tel}</a></p>
            <Link to="/" className="btn-primary mt-8">Retour à l’accueil</Link>
          </div>
        </div>
      </section>
    )
  }

  const err = (k) => errors[k] && <p className="mt-2 text-sm font-medium text-[#B42318]" role="alert">{errors[k]}</p>

  return (
    <section className="bg-paper pt-16" ref={topRef}>
      <div className="wrap py-10 md:py-14">
        <p className="eyebrow">Demande de devis</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-indigo sm:text-4xl">Décrivez votre projet.</h1>
        <p className="mt-2 text-ink-muted">Quatre étapes, deux minutes, sans création de compte.</p>

        {/* Progression */}
        <ol className="mt-8 grid grid-cols-4 gap-2" aria-label="Étapes">
          {STEPS.map((s, i) => (
            <li key={s} aria-current={i === step ? 'step' : undefined}>
              <div className={`h-1.5 rounded-full ${i <= step ? 'bg-indigo' : 'bg-ink-line'}`} />
              <p className={`mt-2 text-xs font-semibold sm:text-sm ${i === step ? 'text-indigo' : 'text-ink-muted'}`}>
                <span className="hidden sm:inline">{i + 1}. </span>{s}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-ink-line bg-white p-6 md:p-8">
            {pack && step === 0 && (
              <div className="mb-6 rounded-lg bg-indigo-mist px-4 py-3 text-sm text-indigo">
                {packIntact
                  ? <>Pack <strong>{pack.nom}</strong> pré-rempli. Vous pouvez tout ajuster.</>
                  : <>Vous avez modifié le pack <strong>{pack.nom}</strong> : le prix sera calculé sur votre devis.</>}
              </div>
            )}

            {step === 0 && (
              <fieldset>
                <legend className="font-display text-xl font-bold text-indigo">Quelles pièces, et combien ?</legend>
                <p className="mt-1 text-sm text-ink-muted">{MINIMUM_PIECES} pièces minimum par vêtement, par exemple {MINIMUM_PIECES} t-shirts et {MINIMUM_PIECES} casquettes. Vous pourrez mélanger les tailles à l’étape 3.</p>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {PIECES.map((p) => {
                    const on = form.produits.includes(p.id)
                    return (
                      <div key={p.id} className={`overflow-hidden rounded-xl border-2 transition-colors ${on ? 'border-indigo' : 'border-ink-line hover:border-indigo/40'}`}>
                        <button type="button" onClick={() => togglePiece(p.id)} aria-pressed={on} className="block w-full text-left">
                          <img src={p.img} alt="" className="aspect-square w-full object-cover" />
                          <span className="flex items-center justify-between gap-2 px-3 pt-2.5 font-semibold text-ink">
                            {p.label}
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${on ? 'border-indigo bg-indigo text-white' : 'border-ink-line'}`} aria-hidden="true">
                              {on && <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="m2.5 6 2.5 2.5 4.5-5" /></svg>}
                            </span>
                          </span>
                        </button>
                        <div className="px-3 pb-3 pt-2">
                          {on ? (
                            <label className="flex items-center gap-2 text-sm text-ink-muted">
                              Qté
                              <input type="number" min="1" inputMode="numeric" value={form.quantities[p.id] ?? ''}
                                onChange={(e) => { setForm((f) => ({ ...f, quantities: { ...f.quantities, [p.id]: e.target.value } })); setErrors((x) => ({ ...x, produits: '' })) }}
                                className="field py-1.5" aria-label={`Quantité de ${p.label}`} />
                            </label>
                          ) : null}
                          {on && (parseInt(form.quantities[p.id], 10) || 0) < MINIMUM_PIECES && (
                            <p className="mt-1.5 text-xs font-medium text-gold-deep">Minimum {MINIMUM_PIECES}</p>
                          )}
                          {!on && <p className="text-xs leading-snug text-ink-muted">{p.usage}</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
                {err('produits')}
              </fieldset>
            )}

            {step === 1 && (
              <div className="space-y-8">
                <fieldset>
                  <legend className="font-display text-xl font-bold text-indigo">Où marquer chaque pièce, et comment&nbsp;?</legend>
                  <p className="mt-1 text-sm text-ink-muted">Choisissez les emplacements de chaque pièce, puis la technique. Vous hésitez&nbsp;? Laissez «&nbsp;À conseiller&nbsp;».</p>
                  <div className="mt-5 space-y-4">
                    {form.produits.map((id) => {
                      const piece = PIECES.find((p) => p.id === id)
                      const m = form.marquages[id] || {}
                      return (
                        <div key={id} className="rounded-xl border border-ink-line p-4 sm:p-5">
                          <div className="flex items-center gap-3">
                            <img src={piece?.img} alt="" className="h-12 w-12 rounded-lg object-cover" />
                            <p className="font-display text-lg font-bold text-indigo">{pieceLabel(id)} <span className="font-sans text-sm font-medium text-ink-muted">× {form.quantities[id]}</span></p>
                          </div>
                          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
                            <div className="flex-1">
                              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-deep">Où&nbsp;?</p>
                              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={`Emplacements — ${pieceLabel(id)}`}>
                                {emplacementsPour(id).map((e) => {
                                  const on = !!m[e]
                                  return (
                                    <button key={e} type="button" onClick={() => toggleEmplacement(id, e)} aria-pressed={on} title={emplAide(e)}
                                      className={`rounded-full border-2 px-3.5 py-1.5 text-sm font-medium ${on ? 'border-indigo bg-indigo text-white' : 'border-ink-line text-ink hover:border-indigo/40'}`}>
                                      {on ? '✓ ' : '+ '}{emplLabel(e)}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                            {HAUTS.includes(id) && <Schema selection={m} />}
                          </div>
                          {Object.keys(m).length > 0 && (
                            <div className="mt-5 border-t border-dashed border-gold/70 pt-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold-deep">Comment&nbsp;?</p>
                              <ul className="mt-2 space-y-3">
                                {Object.entries(m).map(([e, t]) => (
                                  <li key={e} className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                                    <span className="text-sm">
                                      <span className="font-semibold text-ink">{emplLabel(e)}</span>
                                      {emplAide(e) && <span className="block text-xs text-ink-muted">{emplAide(e)}</span>}
                                    </span>
                                    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Technique — ${pieceLabel(id)}, ${emplLabel(e)}`}>
                                      {TECHS.map((tk) => {
                                        const sel = t === tk.id
                                        return (
                                          <button key={tk.id} type="button" role="radio" aria-checked={sel} onClick={() => setTech(id, e, tk.id)}
                                            className={`inline-flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-sm font-semibold ${sel ? 'border-indigo bg-indigo text-white' : 'border-ink-line bg-white text-ink-muted hover:border-indigo/50 hover:text-indigo'}`}>
                                            <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 ${sel ? 'border-gold bg-gold' : 'border-ink-line'}`} aria-hidden="true">
                                              {sel && <span className="h-1.5 w-1.5 rounded-full bg-indigo" />}
                                            </span>
                                            {tk.label}
                                          </button>
                                        )
                                      })}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {err('marquages')}
                  <details className="mt-4 text-sm text-ink-muted">
                    <summary className="cursor-pointer font-semibold text-indigo">Quelle technique choisir&nbsp;?</summary>
                    <ul className="mt-2 space-y-1 pl-1">
                      <li><strong className="text-ink">Broderie</strong> : logo côté cœur, casquettes, prénoms. Le plus haut de gamme.</li>
                      <li><strong className="text-ink">Flocage</strong> : textes, noms et numéros d’une seule couleur.</li>
                      <li><strong className="text-ink">DTF</strong> : visuels en couleurs et grands formats au dos.</li>
                    </ul>
                  </details>
                </fieldset>

                <fieldset>
                  <legend className="font-display text-xl font-bold text-indigo">Votre logo <span className="font-sans text-sm font-normal text-ink-muted">(facultatif)</span></legend>
                  <p className="mt-1 text-sm text-ink-muted">Joint maintenant, il nous permet de vous envoyer une maquette avec le devis. PNG, JPG, PDF, AI ou SVG.</p>
                  <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gold/70 bg-paper px-6 py-8 text-center hover:bg-gold-soft/40">
                    <input type="file" accept="image/*,.pdf,.ai,.eps,.svg" className="sr-only" onChange={(e) => set('logo', e.target.files?.[0] || null)} />
                    {form.logo ? (
                      <>
                        {logoPreview && <img src={logoPreview} alt="Aperçu du logo" className="h-20 w-auto object-contain" />}
                        <span className="font-semibold text-indigo">{form.logo.name}</span>
                        <span className="text-xs text-ink-muted">Cliquer pour remplacer</span>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold text-indigo">Choisir un fichier</span>
                        <span className="text-xs text-ink-muted">ou l’envoyer plus tard par e-mail</span>
                      </>
                    )}
                  </label>
                </fieldset>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <fieldset>
                  <legend className="font-display text-xl font-bold text-indigo">Répartition des tailles</legend>
                  <p className="mt-1 text-sm text-ink-muted">Indiquez combien de pièces par taille. Pas encore décidé&nbsp;? Laissez à zéro, nous la demanderons avant la production.</p>
                  <div className="mt-5 space-y-4">
                    {form.produits.map((id) => {
                      const tailles = taillesPour(id)
                      const qte = parseInt(form.quantities[id], 10) || 0
                      const somme = sommeTailles(id)
                      return (
                        <div key={id} className="rounded-xl border border-ink-line p-4">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <p className="font-display text-lg font-bold text-indigo">{pieceLabel(id)}</p>
                            {tailles ? (
                              <p className={`text-sm font-semibold tabular-nums ${somme === 0 ? 'text-ink-muted' : somme === qte ? 'text-[#067647]' : 'text-[#B42318]'}`}>
                                {somme === 0 ? `À préciser plus tard · ${qte} pièces` : `${somme} / ${qte} réparties`}
                              </p>
                            ) : <p className="text-sm text-ink-muted">Taille unique · {qte} pièces</p>}
                          </div>
                          {tailles && (
                            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
                              {tailles.map((t) => (
                                <label key={t} className="text-center">
                                  <span className="mb-1 block text-xs font-semibold text-ink-muted">{t}</span>
                                  <input type="number" min="0" inputMode="numeric" placeholder="0" aria-label={`${pieceLabel(id)}, taille ${t}`}
                                    className="field px-1 py-2 text-center tabular-nums" value={form.tailles[id]?.[t] ?? ''} onChange={(e) => setTaille(id, t, e.target.value)} />
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {err('tailles')}
                </fieldset>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="secteur" className="label">Secteur d’activité</label>
                    <select id="secteur" className="field" value={form.secteur} onChange={(e) => set('secteur', e.target.value)}>
                      <option value="">Choisir…</option>
                      {SECTEURS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    {err('secteur')}
                  </div>
                  <div>
                    <label htmlFor="delai" className="label">Pour quand&nbsp;?</label>
                    <select id="delai" className="field" value={form.delai} onChange={(e) => set('delai', e.target.value)}>
                      <option value="">Choisir…</option>
                      {DELAIS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                    <p className="mt-1 text-xs text-ink-muted">{DELAI_MINIMUM}</p>
                  </div>
                </div>
                <div>
                  <label htmlFor="description" className="label">Précisions</label>
                  <textarea id="description" rows={5} className="field" placeholder="Couleur des pièces, coupe homme ou femme, texte à ajouter, liste des prénoms, date impérative…" value={form.description} onChange={(e) => set('description', e.target.value)} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-display text-xl font-bold text-indigo">Vos coordonnées</h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  {[
                    ['prenom', 'Prénom', 'given-name'],
                    ['nom', 'Nom', 'family-name'],
                    ['entreprise', 'Entreprise ou structure', 'organization'],
                    ['siret', 'SIRET (facultatif)', 'off'],
                    ['email', 'E-mail professionnel', 'email'],
                    ['telephone', 'Téléphone', 'tel'],
                  ].map(([k, l, ac]) => (
                    <div key={k}>
                      <label htmlFor={k} className="label">{l}</label>
                      <input id={k} className="field" autoComplete={ac} type={k === 'email' ? 'email' : k === 'telephone' ? 'tel' : 'text'}
                        value={form[k]} onChange={(e) => set(k, e.target.value)} />
                      {err(k)}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-ink-muted">Vos informations servent uniquement à établir votre devis et à vous recontacter.</p>
                {sendError && (
                  <p className="rounded-lg bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]" role="alert">
                    L’envoi n’a pas abouti. Réessayez, ou envoyez-nous votre demande par e-mail en un clic : elle est déjà rédigée.
                    {mailto && <a href={mailto} className="btn-primary mt-3 flex w-full sm:w-auto">Envoyer ma demande par e-mail</a>}
                    <span className="mt-2 block">Ou appelez-nous au <a className="underline" href={CONTACT.telHref}>{CONTACT.tel}</a>.</span>
                  </p>
                )}
              </div>
            )}

            <div className="mt-10 flex items-center justify-between gap-4 border-t border-ink-line pt-6">
              {step > 0 ? <button type="button" onClick={back} className="font-semibold text-ink-muted hover:text-indigo">Retour</button> : <span />}
              <button type="submit" className="btn-primary" disabled={sending}>
                {sending ? sendMsg || 'Envoi…' : step < 3 ? <>Continuer <Arrow /></> : 'Envoyer ma demande'}
              </button>
            </div>
          </form>

          {/* Récapitulatif */}
          <aside className="h-fit rounded-2xl bg-indigo p-6 text-white lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">Votre demande</p>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-indigo-soft">Pièces</dt>
                <dd className="mt-1 font-medium">
                  {form.produits.length ? form.produits.map((id) => (
                    <span key={id} className="flex justify-between gap-3"><span>{PIECES.find((p) => p.id === id)?.label}</span><span className={`tabular-nums ${(parseInt(form.quantities[id], 10) || 0) < MINIMUM_PIECES ? 'text-gold' : ''}`}>{form.quantities[id] || '—'}{(parseInt(form.quantities[id], 10) || 0) < MINIMUM_PIECES && <span className="ml-1 text-xs font-normal">(min. {MINIMUM_PIECES})</span>}</span></span>
                  )) : '—'}
                </dd>
              </div>
              <div className="flex justify-between border-t border-dashed border-gold/50 pt-3">
                <dt className="text-indigo-soft">Total</dt>
                <dd className="font-display text-lg font-bold">{total} pièce{total > 1 ? 's' : ''}</dd>
              </div>
              {Object.values(form.marquages).some((m) => Object.keys(m).length) && (
                <div>
                  <dt className="text-indigo-soft">Marquage</dt>
                  <dd className="mt-1 space-y-1.5 font-medium">
                    {form.produits.filter((id) => Object.keys(form.marquages[id] || {}).length).map((id) => (
                      <p key={id}><span className="text-gold">{pieceLabel(id)}</span> — {Object.entries(form.marquages[id]).map(([e, t]) => `${emplLabel(e)} (${techTexte(t)})`).join(', ')}</p>
                    ))}
                  </dd>
                </div>
              )}
              {packIntact && (
                <div className="rounded-lg bg-white/10 p-3">
                  <dt className="text-indigo-soft">Prix indicatif, pack {pack.nom}</dt>
                  <dd className="mt-1 font-display text-lg font-bold">
                    {euro((pack.paliers.filter(([q]) => qtePack >= q).pop() || pack.paliers[0])[1])} HT / {pack.unite || 'pièce'}
                  </dd>
                </div>
              )}
            </dl>
            <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-relaxed text-indigo-soft">
              Devis détaillé et maquette envoyés par e-mail. Aucun engagement avant votre validation.
            </p>
          </aside>
        </div>
      </div>
    </section>
  )
}
