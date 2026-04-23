/**
 * TenuePro — Génération de maquettes Cloudinary
 *
 * Architecture :
 *   1. Logo uploadé dans Cloudinary via uploadLogoToCloudinary() (webhook.js)
 *   2. URL de maquette construite avec overlay Cloudinary (pas d'upload supplémentaire)
 *   3. Les mockup_urls sont incluses dans la soumission du formulaire → WF1 → Supabase
 *
 * Prérequis Cloudinary :
 *   - Les images de base (ex: tenuepro/mockups/polos-base) doivent exister dans le cloud
 *   - Un upload preset "unsigned" doit être créé dans le dashboard Cloudinary
 *     (Settings → Upload → Upload presets → Add unsigned preset)
 */

const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? 'djq5gqxmj'

/**
 * Mapping produit → mockup de base Cloudinary
 * Chaque entrée décrit :
 *   - base     : public_id du mockup de fond dans Cloudinary
 *   - label    : nom affiché côté admin
 *   - w        : largeur max du logo overlay (pixels)
 *   - gravity  : ancrage Cloudinary (north_west, center, north…)
 *   - x / y    : décalage depuis l'ancrage (0 = pas de décalage)
 */
export const PRODUCT_MOCKUP_MAPPING = {
  polos: {
    label:   'Polos',
    base:    'tenuepro/mockups/polos-base',
    w:       200,
    gravity: 'north_west',
    x:       80,
    y:       80,
  },
  tshirts: {
    label:   'T-shirts',
    base:    'tenuepro/mockups/tshirts-base',
    w:       200,
    gravity: 'north_west',
    x:       80,
    y:       80,
  },
  vestes: {
    label:   'Vestes & Sweats',
    base:    'tenuepro/mockups/vestes-base',
    w:       180,
    gravity: 'north_west',
    x:       60,
    y:       60,
  },
  casquettes: {
    label:   'Casquettes',
    base:    'tenuepro/mockups/casquettes-base',
    w:       120,
    gravity: 'center',
    x:       0,
    y:       -20,
  },
  tabliers: {
    label:   'Tabliers',
    base:    'tenuepro/mockups/tabliers-base',
    w:       160,
    gravity: 'north',
    x:       0,
    y:       80,
  },
  chemises: {
    label:   'Chemises',
    base:    'tenuepro/mockups/chemises-base',
    w:       180,
    gravity: 'north_west',
    x:       80,
    y:       80,
  },
  sacs: {
    label:   'Sacs & Tote bags',
    base:    'tenuepro/mockups/sacs-base',
    w:       200,
    gravity: 'center',
    x:       0,
    y:       0,
  },
}

/**
 * Encode un public_id Cloudinary pour usage en layer overlay
 * Cloudinary exige de remplacer "/" par ":" dans les overlays d'URL.
 * Ex : "tenuepro/logos/client_abc" → "tenuepro:logos:client_abc"
 */
const encodePublicId = (publicId) => publicId.replace(/\//g, ':')

/**
 * Construit l'URL Cloudinary avec overlay du logo sur un mockup de base.
 *
 * Format URL résultant :
 *   https://res.cloudinary.com/{cloud}/image/upload/
 *     l_{logo_encoded},w_{w},c_fit,g_{gravity}[,x_{x},y_{y}]/
 *     {base_public_id}
 *
 * @param {string} logoPublicId  - public_id du logo uploadé (ex: "tenuepro/logos/client_abc")
 * @param {string} productId     - identifiant produit (ex: "polos")
 * @returns {string|null}        - URL de la maquette ou null si produit inconnu
 */
export function buildMockupUrl(logoPublicId, productId) {
  const product = PRODUCT_MOCKUP_MAPPING[productId]
  if (!product || !logoPublicId) return null

  const logoEncoded = encodePublicId(logoPublicId)
  const { base, w, gravity, x, y } = product

  // Construction du paramètre de transformation overlay
  const hasOffset = x !== 0 || y !== 0
  const transform = hasOffset
    ? `l_${logoEncoded},w_${w},c_fit,g_${gravity},x_${x},y_${y}`
    : `l_${logoEncoded},w_${w},c_fit,g_${gravity}`

  return `https://res.cloudinary.com/${CLOUD}/image/upload/${transform}/${base}`
}

/**
 * Génère la liste complète des maquettes pour tous les produits sélectionnés.
 *
 * @param {string}   logoPublicId - public_id du logo uploadé dans Cloudinary
 * @param {string[]} productIds   - liste des IDs produits sélectionnés (ex: ["polos", "sacs"])
 * @returns {Array<{product_id, product, mockup_url}>}
 */
export function buildAllMockupUrls(logoPublicId, productIds) {
  if (!logoPublicId || !Array.isArray(productIds)) return []

  return productIds
    .filter(id => PRODUCT_MOCKUP_MAPPING[id])
    .map(id => ({
      product_id:  id,
      product:     PRODUCT_MOCKUP_MAPPING[id].label,
      mockup_url:  buildMockupUrl(logoPublicId, id),
    }))
}
