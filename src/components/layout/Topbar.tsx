import { useAuth } from "@/contexts/AuthContext";
import { Bell, Menu } from "lucide-react";

interface Props {
  title: string;
  onMenuClick: () => void;
}

const getInitials = (fullName: string) => {
  const names = fullName.split(" ");
  const initials = names.map((n) => n.charAt(0).toUpperCase()).join("");
  return initials.slice(0, 2); // Limitar a 2 caracteres
}

export const Topbar = ({ title, onMenuClick }: Props) => {
  const { user, profile } = useAuth();

  return (
    <header className="fixed left-0 right-0 top-0 z-30 h-16 border-b border-border bg-white/80 backdrop-blur-md lg:left-60">
      <div className="flex h-full items-center justify-between px-6 md:px-8">
        <div className="flex items-center gap-3">
          {/* Hamburger — solo visible en mobile */}
          <button
            onClick={onMenuClick}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-bold text-primary">{title}</h2>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
          </button>
          {user && profile ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {getInitials(profile.full_name)}
            </div>
          ) : (
            <div className="flex px-2 py-1 items-center justify-center rounded-full bg-primary text-sm font-light text-primary-foreground">
              Invitado
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
