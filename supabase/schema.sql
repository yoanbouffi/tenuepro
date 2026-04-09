-- ============================================================
-- TenuePro — Schema Supabase
-- Version : 1.0.0
-- Dernière mise à jour : 2026-01-01
-- Description : CRM complet pour TenuePro (marquage textile)
--   Tables, relations, RLS policies, triggers
-- ============================================================


-- ============================================================
-- EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- 1. PROFILES
-- Comptes clients liés à Supabase Auth (auth.users)
-- Créé automatiquement via trigger on_auth_user_created
-- ============================================================

CREATE TABLE public.profiles (
  id          UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT        NOT NULL,
  first_name  TEXT,
  last_name   TEXT,
  phone       TEXT,
  role        TEXT        NOT NULL DEFAULT 'client'
                          CHECK (role IN ('client', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.profiles              IS 'Profils utilisateurs liés à Supabase Auth';
COMMENT ON COLUMN public.profiles.role         IS 'client | admin';


-- ============================================================
-- 2. COMPANIES
-- Sociétés clientes (peut être liée à un profil auth ou non)
-- ============================================================

CREATE TABLE public.companies (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id    UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  name          TEXT        NOT NULL,
  siret         TEXT        UNIQUE,
  legal_name    TEXT,
  address       TEXT,
  city          TEXT,
  postal_code   TEXT,
  phone         TEXT,
  email         TEXT,
  contact_name  TEXT,
  sector        TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.companies IS 'Sociétés clientes de TenuePro';


-- ============================================================
-- 3. QUOTE_REQUESTS
-- Demandes de devis entrantes (via formulaire site web)
-- ============================================================

CREATE TABLE public.quote_requests (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id      UUID        REFERENCES public.companies(id)  ON DELETE SET NULL,
  profile_id      UUID        REFERENCES public.profiles(id)   ON DELETE SET NULL,
  contact_name    TEXT        NOT NULL,
  contact_email   TEXT        NOT NULL,
  contact_phone   TEXT,
  company_name    TEXT,
  siret           TEXT,
  sector          TEXT,
  products        TEXT[]      NOT NULL,
  quantity        INT,
  description     TEXT,
  deadline        TEXT,
  logo_url        TEXT,
  status          TEXT        NOT NULL DEFAULT 'new'
                              CHECK (status IN ('new', 'processing', 'quoted', 'closed')),
  source          TEXT        NOT NULL DEFAULT 'website',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.quote_requests          IS 'Demandes de devis entrantes via formulaire';
COMMENT ON COLUMN public.quote_requests.status   IS 'new | processing | quoted | closed';
COMMENT ON COLUMN public.quote_requests.products IS 'Tableau des types de produits souhaités';


-- ============================================================
-- 4. QUOTES
-- Devis générés par l'équipe TenuePro
-- ============================================================

CREATE TABLE public.quotes (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_request_id  UUID        REFERENCES public.quote_requests(id) ON DELETE SET NULL,
  company_id        UUID        REFERENCES public.companies(id)      ON DELETE SET NULL,
  profile_id        UUID        REFERENCES public.profiles(id)       ON DELETE SET NULL,
  quote_number      TEXT        NOT NULL UNIQUE,
  total_ht          NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_ttc         NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_rate          NUMERIC(5,2)  NOT NULL DEFAULT 8.5,
  status            TEXT        NOT NULL DEFAULT 'draft'
                                CHECK (status IN ('draft', 'sent', 'accepted', 'refused', 'expired')),
  valid_until       DATE,
  notes             TEXT,
  pdf_url           TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.quotes            IS 'Devis émis par TenuePro';
COMMENT ON COLUMN public.quotes.tax_rate   IS 'TVA applicable en % (8.5% à La Réunion par défaut)';
COMMENT ON COLUMN public.quotes.status     IS 'draft | sent | accepted | refused | expired';


-- ============================================================
-- 5. QUOTE_ITEMS
-- Lignes de devis (produits, quantités, prix unitaires)
-- ============================================================

CREATE TABLE public.quote_items (
  id           UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id     UUID          NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  product      TEXT          NOT NULL,
  description  TEXT,
  quantity     INT           NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price   NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount     NUMERIC(5,2)  NOT NULL DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
  total        NUMERIC(10,2) GENERATED ALWAYS AS
                 (ROUND(quantity * unit_price * (1 - discount / 100), 2)) STORED,
  position     INT           NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.quote_items          IS 'Lignes de produits dans un devis';
COMMENT ON COLUMN public.quote_items.discount IS 'Remise en pourcentage (0-100)';
COMMENT ON COLUMN public.quote_items.total    IS 'Calculé automatiquement : qté × prix × (1 - remise%)';


-- ============================================================
-- 6. ORDERS
-- Commandes confirmées (déclenchées après acceptation du devis)
-- ============================================================

CREATE TABLE public.orders (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id          UUID        REFERENCES public.quotes(id)   ON DELETE SET NULL,
  company_id        UUID        REFERENCES public.companies(id) ON DELETE SET NULL,
  profile_id        UUID        REFERENCES public.profiles(id)  ON DELETE SET NULL,
  order_number      TEXT        NOT NULL UNIQUE,
  total_ht          NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_ttc         NUMERIC(10,2) NOT NULL DEFAULT 0,
  status            TEXT        NOT NULL DEFAULT 'confirmed'
                                CHECK (status IN (
                                  'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled'
                                )),
  expected_delivery DATE,
  tracking_number   TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.orders          IS 'Commandes confirmées après acceptation du devis';
COMMENT ON COLUMN public.orders.status   IS 'confirmed | in_production | shipped | delivered | cancelled';


-- ============================================================
-- 7. ORDER_STATUS_HISTORY
-- Historique automatique des changements de statut de commande
-- ============================================================

CREATE TABLE public.order_status_history (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id    UUID        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status      TEXT        NOT NULL,
  note        TEXT,
  created_by  UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.order_status_history IS 'Historique des changements de statut de commande';


-- ============================================================
-- 8. INVOICES
-- Factures émises
-- ============================================================

CREATE TABLE public.invoices (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id        UUID          REFERENCES public.orders(id)    ON DELETE SET NULL,
  company_id      UUID          REFERENCES public.companies(id) ON DELETE SET NULL,
  invoice_number  TEXT          NOT NULL UNIQUE,
  total_ht        NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_ttc       NUMERIC(10,2) NOT NULL DEFAULT 0,
  status          TEXT          NOT NULL DEFAULT 'unpaid'
                                CHECK (status IN ('unpaid', 'paid', 'overdue', 'cancelled')),
  due_date        DATE,
  paid_at         TIMESTAMPTZ,
  pdf_url         TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.invoices          IS 'Factures émises par TenuePro';
COMMENT ON COLUMN public.invoices.status   IS 'unpaid | paid | overdue | cancelled';


-- ============================================================
-- 9. DOCUMENTS
-- Fichiers liés : PDFs, maquettes, BAT, logos clients
-- ============================================================

CREATE TABLE public.documents (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id   UUID        REFERENCES public.companies(id) ON DELETE SET NULL,
  order_id     UUID        REFERENCES public.orders(id)   ON DELETE SET NULL,
  quote_id     UUID        REFERENCES public.quotes(id)   ON DELETE SET NULL,
  name         TEXT        NOT NULL,
  type         TEXT        NOT NULL
                           CHECK (type IN ('quote_pdf', 'invoice_pdf', 'mockup', 'bat', 'logo', 'other')),
  storage_url  TEXT        NOT NULL,
  version      INT         NOT NULL DEFAULT 1 CHECK (version > 0),
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'approved', 'rejected')),
  uploaded_by  UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.documents         IS 'Documents liés aux commandes, devis ou sociétés';
COMMENT ON COLUMN public.documents.type    IS 'quote_pdf | invoice_pdf | mockup | bat | logo | other';
COMMENT ON COLUMN public.documents.status  IS 'pending | approved | rejected (pour les BAT/maquettes)';


-- ============================================================
-- 10. ACTIVITIES
-- Journal d'activité : notes, emails, appels, changements
-- ============================================================

CREATE TABLE public.activities (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id        UUID        REFERENCES public.companies(id)      ON DELETE SET NULL,
  order_id          UUID        REFERENCES public.orders(id)         ON DELETE SET NULL,
  quote_id          UUID        REFERENCES public.quotes(id)         ON DELETE SET NULL,
  quote_request_id  UUID        REFERENCES public.quote_requests(id) ON DELETE SET NULL,
  type              TEXT        NOT NULL
                                CHECK (type IN ('note', 'email', 'status_change', 'call', 'relance', 'system')),
  content           TEXT        NOT NULL,
  created_by        UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.activities       IS 'Journal d''activité du CRM (notes, emails, changements)';
COMMENT ON COLUMN public.activities.type  IS 'note | email | status_change | call | relance | system';


-- ============================================================
-- INDEX
-- Pour accélérer les requêtes les plus fréquentes
-- ============================================================

CREATE INDEX idx_companies_profile_id         ON public.companies(profile_id);
CREATE INDEX idx_quote_requests_company_id    ON public.quote_requests(company_id);
CREATE INDEX idx_quote_requests_status        ON public.quote_requests(status);
CREATE INDEX idx_quotes_company_id            ON public.quotes(company_id);
CREATE INDEX idx_quotes_status                ON public.quotes(status);
CREATE INDEX idx_quote_items_quote_id         ON public.quote_items(quote_id);
CREATE INDEX idx_orders_company_id            ON public.orders(company_id);
CREATE INDEX idx_orders_status                ON public.orders(status);
CREATE INDEX idx_order_status_history_order   ON public.order_status_history(order_id);
CREATE INDEX idx_invoices_order_id            ON public.invoices(order_id);
CREATE INDEX idx_invoices_status              ON public.invoices(status);
CREATE INDEX idx_documents_company_id         ON public.documents(company_id);
CREATE INDEX idx_documents_order_id           ON public.documents(order_id);
CREATE INDEX idx_activities_company_id        ON public.activities(company_id);
CREATE INDEX idx_activities_order_id          ON public.activities(order_id);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities           ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------
-- Fonction utilitaire : vérifie si l'utilisateur courant est admin
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ------------------------------------------------------------
-- PROFILES
-- ------------------------------------------------------------

-- Admin : accès total
CREATE POLICY "admin_all_profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- Client : lecture de son propre profil
CREATE POLICY "client_select_own_profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Client : mise à jour de son propre profil (sauf role)
CREATE POLICY "client_update_own_profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'client');


-- ------------------------------------------------------------
-- COMPANIES
-- ------------------------------------------------------------

CREATE POLICY "admin_all_companies"
  ON public.companies FOR ALL
  USING (public.is_admin());

CREATE POLICY "client_select_own_company"
  ON public.companies FOR SELECT
  USING (auth.uid() = profile_id);


-- ------------------------------------------------------------
-- QUOTE_REQUESTS
-- ------------------------------------------------------------

CREATE POLICY "admin_all_quote_requests"
  ON public.quote_requests FOR ALL
  USING (public.is_admin());

-- Visiteur non authentifié : peut insérer (formulaire public)
CREATE POLICY "public_insert_quote_request"
  ON public.quote_requests FOR INSERT
  WITH CHECK (true);

-- Client authentifié : voit ses propres demandes
CREATE POLICY "client_select_own_quote_requests"
  ON public.quote_requests FOR SELECT
  USING (auth.uid() = profile_id);


-- ------------------------------------------------------------
-- QUOTES
-- ------------------------------------------------------------

CREATE POLICY "admin_all_quotes"
  ON public.quotes FOR ALL
  USING (public.is_admin());

CREATE POLICY "client_select_own_quotes"
  ON public.quotes FOR SELECT
  USING (auth.uid() = profile_id);


-- ------------------------------------------------------------
-- QUOTE_ITEMS
-- ------------------------------------------------------------

CREATE POLICY "admin_all_quote_items"
  ON public.quote_items FOR ALL
  USING (public.is_admin());

CREATE POLICY "client_select_own_quote_items"
  ON public.quote_items FOR SELECT
  USING (
    auth.uid() IN (
      SELECT profile_id FROM public.quotes WHERE id = quote_items.quote_id
    )
  );


-- ------------------------------------------------------------
-- ORDERS
-- ------------------------------------------------------------

CREATE POLICY "admin_all_orders"
  ON public.orders FOR ALL
  USING (public.is_admin());

CREATE POLICY "client_select_own_orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = profile_id);


-- ------------------------------------------------------------
-- ORDER_STATUS_HISTORY
-- ------------------------------------------------------------

CREATE POLICY "admin_all_order_status_history"
  ON public.order_status_history FOR ALL
  USING (public.is_admin());

CREATE POLICY "client_select_own_order_status_history"
  ON public.order_status_history FOR SELECT
  USING (
    auth.uid() IN (
      SELECT profile_id FROM public.orders WHERE id = order_status_history.order_id
    )
  );


-- ------------------------------------------------------------
-- INVOICES
-- ------------------------------------------------------------

CREATE POLICY "admin_all_invoices"
  ON public.invoices FOR ALL
  USING (public.is_admin());

CREATE POLICY "client_select_own_invoices"
  ON public.invoices FOR SELECT
  USING (
    auth.uid() IN (
      SELECT profile_id FROM public.orders WHERE id = invoices.order_id
    )
  );


-- ------------------------------------------------------------
-- DOCUMENTS
-- ------------------------------------------------------------

CREATE POLICY "admin_all_documents"
  ON public.documents FOR ALL
  USING (public.is_admin());

CREATE POLICY "client_select_own_documents"
  ON public.documents FOR SELECT
  USING (
    auth.uid() IN (
      SELECT profile_id FROM public.orders WHERE id = documents.order_id
    )
  );


-- ------------------------------------------------------------
-- ACTIVITIES
-- ------------------------------------------------------------

CREATE POLICY "admin_all_activities"
  ON public.activities FOR ALL
  USING (public.is_admin());

-- Les clients ne voient pas le journal interne


-- ============================================================
-- FONCTIONS & TRIGGERS
-- ============================================================

-- ------------------------------------------------------------
-- Trigger 1 : Créer un profil automatiquement à l'inscription
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ------------------------------------------------------------
-- Trigger 2 : Mettre à jour updated_at automatiquement
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_companies
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_quote_requests
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_quotes
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_orders
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_invoices
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ------------------------------------------------------------
-- Trigger 3 : Enregistrer l'historique des statuts de commande
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.log_order_status()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_status_history (order_id, status, note, created_by)
    VALUES (
      NEW.id,
      NEW.status,
      'Changement automatique : ' || COALESCE(OLD.status, '—') || ' → ' || NEW.status,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_order_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.log_order_status();


-- ------------------------------------------------------------
-- Trigger 4 : Passer le statut de la quote_request à 'quoted'
--             automatiquement quand un devis est créé
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.mark_quote_request_as_quoted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quote_request_id IS NOT NULL THEN
    UPDATE public.quote_requests
    SET status = 'quoted'
    WHERE id = NEW.quote_request_id
      AND status NOT IN ('quoted', 'closed');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_quote_created_update_request
  AFTER INSERT ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.mark_quote_request_as_quoted();


-- ------------------------------------------------------------
-- Trigger 5 : Ajouter une activité système lors d'un nouveau
--             devis (traçabilité)
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.log_quote_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.activities (company_id, quote_id, type, content, created_by)
  VALUES (
    NEW.company_id,
    NEW.id,
    'system',
    'Devis ' || NEW.quote_number || ' créé (statut : ' || NEW.status || ')',
    auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_quote_created_log_activity
  AFTER INSERT ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.log_quote_activity();


-- ============================================================
-- FIN DU SCHEMA
-- ============================================================
