import { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Spinner } from "@/components/Spinner";

interface Oportunidad {
  id: string;
  etapa: string;
  valor_estimado: number | null;
}

const ETAPA_COLORS: Record<string, string> = {
  "Nueva": "#3b82f6",
  "Contactado": "#f59e0b",
  "Calificado": "#a855f7",
  "Propuesta": "#f97316",
  "Negociación": "#ec4899",
  "Cerrada": "#22c55e",
  "Descartada": "#6b7280",
};

export const SalesMetricsReport = () => {
  const [loading, setLoading] = useState(true);
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);

  useEffect(() => {
    const loadOportunidades = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("oportunidades")
        .select("id, etapa, valor_estimado");

      if (data) {
        setOportunidades(data as Oportunidad[]);
      }
      setLoading(false);
    };

    loadOportunidades();
  }, []);

  const stats = useMemo(() => {
    const total = oportunidades.length;
    const activeValue = oportunidades
      .filter((o) => !["Cerrada", "Descartada"].includes(o.etapa))
      .reduce((sum, o) => sum + (o.valor_estimado ?? 0), 0);
    const closed = oportunidades.filter((o) => o.etapa === "Cerrada").length;
    const closureRate = total > 0 ? ((closed / total) * 100).toFixed(1) : "0";

    return { total, activeValue, closureRate };
  }, [oportunidades]);

  const etapaDistribution = useMemo(() => {
    const grouped: Record<string, number> = {};
    oportunidades.forEach((o) => {
      grouped[o.etapa] = (grouped[o.etapa] ?? 0) + 1;
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [oportunidades]);

  const etapaValueDistribution = useMemo(() => {
    const grouped: Record<string, number> = {};
    oportunidades.forEach((o) => {
      grouped[o.etapa] = (grouped[o.etapa] ?? 0) + (o.valor_estimado ?? 0);
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [oportunidades]);

  if (loading) return <Spinner />;

  return (
    <div id="sales-metrics-report" className="space-y-8">
      {/* Resumen */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">Total de Oportunidades</p>
          <p className="mt-2 text-3xl font-bold text-primary">{stats.total}</p>
        </div>
        <div className="rounded-lg bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">Valor Pipeline Activo</p>
          <p className="mt-2 text-2xl font-bold text-primary">
            ₡{Math.round(stats.activeValue).toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-card p-6 shadow-card">
          <p className="text-sm text-muted-foreground">Tasa de Cierre</p>
          <p className="mt-2 text-3xl font-bold text-primary">{stats.closureRate}%</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Distribución por etapa */}
        <div className="rounded-lg bg-card p-6 shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Distribución por Etapa</h3>
          {etapaDistribution.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Sin datos
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={etapaDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {etapaDistribution.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={ETAPA_COLORS[entry.name] || "#8884d8"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Valor acumulado por etapa */}
        <div className="rounded-lg bg-card p-6 shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Valor Estimado por Etapa</h3>
          {etapaValueDistribution.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Sin datos
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={etapaValueDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => `₡${(value as number).toLocaleString()}`}
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}
                />
                <Bar dataKey="value" fill="#3b82f6">
                  {etapaValueDistribution.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={ETAPA_COLORS[entry.name] || "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
