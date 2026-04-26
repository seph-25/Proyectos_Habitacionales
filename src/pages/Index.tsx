import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, HardHat, Home, CheckCircle, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Spinner } from "@/components/Spinner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

interface Project {
  id: string;
  name: string;
  province: string;
  canton: string;
  status: string;
  created_at: string;
}

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [counts, setCounts] = useState({ total: 0, construccion: 0, disponibles: 0, terminados: 0 });
  const { profile } = useAuth();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("projects")
        .select("id,name,province,canton,status,created_at")
        .order("created_at", { ascending: false });
      const all = (data ?? []) as Project[];
      setProjects(all.slice(0, 5));
      setCounts({
        total: all.length,
        construccion: all.filter((p) => p.status === "En construcción").length,
        disponibles: all.filter((p) => p.status === "En gestión de venta").length,
        terminados: all.filter((p) => p.status === "Terminado").length,
      });
      setLoading(false);
    })();
  }, []);

  const stats = [
    { label: "Total Proyectos", value: counts.total, icon: Building2, tint: "bg-primary/10 text-primary" },
    { label: "En Construcción", value: counts.construccion, icon: HardHat, tint: "bg-status-construccion/15 text-status-construccion" },
    { label: "Disponibles", value: counts.disponibles, icon: Home, tint: "bg-status-venta/15 text-status-venta" },
    { label: "Terminados", value: counts.terminados, icon: CheckCircle, tint: "bg-status-terminado/15 text-status-terminado" },
  ];

  return (
    <AppLayout title="Dashboard">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{profile ? `Bienvenido, ${profile.full_name}` : "Invitado"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Resumen general de tus proyectos inmobiliarios.</p>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tint }) => (
          <div key={label} className="rounded-lg bg-card p-6 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="mt-3 text-3xl font-bold text-primary">{value}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${tint}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="text-base font-bold text-primary">Proyectos Recientes</h3>
          <Link to="/proyectos" className="flex items-center gap-1 text-xs font-semibold text-primary hover:gap-2 transition-all">
            Ver todos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {loading ? (
          <Spinner />
        ) : projects.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-muted-foreground">
            Aún no hay proyectos. <Link to="/proyectos/nuevo" className="font-semibold text-primary underline">Crea el primero</Link>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Nombre</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Ubicación</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Creado</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/proyectos/${p.id}`} className="font-semibold text-foreground hover:text-primary">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{p.canton}, {p.province}</td>
                    <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{format(new Date(p.created_at), "dd MMM yyyy", { locale: es })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Index;
