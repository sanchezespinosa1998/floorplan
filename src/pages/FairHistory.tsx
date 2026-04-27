import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fairs,
  fairVersionStatusLabels,
  type FairVersion,
  type FairVersionStatus,
} from "@/data/mockData";
import { ActivityTimeline } from "@/components/shared/ActivityTimeline";
import { ListFilters } from "@/components/shared/ListFilters";
import { ArrowUpCircle, Copy, GitBranchPlus, History, PackageCheck, PackageX } from "lucide-react";
import { useProfile } from "@/context/ProfileContext";
import { usePagination } from "@/hooks/usePagination";

const versionStatusStyles: Record<FairVersionStatus, string> = {
  draft: "bg-amber-100 text-amber-700",
  published: "bg-emerald-100 text-emerald-700",
  commercial_draft: "bg-sky-100 text-sky-700",
};

const parseVersionLabel = (label: string) => {
  const match = label.match(/v(\d+)\.(\d+)/i);
  if (!match) return { major: 0, minor: 0 };
  return { major: Number(match[1]), minor: Number(match[2]) };
};

const getNextVersionLabel = (versions: FairVersion[]) => {
  const ordered = [...versions].sort((a, b) => {
    const first = parseVersionLabel(a.label);
    const second = parseVersionLabel(b.label);
    if (first.major !== second.major) return first.major - second.major;
    return first.minor - second.minor;
  });
  const last = ordered[ordered.length - 1];
  const lastParsed = parseVersionLabel(last.label);
  return `v${lastParsed.major}.${lastParsed.minor + 1}`;
};

export default function FairHistory() {
  const { fairId } = useParams();
  const { can } = useProfile();
  const fair = fairs.find((f) => f.id === fairId);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | FairVersionStatus>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredVersions = useMemo(() => {
    if (!fair) return [];
    const normalizedSearch = search.trim().toLowerCase();

    return fair.versions.filter((version) => {
      const matchesStatus = statusFilter === "all" || version.status === statusFilter;
      const versionDate = new Date(version.createdAt).getTime();
      const matchesFrom = !dateFrom || versionDate >= new Date(dateFrom).getTime();
      const matchesTo = !dateTo || versionDate <= new Date(dateTo).getTime();
      const matchesSearch =
        !normalizedSearch ||
        `${version.label} ${version.summary} ${version.createdBy}`.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesFrom && matchesTo && matchesSearch;
    });
  }, [fair, statusFilter, search, dateFrom, dateTo]);

  const { paginatedItems: paginatedVersions, PaginationComponent } = usePagination({ items: filteredVersions, itemsPerPage: 10 });

  if (!fair) {
    return <div className="text-center py-20 text-muted-foreground">Fair no encontrada</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Historial de versiones</h2>
          <p className="text-sm text-muted-foreground">
            {fair.name} {fair.edition}
          </p>
        </div>
        {can("view_fair_versions") && (
          <button className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors">
            <GitBranchPlus className="h-3.5 w-3.5" /> Nueva versión
          </button>
        )}
      </div>

      <ListFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by version, summary or author"
        searchAriaLabel="Search in history"
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        selects={[
          {
            label: 'Estado',
            value: statusFilter,
            onChange: (value) => setStatusFilter(value as "all" | FairVersionStatus),
            options: [
              { value: 'all', label: 'Todos los estados' },
              ...Object.entries(fairVersionStatusLabels).map(([value, label]) => ({ value, label })),
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setStatusFilter('all');
          setDateFrom('');
          setDateTo('');
        }}
      />

      {/* Versions List */}
      <div className="space-y-3">
        {paginatedVersions.map((version, index) => (
          <div
            key={version.id}
            className="bg-card rounded-lg border border-border p-4 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    version.status === "published"
                      ? "bg-emerald-100"
                      : version.status === "draft"
                      ? "bg-amber-100"
                      : version.status === "commercial_draft"
                      ? "bg-sky-100"
                      : "bg-slate-100"
                  }`}
                >
                  {version.status === "published" ? (
                    <PackageCheck className="h-5 w-5 text-emerald-600" />
                  ) : version.status === "draft" ? (
                    <PackageX className="h-5 w-5 text-amber-600" />
                  ) : version.status === "commercial_draft" ? (
                    <ArrowUpCircle className="h-5 w-5 text-sky-600" />
                  ) : (
                    <History className="h-5 w-5 text-slate-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{version.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${
                        versionStatusStyles[version.status]
                      }`}
                    >
                      {fairVersionStatusLabels[version.status]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{version.summary}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{version.createdBy}</span>
                    <span>
                      {new Date(version.createdAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {index > 0 && (
                  <button className="p-2 hover:bg-muted rounded-md transition-colors" title="View diff">
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
                {version.status === "draft" && (
                  <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors">
                    Publish
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-4 pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{version.occupancySnapshot}%</p>
                <p className="text-xs text-muted-foreground">Occupancy</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{version.standsSnapshot}</p>
                <p className="text-xs text-muted-foreground">Stands</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{version.pendingSnapshot}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Timeline */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h3 className="font-semibold text-foreground mb-4">Actividad reciente</h3>
        <ActivityTimeline activities={[]} maxItems={5} />
      </div>

      <PaginationComponent />
    </div>
  );
}
