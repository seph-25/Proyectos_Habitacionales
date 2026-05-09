import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { TrendingUp } from "lucide-react";
import { KPICard } from "./KPICard";
import { KPIDrillDown } from "./KPIDrillDown";
import { getOportunidadesActivas } from "@/lib/dashboardQueries";

const ETAPA_COLORS: Record<string, string> = {
  Nuevo: "#3b82f6",
  Contactado: "#f59e0b",
  Calificado: "#a855f7",
  Negociando: "#ec4899",
  Propuesta: "#f97316",
};

export const KPIOportunidadesActivas = () => {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["oportunidades-activas"],
    queryFn: getOportunidadesActivas,
  });

  const chartData = data?.porEtapa.map((e) => ({
    name: e.etapa,
    value: e.count,
    color: ETAPA_COLORS[e.etapa] || "#8884d8",
  })) ?? [];

  return (
    <>
      <KPICard
        title="Oportunidades Activas"
        value={data?.total ?? 0}
        subtitle="Pipeline excluyendo cerradas y perdidas"
        icon={TrendingUp}
        color="bg-status-venta/15 text-status-venta"
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
        title="Oportunidades Activas"
        data={data?.oportunidades ?? []}
        columns={[
          { key: "prospecto_nombre", header: "Prospecto" },
          { key: "proyecto_nombre", header: "Proyecto" },
          { key: "etapa", header: "Etapa" },
          {
            key: "valor_estimado",
            header: "Valor Estimado",
            render: (row) =>
              row.valor_estimado ? `$${row.valor_estimado.toLocaleString("es-CO")}` : "—",
          },
          {
            key: "fecha_cierre_estimada",
            header: "Fecha Cierre",
            render: (row) => row.fecha_cierre_estimada ?? "—",
          },
        ]}
      />
    </>
  );
};
