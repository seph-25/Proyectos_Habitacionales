import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PROJECT_STATUSES, STATUS_STYLES } from "@/lib/status";
import { Spinner } from "@/components/Spinner";
import { StatusBadge } from "@/components/StatusBadge";

interface Project {
  id: string;
  name: string;
  address: string | null;
  status: string;
  units: number | null;
  price_from: number | null;
}

export const InventoryReport = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("Todos");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("id,name,address,status,units,price_from")
        .order("name", { ascending: true });

      if (!error && data) {
        setProjects(data as Project[]);
      }
      setLoading(false);
    };

    loadProjects();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return projects.filter((p) => {
      const matchesText =
        p.name.toLowerCase().includes(q) ||
        (p.address?.toLowerCase() ?? "").includes(q);
      const matchesStatus = statusFilter === "Todos" || p.status === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const totalUnits = projects.reduce((sum, p) => sum + (p.units ?? 0), 0);
    const statusCounts: Record<string, number> = {};
    PROJECT_STATUSES.forEach((status) => {
      statusCounts[status] = projects.filter((p) => p.status === status).length;
    });
    return { totalProjects, totalUnits, statusCounts };
  }, [projects]);

  if (loading) return <Spinner />;

  const statusList = PROJECT_STATUSES.filter((s) => stats.statusCounts[s] > 0);

  return (
    <div id="inventory-report" className="space-y-8">
      {/* Resumen en cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">Total de Proyectos</p>
          <p className="mt-2 text-3xl font-bold text-primary">{stats.totalProjects}</p>
        </div>
        <div className="rounded-lg bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">Total de Unidades</p>
          <p className="mt-2 text-3xl font-bold text-primary">{stats.totalUnits}</p>
        </div>
        {statusList.map((status) => (
          <div key={status} className="rounded-lg bg-card p-6 shadow-card">
            <p className="text-sm text-muted-foreground">{status}</p>
            <p className="mt-2 text-3xl font-bold text-primary">{stats.statusCounts[status]}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 rounded-lg bg-card p-4 shadow-card">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o dirección..."
            className="h-10 w-full rounded-sm border border-border bg-background/60 pl-9 pr-3 text-sm outline-none transition-all focus:border-primary focus:bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 min-w-[200px] rounded-sm border border-border bg-white px-3 text-sm outline-none transition-all focus:border-primary"
        >
          <option value="Todos">Todos los estados</option>
          {PROJECT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div className="rounded-lg bg-card p-12 text-center shadow-card">
          <p className="text-sm text-muted-foreground">Sin proyectos para mostrar</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-card shadow-card">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Dirección</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Estado</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Unidades</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Precio desde</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((project) => (
                <tr key={project.id} className="border-b border-border/50 hover:bg-muted/30 transition">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{project.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{project.address || "—"}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-foreground">{project.units ?? "—"}</td>
                  <td className="px-6 py-4 text-right text-sm text-foreground">
                    {project.price_from ? `₡${project.price_from.toLocaleString()}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
