import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <App initialOffre={window.__OFFRE__ || null} />
  </StrictMode>
)

// Pages publiques pré-générées : on « réveille » le HTML existant. Sinon : rendu classique.
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
