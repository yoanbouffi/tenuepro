import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

// ─── Constantes ────────────────────────────────────────────────────────────────

const ORDER_STATUS_OPTIONS = [
  { value: 'demande_recue',           label: 'Demande reçue' },
  { value: 'devis_envoye',            label: 'Devis envoyé' },
  { value: 'en_attente_validation',   label: 'En attente de validation' },
  { value: 'validé',                  label: 'Devis validé' },
  { value: 'production',              label: 'En production' },
  { value: 'expédié',                 label: 'Expédié' },
  { value: 'livré',                   label: 'Livré' },
  { value: 'cancelled',               label: 'Annulée' },
]

const ORDER_STATUS_COLORS = {
  demande_recue:         'bg-gray-100 text-gray-700',
  devis_envoye:          'bg-blue-100 text-blue-700',
  en_attente_validation: 'bg-yellow-100 text-yellow-700',
  validé:                'bg-indigo-100 text-indigo-700',
  production:            'bg-purple-100 text-purple-700',
  expédié:               'bg-teal-100 text-teal-700',
  livré:                 'bg-green-100 text-green-700',
  cancelled:             'bg-red-100 text-red-700',
}

const QR_STATUS_COLORS = {
  new:        'bg-gray-100 text-gray-600',
  processing: 'bg-blue-100 text-blue-700',
  quoted:     'bg-green-100 text-green-700',
  closed:     'bg-red-100 text-red-700',
}
const QR_STATUS_LABELS = {
  new:        'Reçue',
  processing: 'En cours',
  quoted:     'Devis envoyé',
  closed:     'Clôturée',
}

const QUOTE_STATUS_COLORS = {
  draft:    'bg-gray-100 text-gray-600',
  sent:     'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  expired:  'bg-orange-100 text-orange-700',
}
const QUOTE_STATUS_LABELS = {
  draft:    'Brouillon',
  sent:     'Envoyé',
  accepted: 'Accepté',
  rejected: 'Refusé',
  expired:  'Expiré',
}

const INVOICE_STATUS_COLORS = {
  unpaid:   'bg-gray-100 text-gray-600',
  paid:    'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-orange-100 text-orange-700',
}
const INVOICE_STATUS_LABELS = {
  unpaid:   'Non payée',
  paid:    'Payée',
  overdue: 'En retard',
  cancelled: 'Annulée',
}

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const N8N_STATUS_WEBHOOK = 'https://n8n.srv1087606.hstgr.cloud/webhook/tenuepro-statut-change'
const N8N_DEVIS_WEBHOOK  = 'https://n8n.srv1087606.hstgr.cloud/webhook/tenuepro-generer-devis'
const N8N_PDF_FACTURE_WEBHOOK = 'https://n8n.srv1087606.hstgr.cloud/webhook/tenuepro-generer-pdf-facture'

const VALIDITY_DAYS = 180

// ─── Composant principal ───────────────────────────────────────────────────────

