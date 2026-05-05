import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, TrendingUp, SlidersHorizontal } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AppLayout } from "@/components/layout/AppLayout";
import { Spinner } from "@/components/Spinner";
import { supabase } from "@/integrations/supabase/client";

const ETAPAS = ["Nueva", "Contactado", "Calificado", "Propuesta", "Negociación"] as const;

const ETAPA_COLORS: Record<string, string> = {
  "Nueva": "bg-blue-100 text-blue-700",
  "Contactado": "bg-yellow-100 text-yellow-700",
  "Calificado": "bg-purple-100 text-purple-700",
  "Propuesta": "bg-orange-100 text-orange-700",
  "Negociación": "bg-pink-100 text-pink-700",
};

interface Oportunidad {
  id: string;
  prospecto_id: string;
  prospecto_nombre: string;
  proyecto_nombre: string | null;
  etapa: string;
  valor_estimado: number | null;
  fecha_cierre_estimada: string | null;
  notas: string | null;
}

const Oportunidades = () => {
  const [loading, setLoading] = useState(true);
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [search, setSearch] = useState("");
  const [etapaFilter, setEtapaFilter] = useState("Todos");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("oportunidades")
      .select(`
        id, prospecto_id, etapa, valor_estimado, fecha_cierre_estimada, notas,
        prospectos(nombre, apellidos),
        projects(name)
      `)
      .not("etapa", "in", `("Cerrada","Descartada")`)
      .order("fecha_cierre_estimada", { ascending: true, nullsFirst: false });

    setOportunidades(
      (data ?? []).map((o: any) => ({
        id: o.id,
        prospecto_id: o.prospecto_id,
        prospecto_nombre: o.prospectos
          ? `${o.prospectos.nombre} ${o.prospectos.apellidos}`
          : "—",
        proyecto_nombre: o.projects?.name ?? null,
        etapa: o.etapa,
        valor_estimado: o.valor_estimado,
        fecha_cierre_estimada: o.fecha_cierre_estimada,
        notas: o.notas,
      }))
    );
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return oportunidades.filter((o) => {
      const matchText =
        o.prospecto_nombre.toLowerCase().includes(q) ||
        (o.proyecto_nombre ?? "").toLowerCase().includes(q);
      const matchEtapa = etapaFilter === "Todos" || o.etapa === etapaFilter;
      return matchText && matchEtapa;
    });
  }, [oportunidades, search, etapaFilter]);

  return (
    <AppLayout title="Oportunidades">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline de Oportunidades</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} de {oportunidades.length} oportunidad(es)
          </p>
        </div>
        <Link
          to="/oportunidades/nueva"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
        >
          <TrendingUp className="h-4 w-4" /> Nueva Oportunidad
        </Link>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-3 rounded-lg bg-card p-4 shadow-card">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por prospecto o proyecto..."
            className="h-10 w-full rounded-sm border border-border bg-background/60 pl-9 pr-3 text-sm outline-none transition focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <select
            value={etapaFilter}
            onChange={(e) => setEtapaFilter(e.target.value)}
            className="h-10 min-w-[150px] rounded-sm border border-border bg-white px-3 text-sm outline-none focus:border-primary"
          >
            <option value="Todos">Todas las etapas</option>
            {ETAPAS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="rounded-lg bg-card p-16 text-center shadow-card">
          <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 font-semibold text-foreground">Sin oportunidades</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {oportunidades.length === 0
              ? "Crea tu primera oportunidad con el botón de arriba."
              : "Ajusta los filtros para encontrar oportunidades."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <div
              key={o.id}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card transition hover:shadow-elevated"
            >
              {/* Etapa */}
              <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${ETAPA_COLORS[o.etapa] ?? "bg-muted"}`}>
                  {o.etapa}
                </span>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/prospectos/${o.prospecto_id}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {o.prospecto_nombre}
                  </Link>
                  {o.proyecto_nombre && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                      {o.proyecto_nombre}
                    </span>
                  )}
                </div>
                {o.notas && (
                  <p className="mt-1 truncate text-xs text-muted-foreground">{o.notas}</p>
                )}
              </div>

              {/* Valor + Fecha */}
              <div className="flex flex-col items-end gap-1">
                {o.valor_estimado && (
                  <span className="font-semibold text-foreground">
                    ${o.valor_estimado.toLocaleString("es-CO")}
                  </span>
                )}
                {o.fecha_cierre_estimada && (
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(o.fecha_cierre_estimada), "dd MMM yyyy", { locale: es })}
                  </span>
                )}
              </div>

              {/* Acciones */}
              <Link
                to={`/oportunidades/${o.id}/editar`}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-secondary"
              >
                Editar
              </Link>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default Oportunidades;
