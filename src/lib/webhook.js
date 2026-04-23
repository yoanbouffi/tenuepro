/**
 * Upload direct d'un fichier logo vers Cloudinary depuis le navigateur.
 * Utilise un upload preset "unsigned" (à créer dans le dashboard Cloudinary).
 *
 * Prérequis .env.local :
 *   VITE_CLOUDINARY_CLOUD_NAME   = djq5gqxmj
 *   VITE_CLOUDINARY_UPLOAD_PRESET = <nom du preset unsigned>
 *
 * @param {File} file - Le fichier logo du formulaire (form.logo)
 * @returns {{ public_id: string, url: string } | null}
 */
export const uploadLogoToCloudinary = async (file) => {
  const CLOUD  = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? 'djq5gqxmj'
  const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!file) return null
  if (!PRESET) {
    console.warn('⚠️ VITE_CLOUDINARY_UPLOAD_PRESET non configuré — upload logo ignoré')
    return null
  }

  const formData = new FormData()
  formData.append('file',           file)
  formData.append('upload_preset',  PRESET)
  formData.append('folder',         'tenuepro/logos')

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(`Cloudinary upload échoué : ${err.error?.message ?? response.status}`)
  }

  const data = await response.json()
  return { public_id: data.public_id, url: data.secure_url }
}

export const notifyStatusChange = async (data) => {
  try {
    const response = await fetch(
      'https://n8n.srv1087606.hstgr.cloud/webhook/tenuepro-statut-change',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }
    );
    return { success: response.ok };
  } catch (error) {
    console.error('Erreur notification statut:', error);
    return { success: false };
  }
};

export const submitDevisForm = async (formData) => {
  const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contact_name:  formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        company_name:  formData.company_name,
        siret:         formData.siret,
        sector:        formData.sector,
        products:      formData.products,
        quantity:      formData.quantity,
        description:   formData.description,
        deadline:      formData.deadline,
        logo_url:       formData.logo_url       || null,
        logo_public_id: formData.logo_public_id || null,
        mockup_urls:    formData.mockup_urls    || [],
      })
    });
    if (!response.ok) throw new Error('Erreur webhook');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
