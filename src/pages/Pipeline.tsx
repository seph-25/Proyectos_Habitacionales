import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Spinner } from "@/components/Spinner";
import { supabase } from "@/integrations/supabase/client";
import { differenceInHours, differenceInDays, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { DISCARD_REASONS, isTerminalStatus } from "@/lib/stageUtils";
import { useAuth } from "@/contexts/AuthContext";

interface Oportunidad {
  id: string;
  etapa: string;
  prospecto_id: string;
  proyecto_id: string | null;
  prospecto_nombre: string | null;
  prospecto_apellidos: string | null;
  proyecto_nombre: string | null;
  updated_at: string;
  motivo_descarte: string | null;
}

interface StaleTimeEntry {
  value: number;
  unit: "h" | "d";
  label: string;
}

const KANBAN_STAGES = [
  "Nueva",
  "Contactado",
  "Calificado",
  "Propuesta",
  "Negociación",
] as const;

type KANBAN_STAGES_TYPE = typeof KANBAN_STAGES[number];

const STAGE_COLORS: Record<KANBAN_STAGES_TYPE, { bg: string; border: string; header: string; text: string }> = {
  "Nueva":       { bg: "bg-blue-50",    border: "border-blue-200",    header: "bg-blue-600",    text: "text-blue-700" },
  "Contactado":  { bg: "bg-indigo-50",  border: "border-indigo-200",   header: "bg-indigo-600",  text: "text-indigo-700" },
  "Calificado":  { bg: "bg-amber-50",   border: "border-amber-200",    header: "bg-amber-600",   text: "text-amber-700" },
  "Propuesta":   { bg: "bg-teal-50",    border: "border-teal-200",     header: "bg-teal-600",    text: "text-teal-700" },
  "Negociación": { bg: "bg-purple-50",  border: "border-purple-200",   header: "bg-purple-600",  text: "text-purple-700" },
};

const STAGE_ORDER: Record<string, number> = {
  "Nueva": 0,
  "Contactado": 1,
  "Calificado": 2,
  "Propuesta": 3,
  "Negociación": 4,
  "Cerrada": 5,
  "Descartada": 5,
};

function computeStaleTime(changedAt: string): StaleTimeEntry {
  const then = new Date(changedAt);
  const now = new Date();
  const hours = differenceInHours(now, then);

  if (hours < 1) {
    const minutes = Math.round((now.getTime() - then.getTime()) / 60000);
    return { value: minutes, unit: "h", label: `${minutes}m` };
  }
  if (hours < 24) {
    return { value: hours, unit: "h", label: `${hours}h` };
  }
  const days = differenceInDays(now, then);
  return { value: days, unit: "d", label: `${days}d` };
}

function formatStaleTimeTooltip(changedAt: string): string {
  return formatDistanceToNow(new Date(changedAt), { addSuffix: true, locale: es });
}

interface KanbanCardProps {
  oportunidad: Oportunidad;
  staleTime: StaleTimeEntry | null;
  onAdvance: (id: string, etapa: string) => void;
  onClose: (id: string) => void;
  onDiscard: (id: string, motivo: string) => void;
}

const KanbanCard = ({ oportunidad, staleTime, onAdvance, onClose, onDiscard }: KanbanCardProps) => {
  const colors = STAGE_COLORS[oportunidad.etapa as KANBAN_STAGES_TYPE] ?? STAGE_COLORS["Nueva"];
  const isTerminal = isTerminalStatus(oportunidad.etapa);

  return (
    <div className={`rounded-lg border ${colors.bg} ${colors.border} p-4 shadow-sm transition-all duration-150 hover:shadow-md`}>
      <Link
        to={`/prospectos/${oportunidad.prospecto_id}`}
        className="block font-semibold text-foreground hover:underline"
      >
        {oportunidad.prospecto_nombre} {oportunidad.prospecto_apellidos}
      </Link>
      <p className="mt-1 text-xs text-muted-foreground">
        {oportunidad.proyecto_nombre ?? "Sin proyecto asignado"}
      </p>
      {oportunidad.etapa === "Descartada" && oportunidad.motivo_descarte && (
        <div className="mt-2 rounded bg-red-100 px-2 py-1 text-[10px] font-medium text-red-700">
          {oportunidad.motivo_descarte}
        </div>
      )}
      {staleTime && !isTerminal && (
        <div className="mt-3 flex items-center justify-between">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${colors.text}`}
            title={formatStaleTimeTooltip(oportunidad.updated_at)}
          >
            {staleTime.label} en etapa
          </span>
        </div>
      )}
      {!isTerminal && (
        <div className="mt-3 flex gap-1">
          <button
            onClick={() => onAdvance(oportunidad.id, oportunidad.etapa)}
            className="flex-1 rounded bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground hover:bg-primary/90"
          >
            Avanzar
          </button>
          <button
            onClick={() => onClose(oportunidad.id)}
            className="flex-1 rounded bg-green-600 px-2 py-1 text-[10px] font-medium text-white hover:bg-green-700"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              const motivo = window.prompt(`Motivo de descarte:\n${DISCARD_REASONS.join(", ")}`);
              if (motivo) onDiscard(oportunidad.id, motivo);
            }}
            className="flex-1 rounded bg-red-600 px-2 py-1 text-[10px] font-medium text-white hover:bg-red-700"
          >
            Descartar
          </button>
        </div>
      )}
    </div>
  );
};

interface KanbanColumnProps {
  title: string;
  oportunidades: Oportunidad[];
  staleTimes: Record<string, StaleTimeEntry>;
  onAdvance: (id: string, etapa: string) => void;
  onClose: (id: string) => void;
  onDiscard: (id: string, motivo: string) => void;
}

const KanbanColumn = ({ title, oportunidades, staleTimes, onAdvance, onClose, onDiscard }: KanbanColumnProps) => {
  const colors = STAGE_COLORS[title as KANBAN_STAGES_TYPE] ?? STAGE_COLORS["Nueva"];

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl bg-secondary/30 shadow-sm">
      <div className={`sticky top-0 z-10 rounded-t-xl ${colors.header} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-xs font-bold text-white">
            {oportunidades.length}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3" style={{ maxHeight: "calc(100vh - 220px)" }}>
        <div className="space-y-2">
          {oportunidades.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center">
              <p className="text-xs text-muted-foreground">Sin oportunidades</p>
            </div>
          ) : (
            oportunidades.map((o) => (
              <KanbanCard
                key={o.id}
                oportunidad={o}
                staleTime={staleTimes[o.id] ?? null}
                onAdvance={onAdvance}
                onClose={onClose}
                onDiscard={onDiscard}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const Pipeline = () => {
  const [loading, setLoading] = useState(true);
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [staleTimes, setStaleTimes] = useState<Record<string, StaleTimeEntry>>({});
  const { profile } = useAuth();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("oportunidades" as any)
      .select(`
        id,
        etapa,
        prospecto_id,
        proyecto_id,
        updated_at,
        motivo_descarte,
        prospectos(nombre, apellidos),
        projects(name)
      `)
      .not("etapa", "in", '("Cerrada","Descartada")')
      .order("updated_at", { ascending: false });

    const mapped: Oportunidad[] = (data ?? []).map((o: any) => ({
      id: o.id,
      etapa: o.etapa,
      prospecto_id: o.prospecto_id,
      proyecto_id: o.proyecto_id ?? null,
      prospecto_nombre: o.prospectos?.nombre ?? null,
      prospecto_apellidos: o.prospectos?.apellidos ?? null,
      proyecto_nombre: o.projects?.name ?? null,
      updated_at: o.updated_at,
      motivo_descarte: o.motivo_descarte ?? null,
    }));

    const times: Record<string, StaleTimeEntry> = {};
    for (const o of mapped) {
      times[o.id] = computeStaleTime(o.updated_at);
    }

    setOportunidades(mapped);
    setStaleTimes(times);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const advanceStage = async (id: string, currentEtapa: string) => {
    const nextIndex = STAGE_ORDER[currentEtapa] + 1;
    const stageEntries = Object.entries(STAGE_ORDER);
    const nextStage = stageEntries.find(([, idx]) => idx === nextIndex)?.[0];

    if (!nextStage || nextStage === "Cerrada" || nextStage === "Descartada") {
      alert("No se puede avanzar más desde esta etapa");
      return;
    }

    const { error } = await (supabase as any)
      .from("oportunidades_historial")
      .insert({
        oportunidad_id: id,
        etapa_anterior: currentEtapa,
        etapa_nueva: nextStage,
        changed_by: profile.full_name || "Unknown",
      });

    if (error) {
      alert("Error al registrar avance: " + error.message);
      return;
    }

    await (supabase as any).from("oportunidades").update({ etapa: nextStage }).eq("id", id);
    load();
  };

  const closeOpportunity = async (id: string) => {
    if (!confirm("¿Cerrar esta oportunidad como Ganada?")) return;

    const { error } = await (supabase as any)
      .from("oportunidades_historial")
      .insert({
        oportunidad_id: id,
        etapa_anterior: "Negociación",
        etapa_nueva: "Cerrada",
        changed_by: "Usuario",
      });

    if (error) {
      alert("Error al registrar cierre: " + error.message);
      return;
    }

    await (supabase as any).from("oportunidades").update({ etapa: "Cerrada" }).eq("id", id);
    load();
  };

  const discardOpportunity = async (id: string, motivo: string) => {
    const { error } = await (supabase as any)
      .from("oportunidades_historial")
      .insert({
        oportunidad_id: id,
        etapa_anterior: "Negociación",
        etapa_nueva: "Descartada",
        changed_by: "Usuario",
        notas: motivo,
      });

    if (error) {
      alert("Error al registrar descarte: " + error.message);
      return;
    }

    await (supabase as any)
      .from("oportunidades")
      .update({ etapa: "Descartada", motivo_descarte: motivo })
      .eq("id", id);
    load();
  };

  const byStage = useMemo(() => {
    const map: Record<string, Oportunidad[]> = {};
    for (const stage of KANBAN_STAGES) {
      map[stage] = oportunidades.filter((o) => o.etapa === stage);
    }
    return map;
  }, [oportunidades]);

  return (
    // <AppLayout title="Pipeline">
      // <div className="mb-6">
      //   <h1 className="text-2xl font-bold text-foreground">Pipeline de Ventas</h1>
      //   <p className="mt-1 text-sm text-muted-foreground">
      //     {oportunidades.length} oportunidad(es) en el pipeline
      //   </p>
      // </div>

      <div>
      {loading ? (
        <Spinner />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              title={stage}
              oportunidades={byStage[stage] ?? []}
              staleTimes={staleTimes}
              onAdvance={advanceStage}
              onClose={closeOpportunity}
              onDiscard={discardOpportunity}
            />
          ))}
        </div>
      )}
      </div>
    // </AppLayout>
  );
};

export{ Pipeline};