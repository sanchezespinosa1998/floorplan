import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { SendHorizonal } from "lucide-react";
import { motion } from "framer-motion";
import {
  reservations,
  reservationStatusLabels,
  requestReservation,
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
  const canRequestReservation = can("manage_reservations");

  const scopedStands = useMemo(() => {
    if (!fairId || !canAccessFair(fairId)) return [];
    return stands.filter(stand => stand.fairId === fairId);
  }, [fairId, canAccessFair, refreshSeed]);

  const activeRequestsByStand = useMemo(() => {
    const map = new Map<string, (typeof reservations)[number]>();
    reservations
      .filter(r => r.fairId === fairId)
      .forEach(reservation => {
        if (!["solicitud", "pendiente", "en_revision"].includes(reservation.status)) return;
        map.set(reservation.standId, reservation);
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

  const { filters, setFilter, clearFilter, applyFilters } = useColumnFilters<(typeof filteredStands)[number]>();
  const zoneOptions  = useMemo(() => [...new Set(filteredStands.map(s => s.zone))].sort(),   [filteredStands]);
  const typeOptions  = useMemo(() => [...new Set(filteredStands.map(s => s.type))].sort(),   [filteredStands]);
  const statusOptions= useMemo(() => [...new Set(filteredStands.map(s => s.status))].sort(), [filteredStands]);
  const tableSearchFiltered = !tableSearch.trim()
    ? filteredStands
    : filteredStands.filter(s => [s.code, s.zone, s.type, s.status, s.company || ''].join(' ').toLowerCase().includes(tableSearch.trim().toLowerCase()));
  const columnFiltered = applyFilters(tableSearchFiltered, {
    code:     s => s.code,
    zone:     s => s.zone,
    type:     s => s.type,
    status:   s => s.status,
    solicitud:s => activeRequestsByStand.has(s.id) ? 'Con solicitud' : 'Sin solicitud',
  });

  const { sortedItems: sortedStands, sortKey, sortDir, handleSort } = useTableSort(columnFiltered, (item, key) => {
    switch (key) {
      case 'code':     return item.code;
      case 'zone':     return item.zone;
      case 'type':     return item.type;
      case 'area':     return item.area;
      case 'status':   return item.status;
      case 'solicitud':return activeRequestsByStand.has(item.id) ? 1 : 0;
      default:         return null;
    }
  });

  const { paginatedItems: paginatedStands, PaginationComponent } = usePagination({ items: sortedStands, itemsPerPage: 10 });

  const handleRequestReservation = async (standId: string) => {
    setRequestingStandId(standId);

    try {
      const stand = scopedStands.find(item => item.id === standId);
      if (!stand) {
        toast.error("No se encontró el stand seleccionado.");
        return;
      }

      await requestReservation(standId, activeUser.id, {
        company: stand.company || `${activeUser.name} - Solicitud`,
        comments: "Solicitud creada desde la pestaña de stands.",
        status: "solicitud",
        validators: [],
      });

      setRefreshSeed(value => value + 1);
      toast.success(`Solicitud enviada para ${stand.code}. Revisa Reservations para aprobar/rechazar.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo crear la solicitud.";
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
          { label: "Fairs", href: "/fairs" },
          { label: fair?.name || "Fair" },
          { label: "Stands" },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-wrap items-start justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stands de la feria</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredStands.length} stands mostrados en {fair?.name || "la feria"}
          </p>
        </div>
        <Link
          to={`/fairs/${fairId}/reservations`}
          className="px-3 py-2 rounded-md border border-border text-sm hover:bg-muted/60 transition-colors"
        >
          Ir a Reservations
        </Link>
      </motion.div>

      <div className="hidden md:block bg-card border border-border overflow-hidden">
        <TableSearchBar value={tableSearch} onChange={setTableSearch} resultCount={sortedStands.length} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[960px]">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {[
                { label: 'Stand',            key: 'code',     mode: 'text' as const, opts: undefined,                                  lbls: undefined },
                { label: 'Zona',             key: 'zone',     mode: 'enum' as const, opts: zoneOptions,                                lbls: undefined },
                { label: 'Tipo',             key: 'type',     mode: 'enum' as const, opts: typeOptions,                                lbls: undefined },
                { label: 'Area',             key: 'area',     mode: null,            opts: undefined,                                  lbls: undefined },
                { label: 'Estado del stand', key: 'status',   mode: 'enum' as const, opts: statusOptions,                             lbls: standStatusLabels as Record<string,string> },
                { label: 'Solicitud activa', key: 'solicitud',mode: 'enum' as const, opts: ['Con solicitud', 'Sin solicitud'],         lbls: undefined },
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
              <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Accion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedStands.map((stand, index) => {
              const activeRequest = activeRequestsByStand.get(stand.id);
              const canRequest =
                canRequestReservation &&
                stand.status === "available" &&
                !activeRequest;

              return (
                <motion.tr
                  key={stand.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + index * 0.03 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-3 py-3 font-medium text-foreground">{stand.code}</td>
                  <td className="px-3 py-3 text-muted-foreground">{stand.zone}</td>
                  <td className="px-3 py-3 text-foreground">{stand.type}</td>
                  <td className="px-3 py-3 text-muted-foreground">{stand.area} m2</td>
                  <td className="px-3 py-3 text-muted-foreground">{standStatusLabels[stand.status]}</td>
                  <td className="px-3 py-3">
                    {activeRequest ? (
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={activeRequest.status} type="reservation" />
                        <span className="text-xs text-muted-foreground">
                          {reservationStatusLabels[activeRequest.status]} · {activeRequest.company}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sin solicitud activa</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => handleRequestReservation(stand.id)}
                      disabled={!canRequest || requestingStandId === stand.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <SendHorizonal className="h-3.5 w-3.5" />
                      {requestingStandId === stand.id ? "Enviando..." : "Solicitar"}
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {filteredStands.length === 0 && (
        <div className="p-8 text-center text-muted-foreground text-sm bg-card border border-border">
          No hay stands que coincidan con los filtros.
        </div>
      )}

      <PaginationComponent />
    </div>
  );
}
