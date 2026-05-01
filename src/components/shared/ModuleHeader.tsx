import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/shared/Breadcrumbs";

interface ModuleHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function ModuleHeader({ breadcrumbs, eyebrow, title, description, actions }: ModuleHeaderProps) {
  return (
    <div className="space-y-3">
      {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-primary">{eyebrow}</p>
          )}
          <h1 className="text-2xl font-bold text-foreground mt-1">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </motion.div>
    </div>
  );
}
