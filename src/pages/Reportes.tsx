import { useState } from "react";
import { Download, Loader } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { InventoryReport } from "@/components/reports/InventoryReport";
import { SalesMetricsReport } from "@/components/reports/SalesMetricsReport";
import { useExportToPdf } from "@/hooks/useExportToPdf";

const Reportes = () => {
  const [activeTab, setActiveTab] = useState<"inventory" | "metrics">("inventory");
  const [exporting, setExporting] = useState(false);
  const { exportToPdf } = useExportToPdf();

  const handleExport = async () => {
    try {
      setExporting(true);
      const elementId = activeTab === "inventory" ? "inventory-report" : "sales-metrics-report";
      const fileName = activeTab === "inventory" ? "reporte-inventario" : "reporte-metricas";
      await exportToPdf(elementId, fileName);
      toast.success("PDF descargado exitosamente");
    } catch (error) {
      toast.error("Error al descargar el PDF");
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppLayout title="Reportes">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Análisis e información de tus proyectos y oportunidades</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" strokeWidth={2.5} />
          )}
          {exporting ? "Generando..." : "Exportar PDF"}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab("inventory")}
          className={`pb-3 text-sm font-semibold transition-colors ${
            activeTab === "inventory"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Inventario
        </button>
        <button
          onClick={() => setActiveTab("metrics")}
          className={`pb-3 text-sm font-semibold transition-colors ${
            activeTab === "metrics"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Métricas de Ventas
        </button>
      </div>

      {/* Contenido de tabs */}
      <div>
        {activeTab === "inventory" && <InventoryReport />}
        {activeTab === "metrics" && <SalesMetricsReport />}
      </div>
    </AppLayout>
  );
};

export default Reportes;
