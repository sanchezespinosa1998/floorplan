import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/data/mockData";
import { roleLabels } from "@/data/mockData";
import { GitPullRequest, Map, UserPlus, CheckCircle2, AlertTriangle } from "lucide-react";

const typeIcons = {
  reservation: GitPullRequest,
  plan: Map,
  user: UserPlus,
  approval: CheckCircle2,
  conflict: AlertTriangle,
};

const typeColors = {
  reservation: "text-status-proposed",
  plan: "text-primary",
  user: "text-status-review",
  approval: "text-status-approved",
  conflict: "text-status-conflict",
};

interface ActivityTimelineProps {
  activities: ActivityItem[];
  maxItems?: number;
  className?: string;
}

export function ActivityTimeline({ activities, maxItems = 8, className }: ActivityTimelineProps) {
  const items = activities.slice(0, maxItems);

  return (
    <div className={cn("space-y-0", className)}>
      {items.map((item, i) => {
        const Icon = typeIcons[item.type];
        return (
          <div key={item.id} className="flex gap-3 py-3 border-b border-border last:border-0">
            <div className={cn("mt-0.5 shrink-0", typeColors[item.type])}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground">
                <span className="font-medium">{item.user}</span>
                <span className="text-muted-foreground"> ({roleLabels[item.role]}) </span>
                <span className="text-muted-foreground">{item.action} </span>
                <span className="font-medium">{item.target}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
