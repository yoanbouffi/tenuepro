import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function Login() {
  const { signIn } = useAuth()
  const navigate   = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e) => {
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center">
              <span className="text-white font-extrabold text-sm">TP</span>
            </div>
            <span className="font-extrabold text-2xl text-gray-900">
              Tenue<span className="text-[#7C3AED]">Pro</span>
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-extrabold text-gray-900">Espace client</h1>
          <p className="mt-1 text-sm text-gray-500">Connectez-vous pour suivre vos commandes</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean@monentreprise.re"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] hover:border-gray-300 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <button
                  type="button"
                  className="text-xs text-[#7C3AED] hover:underline"
                  onClick={async () => {
                    if (!email.trim()) {
                      setError('Saisissez votre email pour réinitialiser le mot de passe.')
                      return
                    }
                    await supabase.auth.resetPasswordForEmail(email.trim())
                    setError('')
                    alert('Un email de réinitialisation a été envoyé.')
                  }}
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] hover:border-gray-300 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 bg-[#7C3AED] text-white font-semibold py-3 rounded-xl hover:bg-[#6D28D9] transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connexion…
                </>
              ) : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-gray-500">
          Pas encore client ?{' '}
          <Link to="/devis" className="text-[#7C3AED] font-medium hover:underline">
            Demander un devis gratuit
          </Link>
        </p>
      </div>
    </div>
  )
}
