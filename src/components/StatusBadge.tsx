import { cn } from "@/lib/utils";
import { ProjectStatus, STATUS_STYLES } from "@/lib/status";

interface Props {
  status: ProjectStatus | string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const StatusBadge = ({ status, size = "sm", className }: Props) => {
  const style = STATUS_STYLES[status as ProjectStatus] ?? STATUS_STYLES["En gestación"];
  const sizeClass = {
    sm: "text-[11px] px-2.5 py-1",
    md: "text-xs px-3 py-1.5",
    lg: "text-sm px-4 py-2",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap",
        style.bg,
        style.text,
        sizeClass,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {status}
    </span>
  );
};
