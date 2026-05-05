import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Spinner } from "@/components/Spinner";
import { supabase } from "@/integrations/supabase/client";
import { differenceInHours, differenceInDays, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { keyof } from "zod/v4";

interface Prospecto {
  id: string;
  nombre: string;
  apellidos: string;
  status: string;
  proyecto_id: string | null;
  proyecto_nombre: string | null;
  updated_at: string;
}



interface StaleTimeEntry {
  value: number;
  unit: "h" | "d";
  label: string;
}

const PIPELINE_STAGES = [
  "Nuevo",
  "Contactado",
  "Calificado",
  "Negociando",
  "Cerrado",
  "Perdido",
] as const;

type PIPELINE_STAGES_TYPE = typeof PIPELINE_STAGES[number]

const STAGE_COLORS: Record<PIPELINE_STAGES_TYPE, { bg: string; border: string; header: string; text: string }> = {
  "Nuevo":   { bg: "bg-blue-50",    border: "border-blue-200",    header: "bg-blue-600",    text: "text-blue-700" },
  "Contactado": { bg: "bg-indigo-50",   border: "border-indigo-200",   header: "bg-indigo-600",  text: "text-indigo-700" },
  "Calificado":  { bg: "bg-amber-50",    border: "border-amber-200",    header: "bg-amber-600",   text: "text-amber-700" },
  "Negociando":{ bg: "bg-purple-50",   border: "border-purple-200",   header: "bg-purple-600",  text: "text-purple-700" },
  "Cerrado":      { bg: "bg-green-50",    border: "border-green-200",    header: "bg-green-600",  text: "text-green-700" },
  "Perdido":      { bg: "bg-green-50",    border: "border-green-200",    header: "bg-green-600",  text: "text-green-700" },
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
  prospecto: Prospecto;
  staleTime: StaleTimeEntry | null;
}

const KanbanCard = ({ prospecto, staleTime }: KanbanCardProps) => {
  const colors = STAGE_COLORS[prospecto.status] ?? STAGE_COLORS["Prospección"];

  return (
    <Link
      to={`/prospectos/${prospecto.id}`}
      className={`block rounded-lg border ${colors.bg} ${colors.border} p-4 shadow-sm transition-all duration-150 hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5`}
    >
      <p className="font-semibold text-foreground">
        {prospecto.nombre} {prospecto.apellidos}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {prospecto.proyecto_nombre ?? "Sin proyecto asignado"}
      </p>
      {staleTime && (
        <div className="mt-3 flex items-center justify-between">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${colors.text}`}
            title={formatStaleTimeTooltip(prospecto.updated_at)}
          >
            {staleTime.label} en etapa
          </span>
        </div>
      )}
    </Link>
  );
};

interface KanbanColumnProps {
  title: string;
  prospectos: Prospecto[];
  staleTimes: Record<string, StaleTimeEntry>;
}

const KanbanColumn = ({ title, prospectos, staleTimes }: KanbanColumnProps) => {
  const colors = STAGE_COLORS[title] ?? STAGE_COLORS["Prospección"];

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl bg-secondary/30 shadow-sm">
      <div className={`sticky top-0 z-10 rounded-t-xl ${colors.header} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-xs font-bold text-white">
            {prospectos.length}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3" style={{ maxHeight: "calc(100vh - 220px)" }}>
        <div className="space-y-2">
          {prospectos.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center">
              <p className="text-xs text-muted-foreground">Sin oportunidades</p>
            </div>
          ) : (
            prospectos.map((p) => (
              <KanbanCard key={p.id} prospecto={p} staleTime={staleTimes[p.id] ?? null} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const Pipeline = () => {
  const [loading, setLoading] = useState(true);
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);
  const [staleTimes, setStaleTimes] = useState<Record<string, StaleTimeEntry>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("prospectos")
      .select("id, nombre, apellidos, status, proyecto_id, updated_at, projects(name)")
      .order("updated_at", { ascending: false });

      
      const mapped: Prospecto[] = (data ?? []).map((p: any) => ({
        id: p.id,
        nombre: p.nombre,
        apellidos: p.apellidos,
        status: p.status,
        proyecto_id: p.proyecto_id ?? null,
      proyecto_nombre: p.projects?.name ?? null,
      updated_at: p.updated_at,
    }));
    
    const times: Record<string, StaleTimeEntry> = {};
    for (const p of mapped) {
      times[p.id] = computeStaleTime(p.updated_at);
    }
    
    setProspectos(mapped);
    setStaleTimes(times);
    setLoading(false);
  };
  
  useEffect(() => { load(); }, []);
  
  const byStage = useMemo(() => {
    console.log(prospectos)
    const map: Record<string, Prospecto[]> = {};
    for (const stage of PIPELINE_STAGES) {
      map[stage] = prospectos.filter((p) => p.status === stage);
    }
    return map;
  }, [prospectos]);
  
  return (
    <AppLayout title="Pipeline">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Pipeline de Ventas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {prospectos.length} oportunidad(es) en el pipeline
        </p>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              title={stage}
              prospectos={byStage[stage] ?? []}
              staleTimes={staleTimes}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default Pipeline;
