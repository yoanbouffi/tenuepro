import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'

/**
 * Hook pour protéger l'accès au devis
 * Si non connecté → redirige vers login
 * Si connecté → redirige vers /devis
 */
export function useDevisAccess() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  const handleDevisClick = (e) => {
    e.preventDefault()
    
    if (loading) {
      // En train de charger, attendre
      return
    }

    if (!user) {
      // Non connecté → aller à la page de login
      navigate('/login', { state: { from: '/devis' } })
    } else {
      // Connecté → aller au formulaire devis
      navigate('/devis')
    }
  }

  return { handleDevisClick, isLoading: loading }
}
