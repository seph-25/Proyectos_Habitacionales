import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Pencil, Repeat, MapPin, Calendar, Hash, Layers, Images, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Spinner } from "@/components/Spinner";
import { StatusBadge } from "@/components/StatusBadge";
import { ImageUpload } from "@/components/catalog/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { PROJECT_STATUSES, ProjectStatus, STATUS_STYLES } from "@/lib/status";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ProjectImage {
  id: string;
  url: string;
  caption: string | null;
  image_type: string;
  display_order: number;
}

interface Project {
  id: string;
  name: string;
  province: string;
  canton: string;
  description: string | null;
  project_type: string | null;
  units: number | null;
  start_date: string | null;
  status: string;
  created_at: string;
}

interface History {
  id: string;
  previous_status: string | null;
  new_status: string;
  changed_at: string;
  changed_by: string;
}

const Row = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
}) => (
  <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-0">
    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </span>
    <span className="text-sm font-medium text-foreground text-right">{value ?? "—"}</span>
  </div>
);

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [history, setHistory] = useState<History[]>([]);
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [statusOpen, setStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: p, error: pe }, { data: h }, { data: imgs }] = await Promise.all([
      supabase.from("projects").select("*").eq("id", id!).maybeSingle(),
      supabase
        .from("status_history")
        .select("*")
        .eq("project_id", id!)
        .order("changed_at", { ascending: false }),
      supabase
        .from("project_images")
        .select("id, url, caption, image_type, display_order")
        .eq("project_id", id!)
        .order("display_order", { ascending: true }),
    ]);
    if (pe || !p) {
      toast.error("Proyecto no encontrado");
      navigate("/proyectos");
      return;
    }
    setProject(p as Project);
    setHistory((h ?? []) as History[]);
    setImages((imgs ?? []) as ProjectImage[]);
    setLoading(false);
  }, [id, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const onChangeStatus = async () => {
    if (!project || !newStatus || newStatus === project.status) return;
    setSaving(true);
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from("projects").update({ status: newStatus }).eq("id", project.id),
      supabase.from("status_history").insert({
        project_id: project.id,
        previous_status: project.status,
        new_status: newStatus,
        changed_by: "Daniel Salas",
      }),
    ]);
    setSaving(false);
    if (e1 || e2) {
      toast.error("Error al cambiar el estado");
      return;
    }
    toast.success("Estado actualizado correctamente");
    setStatusOpen(false);
    setNewStatus("");
    await load();
  };

  if (loading || !project) {
    return <AppLayout title="Detalle"><Spinner /></AppLayout>;
  }

  return (
    <AppLayout title={project.name}>
      <Link
        to="/proyectos"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a proyectos
      </Link>

      {/* Header card */}
      <div className="mb-8 rounded-lg bg-primary p-6 md:p-8 shadow-elevated">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3">
              <StatusBadge status={project.status} size="md" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-primary-foreground">{project.name}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-primary-foreground/70">
              <MapPin className="h-4 w-4 shrink-0" />
              {project.canton}, {project.province}
              {project.project_type && <> · {project.project_type}</>}
            </p>
          </div>
          <button
            onClick={() => navigate(`/proyectos/${project.id}/editar`)}
            className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
          >
            <Pencil className="h-4 w-4" /> Editar
          </button>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* LEFT 60% */}
        <div className="space-y-6 lg:col-span-3">
          <section className="rounded-lg bg-card p-6 shadow-card">
            <h2 className="mb-4 text-base font-bold text-primary">Información General</h2>
            <Row label="Provincia / Cantón" value={`${project.province} · ${project.canton}`} icon={MapPin} />
            <Row label="Tipo de Proyecto" value={project.project_type} icon={Layers} />
            <Row label="Número de Unidades" value={project.units} icon={Hash} />
            <Row
              label="Fecha de Inicio"
              value={
                project.start_date
                  ? format(new Date(project.start_date), "dd 'de' MMMM yyyy", { locale: es })
                  : null
              }
              icon={Calendar}
            />
            <Row
              label="Registrado en sistema"
              value={format(new Date(project.created_at), "dd/MM/yyyy HH:mm")}
              icon={Calendar}
            />
          </section>

          {project.description && (
            <section className="rounded-lg bg-card p-6 shadow-card">
              <h2 className="mb-3 text-base font-bold text-primary">Descripción</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                {project.description}
              </p>
            </section>
          )}

          {/* Galería de imágenes */}
          <section className="rounded-lg bg-card p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold text-primary">
                <Images className="h-4 w-4" />
                Imágenes del Proyecto
              </h2>
              <Link
                to={`/catalogo/${project.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
              >
                Ver showroom público <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ImageUpload
              projectId={project.id}
              images={images}
              onImagesChange={setImages}
            />
          </section>

          <section className="rounded-lg bg-card p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-primary">Estado del Proyecto</h2>
              <button
                onClick={() => {
                  setNewStatus("");
                  setStatusOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-bold text-primary transition-transform hover:-translate-y-0.5"
              >
                <Repeat className="h-4 w-4" /> Cambiar Estado
              </button>
            </div>
            <StatusBadge status={project.status} size="lg" />
          </section>
        </div>

        {/* RIGHT 40% */}
        <div className="lg:col-span-2">
          <section className="rounded-lg bg-card p-6 shadow-card">
            <h2 className="mb-4 text-base font-bold text-primary">Historial de Cambios</h2>
            {history.length === 0 ? (
              <p className="py-8 text-center text-sm italic text-muted-foreground">
                Sin cambios de estado registrados
              </p>
            ) : (
              <ol className="relative ml-2 border-l-2 border-border">
                {history.map((h) => {
                  const styles = STATUS_STYLES[h.new_status as ProjectStatus];
                  return (
                    <li key={h.id} className="mb-6 ml-5 last:mb-0">
                      <span
                        className={cn(
                          "absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-card",
                          styles?.dot ?? "bg-muted-foreground",
                        )}
                      />
                      <p className="text-sm font-bold text-foreground">
                        <span className="text-muted-foreground">{h.previous_status ?? "—"}</span>
                        {" → "}
                        {h.new_status}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {format(new Date(h.changed_at), "dd/MM/yyyy HH:mm")}
                      </p>
                      <p className="text-xs text-muted-foreground">por {h.changed_by}</p>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>
      </div>

      {/* Dialog cambio de estado */}
      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Estado del Proyecto</DialogTitle>
            <DialogDescription>
              Estado actual:{" "}
              <span className="font-semibold text-foreground">{project.status}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Nuevo estado
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="h-10 w-full rounded-sm border border-border bg-white px-3 text-sm outline-none focus:border-primary"
            >
              <option value="">Selecciona un estado...</option>
              {PROJECT_STATUSES.filter((s) => s !== project.status).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <button
              onClick={() => setStatusOpen(false)}
              className="rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-primary hover:bg-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={onChangeStatus}
              disabled={!newStatus || saving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-deep disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Confirmar Cambio"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ProjectDetail;
