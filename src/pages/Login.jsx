import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function Login() {
  const { signIn } = useAuth()
  const navigate   = useNavigate()

  const [mode,            setMode]            = useState('login')   // 'login' | 'signup'
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword,    setShowPassword]    = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [googleLoading,   setGoogleLoading]   = useState(false)
  const [error,           setError]           = useState('')
  const [successMsg,      setSuccessMsg]      = useState('')

  const switchMode = (next) => {
    setMode(next)
    setError('')
    setSuccessMsg('')
    setPassword('')
    setConfirmPassword('')
  }

  // ─── CONNEXION ───────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await signIn(email.trim(), password)
    setLoading(false)
    if (authError) {
      setError('Email ou mot de passe incorrect. Vérifiez vos identifiants.')
    } else {
      navigate('/espace-client')
    }
  }

  // ─── INSCRIPTION ──────────────────────────────────────────────────────────────
  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    const { data, error: authError } = await supabase.auth.signUp({
      email:    email.trim(),
      password,
    })
    setLoading(false)

    if (authError) {
      // Compte déjà existant → proposer la connexion
      if (authError.message?.toLowerCase().includes('already registered') ||
          authError.message?.toLowerCase().includes('already exists')) {
        setError('Un compte existe déjà avec cet email.')
        switchMode('login')
      } else {
        setError(authError.message)
      }
      return
    }

    // Supabase retourne user avec identities vide si l'email est déjà pris
    // (quand confirmation email est activée)
    if (data?.user?.identities?.length === 0) {
      setError('Un compte existe déjà avec cet email.')
      switchMode('login')
      return
    }

    if (data?.session) {
      // Confirmation email désactivée → connecté directement
      navigate('/espace-client')
    } else {
      // Confirmation email activée
      setSuccessMsg(`Un email de confirmation a été envoyé à ${email.trim()}. Cliquez sur le lien pour activer votre compte.`)
    }
  }

  // ─── GOOGLE ───────────────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options:  { redirectTo: `${window.location.origin}/espace-client` },
      })
      if (authError) setError('Erreur lors de la connexion avec Google. Essayez à nouveau.')
    } catch {
      setError('Erreur de connexion. Vérifiez votre connexion internet.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const isLogin  = mode === 'login'
  const isSignup = mode === 'signup'

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
          <h1 className="mt-6 text-2xl font-extrabold text-gray-900">
            {isLogin ? 'Espace client' : 'Créer un compte'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isLogin
              ? 'Connectez-vous pour suivre vos commandes'
              : 'Rejoignez TenuePro pour gérer vos commandes'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">

          {/* Message d'erreur */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Message de succès */}
          {successMsg && (
            <div className="mb-5 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-700">{successMsg}</p>
            </div>
          )}

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 bg-white text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors mb-6 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading
              ? 'Connexion…'
              : isLogin ? 'Se connecter avec Google' : 'Créer un compte avec Google'}
          </button>

          {/* Séparateur */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-400">ou avec votre email</span>
            </div>
          </div>

          {/* ── FORMULAIRE CONNEXION ── */}
          {isLogin && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jean@monentreprise.re"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] hover:border-gray-300 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                  <Link to="/forgot-password" className="text-xs text-[#7C3AED] hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2.5 pr-11 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] hover:border-gray-300 transition-colors"
                  />
                  <EyeToggle show={showPassword} onToggle={() => setShowPassword(v => !v)} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 bg-[#7C3AED] text-white font-semibold py-3 rounded-xl hover:bg-[#6D28D9] transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? <Spinner /> : 'Se connecter'}
              </button>
            </form>
          )}

          {/* ── FORMULAIRE INSCRIPTION ── */}
          {isSignup && (
            <form onSubmit={handleSignUp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jean@monentreprise.re"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] hover:border-gray-300 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mot de passe <span className="text-gray-400 font-normal">(6 caractères minimum)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 pr-11 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] hover:border-gray-300 transition-colors"
                  />
                  <EyeToggle show={showPassword} onToggle={() => setShowPassword(v => !v)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le mot de passe</label>
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
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 bg-[#7C3AED] text-white font-semibold py-3 rounded-xl hover:bg-[#6D28D9] transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? <Spinner /> : 'Créer mon compte'}
              </button>

              <p className="text-xs text-gray-400 text-center">
                En créant un compte, vous acceptez nos{' '}
                <Link to="/cgv" className="underline hover:text-gray-600">CGV</Link>.
              </p>
            </form>
          )}
        </div>

        {/* Bascule connexion ↔ inscription */}
        <p className="text-center mt-6 text-sm text-gray-500">
          {isLogin ? (
            <>
              Pas encore de compte ?{' '}
              <button
                onClick={() => switchMode('signup')}
                className="text-[#7C3AED] font-semibold hover:underline"
              >
                Créer un compte
              </button>
            </>
          ) : (
            <>
              Déjà un compte ?{' '}
              <button
                onClick={() => switchMode('login')}
                className="text-[#7C3AED] font-semibold hover:underline"
              >
                Se connecter
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function EyeToggle({ show, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      title={show ? 'Masquer' : 'Afficher'}
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

function Spinner() {
  return (
    <>
      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Chargement…
    </>
  )
}
