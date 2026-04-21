import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Building2, Maximize2, DollarSign, SlidersHorizontal } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Spinner } from "@/components/Spinner";
import { supabase } from "@/integrations/supabase/client";
import { PROJECT_STATUSES, PROJECT_TYPES } from "@/lib/status";

interface CatalogProject {
  id: string;
  name: string;
  province: string;
  canton: string;
  status: string;
  project_type: string | null;
  units: number | null;
  price_from: number | null;
  area_m2_from: number | null;
  cover_url: string | null;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 }).format(n);

const Catalog = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<CatalogProject[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [typeFilter, setTypeFilter] = useState("Todos");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: projs } = await supabase
        .from("projects")
        .select("id,name,province,canton,status,project_type,units,price_from,area_m2_from")
        .order("created_at", { ascending: false });

      if (!projs) { setLoading(false); return; }

      // Obtener imagen de portada para cada proyecto
      const ids = projs.map((p) => p.id);
      const { data: covers } = await supabase
        .from("project_images")
        .select("project_id, url")
        .in("project_id", ids)
        .eq("image_type", "cover");

      const coverMap: Record<string, string> = {};
      (covers ?? []).forEach((c) => { coverMap[c.project_id] = c.url; });

      setProjects(
        projs.map((p) => ({ ...p, cover_url: coverMap[p.id] ?? null }))
      );
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return projects.filter((p) => {
      const matchText =
        p.name.toLowerCase().includes(q) ||
        p.canton.toLowerCase().includes(q) ||
        p.province.toLowerCase().includes(q);
      const matchStatus = statusFilter === "Todos" || p.status === statusFilter;
      const matchType = typeFilter === "Todos" || p.project_type === typeFilter;
      return matchText && matchStatus && matchType;
    });
  }, [projects, search, statusFilter, typeFilter]);

  return (
    <AppLayout title="Catálogo">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Catálogo de Proyectos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {filtered.length} de {projects.length} proyecto(s) disponible(s)
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-3 rounded-lg bg-card p-4 shadow-card">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, cantón o provincia..."
            className="h-10 w-full rounded-sm border border-border bg-background/60 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 min-w-[180px] rounded-sm border border-border bg-white px-3 text-sm outline-none focus:border-primary"
          >
            <option value="Todos">Todos los estados</option>
            {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 min-w-[160px] rounded-sm border border-border bg-white px-3 text-sm outline-none focus:border-primary"
          >
            <option value="Todos">Todos los tipos</option>
            {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="rounded-lg bg-card p-16 text-center shadow-card">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 font-semibold text-foreground">Sin resultados</h3>
          <p className="mt-1 text-sm text-muted-foreground">Ajusta los filtros para encontrar proyectos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to={`/catalogo/${p.id}`}
              className="group overflow-hidden rounded-xl bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated"
            >
              {/* Imagen portada */}
              <div className="relative h-52 overflow-hidden bg-gradient-to-br from-secondary to-muted">
                {p.cover_url ? (
                  <img
                    src={p.cover_url}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Building2 className="h-16 w-16 text-muted-foreground/30" strokeWidth={1.25} />
                  </div>
                )}
                <div className="absolute right-3 top-3">
                  <StatusBadge status={p.status} />
                </div>
                {p.project_type && (
                  <div className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                    {p.project_type}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="text-base font-bold text-primary group-hover:underline">{p.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {p.canton}, {p.province}
                </p>

                <div className="mt-3 flex flex-wrap gap-3 border-t border-border pt-3">
                  {p.units && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" /> {p.units} unidades
                    </span>
                  )}
                  {p.area_m2_from && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Maximize2 className="h-3.5 w-3.5" /> desde {p.area_m2_from} m²
                    </span>
                  )}
                  {p.price_from && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-status-terminado">
                      <DollarSign className="h-3.5 w-3.5" /> desde {fmt(p.price_from)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default Catalog;
