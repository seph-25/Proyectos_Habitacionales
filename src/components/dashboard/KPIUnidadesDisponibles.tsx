import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Home } from "lucide-react";
import { KPICard } from "./KPICard";
import { KPIDrillDown } from "./KPIDrillDown";
import { getUnidadesDisponiblesPorEstado } from "@/lib/dashboardQueries";
import { STATUS_STYLES } from "@/lib/status";

const STATUS_COLORS: Record<string, string> = {
  "En gestación": "#f59e0b",
  "En construcción": "#3b82f6",
  "Parcialmente terminado": "#a855f7",
  "Terminado": "#22c55e",
  "En gestión de venta": "#ec4899",
};

export const KPIUnidadesDisponibles = () => {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["unidades-por-estado"],
    queryFn: getUnidadesDisponiblesPorEstado,
  });

  const total = data?.reduce((sum, d) => sum + d.units, 0) ?? 0;

  const chartData =
    data?.map((d) => ({
      name: d.status,
      value: d.units,
      color: STATUS_COLORS[d.status] || "#8884d8",
    })) ?? [];

  const drillDownData =
    data?.flatMap((d) =>
      d.projects.map((p) => ({
        ...p,
        status: d.status,
      }))
    ) ?? [];

  return (
    <>
      <KPICard
        title="Unidades Disponibles"
        value={total.toLocaleString()}
        subtitle="Total de unidades en todos los estados"
        icon={Home}
        color="bg-status-construccion/15 text-status-construccion"
        onClick={() => setOpen(true)}
        isLoading={isLoading}
      >
        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </KPICard>

      <KPIDrillDown
        open={open}
        onOpenChange={setOpen}
        title="Unidades por Proyecto"
        data={drillDownData}
        columns={[
          { key: "name", header: "Nombre" },
          { key: "province", header: "Provincia" },
          { key: "canton", header: "Cantón" },
          {
            key: "status",
            header: "Estado",
            render: (row) => (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  STATUS_STYLES[row.status as keyof typeof STATUS_STYLES]?.bg ?? "bg-muted"
                } ${
                  STATUS_STYLES[row.status as keyof typeof STATUS_STYLES]?.text ?? "text-muted-foreground"
                }`}
              >
                <span
                  className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                    STATUS_STYLES[row.status as keyof typeof STATUS_STYLES]?.dot ?? "bg-muted-foreground"
                  }`}
                />
                {row.status}
              </span>
            ),
          },
          {
            key: "units",
            header: "Unidades",
            render: (row) => row.units ?? "—",
          },
        ]}
      />
    </>
  );
};
