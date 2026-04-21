import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Building2, BookOpen, Users,
  Calendar, KanbanSquare, BarChart2, LogOut, X,
  UserCircle, LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useLoginModal } from "@/contexts/LoginModalContext";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const NAV_PUBLIC = [
  { to: "/catalogo", label: "Catálogo", icon: BookOpen },
];

const NAV_PRIVATE = [
  { to: "/",          label: "Dashboard",  icon: LayoutDashboard, exact: true },
  { to: "/proyectos", label: "Proyectos",  icon: Building2 },
  { to: "/catalogo",  label: "Catálogo",   icon: BookOpen },
  { to: "/prospectos",label: "Prospectos", icon: Users },
  { to: "/citas",     label: "Citas",      icon: Calendar },
  { to: "/pipeline",  label: "Pipeline",   icon: KanbanSquare },
  { to: "/reportes",  label: "Reportes",   icon: BarChart2 },
];

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const { pathname } = useLocation();
  const { user, profile, signOut } = useAuth();
  const { openLoginModal } = useLoginModal();

  const NAV = user ? NAV_PRIVATE : NAV_PUBLIC;

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return pathname === to;
    return pathname === to || pathname.startsWith(to + "/");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen w-60 flex-col gradient-sidebar text-white transition-transform duration-300",
        "lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* Logo + close button (mobile) */}
      <div className="flex items-start justify-between px-6 pb-6 pt-7">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">HABITATRACK</h1>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.15em] text-white/60">
            The Architectural Ledger
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-1 rounded-md p-1 text-white/60 transition-colors hover:text-white lg:hidden"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {NAV.map(({ to, label, icon: Icon, exact }) => {
            const active = isActive(to, exact);
            return (
              <li key={to}>
                <NavLink
                  to={to}
                  end={exact}
                  onClick={onClose}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider transition-colors",
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white/90",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                  <span>{label}</span>
                  {active && (
                    <span className="absolute right-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-l-sm bg-accent" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer: diferente según sesión */}
      <div className="border-t border-white/10 p-3 space-y-1">
        {user ? (
          <>
            {/* Info del usuario */}
            {profile && (
              <div className="flex items-center gap-2 rounded-md px-3 py-2">
                <UserCircle className="h-5 w-5 shrink-0 text-white/50" />
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold text-white/90">{profile.full_name}</p>
                  <p className="truncate text-[10px] text-white/50">{profile.role}</p>
                </div>
              </div>
            )}
            {/* Cerrar sesión */}
            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/60 transition-colors hover:bg-white/5 hover:text-white/90"
            >
              <LogOut className="h-4 w-4" strokeWidth={2.25} />
              Cerrar Sesión
            </button>
          </>
        ) : (
          /* Iniciar sesión */
          <button
            onClick={() => { onClose(); openLoginModal(); }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogIn className="h-4 w-4" strokeWidth={2.25} />
            Iniciar Sesión
          </button>
        )}
      </div>
    </aside>
  );
};
