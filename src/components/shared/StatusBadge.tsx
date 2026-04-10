import { cn } from "@/lib/utils";
import type { StandStatus, ReservationStatus, FairStatus, FairVersionStatus } from "@/data/mockData";
import { standStatusLabels, reservationStatusLabels, fairVersionStatusLabels } from "@/data/mockData";

const standStatusStyles: Record<StandStatus, string> = {
  available: "bg-primary-surface text-primary border-primary",
  proposed: "bg-accent-surface text-accent border-accent",
  pending: "bg-warning-surface text-warning border-warning",
  approved: "bg-success-surface text-success border-success",
  blocked: "bg-neutral-surface text-neutral border-neutral",
  sold: "bg-primary-surface text-primary border-primary",
  unavailable: "bg-neutral-surface text-neutral border-neutral",
  conflict: "bg-destructive-surface text-destructive border-destructive",
  review: "bg-accent-surface text-accent border-accent",
};

const reservationStyles: Record<ReservationStatus, string> = {
  solicitud: "bg-accent-surface text-accent border-accent",
  pendiente: "bg-warning-surface text-warning border-warning",
  aprobada: "bg-primary-surface text-primary border-primary",
  rechazada: "bg-destructive-surface text-destructive border-destructive",
  cancelada: "bg-neutral-surface text-neutral border-neutral",
  en_revision: "bg-accent-surface text-accent border-accent",
  bloqueada: "bg-neutral-surface text-neutral border-neutral",
};

const fairStyles: Record<FairStatus, string> = {
  'planificación': "bg-accent-surface text-accent border-accent",
  'comercialización': "bg-primary-surface text-primary border-primary",
  'en_curso': "bg-success-surface text-success border-success",
  'finalizada': "bg-neutral-surface text-neutral border-neutral",
};

const fairLabels: Record<FairStatus, string> = {
  'planificación': "Planning",
  'comercialización': "Sales",
  'en_curso': "En curso",
  'finalizada': "Finalizada",
};

const versionStyles: Record<FairVersionStatus, string> = {
  borrador: "bg-warning-surface text-warning border-warning",
  publicada: "bg-success-surface text-success border-success",
};

interface StatusBadgeProps {
  status: StandStatus | ReservationStatus | FairStatus | FairVersionStatus;
  type: 'stand' | 'reservation' | 'fair' | 'version';
  className?: string;
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  let style = "";
  let label = "";

  if (type === 'stand') {
    style = standStatusStyles[status as StandStatus] || "";
    label = standStatusLabels[status as StandStatus] || status;
  } else if (type === 'reservation') {
    style = reservationStyles[status as ReservationStatus] || "";
    label = reservationStatusLabels[status as ReservationStatus] || status;
  } else if (type === 'fair') {
    style = fairStyles[status as FairStatus] || "";
    label = fairLabels[status as FairStatus] || status;
  } else if (type === 'version') {
    style = versionStyles[status as FairVersionStatus] || "";
    label = fairVersionStatusLabels[status as FairVersionStatus] || status;
  }

  return <span className={cn("inline-flex items-center border px-[12.8px] py-[6.55px] text-[12.8px] font-extrabold", style, className)}>{label}</span>;
}
