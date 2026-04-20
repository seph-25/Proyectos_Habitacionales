import { Bell, Menu } from "lucide-react";

interface Props {
  title: string;
  onMenuClick: () => void;
}

export const Topbar = ({ title, onMenuClick }: Props) => {
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
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            DS
          </div>
        </div>
      </div>
    </header>
  );
};
