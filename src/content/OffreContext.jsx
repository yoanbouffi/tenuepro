import { createContext, useContext, useEffect, useState } from 'react'
import { DEFAULT_OFFRE } from '../data/offre'
import { supabase } from '../lib/supabase'

const OffreContext = createContext(DEFAULT_OFFRE)

/** Fusionne le contenu enregistré avec les valeurs par défaut (champ par champ). */
export function mergeOffre(remote) {
  if (!remote || typeof remote !== 'object') return DEFAULT_OFFRE
  return {
    ...DEFAULT_OFFRE,
    ...remote,
    CONTACT: { ...DEFAULT_OFFRE.CONTACT, ...(remote.CONTACT || {}) },
  }
}

export async function fetchOffre() {
  const { data, error } = await supabase.from('site_content').select('data').eq('key', 'offre').maybeSingle()
  if (error) throw error
  return data?.data || null
}

/**
 * `initial` : contenu figé au moment de la génération du site (pré-rendu),
 * puis remplacé par la dernière version enregistrée dès le chargement.
 */
export function OffreProvider({ initial, children }) {
  const [offre, setOffre] = useState(() => mergeOffre(initial))
  useEffect(() => {
    let alive = true
    fetchOffre().then((d) => { if (alive && d) setOffre(mergeOffre(d)) }).catch(() => {})
    const onSaved = (e) => setOffre(mergeOffre(e.detail))
    window.addEventListener('offre:saved', onSaved)
    return () => { alive = false; window.removeEventListener('offre:saved', onSaved) }
  }, [])
  const visible = {
    ...offre,
    PACKS: offre.PACKS.filter((p) => !p.masque).map((p) => ({
      ...p,
      paliers: offre.PALIERS.map((q, i) => [q, Number(p.prix?.[i])]).filter(([, v]) => v > 0),
    })),
    METIERS: offre.METIERS.filter((m) => !m.masque),
  }
  return <OffreContext.Provider value={visible}>{children}</OffreContext.Provider>
}

export const useOffre = () => useContext(OffreContext)
