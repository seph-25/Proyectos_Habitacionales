import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLoginModal } from "@/contexts/LoginModalContext";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { openLoginModal } = useLoginModal();

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
  if (!user) return <Navigate to="/catalogo" replace />;

  return <>{children}</>;
};
