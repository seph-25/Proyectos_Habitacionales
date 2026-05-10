import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Building2 } from "lucide-react";
import { KPICard } from "./KPICard";
import { KPIDrillDown } from "./KPIDrillDown";
import { getProyectosPorEstado } from "@/lib/dashboardQueries";
import { STATUS_STYLES } from "@/lib/status";

const STATUS_COLORS: Record<string, string> = {
  "En gestación": "#f59e0b",
  "En construcción": "#3b82f6",
  "Parcialmente terminado": "#a855f7",
  "Terminado": "#22c55e",
  "En gestión de venta": "#ec4899",
};

export const KPIProyectosPorEstado = () => {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["proyectos-por-estado"],
    queryFn: getProyectosPorEstado,
  });

  const total = data?.reduce((sum, d) => sum + d.count, 0) ?? 0;

  const chartData =
    data?.map((d) => ({
      name: d.status,
      value: d.count,
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
        title="Proyectos por Estado"
        value={total}
        subtitle={`${data?.length ?? 0} estados`}
        icon={Building2}
        color="bg-status-gestacion/15 text-status-gestacion"
        onClick={() => setOpen(true)}
        isLoading={isLoading}
      >
        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </KPICard>

      <KPIDrillDown
        open={open}
        onOpenChange={setOpen}
        title="Proyectos por Estado"
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
          { key: "units", header: "Unidades" },
        ]}
      />
    </>
  );
};
