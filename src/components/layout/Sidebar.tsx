import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Users,
  Calendar,
  KanbanSquare,
  BarChart2,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/proyectos", label: "Proyectos", icon: Building2 },
  { to: "/catalogo", label: "Catálogo", icon: BookOpen },
  { to: "/prospectos", label: "Prospectos", icon: Users },
  { to: "/citas", label: "Citas", icon: Calendar },
  { to: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { to: "/reportes", label: "Reportes", icon: BarChart2 },
];

export const Sidebar = () => {
  const { pathname } = useLocation();

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return pathname === to;
    return pathname === to || pathname.startsWith(to + "/");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col gradient-sidebar text-white">
      {/* Logo */}
      <div className="px-6 pb-6 pt-7">
        <h1 className="text-xl font-extrabold tracking-tight text-white">HABITATRACK</h1>
        <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.15em] text-white/60">
          The Architectural Ledger
        </p>
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

      {/* Sign out */}
      <div className="border-t border-white/10 p-3">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/60 transition-colors hover:bg-white/5 hover:text-white/90">
          <LogOut className="h-4 w-4" strokeWidth={2.25} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
