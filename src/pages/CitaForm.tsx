import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Spinner } from "@/components/Spinner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const CITA_STATUSES = ["Pendiente", "Confirmada", "Realizada", "Cancelada"] as const;
const CITA_TIPOS = ["Visita", "Llamada", "Virtual"] as const;

interface Prospecto { id: string; nombre: string; apellidos: string; proyecto_id: string | null; }
interface Project   { id: string; name: string; }

interface FormState {
  prospecto_id: string;
  proyecto_id: string;
  fecha_hora: string;
  tipo: string;
  status: string;
  notas: string;
}

const empty: FormState = {
  prospecto_id: "",
  proyecto_id: "",
  fecha_hora: "",
  tipo: "Visita",
  status: "Pendiente",
  notas: "",
};

const inputCls = "h-10 w-full rounded-sm border border-border bg-white px-3 text-sm outline-none transition focus:border-primary";
const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {label} {required && <span className="text-destructive">*</span>}
    </label>
    {children}
  </div>
);

const CitaForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const editing = Boolean(id);
  const preselectedProspectoId = searchParams.get("prospecto_id") ?? "";

  const [form, setForm] = useState<FormState>(empty);
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Cargar listas de selección
    Promise.all([
      supabase.from("prospectos").select("id, nombre, apellidos, proyecto_id").order("nombre"),
      supabase.from("projects").select("id, name").order("name"),
    ]).then(([{ data: p }, { data: pr }]) => {
      const prospectosList = (p ?? []) as Prospecto[];
      setProspectos(prospectosList);
      setProjects((pr ?? []) as Project[]);

      // Si hay prospecto pre-seleccionado (viene desde el perfil del prospecto),
      // auto-poblar también su proyecto de interés
      if (preselectedProspectoId && !editing) {
        const match = prospectosList.find((x) => x.id === preselectedProspectoId);
        setForm((prev) => ({
          ...prev,
          prospecto_id: preselectedProspectoId,
          proyecto_id: match?.proyecto_id ?? "",
        }));
      }
    });

    // Si es edición, cargar datos de la cita
    if (!editing) return;
    (async () => {
      const { data, error } = await supabase
        .from("citas")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error || !data) {
        toast.error("Cita no encontrada");
        navigate("/citas");
        return;
      }
      // fecha_hora viene como ISO string, convertir a formato datetime-local
      const fechaLocal = new Date(data.fecha_hora).toISOString().slice(0, 16);
      setForm({
        prospecto_id: data.prospecto_id,
        proyecto_id: data.proyecto_id ?? "",
        fecha_hora: fechaLocal,
        tipo: data.tipo,
        status: data.status,
        notas: data.notas ?? "",
      });
      setLoading(false);
    })();
  }, [id, editing, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.prospecto_id) { toast.error("Selecciona un prospecto"); return; }
    if (!form.fecha_hora)   { toast.error("Ingresa la fecha y hora"); return; }

    setSaving(true);
    const payload = {
      prospecto_id: form.prospecto_id,
      proyecto_id: form.proyecto_id || null,
      fecha_hora: new Date(form.fecha_hora).toISOString(),
      tipo: form.tipo,
      status: form.status,
      notas: form.notas.trim() || null,
      agente_id: profile?.id ?? null,
    };

    const { error } = editing
      ? await supabase.from("citas").update(payload).eq("id", id!)
      : await supabase.from("citas").insert(payload);

    setSaving(false);
    if (error) { toast.error("Error al guardar la cita"); return; }
    toast.success(editing ? "Cita actualizada" : "Cita creada exitosamente");
    navigate("/citas");
  };

  if (loading) {
    return <AppLayout title="Cita"><Spinner /></AppLayout>;
  }

  return (
    <AppLayout title={editing ? "Editar Cita" : "Nueva Cita"}>
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <h1 className="mb-8 text-2xl font-bold text-foreground">
        {editing ? "Editar Cita" : "Nueva Cita"}
      </h1>

      <form onSubmit={onSubmit} className="mx-auto max-w-[600px] space-y-6 rounded-xl bg-card p-8 shadow-card">
        <Field label="Prospecto" required>
          <select
            value={form.prospecto_id}
            onChange={(e) => {
              const selected = prospectos.find((p) => p.id === e.target.value);
              setForm({
                ...form,
                prospecto_id: e.target.value,
                proyecto_id: selected?.proyecto_id ?? "",
              });
            }}
            className={inputCls}
          >
            <option value="">Selecciona un prospecto...</option>
            {prospectos.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre} {p.apellidos}</option>
            ))}
          </select>
        </Field>

        <Field label="Proyecto relacionado">
          <select
            value={form.proyecto_id}
            onChange={(e) => setForm({ ...form, proyecto_id: e.target.value })}
            className={inputCls}
          >
            <option value="">Sin proyecto asignado</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Fecha y hora" required>
          <input
            type="datetime-local"
            value={form.fecha_hora}
            onChange={(e) => setForm({ ...form, fecha_hora: e.target.value })}
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Tipo de cita" required>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className={inputCls}
            >
              {CITA_TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Estado">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={inputCls}
            >
              {CITA_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Notas adicionales">
          <textarea
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            rows={3}
            placeholder="Ej. Traer documentos de identificación, reunión en sala de ventas..."
            className="w-full rounded-sm border border-border bg-white p-3 text-sm outline-none transition focus:border-primary"
          />
        </Field>

        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border border-border bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear Cita"}
          </button>
        </div>
      </form>
    </AppLayout>
  );
};

export default CitaForm;
