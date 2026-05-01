import { useState, useEffect } from "react";
import { useRef } from "react";
import { Search, GitPullRequest, Map, UserPlus, CheckCircle2, AlertTriangle, LayoutGrid, List } from "lucide-react";
import type { ActivityItem, UserRole } from "@/data/mockData";

interface DashboardInfoTableProps {
  initialViewMode?: "list" | "cards";
  recentActivitySearch: string;
  onRecentActivitySearchChange: (value: string) => void;
  filteredActivities: ActivityItem[];
  roleLabels: Record<UserRole, string>;
  formatActivityDate: (value: string) => string;
}

const activityTypeStyles = {
  reservation: {
    icon: GitPullRequest,
    iconClassName: "text-status-proposed",
  },
  plan: {
    icon: Map,
    iconClassName: "text-status-available",
  },
  user: {
    icon: UserPlus,
    iconClassName: "text-status-pending",
  },
  approval: {
    icon: CheckCircle2,
    iconClassName: "text-status-approved",
  },
  conflict: {
    icon: AlertTriangle,
    iconClassName: "text-status-conflict",
  },
} as const;

export function DashboardInfoTable({
  initialViewMode = "list",
  recentActivitySearch,
  onRecentActivitySearchChange,
  filteredActivities,
  roleLabels,
  formatActivityDate,
}: DashboardInfoTableProps) {
  const [viewMode, setViewMode] = useState<"list" | "cards">(initialViewMode);
  const [isAnimating, setIsAnimating] = useState(true);
  const prevSearchRef = useRef(recentActivitySearch);
  const visibleActivities = filteredActivities.slice(0, 10);

  useEffect(() => {
    if (recentActivitySearch !== prevSearchRef.current) {
      setIsAnimating(true);
      prevSearchRef.current = recentActivitySearch;
    }
  }, [recentActivitySearch]);

  return (
    <section className="mb-5 flex h-full min-h-0 flex-col overflow-hidden rounded-[8.19px] border border-[#333333] shadow-[0_4px_7.525px_rgba(0,0,0,0.75)] ">
      <div className="flex flex-col gap-4 bg-[#0a0a0a] px-4 py-4 border-b border-[#333333]">
        <div className="flex items-center justify-between gap-[10.24px] ">
          <h2 className="text-[16px] font-bold leading-none text-[#dadada]">Recent activity</h2>

          <div className="flex items-center overflow-hidden rounded-[8.19px] border border-[#333333]">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-label="List view"
              className={viewMode === "list"
                ? "inline-flex h-[31px] w-[40px] items-center justify-center bg-[#8fee00] text-[#0a0a0a]"
                : "ui-hover-surface ui-interactive-base inline-flex h-[31px] w-[40px] items-center justify-center bg-[#141414] text-[#fafafa]"
              }
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              aria-label="Card view"
              className={viewMode === "cards"
                ? "inline-flex h-[31px] w-[40px] items-center justify-center bg-[#8fee00] text-[#0a0a0a]"
                : "ui-hover-surface ui-interactive-base inline-flex h-[31px] w-[40px] items-center justify-center bg-[#141414] text-[#fafafa]"
              }
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#141414] px-[25px] py-[10.24px] border-b border-[#333333]">
        <label className="flex items-center gap-[8.19px] text-[12.8px] font-extralight text-[#dadada]">
          <Search className="h-[10px] w-[10px]" />
          <input
            type="text"
            value={recentActivitySearch}
            onChange={(event) => onRecentActivitySearchChange(event.target.value)}
            placeholder="Buscar"
            aria-label="Search recent activity"
            className="w-full bg-transparent text-[12.8px] font-extralight text-[#dadada] outline-none placeholder:text-[#dadada]"
          />
        </label>
      </div>

      {viewMode === "list" ? (
        <div className="flex-1 overflow-y-auto bg-[#141414]">
          {visibleActivities.map((activity, index) => {
            const config = activityTypeStyles[activity.type];
            const Icon = config.icon;

            return (
              <div
                key={activity.id}
                className="group ui-row-hover grid grid-cols-[auto_1fr_auto] items-start gap-4 border-b border-[#2a2a2a] bg-[#141414] px-[25px] py-4 animate-table-row"
                style={isAnimating ? { animationDelay: `${index * 35}ms` } : undefined}
              >
                <div className="mt-0.5 flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[6px] border border-[#2a2a2a] bg-[#111111]">
                  <Icon className={`h-[18px] w-[18px] ${config.iconClassName}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="max-w-full whitespace-pre-line text-[12.8px] font-extralight leading-[1.3] text-[#dadada] transition-colors group-hover:text-[#fafafa]">
                    <span className="font-semibold text-[#fafafa]">{activity.user}</span>
                    {" "}
                    <span className="font-semibold text-[#8fee00]">({roleLabels[activity.role]})</span>
                    {" "}
                    <span>{activity.action}</span>
                    {" "}
                    <span className="font-semibold text-[#fafafa]">{activity.target}</span>
                  </p>
                </div>

                <span className="mt-0.5 rounded-[6px] border border-[#2a2a2a] bg-[#111111] px-2 py-1 text-[9.5px] font-semibold uppercase tracking-[0.8px] text-[#9a9a9a]">
                  {formatActivityDate(activity.date)}
                </span>
              </div>
            );
          })}

          {visibleActivities.length === 0 && (
            <div className="px-[25px] py-10 text-center text-[12.8px] font-extralight text-[#dadada]">
              No recent activity matches the search.
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto bg-[#141414] p-4">
          {visibleActivities.length === 0 ? (
            <div className="py-10 text-center text-[12.8px] font-extralight text-[#dadada]">
              No recent activity matches the search.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {visibleActivities.map((activity, index) => {
                const config = activityTypeStyles[activity.type];
                const Icon = config.icon;

                return (
                  <article
                    key={activity.id}
                    className="ui-hover-lift ui-theme-card flex min-h-[220px] flex-col rounded-[8.19px] border border-[#333333] p-4 animate-card"
                    style={isAnimating ? { animationDelay: `${index * 50}ms` } : undefined}
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-[#2a2a2a] pb-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <Icon className={`h-[18px] w-[18px] shrink-0 ${config.iconClassName}`} />
                        <div className="min-w-0">
                          <p className="truncate text-[12.8px] font-semibold text-[#fafafa]">{activity.user}</p>
                          <p className="truncate text-[10.24px] text-[#8fee00]">{roleLabels[activity.role]}</p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-[6px] border border-[#2f4310] bg-[#1b260b] px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.8px] text-[#8fee00]">
                        {activity.type}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2">
                      <p className="ui-cell-block rounded-[6.55px] px-2.5 py-2 text-[12.8px] font-light leading-[1.35] text-[#dadada]">{activity.action}</p>
                      <div className="ui-cell-block rounded-[6.55px] border border-[#2a2a2a] bg-[#111111] px-2.5 py-2 text-[12px] font-medium text-[#e5e5e5]">
                        {activity.target}
                      </div>
                    </div>

                    <div className="mt-auto pt-3 text-[10.24px] font-semibold uppercase tracking-[1.1px] text-[#9a9a9a]">
                      {formatActivityDate(activity.date)}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between bg-[#0a0a0a] px-[12.8px] py-[12.8px] border-t border-[#333333]">
        <span className="text-[14px] font-normal leading-[1.42] text-[#dadada]">
          {filteredActivities.length === 0 ? "0–0 de 0" : `1–${Math.min(10, filteredActivities.length)} de ${filteredActivities.length}`}
        </span>
      </div>
    </section>
  );
}
