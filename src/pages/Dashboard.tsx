import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardStatsSection } from "@/components/dashboard/DashboardStatsSection";
import { RecentFairsTable } from "@/components/dashboard/RecentFairsTable";
import { DashboardInfoTable } from "@/components/dashboard/DashboardInfoTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  activities,
  bookings,
  type Fair,
  roleLabels,
} from "@/data/mockData";
import { useProfile } from "@/context/ProfileContext";

export default function Dashboard() {
  const { availableFairs } = useProfile();
  const [recentFairsSearch, setRecentFairsSearch] = useState("");
  const [recentActivitySearch, setRecentActivitySearch] = useState("");
  const scopedFairIds = new Set(availableFairs.map(fair => fair.id));
  
  const activeFairs = availableFairs.filter(f => f.status !== 'finalizada');
  const avgOccupancy = Math.round(availableFairs.reduce((s, f) => s + f.occupancy, 0) / (availableFairs.length || 1));
  const pendingBookings = bookings.filter(r => scopedFairIds.has(r.fairId) && r.status === 'pending');
  const totalStands = availableFairs.reduce((s, f) => s + f.totalStands, 0);
  const freeStands = availableFairs.reduce((s, f) => s + f.freeStands, 0);
  const bookedStands = availableFairs.reduce((s, f) => s + f.reservedStands, 0);
  const scopedActivities = activities.filter(activity => {
    if (availableFairs.some(fair => activity.target.includes(fair.name))) return true;
    return pendingBookings.some(booking => activity.target.includes(booking.standCode));
  });
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
  const recentFairs = useMemo(() => {
    const query = recentFairsSearch.trim().toLowerCase();

    return [...availableFairs]
      .sort((left, right) => new Date(right.lastActivity).getTime() - new Date(left.lastActivity).getTime())
      .filter((fair) => {
        if (!query) return true;

        return [fair.name, fair.edition, fair.venueName, fair.responsible, fair.status]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
  }, [availableFairs, recentFairsSearch]);
  const formatLastActivity = (value: string) => new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

  const formatActivityDate = (value: string) => new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

  const fairColumns = useMemo(() => [
    {
      key: "name",
      label: "Name",
      sortable: true,
      sortResolver: (fair: Fair) => fair.name,
      filterable: true,
      filterMode: "text" as const,
      filterResolver: (fair: Fair) => `${fair.name} ${fair.edition}`,
      render: (fair: Fair) => (
        <div className="py-[8px]">
          <p className="text-[12.8px] font-bold text-[#dadada]">{fair.name} {fair.edition}</p>
          <p className="text-[10.24px] font-light leading-[1.56] text-[#dadada]">{formatLastActivity(fair.lastActivity)}</p>
        </div>
      ),
    },
    {
      key: "venue",
      label: "Venue",
      sortable: true,
      sortResolver: (fair: Fair) => fair.venueName,
      filterable: true,
      filterMode: "text" as const,
      filterResolver: (fair: Fair) => fair.venueName,
      render: (fair: Fair) => fair.venueName,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      sortResolver: (fair: Fair) => fair.status,
      filterable: true,
      filterMode: "enum" as const,
      filterResolver: (fair: Fair) => fair.status,
      enumOptions: ["planificación", "comercialización", "en_curso", "finalizada"],
      render: (fair: Fair) => (
        <StatusBadge status={fair.status} type="fair" className="rounded-[6.55px] px-[12.8px] py-[8.19px] text-[12.8px] font-extrabold" />
      ),
    },
    {
      key: "owner",
      label: "Owner",
      sortable: true,
      sortResolver: (fair: Fair) => fair.responsible,
      filterable: true,
      filterMode: "text" as const,
      filterResolver: (fair: Fair) => fair.responsible,
      render: (fair: Fair) => fair.responsible,
    },
    {
      key: "action",
      label: "Action",
      render: (fair: Fair) => (
        <div className="flex items-center gap-[10px]">
          <Link
            to={`/fairs/${fair.id}`}
            className="inline-flex h-[31.25px] items-center justify-center rounded-[6.55px] border border-[#333333] bg-[#141414] px-[12.8px] py-[8.19px] text-[12.8px] font-extrabold text-[#fafafa]"
          >
            Open
          </Link>
        </div>
      ),
    },
  ], [formatLastActivity]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-[10.24px]">
      
      {/* Sección 1: Estadísticas */}
      <DashboardStatsSection
        cards={[
          {
            id: "active-fairs",
            title: "Active\nfairs",
            value: activeFairs.length,
            subtitle: `Of ${availableFairs.length} visible`,
          },
          {
            id: "available-stands",
            title: "Available \nstands",
            value: freeStands,
            subtitle: `Of ${totalStands} total`,
          },
          {
            id: "average-occupancy",
            title: "Average \noccupancy",
            value: `${avgOccupancy}%`,
            subtitle: "Across all fairs",
          },
          {
            id: "booked-stands",
            title: "BOOKED \nstands",
            value: bookedStands,
            subtitle: `Of ${totalStands} total`,
          },
          {
            id: "pending-bookings",
            title: "Pending \nBOOKINGS",
            value: pendingBookings.length,
            subtitle: "Require validation",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-[10.24px] lg:min-h-0 lg:flex-1 lg:grid-cols-3 mb-[16px]">
        <div className="lg:col-span-2 h-full overflow-hidden">
          <RecentFairsTable
            title="Recent fairs"
            initialViewMode="list"
            searchPlaceholder="Search"
            searchAriaLabel="Buscar ferias recientes"
            recentFairsSearch={recentFairsSearch}
            onRecentFairsSearchChange={setRecentFairsSearch}
            items={recentFairs}
            columns={fairColumns}
            emptyMessage="No hay ferias que coincidan con la búsqueda."
            initialItemsPerPage={5}
          />
        </div>

        <DashboardInfoTable
          initialViewMode="cards"
          recentActivitySearch={recentActivitySearch}
          onRecentActivitySearchChange={setRecentActivitySearch}
          filteredActivities={filteredActivities}
          roleLabels={roleLabels}
          formatActivityDate={formatActivityDate}
        />
      </div>
    </div>
  );
}