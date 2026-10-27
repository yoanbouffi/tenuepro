// Génère une page HTML complète pour chaque page publique, lisible par Google,
// à partir du site construit (dist/) et du contenu enregistré dans l'admin.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const { render, SEO, SITE_URL, PAGES_PUBLIQUES } = await import(pathToFileURL(path.join(root, 'dist-ssr/entry-server.js')).href)

// Variables d'environnement : Vercel les fournit ; en local on lit .env.local / .env
function loadEnv() {
  const env = { ...process.env }
  for (const f of ['.env', '.env.local', '.env.production', '.env.production.local']) {
    const p = path.join(root, f)
    if (!fs.existsSync(p)) continue
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
    }
  }
  return env
}

async function contenuEnregistre() {
  const env = loadEnv()
  const url = env.VITE_SUPABASE_URL, key = env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return null
  try {
    const r = await fetch(`${url}/rest/v1/site_content?key=eq.offre&select=data`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const rows = await r.json()
    return rows[0]?.data ?? null
  } catch (e) {
    console.warn('[prerender] contenu de l’admin indisponible, valeurs par défaut utilisées :', e.message)
    return null
  }
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
const offre = await contenuEnregistre()
const data = `<script>window.__OFFRE__=${JSON.stringify(offre).replace(/</g, '\\u003c')}</script>`

// Coquille vide (espace client, admin, connexion…) : non indexée
fs.writeFileSync(
  path.join(dist, 'app.html'),
  template.replace('<!--app-html-->', '').replace('<!--app-data-->', data)
    .replace('<!--/seo-->', '<!--/seo-->\n    <meta name="robots" content="noindex" />')
)

for (const route of PAGES_PUBLIQUES) {
  const seo = SEO[route]
  const canonical = SITE_URL + (route === '/' ? '/' : route)
  const head = `<title>${esc(seo.title)}</title>
    <meta name="description" content="${esc(seo.description)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${esc(seo.title)}" />
    <meta property="og:description" content="${esc(seo.description)}" />
    <meta property="og:url" content="${canonical}" />`
  const html = template
    .replace(/<!--seo-->[\s\S]*?<!--\/seo-->/, head)
    .replace('<!--app-html-->', render(route, offre))
    .replace('<!--app-data-->', data)
  const file = route === '/' ? 'index.html' : `${route.slice(1)}.html`
  fs.writeFileSync(path.join(dist, file), html)
  console.log('[prerender]', route, '→', file)
}

// Plan du site et consignes pour les robots
const today = new Date().toISOString().slice(0, 10)
fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES_PUBLIQUES.map((r) => `  <url><loc>${SITE_URL}${r === '/' ? '/' : r}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`)
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *
Disallow: /admin-tenuepro-2026
Disallow: /espace-client
Disallow: /login
Disallow: /reset-password
Disallow: /forgot-password

Sitemap: ${SITE_URL}/sitemap.xml
`)
fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true })
