import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

// ─── Constantes ────────────────────────────────────────────────────────────────

// 8 étapes pipeline (pour la barre de progression)
const STATUS_STEPS = [
  { key: 'demande_recue',        label: 'Demande reçue' },
  { key: 'devis_envoye',         label: 'Devis envoyé' },
  { key: 'devis_valide',         label: 'Devis validé' },
  { key: 'maquette_preparation', label: 'Maquette en préparation' },
  { key: 'maquette_validee',     label: 'Maquette validée' },
  { key: 'en_production',        label: 'En production' },
  { key: 'expediee',             label: 'Expédiée / Prête' },
  { key: 'livree',               label: 'Livrée' },
]

// 4 grandes étapes visibles côté client
const TIMELINE_STEPS = [
  {
    key:   'devis_valide',
    label: 'Devis validé',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    phases: ['demande_recue', 'devis_envoye', 'devis_valide'],
  },
  {
    key:   'maquette_validee',
    label: 'Maquette',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    phases: ['maquette_preparation', 'maquette_validee'],
  },
  {
    key:   'en_production',
    label: 'Production',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    phases: ['en_production', 'expediee'],
  },
  {
    key:   'livree',
    label: 'Livraison',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    phases: ['livree'],
  },
]

const ORDER_STATUS_COLORS = {
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

const QR_STATUS = {
  new:        { label: 'Reçue',          cls: 'bg-gray-100 text-gray-600' },
  processing: { label: 'En cours',       cls: 'bg-blue-100 text-blue-700' },
  quoted:     { label: 'Devis envoyé',   cls: 'bg-green-100 text-green-700' },
  closed:     { label: 'Clôturée',       cls: 'bg-red-100 text-red-700' },
}

const QUOTE_STATUS = {
  draft:    { label: 'Brouillon',  cls: 'bg-gray-100 text-gray-600' },
  sent:     { label: 'Reçu',       cls: 'bg-blue-100 text-blue-700' },
  accepted: { label: 'Accepté',    cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Refusé',     cls: 'bg-red-100 text-red-700' },
  expired:  { label: 'Expiré',     cls: 'bg-orange-100 text-orange-700' },
}

const INVOICE_STATUS = {
  draft:   { label: 'En attente', cls: 'bg-gray-100 text-gray-600' },
  sent:    { label: 'Envoyée',    cls: 'bg-blue-100 text-blue-700' },
  paid:    { label: 'Payée',      cls: 'bg-green-100 text-green-700' },
  overdue: { label: 'En retard',  cls: 'bg-red-100 text-red-700' },
}

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

// ─── Composant principal ───────────────────────────────────────────────────────

export default function EspaceClient() {
  const { user, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()

  const [tab,          setTab]          = useState('commandes')
  const [requests,     setRequests]     = useState([])
  const [quotes,       setQuotes]       = useState([])
  const [orders,       setOrders]       = useState([])
  const [invoices,     setInvoices]     = useState([])
  const [dataLoading,  setDataLoading]  = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderHistory,  setOrderHistory]  = useState([])

  // Redirect si non connecté
  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [user, authLoading, navigate])

  // Chargement des données
  useEffect(() => {
    if (!user) return
    const load = async () => {
      setDataLoading(true)
      const [rReq, rQuotes, rOrders, rInvoices] = await Promise.all([
        // Demandes de devis
        supabase
          .from('quote_requests')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false }),

        // Devis : jointure via quote_requests pour retrouver les devis du client
        supabase
          .from('quotes')
          .select('*, quote_requests!inner(profile_id, contact_name, company_name)')
          .eq('quote_requests.profile_id', user.id)
          .order('created_at', { ascending: false }),

        // Commandes
        supabase
          .from('orders')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false }),

        // Factures via jointure orders
        supabase
          .from('invoices')
          .select('*, orders!inner(profile_id, order_number)')
          .eq('orders.profile_id', user.id)
          .order('created_at', { ascending: false }),
      ])

      setRequests(rReq.data      ?? [])
      setQuotes(rQuotes.data     ?? [])
      setOrders(rOrders.data     ?? [])
      setInvoices(rInvoices.data ?? [])
      setDataLoading(false)
    }
    load()
  }, [user])

  // Historique d'une commande
  const openOrder = async (order) => {
    setSelectedOrder(order)
    const { data } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', order.id)
      .order('created_at', { ascending: true })
    setOrderHistory(data ?? [])
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full" />
    </div>
  )

  if (!user) return null

  const tabs = [
    { key: 'commandes', label: 'Mes commandes', count: orders.length },
    { key: 'devis',     label: 'Mes devis',     count: quotes.length },
    { key: 'factures',  label: 'Mes factures',  count: invoices.length },
    { key: 'demandes',  label: 'Mes demandes',  count: requests.length },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pt-16">

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Mon espace client</h1>
            <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-lg px-4 py-2 hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </button>
        </div>

        {/* Onglets */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  tab === t.key
                    ? 'border-[#7C3AED] text-[#7C3AED]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
                {t.count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    tab === t.key ? 'bg-[#7C3AED] text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {dataLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {tab === 'commandes' && <TabCommandes data={orders} onSelect={openOrder} />}
            {tab === 'devis'     && <TabDevis     data={quotes} />}
            {tab === 'factures'  && <TabFactures  data={invoices} />}
            {tab === 'demandes'  && <TabDemandes  data={requests} />}
          </>
        )}
      </div>

      {/* Modal détail commande */}
      {selectedOrder && (
        <ModalCommande
          order={selectedOrder}
          history={orderHistory}
          onClose={() => { setSelectedOrder(null); setOrderHistory([]) }}
        />
      )}
    </div>
  )
}

