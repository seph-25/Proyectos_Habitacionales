import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, UserPlus, Users, Phone, Mail, SlidersHorizontal } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Spinner } from "@/components/Spinner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const PROSPECTO_STATUSES = [
  "Nuevo", "Contactado", "Calificado", "Negociando", "Cerrado", "Perdido",
] as const;

const STATUS_COLORS: Record<string, string> = {
  "Nuevo":       "bg-blue-100 text-blue-700",
  "Contactado":  "bg-yellow-100 text-yellow-700",
  "Calificado":  "bg-purple-100 text-purple-700",
  "Negociando":  "bg-orange-100 text-orange-700",
  "Cerrado":     "bg-green-100 text-green-700",
  "Perdido":     "bg-red-100 text-red-700",
};

interface Prospecto {
  id: string;
  nombre: string;
  apellidos: string;
  correo: string | null;
  telefono: string | null;
  status: string;
  created_at: string;
  proyecto_id: string | null;
  proyecto_nombre: string | null;
}

interface Project { id: string; name: string; }

interface FormState {
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  cedula: string;
  status: string;
  proyecto_id: string;
  tipo_unidad_buscada: string;
}

const emptyForm: FormState = {
  nombre: "", apellidos: "", correo: "",
  telefono: "", cedula: "", status: "Nuevo",
  proyecto_id: "", tipo_unidad_buscada: "",
};

const inputCls = "h-10 w-full rounded-sm border border-border bg-white px-3 text-sm outline-none transition focus:border-primary";

const Prospectos = () => {
  const [loading, setLoading] = useState(true);
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data }, { data: projs }] = await Promise.all([
      supabase
        .from("prospectos")
        .select("id, nombre, apellidos, correo, telefono, status, created_at, proyecto_id, projects(name)")
        .order("created_at", { ascending: false }),
      supabase.from("projects").select("id, name").order("name"),
    ]);

    setProspectos(
      (data ?? []).map((p: any) => ({
        id: p.id,
        nombre: p.nombre,
        apellidos: p.apellidos,
        correo: p.correo,
        telefono: p.telefono,
        status: p.status,
        created_at: p.created_at,
        proyecto_id: p.proyecto_id ?? null,
        proyecto_nombre: p.projects?.name ?? null,
      }))
    );
    setProjects((projs ?? []) as Project[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return prospectos.filter((p) => {
      const matchText =
        p.nombre.toLowerCase().includes(q) ||
        p.apellidos.toLowerCase().includes(q) ||
        (p.correo ?? "").toLowerCase().includes(q) ||
        (p.telefono ?? "").includes(q);
      const matchProject = projectFilter === "Todos" || p.proyecto_id === projectFilter;
      return matchText && matchProject;
    });
  }, [prospectos, search, projectFilter]);

  const onSave = async () => {
    if (!form.nombre.trim() || !form.apellidos.trim()) {
      toast.error("Nombre y apellidos son requeridos");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("prospectos").insert({
      nombre: form.nombre.trim(),
      apellidos: form.apellidos.trim(),
      correo: form.correo.trim() || null,
      telefono: form.telefono.trim() || null,
      cedula: form.cedula.trim() || null,
      status: form.status,
      proyecto_id: form.proyecto_id || null,
      tipo_unidad_buscada: form.tipo_unidad_buscada.trim() || null,
    });
    setSaving(false);
    if (error) { toast.error("Error al registrar el prospecto"); return; }
    toast.success("Prospecto registrado exitosamente");
    setModalOpen(false);
    setForm(emptyForm);
    load();
  };

  return (
    <AppLayout title="Prospectos">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Prospectos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} de {prospectos.length} prospecto(s)
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
        >
          <UserPlus className="h-4 w-4" /> Nuevo Prospecto
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-3 rounded-lg bg-card p-4 shadow-card">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo o teléfono..."
            className="h-10 w-full rounded-sm border border-border bg-background/60 pl-9 pr-3 text-sm outline-none transition focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="h-10 min-w-[200px] rounded-sm border border-border bg-white px-3 text-sm outline-none focus:border-primary"
          >
            <option value="Todos">Todos los proyectos</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="rounded-lg bg-card p-16 text-center shadow-card">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 font-semibold text-foreground">Sin prospectos</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {prospectos.length === 0
              ? "Registra tu primer prospecto con el botón de arriba."
              : "Ajusta los filtros para encontrar prospectos."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-card shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nombre</th>
                <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">Contacto</th>
                <th className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">Proyecto de interés</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-secondary/30">
                  <td className="px-5 py-4">
                    <Link
                      to={`/prospectos/${p.id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {p.nombre} {p.apellidos}
                    </Link>
                  </td>
                  <td className="hidden px-5 py-4 md:table-cell">
                    <div className="space-y-0.5">
                      {p.correo && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" /> {p.correo}
                        </div>
                      )}
                      {p.telefono && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" /> {p.telefono}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-5 py-4 lg:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {p.proyecto_nombre ?? "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_COLORS[p.status] ?? "bg-muted text-muted-foreground"}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal nuevo prospecto */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo Prospecto</DialogTitle>
            <DialogDescription>Registra los datos básicos del prospecto.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Nombre <span className="text-destructive">*</span>
                </label>
                <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Apellidos <span className="text-destructive">*</span>
                </label>
                <input type="text" value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Correo</label>
                <input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Teléfono</label>
                <input type="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cédula</label>
                <input type="text" value={form.cedula} onChange={(e) => setForm({ ...form, cedula: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado inicial</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                  {PROSPECTO_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proyecto de interés</label>
              <select value={form.proyecto_id} onChange={(e) => setForm({ ...form, proyecto_id: e.target.value })} className={inputCls}>
                <option value="">Sin asignar</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipo de propiedad buscada</label>
              <input type="text" value={form.tipo_unidad_buscada} onChange={(e) => setForm({ ...form, tipo_unidad_buscada: e.target.value })} placeholder="Ej. Casa 3 habitaciones" className={inputCls} />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setModalOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary">
              Cancelar
            </button>
            <button onClick={onSave} disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
              {saving ? "Guardando..." : "Registrar"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Prospectos;
