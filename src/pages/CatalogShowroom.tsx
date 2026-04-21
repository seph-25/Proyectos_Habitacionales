import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Building2,
  Hash,
  Maximize2,
  DollarSign,
  Calendar,
  Layers,
  Images,
  Map,
  Sparkles,
  Home,
  Banknote,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { Spinner } from "@/components/Spinner";
import { StatusBadge } from "@/components/StatusBadge";
import { ImageGallery } from "@/components/catalog/ImageGallery";
import { MapEmbed } from "@/components/catalog/MapEmbed";
import { AmenitiesGrid } from "@/components/catalog/AmenitiesGrid";
import { CasaModeloSection } from "@/components/catalog/CasaModeloSection";
import { FinancingSection } from "@/components/catalog/FinancingSection";
import { supabase } from "@/integrations/supabase/client";
import type { UnitType, FinancingOption } from "@/lib/status";

interface ShowroomProject {
  id: string;
  name: string;
  province: string;
  canton: string;
  description: string | null;
  project_type: string | null;
  units: number | null;
  start_date: string | null;
  status: string;
  address: string | null;
  coordinates: string | null;
  price_from: number | null;
  area_m2_from: number | null;
  amenities: string[] | null;
  financing_options: unknown;
  unit_types: unknown;
}

interface GalleryImage {
  url: string;
  caption: string | null;
  image_type: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(n);

const InfoChip = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-card">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-bold text-foreground">{value}</p>
    </div>
  </div>
);

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-xl bg-card p-6 shadow-card">
    <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-primary">
      <Icon className="h-5 w-5" />
      {title}
    </h2>
    {children}
  </section>
);

