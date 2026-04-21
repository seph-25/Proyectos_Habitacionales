import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import ProjectForm from "./pages/ProjectForm";
import ProjectDetail from "./pages/ProjectDetail";
import Catalog from "./pages/Catalog";
import CatalogShowroom from "./pages/CatalogShowroom";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/proyectos" element={<Projects />} />
          <Route path="/proyectos/nuevo" element={<ProjectForm />} />
          <Route path="/proyectos/:id" element={<ProjectDetail />} />
          <Route path="/proyectos/:id/editar" element={<ProjectForm />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/catalogo/:id" element={<CatalogShowroom />} />
          <Route path="/prospectos" element={<PlaceholderPage title="Prospectos" />} />
          <Route path="/citas" element={<PlaceholderPage title="Citas" />} />
          <Route path="/pipeline" element={<PlaceholderPage title="Pipeline" />} />
          <Route path="/reportes" element={<PlaceholderPage title="Reportes" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
