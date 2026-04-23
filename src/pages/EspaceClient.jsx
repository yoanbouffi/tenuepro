import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

// ─── CONSTANTES ────────────────────────────────────────────────────────────────

const STATUS_STEPS = [
  { key: 'demande_recue',           label: 'Demande reçue',         icon: '📬' },
  { key: 'devis_envoye',            label: 'Devis envoyé',          icon: '📄' },
  { key: 'en_attente_validation',   label: 'En attente',            icon: '⏳' },
  { key: 'validé',                  label: 'Validé',                icon: '✓' },
  { key: 'production',              label: 'Production',            icon: '⚙️' },
  { key: 'expédié',                 label: 'Expédié',               icon: '📦' },
  { key: 'livré',                   label: 'Livré',                 icon: '🎉' },
]

const QUOTE_STATUS = {
  draft:    { label: 'Brouillon',  cls: 'bg-gray-100 text-gray-600' },
  sent:     { label: 'Reçu',       cls: 'bg-blue-100 text-blue-700' },
  accepted: { label: 'Accepté',    cls: 'bg-green-100 text-green-700' },
  refused:  { label: 'Refusé',     cls: 'bg-red-100 text-red-700' },
  expired:  { label: 'Expiré',     cls: 'bg-orange-100 text-orange-700' },
}

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

// ─── COMPOSANT PRINCIPAL ───────────────────────────────────────────────────────

