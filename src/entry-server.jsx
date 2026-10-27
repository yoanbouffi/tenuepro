import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { OffreProvider } from './content/OffreContext'
import { AppRoutes } from './App.jsx'

export { SEO, SITE_URL, PAGES_PUBLIQUES } from './seo'

export function render(url, offre) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <OffreProvider initial={offre}>
          <AppRoutes />
        </OffreProvider>
      </StaticRouter>
    </StrictMode>
  )
}