// ─── Tab : Mes commandes ───────────────────────────────────────────────────────

function TabCommandes({ data, onSelect }) {
  if (data.length === 0) return <EmptyState text="Aucune commande en cours." />

  return (
    <div className="grid gap-5">
      {data.map(order => {
        const stepIndex = STATUS_STEPS.findIndex(s => s.key === order.status)
        const colorCls  = ORDER_STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'
        const stepLabel = STATUS_STEPS[stepIndex]?.label ?? order.status
        const progress  = stepIndex >= 0 ? Math.round(((stepIndex + 1) / STATUS_STEPS.length) * 100) : 0

        // Étape courante dans la timeline 4 étapes
        const currentTimelineIdx = TIMELINE_STEPS.findIndex(t =>
          t.phases.includes(order.status)
        )

        return (
          <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono font-bold text-gray-900">{order.order_number}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colorCls}`}>
                    {stepLabel}
                  </span>
                </div>
                <p className="text-sm text-gray-500">Commandé le {fmt(order.created_at)}</p>
                {order.expected_delivery && (
                  <p className="text-sm text-gray-500">
                    Livraison prévue : <strong>{fmt(order.expected_delivery)}</strong>
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xl font-extrabold text-gray-900">
                  {Number(order.total_ttc ?? 0).toFixed(2)} €
                </p>
                <p className="text-xs text-gray-400">TTC</p>
              </div>
            </div>

            {/* Timeline 4 étapes */}
            {order.status !== 'annulee' && (
              <div className="mb-5">
                <div className="flex items-start justify-between relative">
                  {/* Ligne de fond */}
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200" />
                  {/* Ligne de progression */}
                  <div
                    className="absolute top-4 left-4 h-0.5 bg-[#7C3AED] transition-all duration-700"
                    style={{
                      width: currentTimelineIdx < 0 ? '0%'
                        : currentTimelineIdx >= TIMELINE_STEPS.length - 1 ? 'calc(100% - 2rem)'
                        : `calc(${(currentTimelineIdx / (TIMELINE_STEPS.length - 1)) * 100}% * (100% - 2rem) / 100%)`,
                      right: 'unset',
                    }}
                  />
                  {TIMELINE_STEPS.map((step, i) => {
                    const done    = i <= currentTimelineIdx
                    const current = i === currentTimelineIdx
                    return (
                      <div key={step.key} className="flex flex-col items-center gap-2 z-10 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          done
                            ? current
                              ? 'bg-[#7C3AED] ring-4 ring-[#7C3AED]/20 shadow-lg'
                              : 'bg-[#7C3AED]'
                            : 'bg-white border-2 border-gray-200'
                        }`}>
                          <span className={done ? 'text-white' : 'text-gray-300'}>
                            {step.icon}
                          </span>
                        </div>
                        <p className={`text-xs text-center font-medium leading-tight ${
                          done ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {step.label}
                        </p>
                      </div>
                    )
                  })}
                </div>
                {/* Barre de progression détaillée */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Avancement</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-[#7C3AED] h-1.5 rounded-full transition-all duration-700"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {order.status === 'annulee' && (
              <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">
                Cette commande a été annulée.
              </div>
            )}

            {/* Prochaine étape */}
            {order.status !== 'livree' && order.status !== 'annulee' && stepIndex >= 0 && stepIndex < STATUS_STEPS.length - 1 && (
              <div className="mb-4 bg-purple-50 border border-purple-100 rounded-xl p-3 text-sm text-purple-700 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Prochaine étape : <strong className="ml-1">{STATUS_STEPS[stepIndex + 1]?.label}</strong>
              </div>
            )}

            <button
              onClick={() => onSelect(order)}
              className="text-sm text-[#7C3AED] font-semibold hover:underline flex items-center gap-1"
            >
              Voir l'historique détaillé
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ─── Tab : Mes devis ───────────────────────────────────────────────────────────

function TabDevis({ data }) {
  if (data.length === 0) return <EmptyState text="Aucun devis disponible pour l'instant." />

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">N° Devis</th>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">Date</th>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">Total TTC</th>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">Statut</th>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">PDF</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map(q => {
            const s = QUOTE_STATUS[q.status] ?? { label: q.status, cls: 'bg-gray-100 text-gray-600' }
            return (
              <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono font-semibold text-gray-900 text-xs">{q.quote_number ?? '—'}</td>
                <td className="px-6 py-4 text-gray-500">{fmt(q.created_at)}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  {q.total_ttc != null ? `${Number(q.total_ttc).toFixed(2)} €` : '—'}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
                    {s.label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {q.pdf_url ? (
                    <a
                      href={q.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[#7C3AED] hover:underline text-xs font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      </svg>
                      Télécharger
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs">Disponible bientôt</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Tab : Mes factures ────────────────────────────────────────────────────────

function TabFactures({ data }) {
  if (data.length === 0) return <EmptyState text="Aucune facture disponible." />

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">N° Facture</th>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">Commande</th>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">Total HT</th>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">Total TTC</th>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">Statut</th>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map(inv => {
            const s = INVOICE_STATUS[inv.status] ?? { label: inv.status, cls: 'bg-gray-100 text-gray-600' }
            return (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono font-semibold text-gray-900 text-xs">{inv.invoice_number}</td>
                <td className="px-6 py-4 font-mono text-gray-600 text-xs">{inv.orders?.order_number ?? '—'}</td>
                <td className="px-6 py-4 text-gray-700">{Number(inv.total_ht ?? 0).toFixed(2)} €</td>
                <td className="px-6 py-4 font-semibold text-gray-900">{Number(inv.total_ttc ?? 0).toFixed(2)} €</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
                    {s.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{fmt(inv.created_at)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Tab : Mes demandes ────────────────────────────────────────────────────────

function TabDemandes({ data }) {
  if (data.length === 0) return <EmptyState text="Aucune demande de devis pour l'instant." />

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">Date</th>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">Produits</th>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">Quantité</th>
            <th className="text-left px-6 py-3 font-semibold text-gray-600">Statut</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map(r => {
            const s = QR_STATUS[r.status] ?? { label: r.status, cls: 'bg-gray-100 text-gray-600' }
            return (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-500">{fmt(r.created_at)}</td>
                <td className="px-6 py-4 text-gray-900 font-medium">
                  {Array.isArray(r.products) ? r.products.join(', ') : (r.products ?? '—')}
                </td>
                <td className="px-6 py-4 text-gray-600">{r.quantity ?? '—'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
                    {s.label}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Modal : Détail commande ───────────────────────────────────────────────────

function ModalCommande({ order, history, onClose }) {
  const stepIndex = STATUS_STEPS.findIndex(s => s.key === order.status)
  const colorCls  = ORDER_STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">{order.order_number}</h2>
            <p className="text-sm text-gray-500">Commandé le {fmt(order.created_at)}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Infos commande */}
        <div className="p-6 border-b border-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${colorCls}`}>
              {STATUS_STEPS[stepIndex]?.label ?? order.status}
            </span>
            <span className="text-xl font-extrabold text-gray-900">
              {Number(order.total_ttc ?? 0).toFixed(2)} € TTC
            </span>
          </div>
          {order.expected_delivery && (
            <p className="text-sm text-gray-500 mt-1">
              Livraison prévue : <strong>{fmt(order.expected_delivery)}</strong>
            </p>
          )}
          {order.notes && (
            <p className="text-sm text-gray-500 mt-1 italic">{order.notes}</p>
          )}
        </div>

        {/* Timeline des statuts */}
        <div className="p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Historique du suivi</h3>
          <div className="relative">
            {STATUS_STEPS.map((step, i) => {
              const done      = i <= stepIndex
              const histItem  = history.find(h => h.status === step.key)
              const isCurrent = i === stepIndex

              return (
                <div key={step.key} className="flex gap-4">
                  {/* Cercle + ligne */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      done
                        ? isCurrent
                          ? 'bg-[#7C3AED] ring-4 ring-[#7C3AED]/20'
                          : 'bg-[#7C3AED]'
                        : 'bg-gray-100'
                    }`}>
                      {done ? (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-gray-300" />
                      )}
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`w-0.5 h-8 my-0.5 ${i < stepIndex ? 'bg-[#7C3AED]' : 'bg-gray-200'}`} />
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="pb-6 flex-1">
                    <p className={`text-sm font-semibold ${done ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.label}
                      {isCurrent && (
                        <span className="ml-2 text-xs bg-[#7C3AED] text-white px-2 py-0.5 rounded-full">
                          Actuel
                        </span>
                      )}
                    </p>
                    {histItem && (
                      <>
                        <p className="text-xs text-gray-400 mt-0.5">{fmt(histItem.created_at)}</p>
                        {histItem.note && (
                          <p className="text-xs text-gray-500 mt-1 italic">{histItem.note}</p>
                        )}
                      </>
                    )}
                    {!done && (
                      <p className="text-xs text-gray-300 mt-0.5">À venir</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Empty state ────────────────────────────────────────────────────────────────

function EmptyState({ text }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-gray-500 text-sm">{text}</p>
    </div>
  )
}
