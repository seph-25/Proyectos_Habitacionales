import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AppLayout } from "@/components/layout/AppLayout";
import { Spinner } from "@/components/Spinner";
import { supabase } from "@/integrations/supabase/client";

interface HistorialEntry {
  id: string;
  etapa_anterior: string | null;
  etapa_nueva: string;
  changed_by: string;
  created_at: string;
}

interface Oportunidad {
  id: string;
  prospecto_id: string;
  prospecto_nombre: string;
  proyecto_nombre: string | null;
  etapa: string;
  motivo_descarte: string | null;
  historial: HistorialEntry[];
}

const OportunidadesDescartadas = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("oportunidades")
      .select(`
        id, prospecto_id, etapa, motivo_descarte,
        prospectos(nombre, apellidos),
        projects(name)
      `)
      .eq("etapa", "Descartada")
      .order("id", { ascending: false });

    const oppsWithHistorial = await Promise.all(
      (data ?? []).map(async (o: any) => {
        const { data: hist } = await supabase
          .from("oportunidades_historial")
          .select("id, etapa_anterior, etapa_nueva, changed_by, created_at")
          .eq("oportunidad_id", o.id)
          .order("created_at", { ascending: false });

        return {
          id: o.id,
          prospecto_id: o.prospecto_id,
          prospecto_nombre: o.prospectos
            ? `${o.prospectos.nombre} ${o.prospectos.apellidos}`
            : "—",
          proyecto_nombre: o.projects?.name ?? null,
          etapa: o.etapa,
          motivo_descarte: o.motivo_descarte,
          historial: (hist ?? []) as HistorialEntry[],
        };
      })
    );

    setOportunidades(oppsWithHistorial);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <AppLayout title="Oportunidades Descartadas">
      <button
        onClick={() => navigate("/oportunidades")}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al Pipeline
      </button>

      <h1 className="mb-8 text-2xl font-bold text-foreground">Oportunidades Descartadas</h1>

      {loading ? (
        <Spinner />
      ) : oportunidades.length === 0 ? (
        <div className="rounded-lg bg-card p-16 text-center shadow-card">
          <ChevronDown className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 font-semibold text-foreground">Sin oportunidades descartadas</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            No hay oportunidades marcadas como descartadas aún.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {oportunidades.map((o) => {
            const isExpanded = expandedId === o.id;
            return (
              <div key={o.id} className="rounded-xl border border-border bg-card shadow-card">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : o.id)}
                  className="w-full p-4 text-left transition hover:bg-secondary/20"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-primary">
                          {o.prospecto_nombre}
                        </span>
                        {o.proyecto_nombre && (
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                            {o.proyecto_nombre}
                          </span>
                        )}
                      </div>
                      {o.motivo_descarte && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Motivo: {o.motivo_descarte}
                        </p>
                      )}
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {isExpanded && o.historial.length > 0 && (
                  <div className="border-t border-border bg-secondary/10 p-4">
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Historial de cambios
                    </h4>
                    <div className="space-y-2">
                      {o.historial.map((h) => (
                        <div key={h.id} className="rounded-lg border border-border/50 bg-white p-3">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <div>
                              <span className="font-semibold text-foreground">
                                {h.etapa_anterior ? `${h.etapa_anterior} → ${h.etapa_nueva}` : `Creada como ${h.etapa_nueva}`}
                              </span>
                              <div className="mt-1 text-muted-foreground">
                                Por: {h.changed_by}
                              </div>
                            </div>
                            <div className="shrink-0 text-right text-muted-foreground">
                              {format(new Date(h.created_at), "dd MMM yyyy HH:mm", { locale: es })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};

export default OportunidadesDescartadas;
