import { Bell, Search } from "lucide-react";

interface Props {
  title: string;
}

export const Topbar = ({ title }: Props) => {
  return (
    <header className="fixed left-60 right-0 top-0 z-30 h-16 border-b border-border bg-white/80 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <h2 className="text-lg font-bold text-primary">{title}</h2>
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar..."
              className="h-9 w-72 rounded-sm border border-border bg-background/60 pl-9 pr-3 text-sm outline-none transition-all focus:border-primary focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
            DS
          </div>
        </div>
      </div>
    </header>
  );
};
