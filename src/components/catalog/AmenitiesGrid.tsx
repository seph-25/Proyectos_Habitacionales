import {
  Waves, Dumbbell, Users, Gamepad2, Trophy, Car, ShieldCheck,
  Leaf, Flame, Laptop, Sparkles, UtensilsCrossed, Umbrella,
  Sunset, Mountain, TreePine, BuildingIcon, Bike, ParkingSquare, Anchor,
} from "lucide-react";

const AMENITY_ICONS: Record<string, React.ElementType> = {
  "Piscina": Waves,
  "Gimnasio": Dumbbell,
  "Salón comunal": Users,
  "Área de juegos": Gamepad2,
  "Cancha deportiva": Trophy,
  "Parqueo visitantes": ParkingSquare,
  "Seguridad 24 horas": ShieldCheck,
  "Jardines": Leaf,
  "Zona de BBQ": Flame,
  "Coworking": Laptop,
  "Spa": Sparkles,
  "Restaurante": UtensilsCrossed,
  "Acceso a playa": Umbrella,
  "Vista al mar": Sunset,
  "Vista al valle": Mountain,
  "Senderos": TreePine,
  "Rooftop": BuildingIcon,
  "Bici-parqueo": Bike,
  "Áreas verdes": Leaf,
  "Marina": Anchor,
};

interface Props {
  amenities: string[];
}

export const AmenitiesGrid = ({ amenities }: Props) => {
  if (amenities.length === 0) {
    return (
      <p className="py-4 text-sm italic text-muted-foreground">
        Sin amenidades registradas
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {amenities.map((amenity) => {
        const Icon = AMENITY_ICONS[amenity] ?? Sparkles;
        return (
          <div
            key={amenity}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary/40 px-3 py-2.5"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground">{amenity}</span>
          </div>
        );
      })}
    </div>
  );
};
