import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { SendHorizonal } from "lucide-react";
import { motion } from "framer-motion";
import {
  bookings,
  requestBooking,
  subscribeToFairRealtime,
  stands,
  standStatusLabels,
} from "@/data/mockData";
import { useProfile } from "@/context/ProfileContext";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { toast } from "sonner";
import { usePagination } from "@/hooks/usePagination";
import { useTableSort } from "@/hooks/useTableSort";
import { useColumnFilters } from "@/hooks/useColumnFilters";
import { SortableHeader } from "@/components/shared/SortableHeader";
import { ColumnFilterButton } from "@/components/shared/ColumnFilterButton";
import { TableSearchBar } from "@/components/shared/TableSearchBar";

export default function FairStands() {
  const { fairId } = useParams();
  const [searchParams] = useSearchParams();
  const { activeUser, can, canAccessFair, availableFairs } = useProfile();
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [requestingStandId, setRequestingStandId] = useState<string | null>(null);
  const [tableSearch, setTableSearch] = useState("");

  const fair = availableFairs.find(item => item.id === fairId);
  const canRequestBooking = can("manage_bookings");

  const scopedStands = useMemo(() => {
    if (!fairId || !canAccessFair(fairId)) return [];
    return stands.filter(stand => stand.fairId === fairId);
  }, [fairId, canAccessFair, refreshSeed]);

  const activeRequestsByStand = useMemo(() => {
    const map = new Map<string, (typeof bookings)[number]>();
    bookings
      .filter(r => r.fairId === fairId)
      .forEach(booking => {
        if (booking.status !== 'pending') return;
        map.set(booking.standId, booking);
      });
    return map;
  }, [fairId, refreshSeed]);

  const filteredStands = useMemo(() => {
    const normalizedGlobalSearch = (searchParams.get("q") || "").trim().toLowerCase();
    const normalizedStandFilter = (searchParams.get("sfStand") || "").trim().toLowerCase();
    const statusFilter = searchParams.get("sfStatus") || "all";
    const zoneFilter = searchParams.get("sfZone") || "all";
    const typeFilter = searchParams.get("sfType") || "all";
    const hasRequestFilter = searchParams.get("sfRequest") || "all";
    const requestDateFrom = searchParams.get("sfFrom") || "";
    const requestDateTo = searchParams.get("sfTo") || "";

    return scopedStands.filter(stand => {
      const request = activeRequestsByStand.get(stand.id);
      const searchableContent = [stand.code, stand.zone, stand.type, stand.company || ""].join(" ").toLowerCase();

      const matchesGlobalSearch =
        !normalizedGlobalSearch || searchableContent.includes(normalizedGlobalSearch);

      const matchesStandFilter =
        !normalizedStandFilter || stand.code.toLowerCase().includes(normalizedStandFilter);

      const matchesStatus = statusFilter === "all" || stand.status === statusFilter;
      const matchesZone = zoneFilter === "all" || stand.zone === zoneFilter;
      const matchesType = typeFilter === "all" || stand.type === typeFilter;
      const matchesRequest =
        hasRequestFilter === "all" ||
        (hasRequestFilter === "with_request" && Boolean(request)) ||
        (hasRequestFilter === "without_request" && !request);

      const requestDate = request ? new Date(request.date).getTime() : null;
      const matchesFrom = !requestDateFrom || (requestDate !== null && requestDate >= new Date(requestDateFrom).getTime());
      const matchesTo = !requestDateTo || (requestDate !== null && requestDate <= new Date(requestDateTo).getTime());

      return matchesGlobalSearch && matchesStandFilter && matchesStatus && matchesZone && matchesType && matchesRequest && matchesFrom && matchesTo;
    });
  }, [scopedStands, activeRequestsByStand, searchParams]);

  useEffect(() => {
    if (!fairId) return;

    return subscribeToFairRealtime(fairId, () => {
      setRefreshSeed(value => value + 1);
    });
  }, [fairId]);

  const { filters, setFilter, clearFilter, applyFilters } = useColumnFilters<(typeof filteredStands)[number]>();
  const statusOptions= useMemo(() => [...new Set(filteredStands.map(s => s.status))].sort(), [filteredStands]);
  const ownerOptions = useMemo(() => {
    const owners = [...new Set(filteredStands.map(s => s.company || '').filter(c => c !== ''))];
    return owners.length ? owners.sort() : [];
  }, [filteredStands]);
  const tableSearchFiltered = !tableSearch.trim()
    ? filteredStands
    : filteredStands.filter(s => [s.code, s.zone, s.type, s.status, s.company || ''].join(' ').toLowerCase().includes(tableSearch.trim().toLowerCase()));
  const columnFiltered = applyFilters(tableSearchFiltered, {
    code:     s => s.code,
    area:     s => s.area,
    status:   s => s.status,
    owner:    s => s.company || '',
  });

  const { sortedItems: sortedStands, sortKey, sortDir, handleSort } = useTableSort(columnFiltered, (item, key) => {
    switch (key) {
      case 'code':     return item.code;
      case 'area':     return item.area;
      case 'status':   return item.status;
      case 'owner':   return item.company || '';
      default:       return null;
    }
  });

  const { paginatedItems: paginatedStands, PaginationComponent } = usePagination({ items: sortedStands, itemsPerPage: 10 });

  const handleRequestBooking = async (standId: string) => {
    setRequestingStandId(standId);

    try {
      const stand = scopedStands.find(item => item.id === standId);
      if (!stand) {
        toast.error("Selected stand not found.");
        return;
      }

      await requestBooking(standId, activeUser.id, {
        company: stand.company || `${activeUser.name} order`,
        comments: "Order ticket opened from the holdings list.",
        status: "requested",
        validators: [],
      });

      setRefreshSeed(value => value + 1);
      toast.success(`Order submitted for ${stand.code}. Review Trade orders to approve / reject.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not submit the order.";
      toast.error(message);
    } finally {
      setRequestingStandId(null);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/" },
          { label: "Portfolios", href: "/fairs" },
          { label: fair?.name || "Portfolio" },
          { label: "Holdings" },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-wrap items-start justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Holdings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredStands.length} positions in {fair?.name || "this portfolio"}
          </p>
        </div>
        <Link
          to={`/fairs/${fairId}/bookings`}
          className="px-3 py-2 rounded-md border border-border text-sm hover:bg-muted/60 transition-colors"
        >
          Open trade orders
        </Link>
      </motion.div>

      <div className="hidden md:block bg-card border border-border overflow-hidden">
        <TableSearchBar value={tableSearch} onChange={setTableSearch} resultCount={sortedStands.length} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {[
                { label: 'Ticker',         key: 'code',   mode: 'text' as const, opts: undefined,            lbls: undefined },
                { label: 'Exposure (M€)',  key: 'area',   mode: null,            opts: undefined,            lbls: undefined },
                { label: 'Status',         key: 'status', mode: 'enum' as const, opts: statusOptions,        lbls: standStatusLabels as Record<string,string> },
                { label: 'Issuer',         key: 'owner',  mode: 'enum' as const, opts: ownerOptions,         lbls: undefined },
              ].map(col => (
                <SortableHeader
                  key={col.key}
                  label={col.label}
                  sortKey={col.key}
                  currentSortKey={sortKey}
                  currentSortDir={sortDir}
                  onSort={handleSort}
                  className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
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
              <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedStands.map((stand, index) => {
              const canRequest =
                canRequestBooking &&
                stand.status === "available";

              return (
                <motion.tr
                  key={stand.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + index * 0.03 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-3 py-3 font-medium text-foreground">{stand.code}</td>
                  <td className="px-3 py-3 text-muted-foreground">€{stand.area.toLocaleString("en-GB")} M</td>
                  <td className="px-3 py-3 text-muted-foreground"><StatusBadge status={stand.status} type="stand" /></td>
                  <td className="px-3 py-3 text-muted-foreground">{stand.company || '—'}</td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => handleRequestBooking(stand.id)}
                      disabled={!canRequest || requestingStandId === stand.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <SendHorizonal className="h-3.5 w-3.5" />
                      {requestingStandId === stand.id ? "Submitting…" : "Open order"}
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* Cards - Mobile */}
      <div className="md:hidden space-y-3">
        <TableSearchBar value={tableSearch} onChange={setTableSearch} resultCount={sortedStands.length} />
        {paginatedStands.length > 0 ? (
          paginatedStands.map((stand, index) => {
            const canRequest = canRequestBooking && stand.status === "available";
            return (
              <motion.div
                key={stand.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-card border border-border rounded-md p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground truncate">{stand.code}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stand.zone} · {stand.type}</p>
                  </div>
                  <StatusBadge status={stand.status} type="stand" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground uppercase tracking-wide text-[10px]">Exposure</p>
                    <p className="text-foreground font-medium">€{stand.area.toLocaleString("en-GB")} M</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground uppercase tracking-wide text-[10px]">Issuer</p>
                    <p className="text-foreground font-medium truncate">{stand.company || '—'}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRequestBooking(stand.id)}
                  disabled={!canRequest || requestingStandId === stand.id}
                  className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] px-3 text-sm rounded border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SendHorizonal className="h-4 w-4" />
                  {requestingStandId === stand.id ? "Submitting…" : "Open order"}
                </button>
              </motion.div>
            );
          })
        ) : null}
      </div>

      {filteredStands.length === 0 && (
        <div className="p-8 text-center text-muted-foreground text-sm bg-card border border-border">
          No holdings match the current filters.
        </div>
      )}

      <PaginationComponent />
    </div>
  );
}
