import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, List, Plus, CalendarDays, MapPin, FolderKanban, Edit } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ListFilters } from "@/components/shared/ListFilters";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { FairFormWizard } from "@/components/layout/FairFormWizard";
import { useProfile } from "@/context/ProfileContext";
import { fairStatusLabels, type Fair, type FairStatus } from "@/data/mockData";
import { usePagination } from "@/hooks/usePagination";
import { useTableSort } from "@/hooks/useTableSort";
import { useColumnFilters } from "@/hooks/useColumnFilters";
import { SortableHeader } from "@/components/shared/SortableHeader";
import { ColumnFilterButton } from "@/components/shared/ColumnFilterButton";
import { TableSearchBar } from "@/components/shared/TableSearchBar";

export default function FairsList() {
  const { availableFairs, isRole } = useProfile();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FairStatus | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFair, setEditingFair] = useState<Fair | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [tableSearch, setTableSearch] = useState("");

  const filtered = availableFairs.filter(f => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      f.name.toLowerCase().includes(normalizedSearch) ||
      f.venueName.toLowerCase().includes(normalizedSearch);
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    const fairStartDate = new Date(f.startDate).getTime();
    const matchesFrom = !dateFrom || fairStartDate >= new Date(dateFrom).getTime();
    const matchesTo = !dateTo || fairStartDate <= new Date(dateTo).getTime();

    return matchesSearch && matchesStatus && matchesFrom && matchesTo;
  });

  const { filters, setFilter, clearFilter, applyFilters } = useColumnFilters<(typeof filtered)[number]>();
  const venueOptions = useMemo(() => [...new Set(filtered.map(f => f.venueName))].sort(), [filtered]);
  const tableSearchFiltered = useMemo(() => {
    if (!tableSearch.trim()) return filtered;
    const q = tableSearch.trim().toLowerCase();
    return filtered.filter(f =>
      [f.name, String(f.edition), f.venueName, f.status].join(' ').toLowerCase().includes(q)
    );
  }, [filtered, tableSearch]);
  const columnFiltered = applyFilters(tableSearchFiltered, {
    name:     f => f.name,
    edition:  f => String(f.edition),
    venueName:f => f.venueName,
    status:   f => f.status,
  });

  const { sortedItems: sortedFairs, sortKey, sortDir, handleSort } = useTableSort(columnFiltered, (item, key) => {
    switch (key) {
      case 'name':         return item.name;
      case 'edition':      return String(item.edition);
      case 'venueName':    return item.venueName;
      case 'startDate':    return new Date(item.startDate).getTime();
      case 'status':       return item.status;
      case 'projectCount': return (item as any).projectCount ?? 0;
      default:             return null;
    }
  });

  const { paginatedItems: paginatedFairs, PaginationComponent } = usePagination({ items: sortedFairs, itemsPerPage: 9 });

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/" }, { label: "Fairs" }]} />

      <div className="flex items-center justify-between border-b border-border pb-[16px]">
        <div className="flex items-start gap-6 flex-1">
          <div>
            <h1 className="text-[31.25px] font-bold text-foreground font-display tracking-tight">Fairs</h1>
            <p className="mt-[5.24px] text-[12.8px] text-muted-foreground" key={refreshKey}>{availableFairs.length} fairs visible</p>
          </div>
        </div>
        {!isRole('organizer') && (
          <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            New fair
          </Button>
        )}

        <FairFormWizard 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingFair(null);
          }}
          onSuccess={() => setRefreshKey(k => k + 1)}
          fair={editingFair}
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <ListFilters
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar ferias o recintos"
          searchAriaLabel="Buscar ferias"
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          selects={[
            {
              label: 'Estado',
              value: statusFilter,
              onChange: (value) => setStatusFilter(value as FairStatus | 'all'),
              options: [
                { value: 'all', label: 'Todos los estados' },
                ...Object.entries(fairStatusLabels).map(([value, label]) => ({ value, label })),
              ],
            },
          ]}
          onReset={() => {
            setSearch('');
            setStatusFilter('all');
            setDateFrom('');
            setDateTo('');
          }}
          className="flex-1"
        />
        <div className="flex items-center overflow-hidden border border-border bg-card">
          <button 
            onClick={() => setView('grid')} 
            aria-label="Grid view"
            className={`flex h-[39.06px] w-[39.06px] items-center justify-center border-r border-border transition-colors ${view === 'grid' ? 'bg-primary-surface text-primary' : 'bg-card text-muted-foreground hover:text-foreground'}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setView('list')} 
            aria-label="List view"
            className={`flex h-[39.06px] w-[39.06px] items-center justify-center transition-colors ${view === 'list' ? 'bg-primary-surface text-primary' : 'bg-card text-muted-foreground hover:text-foreground'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-4 flex h-[48.83px] w-[48.83px] items-center justify-center border-[1.72px] border-border bg-card">
            <FolderKanban className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-[20px] font-bold text-foreground">
            {search ? 'No fairs found' : 'No fairs yet'}
          </h3>
          <p className="mb-6 max-w-sm text-[12.8px] text-muted-foreground">
            {search 
              ? `No fairs match "${search}". Try adjusting your search terms.`
              : 'Get started by creating your first fair to organize your events and projects.'}
          </p>
          {!search && !isRole('organizer') && (
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create your first fair
            </Button>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginatedFairs.map((f) => (
            <div key={f.id} className="relative group">
              <Link to={`/fairs/${f.id}`} className="block border-[1.72px] border-border bg-card p-[25px] transition-colors hover:border-primary">
                <div className="mb-[16px] flex items-start justify-between gap-3">
                  <div className="flex h-[39.06px] w-[39.06px] items-center justify-center border border-border bg-card">
                    <CalendarDays className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={f.status} type="fair" />
                    {!isRole('organizer') && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setEditingFair(f);
                          setIsDialogOpen(true);
                        }}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors"
                        aria-label={`Edit ${f.name}`}
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="font-bold text-[16px] text-foreground group-hover:text-primary transition-colors font-display">{f.name}</h3>
                <p className="mt-[6.55px] flex items-center gap-[6.55px] text-[12.8px] text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {f.venueName}
                </p>
                <p className="mt-[5.24px] text-[12.8px] text-muted-foreground">Edition {f.edition}</p>
                <div className="mt-[16px] flex items-center gap-4 text-[12.8px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    {`${new Date(f.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} – ${new Date(f.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  </span>
                </div>
                <div className="mt-[16px] flex items-center gap-[6.55px] border-t border-border pt-[12.8px]">
                  <FolderKanban className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[12.8px] text-muted-foreground">{(f as any).projectCount || 0} project{((f as any).projectCount || 0) !== 1 ? 's' : ''} associated</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden border-[1.72px] border-border bg-card">
          <TableSearchBar value={tableSearch} onChange={setTableSearch} resultCount={sortedFairs.length} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-secondary">
                {[
                  { label: 'Name',       key: 'name',         mode: 'text'  as const, opts: undefined,      lbls: undefined },
                  { label: 'Edition',    key: 'edition',      mode: 'text'  as const, opts: undefined,      lbls: undefined },
                  { label: 'Venue',      key: 'venueName',    mode: 'enum'  as const, opts: venueOptions,   lbls: undefined },
                  { label: 'Start date', key: 'startDate',    mode: null,             opts: undefined,      lbls: undefined },
                  { label: 'Status',     key: 'status',       mode: 'enum'  as const, opts: Object.keys(fairStatusLabels), lbls: fairStatusLabels as Record<string,string> },
                  { label: 'Projects',   key: 'projectCount', mode: null,             opts: undefined,      lbls: undefined },
                ].map(col => (
                  <SortableHeader
                    key={col.key}
                    label={col.label}
                    sortKey={col.key}
                    currentSortKey={sortKey}
                    currentSortDir={sortDir}
                    onSort={handleSort}
                    className="px-[25px] py-[16px] text-left text-[12.8px] font-bold uppercase tracking-[1.37px] text-muted-foreground"
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
                <th className="px-[25px] py-[16px] text-left text-[12.8px] font-bold uppercase tracking-[1.37px] text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedFairs.map((f) => (
                <tr key={f.id} className="transition-colors hover:bg-secondary">
                  <td className="px-[25px] py-[16px]">
                    <Link to={`/fairs/${f.id}`} className="font-semibold text-foreground hover:text-primary transition-colors">{f.name}</Link>
                  </td>
                  <td className="px-[25px] py-[16px] text-[12.8px] text-muted-foreground">Edition {f.edition}</td>
                  <td className="px-[25px] py-[16px] text-[12.8px] text-muted-foreground">{f.venueName}</td>
                  <td className="px-[25px] py-[16px] text-[12.8px] text-muted-foreground">{new Date(f.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-[25px] py-[16px]"><StatusBadge status={f.status} type="fair" /></td>
                  <td className="px-[25px] py-[16px] text-[12.8px] text-muted-foreground">{(f as any).projectCount || 0}</td>
                  <td className="px-[25px] py-[16px]">
                    {!isRole('organizer') && (
                      <button
                        onClick={() => {
                          setEditingFair(f);
                          setIsDialogOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <PaginationComponent />
    </div>
  );
}
