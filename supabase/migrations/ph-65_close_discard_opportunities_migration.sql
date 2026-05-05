-- PH-65: Close and Discard Opportunities Migration
-- Adds fecha_cierre and razon_descarte fields to prospectos
-- Creates close_prospecto RPC function for direct close/discard

-- Add fecha_cierre column to track when opportunity was closed
ALTER TABLE public.prospectos
ADD COLUMN IF NOT EXISTS fecha_cierre TIMESTAMPTZ;

-- Add razon_descarte column to capture discard reason
ALTER TABLE public.prospectos
ADD COLUMN IF NOT EXISTS razon_descarte TEXT;

-- Add CHECK constraint for valid discard reason values
ALTER TABLE public.prospectos
ADD CONSTRAINT chk_prospectos_razon_descarte
CHECK (
  razon_descarte IS NULL OR razon_descarte IN (
    'Sin interés',
    'Precio fuera de rango',
    'Compró con otra compañía',
    'Sin capacidad de pago',
    'Otro'
  )
);

-- RLS policy for fecha_cierre and razon_descarte (public for prototype)
-- Note: Existing RLS policies on prospectos will apply to these new columns

-- Close prospecto RPC function
-- Directly closes a prospecto as 'Cerrado' (won) or 'Perdido' (lost) with optional reason
CREATE OR REPLACE FUNCTION public.close_prospecto(
  p_prospecto_id UUID,
  p_result TEXT,        -- 'Cerrado' or 'Perdido'
  p_razon TEXT,         -- Optional discard reason (required when result = 'Perdido')
  p_changed_by TEXT     -- User ID or 'Sistema'
)
RETURNS public.prospecto_status_history
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_status TEXT;
  v_history public.prospecto_status_history;
BEGIN
  -- Validate result value
  IF p_result NOT IN ('Cerrado', 'Perdido') THEN
    RAISE EXCEPTION 'Resultado debe ser "Cerrado" o "Perdido"';
  END IF;

  -- Validate reason is provided when result is 'Perdido'
  IF p_result = 'Perdido' AND (p_razon IS NULL OR p_razon = '') THEN
    RAISE EXCEPTION 'Se requiere motivo de descarte cuando el resultado es "Perdido"';
  END IF;

  -- Get current status with lock to prevent race conditions
  SELECT status INTO v_current_status
  FROM public.prospectos
  WHERE id = p_prospecto_id
  FOR UPDATE;

  -- Check if prospecto exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prospecto no encontrado';
  END IF;

  -- Check if already in terminal state
  IF v_current_status IN ('Cerrado', 'Perdido') THEN
    RAISE EXCEPTION 'No se puede cerrar un prospecto que ya está en estado terminal "%"', v_current_status;
  END IF;

  -- Update prospecto with close result and date
  UPDATE public.prospectos
  SET 
    status = p_result,
    fecha_cierre = now(),
    razon_descarte = CASE WHEN p_result = 'Perdido' THEN p_razon ELSE NULL END,
    updated_at = now()
  WHERE id = p_prospecto_id;

  -- Insert history record
  INSERT INTO public.prospecto_status_history (prospecto_id, etapa_anterior, etapa_nueva, fecha, hora, usuario_id)
  VALUES (p_prospecto_id, v_current_status, p_result, now(), now(), COALESCE(p_changed_by, 'Sistema'))
  RETURNING * INTO v_history;

  RETURN v_history;
END;
$$;