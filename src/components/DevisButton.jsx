import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Bouton "Demander un devis" qui :
 * - Redirige vers /login si non connecté
 * - Redirige vers /devis si connecté
 */
export function DevisButton({ children = 'Demander un devis gratuit', className = '' }) {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  // Vérifier l'état d'auth
  useEffect(() => {
    if (!loading) {
      setIsChecking(false)
    }
  }, [loading])

  const handleDevisClick = (e) => {
    e.preventDefault()
    
    // Si en train de vérifier, attendre
    if (isChecking || loading) {
      return
    }

    // Si NON connecté → aller à login
    if (!user) {
      console.log('Utilisateur non connecté, redirection vers /login')
      navigate('/login', { state: { from: '/devis' } })
    } else {
      // Connecté → aller à /devis
      console.log('Utilisateur connecté, redirection vers /devis')
      navigate('/devis')
    }
  }

  return (
    <button
      onClick={handleDevisClick}
      disabled={isChecking || loading}
      className={`${className} ${(isChecking || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {(isChecking || loading) ? 'Chargement...' : children}
    </button>
  )
}
