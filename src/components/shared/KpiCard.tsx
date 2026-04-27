import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  className?: string;
  delay?: number;
}
export function KpiCard({ title, value, subtitle, icon: Icon, trend, className }: KpiCardProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 border-[1.72px] border-border bg-card px-[31.25px] py-[25px]", className)}>
      <div className="flex items-start justify-between w-full">
        <div>
          <p className="text-[12.8px] font-bold uppercase tracking-[1.37px] text-muted-foreground">{title}</p>
          <p className="mt-[8.19px] text-[48.83px] font-bold leading-[0.8] text-foreground">{value}</p>
          {subtitle && <p className="mt-[8.19px] text-[12.8px] text-muted-foreground">{subtitle}</p>}
          {trend && (
            <p className={cn("mt-[8.19px] text-[12.8px] font-bold", trend.positive ? "text-primary" : "text-destructive")}>
              {trend.value}
            </p>
          )}
        </div>
        <div className="flex h-[48.83px] w-[48.83px] items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
