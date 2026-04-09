# TenuePro — Guide des workflows n8n

## Import rapide

1. Ouvre ton instance n8n
2. **Workflows → Import from file**
3. Importer chaque fichier JSON dans l'ordre : WF1 → WF2 → WF3 → WF4
4. Sur chaque workflow importé, reconfigurer les credentials (Telegram, SMTP)
5. Activer WF4 (schedule) et WF1 (webhook)
6. Copier l'URL du webhook WF1 → mettre dans `.env.local` → `VITE_N8N_WEBHOOK_URL`

---

## Les 4 workflows

### WF1 — Réception Demande de Devis
**Fichier :** `WF1-reception-demande.json`
**Déclencheur :** Webhook POST `/webhook/tenuepro-devis`
**Appelé par :** Formulaire React (src/lib/webhook.js)

| Nœud | Type | Action |
|------|------|--------|
| Webhook Reception | Webhook | Point d'entrée HTTP POST |
| Valider les données | Code | Vérifie contact_name + email |
| Données valides ? | If | Branch OK/KO |
| Enrichissement SIRET | HTTP Request | API Sirene INSEE |
| Insérer dans Supabase | HTTP Request | POST → quote_requests |
| Notification Telegram | Telegram | Alerte équipe TenuePro |
| Email confirmation client | Send Email | Mail accusé réception |
| Réponse succès / erreur | Respond to Webhook | Retour au frontend |

---

### WF2 — Génération Devis PDF Automatique
**Fichier :** `WF2-generation-devis.json`
**Déclencheur :** Webhook POST `/webhook/tenuepro-generer-devis`
**Appelé par :** Manuellement ou depuis dashboard

| Nœud | Type | Action |
|------|------|--------|
| Webhook | Webhook | Reçoit quote_request_id |
| Récupérer demande | HTTP Request | GET Supabase quote_requests |
| Numéro de devis | Code | Génère DEV-YYYY-XXXX |
| Calcul des prix | Code | Grille tarifaire + TVA 8.5% |
| Génération HTML | Code | Template HTML professionnel |
| Conversion PDF | HTTP Request | Gotenberg HTML→PDF |
| Upload Supabase Storage | HTTP Request | PUT bucket documents |
| Créer devis | HTTP Request | POST Supabase quotes |
| Créer lignes devis | HTTP Request | POST Supabase quote_items |
| Validation Telegram | Telegram | Boutons valider/modifier/annuler |

---

### WF3 — Envoi Devis au Client
**Fichier :** `WF3-envoi-devis.json`
**Déclencheur :** Webhook POST `/webhook/tenuepro-envoyer-devis`
**Appelé par :** Validation Telegram (commande /valider_xxx)

| Nœud | Type | Action |
|------|------|--------|
| Webhook | Webhook | Reçoit quote_id + action |
| Action = annuler ? | If | Branch annuler/valider |
| Annuler le devis | HTTP Request | PATCH quotes status=cancelled |
| Récupérer devis | HTTP Request | GET quotes + relations |
| Mettre à jour statut | HTTP Request | PATCH quotes status=sent |
| Envoyer email client | Send Email | Mail avec PDF en pièce jointe |
| Enregistrer activité | HTTP Request | POST Supabase activities |
| Confirmation Telegram | Telegram | Alerte envoi effectué |

---

### WF4 — Relance Automatique
**Fichier :** `WF4-relance-devis.json`
**Déclencheur :** Schedule — tous les jours à 09h00 (cron : `0 9 * * *`)
**Appelé par :** Automatiquement

| Nœud | Type | Action |
|------|------|--------|
| Schedule 9h | Schedule Trigger | Déclenche chaque matin |
| Devis à relancer | HTTP Request | GET quotes sent 7j<x<30j |
| Loop relance | Split In Batches | Itère sur chaque devis |
| Email relance J+7 | Send Email | Mail relance personnalisé |
| Log relance | HTTP Request | POST activities type=relance |
| Telegram relance | Telegram | Notif par devis relancé |
| Devis expirés | HTTP Request | GET quotes sent >30j |
| Loop expiration | Split In Batches | Itère sur chaque devis expiré |
| Marquer expiré | HTTP Request | PATCH quotes status=expired |
| Telegram expiré | Telegram | Notif expiration |

---

## Connexions entre workflows

```
Formulaire React
    │  HTTP POST
    ▼
WF1 Webhook  ──── Supabase (quote_requests INSERT)
    │
    ▼ (déclenchement manuel avec quote_request_id)
WF2 Webhook  ──── Supabase (quotes + quote_items INSERT)
    │                      │
    │                      ▼ Supabase Storage
    ▼ Telegram             (PDF upload)
Validation manuelle
    │  HTTP POST (quote_id + action)
    ▼
WF3 Webhook  ──── Supabase (quotes UPDATE + activities INSERT)
    │
    ▼ Email client (PDF attaché)

WF4 Schedule ──── Supabase (quotes SELECT)
    │
    ├── J+7 : Email relance → activities INSERT → Telegram
    └── J+30: quotes UPDATE (expired) → Telegram
```

---

## Notes importantes

- **Credentials** : après import, chaque nœud Telegram et Email affiche une erreur de credential — c'est normal. Réassigner les credentials créés dans Settings.
- **Webhook URL** : activez le workflow pour obtenir l'URL définitive (Test URL ≠ Production URL).
- **Gotenberg** : l'instance de démo est limitée en production. Déployer en local avec Docker.
- **SIRET** : l'enrichissement INSEE est en `continueOnFail: true` — si le SIRET est absent ou invalide, le workflow continue sans planter.