export default function Admin() {
  const { user, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(null)
  const [activeTab, setActiveTab] = useState('demandes')

  // ── Données ────────────────────────────────────────────────────────────────
  const [requests,  setRequests]  = useState([])
  const [quotes,    setQuotes]    = useState([])
  const [orders,    setOrders]    = useState([])
  const [invoices,  setInvoices]  = useState([])
  const [stats,     setStats]     = useState({ demandes: 0, devis: 0, commandes: 0, ca: 0 })
  const [dataLoading, setDataLoading] = useState(true)

  // ── Filtres demandes ────────────────────────────────────────────────────────
  const [searchQ,     setSearchQ]     = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // ── Filtres commandes ───────────────────────────────────────────────────────
  const [orderFilter, setOrderFilter] = useState('all')

  // ── Modal commande ──────────────────────────────────────────────────────────
  const [selectedOrder,  setSelectedOrder]  = useState(null)
  const [modalNewStatus, setModalNewStatus] = useState('')
  const [modalNote,      setModalNote]      = useState('')
  const [modalLoading,   setModalLoading]   = useState(false)
  const [modalSuccess,   setModalSuccess]   = useState('')
  const [modalError,     setModalError]     = useState('')

  // ── Modal nouvelle facture ──────────────────────────────────────────────────
  const [showInvModal,  setShowInvModal]  = useState(false)
  const [invOrderId,    setInvOrderId]    = useState('')
  const [invTotalHT,    setInvTotalHT]    = useState('')
  const [invLoading,    setInvLoading]    = useState(false)
  const [invError,      setInvError]      = useState('')

  // ─── Vérification admin ──────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return
    if (!user) { setIsAdmin(false); return }
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setIsAdmin(data?.role === 'admin'))
  }, [user, authLoading])

  // ─── Chargement des données ──────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setDataLoading(true)

    const [rReq, rQuotes, rOrders, rInvoices] = await Promise.all([
      supabase
        .from('quote_requests')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('quotes')
        .select('*, quote_requests(contact_name, company_name, contact_email)')
        .order('created_at', { ascending: false }),
      supabase
        .from('orders')
        .select('*, profiles(email, first_name, last_name)')
        .order('created_at', { ascending: false }),
      supabase
        .from('invoices')
        .select('*, orders(order_number, profiles(email, first_name, last_name))')
        .order('created_at', { ascending: false }),
    ])

    const reqData      = rReq.data      ?? []
    const quotesData   = rQuotes.data   ?? []
    const ordersData   = rOrders.data   ?? []
    const invoicesData = rInvoices.data ?? []

    // Auto-expirer les devis > 180 jours
    const cutoff = new Date(Date.now() - VALIDITY_DAYS * 24 * 60 * 60 * 1000).toISOString()
    const toExpire = quotesData.filter(
      q => !['expired', 'accepted', 'rejected'].includes(q.status) && q.created_at < cutoff
    )
    if (toExpire.length > 0) {
      await supabase
        .from('quotes')
        .update({ status: 'expired' })
        .in('id', toExpire.map(q => q.id))
      toExpire.forEach(q => { q.status = 'expired' })
    }

    // Calcul du CA du mois (commandes livrées ce mois)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const caMonth = ordersData
      .filter(o => o.status === 'livré' && o.created_at >= startOfMonth)
      .reduce((sum, o) => sum + Number(o.total_ttc || 0), 0)

    const demandesMois = reqData.filter(r => r.created_at >= startOfMonth).length

    setRequests(reqData)
    setQuotes(quotesData)
    setOrders(ordersData)
    setInvoices(invoicesData)
    setStats({
      demandes:  demandesMois,
      devis:     quotesData.filter(q => ['draft', 'sent'].includes(q.status)).length,
      commandes: ordersData.filter(o => !['livré', 'cancelled'].includes(o.status)).length,
      ca:        caMonth,
    })
    setDataLoading(false)
  }, [])

  useEffect(() => {
    if (isAdmin) loadData()
  }, [isAdmin, loadData])

  // ─── Actions demandes ────────────────────────────────────────────────────────
  const handleQRStatusChange = async (reqId, newStatus) => {
    await supabase
      .from('quote_requests')
      .update({ status: newStatus })
      .eq('id', reqId)
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: newStatus } : r))
    // Notification n8n (non bloquant)
    fetch(N8N_STATUS_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quote_request_id: reqId, new_status: newStatus }),
    }).catch(() => {})
  }

  const handleGenererDevis = async (reqId) => {
    try {
      await fetch(N8N_DEVIS_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote_request_id: reqId }),
      })
      alert('Demande de génération envoyée à n8n (WF2).')
    } catch {
      alert('Erreur lors de l\'appel n8n.')
    }
  }

  // ─── Actions devis ───────────────────────────────────────────────────────────
  const handleQuoteStatus = async (quoteId, newStatus) => {
    const { error } = await supabase
      .from('quotes')
      .update({ status: newStatus })
      .eq('id', quoteId)
    if (!error) {
      setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: newStatus } : q))
    }
  }

  const handlePasserEnProduction = async (quote) => {
    if (!window.confirm(`Passer le devis ${quote.quote_number} en production ? Cela créera une commande.`)) return
    // Créer la commande dans Supabase
    const orderNum = 'CMD-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000)
    const { error } = await supabase.from('orders').insert({
      order_number: orderNum,
      quote_id:     quote.id,
      status:       'validé',
      total_ttc:    quote.total_ttc,
      total_ht:     quote.total_ht,
    })
    if (!error) {
      await handleQuoteStatus(quote.id, 'accepted')
      alert(`Commande ${orderNum} créée.`)
      loadData()
    } else {
      alert('Erreur lors de la création de la commande.')
    }
  }

  const exportQuotesCSV = () => {
    const rows = [
      ['N° Devis', 'Client', 'Société', 'Total HT', 'Total TTC', 'Statut', 'Date', 'Validité'],
      ...quotes.map(q => [
        q.quote_number,
        q.quote_requests?.contact_name ?? '',
        q.quote_requests?.company_name ?? '',
        q.total_ht,
        q.total_ttc,
        QUOTE_STATUS_LABELS[q.status] ?? q.status,
        fmt(q.created_at),
        isExpired(q.created_at) ? 'Expiré' : `${daysLeft(q.created_at)}j restants`,
      ])
    ]
    const csv = rows.map(r => r.join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'devis-tenuepro.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  // ─── Actions commandes ───────────────────────────────────────────────────────
  const openOrderModal = (order) => {
    setSelectedOrder(order)
    setModalNewStatus(order.status)
    setModalNote('')
    setModalSuccess('')
    setModalError('')
  }

  const handleOrderStatusUpdate = async () => {
    if (!modalNewStatus || !selectedOrder) return
    setModalLoading(true)
    setModalSuccess('')
    setModalError('')
    try {
      const { error: patchErr } = await supabase
        .from('orders')
        .update({ status: modalNewStatus })
        .eq('id', selectedOrder.id)
      if (patchErr) throw patchErr

      await supabase.from('order_status_history').insert({
        order_id:   selectedOrder.id,
        status:     modalNewStatus,
        note:       modalNote || null,
        created_by: user.id,
      })

      const clientEmail = selectedOrder.profiles?.email ?? ''
      const clientName  = [selectedOrder.profiles?.first_name, selectedOrder.profiles?.last_name]
        .filter(Boolean).join(' ') || clientEmail

      await fetch(N8N_STATUS_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id:     selectedOrder.id,
          order_number: selectedOrder.order_number,
          new_status:   modalNewStatus,
          client_email: clientEmail,
          client_name:  clientName,
          note:         modalNote || '',
        }),
      }).catch(() => {})

      setModalSuccess('Statut mis à jour.')
      setOrders(prev => prev.map(o =>
        o.id === selectedOrder.id ? { ...o, status: modalNewStatus } : o
      ))
      setSelectedOrder(prev => ({ ...prev, status: modalNewStatus }))
    } catch {
      setModalError('Erreur lors de la mise à jour.')
    }
    setModalLoading(false)
  }

  // ─── Actions factures ────────────────────────────────────────────────────────
  const handleCreateInvoice = async () => {
  if (!invOrderId || !invTotalHT) { setInvError('Remplissez tous les champs.'); return }
  setInvLoading(true)
  setInvError('')
  const invNum = 'FAC-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000)
  const totalHT  = parseFloat(invTotalHT)
  const totalTTC = +(totalHT * 1.085).toFixed(2) // TVA 8.5% DOM
  
  const { data: newInvoice, error } = await supabase.from('invoices').insert({
    invoice_number: invNum,
    order_id:       invOrderId,
    status:         'unpaid',
    total_ht:       totalHT,
    total_ttc:      totalTTC,
  }).select()
  
  if (error) {
    setInvError('Erreur : ' + error.message)
    setInvLoading(false)
    return
  }
  
  // ✅ NOUVEAU : Déclencher le workflow n8n de génération PDF
  try {
    await fetch(N8N_PDF_FACTURE_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoice_id: newInvoice[0].id }),
    })
    console.log('✅ Workflow PDF facture déclenché pour:', invNum)
  } catch (err) {
    console.error('⚠️ Erreur déclenchement PDF:', err)
    // Pas de blocage si le PDF échoue, la facture est créée
  }
  
  setShowInvModal(false)
  setInvOrderId('')
  setInvTotalHT('')
  loadData()
  setInvLoading(false)
}

  // ─── Helpers validité devis ──────────────────────────────────────────────────
  const isExpired = (createdAt) =>
    new Date(createdAt) < new Date(Date.now() - VALIDITY_DAYS * 24 * 60 * 60 * 1000)

  const daysLeft = (createdAt) => {
    const expiry = new Date(new Date(createdAt).getTime() + VALIDITY_DAYS * 24 * 60 * 60 * 1000)
    return Math.max(0, Math.ceil((expiry - Date.now()) / (1000 * 60 * 60 * 24)))
  }

  // ─── Filtres demandes ────────────────────────────────────────────────────────
  const filteredRequests = requests.filter(r => {
    const matchStatus = filterStatus === 'all' || r.status === filterStatus
    const q = searchQ.toLowerCase()
    const matchSearch = !q || [r.contact_name, r.company_name, r.contact_email, r.contact_phone]
      .some(v => (v ?? '').toLowerCase().includes(q))
    return matchStatus && matchSearch
  })

  // ─── Filtres commandes ───────────────────────────────────────────────────────
  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'en_cours') return !['livree', 'annulee'].includes(o.status)
    if (orderFilter === 'livrees')  return o.status === 'livree'
    if (orderFilter === 'annulees') return o.status === 'annulee'
    return true
  })

  // ─── Rendu : états de garde ──────────────────────────────────────────────────
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

  // ─── Rendu principal ─────────────────────────────────────────────────────────
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

        {/* ── Stats ──────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Demandes ce mois',   value: stats.demandes,                           color: 'text-blue-600',    bg: 'bg-blue-50' },
            { label: 'Devis en cours',      value: stats.devis,                              color: 'text-indigo-600',  bg: 'bg-indigo-50' },
            { label: 'Commandes actives',   value: stats.commandes,                          color: 'text-[#7C3AED]',  bg: 'bg-purple-50' },
            { label: 'CA du mois (TTC)',    value: stats.ca.toFixed(2) + ' €',              color: 'text-green-600',   bg: 'bg-green-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl border border-gray-100 p-5 text-center`}>
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {[
            { key: 'demandes',  label: 'Demandes',  count: requests.filter(r => r.status === 'new').length },
            { key: 'devis',     label: 'Devis',     count: quotes.filter(q => q.status === 'sent').length },
            { key: 'commandes', label: 'Commandes', count: stats.commandes },
            { key: 'factures',  label: 'Factures',  count: invoices.filter(i => i.status === 'sent').length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === tab.key ? 'bg-[#7C3AED] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB : DEMANDES
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'demandes' && (
          <section>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {/* Recherche */}
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Rechercher client, société, email…"
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED]"
                />
              </div>
              {/* Filtre statut */}
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
              >
                <option value="all">Tous les statuts</option>
                {Object.entries(QR_STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            {dataLoading ? (
              <LoadingBlock />
            ) : filteredRequests.length === 0 ? (
              <EmptyBlock text="Aucune demande correspondante." />
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="th">Date</th>
                      <th className="th">Client</th>
                      <th className="th">Société</th>
                      <th className="th">Produits</th>
                      <th className="th">Quantité</th>
                      <th className="th">Statut</th>
                      <th className="th">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredRequests.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="td text-gray-500">{fmt(r.created_at)}</td>
                        <td className="td">
                          <p className="font-medium text-gray-900">{r.contact_name}</p>
                          <p className="text-xs text-gray-400">{r.contact_email}</p>
                        </td>
                        <td className="td text-gray-600">{r.company_name ?? '—'}</td>
                        <td className="td text-gray-600 max-w-xs">
                          <span className="truncate block">
                            {Array.isArray(r.products) ? r.products.join(', ') : (r.products ?? '—')}
                          </span>
                        </td>
                        <td className="td text-gray-600">{r.quantity ?? '—'}</td>
                        <td className="td">
                          <select
                            value={r.status ?? 'new'}
                            onChange={e => handleQRStatusChange(r.id, e.target.value)}
                            className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer focus:ring-2 focus:ring-[#7C3AED]/40 ${QR_STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-600'}`}
                          >
                            {Object.entries(QR_STATUS_LABELS).map(([v, l]) => (
                              <option key={v} value={v}>{l}</option>
                            ))}
                          </select>
                        </td>
                        <td className="td text-right">
                          <button
                            onClick={() => handleGenererDevis(r.id)}
                            className="text-xs text-[#7C3AED] font-semibold hover:underline whitespace-nowrap"
                          >
                            Générer devis
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB : DEVIS
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'devis' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Devis ({quotes.length})</h2>
              <button
                onClick={exportQuotesCSV}
                className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exporter CSV
              </button>
            </div>

            {dataLoading ? (
              <LoadingBlock />
            ) : quotes.length === 0 ? (
              <EmptyBlock text="Aucun devis." />
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="th">N° Devis</th>
                      <th className="th">Client</th>
                      <th className="th">Total TTC</th>
                      <th className="th">Statut</th>
                      <th className="th">Validité</th>
                      <th className="th">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {quotes.map(q => {
                      const expired = isExpired(q.created_at)
                      const days    = daysLeft(q.created_at)
                      return (
                        <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                          <td className="td font-mono font-semibold text-gray-900 text-xs">{q.quote_number ?? '—'}</td>
                          <td className="td">
                            <p className="font-medium text-gray-900">{q.quote_requests?.contact_name ?? '—'}</p>
                            <p className="text-xs text-gray-400">{q.quote_requests?.company_name ?? ''}</p>
                          </td>
                          <td className="td font-semibold text-gray-900">{Number(q.total_ttc ?? 0).toFixed(2)} €</td>
                          <td className="td">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${QUOTE_STATUS_COLORS[q.status] ?? 'bg-gray-100 text-gray-600'}`}>
                              {QUOTE_STATUS_LABELS[q.status] ?? q.status}
                            </span>
                          </td>
                          <td className="td">
                            {['accepted', 'rejected', 'expired'].includes(q.status) ? (
                              <span className="text-xs text-gray-400">—</span>
                            ) : expired ? (
                              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Expiré</span>
                            ) : (
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${days <= 30 ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50'}`}>
                                {days}j restants
                              </span>
                            )}
                          </td>
                          <td className="td">
                            <div className="flex items-center gap-2 justify-end">
                              {q.status === 'draft' && (
                                <button
                                  onClick={() => handleQuoteStatus(q.id, 'sent')}
                                  className="text-xs text-blue-600 font-semibold hover:underline whitespace-nowrap"
                                >
                                  Marquer envoyé
                                </button>
                              )}
                              {q.status === 'sent' && (
                                <button
                                  onClick={() => handlePasserEnProduction(q)}
                                  className="text-xs text-[#7C3AED] font-semibold hover:underline whitespace-nowrap"
                                >
                                  Passer en prod
                                </button>
                              )}
                              {!['expired', 'rejected'].includes(q.status) && (
                                <button
                                  onClick={() => handleQuoteStatus(q.id, 'rejected')}
                                  className="text-xs text-red-500 hover:underline"
                                >
                                  Refuser
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB : COMMANDES
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'commandes' && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-base font-bold text-gray-900">Commandes ({orders.length})</h2>
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'all',      label: 'Toutes' },
                  { key: 'en_cours', label: 'En cours' },
                  { key: 'livrees',  label: 'Livrées' },
                  { key: 'annulees', label: 'Annulées' },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setOrderFilter(f.key)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      orderFilter === f.key
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
              <LoadingBlock />
            ) : filteredOrders.length === 0 ? (
              <EmptyBlock text="Aucune commande dans cette catégorie." />
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="th">N° Commande</th>
                      <th className="th">Client</th>
                      <th className="th">Date</th>
                      <th className="th">Total TTC</th>
                      <th className="th">Statut</th>
                      <th className="th" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredOrders.map(order => {
                      const statusOpt = ORDER_STATUS_OPTIONS.find(s => s.value === order.status)
                      const colorCls  = ORDER_STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'
                      const clientName = [order.profiles?.first_name, order.profiles?.last_name]
                        .filter(Boolean).join(' ') || order.profiles?.email || '—'
                      return (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="td font-mono font-semibold text-gray-900 text-xs">{order.order_number}</td>
                          <td className="td">
                            <p className="font-medium text-gray-900">{clientName}</p>
                            <p className="text-xs text-gray-400">{order.profiles?.email ?? ''}</p>
                          </td>
                          <td className="td text-gray-500">{fmt(order.created_at)}</td>
                          <td className="td font-semibold text-gray-900">{Number(order.total_ttc ?? 0).toFixed(2)} €</td>
                          <td className="td">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${colorCls}`}>
                              {statusOpt?.label ?? order.status}
                            </span>
                          </td>
                          <td className="td text-right">
                            <button
                              onClick={() => openOrderModal(order)}
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
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB : FACTURES
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'factures' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Factures ({invoices.length})</h2>
              <button
                onClick={() => { setShowInvModal(true); setInvError('') }}
                className="flex items-center gap-1.5 bg-[#7C3AED] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#6D28D9] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Nouvelle facture
              </button>
            </div>

            {dataLoading ? (
              <LoadingBlock />
            ) : invoices.length === 0 ? (
              <EmptyBlock text="Aucune facture." />
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="th">N° Facture</th>
                      <th className="th">Commande</th>
                      <th className="th">Client</th>
                      <th className="th">Total HT</th>
                      <th className="th">Total TTC</th>
                      <th className="th">Statut</th>
                      <th className="th">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {invoices.map(inv => {
                      const clientName = [inv.orders?.profiles?.first_name, inv.orders?.profiles?.last_name]
                        .filter(Boolean).join(' ') || inv.orders?.profiles?.email || '—'
                      return (
                        <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                          <td className="td font-mono font-semibold text-gray-900 text-xs">{inv.invoice_number}</td>
                          <td className="td text-gray-600 font-mono text-xs">{inv.orders?.order_number ?? '—'}</td>
                          <td className="td text-gray-900 font-medium">{clientName}</td>
                          <td className="td text-gray-700">{Number(inv.total_ht ?? 0).toFixed(2)} €</td>
                          <td className="td font-semibold text-gray-900">{Number(inv.total_ttc ?? 0).toFixed(2)} €</td>
                          <td className="td">
                            <select
                              value={inv.status ?? 'unpaid'}
                              onChange={e => handleInvoiceStatus(inv.id, e.target.value)}
                              className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer focus:ring-2 focus:ring-[#7C3AED]/40 ${INVOICE_STATUS_COLORS[inv.status] ?? 'bg-gray-100 text-gray-600'}`}
                            >
                              {Object.entries(INVOICE_STATUS_LABELS).map(([v, l]) => (
                                <option key={v} value={v}>{l}</option>
                              ))}
                            </select>
                          </td>
                          <td className="td text-gray-500">{fmt(inv.created_at)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>

      {/* ── Modal gérer commande ─────────────────────────────────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900">{selectedOrder.order_number}</h2>
                <p className="text-xs text-gray-500">{selectedOrder.profiles?.email ?? ''}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Statut actuel</p>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${ORDER_STATUS_COLORS[selectedOrder.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {ORDER_STATUS_OPTIONS.find(s => s.value === selectedOrder.status)?.label ?? selectedOrder.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nouveau statut</label>
                <select
                  value={modalNewStatus}
                  onChange={e => setModalNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED]"
                >
                  {ORDER_STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Note (optionnelle)</label>
                <input
                  type="text"
                  value={modalNote}
                  onChange={e => setModalNote(e.target.value)}
                  placeholder="Ex : Maquette envoyée par email"
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
                onClick={handleOrderStatusUpdate}
                disabled={modalLoading || modalNewStatus === selectedOrder.status}
                className={`w-full flex items-center justify-center gap-2 bg-[#7C3AED] text-white font-semibold py-2.5 rounded-xl hover:bg-[#6D28D9] transition-colors text-sm ${
                  (modalLoading || modalNewStatus === selectedOrder.status) ? 'opacity-60 cursor-not-allowed' : ''
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

      {/* ── Modal nouvelle facture ───────────────────────────────────────────── */}
      {showInvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowInvModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Nouvelle facture</h2>
              <button onClick={() => setShowInvModal(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Commande associée</label>
                <select
                  value={invOrderId}
                  onChange={e => setInvOrderId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED]"
                >
                  <option value="">Sélectionner une commande…</option>
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.order_number} — {o.profiles?.email ?? ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Montant HT (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={invTotalHT}
                  onChange={e => setInvTotalHT(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED]"
                />
                {invTotalHT && (
                  <p className="text-xs text-gray-500 mt-1">
                    TTC (8,5% TVA DOM) : {(parseFloat(invTotalHT || 0) * 1.085).toFixed(2)} €
                  </p>
                )}
              </div>
              {invError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{invError}</div>
              )}
              <button
                onClick={handleCreateInvoice}
                disabled={invLoading}
                className={`w-full flex items-center justify-center gap-2 bg-[#7C3AED] text-white font-semibold py-2.5 rounded-xl hover:bg-[#6D28D9] transition-colors text-sm ${invLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {invLoading ? 'Création…' : 'Créer la facture'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sous-composants utilitaires ───────────────────────────────────────────────

function LoadingBlock() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
      <div className="animate-spin w-6 h-6 border-4 border-[#7C3AED] border-t-transparent rounded-full mx-auto" />
    </div>
  )
}

function EmptyBlock({ text }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-500">
      {text}
    </div>
  )
}
