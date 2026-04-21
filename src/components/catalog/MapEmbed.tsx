import { MapPin, ExternalLink } from "lucide-react";

interface Props {
  coordinates: string;   // "lat,lng"  ej: "9.9281,-84.0907"
  address?: string | null;
  projectName: string;
}

export const MapEmbed = ({ coordinates, address, projectName }: Props) => {
  const parts = coordinates.split(",").map((s) => s.trim());
  if (parts.length !== 2) return null;

  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  if (isNaN(lat) || isNaN(lng)) return null;

  const delta = 0.008;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="flex items-center justify-between bg-card px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <MapPin className="h-4 w-4" />
          {address ?? `${projectName} — Ubicación`}
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-primary"
        >
          Google Maps <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <iframe
        title={`Mapa de ${projectName}`}
        src={embedUrl}
        className="h-64 w-full border-0 md:h-80"
        loading="lazy"
      />
    </div>
  );
};
