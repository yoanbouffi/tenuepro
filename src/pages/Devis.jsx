import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { submitDevisForm, uploadLogoToCloudinary } from '../lib/webhook'
import { buildAllMockupUrls } from '../lib/mockups'
import { PIECES, EMPLACEMENTS, PACKS, SECTEURS, DELAIS, MINIMUM_PIECES, CONTACT, euro } from '../data/offre'
import { Arrow } from '../components/ui'

const TECHNIQUES_CHOIX = [
  { id: 'broderie', label: 'Broderie', desc: 'Logo cousu, rendu haut de gamme' },
  { id: 'flocage', label: 'Flocage', desc: 'Textes, noms, numéros, une couleur' },
  { id: 'dtf', label: 'Impression DTF', desc: 'Visuels en couleurs, grands formats' },
  { id: 'les_deux', label: 'Plusieurs techniques', desc: 'Par exemple brodé devant, imprimé au dos' },
  { id: 'ne_sait_pas', label: 'Conseillez-moi', desc: 'Nous choisissons avec vous' },
]
const TECH_FROM_PACK = { broderie: 'broderie', flocage: 'flocage', dtf: 'dtf', mix: 'les_deux' }

const STEPS = ['Pièces', 'Marquage', 'Projet', 'Coordonnées']

const initial = {
  produits: [], quantities: {}, technique: '', emplacements: [], logo: null,
  secteur: '', delai: '', tailles: '', description: '',
  prenom: '', nom: '', entreprise: '', siret: '', email: '', telephone: '',
}

