# TenuePro — Variables d'environnement n8n

Configurer dans n8n : **Settings → Variables** (ou fichier `.env` si self-hosted).

---

## Supabase

```
SUPABASE_URL         = https://rtrkshbrvyrlrdpkwosv.supabase.co
SUPABASE_SERVICE_KEY = <clé service_role>
```

> **Où trouver SUPABASE_SERVICE_KEY ?**
> Dashboard Supabase → Settings → API → **service_role** (secret key)
> ⚠️ Ne jamais exposer côté frontend — usage backend uniquement.

---

## Telegram

```
TELEGRAM_BOT_TOKEN   = <token du bot>
TELEGRAM_CHAT_ID     = 1294618163
```

> **Créer le bot :**
> 1. Ouvrir Telegram → chercher `@BotFather`
> 2. `/newbot` → choisir un nom → récupérer le token
> 3. Récupérer le `chat_id` via : `https://api.telegram.org/bot<TOKEN>/getUpdates`
>
> **Dans n8n :** Ajouter une credential **Telegram API** avec le token.

---

## Email / SMTP

```
SMTP_HOST            = smtp.gmail.com
SMTP_PORT            = 587
SMTP_USER            = contact@tenuepro.re
SMTP_PASS            = <app password>
SMTP_FROM_NAME       = TenuePro
```

> **Gmail :** Activer la validation 2 étapes → générer un **App Password** (16 caractères).
> **OVH :** Utiliser les identifiants de l'adresse email directement.
>
> **Dans n8n :** Ajouter une credential **SMTP**.

---

## Gotenberg (HTML → PDF)

```
GOTENBERG_URL        = https://demo.gotenberg.dev
```

> **En production**, déployer en self-hosted :
> ```bash
> docker run --rm -p 3001:3000 gotenberg/gotenberg:8
> ```
> Puis : `GOTENBERG_URL = http://localhost:3001`

---

## API Sirene INSEE (enrichissement SIRET)

```
INSEE_API_KEY        = <clé API Sirene>
```

> **Obtenir la clé :** https://api.insee.fr → Souscrire à l'API **Sirene V3**
> Quota gratuit : 30 req/min.

---

## TenuePro (constantes métier)

```
TENUEPRO_PHONE       = 0692 10 52 17
TENUEPRO_EMAIL       = contact@tenuepro.re
TENUEPRO_LOGO_URL    = https://tenuepro.re/logo.png
TENUEPRO_SITE_URL    = https://tenuepro.re
```

---

## Frontend React (fichier .env.local)

```
VITE_N8N_WEBHOOK_URL = https://<instance-n8n>/webhook/tenuepro-devis
```

> À renseigner après activation de WF1. L'URL exacte s'affiche dans le nœud Webhook.

---

## Credentials n8n à créer

| Nom credential      | Type n8n      | Utilisé dans       |
|---------------------|---------------|--------------------|
| Telegram TenuePro   | Telegram API  | WF1, WF2, WF3, WF4 |
| SMTP TenuePro       | SMTP          | WF1, WF3, WF4      |
| INSEE Sirene        | Header Auth   | WF1                |
