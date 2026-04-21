import { BedDouble, Bath, Maximize2, DollarSign } from "lucide-react";
import type { UnitType } from "@/lib/status";

interface Props {
  unitTypes: UnitType[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 }).format(n);

export const CasaModeloSection = ({ unitTypes }: Props) => {
  if (unitTypes.length === 0) {
    return (
      <p className="py-4 text-sm italic text-muted-foreground">
        Sin modelos de unidades registrados
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {unitTypes.map((unit, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated"
        >
          {/* Header */}
          <div className="bg-primary px-4 py-3">
            <h4 className="font-bold text-primary-foreground">{unit.nombre}</h4>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 p-4">
            <Stat icon={BedDouble} label="Habitaciones" value={unit.habitaciones} />
            <Stat icon={Bath} label="Baños" value={unit.banos} />
            <Stat icon={Maximize2} label="Área" value={`${unit.area_m2} m²`} />
            <Stat icon={DollarSign} label="Precio" value={fmt(unit.precio)} small />
          </div>
        </div>
      ))}
    </div>
  );
};

const Stat = ({
  icon: Icon,
  label,
  value,
  small,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  small?: boolean;
}) => (
  <div className="flex items-start gap-2">
    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary">
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`font-bold text-foreground ${small ? "text-xs" : "text-sm"}`}>{value}</p>
    </div>
  </div>
);
