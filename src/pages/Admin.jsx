import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

// ─── Constantes ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'demande_recue',        label: 'Demande reçue' },
  { value: 'devis_envoye',         label: 'Devis envoyé' },
  { value: 'devis_valide',         label: 'Devis validé' },
  { value: 'maquette_preparation', label: 'Maquette en préparation' },
  { value: 'maquette_validee',     label: 'Maquette validée' },
  { value: 'en_production',        label: 'En production' },
  { value: 'expediee',             label: 'Expédiée / Prête' },
  { value: 'livree',               label: 'Livrée' },
  { value: 'annulee',              label: 'Annulée' },
]

const STATUS_COLORS = {
  demande_recue:        'bg-gray-100 text-gray-700',
  devis_envoye:         'bg-blue-100 text-blue-700',
  devis_valide:         'bg-indigo-100 text-indigo-700',
  maquette_preparation: 'bg-yellow-100 text-yellow-700',
  maquette_validee:     'bg-orange-100 text-orange-700',
  en_production:        'bg-purple-100 text-purple-700',
  expediee:             'bg-teal-100 text-teal-700',
  livree:               'bg-green-100 text-green-700',
  annulee:              'bg-red-100 text-red-700',
}

const QR_STATUS_COLORS = {
  new:        'bg-gray-100 text-gray-600',
  processing: 'bg-blue-100 text-blue-700',
  quoted:     'bg-green-100 text-green-700',
  closed:     'bg-red-100 text-red-700',
}
const QR_STATUS_LABELS = { new: 'Reçue', processing: 'En cours', quoted: 'Devis envoyé', closed: 'Clôturée' }

const fmt = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const N8N_STATUS_WEBHOOK = 'https://n8n.srv1087606.hstgr.cloud/webhook/tenuepro-statut-change'
const N8N_DEVIS_WEBHOOK  = 'https://n8n.srv1087606.hstgr.cloud/webhook/tenuepro-generer-devis'

// ─── Page principale ────────────────────────────────────────────────────────────

