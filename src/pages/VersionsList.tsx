import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, History, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ListFilters } from "@/components/shared/ListFilters";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SortableHeader } from "@/components/shared/SortableHeader";
import { ColumnFilterButton } from "@/components/shared/ColumnFilterButton";
import { useColumnFilters } from "@/hooks/useColumnFilters";
import type { SortDir } from "@/hooks/useTableSort";
import { TableSearchBar } from "@/components/shared/TableSearchBar";
import {
  fairVersionStatusLabels,
  getFairVersions,
  fairs,
  venues,
  type FairVersionStatus,
} from "@/data/mockData";
import { useProfile } from "@/context/ProfileContext";

export default function VersionsList() {
  const { can } = useProfile();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FairVersionStatus | 'all'>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [tableSearch, setTableSearch] = useState("");
  const { filters, setFilter, clearFilter, applyFilters } = useColumnFilters<ReturnType<typeof getFairVersions>[number]>();

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  type FairVersionItem = ReturnType<typeof getFairVersions>[number];

  const processVersions = (versions: FairVersionItem[]): FairVersionItem[] => {
    // 0. Apply table search
    const searched = !tableSearch.trim() ? versions : versions.filter(v =>
      [v.label, v.createdBy, v.summary].join(' ').toLowerCase().includes(tableSearch.trim().toLowerCase())
    );
    // 1. Apply column filters
    const filterResolvers = {
      label:     (v: FairVersionItem) => v.label,
      status:    (v: FairVersionItem) => v.status,
      createdBy: (v: FairVersionItem) => v.createdBy,
      summary:   (v: FairVersionItem) => v.summary,
    };
    const filtered = applyFilters(searched, filterResolvers);

    // 2. Apply sort
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      let aVal: string | number | null = null;
      let bVal: string | number | null = null;
      switch (sortKey) {
        case 'label':     aVal = a.label;                         bVal = b.label;     break;
        case 'status':    aVal = a.status;                        bVal = b.status;    break;
        case 'createdAt': aVal = new Date(a.createdAt).getTime(); bVal = new Date(b.createdAt).getTime(); break;
        case 'createdBy': aVal = a.createdBy;                     bVal = b.createdBy; break;
        case 'summary':   aVal = a.summary;                       bVal = b.summary;   break;
      }
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const result = typeof aVal === 'number' && typeof bVal === 'number'
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal), 'es', { numeric: true });
      return sortDir === 'asc' ? result : -result;
    });
  };

  const groupedFairs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return [...fairs]
      .sort((first, second) => first.name.localeCompare(second.name, "es"))
      .map(fair => {
        const allVersions = getFairVersions(fair.id)
          .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
        const versions = allVersions.filter(version => {
          const versionDate = new Date(version.createdAt).getTime();
          const matchesStatus = statusFilter === 'all' || version.status === statusFilter;
          const matchesFrom = !dateFrom || versionDate >= new Date(dateFrom).getTime();
          const matchesTo = !dateTo || versionDate <= new Date(dateTo).getTime();
          return matchesStatus && matchesFrom && matchesTo;
        });

        const currentVersion = versions.find(v => v.status === 'publicada');
        const venue = venues.find(v => v.id === fair.venueId);

        return {
          fair,
          venue,
          versions,
          currentVersion,
        };
      })
      .filter(({ fair, versions, venue, currentVersion }) => {
        if (!normalizedSearch) return versions.length > 0;

        const haystack = [
          fair.name,
          fair.edition,
          venue?.name || "",
          currentVersion?.label || "",
          ...versions.map(version => `${version.label} ${version.summary} ${version.createdBy}`),
        ]
          .join(" ")
          .toLowerCase();

        return versions.length > 0 && haystack.includes(normalizedSearch);
      });
  }, [search, statusFilter, dateFrom, dateTo]);

  const totalVersions = groupedFairs.reduce((acc, item) => acc + item.versions.length, 0);
  const publishedVersions = groupedFairs.reduce(
    (acc, item) => acc + item.versions.filter(version => version.status === "publicada").length,
    0
  );
  const draftVersions = groupedFairs.reduce(
    (acc, item) => acc + item.versions.filter(version => version.status === "borrador").length,
    0
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/" }, { label: "Versiones" }]} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Management de versiones</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalVersions} versiones repartidas en {groupedFairs.length} ferias, ordenadas por feria.
          </p>
        </div>

        <ListFilters
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar feria, versión o responsable"
          searchAriaLabel="Buscar versiones"
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          selects={[
            {
              label: 'Estado de versión',
              value: statusFilter,
              onChange: (value) => setStatusFilter(value as FairVersionStatus | 'all'),
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
          className="w-full max-w-4xl"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Fairs con versiones</p>
          <p className="text-2xl font-bold text-foreground mt-1">{groupedFairs.length}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Versiones totales</p>
          <p className="text-2xl font-bold text-foreground mt-1">{totalVersions}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Publicadas</p>
          <p className="text-2xl font-bold text-foreground mt-1">{publishedVersions}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Borradores</p>
          <p className="text-2xl font-bold text-foreground mt-1">{draftVersions}</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <TableSearchBar
          value={tableSearch}
          onChange={setTableSearch}
          placeholder="Buscar en versiones..."
        />
      </div>

      <div className="space-y-4">
        {groupedFairs.map(({ fair, venue, versions, currentVersion }) => (
          <section key={fair.id} className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-semibold text-foreground text-sm">{fair.name} {fair.edition}</h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  {venue?.name || "Sin recinto"} · {versions.length} versiones
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded bg-primary/10 text-primary">
                  Activa: {currentVersion?.label || "—"}
                </span>
                <Link
                  to={`/fairs/${fair.id}/versions`}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium border border-border hover:bg-muted transition-colors"
                >
                  {can("manage_versions") ? "Gestionar versiones" : "Ver versiones"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {[
                      { label: 'Versión', key: 'label',     mode: 'text' as const, opts: undefined,                                     lbls: undefined },
                      { label: 'Estado',  key: 'status',    mode: 'enum' as const, opts: Object.keys(fairVersionStatusLabels),           lbls: fairVersionStatusLabels as Record<string,string> },
                      { label: 'Fecha',   key: 'createdAt', mode: null,            opts: undefined,                                     lbls: undefined },
                      { label: 'Autor',   key: 'createdBy', mode: 'text' as const, opts: undefined,                                     lbls: undefined },
                      { label: 'Resumen', key: 'summary',   mode: 'text' as const, opts: undefined,                                     lbls: undefined },
                    ].map(col => (
                      <SortableHeader
                        key={col.key}
                        label={col.label}
                        sortKey={col.key}
                        currentSortKey={sortKey}
                        currentSortDir={sortDir}
                        onSort={handleSort}
                        className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                        filterPopover={col.mode ? (
                          <ColumnFilterButton
                            columnKey={col.key}
                            mode={col.mode}
                            enumOptions={col.opts}
                            optionLabels={col.lbls}
                            currentFilter={filters[col.key]}
                            onFilter={setFilter}
                            onClear={clearFilter}
                          />
                        ) : undefined}
                      />
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {processVersions(versions).map(version => (
                    <tr key={version.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <History className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{version.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={version.status} type="version" />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(version.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{version.createdBy}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{version.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      {groupedFairs.length === 0 && (
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <History className="h-8 w-8 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-semibold text-foreground mt-3">Sin versiones</h2>
          <p className="text-sm text-muted-foreground mt-1">
            No hay versiones de ferias para mostrar con los filtros actuales.
          </p>
        </div>
      )}
    </div>
  );
}
