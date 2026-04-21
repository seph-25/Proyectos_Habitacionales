-- ============================================================
-- SETUP DE USUARIOS — Roles y corrección de historial
-- IMPORTANTE: Ejecutar DESPUÉS de crear los 5 usuarios
--             en Supabase → Authentication → Users
-- ============================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────
-- 1. Actualizar perfiles con nombres correctos y roles
--    (el trigger los crea con nombre derivado del email y rol
--     por defecto "Agente de Ventas" — esto los corrige)
-- ─────────────────────────────────────────────────────────────
UPDATE public.profiles p
SET
  full_name = vals.full_name,
  role      = vals.role
FROM (
  VALUES
    ('fabianvargas@habita.com',    'Fabián Vargas',   'Administrador'),
    ('britanntromero@habita.com',  'Brittany Romero', 'Agente de Ventas'),
    ('danielsalas@habita.com',     'Daniel Salas',    'Administrador'),
    ('josephsalas@habita.com',     'Joseph Salas',    'Agente de Ventas'),
    ('marvincampos@habita.com',    'Marvin Campos',   'Gerente Comercial')
) AS vals(email, full_name, role)
JOIN auth.users au ON au.email = vals.email
WHERE p.id = au.id;

-- ─────────────────────────────────────────────────────────────
-- 2. Corregir registros históricos en status_history
--    (normalizar nombres con/sin tilde y capitalización)
-- ─────────────────────────────────────────────────────────────
UPDATE public.status_history
SET changed_by = 'Fabián Vargas'
WHERE changed_by ILIKE 'fabian vargas'
   OR changed_by = 'Fabián Vargas';

UPDATE public.status_history
SET changed_by = 'Daniel Salas'
WHERE changed_by ILIKE 'daniel salas';

COMMIT;
