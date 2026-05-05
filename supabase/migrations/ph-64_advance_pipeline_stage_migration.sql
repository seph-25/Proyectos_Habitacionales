-- PH-64: Advance Pipeline Stage Migration
-- Creates prospecto_status_history table and advance_prospecto_stage RPC function

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create prospecto_status_history table
CREATE TABLE public.prospecto_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prospecto_id UUID NOT NULL REFERENCES public.prospectos(id) ON DELETE CASCADE,
  etapa_anterior TEXT,
  etapa_nueva TEXT NOT NULL,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  hora TIMESTAMPTZ NOT NULL DEFAULT now(),
  usuario_id TEXT NOT NULL DEFAULT 'Sistema'
);

-- Add CHECK constraint for valid stage values
ALTER TABLE public.prospecto_status_history
ADD CONSTRAINT chk_prospecto_status_history_stage_values
CHECK (
  etapa_nueva IN ('Nuevo', 'Contactado', 'Calificado', 'Negociando', 'Cerrado', 'Perdido')
  AND (etapa_anterior IS NULL OR etapa_anterior IN ('Nuevo', 'Contactado', 'Calificado', 'Negociando', 'Cerrado', 'Perdido'))
);

-- Enable RLS
ALTER TABLE public.prospecto_status_history ENABLE ROW LEVEL SECURITY;

-- RLS policies mirroring prospectos table (public access for prototype)
CREATE POLICY "Public can view prospecto_status_history" ON public.prospecto_status_history FOR SELECT USING (true);
CREATE POLICY "Public can insert prospecto_status_history" ON public.prospecto_status_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update prospecto_status_history" ON public.prospecto_status_history FOR UPDATE USING (true);
CREATE POLICY "Public can delete prospecto_status_history" ON public.prospecto_status_history FOR DELETE USING (true);

-- Create index for efficient queries
CREATE INDEX idx_prospecto_status_history_prospecto ON public.prospecto_status_history(prospecto_id, fecha DESC);

-- Advance prospecto stage RPC function
-- Validates stage order, updates prospecto status, and records history atomically
CREATE OR REPLACE FUNCTION public.advance_prospecto_stage(p_prospecto_id UUID, p_changed_by TEXT)
RETURNS public.prospecto_status_history
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_status TEXT;
  v_history public.prospecto_status_history;
  v_stage_order TEXT[] := ARRAY['Nuevo', 'Contactado', 'Calificado', 'Negociando', 'Cerrado', 'Perdido'];
  v_current_index INTEGER;
  v_next_index INTEGER;
BEGIN
  -- Get current status with lock to prevent race conditions
  SELECT status INTO v_current_status
  FROM public.prospectos
  WHERE id = p_prospecto_id
  FOR UPDATE;

  -- Check if prospecto exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prospecto no encontrado';
  END IF;

  -- Calculate stage indices
  v_current_index := array_position(v_stage_order, v_current_status);
  v_next_index := array_position(v_stage_order, v_current_status) + 1;

  -- Validate stage transition
  IF v_current_index IS NULL THEN
    RAISE EXCEPTION 'Estado actual "%" no es un estado válido', v_current_status;
  END IF;

  -- Check if current stage is terminal (no next stage)
  IF v_current_index = array_length(v_stage_order, 1) THEN
    RAISE EXCEPTION 'No se puede avanzar desde el estado terminal "%"', v_current_status;
  END IF;

  -- Update prospecto status
  UPDATE public.prospectos
  SET status = v_stage_order[v_next_index], updated_at = now()
  WHERE id = p_prospecto_id;

  -- Insert history record
  INSERT INTO public.prospecto_status_history (prospecto_id, etapa_anterior, etapa_nueva, fecha, hora, usuario_id)
  VALUES (p_prospecto_id, v_current_status, v_stage_order[v_next_index], now(), now(), COALESCE(p_changed_by, 'Sistema'))
  RETURNING * INTO v_history;

  RETURN v_history;
END;
$$;
