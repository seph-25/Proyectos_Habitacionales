import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, CalendarPlus, Calendar, SlidersHorizontal, Phone, Video, MapPin } from "lucide-react";
import { format, isPast } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Spinner } from "@/components/Spinner";
import { supabase } from "@/integrations/supabase/client";

const CITA_STATUSES = ["Pendiente", "Confirmada", "Realizada", "Cancelada"] as const;
const CITA_TIPOS = ["Visita", "Llamada", "Virtual"] as const;

const STATUS_COLORS: Record<string, string> = {
  "Pendiente":   "bg-yellow-100 text-yellow-700",
  "Confirmada":  "bg-blue-100 text-blue-700",
  "Realizada":   "bg-green-100 text-green-700",
  "Cancelada":   "bg-red-100 text-red-700",
};

const TIPO_ICONS: Record<string, React.ElementType> = {
  "Visita":   MapPin,
  "Llamada":  Phone,
  "Virtual":  Video,
};

interface Cita {
  id: string;
  prospecto_id: string;
  prospecto_nombre: string;
  proyecto_nombre: string | null;
  fecha_hora: string;
  tipo: string;
  status: string;
  notas: string | null;
}

const Citas = () => {
  const [loading, setLoading] = useState(true);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [tipoFilter, setTipoFilter] = useState("Todos");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("citas")
      .select(`
        id, prospecto_id, fecha_hora, tipo, status, notas,
        prospectos(nombre, apellidos),
        projects(name)
      `)
      .order("fecha_hora", { ascending: true });

    setCitas(
      (data ?? []).map((c: any) => ({
        id: c.id,
        prospecto_id: c.prospecto_id,
        prospecto_nombre: c.prospectos
          ? `${c.prospectos.nombre} ${c.prospectos.apellidos}`
          : "—",
        proyecto_nombre: c.projects?.name ?? null,
        fecha_hora: c.fecha_hora,
        tipo: c.tipo,
        status: c.status,
        notas: c.notas,
      }))
    );
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return citas.filter((c) => {
      const matchText =
        c.prospecto_nombre.toLowerCase().includes(q) ||
        (c.proyecto_nombre ?? "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "Todos" || c.status === statusFilter;
      const matchTipo = tipoFilter === "Todos" || c.tipo === tipoFilter;
      return matchText && matchStatus && matchTipo;
    });
  }, [citas, search, statusFilter, tipoFilter]);

  const onCancelCita = async (citaId: string) => {
    const { error } = await supabase
      .from("citas")
      .update({ status: "Cancelada" })
      .eq("id", citaId);
    if (error) { toast.error("Error al cancelar la cita"); return; }
    toast.success("Cita cancelada");
    load();
  };

  return (
    <AppLayout title="Citas">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agenda de Citas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} de {citas.length} cita(s)
          </p>
        </div>
        <Link
          to="/citas/nueva"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
        >
          <CalendarPlus className="h-4 w-4" /> Nueva Cita
        </Link>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-3 rounded-lg bg-card p-4 shadow-card">
        <div className="relative min-w-[220px] flex-1">
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 min-w-[150px] rounded-sm border border-border bg-white px-3 text-sm outline-none focus:border-primary"
          >
            <option value="Todos">Todos los estados</option>
            {CITA_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="h-10 min-w-[130px] rounded-sm border border-border bg-white px-3 text-sm outline-none focus:border-primary"
          >
            <option value="Todos">Todos los tipos</option>
            {CITA_TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="rounded-lg bg-card p-16 text-center shadow-card">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 font-semibold text-foreground">Sin citas</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {citas.length === 0
              ? "Crea tu primera cita con el botón de arriba."
              : "Ajusta los filtros para encontrar citas."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const TipoIcon = TIPO_ICONS[c.tipo] ?? Calendar;
            const fecha = new Date(c.fecha_hora);
            const pasada = isPast(fecha) && c.status === "Pendiente";
            return (
              <div
                key={c.id}
                className={`flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4 shadow-card transition hover:shadow-elevated ${pasada ? "border-yellow-300 bg-yellow-50/30" : "border-border"}`}
              >
                {/* Fecha */}
                <div className="flex w-20 shrink-0 flex-col items-center rounded-lg bg-primary/10 py-2 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {format(fecha, "MMM", { locale: es })}
                  </span>
                  <span className="text-2xl font-extrabold text-primary leading-tight">
                    {format(fecha, "dd")}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {format(fecha, "HH:mm")}
                  </span>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/prospectos/${c.prospecto_id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {c.prospecto_nombre}
                    </Link>
                    {c.proyecto_nombre && (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                        {c.proyecto_nombre}
                      </span>
                    )}
                    {pasada && (
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold text-yellow-700">
                        Vencida
                      </span>
                    )}
                  </div>
                  {c.notas && (
                    <p className="mt-1 truncate text-xs text-muted-foreground">{c.notas}</p>
                  )}
                </div>

                {/* Tipo + Estado */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <TipoIcon className="h-3.5 w-3.5" />
                    {c.tipo}
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_COLORS[c.status] ?? "bg-muted"}`}>
                    {c.status}
                  </span>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                  <Link
                    to={`/citas/${c.id}/editar`}
                    className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-secondary"
                  >
                    Editar
                  </Link>
                  {c.status !== "Cancelada" && c.status !== "Realizada" && (
                    <button
                      onClick={() => onCancelCita(c.id)}
                      className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};

export default Citas;
