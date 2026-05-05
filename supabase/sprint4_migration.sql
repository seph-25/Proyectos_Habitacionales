BEGIN;

-- ─────────────────────────────────────────────
-- Tabla: oportunidades
-- Registra cada oportunidad de venta vinculada
-- a un prospecto y opcionalmente a un proyecto.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS oportunidades (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  prospecto_id          UUID        NOT NULL REFERENCES prospectos(id)  ON DELETE CASCADE,
  proyecto_id           UUID                 REFERENCES projects(id)    ON DELETE SET NULL,
  agente_id             UUID                 REFERENCES profiles(id)    ON DELETE SET NULL,
  etapa                 TEXT        NOT NULL DEFAULT 'Nueva'
                          CHECK (etapa IN (
                            'Nueva', 'Contactado', 'Calificado',
                            'Propuesta', 'Negociación',
                            'Cerrada', 'Descartada'
                          )),
  valor_estimado        NUMERIC(12,2),
  fecha_cierre_estimada DATE,
  notas                 TEXT,
  motivo_descarte       TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Tabla: oportunidades_historial
-- Registra cada cambio de etapa para auditoría.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS oportunidades_historial (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  oportunidad_id  UUID        NOT NULL REFERENCES oportunidades(id) ON DELETE CASCADE,
  etapa_anterior  TEXT,
  etapa_nueva     TEXT        NOT NULL,
  changed_by      TEXT        NOT NULL DEFAULT 'Sistema',
  notas           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Trigger: actualiza updated_at automáticamente
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_oportunidad_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_oportunidades_updated_at ON oportunidades;
CREATE TRIGGER trg_oportunidades_updated_at
  BEFORE UPDATE ON oportunidades
  FOR EACH ROW EXECUTE FUNCTION set_oportunidad_updated_at();

-- ─────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────
ALTER TABLE oportunidades           ENABLE ROW LEVEL SECURITY;
ALTER TABLE oportunidades_historial ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_oportunidades"            ON oportunidades;
DROP POLICY IF EXISTS "auth_oportunidades_historial"  ON oportunidades_historial;

CREATE POLICY "auth_oportunidades" ON oportunidades
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "auth_oportunidades_historial" ON oportunidades_historial
  FOR ALL USING (auth.role() = 'authenticated');

COMMIT;
