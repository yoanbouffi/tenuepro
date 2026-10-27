import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadImageToCloudinary } from '../../lib/webhook'
import { mergeOffre } from '../../content/OffreContext'
import { DEFAULT_OFFRE, PIECES, SECTEURS, emplacementsPour, EMPLACEMENTS, euro } from '../../data/offre'

// Images déjà présentes sur le site, proposées en un clic
const BIBLIOTHEQUE = [
  'atelier', 'polo', 'tshirt', 'chemise', 'veste', 'tablier', 'casquette', 'totebag', 'broderie', 'flocage', 'dtf',
  'scene-restauration', 'scene-hotellerie', 'scene-entreprise', 'scene-btp', 'scene-association', 'scene-club',
].map((n) => `/images/${n}.webp`)

const TECHS = [['', '—'], ['broderie', 'Broderie'], ['flocage', 'Flocage'], ['dtf', 'DTF'], ['conseil', 'À conseiller']]
const emplLabel = (id) => EMPLACEMENTS.find((e) => e.id === id)?.label || id
const clone = (o) => JSON.parse(JSON.stringify(o))
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'element'

function Champ({ label, children, aide }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {aide && <span className="mt-1 block text-xs text-ink-muted">{aide}</span>}
    </label>
  )
}

function ChoixImage({ value, onChange }) {
  const [ouvert, setOuvert] = useState(false)
  const [envoi, setEnvoi] = useState('')
  const upload = async (file) => {
    if (!file) return
    setEnvoi('Envoi…')
    try { onChange(await uploadImageToCloudinary(file)); setEnvoi(''); setOuvert(false) }
    catch (e) { setEnvoi(e.message) }
  }
  return (
    <div>
      <span className="label">Image</span>
      <div className="flex items-start gap-3">
        <img src={value} alt="" className="h-20 w-28 shrink-0 rounded-lg bg-indigo-mist object-cover" />
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setOuvert(!ouvert)} className="rounded-lg border border-ink-line px-3 py-1.5 text-sm font-medium hover:border-indigo">Choisir</button>
          <label className="cursor-pointer rounded-lg border border-ink-line px-3 py-1.5 text-sm font-medium hover:border-indigo">
            Importer…
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
          </label>
          {envoi && <span className="w-full text-xs text-ink-muted">{envoi}</span>}
        </div>
      </div>
      {ouvert && (
        <div className="mt-3 grid grid-cols-4 gap-2 rounded-lg bg-indigo-mist p-2 sm:grid-cols-6">
          {BIBLIOTHEQUE.map((src) => (
            <button key={src} type="button" onClick={() => { onChange(src); setOuvert(false) }}
              className={`overflow-hidden rounded-md border-2 ${value === src ? 'border-indigo' : 'border-transparent'}`}>
              <img src={src} alt="" className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Ordre({ i, n, onMove, onDup, onDel }) {
  const b = 'rounded-md border border-ink-line px-2 py-1 text-xs font-medium hover:border-indigo disabled:opacity-30'
  return (
    <div className="flex flex-wrap gap-1.5">
      <button type="button" className={b} disabled={i === 0} onClick={() => onMove(-1)} aria-label="Monter">↑</button>
      <button type="button" className={b} disabled={i === n - 1} onClick={() => onMove(1)} aria-label="Descendre">↓</button>
      {onDup && <button type="button" className={b} onClick={onDup}>Dupliquer</button>}
      <button type="button" className={`${b} text-[#B42318]`} onClick={onDel}>Supprimer</button>
    </div>
  )
}

const deplacer = (list, i, d) => { const l = [...list]; const [x] = l.splice(i, 1); l.splice(i + d, 0, x); return l }

export default function ContenuAdmin() {
  const [base, setBase] = useState(null)      // version enregistrée
  const [draft, setDraft] = useState(null)    // version en cours d'édition
  const [section, setSection] = useState('packs')
  const [ouvert, setOuvert] = useState(null)
  const [etat, setEtat] = useState({ type: '', msg: '' })
  const [saving, setSaving] = useState(false)
  const [historique, setHistorique] = useState([])
  const [tableAbsente, setTableAbsente] = useState(false)

  const charger = async () => {
    const { data, error } = await supabase.from('site_content').select('data, updated_at').eq('key', 'offre').maybeSingle()
    if (error) { setTableAbsente(true); setBase(clone(DEFAULT_OFFRE)); setDraft(clone(DEFAULT_OFFRE)); return }
    const o = clone(mergeOffre(data?.data))
    setBase(o); setDraft(clone(o))
    const h = await supabase.from('site_content_history').select('id, data, saved_at').eq('key', 'offre').order('saved_at', { ascending: false }).limit(15)
    setHistorique(h.data || [])
  }
  useEffect(() => { charger() }, [])

  const modifie = useMemo(() => base && draft && JSON.stringify(base) !== JSON.stringify(draft), [base, draft])

  if (!draft) return <p className="py-10 text-center text-ink-muted">Chargement du contenu…</p>

  const up = (fn) => setDraft((d) => { const n = clone(d); fn(n); return n })
  const setPack = (i, k, v) => up((d) => { d.PACKS[i][k] = v })
  const setMetier = (i, k, v) => up((d) => { d.METIERS[i][k] = v })

  const erreurs = () => {
    const e = []
    draft.PACKS.forEach((p, i) => {
      if (!p.nom?.trim()) e.push(`Pack n°${i + 1} : nom manquant`)
      draft.PALIERS.forEach((q, j) => { if (!(Number(p.prix?.[j]) > 0)) e.push(`Pack ${p.nom || i + 1} : prix manquant dès ${q} pièces`) })
    })
    draft.METIERS.forEach((m, i) => { if (!m.nom?.trim()) e.push(`Métier n°${i + 1} : nom manquant`) })
    if (!(draft.MINIMUM_PIECES > 0)) e.push('Minimum de pièces invalide')
    return e
  }

  const enregistrer = async () => {
    const e = erreurs()
    if (e.length) { setEtat({ type: 'erreur', msg: e.join(' · ') }); return }
    setSaving(true); setEtat({ type: '', msg: '' })
    const { error } = await supabase.from('site_content').upsert({ key: 'offre', data: draft })
    setSaving(false)
    if (error) { setEtat({ type: 'erreur', msg: `Enregistrement impossible : ${error.message}` }); return }
    window.dispatchEvent(new CustomEvent('offre:saved', { detail: draft }))
    setEtat({ type: 'ok', msg: 'Enregistré. Le site affiche déjà la nouvelle version.' })
    charger()
  }

  const nouveauPack = () => up((d) => {
    d.PACKS.push({ id: `pack-${Date.now().toString(36)}`, nom: 'Nouveau pack', pour: '', img: '/images/polo.webp', contenu: 'Polo', marquage: 'Logo brodé côté cœur', prix: d.PALIERS.map(() => ''), devis: { quantities: { polos: 20 }, marquages: { polos: { coeur: 'broderie' } } } })
    setOuvert(`p${d.PACKS.length - 1}`)
  })
  const nouveauMetier = () => up((d) => {
    d.METIERS.push({ id: `metier-${Date.now().toString(36)}`, nom: 'Nouveau métier', img: '/images/scene-entreprise.webp', label: 'Broderie · côté cœur', texte: '', pieces: ['Polos'], pack: d.PACKS[0]?.id, secteur: 'Autre' })
    setOuvert(`m${d.METIERS.length - 1}`)
  })

  const onglet = (k, l) => (
    <button key={k} type="button" onClick={() => setSection(k)}
      className={`rounded-lg px-4 py-2 text-sm font-semibold ${section === k ? 'bg-white text-indigo shadow-sm' : 'text-ink-muted hover:text-indigo'}`}>{l}</button>
  )

  return (
    <section className="mt-6 pb-28">
      {tableAbsente && (
        <div className="mb-6 rounded-xl border border-gold bg-gold-soft/60 p-4 text-sm text-ink">
          <strong>La table de contenu n’existe pas encore.</strong> Exécute le fichier <code>supabase/site-content.sql</code> dans Supabase &gt; SQL Editor, puis recharge cette page. En attendant, tu vois le contenu actuel du site.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          {onglet('packs', `Packs (${draft.PACKS.length})`)}
          {onglet('metiers', `Métiers (${draft.METIERS.length})`)}
          {onglet('general', 'Général')}
          {onglet('versions', 'Versions')}
        </div>
        <a href="/packs" target="_blank" rel="noreferrer" className="btn-link text-sm">Voir le site</a>
      </div>

      {/* ── PACKS ───────────────────────────────────────────── */}
      {section === 'packs' && (
        <div className="mt-6 space-y-3">
          {draft.PACKS.map((p, i) => {
            const id = `p${i}`, open = ouvert === id
            return (
              <article key={p.id} className={`rounded-xl border bg-white ${p.masque ? 'border-dashed border-ink-line opacity-70' : 'border-ink-line'}`}>
                <button type="button" onClick={() => setOuvert(open ? null : id)} className="flex w-full items-center gap-4 p-4 text-left">
                  <img src={p.img} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-display font-bold text-indigo">Pack {p.nom} {p.masque && <span className="ml-1 rounded bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-ink-muted">masqué</span>}</span>
                    <span className="block truncate text-sm text-ink-muted">{p.contenu} — {p.marquage}</span>
                  </span>
                  <span className="hidden text-right text-sm sm:block">
                    {draft.PALIERS.map((q, j) => <span key={q} className="block tabular-nums">dès {q} : <strong>{Number(p.prix?.[j]) > 0 ? euro(Number(p.prix[j])) : '—'}</strong></span>)}
                  </span>
                  <span className="text-ink-muted" aria-hidden="true">{open ? '−' : '+'}</span>
                </button>
                {open && (
                  <div className="space-y-5 border-t border-ink-line p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Champ label="Nom du pack"><input className="field" value={p.nom} onChange={(e) => setPack(i, 'nom', e.target.value)} /></Champ>
                      <Champ label="Pour qui"><input className="field" value={p.pour} onChange={(e) => setPack(i, 'pour', e.target.value)} /></Champ>
                      <Champ label="Pièce(s)"><input className="field" value={p.contenu} onChange={(e) => setPack(i, 'contenu', e.target.value)} /></Champ>
                      <Champ label="Marquage"><input className="field" value={p.marquage} onChange={(e) => setPack(i, 'marquage', e.target.value)} /></Champ>
                    </div>
                    <div>
                      <span className="label">Prix HT par {p.unite || 'pièce'}</span>
                      <div className="flex flex-wrap gap-3">
                        {draft.PALIERS.map((q, j) => (
                          <label key={q} className="flex items-center gap-2 text-sm">
                            dès {q} pièces
                            <input type="number" step="0.5" min="0" className="field w-28" value={p.prix?.[j] ?? ''}
                              onChange={(e) => up((d) => { d.PACKS[i].prix = d.PACKS[i].prix || []; d.PACKS[i].prix[j] = e.target.value === '' ? '' : Number(e.target.value) })} />
                            €
                          </label>
                        ))}
                        <label className="flex items-center gap-2 text-sm">
                          Unité
                          <select className="field w-36" value={p.unite || ''} onChange={(e) => setPack(i, 'unite', e.target.value || undefined)}>
                            <option value="">pièce</option><option value="la tenue">la tenue</option><option value="le lot">le lot</option>
                          </select>
                        </label>
                      </div>
                    </div>
                    <ChoixImage value={p.img} onChange={(v) => setPack(i, 'img', v)} />
                    <div>
                      <span className="label">Pré-remplissage du devis quand on clique sur « Demander ce pack »</span>
                      <div className="space-y-2 rounded-lg bg-indigo-mist p-3">
                        {PIECES.map((pc) => {
                          const qte = p.devis?.quantities?.[pc.id] || ''
                          return (
                            <div key={pc.id} className="flex flex-wrap items-center gap-2 text-sm">
                              <span className="w-32 font-medium">{pc.label}</span>
                              <input type="number" min="0" placeholder="0" className="field w-20 py-1.5" value={qte}
                                onChange={(e) => up((d) => {
                                  const dv = d.PACKS[i].devis = d.PACKS[i].devis || { quantities: {}, marquages: {} }
                                  dv.quantities = dv.quantities || {}; dv.marquages = dv.marquages || {}
                                  const v = Number(e.target.value)
                                  if (v > 0) dv.quantities[pc.id] = v
                                  else { delete dv.quantities[pc.id]; delete dv.marquages[pc.id] }
                                })} />
                              {qte > 0 && emplacementsPour(pc.id).map((em) => (
                                <label key={em} className="flex items-center gap-1 text-xs">
                                  {emplLabel(em)}
                                  <select className="rounded border border-ink-line bg-white px-1 py-1 text-xs" value={p.devis?.marquages?.[pc.id]?.[em] || ''}
                                    onChange={(e) => up((d) => {
                                      const m = d.PACKS[i].devis.marquages[pc.id] = d.PACKS[i].devis.marquages[pc.id] || {}
                                      if (e.target.value) m[em] = e.target.value; else delete m[em]
                                    })}>
                                    {TECHS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                  </select>
                                </label>
                              ))}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-ink-line pt-4">
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!p.masque} onChange={(e) => setPack(i, 'masque', e.target.checked)} /> Masquer ce pack sur le site</label>
                      <Ordre i={i} n={draft.PACKS.length}
                        onMove={(dlt) => { up((d) => { d.PACKS = deplacer(d.PACKS, i, dlt) }); setOuvert(`p${i + dlt}`) }}
                        onDup={() => up((d) => { const c = clone(p); c.id = `${slug(p.nom)}-${Date.now().toString(36)}`; c.nom = `${p.nom} (copie)`; d.PACKS.splice(i + 1, 0, c) })}
                        onDel={() => { if (confirm(`Supprimer le pack ${p.nom} ?`)) { up((d) => { d.PACKS.splice(i, 1) }); setOuvert(null) } }} />
                    </div>
                  </div>
                )}
              </article>
            )
          })}
          <button type="button" onClick={nouveauPack} className="btn-outline py-2 text-sm">Ajouter un pack</button>
        </div>
      )}

      {/* ── MÉTIERS ─────────────────────────────────────────── */}
      {section === 'metiers' && (
        <div className="mt-6 space-y-3">
          {draft.METIERS.map((m, i) => {
            const id = `m${i}`, open = ouvert === id
            return (
              <article key={m.id} className={`rounded-xl border bg-white ${m.masque ? 'border-dashed border-ink-line opacity-70' : 'border-ink-line'}`}>
                <button type="button" onClick={() => setOuvert(open ? null : id)} className="flex w-full items-center gap-4 p-4 text-left">
                  <img src={m.img} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-display font-bold text-indigo">{m.nom} {m.masque && <span className="ml-1 rounded bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-ink-muted">masqué</span>}</span>
                    <span className="block truncate text-sm text-ink-muted">{m.label}</span>
                  </span>
                  <span className="text-ink-muted" aria-hidden="true">{open ? '−' : '+'}</span>
                </button>
                {open && (
                  <div className="space-y-5 border-t border-ink-line p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Champ label="Métier"><input className="field" value={m.nom} onChange={(e) => setMetier(i, 'nom', e.target.value)} /></Champ>
                      <Champ label="Étiquette sur la photo" aide="Exemple : Broderie · côté cœur"><input className="field" value={m.label} onChange={(e) => setMetier(i, 'label', e.target.value)} /></Champ>
                    </div>
                    <Champ label="Texte"><textarea rows={3} className="field" value={m.texte} onChange={(e) => setMetier(i, 'texte', e.target.value)} /></Champ>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Champ label="Pièces recommandées" aide="Séparées par des virgules">
                        <input className="field" value={(m.pieces || []).join(', ')} onChange={(e) => setMetier(i, 'pieces', e.target.value.split(',').map((x) => x.trim()).filter(Boolean))} />
                      </Champ>
                      <Champ label="Pack conseillé">
                        <select className="field" value={m.pack} onChange={(e) => setMetier(i, 'pack', e.target.value)}>
                          {draft.PACKS.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
                        </select>
                      </Champ>
                      <Champ label="Secteur pré-rempli dans le devis">
                        <select className="field" value={m.secteur} onChange={(e) => setMetier(i, 'secteur', e.target.value)}>
                          {SECTEURS.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </Champ>
                    </div>
                    <ChoixImage value={m.img} onChange={(v) => setMetier(i, 'img', v)} />
                    <label className="block">
                      <span className="label">Hauteur du bandeau-titre sur la photo : {m.bande || 36} %</span>
                      <input type="range" min="20" max="70" value={m.bande || 36} onChange={(e) => setMetier(i, 'bande', Number(e.target.value))} className="w-full max-w-sm accent-[#241675]" />
                      <span className="block text-xs text-ink-muted">Le bandeau doit couvrir les visages et laisser voir le marquage.</span>
                    </label>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-ink-line pt-4">
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!m.masque} onChange={(e) => setMetier(i, 'masque', e.target.checked)} /> Masquer ce métier sur le site</label>
                      <Ordre i={i} n={draft.METIERS.length}
                        onMove={(dlt) => { up((d) => { d.METIERS = deplacer(d.METIERS, i, dlt) }); setOuvert(`m${i + dlt}`) }}
                        onDel={() => { if (confirm(`Supprimer ${m.nom} ?`)) { up((d) => { d.METIERS.splice(i, 1) }); setOuvert(null) } }} />
                    </div>
                  </div>
                )}
              </article>
            )
          })}
          <button type="button" onClick={nouveauMetier} className="btn-outline py-2 text-sm">Ajouter un métier</button>
        </div>
      )}

      {/* ── GÉNÉRAL ─────────────────────────────────────────── */}
      {section === 'general' && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-xl border border-ink-line bg-white p-5">
            <h3 className="font-display text-lg font-bold text-indigo">Quantités</h3>
            <Champ label="Minimum par type de vêtement" aide="Ex. 20 : il faut 20 t-shirts et 20 casquettes. Vérifié dans le devis.">
              <input type="number" min="1" className="field w-32" value={draft.MINIMUM_PIECES} onChange={(e) => up((d) => { d.MINIMUM_PIECES = Number(e.target.value) })} />
            </Champ>
            <div>
              <span className="label">Paliers de prix des packs</span>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {draft.PALIERS.map((q, j) => (
                  <span key={j} className="flex items-center gap-1">
                    dès <input type="number" min="1" className="field w-20 py-1.5" value={q} onChange={(e) => up((d) => { d.PALIERS[j] = Number(e.target.value) })} /> pièces
                    {draft.PALIERS.length > 1 && <button type="button" className="px-1 text-[#B42318]" aria-label="Retirer ce palier" onClick={() => up((d) => { d.PALIERS.splice(j, 1); d.PACKS.forEach((p) => p.prix?.splice(j, 1)) })}>×</button>}
                  </span>
                ))}
                <button type="button" className="rounded-md border border-ink-line px-2 py-1 text-xs" onClick={() => up((d) => { d.PALIERS.push((d.PALIERS.at(-1) || 0) * 2 || 20); d.PACKS.forEach((p) => { p.prix = p.prix || []; p.prix.push('') }) })}>+ palier</button>
              </div>
              <span className="mt-1 block text-xs text-ink-muted">Chaque pack a un prix par palier. Ajouter un palier demande de renseigner ce prix dans chaque pack.</span>
            </div>
            <Champ label="Au-delà, prix sur devis à partir de">
              <input type="number" min="1" className="field w-32" value={draft.SEUIL_DEVIS} onChange={(e) => up((d) => { d.SEUIL_DEVIS = Number(e.target.value) })} />
            </Champ>
          </div>

          <div className="space-y-4 rounded-xl border border-ink-line bg-white p-5">
            <h3 className="font-display text-lg font-bold text-indigo">Contact</h3>
            <Champ label="Téléphone">
              <input className="field" value={draft.CONTACT.tel} onChange={(e) => up((d) => {
                d.CONTACT.tel = e.target.value
                const n = e.target.value.replace(/\D/g, '')
                d.CONTACT.telHref = n.startsWith('0') ? `tel:+262${n.slice(1)}` : `tel:+${n}`
              })} />
            </Champ>
            <Champ label="E-mail"><input className="field" value={draft.CONTACT.email} onChange={(e) => up((d) => { d.CONTACT.email = e.target.value })} /></Champ>
            <Champ label="Zone d’intervention"><input className="field" value={draft.CONTACT.zone} onChange={(e) => up((d) => { d.CONTACT.zone = e.target.value })} /></Champ>
          </div>

          <div className="space-y-3 rounded-xl border border-ink-line bg-white p-5 lg:col-span-2">
            <h3 className="font-display text-lg font-bold text-indigo">Options affichées sous la grille des packs</h3>
            {draft.OPTIONS_PACKS.map((o, j) => (
              <div key={j} className="flex flex-wrap items-center gap-2">
                <input className="field flex-1" value={o.label} placeholder="Option" onChange={(e) => up((d) => { d.OPTIONS_PACKS[j].label = e.target.value })} />
                <input className="field flex-1" value={o.prix} placeholder="Prix ou condition" onChange={(e) => up((d) => { d.OPTIONS_PACKS[j].prix = e.target.value })} />
                <button type="button" className="px-2 text-[#B42318]" aria-label="Supprimer l’option" onClick={() => up((d) => { d.OPTIONS_PACKS.splice(j, 1) })}>×</button>
              </div>
            ))}
            <button type="button" className="rounded-md border border-ink-line px-3 py-1.5 text-sm" onClick={() => up((d) => { d.OPTIONS_PACKS.push({ label: '', prix: '' }) })}>+ option</button>
          </div>
        </div>
      )}

      {/* ── VERSIONS ────────────────────────────────────────── */}
      {section === 'versions' && (
        <div className="mt-6 rounded-xl border border-ink-line bg-white">
          {historique.length === 0 ? (
            <p className="p-5 text-sm text-ink-muted">Aucune version précédente pour l’instant. Chaque enregistrement garde la version d’avant ici.</p>
          ) : (
            <ul className="divide-y divide-ink-line">
              {historique.map((h) => (
                <li key={h.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                  <span>Version du <strong>{new Date(h.saved_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</strong> — {h.data?.PACKS?.length ?? 0} packs, {h.data?.METIERS?.length ?? 0} métiers</span>
                  <button type="button" className="btn-link" onClick={() => { setDraft(clone(mergeOffre(h.data))); setEtat({ type: 'info', msg: 'Version chargée. Vérifie puis clique sur Enregistrer pour la remettre en ligne.' }) }}>Charger cette version</button>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-ink-line p-4">
            <button type="button" className="text-sm text-ink-muted underline" onClick={() => { if (confirm('Revenir au contenu d’origine du site ? (il faudra ensuite enregistrer)')) setDraft(clone(DEFAULT_OFFRE)) }}>Revenir au contenu d’origine</button>
          </div>
        </div>
      )}

      {/* ── Barre d'enregistrement ──────────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <p className={`text-sm ${etat.type === 'erreur' ? 'text-[#B42318]' : etat.type === 'ok' ? 'text-[#067647]' : 'text-ink-muted'}`} role="status">
            {etat.msg || (modifie ? 'Modifications non enregistrées.' : 'Tout est enregistré.')}
          </p>
          <div className="flex gap-2">
            <button type="button" disabled={!modifie || saving} onClick={() => { setDraft(clone(base)); setEtat({ type: '', msg: '' }) }} className="rounded-lg px-4 py-2 text-sm font-semibold text-ink-muted hover:text-indigo disabled:opacity-40">Annuler</button>
            <button type="button" disabled={!modifie || saving || tableAbsente} onClick={enregistrer} className="btn-primary py-2 text-sm">{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
          </div>
        </div>
      </div>
    </section>
  )
}
