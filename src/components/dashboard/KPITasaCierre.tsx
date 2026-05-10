import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Target } from "lucide-react";
import { KPICard } from "./KPICard";
import { KPIDrillDown } from "./KPIDrillDown";
import { getTasaCierreMes } from "@/lib/dashboardQueries";

export const KPITasaCierre = () => {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["tasa-cierre-mes"],
    queryFn: getTasaCierreMes,
  });

  const percentage = data?.percentage ?? 0;
  const cerradas = data?.cerradas ?? 0;
  const total = data?.total ?? 0;

  return (
    <>
      <KPICard
        title="Tasa de Cierre del Mes"
        value={`${percentage}%`}
        subtitle={`${cerradas} cerradas de ${total} oportunidades`}
        icon={Target}
        color="bg-status-terminado/15 text-status-terminado"
        onClick={() => setOpen(true)}
        isLoading={isLoading}
      >
        <div className="mt-4">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-status-terminado transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </KPICard>

      <KPIDrillDown
        open={open}
        onOpenChange={setOpen}
        title="Oportunidades Cerradas del Mes"
        data={data?.oportunidades ?? []}
        columns={[
          { key: "prospecto_nombre", header: "Prospecto" },
          { key: "proyecto_nombre", header: "Proyecto" },
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
