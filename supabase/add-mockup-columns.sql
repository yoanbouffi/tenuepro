-- ─────────────────────────────────────────────────────────────────────────────
-- Migration : Ajout des colonnes logo et maquettes dans quote_requests
-- À exécuter dans : Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Colonnes logo
ALTER TABLE quote_requests
  ADD COLUMN IF NOT EXISTS logo_url        TEXT,
  ADD COLUMN IF NOT EXISTS logo_public_id  TEXT;

-- 2. Colonne maquettes (tableau JSON de { product_id, product, mockup_url })
ALTER TABLE quote_requests
  ADD COLUMN IF NOT EXISTS mockup_urls     JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 3. Index pour filtrer rapidement les demandes avec logo ou maquettes
CREATE INDEX IF NOT EXISTS idx_quote_requests_has_logo
  ON quote_requests (logo_public_id)
  WHERE logo_public_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_quote_requests_has_mockups
  ON quote_requests USING GIN (mockup_urls)
  WHERE mockup_urls != '[]'::jsonb;

-- ─────────────────────────────────────────────────────────────────────────────
-- Vérification post-migration
-- ─────────────────────────────────────────────────────────────────────────────
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'quote_requests'
--   AND column_name IN ('logo_url', 'logo_public_id', 'mockup_urls');