export default function EspaceClient() {
  const { user, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState('commandes')
  const [quotes, setQuotes] = useState([])
  const [orders, setOrders] = useState([])
  const [invoices, setInvoices] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  // ─── REDIRECT SI NON CONNECTÉ ─────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [user, authLoading, navigate])

  // ─── CHARGEMENT DES DONNÉES ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return

    const load = async () => {
      setDataLoading(true)
      console.log('📡 Chargement des données pour:', user.id)

      try {
        // Devis
        const { data: quotesData, error: quotesErr } = await supabase
          .from('quotes')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false })

        console.log('Devis:', quotesData?.length || 0, quotesErr)

        // Commandes
        const { data: ordersData, error: ordersErr } = await supabase
          .from('orders')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false })

        console.log('Commandes:', ordersData?.length || 0, ordersErr)

        // Factures
        const { data: invoicesData, error: invoicesErr } = await supabase
          .from('invoices')
          .select('*, orders(order_number, profile_id)')
          .order('created_at', { ascending: false })
        
        // Filtrer pour ne garder que les factures de l'utilisateur
        const userInvoices = invoicesData?.filter(inv => inv.orders?.profile_id === user.id) ?? []

        console.log('Factures:', userInvoices.length, invoicesErr)

        setQuotes(quotesData ?? [])
        setOrders(ordersData ?? [])
        setInvoices(userInvoices)
      } catch (err) {
        console.error('Erreur chargement:', err)
      } finally {
        setDataLoading(false)
      }
    }

    load()

    // ─── SUBSCRIPTION TEMPS RÉEL ───────────────────────────────────────────────
    const sub = supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('📡 Mise à jour reçue:', payload)
          if (payload.new?.profile_id === user.id) {
            setOrders(prev =>
              prev.map(o => o.id === payload.new.id ? payload.new : o)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(sub)
    }
  }, [user])

  // ─── RENDER ───────────────────────────────────────────────────────────────────

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
    </div>
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-gray-900">Mon espace client</h1>
            <button
              onClick={signOut}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Déconnexion
            </button>
          </div>
          <p className="text-gray-600">Suivez vos devis et commandes en temps réel</p>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-gray-200 mb-8 gap-8">
          {[
            { key: 'commandes', label: 'Commandes', count: orders.length },
            { key: 'devis', label: 'Devis', count: quotes.length },
            { key: 'factures', label: 'Factures', count: invoices.length },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-4 font-medium border-b-2 transition whitespace-nowrap ${
                tab === t.key
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.label} <span className="ml-2 text-sm bg-gray-200 px-2 py-0.5 rounded">{t.count}</span>
            </button>
          ))}
        </div>

        {dataLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* ─── COMMANDES AVEC TIMELINE ─────────────────────────────────────── */}
            {tab === 'commandes' && (
              <div className="space-y-6">
                {orders.length === 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <p className="text-gray-500 text-lg">Aucune commande pour le moment</p>
                  </div>
                ) : (
                  orders.map(order => {
                    const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === order.status)
                    const progressPercent = currentStepIndex === -1 ? 0 : ((currentStepIndex + 1) / STATUS_STEPS.length) * 100

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition"
                      >
                        {/* Header Commande */}
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">{order.order_number}</h3>
                            <p className="text-sm text-gray-600">Commande du {fmt(order.created_at)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-gray-900">{order.total_ttc?.toFixed(2)}€</p>
                            <p className="text-xs text-gray-500 mt-1">TTC</p>
                          </div>
                        </div>

                        {/* Barre de progression */}
                        <div className="mb-8">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span className="font-medium">Progression</span>
                            <span className="font-semibold text-purple-600">{Math.round(progressPercent)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                          <div className="space-y-4">
                            {STATUS_STEPS.map((step, idx) => {
                              const isCompleted = idx <= currentStepIndex
                              const isCurrent = idx === currentStepIndex

                              return (
                                <div key={step.key} className="flex items-center gap-4">
                                  {/* Cercle */}
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 transition-all ${
                                      isCompleted
                                        ? 'bg-purple-500 text-white shadow-md'
                                        : 'bg-gray-300 text-gray-600'
                                    } ${isCurrent ? 'ring-4 ring-purple-300 scale-110' : ''}`}
                                  >
                                    {isCompleted && !isCurrent ? '✓' : step.icon}
                                  </div>

                                  {/* Label */}
                                  <div className="flex-1">
                                    <p className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                                      {step.label}
                                    </p>
                                    {isCurrent && (
                                      <p className="text-xs text-purple-600 font-semibold mt-0.5">← Étape actuelle</p>
                                    )}
                                  </div>

                                  {/* Statut */}
                                  {isCompleted && idx < currentStepIndex && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                                      ✓ Complété
                                    </span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Infos supplémentaires */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                          {order.estimated_delivery && (
                            <div>
                              <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">📅 Livraison estimée</p>
                              <p className="text-sm text-gray-900 mt-1">{fmt(order.estimated_delivery)}</p>
                            </div>
                          )}
                          {order.notes && (
                            <div>
                              <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">📝 Notes</p>
                              <p className="text-sm text-gray-900 mt-1">{order.notes}</p>
                            </div>
                          )}
                          {order.shipped_date && (
                            <div>
                              <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">📦 Expédié le</p>
                              <p className="text-sm text-gray-900 mt-1">{fmt(order.shipped_date)}</p>
                            </div>
                          )}
                          {order.delivered_date && (
                            <div>
                              <p className="text-xs text-gray-600 uppercase tracking-wide font-medium">🎉 Livré le</p>
                              <p className="text-sm text-gray-900 mt-1">{fmt(order.delivered_date)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* ─── DEVIS ─────────────────────────────────────────────────────────── */}
            {tab === 'devis' && (
              <div className="space-y-4">
                {quotes.length === 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <p className="text-gray-500 text-lg">Aucun devis pour le moment</p>
                  </div>
                ) : (
                  quotes.map(quote => (
                    <div key={quote.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{quote.quote_number}</h3>
                          <p className="text-sm text-gray-600">Reçu le {fmt(quote.created_at)}</p>
                          {quote.valid_until && (
                            <p className="text-sm text-gray-600">Valide jusqu'au {fmt(quote.valid_until)}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{quote.total_ttc.toFixed(2)}€</p>
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                            QUOTE_STATUS[quote.status]?.cls || 'bg-gray-100'
                          }`}>
                            {QUOTE_STATUS[quote.status]?.label || quote.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {quote.pdf_url && (
                          <a
                            href={quote.pdf_url}
                            download
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition text-center"
                          >
                            📥 Télécharger PDF
                          </a>
                        )}
                        {quote.status === 'sent' && (
                          <div className="flex-1 text-center px-4 py-2 text-blue-600 font-medium text-sm">
                            ⏳ En attente de validation
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ─── FACTURES ────────────────────────────────────────────────────── */}
            {tab === 'factures' && (
              <div className="space-y-4">
                {invoices.length === 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <p className="text-gray-500 text-lg">Aucune facture pour le moment</p>
                  </div>
                ) : (
                  invoices.map(inv => (
                    <div key={inv.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{inv.invoice_number}</h3>
                          <p className="text-sm text-gray-600">Commande: {inv.orders?.order_number || '—'}</p>
                          <p className="text-sm text-gray-600">Date: {fmt(inv.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{inv.total_ttc?.toFixed(2)}€</p>
                          <p className="text-xs text-gray-500 mt-1">TTC</p>
                          {/* Statut */}
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                            inv.status === 'unpaid' ? 'bg-gray-100 text-gray-700' :
                            inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                            inv.status === 'overdue' ? 'bg-red-100 text-red-700' :
                            inv.status === 'cancelled' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {inv.status === 'unpaid' ? 'Non payée' :
                             inv.status === 'paid' ? 'Payée' :
                             inv.status === 'overdue' ? 'En retard' :
                             inv.status === 'cancelled' ? 'Annulée' :
                             inv.status}
                          </span>
                        </div>
                      </div>
                      {inv.pdf_url && (
                        <a
                          href={inv.pdf_url}
                          download
                          className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition text-center"
                        >
                          📥 Télécharger PDF
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