export default function Devis() {
  const [params] = useSearchParams()
  const pack = PACKS.find((p) => p.id === params.get('pack')) || null
  const { user } = useAuth()

  const [form, setForm] = useState(initial)
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [sendMsg, setSendMsg] = useState('')
  const [sendError, setSendError] = useState(false)
  const [done, setDone] = useState(false)
  const topRef = useRef(null)
  const logoPreview = useMemo(() => (form.logo?.type?.startsWith('image/') ? URL.createObjectURL(form.logo) : null), [form.logo])
  useEffect(() => () => logoPreview && URL.revokeObjectURL(logoPreview), [logoPreview])

  // Pré-remplissage depuis un pack, un métier, ou le compte client
  useEffect(() => {
    setForm((f) => ({
      ...f,
      ...(pack ? {
        produits: [...pack.devis.produits],
        quantities: { ...pack.devis.quantities },
        technique: TECH_FROM_PACK[pack.devis.technique] || '',
        emplacements: [...pack.devis.emplacements],
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
      if (on) delete quantities[id]
      else quantities[id] = quantities[id] || ''
      return { ...f, produits: on ? f.produits.filter((p) => p !== id) : [...f.produits, id], quantities }
    })
    setErrors((e) => ({ ...e, produits: '' }))
  }
  const toggleEmplacement = (id) =>
    set('emplacements', form.emplacements.includes(id) ? form.emplacements.filter((x) => x !== id) : [...form.emplacements, id])

  const validate = (s) => {
    const e = {}
    if (s === 0) {
      if (!form.produits.length) e.produits = 'Choisissez au moins une pièce.'
      else if (form.produits.some((id) => !(parseInt(form.quantities[id], 10) > 0))) e.produits = 'Indiquez une quantité pour chaque pièce choisie.'
      else if (total < MINIMUM_PIECES) e.produits = `Le minimum est de ${MINIMUM_PIECES} pièces au total (actuellement ${total}).`
    }
    if (s === 1) {
      if (!form.technique) e.technique = 'Choisissez une technique, ou « Conseillez-moi ».'
      if (!form.emplacements.length) e.emplacements = 'Choisissez au moins un emplacement.'
    }
    if (s === 2) {
      if (!form.secteur) e.secteur = 'Choisissez votre secteur.'
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
        const up = await uploadLogoToCloudinary(form.logo)
        if (up) {
          logoUrl = up.url; logoPublicId = up.public_id
          mockupUrls = buildAllMockupUrls(logoPublicId, form.produits)
        }
      } catch (err) { console.error('Upload logo', err) /* non bloquant */ }
    }

    const label = (list, id) => list.find((x) => x.id === id)?.label || id
    const description = [
      pack ? `Pack : ${pack.nom}` : null,
      `Technique : ${label(TECHNIQUES_CHOIX, form.technique)}`,
      `Emplacements : ${form.emplacements.map((id) => label(EMPLACEMENTS, id)).join(', ')}`,
      form.tailles.trim() ? `Tailles : ${form.tailles.trim()}` : null,
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
      marquage: form.technique,
      emplacements: form.emplacements,
      pack: pack?.id || null,
      logo_url: logoUrl,
      logo_public_id: logoPublicId,
      mockup_urls: mockupUrls,
    })
    setSending(false); setSendMsg('')
    if (result.success) { setDone(true); window.scrollTo({ top: 0 }) }
    else setSendError(true)
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
                Pack <strong>{pack.nom}</strong> pré-rempli. Vous pouvez tout ajuster.
              </div>
            )}

            {step === 0 && (
              <fieldset>
                <legend className="font-display text-xl font-bold text-indigo">Quelles pièces, et combien ?</legend>
                <p className="mt-1 text-sm text-ink-muted">Minimum {MINIMUM_PIECES} pièces au total. Les tailles se précisent plus loin.</p>
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
                          ) : <p className="text-xs leading-snug text-ink-muted">{p.usage}</p>}
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
                  <legend className="font-display text-xl font-bold text-indigo">Quelle technique ?</legend>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {TECHNIQUES_CHOIX.map((t) => (
                      <label key={t.id} className={`flex cursor-pointer gap-3 rounded-xl border-2 p-4 transition-colors ${form.technique === t.id ? 'border-indigo bg-indigo-mist' : 'border-ink-line hover:border-indigo/40'}`}>
                        <input type="radio" name="technique" value={t.id} checked={form.technique === t.id} onChange={() => set('technique', t.id)} className="mt-1 accent-[#241675]" />
                        <span><span className="block font-semibold text-ink">{t.label}</span><span className="text-sm text-ink-muted">{t.desc}</span></span>
                      </label>
                    ))}
                  </div>
                  {err('technique')}
                </fieldset>

                <fieldset>
                  <legend className="font-display text-xl font-bold text-indigo">Où placer le marquage ?</legend>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {EMPLACEMENTS.map((e) => {
                      const on = form.emplacements.includes(e.id)
                      return (
                        <button key={e.id} type="button" onClick={() => toggleEmplacement(e.id)} aria-pressed={on}
                          className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors ${on ? 'border-indigo bg-indigo text-white' : 'border-ink-line text-ink hover:border-indigo/40'}`}>
                          {e.label}
                        </button>
                      )
                    })}
                  </div>
                  {err('emplacements')}
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
              <div className="space-y-6">
                <h2 className="font-display text-xl font-bold text-indigo">Votre projet</h2>
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
                    <label htmlFor="delai" className="label">Pour quand ?</label>
                    <select id="delai" className="field" value={form.delai} onChange={(e) => set('delai', e.target.value)}>
                      <option value="">Choisir…</option>
                      {DELAIS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="tailles" className="label">Répartition des tailles <span className="font-normal text-ink-muted">(si vous la connaissez)</span></label>
                  <input id="tailles" className="field" placeholder="Ex. 4 S, 8 M, 6 L, 2 XL" value={form.tailles} onChange={(e) => set('tailles', e.target.value)} />
                </div>
                <div>
                  <label htmlFor="description" className="label">Précisions</label>
                  <textarea id="description" rows={5} className="field" placeholder="Couleurs des pièces, texte à ajouter, prénoms, date impérative, budget…" value={form.description} onChange={(e) => set('description', e.target.value)} />
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
                    L’envoi n’a pas abouti. Réessayez, ou contactez-nous au {CONTACT.tel} ou à {CONTACT.email}.
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
                    <span key={id} className="flex justify-between gap-3"><span>{PIECES.find((p) => p.id === id)?.label}</span><span className="tabular-nums">{form.quantities[id] || '—'}</span></span>
                  )) : '—'}
                </dd>
              </div>
              <div className="flex justify-between border-t border-dashed border-gold/50 pt-3">
                <dt className="text-indigo-soft">Total</dt>
                <dd className={`font-display text-lg font-bold ${total && total < MINIMUM_PIECES ? 'text-gold' : ''}`}>{total} pièce{total > 1 ? 's' : ''}</dd>
              </div>
              {form.technique && <div><dt className="text-indigo-soft">Technique</dt><dd className="mt-1 font-medium">{TECHNIQUES_CHOIX.find((t) => t.id === form.technique)?.label}</dd></div>}
              {form.emplacements.length > 0 && <div><dt className="text-indigo-soft">Emplacements</dt><dd className="mt-1 font-medium">{form.emplacements.map((id) => EMPLACEMENTS.find((e) => e.id === id)?.label).join(', ')}</dd></div>}
              {pack && (
                <div className="rounded-lg bg-white/10 p-3">
                  <dt className="text-indigo-soft">Prix indicatif, pack {pack.nom}</dt>
                  <dd className="mt-1 font-display text-lg font-bold">
                    {euro((pack.paliers.filter(([q]) => total >= q).pop() || pack.paliers[0])[1])} HT / {pack.unite || 'pièce'}
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
