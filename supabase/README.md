# TenuePro — Base de données Supabase

Ce dossier contient le schéma SQL complet pour le CRM TenuePro.

---

## Déploiement rapide

1. Ouvre ton projet sur [supabase.com](https://supabase.com)
2. Va dans **SQL Editor** → **New query**
3. Colle le contenu de `schema.sql` et clique **Run**

C'est tout. Les tables, RLS, index et triggers sont créés en une seule exécution.

---

## Structure des tables

```
auth.users (Supabase natif)
    │
    └── profiles           ← profil étendu (role : client | admin)
            │
            └── companies  ← société cliente
                    │
                    ├── quote_requests   ← demandes entrantes (formulaire web)
                    │       │
                    │       └── quotes   ← devis générés
                    │               │
                    │               ├── quote_items          ← lignes de devis
                    │               └── orders               ← commandes confirmées
                    │                       │
                    │                       ├── order_status_history  ← historique statuts
                    │                       ├── invoices              ← factures
                    │                       └── documents             ← PDFs, maquettes, logos
                    │
                    └── activities       ← journal CRM (notes, appels, emails...)
```

---

## Détail des tables

| Table | Description | Statuts possibles |
|---|---|---|
| `profiles` | Compte utilisateur lié à auth.users | `client` / `admin` |
| `companies` | Sociétés clientes | — |
| `quote_requests` | Demandes entrantes du formulaire web | `new` → `processing` → `quoted` → `closed` |
| `quotes` | Devis émis par TenuePro | `draft` → `sent` → `accepted` / `refused` / `expired` |
| `quote_items` | Lignes de produits dans un devis | — |
| `orders` | Commandes confirmées | `confirmed` → `in_production` → `shipped` → `delivered` / `cancelled` |
| `order_status_history` | Historique auto des changements de statut | — |
| `invoices` | Factures | `unpaid` → `paid` / `overdue` / `cancelled` |
| `documents` | Fichiers (PDFs, logos, BAT, maquettes) | `pending` → `approved` / `rejected` |
| `activities` | Journal CRM | `note` / `email` / `call` / `status_change` / `relance` / `system` |

---

## RLS — Qui voit quoi

| Rôle | Accès |
|---|---|
| **Admin** | Lecture et écriture complète sur toutes les tables |
| **Client authentifié** | Lecture uniquement de ses propres devis, commandes, factures et documents |
| **Visiteur (non auth)** | Peut uniquement **insérer** une `quote_request` (formulaire public) |

La fonction `public.is_admin()` est utilisée dans toutes les policies admin pour éviter les boucles récursives.

---

## Triggers automatiques

| Trigger | Table | Action |
|---|---|---|
| `on_auth_user_created` | `auth.users` | Crée un profil à chaque inscription |
| `set_updated_at_*` | Toutes les tables concernées | Met à jour `updated_at` à chaque modification |
| `on_order_status_change` | `orders` | Enregistre chaque changement de statut dans `order_status_history` |
| `on_quote_created_update_request` | `quotes` | Passe la `quote_request` à `quoted` dès qu'un devis est créé |
| `on_quote_created_log_activity` | `quotes` | Ajoute une entrée système dans `activities` à la création du devis |

---

## Notes spécifiques La Réunion

- `tax_rate` sur les devis est à **8,5 %** par défaut (TVA taux réduit DOM)
- `quote_number` et `order_number` sont des champs `TEXT UNIQUE` — à générer côté application (ex : `DEV-2026-0001`)

---

## Variables d'environnement à configurer

Après déploiement du schéma, ajoute dans `.env.local` du frontend :

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

Ces variables sont utilisées par le client Supabase JS (`@supabase/supabase-js`).

---

## Storage buckets recommandés

À créer manuellement dans Supabase → Storage :

| Bucket | Usage | Accès |
|---|---|---|
| `logos` | Logos clients uploadés via formulaire | Public (lecture) |
| `documents` | PDFs devis, factures, BAT | Privé (auth uniquement) |
| `mockups` | Maquettes de broderie/flocage | Privé (auth uniquement) |