const CatalogShowroom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ShowroomProject | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);

      const [{ data: p, error: pe }, { data: imgs }] = await Promise.all([
        supabase.from("projects").select("*").eq("id", id).maybeSingle(),
        supabase
          .from("project_images")
          .select("url, caption, image_type, display_order")
          .eq("project_id", id)
          .order("display_order", { ascending: true }),
      ]);

      if (pe || !p) {
        toast.error("Proyecto no encontrado");
        navigate("/catalogo");
        return;
      }

      setProject(p as ShowroomProject);
      setImages(
        (imgs ?? []).map((i) => ({
          url: i.url,
          caption: i.caption,
          image_type: i.image_type,
        }))
      );
      setLoading(false);
    })();
  }, [id, navigate]);

  if (loading || !project) {
    return (
      <AppLayout title="Cargando...">
        <Spinner />
      </AppLayout>
    );
  }

  const unitTypes = Array.isArray(project.unit_types)
    ? (project.unit_types as UnitType[])
    : [];
  const financingOptions = Array.isArray(project.financing_options)
    ? (project.financing_options as FinancingOption[])
    : [];
  const amenities: string[] = project.amenities ?? [];

  return (
    <AppLayout title={project.name}>
      {/* Volver al catálogo */}
      <Link
        to="/catalogo"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al Catálogo
      </Link>

      {/* Hero header */}
      <div className="mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary-deep p-6 shadow-elevated md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {project.project_type && (
              <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                {project.project_type}
              </span>
            )}
            <h1 className="text-2xl font-extrabold text-white md:text-3xl">
              {project.name}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-white/80">
              <MapPin className="h-4 w-4 shrink-0" />
              {project.canton}, {project.province}
              {project.address && <> · {project.address}</>}
            </p>
          </div>
          <StatusBadge status={project.status} size="lg" />
        </div>

        {/* Quick stats */}
        <div className="mt-6 flex flex-wrap gap-6 border-t border-white/20 pt-5">
          {project.units && (
            <div className="text-center">
              <p className="text-2xl font-extrabold text-white">{project.units}</p>
              <p className="text-xs text-white/70">Unidades</p>
            </div>
          )}
          {project.area_m2_from && (
            <div className="text-center">
              <p className="text-2xl font-extrabold text-white">
                {project.area_m2_from} m²
              </p>
              <p className="text-xs text-white/70">Desde</p>
            </div>
          )}
          {project.price_from && (
            <div className="text-center">
              <p className="text-lg font-extrabold text-white">
                {fmt(project.price_from)}
              </p>
              <p className="text-xs text-white/70">Precio desde</p>
            </div>
          )}
          {project.start_date && (
            <div className="text-center">
              <p className="text-lg font-extrabold text-white">
                {format(new Date(project.start_date), "MMM yyyy", { locale: es })}
              </p>
              <p className="text-xs text-white/70">Inicio</p>
            </div>
          )}
        </div>
      </div>

      {/* Galería de imágenes */}
      {images.length > 0 && (
        <div className="mb-8 rounded-xl bg-card p-4 shadow-card">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-primary">
            <Images className="h-5 w-5" />
            Galería de Imágenes
          </h2>
          <ImageGallery images={images} />
        </div>
      )}

      {/* Descripción + ficha técnica */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Descripción */}
        {project.description && (
          <div className="lg:col-span-3">
            <Section icon={Building2} title="Descripción del Proyecto">
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                {project.description}
              </p>
            </Section>
          </div>
        )}

        {/* Ficha técnica */}
        <div
          className={
            project.description ? "lg:col-span-2" : "lg:col-span-5"
          }
        >
          <Section icon={Layers} title="Ficha Técnica">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoChip
                icon={MapPin}
                label="Ubicación"
                value={`${project.canton}, ${project.province}`}
              />
              {project.project_type && (
                <InfoChip
                  icon={Layers}
                  label="Tipo de Proyecto"
                  value={project.project_type}
                />
              )}
              {project.units && (
                <InfoChip
                  icon={Hash}
                  label="Total de Unidades"
                  value={`${project.units} unidades`}
                />
              )}
              {project.area_m2_from && (
                <InfoChip
                  icon={Maximize2}
                  label="Área mínima"
                  value={`Desde ${project.area_m2_from} m²`}
                />
              )}
              {project.price_from && (
                <InfoChip
                  icon={DollarSign}
                  label="Precio desde"
                  value={fmt(project.price_from)}
                />
              )}
              {project.start_date && (
                <InfoChip
                  icon={Calendar}
                  label="Fecha de Inicio"
                  value={format(new Date(project.start_date), "dd 'de' MMMM yyyy", {
                    locale: es,
                  })}
                />
              )}
            </div>
          </Section>
        </div>
      </div>

      {/* Mapa */}
      {project.coordinates && (
        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-primary">
            <Map className="h-5 w-5" />
            Ubicación en el Mapa
          </h2>
          <MapEmbed
            coordinates={project.coordinates}
            address={project.address}
            projectName={project.name}
          />
        </div>
      )}

      {/* Amenidades */}
      {amenities.length > 0 && (
        <div className="mb-8">
          <Section icon={Sparkles} title="Amenidades">
            <AmenitiesGrid amenities={amenities} />
          </Section>
        </div>
      )}

      {/* Modelos de unidades */}
      {unitTypes.length > 0 && (
        <div className="mb-8">
          <Section icon={Home} title="Modelos de Unidades">
            <CasaModeloSection unitTypes={unitTypes} />
          </Section>
        </div>
      )}

      {/* Opciones de financiamiento */}
      {financingOptions.length > 0 && (
        <div className="mb-8">
          <Section icon={Banknote} title="Opciones de Financiamiento">
            <FinancingSection options={financingOptions} />
          </Section>
        </div>
      )}

      {/* CTA inferior */}
      <div className="mt-4 rounded-xl bg-secondary/60 p-6 text-center">
        <p className="text-sm font-semibold text-foreground">
          ¿Te interesa este proyecto?
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Contacta con nuestro equipo de ventas para más información.
        </p>
        <Link
          to="/catalogo"
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-bold text-white transition hover:bg-primary/90"
        >
          <ArrowLeft className="h-4 w-4" /> Ver otros proyectos
        </Link>
      </div>
    </AppLayout>
  );
};

export default CatalogShowroom;
