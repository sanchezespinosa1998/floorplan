import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DashboardInfoTable } from "@/components/dashboard/DashboardInfoTable";
import { DashboardStatsSection } from "@/components/dashboard/DashboardStatsSection";
import { RecentFairsTable } from "@/components/dashboard/RecentFairsTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { activities, roleLabels, fairs, venues, type Fair } from "@/data/mockData";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function VenueDetail() {
  const { venueId } = useParams();
  const [recentFairsSearch, setRecentFairsSearch] = useState("");
  const [recentActivitySearch, setRecentActivitySearch] = useState("");

  const venue = venues.find((item) => item.id === venueId);

  if (!venue) {
    return <div className="py-20 text-center text-muted-foreground">Mandate not found.</div>;
  }

  const venueFairs = fairs.filter((fair) => fair.venueId === venue.id);

  const filteredVenueFairs = useMemo(() => {
    const query = recentFairsSearch.trim().toLowerCase();

    return [...venueFairs]
      .sort((left, right) => new Date(right.lastActivity).getTime() - new Date(left.lastActivity).getTime())
      .filter((fair) => {
        if (!query) return true;

        return [fair.name, fair.edition, fair.responsible, fair.status]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
  }, [recentFairsSearch, venueFairs]);

  const filteredActivities = useMemo(() => {
    const query = recentActivitySearch.trim().toLowerCase();

    return activities
      .filter((activity) => venueFairs.some((fair) => activity.target.includes(fair.name)))
      .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
      .filter((activity) => {
        if (!query) return true;

        return [activity.user, roleLabels[activity.role], activity.action, activity.target]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
  }, [recentActivitySearch, venueFairs]);

  const fairColumns = useMemo(() => [
    {
      key: "name",
      label: "Portfolio",
      sortable: true,
      sortResolver: (f: Fair) => f.name,
      filterable: true,
      filterMode: "text",
      filterResolver: (f: Fair) => `${f.name} ${f.edition}`,
      render: (fair: Fair) => (
        <div className="py-[8px]">
          <p className="text-[12.8px] font-bold text-[#dadada]">{fair.name} {fair.edition}</p>
          <p className="text-[10.24px] font-light leading-[1.56] text-[#dadada]">{formatDate(fair.lastActivity)}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      sortResolver: (f: Fair) => f.status,
      filterable: true,
      filterMode: "enum",
      filterResolver: (f: Fair) => f.status,
      enumOptions: ["planificación", "comercialización", "en_curso", "finalizada"],
      render: (fair: Fair) => (
        <StatusBadge status={fair.status} type="fair" className="rounded-[6.55px] px-[12.8px] py-[8.19px] text-[12.8px] font-extrabold" />
      ),
    },
    {
      key: "owner",
      label: "PM",
      sortable: true,
      sortResolver: (f: Fair) => f.responsible,
      filterable: true,
      filterMode: "text",
      filterResolver: (f: Fair) => f.responsible,
      render: (fair: Fair) => fair.responsible,
    },
    {
      key: "dates",
      label: "Inception",
      sortable: true,
      sortResolver: (f: Fair) => f.startDate,
      render: (fair: Fair) => new Date(fair.startDate).toLocaleDateString("en-GB"),
    },
    {
      key: "action",
      label: "Action",
      render: (fair: Fair) => (
        <Link
          to={`/fairs/${fair.id}`}
          className="inline-flex h-[31.25px] items-center justify-center rounded-[6.55px] border border-[#333333] bg-[#141414] px-[12.8px] py-[8.19px] text-[12.8px] font-extrabold text-[#fafafa]"
        >
          Open
        </Link>
      ),
    },
  ], []);

  return (
    <div className="flex h-full min-h-0 flex-col gap-[10.24px]">
      <DashboardStatsSection
        cards={[
          {
            id: "mandate-hq",
            title: "HQ",
            value: venue.location.split(",")[0] ?? venue.location,
            subtitle: venue.location,
          },
          {
            id: "mandate-aum",
            title: "Mandate\nAUM",
            value: `€${venue.area.toLocaleString("en-GB")} M`,
            subtitle: "Capital under management",
          },
          {
            id: "mandate-strategies",
            title: "Strategies",
            value: venue.pavilions,
            subtitle: "Active sleeves",
          },
          {
            id: "mandate-portfolios",
            title: "Portfolios",
            value: venueFairs.length,
            subtitle: "Within this mandate",
          },
          {
            id: "mandate-invested",
            title: "Avg.\ninvested",
            value: `${Math.round(venueFairs.reduce((sum, fair) => sum + fair.occupancy, 0) / (venueFairs.length || 1))}%`,
            subtitle: "Across mandate portfolios",
          },
        ]}
      />

      <div className="mb-[16px] grid grid-cols-1 gap-[10.24px] lg:min-h-0 lg:flex-1 lg:grid-cols-3">
        <DashboardInfoTable
          initialViewMode="cards"
          recentActivitySearch={recentActivitySearch}
          onRecentActivitySearchChange={setRecentActivitySearch}
          filteredActivities={filteredActivities}
          roleLabels={roleLabels}
          formatActivityDate={formatDate}
        />

        <div className="h-full overflow-hidden lg:col-span-2">
          <RecentFairsTable
            title={`Portfolios in ${venue.name}`}
            initialViewMode="list"
            searchPlaceholder="Search portfolios in mandate"
            searchAriaLabel="Search portfolios in mandate"
            recentFairsSearch={recentFairsSearch}
            onRecentFairsSearchChange={setRecentFairsSearch}
            items={filteredVenueFairs}
            columns={fairColumns}
            emptyMessage="No portfolios match the current filters."
            initialItemsPerPage={5}
          />
        </div>
      </div>
    </div>
  );
}
