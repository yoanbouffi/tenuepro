-- ============================================================
-- TenuePro — schema-fixes.sql
-- Correctifs et ajouts à appliquer après schema.sql
-- et schema-espace-client.sql
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. Table invoices (si absente du schema principal)
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.invoices (
  id             uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text          NOT NULL UNIQUE,
  order_id       uuid          REFERENCES public.orders(id) ON DELETE SET NULL,
  status         text          NOT NULL DEFAULT 'draft'
                               CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  total_ht       numeric(10,2) NOT NULL DEFAULT 0,
  total_ttc      numeric(10,2) NOT NULL DEFAULT 0,
  pdf_url        text,
  due_date       date,
  created_at     timestamptz   NOT NULL DEFAULT now(),
  updated_at     timestamptz   NOT NULL DEFAULT now()
);

-- RLS sur invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Admin : accès total
CREATE POLICY IF NOT EXISTS "admin_invoices_all"
  ON public.invoices
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Client : voir seulement ses propres factures (via orders → profile_id)
CREATE POLICY IF NOT EXISTS "client_invoices_select"
  ON public.invoices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = invoices.order_id
        AND orders.profile_id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────────────────────
-- 2. Colonne profile_id dans orders (si absente)
-- ──────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'profile_id'
  ) THEN
    ALTER TABLE public.orders
      ADD COLUMN profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ──────────────────────────────────────────────────────────────
-- 3. Colonne profile_id dans quote_requests (si absente)
-- ──────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_requests' AND column_name = 'profile_id'
  ) THEN
    ALTER TABLE public.quote_requests
      ADD COLUMN profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ──────────────────────────────────────────────────────────────
-- 4. Vue : client_invoices_view
--    Jointure invoices → orders → profiles pour l'espace client
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW public.client_invoices_view AS
SELECT
  i.id,
  i.invoice_number,
  i.status,
  i.total_ht,
  i.total_ttc,
  i.pdf_url,
  i.due_date,
  i.created_at,
  o.id            AS order_id,
  o.order_number,
  o.profile_id,
  p.email         AS client_email,
  p.first_name    AS client_first_name,
  p.last_name     AS client_last_name
FROM public.invoices i
LEFT JOIN public.orders  o ON o.id = i.order_id
LEFT JOIN public.profiles p ON p.id = o.profile_id;

-- Accès SELECT à la vue pour les utilisateurs authentifiés
GRANT SELECT ON public.client_invoices_view TO authenticated;

-- ──────────────────────────────────────────────────────────────
-- 5. Index de performance
-- ──────────────────────────────────────────────────────────────

-- Accès rapide aux demandes par client
CREATE INDEX IF NOT EXISTS idx_quote_requests_profile_id
  ON public.quote_requests(profile_id);

-- Accès rapide aux commandes par client
CREATE INDEX IF NOT EXISTS idx_orders_profile_id
  ON public.orders(profile_id);

-- Accès rapide aux factures par commande
CREATE INDEX IF NOT EXISTS idx_invoices_order_id
  ON public.invoices(order_id);

-- Accès rapide aux factures par statut (pour le dashboard admin)
CREATE INDEX IF NOT EXISTS idx_invoices_status
  ON public.invoices(status);

-- Accès rapide aux devis par statut + date (auto-expiration)
CREATE INDEX IF NOT EXISTS idx_quotes_status_created
  ON public.quotes(status, created_at);

-- Accès rapide aux commandes par statut (stats)
CREATE INDEX IF NOT EXISTS idx_orders_status
  ON public.orders(status);

-- ──────────────────────────────────────────────────────────────
-- 6. Trigger updated_at sur invoices
-- ──────────────────────────────────────────────────────────────

-- Réutilise la fonction set_updated_at() créée dans schema.sql
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at') THEN
    DROP TRIGGER IF EXISTS invoices_updated_at ON public.invoices;
    CREATE TRIGGER invoices_updated_at
      BEFORE UPDATE ON public.invoices
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

-- ──────────────────────────────────────────────────────────────
-- 7. Contrainte de validité sur quote_requests.status
-- ──────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'quote_requests'
      AND constraint_name = 'quote_requests_status_check'
  ) THEN
    ALTER TABLE public.quote_requests
      ADD CONSTRAINT quote_requests_status_check
      CHECK (status IN ('new', 'processing', 'quoted', 'closed'));
  END IF;
END $$;