export default function Admin() {
  const { user, loading: authLoading } = useAuth()

  const [isAdmin, setIsAdmin]       = useState(null) // null = chargement
  const [orders, setOrders]         = useState([])
  const [requests, setRequests]     = useState([])
  const [stats, setStats]           = useState({ demandes: 0, devis: 0, commandes: 0 })
  const [dataLoading, setDataLoading] = useState(true)

  const [filter, setFilter]             = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [modalLoading, setModalLoading]   = useState(false)
  const [modalSuccess, setModalSuccess]   = useState('')
  const [modalError, setModalError]       = useState('')
  const [newStatus, setNewStatus]         = useState('')
  const [statusNote, setStatusNote]       = useState('')

  // Vérifier le rôle admin
  useEffect(() => {
    if (authLoading) return
    if (!user) { setIsAdmin(false); return }

    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setIsAdmin(data?.role === 'admin')
      })
  }, [user, authLoading])

  // Charger les données
  const loadData = useCallback(async () => {
    setDataLoading(true)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [rOrders, rRequests, rDevis] = await Promise.all([
      supabase
        .from('orders')
        .select('*, profiles(email, first_name, last_name)')
        .order('created_at', { ascending: false }),
      supabase
        .from('quote_requests')
        .select('*')
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: false }),
      supabase
        .from('quotes')
        .select('id')
        .in('status', ['draft', 'sent']),
    ])

    const ordersData   = rOrders.data   ?? []
    const requestsData = rRequests.data ?? []
    const devisData    = rDevis.data    ?? []

    setOrders(ordersData)
    setRequests(requestsData)
    setStats({
      demandes:   requestsData.filter(r => r.status === 'new').length,
      devis:      devisData.length,
      commandes:  ordersData.filter(o => !['livree', 'annulee'].includes(o.status)).length,
    })
    setDataLoading(false)
  }, [])

  useEffect(() => {
    if (isAdmin) loadData()
  }, [isAdmin, loadData])

  // Filtres commandes
  const filteredOrders = orders.filter(o => {
    if (filter === 'en_cours')  return !['livree', 'annulee'].includes(o.status)
    if (filter === 'livrees')   return o.status === 'livree'
    if (filter === 'annulees')  return o.status === 'annulee'
    return true
  })

  // Ouvrir modal
  const openModal = (order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setStatusNote('')
    setModalSuccess('')
    setModalError('')
  }

  // Mettre à jour le statut
  const handleStatusUpdate = async () => {
    if (!newStatus || !selectedOrder) return
    setModalLoading(true)
    setModalSuccess('')
    setModalError('')

    try {
      // 1. PATCH orders
      const { error: patchErr } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', selectedOrder.id)

      if (patchErr) throw patchErr

      // 2. INSERT order_status_history
      await supabase.from('order_status_history').insert({
        order_id:   selectedOrder.id,
        status:     newStatus,
        note:       statusNote || null,
        created_by: user.id,
      })

      // 3. Appel webhook n8n WF5
      const clientEmail = selectedOrder.profiles?.email || ''
      const clientName  = [
        selectedOrder.profiles?.first_name,
        selectedOrder.profiles?.last_name,
      ].filter(Boolean).join(' ') || clientEmail

      await fetch(N8N_STATUS_WEBHOOK, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id:     selectedOrder.id,
          order_number: selectedOrder.order_number,
          new_status:   newStatus,
          client_email: clientEmail,
          client_name:  clientName,
          note:         statusNote || '',
        }),
      }).catch(() => {}) // Non bloquant si n8n indisponible

      setModalSuccess('Statut mis à jour avec succès.')
      // Rafraîchir la liste
      setOrders(prev => prev.map(o =>
        o.id === selectedOrder.id ? { ...o, status: newStatus } : o
      ))
      setSelectedOrder(prev => ({ ...prev, status: newStatus }))
    } catch {
      setModalError('Erreur lors de la mise à jour. Réessayez.')
    }

    setModalLoading(false)
  }

  // Générer devis depuis une demande
  const handleGenererDevis = async (requestId) => {
    try {
      await fetch(N8N_DEVIS_WEBHOOK, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote_request_id: requestId }),
      })
      alert('Demande de génération envoyée à n8n (WF2).')
    } catch {
      alert('Erreur lors de l\'appel n8n.')
    }
  }

  // ─── États de rendu ──────────────────────────────────────────────────────────

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user || isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Accès refusé</h1>
          <p className="text-gray-500 text-sm">Vous n'avez pas les droits pour accéder à cette page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold bg-[#7C3AED] text-white px-2 py-0.5 rounded">ADMIN</span>
              <h1 className="text-xl font-extrabold text-gray-900">Dashboard TenuePro</h1>
            </div>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-lg px-4 py-2 hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualiser
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Résumé stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Nouvelles demandes', value: stats.demandes, color: 'text-blue-600' },
            { label: 'Devis en cours',     value: stats.devis,    color: 'text-indigo-600' },
            { label: 'Commandes actives',  value: stats.commandes, color: 'text-[#7C3AED]' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5 text-center">
              <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tableau commandes */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-base font-bold text-gray-900">Commandes</h2>
            <div className="flex gap-2">
              {[
                { key: 'all',      label: 'Toutes' },
                { key: 'en_cours', label: 'En cours' },
                { key: 'livrees',  label: 'Livrées' },
                { key: 'annulees', label: 'Annulées' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    filter === f.key
                      ? 'bg-[#7C3AED] text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-[#7C3AED]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {dataLoading ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
              <div className="animate-spin w-6 h-6 border-4 border-[#7C3AED] border-t-transparent rounded-full mx-auto" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-500">
              Aucune commande dans cette catégorie.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">N° Commande</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Client</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Total</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Statut</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map(order => {
                    const statusOpt = STATUS_OPTIONS.find(s => s.value === order.status)
                    const colorCls  = STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'
                    const clientEmail = order.profiles?.email ?? '—'
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-gray-900 text-xs">{order.order_number}</td>
                        <td className="px-4 py-3 text-gray-700">{clientEmail}</td>
                        <td className="px-4 py-3 text-gray-500">{fmt(order.created_at)}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{Number(order.total_ttc).toFixed(2)} €</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${colorCls}`}>
                            {statusOpt?.label ?? order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openModal(order)}
                            className="text-xs text-[#7C3AED] font-semibold hover:underline"
                          >
                            Gérer
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Tableau demandes de devis */}
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-4">Demandes de devis — 30 derniers jours</h2>

          {dataLoading ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
              <div className="animate-spin w-6 h-6 border-4 border-[#7C3AED] border-t-transparent rounded-full mx-auto" />
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-500">
              Aucune demande récente.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Client</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Société</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Produits</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Statut</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {requests.map(r => {
                    const colorCls = QR_STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-600'
                    const statusLabel = QR_STATUS_LABELS[r.status] ?? r.status
                    return (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-500">{fmt(r.created_at)}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">{r.contact_name}</td>
                        <td className="px-4 py-3 text-gray-600">{r.company_name ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                          {Array.isArray(r.products) ? r.products.join(', ') : r.products}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${colorCls}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleGenererDevis(r.id)}
                            className="text-xs text-[#7C3AED] font-semibold hover:underline"
                          >
                            Générer devis
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Modal gérer commande */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900">{selectedOrder.order_number}</h2>
                <p className="text-xs text-gray-500">{selectedOrder.profiles?.email}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Statut actuel</p>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[selectedOrder.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_OPTIONS.find(s => s.value === selectedOrder.status)?.label ?? selectedOrder.status}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nouveau statut
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED]"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Note (optionnelle)
                </label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Ex : Maquette envoyée par email le 10/04"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED]"
                />
              </div>

              {modalSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {modalSuccess}
                </div>
              )}
              {modalError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{modalError}</div>
              )}

              <button
                onClick={handleStatusUpdate}
                disabled={modalLoading || newStatus === selectedOrder.status}
                className={`w-full flex items-center justify-center gap-2 bg-[#7C3AED] text-white font-semibold py-2.5 rounded-xl hover:bg-[#6D28D9] transition-colors text-sm ${
                  (modalLoading || newStatus === selectedOrder.status) ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {modalLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Mise à jour…
                  </>
                ) : 'Mettre à jour le statut'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
