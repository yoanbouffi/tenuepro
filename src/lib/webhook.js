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
        logo_url:      formData.logo_url || null,
      })
    });
    if (!response.ok) throw new Error('Erreur webhook');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
