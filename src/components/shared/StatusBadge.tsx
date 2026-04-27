import { cn } from "@/lib/utils";
import type { StandStatus, BookingStatus, FairStatus, FairVersionStatus } from "@/data/mockData";
import { standStatusLabels, bookingStatusLabels, fairVersionStatusLabels } from "@/data/mockData";

const standStatusStyles: Record<StandStatus, string> = {
  available: "bg-status-available/15 text-status-available border-status-available/45",
  pending: "bg-status-pending/15 text-status-pending border-status-pending/45",
  reserved: "bg-status-approved/15 text-status-approved border-status-approved/45",
};

const bookingStyles: Record<BookingStatus, string> = {
  available: "bg-status-available/15 text-status-available border-status-available/45",
  pending: "bg-status-pending/15 text-status-pending border-status-pending/45",
  reserved: "bg-status-approved/15 text-status-approved border-status-approved/45",
};

const fairStyles: Record<FairStatus, string> = {
  'planificación': "bg-status-proposed/15 text-status-proposed border-status-proposed/45",
  'comercialización': "bg-status-sold/15 text-status-sold border-status-sold/45",
  'en_curso': "bg-status-approved/15 text-status-approved border-status-approved/45",
  'finalizada': "bg-status-unavailable/15 text-status-unavailable border-status-unavailable/45",
};

const fairLabels: Record<FairStatus, string> = {
  'planificación': "Planning",
  'comercialización': "Sales",
  'en_curso': "En curso",
  'finalizada': "Finalizada",
};

const versionStyles: Record<FairVersionStatus, string> = {
  draft: "bg-status-pending/15 text-status-pending border-status-pending/45",
  published: "bg-status-approved/15 text-status-approved border-status-approved/45",
  commercial_draft: "bg-status-proposed/15 text-status-proposed border-status-proposed/45",
};

interface StatusBadgeProps {
  status: StandStatus | BookingStatus | FairStatus | FairVersionStatus;
  type: 'stand' | 'booking' | 'fair' | 'version';
  className?: string;
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  let style = "";
  let label = "";

  if (type === 'stand') {
    style = standStatusStyles[status as StandStatus] || "";
    label = standStatusLabels[status as StandStatus] || status;
  } else if (type === 'booking') {
    style = bookingStyles[status as BookingStatus] || "";
    label = bookingStatusLabels[status as BookingStatus] || status;
  } else if (type === 'fair') {
    style = fairStyles[status as FairStatus] || "";
    label = fairLabels[status as FairStatus] || status;
  } else if (type === 'version') {
    style = versionStyles[status as FairVersionStatus] || "";
    label = fairVersionStatusLabels[status as FairVersionStatus] || status;
  }

  return <span className={cn("inline-flex items-center border px-[12.8px] py-[6.55px] text-[12.8px] font-extrabold", style, className)}>{label}</span>;
}
