# TenuePro — Architecture du funnel commercial automatisé

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SITE WEB TENUEPRO                                   │
│                    Formulaire de demande de devis                           │
│          (src/pages/Devis.jsx  →  src/lib/webhook.js)                       │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │ HTTP POST (JSON)
                             │ contact_name, contact_email, contact_phone,
                             │ company_name, siret, sector, products[],
                             │ quantity, description, deadline, logo_url
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WF1 — RÉCEPTION DEMANDE DE DEVIS                         │
│                        Webhook n8n (POST)                                   │
│                                                                             │
│  1. Validation des données (contact_name + email requis)                    │
│     └── KO → Réponse 400 au frontend                                        │
│     └── OK → suite                                                          │
│                                                                             │
│  2. Enrichissement SIRET (API Sirene INSEE)                                 │
│     └── Raison sociale, adresse, code APE, forme juridique                 │
│     └── Si SIRET absent/invalide → continuer sans enrichissement            │
│                                                                             │
│  3. INSERT Supabase → table quote_requests                                  │
│     └── Retourne l'ID de la demande créée                                   │
│                                                                             │
│  4. Notification Telegram (chat 1294618163)                                 │
│     └── Résumé : nom, société, produits, quantité, email                    │
│                                                                             │
│  5. Email de confirmation au client                                         │
│     └── "Votre demande a bien été reçue, réponse sous 24h"                  │
│                                                                             │
│  6. Réponse 200 au frontend → affichage succès                              │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │ Déclenchement manuel via Telegram ou interface
                             │ (quote_request_id en paramètre)
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WF2 — GÉNÉRATION DEVIS PDF AUTOMATIQUE                   │
│                        Webhook n8n (POST)                                   │
│                                                                             │
│  1. GET Supabase → quote_requests (récupère la demande complète)            │
│                                                                             │
│  2. Génération numéro devis unique → DEV-{ANNÉE}-{XXXX}                     │
│                                                                             │
│  3. Calcul des prix automatique (grille-tarifaire.json)                     │
│     └── Prix HT/unité × quantité × (1 - remise%)                           │
│     └── Sous-total HT + TVA 8.5% = Total TTC                               │
│                                                                             │
│  4. Génération HTML du devis (template professionnel TenuePro)             │
│                                                                             │
│  5. Conversion HTML → PDF via Gotenberg                                     │
│     └── https://demo.gotenberg.dev/forms/chromium/convert/html              │
│                                                                             │
│  6. Upload PDF → Supabase Storage (bucket "documents")                      │
│     └── Chemin : devis/{quote_number}.pdf                                   │
│                                                                             │
│  7. INSERT Supabase → tables quotes + quote_items                           │
│     └── status = 'draft', pdf_url, total_ht, total_ttc                     │
│                                                                             │
│  8. Notification Telegram avec boutons de validation                        │
│     └── ✅ /valider_{id}  ✏️ /modifier_{id}  ❌ /annuler_{id}               │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │ Validation via Telegram (WF3 déclenché)
                             │ (quote_id + action en paramètre)
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WF3 — ENVOI DEVIS AU CLIENT                              │
│                        Webhook n8n (POST)                                   │
│                                                                             │
│  Si action = "annuler"                                                      │
│     └── PATCH Supabase quotes → status = 'cancelled'                        │
│     └── Stop                                                                │
│                                                                             │
│  Si action = "valider"                                                      │
│     1. GET Supabase → devis complet (quotes + companies + profiles)         │
│     2. PATCH Supabase → status = 'sent'                                     │
│     3. Email client avec PDF en pièce jointe                                │
│        └── Objet : "Votre devis TenuePro n°{quote_number}"                  │
│        └── Corps HTML professionnel + PDF attaché                           │
│     4. INSERT Supabase → activities (type='email', log envoi)               │
│     5. Notification Telegram → "Devis {n°} envoyé à {email}"               │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │ Schedule : tous les jours à 09h00
                             ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WF4 — RELANCE AUTOMATIQUE J+7 / EXPIRATION J+30          │
│                        Schedule Trigger (cron : 0 9 * * *)                  │
│                                                                             │
│  BRANCHE A — Relance J+7                                                    │
│  Condition : status='sent' AND created_at < NOW()-7j AND > NOW()-30j        │
│     1. Pour chaque devis trouvé :                                           │
│        a. Email de relance au client                                        │
│           └── "Avez-vous des questions sur votre devis ?"                   │
│        b. INSERT activities → type='relance', note J+7                      │
│        c. Notification Telegram par devis relancé                           │
│                                                                             │
│  BRANCHE B — Expiration J+30                                                │
│  Condition : status='sent' AND created_at < NOW()-30j                       │
│     1. Pour chaque devis trouvé :                                           │
│        a. PATCH quotes → status = 'expired'                                 │
│        b. Notification Telegram → "Devis {n°} expiré — {société}"          │
└─────────────────────────────────────────────────────────────────────────────┘


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FLUX SIMPLIFIÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Formulaire web
       │
       ▼ HTTP POST
  WF1 Webhook  ──►  Supabase (quote_requests)
       │             │
       ▼             ▼
  Telegram      Email client
  (notif)       (confirmation)
       │
       ▼ (manuel, quote_request_id)
  WF2 Webhook  ──►  Gotenberg (PDF)  ──►  Supabase Storage
       │
       ▼ Telegram (valider / modifier / annuler)
  WF3 Webhook  ──►  Supabase (quotes: status=sent)
       │             │
       ▼             ▼
  Telegram      Email client
  (confirm)     (devis + PDF)
       │
       ▼ Schedule 09h00 quotidien
  WF4 Schedule
       ├──► Relance J+7  →  Email  →  Supabase (activities)  →  Telegram
       └──► Expiration J+30  →  Supabase (status=expired)  →  Telegram


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTILS & SERVICES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Service         Rôle                         Configuration
  ─────────────── ──────────────────────────── ────────────────────────────
  n8n             Orchestration des workflows   Self-hosted ou n8n Cloud
  Supabase        BDD + Storage                 rtrkshbrvyrlrdpkwosv
  Telegram Bot    Notifications + validation    @BotFather → TELEGRAM_BOT_TOKEN
  SMTP            Envoi d'emails                Gmail / OVH / SendGrid
  Gotenberg       HTML → PDF                   demo.gotenberg.dev (ou self-hosted)
  API Sirene      Enrichissement SIRET         api.insee.fr → INSEE_API_KEY
```
