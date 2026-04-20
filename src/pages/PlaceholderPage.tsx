import { Construction } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

interface Props {
  title: string;
}

export const PlaceholderPage = ({ title }: Props) => (
  <AppLayout title={title}>
    <div className="rounded-lg bg-card p-16 text-center shadow-card">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
        <Construction className="h-8 w-8 text-accent-foreground" />
      </div>
      <h2 className="mt-5 text-xl font-bold text-primary">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">Este módulo estará disponible próximamente.</p>
    </div>
  </AppLayout>
);

export default PlaceholderPage;
