import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLoginModal } from "@/contexts/LoginModalContext";

const GERENTE_COMERCIAL_EXCLUSIVE_ROUTES = ["/dashboard-ejecutivo"]

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, profile } = useAuth();
  const { openLoginModal } = useLoginModal();
  const location = useLocation();

  useEffect(() => {
    // Si alguien intenta acceder a una ruta protegida sin sesión,
    // abrimos el modal de login automáticamente.
    if (!loading && !user) {
      openLoginModal();
    }
  }, [loading, user, openLoginModal]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
    </div>
  );

  // Si no hay sesión, redirige al catálogo mientras el modal se abre
  if (!user || !profile) return <Navigate to="/catalogo" replace />;

  if (profile.role !== "Gerente Comercial" && GERENTE_COMERCIAL_EXCLUSIVE_ROUTES.includes(location.pathname)) return <Navigate to="/" replace />

  return <>{children}</>;
};
