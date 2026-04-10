import { useMemo, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Check, X } from "lucide-react";
import { reservations, reservationStatusLabels, setReservationStatus, type ReservationStatus } from "@/data/mockData";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useProfile } from "@/context/ProfileContext";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { usePagination } from "@/hooks/usePagination";
import { useTableSort } from "@/hooks/useTableSort";
import { useColumnFilters } from "@/hooks/useColumnFilters";
import { SortableHeader } from "@/components/shared/SortableHeader";
import { ColumnFilterButton } from "@/components/shared/ColumnFilterButton";
import { TableSearchBar } from "@/components/shared/TableSearchBar";

type ReservationItem = (typeof reservations)[number];

interface StandInterestGroup {
  key: string;
  standCode: string;
  reservations: ReservationItem[];
  interestedPeople: string[];
  validators: string[];
  latestRequestDate: string;
}

function StandInterestCard({
  group,
  can,
  updateReservationStatus,
}: {
  group: StandInterestGroup;
  can: (permission: string) => boolean;
  updateReservationStatus: (id: string, status: ReservationStatus, code: string) => void;
}) {
  return (
    <div className="bg-card border border-border overflow-hidden">
      <div className="w-full p-4 flex items-center justify-between text-left bg-muted/20">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-foreground">{group.standCode}</span>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {group.interestedPeople.length} interesado(s): {group.interestedPeople.join(", ")}
          </p>
        </div>
      </div>

      <div className="border-t border-border p-4 space-y-3">
        {group.reservations.map((reservation) => {
          const canReview = ['pendiente', 'solicitud', 'en_revision'].includes(reservation.status);
          return (
            <div key={reservation.id} className="border border-border rounded-md p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-sm font-medium text-foreground">{reservation.company} · {reservation.requester}</p>
                <StatusBadge status={reservation.status} type="reservation" />
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Fecha: {new Date(reservation.date).toLocaleDateString('es-ES')} · Validadores: {reservation.validators.join(', ') || '—'}
              </p>
              <div className="flex items-center gap-2">
                {can('approve_reservations') && canReview && (
                  <button
                    aria-label={`Approve reservation for stand ${reservation.standCode} from ${reservation.company}`}
                    onClick={() => updateReservationStatus(reservation.id, 'aprobada', reservation.standCode)}
                    className="flex items-center gap-1 min-h-[36px] px-3 py-1.5 text-xs rounded border border-border hover:bg-muted transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                )}
                {can('approve_reservations') && canReview && (
                  <button
                    aria-label={`Reject reservation for stand ${reservation.standCode} from ${reservation.company}`}
                    onClick={() => updateReservationStatus(reservation.id, 'rechazada', reservation.standCode)}
                    className="flex items-center gap-1 min-h-[36px] px-3 py-1.5 text-xs rounded border border-status-conflict text-status-conflict hover:bg-status-conflict/10 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ReservationsList() {
  const { fairId } = useParams();
  const [searchParams] = useSearchParams();
  const { can, availableFairs, canAccessFair } = useProfile();
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [tableSearch, setTableSearch] = useState("");
  const fair = availableFairs.find(item => item.id === fairId);

  const scopedReservations = canAccessFair(fairId || "")
    ? reservations.filter(r => r.fairId === fairId)
    : [];

  const updateReservationStatus = (reservationId: string, status: ReservationStatus, standCode: string) => {
    const updated = setReservationStatus(reservationId, status);
    if (!updated) {
      toast.error(`No se pudo actualizar la reserva ${standCode}.`);
      return;
    }

    setRefreshSeed(seed => seed + 1);
    toast.success(`Reserva ${standCode}: estado actualizado a ${reservationStatusLabels[status]}.`);
  };

  const groupedByStand = useMemo(() => {
    const globalQuery = (searchParams.get("q") || "").trim().toLowerCase();
    const normalizedStand = (searchParams.get("rfStand") || "").trim().toLowerCase();
    const normalizedInterested = (searchParams.get("rfInterested") || "").trim().toLowerCase();
    const normalizedValidator = (searchParams.get("rfValidator") || "").trim().toLowerCase();
    const statusFilter = (searchParams.get("rfStatus") || "all") as ReservationStatus | 'all';
    const dateFrom = searchParams.get("rfFrom") || "";
    const dateTo = searchParams.get("rfTo") || "";
    const groupsMap = new Map<string, StandInterestGroup>();

    scopedReservations.forEach((reservation) => {
      const key = reservation.standId || reservation.standCode;
      const current = groupsMap.get(key);

      if (!current) {
        groupsMap.set(key, {
          key,
          standCode: reservation.standCode,
          reservations: [reservation],
          interestedPeople: [],
          validators: [],
          latestRequestDate: reservation.date,
        });
        return;
      }

      current.reservations.push(reservation);
      if (new Date(reservation.date).getTime() > new Date(current.latestRequestDate).getTime()) {
        current.latestRequestDate = reservation.date;
      }
    });

    return Array.from(groupsMap.values())
      .map((group) => {
        const interestedPeople = Array.from(new Set(group.reservations.map(r => `${r.company} (${r.requester})`)));
        const validators = Array.from(new Set(group.reservations.flatMap(r => r.validators))).filter(Boolean);

        return {
          ...group,
          interestedPeople,
          validators,
        };
      })
      .filter((group) => {
        const searchableContent = [
          group.standCode,
          group.interestedPeople.join(' '),
          group.validators.join(' '),
          group.reservations.map(r => `${r.status} ${r.company} ${r.requester}`).join(' '),
        ].join(' ').toLowerCase();

        const matchGlobal = !globalQuery || searchableContent.includes(globalQuery);
        const matchStand = !normalizedStand || group.standCode.toLowerCase().includes(normalizedStand);
        const matchInterested =
          !normalizedInterested || group.interestedPeople.some(person => person.toLowerCase().includes(normalizedInterested));
        const matchValidators =
          !normalizedValidator || group.validators.some(validator => validator.toLowerCase().includes(normalizedValidator));
        const matchStatus = statusFilter === 'all' || group.reservations.some(r => r.status === statusFilter);
        const matchFrom = !dateFrom || group.reservations.some(r => new Date(r.date).getTime() >= new Date(dateFrom).getTime());
        const matchTo = !dateTo || group.reservations.some(r => new Date(r.date).getTime() <= new Date(dateTo).getTime());
        return matchGlobal && matchStand && matchInterested && matchValidators && matchStatus && matchFrom && matchTo;
      });
  }, [scopedReservations, searchParams, refreshSeed]);

  const { filters, setFilter, clearFilter, applyFilters } = useColumnFilters<(typeof groupedByStand)[number]>();
  const tableSearchFiltered = useMemo(() => {
    if (!tableSearch.trim()) return groupedByStand;
    const q = tableSearch.trim().toLowerCase();
    return groupedByStand.filter(g =>
      [g.standCode, g.interestedPeople.join(' '), g.validators.join(' ')].join(' ').toLowerCase().includes(q)
    );
  }, [groupedByStand, tableSearch]);
  const columnFiltered = applyFilters(tableSearchFiltered, {
    standCode:  g => g.standCode,
    interested: g => g.interestedPeople.join(' '),
    validators: g => g.validators.join(' '),
  });

  const { sortedItems: sortedGrouped, sortKey, sortDir, handleSort } = useTableSort(columnFiltered, (item, key) => {
    switch (key) {
      case 'standCode':         return item.standCode;
      case 'interested':        return item.interestedPeople.length;
      case 'latestRequestDate': return new Date(item.latestRequestDate).getTime();
      case 'validators':        return item.validators.length;
      default:                  return null;
    }
  });

  const { paginatedItems: paginatedGrouped, PaginationComponent } = usePagination({ items: sortedGrouped, itemsPerPage: 10 });

  return (
    <div className="space-y-4 animate-fade-in">
      <Breadcrumbs
        items={[{ label: "Dashboard", href: "/" }, { label: "Fairs", href: "/fairs" }, { label: fair?.name || 'Fair' }, { label: "Reservations" }]}
      />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start gap-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Fair reservations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {`${paginatedGrouped.length} stands con solicitudes en ${fair?.name || 'the fair'}`}
          </p>
        </div>
      </motion.div>

      {/* Table - Desktop / Cards - Mobile */}
      <div className="hidden md:block bg-card border border-border overflow-hidden">
        <TableSearchBar value={tableSearch} onChange={setTableSearch} resultCount={sortedGrouped.length} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-border bg-muted/50">
                {[
                  { label: 'Stand',            key: 'standCode',          mode: 'text' as const },
                  { label: 'Interesados',       key: 'interested',         mode: 'text' as const },
                  { label: 'Ultima solicitud',  key: 'latestRequestDate',  mode: null            },
                  { label: 'Validators',        key: 'validators',         mode: 'text' as const },
                ].map(col => (
                  <SortableHeader
                    key={col.key}
                    label={col.label}
                    sortKey={col.key}
                    currentSortKey={sortKey}
                    currentSortDir={sortDir}
                    onSort={handleSort}
                    className="text-left px-2 md:px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                    filterPopover={col.mode ? (
                      <ColumnFilterButton
                        columnKey={col.key}
                        mode={col.mode}
                        currentFilter={filters[col.key]}
                        onFilter={setFilter}
                        onClear={clearFilter}
                      />
                    ) : undefined}
                  />
                ))}
                <th className="text-left px-2 md:px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedGrouped.map((group, index) => {
              return (
                <motion.tr
                  key={group.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + index * 0.03 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-2 md:px-4 py-3 font-medium text-foreground">{group.standCode}</td>
                  <td className="px-2 md:px-4 py-3 text-xs text-muted-foreground">{group.interestedPeople.join(', ')}</td>
                  <td className="px-2 md:px-4 py-3 text-muted-foreground">
                    {new Date(group.latestRequestDate).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-2 md:px-4 py-3 text-xs text-muted-foreground">{group.validators.join(', ') || '—'}</td>
                  <td className="px-2 md:px-4 py-3">
                    <div className="flex items-center gap-2">
                      {group.reservations.map((reservation) => {
                        const canReview = ['pendiente', 'solicitud', 'en_revision'].includes(reservation.status);
                        return (
                          <div key={reservation.id} className="flex items-center gap-2">
                            <StatusBadge status={reservation.status} type="reservation" />
                            {can('approve_reservations') && canReview && (
                              <>
                                <button
                                  onClick={() => updateReservationStatus(reservation.id, 'aprobada', reservation.standCode)}
                                  className="inline-flex items-center gap-1 min-h-[36px] px-2 py-1.5 text-xs rounded border border-border hover:bg-muted transition-colors"
                                  title="Approve"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => updateReservationStatus(reservation.id, 'rechazada', reservation.standCode)}
                                  className="inline-flex items-center gap-1 min-h-[36px] px-2 py-1.5 text-xs rounded border border-status-conflict text-status-conflict hover:bg-status-conflict/10 transition-colors"
                                  title="Reject"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        </div>
        {paginatedGrouped.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No reservations found with the selected filters.
          </div>
        )}
      </div>

      {/* Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {paginatedGrouped.length > 0 ? (
          paginatedGrouped.map((group, index) => {
            return (
              <motion.div
                key={group.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <StandInterestCard
                  group={group}
                  can={can}
                  updateReservationStatus={updateReservationStatus}
                />
              </motion.div>
            );
          })
        ) : (
          <div className="p-8 text-center text-muted-foreground text-sm bg-card border border-border">
            No reservations found with the selected filters.
          </div>
        )}
      </div>

      <PaginationComponent />
    </div>
  );
}
