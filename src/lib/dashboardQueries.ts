import { supabase } from "@/integrations/supabase/client";

export interface ProyectosPorEstado {
  status: string;
  count: number;
  projects: { id: string; name: string; province: string; canton: string; units: number | null }[];
}

export const getProyectosPorEstado = async (): Promise<ProyectosPorEstado[]> => {
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, province, canton, status, units")
    .order("name", { ascending: true });

  if (error || !data) return [];

  const grouped: Record<string, ProyectosPorEstado> = {};
  (data as any[]).forEach((p) => {
    if (!grouped[p.status]) {
      grouped[p.status] = { status: p.status, count: 0, projects: [] };
    }
    grouped[p.status].count += 1;
    grouped[p.status].projects.push(p);
  });

  return Object.values(grouped);
};

export interface OportunidadesActivasResult {
  total: number;
  oportunidades: {
    id: string;
    etapa: string;
    valor_estimado: number | null;
    fecha_cierre_estimada: string | null;
    prospecto_nombre: string;
    proyecto_nombre: string | null;
  }[];
  porEtapa: { etapa: string; count: number }[];
}

export const getOportunidadesActivas = async (): Promise<OportunidadesActivasResult> => {
  const { data, error } = await (supabase as any)
    .from("oportunidades")
    .select(
      `id, etapa, valor_estimado, fecha_cierre_estimada,
       prospectos(nombre, apellidos),
       projects(name)`
    )
    .not("etapa", "in", '("Cerrado","Perdido")')
    .order("fecha_cierre_estimada", { ascending: true, nullsFirst: false });

  if (error || !data) {
    return { total: 0, oportunidades: [], porEtapa: [] };
  }

  const oportunidades = (data as any[]).map((o: any) => ({
    id: o.id,
    etapa: o.etapa,
    valor_estimado: o.valor_estimado,
    fecha_cierre_estimada: o.fecha_cierre_estimada,
    prospecto_nombre: o.prospectos ? `${o.prospectos.nombre} ${o.prospectos.apellidos}` : "—",
    proyecto_nombre: o.projects?.name ?? null,
  }));

  const porEtapaMap: Record<string, number> = {};
  oportunidades.forEach((o) => {
    porEtapaMap[o.etapa] = (porEtapaMap[o.etapa] ?? 0) + 1;
  });

  const porEtapa = Object.entries(porEtapaMap).map(([etapa, count]) => ({ etapa, count }));

  return { total: oportunidades.length, oportunidades, porEtapa };
};

export interface TasaCierreResult {
  percentage: number;
  cerradas: number;
  total: number;
  oportunidades: {
    id: string;
    etapa: string;
    valor_estimado: number | null;
    fecha_cierre_estimada: string | null;
    prospecto_nombre: string;
    proyecto_nombre: string | null;
  }[];
}

export const getTasaCierreMes = async (): Promise<TasaCierreResult> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const { data: allData, error: allError } = await (supabase as any)
    .from("oportunidades")
    .select(
      `id, etapa, valor_estimado, fecha_cierre_estimada,
       prospectos(nombre, apellidos),
       projects(name)`
    )
    .gte("fecha_cierre_estimada", startOfMonth)
    .lte("fecha_cierre_estimada", endOfMonth);

  if (allError || !allData) {
    return { percentage: 0, cerradas: 0, total: 0, oportunidades: [] };
  }

  const oportunidades = (allData as any[]).map((o: any) => ({
    id: o.id,
    etapa: o.etapa,
    valor_estimado: o.valor_estimado,
    fecha_cierre_estimada: o.fecha_cierre_estimada,
    prospecto_nombre: o.prospectos ? `${o.prospectos.nombre} ${o.prospectos.apellidos}` : "—",
    proyecto_nombre: o.projects?.name ?? null,
  }));

  const total = oportunidades.length;
  const cerradas = oportunidades.filter((o) => o.etapa === "Cerrado").length;
  const percentage = total > 0 ? Math.round((cerradas / total) * 100) : 0;

  return {
    percentage,
    cerradas,
    total,
    oportunidades: oportunidades.filter((o) => o.etapa === "Cerrado"),
  };
};

export interface UnidadesPorEstado {
  status: string;
  units: number;
  projects: { id: string; name: string; province: string; canton: string; units: number | null }[];
}

export const getUnidadesDisponiblesPorEstado = async (): Promise<UnidadesPorEstado[]> => {
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, province, canton, status, units")
    .order("name", { ascending: true });

  if (error || !data) return [];

  const grouped: Record<string, UnidadesPorEstado> = {};
  (data as any[]).forEach((p) => {
    if (!grouped[p.status]) {
      grouped[p.status] = { status: p.status, units: 0, projects: [] };
    }
    grouped[p.status].units += p.units ?? 0;
    grouped[p.status].projects.push(p);
  });

  return Object.values(grouped);
};
