import { useRef, useState } from "react";
import { Upload, X, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ProjectImage {
  id: string;
  url: string;
  caption: string | null;
  image_type: string;
  display_order: number;
}

interface Props {
  projectId: string;
  images: ProjectImage[];
  onImagesChange: (images: ProjectImage[]) => void;
}

const IMAGE_TYPES = [
  { value: "cover",   label: "Portada" },
  { value: "gallery", label: "Galería" },
  { value: "modelo",  label: "Casa modelo" },
  { value: "amenity", label: "Amenidad" },
];

export const ImageUpload = ({ projectId, images, onImagesChange }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    const newImages: ProjectImage[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} no es una imagen válida`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} supera los 5 MB`);
        continue;
      }

      const ext = file.name.split(".").pop();
      const path = `${projectId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("project-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        toast.error(`Error subiendo ${file.name}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("project-images")
        .getPublicUrl(path);

      const hasCover = images.some((i) => i.image_type === "cover") ||
                       newImages.some((i) => i.image_type === "cover");

      const { data: row, error: insertError } = await supabase
        .from("project_images")
        .insert({
          project_id: projectId,
          url: urlData.publicUrl,
          image_type: hasCover ? "gallery" : "cover",
          display_order: images.length + newImages.length,
        })
        .select()
        .single();

      if (insertError || !row) {
        toast.error(`Error guardando ${file.name}`);
        continue;
      }

      newImages.push(row as ProjectImage);
    }

    setUploading(false);
    if (newImages.length > 0) {
      toast.success(`${newImages.length} imagen(es) subida(s)`);
      onImagesChange([...images, ...newImages]);
    }
  };

  const handleDelete = async (img: ProjectImage) => {
    setDeletingId(img.id);
    // Extraer path del storage desde la URL pública
    const urlParts = img.url.split("/project-images/");
    if (urlParts[1]) {
      await supabase.storage.from("project-images").remove([urlParts[1]]);
    }
    await supabase.from("project_images").delete().eq("id", img.id);
    setDeletingId(null);
    toast.success("Imagen eliminada");
    onImagesChange(images.filter((i) => i.id !== img.id));
  };

  const handleSetCover = async (img: ProjectImage) => {
    await supabase
      .from("project_images")
      .update({ image_type: "gallery" })
      .eq("project_id", projectId)
      .eq("image_type", "cover");
    await supabase
      .from("project_images")
      .update({ image_type: "cover" })
      .eq("id", img.id);
    toast.success("Portada actualizada");
    onImagesChange(
      images.map((i) => ({
        ...i,
        image_type: i.id === img.id ? "cover" : i.image_type === "cover" ? "gallery" : i.image_type,
      }))
    );
  };

  const handleTypeChange = async (img: ProjectImage, newType: string) => {
    await supabase
      .from("project_images")
      .update({ image_type: newType })
      .eq("id", img.id);
    onImagesChange(images.map((i) => (i.id === img.id ? { ...i, image_type: newType } : i)));
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-secondary/40 p-8 transition-colors hover:border-primary hover:bg-secondary/80"
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : (
          <Upload className="h-8 w-8 text-muted-foreground" />
        )}
        <p className="text-sm font-medium text-muted-foreground">
          {uploading ? "Subiendo imágenes..." : "Haz clic o arrastra imágenes aquí"}
        </p>
        <p className="text-xs text-muted-foreground">PNG, JPG, WEBP · máx 5 MB por imagen</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Grid de imágenes actuales */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="group relative overflow-hidden rounded-lg border border-border bg-card">
              <img
                src={img.url}
                alt={img.caption ?? "Imagen del proyecto"}
                className="h-32 w-full object-cover"
              />

              {/* Badge portada */}
              {img.image_type === "cover" && (
                <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-primary">
                  <Star className="h-3 w-3" /> Portada
                </span>
              )}

              {/* Overlay acciones */}
              <div className="absolute inset-0 flex flex-col justify-between bg-black/50 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex justify-between">
                  {img.image_type !== "cover" && (
                    <button
                      onClick={() => handleSetCover(img)}
                      title="Usar como portada"
                      className="rounded-full bg-accent p-1 text-primary"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(img)}
                    disabled={deletingId === img.id}
                    className="ml-auto rounded-full bg-destructive p-1 text-white"
                  >
                    {deletingId === img.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                <select
                  value={img.image_type}
                  onChange={(e) => handleTypeChange(img, e.target.value)}
                  className="rounded-sm bg-black/60 px-1.5 py-0.5 text-[11px] text-white outline-none"
                >
                  {IMAGE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
