import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// États de la page :
// 'checking' → vérification du token recovery
// 'ready'    → token valide, formulaire actif
// 'invalid'  → lien expiré ou absent
// 'success'  → mot de passe mis à jour

export default function ResetPassword() {
  const navigate = useNavigate()

  const [pageState,       setPageState]       = useState('checking')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword,    setShowPassword]    = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState('')

  // ─── Détection du contexte recovery ──────────────────────────────────────────
  useEffect(() => {
    let resolved = false

    const resolve = (state) => {
      if (resolved) return
      resolved = true
      setPageState(state)
    }

    // 1. Vérification directe du hash URL (méthode la plus rapide)
    //    Supabase envoie : /reset-password#access_token=...&type=recovery
    const hash   = window.location.hash
    const params = new URLSearchParams(hash.replace(/^#/, ''))
    if (params.get('type') === 'recovery' && params.get('access_token')) {
      resolve('ready')
    }

    // 2. Écouter l'event PASSWORD_RECOVERY (Supabase JS le fire quand il parse le hash)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') resolve('ready')
    })

    // 3. Fallback : si aucun des deux ne détecte le token après 4s → lien invalide
    const timer = setTimeout(() => resolve('invalid'), 4000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  // ─── Soumission du nouveau mot de passe ──────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError('Erreur lors de la mise à jour. Le lien a peut-être expiré.')
    } else {
      setPageState('success')
      setTimeout(() => navigate('/espace-client'), 3000)
    }
  }

  // ─── Indicateur de force du mot de passe ─────────────────────────────────────
  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <img
              src="https://res.cloudinary.com/djq5gqxmj/image/upload/v1776791593/Logo-Tp_2x_f0ouhx.png"
              alt="TenuePro"
              className="h-9 w-auto object-contain"
            />
            <span className="font-extrabold text-2xl text-gray-900">
              Tenue<span className="text-[#7C3AED]">Pro</span>
            </span>
          </Link>
        </div>

        {/* ── Chargement ── */}
        {pageState === 'checking' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Vérification du lien de réinitialisation…</p>
          </div>
        )}

        {/* ── Lien invalide / expiré ── */}
        {pageState === 'invalid' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-2">Lien invalide ou expiré</h1>
            <p className="text-sm text-gray-500 mb-6">
              Ce lien de réinitialisation n'est plus valide.<br />
              Les liens expirent après 1 heure.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 bg-[#7C3AED] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#6D28D9] transition-colors text-sm"
            >
              Faire une nouvelle demande
            </Link>
          </div>
        )}

        {/* ── Formulaire nouveau mot de passe ── */}
        {pageState === 'ready' && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold text-gray-900">Nouveau mot de passe</h1>
              <p className="mt-1 text-sm text-gray-500">Choisissez un mot de passe sécurisé</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              {error && (
                <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nouveau mot de passe{' '}
                    <span className="text-gray-400 font-normal">(min. 6 caractères)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      autoFocus
                      className="w-full px-4 py-2.5 pr-11 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] hover:border-gray-300 transition-colors"
                    />
                    <EyeToggle show={showPassword} onToggle={() => setShowPassword(v => !v)} />
                  </div>
                  {/* Indicateur de force */}
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i <= strength
                                ? strength === 1 ? 'bg-red-400'
                                : strength === 2 ? 'bg-yellow-400'
                                : 'bg-green-400'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {strength === 1 ? 'Trop court' : strength === 2 ? 'Moyen' : 'Bon'}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] hover:border-gray-300 transition-colors ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-red-400'
                        : 'border-gray-200'
                    }`}
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">Les mots de passe ne correspondent pas</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || password.length < 6 || password !== confirmPassword}
                  className={`w-full flex items-center justify-center gap-2 bg-[#7C3AED] text-white font-semibold py-3 rounded-xl hover:bg-[#6D28D9] transition-colors text-sm ${
                    (loading || password.length < 6 || password !== confirmPassword)
                      ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Mise à jour…
                    </>
                  ) : 'Enregistrer le nouveau mot de passe'}
                </button>
              </form>
            </div>
          </>
        )}

        {/* ── Succès ── */}
        {pageState === 'success' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 mb-2">Mot de passe mis à jour !</h1>
            <p className="text-sm text-gray-500 mb-6">
              Redirection vers votre espace client dans 3 secondes…
            </p>
            <Link
              to="/espace-client"
              className="inline-flex items-center gap-2 bg-[#7C3AED] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#6D28D9] transition-colors text-sm"
            >
              Accéder à mon espace client
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function EyeToggle({ show, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
    >
      {show ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856A9.97 9.97 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-1.874 3.268M3 3l18 18" />
        </svg>
      )}
    </button>
  )
}
