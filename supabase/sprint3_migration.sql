-- ============================================================
-- SPRINT 3 MIGRATION — Autenticación, Roles, Prospectos, Citas
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Envuelto en transacción: si algo falla, TODO se revierte.
-- ============================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────
-- 1. TABLA: profiles  (roles de usuario)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role      text NOT NULL DEFAULT 'Agente de Ventas'
              CHECK (role IN ('Administrador', 'Agente de Ventas', 'Gerente Comercial')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Cada usuario ve y edita su propio perfil
CREATE POLICY "Perfil propio lectura"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Perfil propio escritura"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins y gerentes ven todos los perfiles
CREATE POLICY "Admin/Gerente ven todos"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('Administrador', 'Gerente Comercial')
    )
  );

-- Función + trigger: crear perfil automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Agente de Ventas')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─────────────────────────────────────────────────────────────
-- 2. TABLA: prospectos
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.prospectos (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Datos personales
  nombre     text NOT NULL,
  apellidos  text NOT NULL,
  correo     text,
  telefono   text,
  cedula     text,

  -- Datos de interés
  proyecto_id        uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  presupuesto        bigint,
  tipo_unidad_buscada text,

  -- Seguimiento
  status     text NOT NULL DEFAULT 'Nuevo'
               CHECK (status IN ('Nuevo', 'Contactado', 'Calificado', 'Negociando', 'Cerrado', 'Perdido')),
  agente_id  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.prospectos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados gestionan prospectos"
  ON public.prospectos FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS prospectos_updated_at ON public.prospectos;
CREATE TRIGGER prospectos_updated_at
  BEFORE UPDATE ON public.prospectos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 3. TABLA: prospecto_notas
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.prospecto_notas (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  prospecto_id  uuid NOT NULL REFERENCES public.prospectos(id) ON DELETE CASCADE,
  contenido     text NOT NULL,
  autor_id      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.prospecto_notas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados gestionan notas"
  ON public.prospecto_notas FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- ─────────────────────────────────────────────────────────────
-- 4. TABLA: citas
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.citas (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  prospecto_id  uuid NOT NULL REFERENCES public.prospectos(id) ON DELETE CASCADE,
  agente_id     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  proyecto_id   uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  fecha_hora    timestamptz NOT NULL,
  tipo          text NOT NULL DEFAULT 'Visita'
                  CHECK (tipo IN ('Visita', 'Llamada', 'Virtual')),
  status        text NOT NULL DEFAULT 'Pendiente'
                  CHECK (status IN ('Pendiente', 'Confirmada', 'Realizada', 'Cancelada')),
  notas         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados gestionan citas"
  ON public.citas FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

COMMIT;
