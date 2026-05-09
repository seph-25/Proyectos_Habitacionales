import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/Spinner";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ElementType;
  color?: string;
  onClick?: () => void;
  isLoading?: boolean;
  children?: ReactNode;
}

export const KPICard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "bg-primary/10 text-primary",
  onClick,
  isLoading,
  children,
}: KPICardProps) => {
  return (
    <div
      className={cn(
        "rounded-lg bg-card p-6 shadow-card transition-all",
        onClick && "cursor-pointer hover:shadow-elevated hover:scale-[1.01]"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          {isLoading ? (
            <div className="mt-3">
              <Spinner className="py-4" />
            </div>
          ) : (
            <>
              <p className="mt-3 text-3xl font-bold text-primary">{value}</p>
              {subtitle && (
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              )}
            </>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
              color
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};
