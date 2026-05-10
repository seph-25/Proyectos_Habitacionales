import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/Spinner";

interface Oportunidad {
  id: string;
  etapa: string;
  valor_estimado: number | null;
  agente_id: string | null;
}

interface AgenteProfile {
  id: string;
  full_name: string;
}

const ETAPA_COLORS: Record<string, string> = {
  Nueva: "#3b82f6",
  Contactado: "#f59e0b",
  Calificado: "#a855f7",
  Propuesta: "#f97316",
  Negociación: "#ec4899",
  Cerrada: "#22c55e",
  Descartada: "#6b7280",
};

export const SalesMetricsReport = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
  const [agentes, setAgentes] = useState<AgenteProfile[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("all");

  const isGerente = profile?.role === "Gerente Comercial";

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const { data: oportunidadesData, error } = await supabase
        .from("oportunidades")
        .select("id, etapa, valor_estimado, agente_id");


      const oportunidadesTyped = (oportunidadesData ?? []) as Oportunidad[];
      setOportunidades(oportunidadesTyped);

      if (oportunidadesTyped.length > 0) {
        const agentIds = Array.from(
          new Set(
            oportunidadesTyped
              .map((o) => o.agente_id)
              .filter((id): id is string => id !== null)
          )
        ); if (agentIds.length > 0) {
          const { data: profilesData, success } = await supabase
            .from("profiles")
            .select("id, full_name, role")
            .eq("role", "Agente de Ventas")
            .order("full_name");

          if (success) setAgentes((profilesData ?? []) as AgenteProfile[]);
        }
      }

      setLoading(false);
    };

    loadData();
  }, []);

  const filteredOportunidades = useMemo(() => {
    if (selectedAgent === "all" || !isGerente) return oportunidades;
    return oportunidades.filter((o) => o.agente_id === selectedAgent);
  }, [oportunidades, selectedAgent, isGerente]);

  const stats = useMemo(() => {
    const total = filteredOportunidades.length;
    const activeValue = filteredOportunidades
      .filter((o) => !["Cerrada", "Descartada"].includes(o.etapa))
      .reduce((sum, o) => sum + (o.valor_estimado ?? 0), 0);
    const closed = filteredOportunidades.filter(
      (o) => o.etapa === "Cerrada"
    ).length;
    const closureRate = total > 0 ? ((closed / total) * 100).toFixed(1) : "0";

    return { total, activeValue, closureRate };
  }, [filteredOportunidades]);

  const etapaDistribution = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredOportunidades.forEach((o) => {
      grouped[o.etapa] = (grouped[o.etapa] ?? 0) + 1;
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredOportunidades]);

  const etapaValueDistribution = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredOportunidades.forEach((o) => {
      grouped[o.etapa] = (grouped[o.etapa] ?? 0) + (o.valor_estimado ?? 0);
    });
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [filteredOportunidades]);

  // Métricas por agente (solo cuando se muestra "Todos")
  const metricasPorAgente = useMemo(() => {
    if (!isGerente || selectedAgent !== "all") return [];

    const grouped: Record<
      string,
      {
        agenteId: string;
        agenteNombre: string;
        total: number;
        activeValue: number;
        cerradas: number;
      }
    > = {};

    oportunidades.forEach((o) => {
      const agenteId = o.agente_id ?? "sin-agente";
      if (!grouped[agenteId]) {
        const agente = agentes.find((a) => a.id === agenteId);
        grouped[agenteId] = {
          agenteId,
          agenteNombre: agente?.full_name ?? "Sin agente asignado",
          total: 0,
          activeValue: 0,
          cerradas: 0,
        };
      }
      grouped[agenteId].total += 1;
      if (!["Cerrada", "Descartada"].includes(o.etapa)) {
        grouped[agenteId].activeValue += o.valor_estimado ?? 0;
      }
      if (o.etapa === "Cerrada") {
        grouped[agenteId].cerradas += 1;
      }
    });

    return Object.values(grouped).map((g) => ({
      ...g,
      tasaCierre: g.total > 0 ? ((g.cerradas / g.total) * 100).toFixed(1) : "0",
    }));
  }, [oportunidades, agentes, isGerente, selectedAgent]);

  if (loading) return <Spinner />;

  const selectedAgentName =
    selectedAgent === "all"
      ? "Todos los agentes"
      : agentes.find((a) => a.id === selectedAgent)?.full_name ?? "Agente";

  return (
    <div id="sales-metrics-report" className="space-y-8">
      {/* Filtro por agente */}
      {isGerente && (
        <div className="flex flex-wrap gap-3 rounded-lg bg-card p-4 shadow-card">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">
              Agente:
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="h-10 min-w-[220px] rounded-sm border border-border bg-white px-3 text-sm outline-none transition-all focus:border-primary"
            >
              <option value="all">Todos los agentes</option>
              {agentes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Título del filtro aplicado */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-foreground">
          {selectedAgent === "all"
            ? "Métricas Generales"
            : `Métricas de ${selectedAgentName}`}
        </h2>
      </div>

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
          <p className="mt-2 text-3xl font-bold text-primary">
            {stats.closureRate}%
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Distribución por etapa */}
        <div className="rounded-lg bg-card p-6 shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Distribución por Etapa
          </h3>
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
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={ETAPA_COLORS[entry.name] || "#8884d8"}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Valor acumulado por etapa */}
        <div className="rounded-lg bg-card p-6 shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Valor Estimado por Etapa
          </h3>
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
                  formatter={(value) =>
                    `₡${(value as number).toLocaleString()}`
                  }
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Bar dataKey="value" fill="#3b82f6">
                  {etapaValueDistribution.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={ETAPA_COLORS[entry.name] || "#3b82f6"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Tabla de métricas por agente */}
      {isGerente && selectedAgent === "all" && metricasPorAgente.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Desempeño por Agente
          </h3>
          <div className="overflow-x-auto rounded-lg bg-card shadow-card">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Agente
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                    Oportunidades
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                    Pipeline Activo
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                    Tasa de Cierre
                  </th>
                </tr>
              </thead>
              <tbody>
                {metricasPorAgente.map((m) => (
                  <tr
                    key={m.agenteId}
                    className="border-b border-border/50 hover:bg-muted/30 transition"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {m.agenteNombre}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-foreground">
                      {m.total}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-foreground">
                      ₡{Math.round(m.activeValue).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-foreground">
                      {m.tasaCierre}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
