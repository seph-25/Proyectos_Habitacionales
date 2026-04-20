import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Spinner = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center justify-center py-16", className)}>
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);
