import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoginModalProvider } from "@/contexts/LoginModalContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import ProjectForm from "./pages/ProjectForm";
import ProjectDetail from "./pages/ProjectDetail";
import Catalog from "./pages/Catalog";
import CatalogShowroom from "./pages/CatalogShowroom";
import Prospectos from "./pages/Prospectos";
import ProspectoDetail from "./pages/ProspectoDetail";
import Citas from "./pages/Citas";
import CitaForm from "./pages/CitaForm";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Ruta raíz: catálogo público si no hay sesión, dashboard si está autenticado.
const RootRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
    </div>
  );
  if (!user) return <Navigate to="/catalogo" replace />;
  return <Index />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" richColors />
      <BrowserRouter>
        <AuthProvider>
          <LoginModalProvider>
            <Routes>
              {/* Ruta raíz */}
              <Route path="/" element={<RootRoute />} />

              {/* Catálogo — público */}
              <Route path="/catalogo" element={<Catalog />} />
              <Route path="/catalogo/:id" element={<CatalogShowroom />} />

              {/* Rutas protegidas — abren modal si no hay sesión */}
              <Route path="/proyectos" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
              <Route path="/proyectos/nuevo" element={<ProtectedRoute><ProjectForm /></ProtectedRoute>} />
              <Route path="/proyectos/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
              <Route path="/proyectos/:id/editar" element={<ProtectedRoute><ProjectForm /></ProtectedRoute>} />
              <Route path="/prospectos" element={<ProtectedRoute><Prospectos /></ProtectedRoute>} />
              <Route path="/prospectos/:id" element={<ProtectedRoute><ProspectoDetail /></ProtectedRoute>} />
              <Route path="/citas" element={<ProtectedRoute><Citas /></ProtectedRoute>} />
              <Route path="/citas/nueva" element={<ProtectedRoute><CitaForm /></ProtectedRoute>} />
              <Route path="/citas/:id/editar" element={<ProtectedRoute><CitaForm /></ProtectedRoute>} />
              <Route path="/pipeline" element={<ProtectedRoute><PlaceholderPage title="Pipeline" /></ProtectedRoute>} />
              <Route path="/reportes" element={<ProtectedRoute><PlaceholderPage title="Reportes" /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </LoginModalProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
