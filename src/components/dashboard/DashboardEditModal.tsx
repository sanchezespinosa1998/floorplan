import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DashboardEditModalProps {
  open: boolean;
  title: string;
  description?: string;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  saveLabel?: string;
  children: ReactNode;
}

export function DashboardEditModal({
  open,
  title,
  description,
  onOpenChange,
  onSave,
  saveLabel = "Guardar cambios",
  children,
}: DashboardEditModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] rounded-[12px] border border-[#333333] bg-[#141414] p-0 text-[#dadada]">
        <DialogHeader className="border-b border-[#333333] px-5 py-4">
          <DialogTitle className="text-[16px] font-bold uppercase tracking-[0.8px] text-[#fafafa]">
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription className="text-[12px] text-[#9a9a9a]">{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="grid gap-3 px-5 py-4">{children}</div>

        <div className="flex items-center justify-end gap-2 border-t border-[#333333] bg-[#0a0a0a] px-5 py-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="ui-hover-surface ui-interactive-base inline-flex h-[34px] items-center rounded-[8px] border border-[#333333] bg-[#141414] px-3 text-[12px] font-semibold text-[#fafafa]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            className="ui-hover-accent ui-interactive-base inline-flex h-[34px] items-center rounded-[8px] border border-[#2f4310] bg-[#2f4310] px-3 text-[12px] font-semibold text-[#8fee00]"
          >
            {saveLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
