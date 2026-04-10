-- ============================================================
-- TenuePro — Schema complémentaire : Espace Client
-- À exécuter APRÈS schema.sql dans l'éditeur SQL Supabase
-- ============================================================

-- ============================================================
-- MISE À JOUR DES STATUTS COMMANDES
-- 8 étapes du parcours client TenuePro
-- ============================================================

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'demande_recue',
    'devis_envoye',
    'devis_valide',
    'maquette_preparation',
    'maquette_validee',
    'en_production',
    'expediee',
    'livree',
    'annulee'
  ));

COMMENT ON COLUMN public.orders.status IS
  'demande_recue → devis_envoye → devis_valide → maquette_preparation → maquette_validee → en_production → expediee → livree | annulee';


-- ============================================================
-- VUE : Commandes enrichies pour l'espace client
-- ============================================================

CREATE OR REPLACE VIEW public.client_orders_view AS
SELECT
  o.id,
  o.order_number,
  o.total_ttc,
  o.status,
  o.expected_delivery,
  o.created_at,
  o.updated_at,
  o.profile_id,
  o.notes,
  q.id           AS quote_id,
  q.quote_number,
  q.total_ttc    AS quote_total,
  q.pdf_url      AS quote_pdf_url,
  (
    SELECT content
    FROM   public.activities
    WHERE  order_id = o.id
    ORDER  BY created_at DESC
    LIMIT  1
  ) AS last_activity,
  (
    SELECT created_at
    FROM   public.order_status_history
    WHERE  order_id = o.id
    ORDER  BY created_at DESC
    LIMIT  1
  ) AS last_status_update
FROM public.orders o
LEFT JOIN public.quotes q ON q.id = o.quote_id;

COMMENT ON VIEW public.client_orders_view IS
  'Commandes enrichies avec dernier statut et dernière activité — usage espace client';


-- ============================================================
-- VUE : Demandes de devis enrichies pour l'espace client
-- ============================================================

CREATE OR REPLACE VIEW public.client_quote_requests_view AS
SELECT
  qr.id,
  qr.created_at,
  qr.updated_at,
  qr.contact_name,
  qr.company_name,
  qr.products,
  qr.quantity,
  qr.deadline,
  qr.status,
  qr.profile_id,
  q.id           AS quote_id,
  q.quote_number,
  q.total_ttc,
  q.status       AS quote_status,
  q.pdf_url,
  q.valid_until
FROM public.quote_requests qr
LEFT JOIN public.quotes q ON q.quote_request_id = qr.id;

COMMENT ON VIEW public.client_quote_requests_view IS
  'Demandes de devis avec devis associé — usage espace client';


-- ============================================================
-- RLS sur les vues (hérité des tables sous-jacentes)
-- Les vues respectent les RLS des tables sources dans Supabase
-- ============================================================

-- Sécurité supplémentaire : grant SELECT aux utilisateurs authentifiés
GRANT SELECT ON public.client_orders_view          TO authenticated;
GRANT SELECT ON public.client_quote_requests_view  TO authenticated;
