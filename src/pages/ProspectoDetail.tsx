import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Save, Phone, Mail, Hash, DollarSign,
  Layers, Building2, MessageSquarePlus, Trash2, Calendar, CalendarPlus,
  MapPin, Video,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Spinner } from "@/components/Spinner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const PROSPECTO_STATUSES = [
  "Nuevo", "Contactado", "Calificado", "Negociando", "Cerrado", "Perdido",
] as const;

const STATUS_COLORS: Record<string, string> = {
  "Nuevo": "bg-blue-100 text-blue-700",
  "Contactado": "bg-yellow-100 text-yellow-700",
  "Calificado": "bg-purple-100 text-purple-700",
  "Negociando": "bg-orange-100 text-orange-700",
  "Cerrado": "bg-green-100 text-green-700",
  "Perdido": "bg-red-100 text-red-700",
};

const CITA_STATUS_COLORS: Record<string, string> = {
  "Pendiente":  "bg-yellow-100 text-yellow-700",
  "Confirmada": "bg-blue-100 text-blue-700",
  "Realizada":  "bg-green-100 text-green-700",
  "Cancelada":  "bg-red-100 text-red-700",
};

const TIPO_ICONS: Record<string, React.ElementType> = {
  "Visita":  MapPin,
  "Llamada": Phone,
  "Virtual": Video,
};

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 }).format(n);

interface Prospecto {
  id: string;
  nombre: string;
  apellidos: string;
  correo: string | null;
  telefono: string | null;
  cedula: string | null;
  proyecto_id: string | null;
  presupuesto: number | null;
  tipo_unidad_buscada: string | null;
  status: string;
  agente_id: string | null;
  created_at: string;
  proyecto_nombre?: string | null;
}

interface Nota {
  id: string;
  contenido: string;
  autor_nombre: string | null;
  created_at: string;
}

interface Project { id: string; name: string; }

interface CitaHistorial {
  id: string;
  fecha_hora: string;
  tipo: string;
  status: string;
  notas: string | null;
  proyecto_nombre: string | null;
  agente_nombre: string | null;
}

const inputCls = "h-10 w-full rounded-sm border border-border bg-white px-3 text-sm outline-none transition focus:border-primary";
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
    {children}
  </div>
);

const ProspectoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [prospecto, setProspecto] = useState<Prospecto | null>(null);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [saving, setSaving] = useState(false);
  const [nuevaNota, setNuevaNota] = useState("");
  const [savingNota, setSavingNota] = useState(false);
  const [citas, setCitas] = useState<CitaHistorial[]>([]);
  const [cancelingCitaId, setCancelingCitaId] = useState<string | null>(null);

  // Form state (edición inline)
  const [form, setForm] = useState<Partial<Prospecto>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: p, error: pe }, { data: n }, { data: projs }, { data: c }] = await Promise.all([
      supabase
        .from("prospectos")
        .select("*, projects(name)")
        .eq("id", id!)
        .maybeSingle(),
      supabase
        .from("prospecto_notas")
        .select("id, contenido, created_at, profiles(full_name)")
        .eq("prospecto_id", id!)
        .order("created_at", { ascending: false }),
      supabase.from("projects").select("id, name").order("name"),
      supabase
        .from("citas")
        .select("id, fecha_hora, tipo, status, notas, projects(name), profiles(full_name)")
        .eq("prospecto_id", id!)
        .order("fecha_hora", { ascending: false }),
    ]);

    if (pe || !p) {
      toast.error("Prospecto no encontrado");
      navigate("/prospectos");
      return;
    }

    const pData = p as any;
    const prospectoData: Prospecto = {
      ...pData,
      proyecto_nombre: pData.projects?.name ?? null,
    };
    setProspecto(prospectoData);
    setForm(prospectoData);
    setNotas(
      (n ?? []).map((nota: any) => ({
        id: nota.id,
        contenido: nota.contenido,
        autor_nombre: nota.profiles?.full_name ?? null,
        created_at: nota.created_at,
      }))
    );
    setProjects((projs ?? []) as Project[]);
    setCitas(
      (c ?? []).map((cita: any) => ({
        id: cita.id,
        fecha_hora: cita.fecha_hora,
        tipo: cita.tipo,
        status: cita.status,
        notas: cita.notas,
        proyecto_nombre: cita.projects?.name ?? null,
        agente_nombre: cita.profiles?.full_name ?? null,
      }))
    );
    setLoading(false);
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  const onSave = async () => {
    if (!form.nombre?.trim() || !form.apellidos?.trim()) {
      toast.error("Nombre y apellidos son requeridos");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("prospectos").update({
      nombre: form.nombre?.trim(),
      apellidos: form.apellidos?.trim(),
      correo: form.correo?.trim() || null,
      telefono: form.telefono?.trim() || null,
      cedula: form.cedula?.trim() || null,
      proyecto_id: form.proyecto_id || null,
      presupuesto: form.presupuesto ?? null,
      tipo_unidad_buscada: form.tipo_unidad_buscada?.trim() || null,
      status: form.status,
    }).eq("id", id!);
    setSaving(false);
    if (error) { toast.error("Error al guardar cambios"); return; }

    const proyecto_nombre = form.proyecto_id
      ? (projects.find((p) => p.id === form.proyecto_id)?.name ?? null)
      : null;
    setProspecto({ ...form, proyecto_nombre } as Prospecto);
    toast.success("Prospecto actualizado");
  };

  const onAddNota = async () => {
    if (!nuevaNota.trim()) return;
    setSavingNota(true);
    const { data, error } = await supabase
      .from("prospecto_notas")
      .insert({ prospecto_id: id!, contenido: nuevaNota.trim(), autor_id: profile?.id ?? null })
      .select("id, contenido, created_at, profiles(full_name)")
      .single();
    setSavingNota(false);
    if (error) { toast.error("Error al agregar nota"); return; }
    setNuevaNota("");
    setNotas((prev) => [
      {
        id: data.id,
        contenido: data.contenido,
        autor_nombre: (data.profiles as any)?.full_name ?? null,
        created_at: data.created_at,
      },
      ...prev,
    ]);
  };

  const onDeleteNota = async (notaId: string) => {
    const { error } = await supabase.from("prospecto_notas").delete().eq("id", notaId);
    if (error) { toast.error("Error al eliminar nota"); return; }
    setNotas((prev) => prev.filter((n) => n.id !== notaId));
  };

  const onCancelCita = async (citaId: string) => {
    setCancelingCitaId(citaId);
    const { error } = await supabase
      .from("citas")
      .update({ status: "Cancelada" })
      .eq("id", citaId);
    setCancelingCitaId(null);
    if (error) { toast.error("Error al cancelar la cita"); return; }
    toast.success("Cita cancelada");
    setCitas((prev) =>
      prev.map((c) => c.id === citaId ? { ...c, status: "Cancelada" } : c)
    );
  };

  if (loading || !prospecto) {
    return <AppLayout title="Prospecto"><Spinner /></AppLayout>;
  }

  return (
    <AppLayout title={`${prospecto.nombre} ${prospecto.apellidos}`}>
      <Link
        to="/prospectos"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a Prospectos
      </Link>

      {/* Header */}
      <div className="mb-8 rounded-xl bg-primary p-6 shadow-elevated md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              {prospecto.nombre} {prospecto.apellidos}
            </h1>
            <div className="mt-2 flex flex-wrap gap-4">
              {prospecto.correo && (
                <span className="flex items-center gap-1.5 text-sm text-white/70">
                  <Mail className="h-3.5 w-3.5" /> {prospecto.correo}
                </span>
              )}
              {prospecto.telefono && (
                <span className="flex items-center gap-1.5 text-sm text-white/70">
                  <Phone className="h-3.5 w-3.5" /> {prospecto.telefono}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/citas/nueva?prospecto_id=${prospecto.id}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/25"
            >
              <CalendarPlus className="h-3.5 w-3.5" /> Nueva Cita
            </Link>
            <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${STATUS_COLORS[prospecto.status] ?? "bg-muted"}`}>
              {prospecto.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* LEFT — Formulario de edición */}
        <div className="space-y-6 lg:col-span-3">

          {/* Datos personales */}
          <section className="rounded-xl bg-card p-6 shadow-card">
            <h2 className="mb-4 text-base font-bold text-primary">Datos Personales</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nombre">
                  <input type="text" value={form.nombre ?? ""} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Apellidos">
                  <input type="text" value={form.apellidos ?? ""} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} className={inputCls} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Correo electrónico">
                  <input type="email" value={form.correo ?? ""} onChange={(e) => setForm({ ...form, correo: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Teléfono">
                  <input type="tel" value={form.telefono ?? ""} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className={inputCls} />
                </Field>
              </div>
              <Field label="Cédula / Identificación">
                <input type="text" value={form.cedula ?? ""} onChange={(e) => setForm({ ...form, cedula: e.target.value })} className={inputCls} />
              </Field>
            </div>
          </section>

          {/* Datos de interés */}
          <section className="rounded-xl bg-card p-6 shadow-card">
            <h2 className="mb-4 text-base font-bold text-primary">Datos de Interés</h2>
            <div className="space-y-4">
              <Field label="Proyecto de interés">
                <select
                  value={form.proyecto_id ?? ""}
                  onChange={(e) => setForm({ ...form, proyecto_id: e.target.value || null })}
                  className={inputCls}
                >
                  <option value="">Sin asignar</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Presupuesto (₡ CRC)">
                  <input
                    type="number"
                    min={0}
                    value={form.presupuesto ?? ""}
                    onChange={(e) => setForm({ ...form, presupuesto: e.target.value ? Number(e.target.value) : null })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Tipo de unidad buscada">
                  <input type="text" value={form.tipo_unidad_buscada ?? ""} onChange={(e) => setForm({ ...form, tipo_unidad_buscada: e.target.value })} className={inputCls} placeholder="Ej. Casa 3 hab." />
                </Field>
              </div>
            </div>
          </section>

          {/* Estado */}
          <section className="rounded-xl bg-card p-6 shadow-card">
            <h2 className="mb-4 text-base font-bold text-primary">Estado del Prospecto</h2>
            <Field label="Estado actual">
              <select value={form.status ?? "Nuevo"} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                {PROSPECTO_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </section>

          <div className="flex justify-end">
            <button
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>

        {/* RIGHT — Notas de seguimiento */}
        <div className="lg:col-span-2">
          <section className="rounded-xl bg-card p-6 shadow-card">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-primary">
              <MessageSquarePlus className="h-4 w-4" />
              Notas de Seguimiento
            </h2>

            {/* Nueva nota */}
            <div className="mb-5">
              <textarea
                value={nuevaNota}
                onChange={(e) => setNuevaNota(e.target.value)}
                rows={3}
                placeholder="Escribe una nota de seguimiento..."
                className="w-full rounded-sm border border-border bg-background/60 p-3 text-sm outline-none transition focus:border-primary"
              />
              <button
                onClick={onAddNota}
                disabled={savingNota || !nuevaNota.trim()}
                className="mt-2 w-full rounded-md bg-accent py-2 text-sm font-bold text-primary transition hover:bg-accent/80 disabled:opacity-60"
              >
                {savingNota ? "Agregando..." : "Agregar nota"}
              </button>
            </div>

            {/* Lista de notas */}
            {notas.length === 0 ? (
              <p className="py-6 text-center text-sm italic text-muted-foreground">
                Sin notas registradas
              </p>
            ) : (
              <ol className="space-y-3">
                {notas.map((n) => (
                  <li key={n.id} className="relative rounded-lg border border-border bg-secondary/30 p-3 pr-8">
                    <p className="text-sm text-foreground">{n.contenido}</p>
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(n.created_at), "dd/MM/yyyy HH:mm")}
                      {n.autor_nombre && <> · {n.autor_nombre}</>}
                    </div>
                    <button
                      onClick={() => onDeleteNota(n.id)}
                      className="absolute right-2 top-2 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Info extra */}
          <section className="mt-4 rounded-xl bg-card p-4 shadow-card">
            <div className="space-y-2 text-xs text-muted-foreground">
              {prospecto.proyecto_nombre && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Interesado en: <strong className="text-foreground">{prospecto.proyecto_nombre}</strong></span>
                </div>
              )}
              {prospecto.presupuesto && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>Presupuesto: <strong className="text-foreground">{fmt(prospecto.presupuesto)}</strong></span>
                </div>
              )}
              {prospecto.cedula && (
                <div className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5" />
                  <span>Cédula: <strong className="text-foreground">{prospecto.cedula}</strong></span>
                </div>
              )}
              {prospecto.tipo_unidad_buscada && (
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5" />
                  <span>Busca: <strong className="text-foreground">{prospecto.tipo_unidad_buscada}</strong></span>
                </div>
              )}
              <div className="pt-1 text-[11px]">
                Registrado el {format(new Date(prospecto.created_at), "dd 'de' MMMM yyyy", { locale: es })}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Historial de Citas */}
      <section className="mt-6 rounded-xl bg-card p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold text-primary">
            <Calendar className="h-4 w-4" />
            Historial de Citas
          </h2>
          <span className="text-xs text-muted-foreground">{citas.length} cita(s)</span>
        </div>

        {citas.length === 0 ? (
          <p className="py-6 text-center text-sm italic text-muted-foreground">
            Sin citas registradas
          </p>
        ) : (
          <div className="space-y-3">
            {citas.map((cita) => {
              const TipoIcon = TIPO_ICONS[cita.tipo] ?? Calendar;
              const fecha = new Date(cita.fecha_hora);
              return (
                <div
                  key={cita.id}
                  className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-secondary/20 p-4 transition hover:bg-secondary/30"
                >
                  {/* Fecha */}
                  <div className="flex w-16 shrink-0 flex-col items-center rounded-lg bg-primary/10 py-1.5 text-center">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                      {format(fecha, "MMM", { locale: es })}
                    </span>
                    <span className="text-xl font-extrabold leading-tight text-primary">
                      {format(fecha, "dd")}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {format(fecha, "HH:mm")}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <TipoIcon className="h-3.5 w-3.5" />
                        {cita.tipo}
                      </div>
                      {cita.proyecto_nombre && (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                          {cita.proyecto_nombre}
                        </span>
                      )}
                      {cita.agente_nombre && (
                        <span className="text-[11px] text-muted-foreground">
                          Agente: {cita.agente_nombre}
                        </span>
                      )}
                    </div>
                    {cita.notas && (
                      <p className="mt-1 text-xs text-muted-foreground">{cita.notas}</p>
                    )}
                  </div>

                  {/* Status + Acciones */}
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${CITA_STATUS_COLORS[cita.status] ?? "bg-muted"}`}>
                      {cita.status}
                    </span>
                    <Link
                      to={`/citas/${cita.id}/editar`}
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-secondary"
                    >
                      Editar
                    </Link>
                    {cita.status !== "Cancelada" && cita.status !== "Realizada" && (
                      <button
                        onClick={() => onCancelCita(cita.id)}
                        disabled={cancelingCitaId === cita.id}
                        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        {cancelingCitaId === cita.id ? "Cancelando..." : "Cancelar"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </AppLayout>
  );
};

export default ProspectoDetail;
