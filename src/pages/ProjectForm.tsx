import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Spinner } from "@/components/Spinner";
import { supabase } from "@/integrations/supabase/client";
import {
  PROJECT_STATUSES,
  PROJECT_TYPES,
  PROVINCES,
  AMENITIES_LIST,
  type UnitType,
  type FinancingOption,
} from "@/lib/status";

/* ─────────────────────────────── tipos ──────────────────────────────── */
interface FormState {
  name: string;
  province: string;
  canton: string;
  description: string;
  project_type: string;
  units: string;
  start_date: string;
  status: string;
  // Nuevos campos Sprint 2
  address: string;
  coordinates: string;
  price_from: string;
  area_m2_from: string;
  amenities: string[];
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
  address: "",
  coordinates: "",
  price_from: "",
  area_m2_from: "",
  amenities: [],
};

type Errors = Partial<Record<keyof FormState | "unit_types" | "financing_options", string>>;

const emptyUnit = (): UnitType => ({
  nombre: "",
  habitaciones: 1,
  banos: 1,
  area_m2: 0,
  precio: 0,
});
const emptyFinancing = (): FinancingOption => ({
  banco: "",
  tasa: 0,
  plazo_anos: 20,
  notas: "",
});

/* ───────────────────────── componentes UI pequeños ───────────────────── */
const Field = ({
  label,
  error,
  children,
  required,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}) => (
  <div>
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {label} {required && <span className="text-destructive">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs font-medium text-destructive">{error}</p>}
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
  <h2 className="border-b border-border pb-2 text-sm font-bold uppercase tracking-wide text-primary">
    {title}
  </h2>
);

const inputCls =
  "h-10 w-full rounded-sm border border-border bg-white px-3 text-sm outline-none transition-all focus:border-primary";

/* ─────────────────────────────── página ─────────────────────────────── */
const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [form, setForm] = useState<FormState>(empty);
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [financingOptions, setFinancingOptions] = useState<FinancingOption[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) return;
    (async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
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
        address: data.address ?? "",
        coordinates: data.coordinates ?? "",
        price_from: data.price_from?.toString() ?? "",
        area_m2_from: data.area_m2_from?.toString() ?? "",
        amenities: (data.amenities as string[]) ?? [],
      });
      setUnitTypes(Array.isArray(data.unit_types) ? (data.unit_types as UnitType[]) : []);
      setFinancingOptions(
        Array.isArray(data.financing_options)
          ? (data.financing_options as FinancingOption[])
          : []
      );
      setLoading(false);
    })();
  }, [id, editing, navigate]);

  /* ────────── helpers ────────── */
  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleAmenity = (a: string) =>
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter((x) => x !== a)
        : [...prev.amenities, a],
    }));

  // Unit types helpers
  const addUnit = () => setUnitTypes((prev) => [...prev, emptyUnit()]);
  const removeUnit = (i: number) => setUnitTypes((prev) => prev.filter((_, idx) => idx !== i));
  const updateUnit = <K extends keyof UnitType>(i: number, key: K, value: UnitType[K]) =>
    setUnitTypes((prev) => prev.map((u, idx) => (idx === i ? { ...u, [key]: value } : u)));

  // Financing helpers
  const addFinancing = () => setFinancingOptions((prev) => [...prev, emptyFinancing()]);
  const removeFinancing = (i: number) =>
    setFinancingOptions((prev) => prev.filter((_, idx) => idx !== i));
  const updateFinancing = <K extends keyof FinancingOption>(
    i: number,
    key: K,
    value: FinancingOption[K]
  ) =>
    setFinancingOptions((prev) =>
      prev.map((f, idx) => (idx === i ? { ...f, [key]: value } : f))
    );

  /* ────────── validación ────────── */
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
    if (
      form.coordinates &&
      !/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(form.coordinates.trim())
    )
      e.coordinates = 'Formato inválido. Usa "lat,lng" (ej. 9.9281,-84.0907)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ────────── submit ────────── */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      province: form.province,
      canton: form.canton.trim(),
      description: form.description.trim() || null,
      project_type: form.project_type || null,
      units: form.units ? Number(form.units) : null,
      start_date: form.start_date || null,
      status: form.status,
      address: form.address.trim() || null,
      coordinates: form.coordinates.trim() || null,
      price_from: form.price_from ? Number(form.price_from) : null,
      area_m2_from: form.area_m2_from ? Number(form.area_m2_from) : null,
      amenities: form.amenities.length > 0 ? form.amenities : [],
      unit_types: unitTypes.length > 0 ? unitTypes : [],
      financing_options: financingOptions.length > 0 ? financingOptions : [],
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

      <form onSubmit={onSubmit} className="mx-auto max-w-[800px] space-y-8">

        {/* ── Sección 1: Información General ── */}
        <div className="rounded-lg bg-card p-6 shadow-card">
          <SectionHeader title="Información General" />
          <div className="mt-5 space-y-5">
            <Field label="Nombre del proyecto" required error={errors.name}>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                maxLength={120}
                className={inputCls}
                placeholder="Ej. Residencial Vista Verde"
              />
            </Field>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Provincia" required error={errors.province}>
                <select
                  value={form.province}
                  onChange={(e) => set("province", e.target.value)}
                  className={inputCls}
                >
                  <option value="">Selecciona...</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field label="Cantón" required error={errors.canton}>
                <input
                  type="text"
                  value={form.canton}
                  onChange={(e) => set("canton", e.target.value)}
                  maxLength={120}
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Descripción" required error={errors.description}>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                maxLength={2000}
                className="w-full rounded-sm border border-border bg-white p-3 text-sm outline-none transition-all focus:border-primary"
              />
            </Field>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Tipo de proyecto" required error={errors.project_type}>
                <select
                  value={form.project_type}
                  onChange={(e) => set("project_type", e.target.value)}
                  className={inputCls}
                >
                  <option value="">Selecciona...</option>
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Número de unidades" required error={errors.units}>
                <input
                  type="number"
                  min={1}
                  value={form.units}
                  onChange={(e) => set("units", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Fecha de inicio" required error={errors.start_date}>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => set("start_date", e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Estado" required error={errors.status}>
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                  className={inputCls}
                >
                  {PROJECT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        </div>

        {/* ── Sección 2: Ubicación y Precios ── */}
        <div className="rounded-lg bg-card p-6 shadow-card">
          <SectionHeader title="Ubicación y Precios" />
          <div className="mt-5 space-y-5">
            <Field label="Dirección exacta" error={errors.address}>
              <input
                type="text"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                maxLength={300}
                className={inputCls}
                placeholder="Ej. 300m norte de la iglesia, San Rafael, Heredia"
              />
            </Field>

            <Field
              label='Coordenadas GPS (formato "latitud,longitud")'
              error={errors.coordinates}
            >
              <input
                type="text"
                value={form.coordinates}
                onChange={(e) => set("coordinates", e.target.value)}
                className={inputCls}
                placeholder="Ej. 9.9281,-84.0907"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Puedes obtenerlas desde Google Maps → clic derecho sobre la ubicación.
              </p>
            </Field>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Precio desde (₡ CRC)" error={errors.price_from}>
                <input
                  type="number"
                  min={0}
                  value={form.price_from}
                  onChange={(e) => set("price_from", e.target.value)}
                  className={inputCls}
                  placeholder="Ej. 75000000"
                />
              </Field>
              <Field label="Área mínima (m²)" error={errors.area_m2_from}>
                <input
                  type="number"
                  min={0}
                  value={form.area_m2_from}
                  onChange={(e) => set("area_m2_from", e.target.value)}
                  className={inputCls}
                  placeholder="Ej. 85"
                />
              </Field>
            </div>
          </div>
        </div>

        {/* ── Sección 3: Amenidades ── */}
        <div className="rounded-lg bg-card p-6 shadow-card">
          <SectionHeader title="Amenidades" />
          <p className="mt-2 text-xs text-muted-foreground">
            Selecciona todas las amenidades que ofrece el proyecto.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {AMENITIES_LIST.map((a) => (
              <label
                key={a}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  form.amenities.includes(a)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary/40 text-foreground hover:border-primary/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.amenities.includes(a)}
                  onChange={() => toggleAmenity(a)}
                  className="h-3.5 w-3.5 accent-primary"
                />
                {a}
              </label>
            ))}
          </div>
        </div>

        {/* ── Sección 4: Modelos de Unidades ── */}
        <div className="rounded-lg bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <SectionHeader title="Modelos de Unidades" />
            <button
              type="button"
              onClick={addUnit}
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-bold text-primary transition hover:-translate-y-0.5"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar modelo
            </button>
          </div>

          {unitTypes.length === 0 && (
            <p className="mt-4 text-xs italic text-muted-foreground">
              No hay modelos de unidades. Haz clic en "Agregar modelo" para añadir.
            </p>
          )}

          <div className="mt-4 space-y-4">
            {unitTypes.map((u, i) => (
              <div
                key={i}
                className="rounded-lg border border-border p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">
                    Modelo {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeUnit(i)}
                    className="rounded p-1 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  <div className="col-span-2 md:col-span-1">
                    <Field label="Nombre del modelo">
                      <input
                        type="text"
                        value={u.nombre}
                        onChange={(e) => updateUnit(i, "nombre", e.target.value)}
                        className={inputCls}
                        placeholder="Ej. Tipo A"
                      />
                    </Field>
                  </div>
                  <Field label="Habitaciones">
                    <input
                      type="number"
                      min={0}
                      value={u.habitaciones}
                      onChange={(e) => updateUnit(i, "habitaciones", Number(e.target.value))}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Baños">
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={u.banos}
                      onChange={(e) => updateUnit(i, "banos", Number(e.target.value))}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Área (m²)">
                    <input
                      type="number"
                      min={0}
                      value={u.area_m2}
                      onChange={(e) => updateUnit(i, "area_m2", Number(e.target.value))}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Precio (₡ CRC)">
                    <input
                      type="number"
                      min={0}
                      value={u.precio}
                      onChange={(e) => updateUnit(i, "precio", Number(e.target.value))}
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sección 5: Opciones de Financiamiento ── */}
        <div className="rounded-lg bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <SectionHeader title="Opciones de Financiamiento" />
            <button
              type="button"
              onClick={addFinancing}
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-bold text-primary transition hover:-translate-y-0.5"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar opción
            </button>
          </div>

          {financingOptions.length === 0 && (
            <p className="mt-4 text-xs italic text-muted-foreground">
              No hay opciones de financiamiento. Haz clic en "Agregar opción" para añadir.
            </p>
          )}

          <div className="mt-4 space-y-4">
            {financingOptions.map((f, i) => (
              <div key={i} className="rounded-lg border border-border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">
                    Opción {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFinancing(i)}
                    className="rounded p-1 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Field label="Banco / Entidad">
                    <input
                      type="text"
                      value={f.banco}
                      onChange={(e) => updateFinancing(i, "banco", e.target.value)}
                      className={inputCls}
                      placeholder="Ej. BAC San José"
                    />
                  </Field>
                  <Field label="Tasa anual (%)">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={f.tasa}
                      onChange={(e) => updateFinancing(i, "tasa", Number(e.target.value))}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Plazo (años)">
                    <input
                      type="number"
                      min={1}
                      value={f.plazo_anos}
                      onChange={(e) => updateFinancing(i, "plazo_anos", Number(e.target.value))}
                      className={inputCls}
                    />
                  </Field>
                  <div className="md:col-span-3">
                    <Field label="Notas adicionales">
                      <input
                        type="text"
                        value={f.notas}
                        onChange={(e) => updateFinancing(i, "notas", e.target.value)}
                        className={inputCls}
                        placeholder="Ej. Requiere prima del 20%, disponible en colones y dólares"
                      />
                    </Field>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Acciones ── */}
        <div className="flex items-center justify-end gap-3 rounded-lg bg-card px-6 py-4 shadow-card">
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
