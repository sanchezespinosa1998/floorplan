import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: { value: string; positive: boolean };
  className?: string;
  delay?: number;
}
export function KpiCard({ title, value, subtitle, icon: Icon, trend, className }: KpiCardProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3 border border-border bg-card px-4 py-4 sm:px-5 sm:py-5", className)}>
      <div className="flex items-start justify-between w-full gap-3">
        <div className="min-w-0 flex-1">
          <p className="whitespace-pre-line text-[10px] font-bold uppercase leading-[1.25] tracking-[1.1px] text-muted-foreground sm:text-[11px] sm:tracking-[1.37px]">
            {title}
          </p>
          <p className="mt-2 text-[28px] font-bold leading-[0.85] text-foreground tabular-nums sm:text-[36px] lg:text-[40px] lg:leading-[0.85]">
            {value}
          </p>
          {subtitle && <p className="mt-2 text-[10.5px] leading-[1.3] text-muted-foreground sm:text-[11.5px]">{subtitle}</p>}
          {trend && (
            <p className={cn("mt-1.5 text-[11px] font-bold", trend.positive ? "text-emerald-500" : "text-rose-500")}>
              {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-secondary">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
