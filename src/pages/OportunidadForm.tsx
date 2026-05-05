import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Spinner } from "@/components/Spinner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const ETAPAS = ["Nueva", "Contactado", "Calificado", "Propuesta", "Negociación"] as const;

interface Prospecto { id: string; nombre: string; apellidos: string; proyecto_id: string | null; }
interface Project   { id: string; name: string; }

interface FormState {
  prospecto_id: string;
  proyecto_id: string;
  etapa: string;
  valor_estimado: string;
  fecha_cierre_estimada: string;
  notas: string;
}

const empty: FormState = {
  prospecto_id: "",
  proyecto_id: "",
  etapa: "Nueva",
  valor_estimado: "",
  fecha_cierre_estimada: "",
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

const OportunidadForm = () => {
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
    Promise.all([
      supabase.from("prospectos").select("id, nombre, apellidos, proyecto_id").order("nombre"),
      supabase.from("projects").select("id, name").order("name"),
    ]).then(([{ data: p }, { data: pr }]) => {
      const prospectosList = (p ?? []) as Prospecto[];
      setProspectos(prospectosList);
      setProjects((pr ?? []) as Project[]);

      if (preselectedProspectoId && !editing) {
        const match = prospectosList.find((x) => x.id === preselectedProspectoId);
        setForm((prev) => ({
          ...prev,
          prospecto_id: preselectedProspectoId,
          proyecto_id: match?.proyecto_id ?? "",
        }));
      }
    });

    if (!editing) return;
    (async () => {
      const { data, error } = await supabase
        .from("oportunidades")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error || !data) {
        toast.error("Oportunidad no encontrada");
        navigate("/oportunidades");
        return;
      }
      const fechaLocal = data.fecha_cierre_estimada ? new Date(data.fecha_cierre_estimada).toISOString().split('T')[0] : "";
      setForm({
        prospecto_id: data.prospecto_id,
        proyecto_id: data.proyecto_id ?? "",
        etapa: data.etapa,
        valor_estimado: data.valor_estimado?.toString() ?? "",
        fecha_cierre_estimada: fechaLocal,
        notas: data.notas ?? "",
      });
      setLoading(false);
    })();
  }, [id, editing, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.prospecto_id) { toast.error("Selecciona un prospecto"); return; }

    setSaving(true);
    const payload = {
      prospecto_id: form.prospecto_id,
      proyecto_id: form.proyecto_id || null,
      etapa: form.etapa,
      valor_estimado: form.valor_estimado ? parseFloat(form.valor_estimado) : null,
      fecha_cierre_estimada: form.fecha_cierre_estimada ? new Date(form.fecha_cierre_estimada).toISOString().split('T')[0] : null,
      notas: form.notas.trim() || null,
    };

    if (editing) {
      const { error } = await supabase.from("oportunidades").update(payload).eq("id", id!);
      setSaving(false);
      if (error) { toast.error("Error al guardar la oportunidad"); return; }
      toast.success("Oportunidad actualizada");
      navigate("/oportunidades");
    } else {
      const { data: newOpp, error: oppError } = await supabase.from("oportunidades").insert(payload).select().single();
      if (oppError || !newOpp) {
        setSaving(false);
        toast.error("Error al crear la oportunidad");
        return;
      }

      const historialPayload = {
        oportunidad_id: newOpp.id,
        etapa_anterior: null,
        etapa_nueva: form.etapa,
        changed_by: profile?.full_name ?? "Unknown",
      };
      const { error: histError } = await supabase.from("oportunidades_historial").insert(historialPayload);
      setSaving(false);
      if (histError) { toast.error("Error al registrar el historial"); return; }
      toast.success("Oportunidad creada exitosamente");
      navigate("/oportunidades");
    }
  };

  if (loading) {
    return <AppLayout title="Oportunidad"><Spinner /></AppLayout>;
  }

  return (
    <AppLayout title={editing ? "Editar Oportunidad" : "Nueva Oportunidad"}>
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <h1 className="mb-8 text-2xl font-bold text-foreground">
        {editing ? "Editar Oportunidad" : "Nueva Oportunidad"}
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

        <Field label="Etapa" required>
          <select
            value={form.etapa}
            onChange={(e) => setForm({ ...form, etapa: e.target.value })}
            className={inputCls}
          >
            {ETAPAS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Valor estimado">
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.valor_estimado}
              onChange={(e) => setForm({ ...form, valor_estimado: e.target.value })}
              placeholder="0.00"
              className={inputCls}
            />
          </Field>
          <Field label="Fecha cierre estimada">
            <input
              type="date"
              value={form.fecha_cierre_estimada}
              onChange={(e) => setForm({ ...form, fecha_cierre_estimada: e.target.value })}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Notas adicionales">
          <textarea
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            rows={3}
            placeholder="Ej. Cliente interesado en apartamento de 3 habitaciones..."
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
            {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear Oportunidad"}
          </button>
        </div>
      </form>
    </AppLayout>
  );
};

export default OportunidadForm;
