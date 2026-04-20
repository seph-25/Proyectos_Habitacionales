import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Spinner } from "@/components/Spinner";
import { supabase } from "@/integrations/supabase/client";
import { PROJECT_STATUSES, PROJECT_TYPES, PROVINCES } from "@/lib/status";

interface FormState {
  name: string;
  province: string;
  canton: string;
  description: string;
  project_type: string;
  units: string;
  start_date: string;
  status: string;
}

const empty: FormState = {
  name: "",
  province: "",
  canton: "",
  description: "",
  project_type: "",
  units: "",
  start_date: "",
  status: "En gestación",
};

type Errors = Partial<Record<keyof FormState, string>>;

const Field = ({ label, error, children, required }: { label: string; error?: string; children: React.ReactNode; required?: boolean }) => (
  <div>
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {label} {required && <span className="text-destructive">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
  </div>
);

const inputCls = "h-10 w-full rounded-sm border border-border bg-white px-3 text-sm outline-none transition-all focus:border-primary";

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;
    (async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id!).maybeSingle();
      if (error || !data) {
        toast.error("Proyecto no encontrado");
        navigate("/proyectos");
        return;
      }
      setForm({
        name: data.name ?? "",
        province: data.province ?? "",
        canton: data.canton ?? "",
        description: data.description ?? "",
        project_type: data.project_type ?? "",
        units: data.units?.toString() ?? "",
        start_date: data.start_date ?? "",
        status: data.status ?? "En gestación",
      });
      setLoading(false);
    })();
  }, [id, editing, navigate]);

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.name.trim()) e.name = "Nombre requerido";
    else if (form.name.length > 120) e.name = "Máximo 120 caracteres";
    if (!form.province) e.province = "Selecciona una provincia";
    if (!form.canton.trim()) e.canton = "Cantón requerido";
    if (!form.description.trim()) e.description = "Descripción requerida";
    else if (form.description.length > 2000) e.description = "Máximo 2000 caracteres";
    if (!form.project_type) e.project_type = "Selecciona un tipo";
    if (!form.units || Number(form.units) < 1) e.units = "Mínimo 1 unidad";
    if (!form.start_date) e.start_date = "Fecha requerida";
    if (!form.status) e.status = "Estado requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      province: form.province,
      canton: form.canton.trim(),
      description: form.description.trim(),
      project_type: form.project_type,
      units: Number(form.units),
      start_date: form.start_date,
      status: form.status,
    };

    const { error } = editing
      ? await supabase.from("projects").update(payload).eq("id", id!)
      : await supabase.from("projects").insert(payload);

    setSaving(false);
    if (error) {
      toast.error("Error al guardar el proyecto");
      return;
    }
    toast.success("Proyecto guardado exitosamente");
    navigate("/proyectos");
  };

  if (loading) {
    return (
      <AppLayout title={editing ? "Editar Proyecto" : "Nuevo Proyecto"}>
        <Spinner />
      </AppLayout>
    );
  }

  return (
    <AppLayout title={editing ? "Editar Proyecto" : "Nuevo Proyecto"}>
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <h1 className="mb-8 text-2xl font-bold text-foreground">
        {editing ? "Editar Proyecto" : "Nuevo Proyecto"}
      </h1>

      <form onSubmit={onSubmit} className="mx-auto max-w-[720px] rounded-lg bg-card p-8 shadow-card">
        <div className="space-y-5">
          <Field label="Nombre del proyecto" required error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={120}
              className={inputCls}
              placeholder="Ej. Residencial Vista Verde"
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Provincia" required error={errors.province}>
              <select
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
                className={inputCls}
              >
                <option value="">Selecciona...</option>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Cantón" required error={errors.canton}>
              <input
                type="text"
                value={form.canton}
                onChange={(e) => setForm({ ...form, canton: e.target.value })}
                maxLength={120}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Descripción" required error={errors.description}>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              maxLength={2000}
              className="w-full rounded-sm border border-border bg-white p-3 text-sm outline-none transition-all focus:border-primary"
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Tipo de proyecto" required error={errors.project_type}>
              <select
                value={form.project_type}
                onChange={(e) => setForm({ ...form, project_type: e.target.value })}
                className={inputCls}
              >
                <option value="">Selecciona...</option>
                {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Número de unidades" required error={errors.units}>
              <input
                type="number"
                min={1}
                value={form.units}
                onChange={(e) => setForm({ ...form, units: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Fecha de inicio" required error={errors.start_date}>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Estado inicial" required error={errors.status}>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={inputCls}
              >
                {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-border pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border border-border bg-white px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary-deep disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar Proyecto"}
          </button>
        </div>
      </form>
    </AppLayout>
  );
};

export default ProjectForm;
