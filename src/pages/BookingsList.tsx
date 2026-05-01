import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Check, X } from "lucide-react";
import { bookings, bookingStatusLabels, setBookingStatus, subscribeToFairRealtime, type BookingStatus } from "@/data/mockData";
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

type BookingItem = (typeof bookings)[number];

interface StandInterestGroup {
  key: string;
  standCode: string;
  bookings: BookingItem[];
  interestedPeople: string[];
  validators: string[];
  latestRequestDate: string;
}

function StandInterestCard({
  group,
  can,
  updateBookingStatus,
}: {
  group: StandInterestGroup;
  can: (permission: string) => boolean;
  updateBookingStatus: (id: string, status: BookingStatus, code: string) => void;
}) {
  return (
    <div className="bg-card border border-border overflow-hidden">
      <div className="w-full p-4 flex items-center justify-between text-left bg-muted/20">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-foreground">{group.standCode}</span>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {group.interestedPeople.length} interested: {group.interestedPeople.join(", ")}
          </p>
        </div>
      </div>

      <div className="border-t border-border p-4 space-y-3">
        {group.bookings.map((booking) => {
          const canReview = booking.status === 'pending';
          return (
            <div key={booking.id} className="border border-border rounded-md p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-sm font-medium text-foreground">{booking.company} · {booking.requester}</p>
                <StatusBadge status={booking.status} type="booking" />
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Date: {new Date(booking.date).toLocaleDateString('en-GB')} · Approvers: {booking.validators.join(', ') || '—'}
              </p>
              <div className="flex items-center gap-2">
                {can('approve_bookings') && canReview && (
                  <button
                    aria-label={`Approve order on ${booking.standCode} from ${booking.company}`}
                    onClick={() => updateBookingStatus(booking.id, 'reserved', booking.standCode)}
                    className="flex items-center gap-1 min-h-[36px] px-3 py-1.5 text-xs rounded border border-border hover:bg-muted transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                )}
                {can('approve_bookings') && canReview && (
                  <button
                    aria-label={`Reject order on ${booking.standCode} from ${booking.company}`}
                    onClick={() => updateBookingStatus(booking.id, 'available', booking.standCode)}
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

export default function BookingsList() {
  const { fairId } = useParams();
  const [searchParams] = useSearchParams();
  const { can, availableFairs, canAccessFair } = useProfile();
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [tableSearch, setTableSearch] = useState("");
  const fair = availableFairs.find(item => item.id === fairId);

  const scopedBookings = canAccessFair(fairId || "")
    ? bookings.filter(r => r.fairId === fairId)
    : [];

  useEffect(() => {
    if (!fairId) return;

    return subscribeToFairRealtime(fairId, () => {
      setRefreshSeed(seed => seed + 1);
    });
  }, [fairId]);

  const updateBookingStatus = (bookingId: string, status: BookingStatus, standCode: string) => {
    const updated = setBookingStatus(bookingId, status);
    if (!updated) {
      toast.error(`Could not update order on ${standCode}.`);
      return;
    }

    setRefreshSeed(seed => seed + 1);
    toast.success(`Order ${standCode}: status updated to ${bookingStatusLabels[status]}.`);
  };

  const groupedByStand = useMemo(() => {
    const globalQuery = (searchParams.get("q") || "").trim().toLowerCase();
    const normalizedStand = (searchParams.get("rfStand") || "").trim().toLowerCase();
    const normalizedInterested = (searchParams.get("rfInterested") || "").trim().toLowerCase();
    const normalizedValidator = (searchParams.get("rfValidator") || "").trim().toLowerCase();
    const statusFilter = (searchParams.get("rfStatus") || "all") as BookingStatus | 'all';
    const dateFrom = searchParams.get("rfFrom") || "";
    const dateTo = searchParams.get("rfTo") || "";
    const groupsMap = new Map<string, StandInterestGroup>();

    scopedBookings.forEach((booking) => {
      const key = booking.standId || booking.standCode;
      const current = groupsMap.get(key);

      if (!current) {
        groupsMap.set(key, {
          key,
          standCode: booking.standCode,
          bookings: [booking],
          interestedPeople: [],
          validators: [],
          latestRequestDate: booking.date,
        });
        return;
      }

      current.bookings.push(booking);
      if (new Date(booking.date).getTime() > new Date(current.latestRequestDate).getTime()) {
        current.latestRequestDate = booking.date;
      }
    });

    return Array.from(groupsMap.values())
      .map((group) => {
        const interestedPeople = Array.from(new Set(group.bookings.map(r => `${r.company} (${r.requester})`)));
        const validators = Array.from(new Set(group.bookings.flatMap(r => r.validators))).filter(Boolean);

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
          group.bookings.map(r => `${r.status} ${r.company} ${r.requester}`).join(' '),
        ].join(' ').toLowerCase();

        const matchGlobal = !globalQuery || searchableContent.includes(globalQuery);
        const matchStand = !normalizedStand || group.standCode.toLowerCase().includes(normalizedStand);
        const matchInterested =
          !normalizedInterested || group.interestedPeople.some(person => person.toLowerCase().includes(normalizedInterested));
        const matchValidators =
          !normalizedValidator || group.validators.some(validator => validator.toLowerCase().includes(normalizedValidator));
        const matchStatus = statusFilter === 'all' || group.bookings.some(r => r.status === statusFilter);
        const matchFrom = !dateFrom || group.bookings.some(r => new Date(r.date).getTime() >= new Date(dateFrom).getTime());
        const matchTo = !dateTo || group.bookings.some(r => new Date(r.date).getTime() <= new Date(dateTo).getTime());
        return matchGlobal && matchStand && matchInterested && matchValidators && matchStatus && matchFrom && matchTo;
      });
  }, [scopedBookings, searchParams, refreshSeed]);

  const { filters, setFilter, clearFilter, applyFilters } = useColumnFilters<(typeof groupedByStand)[number]>();
  const statusOptions = useMemo(() => [...new Set(groupedByStand.map(g => g.bookings[0].status))].sort(), [groupedByStand]);
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
    status:    g => group.bookings[0].status,
  });

  const { sortedItems: sortedGrouped, sortKey, sortDir, handleSort } = useTableSort(columnFiltered, (item, key) => {
    switch (key) {
      case 'standCode':         return item.standCode;
      case 'interested':        return item.interestedPeople.length;
      case 'latestRequestDate': return new Date(item.latestRequestDate).getTime();
      case 'validators':        return item.validators.length;
      case 'status':           return item.bookings[0].status;
      default:                  return null;
    }
  });

  const { paginatedItems: paginatedGrouped, PaginationComponent } = usePagination({ items: sortedGrouped, itemsPerPage: 10 });

  return (
    <div className="space-y-4 animate-fade-in">
      <Breadcrumbs
        items={[{ label: "Dashboard", href: "/" }, { label: "Portfolios", href: "/fairs" }, { label: fair?.name || 'Portfolio' }, { label: "Trade orders" }]}
      />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start gap-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Trade orders
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {`${paginatedGrouped.length} tickers with active orders in ${fair?.name || 'this portfolio'}`}
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
                  { label: 'Ticker',       key: 'standCode',          mode: 'text' as const },
                  { label: 'Counterparty', key: 'interested',         mode: 'text' as const },
                  { label: 'Latest order', key: 'latestRequestDate',  mode: null            },
                  { label: 'Approvers',    key: 'validators',         mode: 'text' as const },
                  { label: 'Status',       key: 'status',             mode: 'enum' as const, opts: statusOptions, lbls: bookingStatusLabels as Record<string,string> },
                ].map(col => (
                  <SortableHeader
                    key={col.key}
                    label={col.label}
                    sortKey={col.key}
                    currentSortKey={sortKey}
                    currentSortDir={sortDir}
                    onSort={handleSort}
                    className="text-left px-2 md:px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                    filterPopover={col.mode && col.opts ? (
                      <ColumnFilterButton
                        columnKey={col.key}
                        mode={col.mode}
                        enumOptions={col.opts}
                        optionLabels={col.lbls}
                        currentFilter={filters[col.key]}
                        onFilter={setFilter}
                        onClear={clearFilter}
                      />
                    ) : col.mode ? (
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
                    <StatusBadge status={group.bookings[0].status} type="booking" />
                  </td>
                  <td className="px-2 md:px-4 py-3">
                    <div className="flex items-center gap-2">
                      {group.bookings.map((booking) => {
                        const canReview = booking.status === 'pending';
                        return (
                          <div key={booking.id} className="flex items-center gap-2">
                            {can('approve_bookings') && canReview && (
                              <>
                                <button
                                  onClick={() => updateBookingStatus(booking.id, 'reserved', booking.standCode)}
                                  className="inline-flex items-center gap-1 min-h-[36px] px-2 py-1.5 text-xs rounded border border-border hover:bg-muted transition-colors"
                                  title="Approve"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => updateBookingStatus(booking.id, 'available', booking.standCode)}
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
            No trade orders match the current filters.
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
                  updateBookingStatus={updateBookingStatus}
                />
              </motion.div>
            );
          })
        ) : (
          <div className="p-8 text-center text-muted-foreground text-sm bg-card border border-border">
            No trade orders match the current filters.
          </div>
        )}
      </div>

      <PaginationComponent />
    </div>
  );
}
