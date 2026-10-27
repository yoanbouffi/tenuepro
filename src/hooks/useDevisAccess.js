import { useNavigate } from 'react-router-dom'

/** Le devis est ouvert à tous : simple navigation vers le formulaire. */
export function useDevisAccess() {
  const navigate = useNavigate()
  const handleDevisClick = (e) => { e?.preventDefault?.(); navigate('/devis') }
  return { handleDevisClick, isLoading: false }
}
