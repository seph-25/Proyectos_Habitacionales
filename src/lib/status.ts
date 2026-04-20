export const PROJECT_STATUSES = [
  "En gestación",
  "En construcción",
  "Parcialmente terminado",
  "Terminado",
  "En gestión de venta",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const STATUS_STYLES: Record<ProjectStatus, { bg: string; text: string; dot: string }> = {
  "En gestación": {
    bg: "bg-status-gestacion/15",
    text: "text-status-gestacion",
    dot: "bg-status-gestacion",
  },
  "En construcción": {
    bg: "bg-status-construccion/15",
    text: "text-status-construccion",
    dot: "bg-status-construccion",
  },
  "Parcialmente terminado": {
    bg: "bg-status-parcial/15",
    text: "text-status-parcial",
    dot: "bg-status-parcial",
  },
  Terminado: {
    bg: "bg-status-terminado/15",
    text: "text-status-terminado",
    dot: "bg-status-terminado",
  },
  "En gestión de venta": {
    bg: "bg-status-venta/15",
    text: "text-status-venta",
    dot: "bg-status-venta",
  },
};

export const PROVINCES = [
  "San José",
  "Alajuela",
  "Cartago",
  "Heredia",
  "Guanacaste",
  "Puntarenas",
  "Limón",
] as const;

export const PROJECT_TYPES = ["Residencial", "Condominio", "Apartamentos", "Mixto"] as const;
