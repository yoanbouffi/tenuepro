import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ForgotPassword() {
  const { resetPasswordForEmail } = useAuth()

  const [email,      setEmail]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [sent,       setSent]       = useState(false)
  const [error,      setError]      = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Veuillez saisir une adresse email valide.')
      return
    }

    setLoading(true)
    const { error: authError } = await resetPasswordForEmail(email)
    setLoading(false)

    if (authError) {
      // On affiche toujours le succès pour ne pas révéler si l'email existe
      console.error('Reset error:', authError)
    }
    // Qu'il y ait une erreur ou non, on affiche l'écran de succès
    // (sécurité : ne pas indiquer si l'email est enregistré)
    setSent(true)
  }

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
          <h1 className="mt-6 text-2xl font-extrabold text-gray-900">Mot de passe oublié</h1>
          <p className="mt-1 text-sm text-gray-500">
            Saisissez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">

          {/* ── Formulaire ── */}
          {!sent ? (
            <>
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
                    Adresse email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="jean@monentreprise.re"
                    required
                    autoFocus
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED] hover:border-gray-300 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 bg-[#7C3AED] text-white font-semibold py-3 rounded-xl hover:bg-[#6D28D9] transition-colors text-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Envoi en cours…
                    </>
                  ) : 'Envoyer le lien de réinitialisation'}
                </button>
              </form>
            </>
          ) : (
            /* ── Succès ── */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-extrabold text-gray-900 mb-2">Email envoyé !</h2>
              <p className="text-sm text-gray-600 mb-1">
                Si un compte existe pour <strong>{email}</strong>,
              </p>
              <p className="text-sm text-gray-500 mb-6">
                vous recevrez un lien de réinitialisation dans quelques minutes.<br />
                Pensez à vérifier vos spams.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="text-sm text-[#7C3AED] hover:underline"
              >
                Utiliser un autre email
              </button>
            </div>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-gray-500">
          <Link to="/login" className="text-[#7C3AED] font-medium hover:underline flex items-center justify-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}
