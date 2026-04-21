import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Si ya está autenticado, redirigir al dashboard
  if (!loading && user) return <Navigate to="/" replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) { setError("Ingresa tu correo electrónico"); return; }
    if (!password) { setError("Ingresa tu contraseña"); return; }

    setSubmitting(true);
    const { error: authError } = await signIn(email.trim(), password);
    setSubmitting(false);

    if (authError) {
      // Traducir mensajes comunes de Supabase
      if (authError.includes("Invalid login credentials")) {
        setError("Correo o contraseña incorrectos");
      } else if (authError.includes("Email not confirmed")) {
        setError("Debes confirmar tu correo antes de ingresar");
      } else {
        setError("Error al iniciar sesión. Intenta de nuevo.");
      }
      return;
    }

    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">HABITATRACK</h1>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            The Architectural Ledger
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl bg-card p-8 shadow-elevated">
          <h2 className="mb-1 text-xl font-bold text-foreground">Iniciar sesión</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Ingresa con tu cuenta de HABITATRACK
          </p>

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="h-10 w-full rounded-sm border border-border bg-background/60 px-3 text-sm outline-none transition focus:border-primary focus:bg-white"
                placeholder="usuario@empresa.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="h-10 w-full rounded-sm border border-border bg-background/60 px-3 pr-10 text-sm outline-none transition focus:border-primary focus:bg-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {submitting ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          HABITATRACK © {new Date().getFullYear()} · Todos los derechos reservados
        </p>
      </div>
    </div>
  );
};

export default Login;
