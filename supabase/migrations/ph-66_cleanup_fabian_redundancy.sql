-- PH-66: Cleanup redundant tables and columns from Fabián's implementation
-- Removes prospecto_status_history table and fecha_cierre/razon_descarte from prospectos
-- These are redundant - oportunidades already has its own historial and the correct columns

BEGIN;

DROP FUNCTION IF EXISTS public.close_prospecto;
DROP FUNCTION IF EXISTS public.advance_prospecto_stage;

-- Drop the redundant prospecto_status_history table (oportunidades_historial is the correct one)
DROP TABLE IF EXISTS public.prospecto_status_history;

-- Drop the redundant columns that Fabián added to prospectos (these exist in oportunidades)
ALTER TABLE public.prospectos DROP COLUMN IF EXISTS fecha_cierre;
ALTER TABLE public.prospectos DROP COLUMN IF EXISTS razon_descarte;

-- Drop the close_prospecto function if it exists (uses the wrong table)
DROP FUNCTION IF EXISTS public.close_prospecto(UUID, TEXT, TEXT, TEXT);

COMMIT;