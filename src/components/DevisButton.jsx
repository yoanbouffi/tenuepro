import { Link } from 'react-router-dom'

/** Lien vers le formulaire de devis (ouvert à tous, sans compte). */
export function DevisButton({ children = 'Demander un devis', className = 'btn-primary', to = '/devis' }) {
  return <Link to={to} className={className}>{children}</Link>
}
