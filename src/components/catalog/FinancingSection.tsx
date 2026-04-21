import { Banknote, Percent, Clock, Info } from "lucide-react";
import type { FinancingOption } from "@/lib/status";

interface Props {
  options: FinancingOption[];
}

export const FinancingSection = ({ options }: Props) => {
  if (options.length === 0) {
    return (
      <p className="py-4 text-sm italic text-muted-foreground">
        Sin opciones de financiamiento registradas
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {options.map((opt, i) => (
        <div
          key={i}
          className="flex flex-wrap items-start gap-4 rounded-xl border border-border bg-card p-4 shadow-card"
        >
          {/* Banco */}
          <div className="flex min-w-[160px] flex-1 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Banknote className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Banco / Entidad</p>
              <p className="font-bold text-foreground">{opt.banco}</p>
            </div>
          </div>

          {/* Tasa */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-status-construccion/10">
              <Percent className="h-5 w-5 text-status-construccion" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tasa anual</p>
              <p className="font-bold text-foreground">{opt.tasa}%</p>
            </div>
          </div>

          {/* Plazo */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-status-venta/10">
              <Clock className="h-5 w-5 text-status-venta" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Plazo</p>
              <p className="font-bold text-foreground">{opt.plazo_anos} años</p>
            </div>
          </div>

          {/* Notas */}
          {opt.notas && (
            <div className="flex w-full items-start gap-2 border-t border-border pt-2 mt-1">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{opt.notas}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
