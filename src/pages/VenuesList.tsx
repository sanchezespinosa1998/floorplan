import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardInfoTable } from "@/components/dashboard/DashboardInfoTable";
import { RecentFairsTable } from "@/components/dashboard/RecentFairsTable";
import { DashboardStatsSection } from "@/components/dashboard/DashboardStatsSection";
import { DashboardEditModal } from "@/components/dashboard/DashboardEditModal";
import { fairs, roleLabels, venues, type ActivityItem, type UserRole, type Venue } from "@/data/mockData";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function VenuesList() {
  const [recentVenuesSearch, setRecentVenuesSearch] = useState("");
  const [recentActivitySearch, setRecentActivitySearch] = useState("");
  const [createdVenues, setCreatedVenues] = useState<Venue[]>([]);
  const [venueEdits, setVenueEdits] = useState<Record<string, Partial<Venue>>>({});
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [isCreatingVenue, setIsCreatingVenue] = useState(false);
  const [venueDraft, setVenueDraft] = useState({
    name: "",
    location: "",
    area: "0",
    pavilions: "0",
  });

  const venuesWithEdits = useMemo(() => {
    return [...venues, ...createdVenues].map((venue) => ({
      ...venue,
      ...(venueEdits[venue.id] ?? {}),
    }));
  }, [createdVenues, venueEdits]);

  const handleOpenVenueEdit = useCallback((venue: Venue) => {
    setIsCreatingVenue(false);
    setEditingVenue(venue);
    setVenueDraft({
      name: venue.name,
      location: venue.location,
      area: String(venue.area),
      pavilions: String(venue.pavilions),
    });
  }, []);

  const handleOpenVenueCreate = useCallback(() => {
    setEditingVenue(null);
    setIsCreatingVenue(true);
    setVenueDraft({
      name: "",
      location: "",
      area: "0",
      pavilions: "0",
    });
  }, []);

  const handleSaveVenueEdit = useCallback(() => {
    if (isCreatingVenue) {
      const newVenue: Venue = {
        id: `custom-venue-${Date.now()}`,
        name: venueDraft.name || "Nuevo venue",
        location: venueDraft.location || "Sin ubicacion",
        area: Number(venueDraft.area) || 0,
        pavilions: Number(venueDraft.pavilions) || 0,
        description: "Creado desde dashboard",
        fairCount: 0,
      };
      setCreatedVenues((previous) => [newVenue, ...previous]);
      setIsCreatingVenue(false);
      return;
    }

    if (!editingVenue) return;

    setVenueEdits((previous) => ({
      ...previous,
      [editingVenue.id]: {
        ...previous[editingVenue.id],
        name: venueDraft.name,
        location: venueDraft.location,
        area: Number(venueDraft.area) || 0,
        pavilions: Number(venueDraft.pavilions) || 0,
      },
    }));
    setEditingVenue(null);
  }, [editingVenue, isCreatingVenue, venueDraft]);

  const filteredVenues = useMemo(() => {
    const query = recentVenuesSearch.trim().toLowerCase();

    return [...venuesWithEdits]
      .sort((left, right) => right.fairCount - left.fairCount)
      .filter((venue) => {
        if (!query) return true;

        return [venue.name, venue.location, String(venue.area), String(venue.pavilions)]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
  }, [recentVenuesSearch, venuesWithEdits]);

  const avgArea = Math.round(venuesWithEdits.reduce((sum, venue) => sum + venue.area, 0) / (venuesWithEdits.length || 1));
  const avgPavilions = Math.round(venuesWithEdits.reduce((sum, venue) => sum + venue.pavilions, 0) / (venuesWithEdits.length || 1));
  const totalHostedFairs = venuesWithEdits.reduce((sum, venue) => sum + venue.fairCount, 0);
  const largestVenue = [...venuesWithEdits].sort((left, right) => right.area - left.area)[0];

  const venueActivities = useMemo<ActivityItem[]>(() => {
    return venuesWithEdits
      .map((venue) => {
        const relatedFairs = fairs.filter((fair) => fair.venueId === venue.id);
        const lastRelatedActivity = [...relatedFairs]
          .sort((left, right) => new Date(right.lastActivity).getTime() - new Date(left.lastActivity).getTime())[0]
          ?.lastActivity;

        return {
          id: `venue-activity-${venue.id}`,
          user: "System",
          role: "admin" as UserRole,
          action: "updated mandate",
          target: `${venue.name} (${venue.location})`,
          date: lastRelatedActivity ?? "2026-01-01T09:00:00",
          type: "plan",
        };
      })
      .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());
  }, [venuesWithEdits]);

  const filteredActivities = useMemo(() => {
    const query = recentActivitySearch.trim().toLowerCase();

    return venueActivities.filter((activity) => {
      if (!query) return true;

      return [activity.user, roleLabels[activity.role], activity.action, activity.target]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [recentActivitySearch, venueActivities]);

  const venueColumns = useMemo(() => [
    {
      key: "name",
      label: "Mandate",
      sortable: true,
      sortResolver: (v: Venue) => v.name,
      filterable: true,
      filterMode: "text",
      filterResolver: (v: Venue) => `${v.name} ${v.location}`,
      render: (venue: Venue) => (
        <div className="py-[8px]">
          <p className="text-[12.8px] font-bold text-[#dadada]">{venue.name}</p>
          <p className="text-[10.24px] font-light leading-[1.56] text-[#dadada]">{venue.location}</p>
        </div>
      ),
    },
    {
      key: "area",
      label: "AUM",
      sortable: true,
      sortResolver: (v: Venue) => v.area,
      render: (venue: Venue) => `€${venue.area.toLocaleString("en-GB")} M`,
    },
    {
      key: "pavilions",
      label: "Strategies",
      sortable: true,
      sortResolver: (v: Venue) => v.pavilions,
      render: (venue: Venue) => venue.pavilions,
    },
    {
      key: "fairs",
      label: "Portfolios",
      sortable: true,
      sortResolver: (v: Venue) => v.fairCount,
      render: (venue: Venue) => venue.fairCount,
    },
    {
      key: "action",
      label: "Action",
      render: (venue: Venue) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/venues/${venue.id}`}
            className="ui-hover-surface ui-interactive-base inline-flex h-[31.25px] items-center justify-center rounded-[6.55px] border border-[#333333] bg-[#141414] px-[12.8px] py-[8.19px] text-[12.8px] font-extrabold text-[#fafafa]"
          >
            Open
          </Link>
          <button
            type="button"
            onClick={() => handleOpenVenueEdit(venue)}
            className="ui-hover-accent ui-interactive-base inline-flex h-[31.25px] items-center justify-center rounded-[6.55px] border border-[#2f4310] bg-[#2f4310] px-[12.8px] py-[8.19px] text-[12.8px] font-bold text-[#8fee00]"
          >
            Edit
          </button>
        </div>
      ),
    },
  ], [handleOpenVenueEdit]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-[10.24px]">
      <DashboardStatsSection
        cards={[
          {
            id: "mandates-total",
            title: "Mandates",
            value: venues.length,
            subtitle: "Active investment mandates",
          },
          {
            id: "mandates-aum",
            title: "Avg.\nAUM",
            value: `€${avgArea.toLocaleString("en-GB")} M`,
            subtitle: "Per mandate",
          },
          {
            id: "mandates-strategies",
            title: "Avg.\nstrategies",
            value: avgPavilions,
            subtitle: "Sleeves per mandate",
          },
          {
            id: "mandates-portfolios",
            title: "Active\nportfolios",
            value: totalHostedFairs,
            subtitle: "Across all mandates",
          },
          {
            id: "mandates-largest",
            title: "Largest\nmandate",
            value: largestVenue ? `€${largestVenue.area.toLocaleString("en-GB")} M` : "—",
            subtitle: largestVenue?.name ?? "No data",
          },
        ]}
      />

      <div className="mb-[16px] grid grid-cols-1 gap-[10.24px] lg:min-h-0 lg:flex-1 lg:grid-cols-3">
        <div className="h-full overflow-hidden lg:col-span-2">
          <RecentFairsTable
            title="Mandates"
            onCreateRow={handleOpenVenueCreate}
            createRowLabel="New mandate"
            initialViewMode="cards"
            searchPlaceholder="Search mandates"
            searchAriaLabel="Search mandates"
            recentFairsSearch={recentVenuesSearch}
            onRecentFairsSearchChange={setRecentVenuesSearch}
            items={filteredVenues}
            columns={venueColumns}
            emptyMessage="No mandates match the current filters."
            initialItemsPerPage={5}
          />
        </div>

        <DashboardInfoTable
          initialViewMode="cards"
          recentActivitySearch={recentActivitySearch}
          onRecentActivitySearchChange={setRecentActivitySearch}
          filteredActivities={filteredActivities}
          roleLabels={roleLabels}
          formatActivityDate={formatDate}
        />
      </div>

      <DashboardEditModal
        open={isCreatingVenue || !!editingVenue}
        title={isCreatingVenue ? "New mandate" : "Edit mandate"}
        description={isCreatingVenue ? "Create a new mandate row in the table" : "Update the visible fields of the selected row"}
        onOpenChange={(open) => {
          if (!open) {
            setEditingVenue(null);
            setIsCreatingVenue(false);
          }
        }}
        onSave={handleSaveVenueEdit}
        saveLabel={isCreatingVenue ? "Create mandate" : "Save changes"}
      >
        <label className="grid gap-1">
          <span className="text-[10.5px] font-bold uppercase tracking-[1px] text-[#9a9a9a]">Name</span>
          <input
            value={venueDraft.name}
            onChange={(event) => setVenueDraft((previous) => ({ ...previous, name: event.target.value }))}
            className="ui-hover-outline ui-interactive-base h-[38px] rounded-[8px] border border-[#333333] bg-[#101010] px-3 text-[12.8px] text-[#fafafa] outline-none"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-[10.5px] font-bold uppercase tracking-[1px] text-[#9a9a9a]">HQ</span>
          <input
            value={venueDraft.location}
            onChange={(event) => setVenueDraft((previous) => ({ ...previous, location: event.target.value }))}
            className="ui-hover-outline ui-interactive-base h-[38px] rounded-[8px] border border-[#333333] bg-[#101010] px-3 text-[12.8px] text-[#fafafa] outline-none"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-[10.5px] font-bold uppercase tracking-[1px] text-[#9a9a9a]">AUM (M€)</span>
            <input
              type="number"
              min={0}
              value={venueDraft.area}
              onChange={(event) => setVenueDraft((previous) => ({ ...previous, area: event.target.value }))}
              className="ui-hover-outline ui-interactive-base h-[38px] rounded-[8px] border border-[#333333] bg-[#101010] px-3 text-[12.8px] text-[#fafafa] outline-none"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-[10.5px] font-bold uppercase tracking-[1px] text-[#9a9a9a]">Strategies</span>
            <input
              type="number"
              min={0}
              value={venueDraft.pavilions}
              onChange={(event) => setVenueDraft((previous) => ({ ...previous, pavilions: event.target.value }))}
              className="ui-hover-outline ui-interactive-base h-[38px] rounded-[8px] border border-[#333333] bg-[#101010] px-3 text-[12.8px] text-[#fafafa] outline-none"
            />
          </label>
        </div>
      </DashboardEditModal>
    </div>
  );
}
