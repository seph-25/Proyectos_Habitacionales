import { AppLayout } from "@/components/layout/AppLayout";
import { KPIProyectosPorEstado } from "@/components/dashboard/KPIProyectosPorEstado";
import { KPIOportunidadesActivas } from "@/components/dashboard/KPIOportunidadesActivas";
import { KPITasaCierre } from "@/components/dashboard/KPITasaCierre";
import { KPIUnidadesDisponibles } from "@/components/dashboard/KPIUnidadesDisponibles";

const DashboardEjecutivo = () => {
  return (
    <AppLayout title="Dashboard Ejecutivo">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard Ejecutivo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          KPIs clave para la gestión comercial
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <KPIProyectosPorEstado />
        <KPIOportunidadesActivas />
        <KPITasaCierre />
        <KPIUnidadesDisponibles />
      </div>
    </AppLayout>
  );
};

export default DashboardEjecutivo;
