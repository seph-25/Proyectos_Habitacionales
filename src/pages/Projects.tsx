import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, MapPin, Pencil, Trash2, Building, Building2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Spinner } from "@/components/Spinner";
import { supabase } from "@/integrations/supabase/client";
import { PROJECT_STATUSES } from "@/lib/status";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Project {
  id: string;
  name: string;
  province: string;
  canton: string;
  status: string;
  units: number | null;
  created_at: string;
}

const Projects = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");
  const [toDelete, setToDelete] = useState<Project | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("id,name,province,canton,status,units,created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error("Error al cargar proyectos");
    setProjects((data ?? []) as Project[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesText = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "Todos" || p.status === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const handleDelete = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from("projects").delete().eq("id", toDelete.id);
    if (error) {
      toast.error("Error al eliminar el proyecto");
    } else {
      toast.success("Proyecto eliminado");
      setProjects((prev) => prev.filter((p) => p.id !== toDelete.id));
    }
    setToDelete(null);
  };

  return (
    <AppLayout title="Proyectos">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Proyectos</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} de {projects.length} proyecto(s)</p>
        </div>
        <button
          onClick={() => navigate("/proyectos/nuevo")}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-bold text-primary shadow-card transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Nuevo Proyecto
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3 rounded-lg bg-card p-4 shadow-card">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="h-10 w-full rounded-sm border border-border bg-background/60 pl-9 pr-3 text-sm outline-none transition-all focus:border-primary focus:bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 min-w-[200px] rounded-sm border border-border bg-white px-3 text-sm outline-none transition-all focus:border-primary"
        >
          <option value="Todos">Todos los estados</option>
          {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="rounded-lg bg-card p-16 text-center shadow-card">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Building className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground">
            {projects.length === 0 ? "No hay proyectos registrados" : "Sin resultados"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {projects.length === 0 ? "Comienza creando tu primer proyecto." : "Ajusta los filtros para encontrar proyectos."}
          </p>
          {projects.length === 0 && (
            <button
              onClick={() => navigate("/proyectos/nuevo")}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-bold text-primary shadow-card transition-transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} /> Nuevo Proyecto
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <article key={p.id} className="group overflow-hidden rounded-lg bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated">
              <Link to={`/proyectos/${p.id}`} className="block">
                <div className="relative h-[180px] overflow-hidden bg-gradient-to-br from-secondary to-muted">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40">
                    <Building2 className="h-16 w-16" strokeWidth={1.25} />
                  </div>
                  <div className="absolute right-3 top-3">
                    <StatusBadge status={p.status} />
                  </div>
                </div>
                <div className="space-y-2 p-5">
                  <h3 className="text-lg font-bold text-primary group-hover:underline">{p.name}</h3>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {p.canton}, {p.province}
                  </p>
                  <p className="text-xs text-muted-foreground">{p.units ?? 0} unidades</p>
                </div>
              </Link>
              <div className="flex items-center justify-between border-t border-border px-5 py-3">
                <span className="text-[11px] text-muted-foreground">
                  Creado {format(new Date(p.created_at), "dd/MM/yyyy")}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/proyectos/${p.id}/editar`); }}
                    className="rounded-md p-2 text-primary transition-colors hover:bg-secondary"
                    aria-label="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setToDelete(p); }}
                    className="rounded-md p-2 text-destructive transition-colors hover:bg-destructive/10"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Proyecto</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que deseas eliminar &ldquo;{toDelete?.name}&rdquo;? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Projects;
