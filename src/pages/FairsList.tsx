import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardInfoTable } from "@/components/dashboard/DashboardInfoTable";
import { RecentFairsTable, type RecentTableColumn } from "@/components/dashboard/RecentFairsTable";
import { DashboardStatsSection } from "@/components/dashboard/DashboardStatsSection";
import { DashboardEditModal } from "@/components/dashboard/DashboardEditModal";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useProfile } from "@/context/ProfileContext";
import {
  activities,
  bookings,
  roleLabels,
  type Fair,
  type FairStatus,
} from "@/data/mockData";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function FairsList() {
  const { availableFairs } = useProfile();
  const [recentFairsSearch, setRecentFairsSearch] = useState("");
  const [recentActivitySearch, setRecentActivitySearch] = useState("");
  const [createdFairs, setCreatedFairs] = useState<Fair[]>([]);
  const [fairEdits, setFairEdits] = useState<Record<string, Partial<Fair>>>({});
  const [editingFair, setEditingFair] = useState<Fair | null>(null);
  const [isCreatingFair, setIsCreatingFair] = useState(false);
  const [fairDraft, setFairDraft] = useState<{
    name: string;
    edition: string;
    responsible: string;
    status: FairStatus;
  }>({
    name: "",
    edition: "",
    responsible: "",
    status: "planificación",
  });

  const fairsWithEdits = useMemo(() => {
    return [...availableFairs, ...createdFairs].map((fair) => ({
      ...fair,
      ...(fairEdits[fair.id] ?? {}),
    }));
  }, [availableFairs, createdFairs, fairEdits]);

  const handleOpenFairEdit = useCallback((fair: Fair) => {
    setIsCreatingFair(false);
    setEditingFair(fair);
    setFairDraft({
      name: fair.name,
      edition: fair.edition,
      responsible: fair.responsible,
      status: fair.status,
    });
  }, []);

  const handleOpenFairCreate = useCallback(() => {
    setEditingFair(null);
    setIsCreatingFair(true);
    setFairDraft({
      name: "",
      edition: "2026",
      responsible: "",
      status: "planificación",
    });
  }, []);

  const handleSaveFairEdit = useCallback(() => {
    if (isCreatingFair) {
      const referenceFair = fairsWithEdits[0];
      const now = new Date().toISOString();
      const newFair: Fair = {
        id: `custom-fair-${Date.now()}`,
        name: fairDraft.name || "New portfolio",
        edition: fairDraft.edition || "Live · 2026",
        startDate: referenceFair?.startDate ?? now,
        endDate: referenceFair?.endDate ?? now,
        venueId: referenceFair?.venueId ?? "custom-venue",
        venueName: referenceFair?.venueName ?? "Unassigned mandate",
        status: fairDraft.status,
        occupancy: 0,
        totalStands: 0,
        freeStands: 0,
        reservedStands: 0,
        pendingReservations: 0,
        responsible: fairDraft.responsible || "Unassigned PM",
        lastActivity: now,
        currentVersionId: "",
        versions: [],
      };
      setCreatedFairs((previous) => [newFair, ...previous]);
      setIsCreatingFair(false);
      return;
    }

    if (!editingFair) return;

    setFairEdits((previous) => ({
      ...previous,
      [editingFair.id]: {
        ...previous[editingFair.id],
        name: fairDraft.name,
        edition: fairDraft.edition,
        responsible: fairDraft.responsible,
        status: fairDraft.status,
      },
    }));
    setEditingFair(null);
  }, [editingFair, fairDraft, fairsWithEdits, isCreatingFair]);

  const scopedFairIds = useMemo(() => new Set(fairsWithEdits.map((fair) => fair.id)), [fairsWithEdits]);
  const scopedBookings = useMemo(() => bookings.filter((booking) => scopedFairIds.has(booking.fairId)), [scopedFairIds]);
  const pendingBookings = scopedBookings.filter((booking) => booking.status === "pending");

  const activeFairs = fairsWithEdits.filter((fair) => fair.status !== "finalizada");
  const avgOccupancy = Math.round(fairsWithEdits.reduce((sum, fair) => sum + fair.occupancy, 0) / (fairsWithEdits.length || 1));
  const totalStands = fairsWithEdits.reduce((sum, fair) => sum + fair.totalStands, 0);
  const reservedStands = fairsWithEdits.reduce((sum, fair) => sum + fair.reservedStands, 0);

  const filteredFairs = useMemo(() => {
    const query = recentFairsSearch.trim().toLowerCase();

    return [...fairsWithEdits]
      .sort((left, right) => new Date(right.lastActivity).getTime() - new Date(left.lastActivity).getTime())
      .filter((fair) => {
        if (!query) return true;

        return [fair.name, fair.edition, fair.venueName, fair.responsible, fair.status]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
  }, [fairsWithEdits, recentFairsSearch]);

  const scopedActivities = useMemo(() => {
    return activities.filter((activity) => {
      if (fairsWithEdits.some((fair) => activity.target.includes(fair.name))) return true;
      return pendingBookings.some((booking) => activity.target.includes(booking.standCode));
    });
  }, [fairsWithEdits, pendingBookings]);

  const filteredActivities = useMemo(() => {
    const query = recentActivitySearch.trim().toLowerCase();

    return [...scopedActivities]
      .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
      .filter((activity) => {
        if (!query) return true;

        return [activity.user, roleLabels[activity.role], activity.action, activity.target]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
  }, [recentActivitySearch, scopedActivities]);

  const fairColumns = useMemo<RecentTableColumn<Fair>[]>(() => [
    {
      key: "name",
      label: "Portfolio",
      sortable: true,
      sortResolver: (fair: Fair) => fair.name,
      filterable: true,
      filterMode: "text",
      filterResolver: (fair: Fair) => `${fair.name} ${fair.edition}`,
      render: (fair: Fair) => (
        <div className="py-[8px]">
          <p className="text-[12.8px] font-bold text-[#dadada]">{fair.name} {fair.edition}</p>
          <p className="text-[10.24px] font-light leading-[1.56] text-[#dadada]">{formatDate(fair.lastActivity)}</p>
        </div>
      ),
    },
    {
      key: "venue",
      label: "Mandate",
      sortable: true,
      sortResolver: (fair: Fair) => fair.venueName,
      filterable: true,
      filterMode: "text",
      filterResolver: (fair: Fair) => fair.venueName,
      render: (fair: Fair) => fair.venueName,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      sortResolver: (fair: Fair) => fair.status,
      filterable: true,
      filterMode: "enum",
      filterResolver: (fair: Fair) => fair.status,
      enumOptions: ["planificación", "comercialización", "en_curso", "finalizada"],
      render: (fair: Fair) => (
        <StatusBadge status={fair.status} type="fair" className="rounded-[6.55px] px-[12.8px] py-[8.19px] text-[12.8px] font-extrabold" />
      ),
    },
    {
      key: "owner",
      label: "PM",
      sortable: true,
      sortResolver: (fair: Fair) => fair.responsible,
      filterable: true,
      filterMode: "text",
      filterResolver: (fair: Fair) => fair.responsible,
      render: (fair: Fair) => fair.responsible,
    },
    {
      key: "action",
      label: "Action",
      render: (fair: Fair) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/fairs/${fair.id}`}
            className="ui-hover-surface ui-interactive-base inline-flex h-[31.25px] items-center justify-center rounded-[6.55px] border border-[#333333] bg-[#141414] px-[12.8px] py-[8.19px] text-[12.8px] font-extrabold text-[#fafafa]"
          >
            Open
          </Link>
          <button
            type="button"
            onClick={() => handleOpenFairEdit(fair)}
            className="ui-hover-accent ui-interactive-base inline-flex h-[31.25px] items-center justify-center rounded-[6.55px] border border-[#2f4310] bg-[#2f4310] px-[12.8px] py-[8.19px] text-[12.8px] font-bold text-[#8fee00]"
          >
            Edit
          </button>
        </div>
      ),
    },
  ], [handleOpenFairEdit]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-[10.24px]">
      <DashboardStatsSection
        cards={[
          {
            id: "portfolios-active",
            title: "Active\nportfolios",
            value: activeFairs.length,
            subtitle: `Of ${fairsWithEdits.length} visible`,
          },
          {
            id: "portfolios-invested",
            title: "Avg.\ninvested",
            value: `${avgOccupancy}%`,
            subtitle: "Capital deployed ratio",
          },
          {
            id: "portfolios-total-positions",
            title: "Total\nholdings",
            value: totalStands,
            subtitle: "Across all portfolios",
          },
          {
            id: "portfolios-active-positions",
            title: "Active\npositions",
            value: reservedStands,
            subtitle: "Filled and held",
          },
          {
            id: "portfolios-pending",
            title: "Pending\norders",
            value: pendingBookings.length,
            subtitle: "Awaiting compliance",
          },
        ]}
      />

      <div className="mb-[16px] grid grid-cols-1 gap-[10.24px] lg:min-h-0 lg:flex-1 lg:grid-cols-3">
        <DashboardInfoTable
          initialViewMode="list"
          recentActivitySearch={recentActivitySearch}
          onRecentActivitySearchChange={setRecentActivitySearch}
          filteredActivities={filteredActivities}
          roleLabels={roleLabels}
          formatActivityDate={formatDate}
        />

        <div className="h-full overflow-hidden lg:col-span-2">
          <RecentFairsTable
            title="Portfolios"
            onCreateRow={handleOpenFairCreate}
            createRowLabel="New portfolio"
            initialViewMode="cards"
            searchPlaceholder="Search portfolios"
            searchAriaLabel="Search portfolios"
            recentFairsSearch={recentFairsSearch}
            onRecentFairsSearchChange={setRecentFairsSearch}
            items={filteredFairs}
            columns={fairColumns}
            emptyMessage="No portfolios match the current filters."
            initialItemsPerPage={5}
          />
        </div>
      </div>

      <DashboardEditModal
        open={isCreatingFair || !!editingFair}
        title={isCreatingFair ? "New portfolio" : "Edit portfolio"}
        description={isCreatingFair ? "Create a new portfolio row in the table" : "Update the visible fields of the selected row"}
        onOpenChange={(open) => {
          if (!open) {
            setEditingFair(null);
            setIsCreatingFair(false);
          }
        }}
        onSave={handleSaveFairEdit}
        saveLabel={isCreatingFair ? "Create portfolio" : "Save changes"}
      >
        <label className="grid gap-1">
          <span className="text-[10.5px] font-bold uppercase tracking-[1px] text-[#9a9a9a]">Name</span>
          <input
            value={fairDraft.name}
            onChange={(event) => setFairDraft((previous) => ({ ...previous, name: event.target.value }))}
            className="ui-hover-outline ui-interactive-base h-[38px] rounded-[8px] border border-[#333333] bg-[#101010] px-3 text-[12.8px] text-[#fafafa] outline-none"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-[10.5px] font-bold uppercase tracking-[1px] text-[#9a9a9a]">Edicion</span>
            <input
              value={fairDraft.edition}
              onChange={(event) => setFairDraft((previous) => ({ ...previous, edition: event.target.value }))}
              className="ui-hover-outline ui-interactive-base h-[38px] rounded-[8px] border border-[#333333] bg-[#101010] px-3 text-[12.8px] text-[#fafafa] outline-none"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-[10.5px] font-bold uppercase tracking-[1px] text-[#9a9a9a]">Estado</span>
            <select
              value={fairDraft.status}
              onChange={(event) => setFairDraft((previous) => ({ ...previous, status: event.target.value as FairStatus }))}
              className="ui-hover-outline ui-interactive-base h-[38px] rounded-[8px] border border-[#333333] bg-[#101010] px-3 text-[12.8px] text-[#fafafa] outline-none"
            >
              <option value="planificación">Planning</option>
              <option value="comercialización">Sales</option>
              <option value="en_curso">En curso</option>
              <option value="finalizada">Finalizada</option>
            </select>
          </label>
        </div>

        <label className="grid gap-1">
          <span className="text-[10.5px] font-bold uppercase tracking-[1px] text-[#9a9a9a]">Responsable</span>
          <input
            value={fairDraft.responsible}
            onChange={(event) => setFairDraft((previous) => ({ ...previous, responsible: event.target.value }))}
            className="ui-hover-outline ui-interactive-base h-[38px] rounded-[8px] border border-[#333333] bg-[#101010] px-3 text-[12.8px] text-[#fafafa] outline-none"
          />
        </label>
      </DashboardEditModal>
    </div>
  );
}
