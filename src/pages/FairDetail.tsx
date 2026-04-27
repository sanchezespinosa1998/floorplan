import { useMemo, useState } from "react";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import { DashboardInfoTable } from "@/components/dashboard/DashboardInfoTable";
import { DashboardStatsSection } from "@/components/dashboard/DashboardStatsSection";
import { RecentFairsTable, type RecentTableColumn } from "@/components/dashboard/RecentFairsTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useProfile } from "@/context/ProfileContext";
import {
  activities,
  bookings,
  fairVersionStatusLabels,
  roleLabels,
  stands,
  users,
  type Booking,
  type FairVersion,
  type Stand,
  type User,
} from "@/data/mockData";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

type FairDetailDatasetKey = "stands" | "bookings" | "users" | "versions";

type FairDetailRow = Stand | Booking | User | FairVersion;

const DATASET_OPTIONS: Array<{ key: FairDetailDatasetKey; label: string }> = [
  { key: "stands", label: "Stands" },
  { key: "bookings", label: "Bookings" },
  { key: "users", label: "Users" },
  { key: "versions", label: "Versions" },
];

const SEARCH_CONFIG: Record<FairDetailDatasetKey, { placeholder: string; ariaLabel: string; empty: string }> = {
  stands: { placeholder: "Search stands", ariaLabel: "Buscar stands", empty: "No hay stands que coincidan con la búsqueda." },
  bookings: { placeholder: "Search bookings", ariaLabel: "Buscar bookings", empty: "No hay bookings que coincidan con la búsqueda." },
  users: { placeholder: "Search users", ariaLabel: "Buscar usuarios", empty: "No hay usuarios vinculados a esta feria." },
  versions: { placeholder: "Search versions", ariaLabel: "Buscar versiones", empty: "No hay versiones que coincidan con la búsqueda." },
};

export default function FairDetail() {
  const { fairId } = useParams();
  const location = useLocation();
  const { availableFairs } = useProfile();
  const [selectedDataset, setSelectedDataset] = useState<FairDetailDatasetKey>("stands");
  const [tableSearch, setTableSearch] = useState("");
  const [recentActivitySearch, setRecentActivitySearch] = useState("");

  const fair = availableFairs.find((item) => item.id === fairId);
  const isRoot = location.pathname === `/fairs/${fairId}`;

  const fairStands = useMemo(() => stands.filter((s) => s.fairId === fairId), [fairId]);
  const fairBookings = useMemo(() => bookings.filter((b) => b.fairId === fairId), [fairId]);
  const fairVersions = useMemo<FairVersion[]>(() => fair?.versions ?? [], [fair]);

  const fairUsers = useMemo<User[]>(() => {
    if (!fair) return [];
    const names = new Set<string>();
    names.add(fair.responsible);
    fair.versions.forEach((v) => {
      names.add(v.createdBy);
      if (v.updatedBy) names.add(v.updatedBy);
    });
    fairBookings.forEach((b) => {
      names.add(b.requester);
      b.validators.forEach((v) => names.add(v));
    });
    return users.filter((u) => names.has(u.name));
  }, [fair, fairBookings]);

  const filteredStands = useMemo(() => {
    const query = tableSearch.trim().toLowerCase();
    return [...fairStands]
      .sort((a, b) => a.code.localeCompare(b.code))
      .filter((s) => !query || [s.code, s.zone, s.type, s.company ?? "", s.status].join(" ").toLowerCase().includes(query));
  }, [fairStands, tableSearch]);

  const filteredBookings = useMemo(() => {
    const query = tableSearch.trim().toLowerCase();
    return [...fairBookings]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter((b) => !query || [b.standCode, b.company, b.requester, roleLabels[b.requesterRole], b.status].join(" ").toLowerCase().includes(query));
  }, [fairBookings, tableSearch]);

  const filteredUsers = useMemo(() => {
    const query = tableSearch.trim().toLowerCase();
    return [...fairUsers]
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter((u) => !query || [u.name, u.email, roleLabels[u.role], u.company ?? ""].join(" ").toLowerCase().includes(query));
  }, [fairUsers, tableSearch]);

  const filteredVersions = useMemo(() => {
    const query = tableSearch.trim().toLowerCase();
    return [...fairVersions]
      .sort((a, b) => {
        const bDate = new Date(b.updatedAt ?? b.createdAt).getTime();
        const aDate = new Date(a.updatedAt ?? a.createdAt).getTime();
        return bDate - aDate;
      })
      .filter((v) => !query || [v.label, v.createdBy, v.updatedBy ?? "", fairVersionStatusLabels[v.status]].join(" ").toLowerCase().includes(query));
  }, [fairVersions, tableSearch]);

  const datasetRows = useMemo<FairDetailRow[]>(() => {
    switch (selectedDataset) {
      case "bookings": return filteredBookings;
      case "users": return filteredUsers;
      case "versions": return filteredVersions;
      default: return filteredStands;
    }
  }, [selectedDataset, filteredStands, filteredBookings, filteredUsers, filteredVersions]);

  const fairStandCodes = useMemo(() => new Set(fairStands.map((s) => s.code)), [fairStands]);

  const filteredActivities = useMemo(() => {
    const query = recentActivitySearch.trim().toLowerCase();
    if (!fair) return [];
    return activities
      .filter((a) => a.target.includes(fair.name) || Array.from(fairStandCodes).some((code) => a.target.includes(code)))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter((a) => !query || [a.user, roleLabels[a.role], a.action, a.target].join(" ").toLowerCase().includes(query));
  }, [fair, fairStandCodes, recentActivitySearch]);

  const standsColumns = useMemo<RecentTableColumn<Stand>[]>(() => [
    {
      key: "stand",
      label: "Stand",
      sortable: true,
      sortResolver: (s: Stand) => s.code,
      filterable: true,
      filterMode: "text",
      filterResolver: (s: Stand) => `${s.code} ${s.zone}`,
      render: (stand: Stand) => (
        <div className="py-[8px]">
          <p className="text-[12.8px] font-bold text-[#dadada]">{stand.code}</p>
          <p className="text-[10.24px] font-light leading-[1.56] text-[#dadada]">Zona {stand.zone}</p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      sortResolver: (s: Stand) => s.type,
      filterable: true,
      filterMode: "text",
      filterResolver: (s: Stand) => s.type,
      render: (stand: Stand) => stand.type,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      sortResolver: (s: Stand) => s.status,
      filterable: true,
      filterMode: "enum",
      filterResolver: (s: Stand) => s.status,
      enumOptions: ["available", "pending", "reserved"],
      render: (stand: Stand) => (
        <StatusBadge status={stand.status} type="booking" className="rounded-[6.55px] px-[12.8px] py-[8.19px] text-[12.8px] font-extrabold" />
      ),
    },
    {
      key: "area",
      label: "Area",
      sortable: true,
      sortResolver: (s: Stand) => s.area,
      render: (stand: Stand) => `${stand.area} m2`,
    },
    {
      key: "action",
      label: "Action",
      render: () => (
        <Link
          to={`/fairs/${fairId ?? ""}/plan`}
          className="ui-hover-surface ui-interactive-base inline-flex h-[31.25px] items-center justify-center rounded-[6.55px] border border-[#333333] bg-[#141414] px-[12.8px] py-[8.19px] text-[12.8px] font-extrabold text-[#fafafa]"
        >
          Open 3D
        </Link>
      ),
    },
  ], [fairId]);

  const bookingColumns = useMemo<RecentTableColumn<Booking>[]>(() => [
    {
      key: "booking",
      label: "Booking",
      sortable: true,
      sortResolver: (b: Booking) => b.standCode,
      filterable: true,
      filterMode: "text",
      filterResolver: (b: Booking) => `${b.standCode} ${b.company}`,
      render: (booking: Booking) => (
        <div className="py-[8px]">
          <p className="text-[12.8px] font-bold text-[#dadada]">{booking.standCode}</p>
          <p className="text-[10.24px] font-light leading-[1.56] text-[#dadada]">{booking.company}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      sortResolver: (b: Booking) => b.status,
      filterable: true,
      filterMode: "enum",
      filterResolver: (b: Booking) => b.status,
      enumOptions: ["available", "pending", "reserved"],
      render: (booking: Booking) => (
        <StatusBadge status={booking.status} type="booking" className="rounded-[6.55px] px-[12.8px] py-[8.19px] text-[12.8px] font-extrabold" />
      ),
    },
    {
      key: "owner",
      label: "Owner",
      sortable: true,
      sortResolver: (b: Booking) => b.requester,
      filterable: true,
      filterMode: "text",
      filterResolver: (b: Booking) => `${b.requester} ${roleLabels[b.requesterRole]}`,
      render: (booking: Booking) => `${booking.requester} (${roleLabels[booking.requesterRole]})`,
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
      sortResolver: (b: Booking) => b.date,
      render: (booking: Booking) => formatDate(booking.date),
    },
    {
      key: "action",
      label: "Action",
      render: () => (
        <Link
          to={`/fairs/${fairId ?? ""}/bookings`}
          className="ui-hover-surface ui-interactive-base inline-flex h-[31.25px] items-center justify-center rounded-[6.55px] border border-[#333333] bg-[#141414] px-[12.8px] py-[8.19px] text-[12.8px] font-extrabold text-[#fafafa]"
        >
          Open
        </Link>
      ),
    },
  ], [fairId]);

  const userColumns = useMemo<RecentTableColumn<User>[]>(() => [
    {
      key: "user",
      label: "User",
      sortable: true,
      sortResolver: (u: User) => u.name,
      filterable: true,
      filterMode: "text",
      filterResolver: (u: User) => `${u.name} ${u.email}`,
      render: (user: User) => (
        <div className="py-[8px]">
          <p className="text-[12.8px] font-bold text-[#dadada]">{user.name}</p>
          <p className="text-[10.24px] font-light leading-[1.56] text-[#dadada]">{user.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      sortResolver: (u: User) => roleLabels[u.role],
      filterable: true,
      filterMode: "enum",
      filterResolver: (u: User) => u.role,
      enumOptions: ["admin", "architect", "commercial", "organizer", "exhibitor", "viewer"],
      render: (user: User) => roleLabels[user.role],
    },
    {
      key: "company",
      label: "Company",
      sortable: true,
      sortResolver: (u: User) => u.company ?? "",
      filterable: true,
      filterMode: "text",
      filterResolver: (u: User) => u.company ?? "",
      render: (user: User) => user.company ?? "-",
    },
    {
      key: "action",
      label: "Action",
      render: () => (
        <Link
          to="/users"
          className="ui-hover-surface ui-interactive-base inline-flex h-[31.25px] items-center justify-center rounded-[6.55px] border border-[#333333] bg-[#141414] px-[12.8px] py-[8.19px] text-[12.8px] font-extrabold text-[#fafafa]"
        >
          Open
        </Link>
      ),
    },
  ], []);

  const versionColumns = useMemo<RecentTableColumn<FairVersion>[]>(() => [
    {
      key: "version",
      label: "Version",
      sortable: true,
      sortResolver: (v: FairVersion) => v.label,
      filterable: true,
      filterMode: "text",
      filterResolver: (v: FairVersion) => `${v.label} ${v.createdBy} ${v.updatedBy ?? ""}`,
      render: (version: FairVersion) => (
        <div className="py-[8px]">
          <p className="text-[12.8px] font-bold text-[#dadada]">{version.label}</p>
          <p className="text-[10.24px] font-light leading-[1.56] text-[#dadada]">{fairVersionStatusLabels[version.status]}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      sortResolver: (v: FairVersion) => v.status,
      filterable: true,
      filterMode: "enum",
      filterResolver: (v: FairVersion) => v.status,
      enumOptions: ["draft", "published"],
      render: (version: FairVersion) => (
        <span className="inline-flex items-center rounded-[6.55px] border border-[#333333] bg-[#141414] px-[12.8px] py-[8.19px] text-[12.8px] font-extrabold text-[#dadada]">
          {fairVersionStatusLabels[version.status]}
        </span>
      ),
    },
    {
      key: "owner",
      label: "Owner",
      sortable: true,
      sortResolver: (v: FairVersion) => v.updatedBy ?? v.createdBy,
      filterable: true,
      filterMode: "text",
      filterResolver: (v: FairVersion) => v.updatedBy ?? v.createdBy,
      render: (version: FairVersion) => version.updatedBy ?? version.createdBy,
    },
    {
      key: "updated",
      label: "Updated",
      sortable: true,
      sortResolver: (v: FairVersion) => v.updatedAt ?? v.createdAt,
      render: (version: FairVersion) => formatDate(version.updatedAt ?? version.createdAt),
    },
    {
      key: "action",
      label: "Action",
      render: () => (
        <Link
          to={`/fairs/${fairId ?? ""}/versions`}
          className="ui-hover-surface ui-interactive-base inline-flex h-[31.25px] items-center justify-center rounded-[6.55px] border border-[#333333] bg-[#141414] px-[12.8px] py-[8.19px] text-[12.8px] font-extrabold text-[#fafafa]"
        >
          Open
        </Link>
      ),
    },
  ], [fairId]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeColumns = useMemo<RecentTableColumn<any>[]>(() => {
    switch (selectedDataset) {
      case "bookings": return bookingColumns;
      case "users": return userColumns;
      case "versions": return versionColumns;
      default: return standsColumns;
    }
  }, [selectedDataset, standsColumns, bookingColumns, userColumns, versionColumns]);

  const pendingStands = fairStands.filter((s) => s.status === "pending").length;

  if (!fair) {
    return <div className="py-20 text-center text-muted-foreground">Fair not found</div>;
  }

  if (!isRoot) {
    return <Outlet />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-[10.24px]">
      <DashboardStatsSection
        cards={[
          {
            id: "fair-name",
            title: "FAIR\nname",
            value: fair.name,
            subtitle: `Edition ${fair.edition}`,
          },
          {
            id: "fair-occupancy",
            title: "AVERAGE\noccupancy",
            value: `${fair.occupancy}%`,
            subtitle: "Ocupacion actual",
          },
          {
            id: "fair-total-stands",
            title: "TOTAL\nstands",
            value: fair.totalStands,
            subtitle: "Estructura configurada",
          },
          {
            id: "fair-free-stands",
            title: "FREE\nstands",
            value: fair.freeStands,
            subtitle: "Disponibles para reservar",
          },
          {
            id: "fair-pending-stands",
            title: "PENDING\nstands",
            value: pendingStands,
            subtitle: "En validacion",
          },
        ]}
      />

      <div className="mb-[16px] grid grid-cols-1 gap-[10.24px] lg:min-h-0 lg:flex-1 lg:grid-cols-3">
        <div className="h-full overflow-hidden lg:col-span-2">
          <RecentFairsTable
            headerContent={(
              <div className="grid w-full grid-cols-4 items-center gap-1 rounded-[8.19px] border border-[#333333] bg-[#141414] p-1">
                {DATASET_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      setSelectedDataset(option.key);
                      setTableSearch("");
                    }}
                    className={selectedDataset === option.key
                      ? "inline-flex h-[29px] w-full items-center justify-center whitespace-nowrap rounded-[6.55px] bg-[#8fee00] px-2 text-[11px] font-semibold text-[#0a0a0a]"
                      : "ui-hover-surface ui-interactive-base inline-flex h-[29px] w-full items-center justify-center whitespace-nowrap rounded-[6.55px] px-2 text-[11px] font-semibold text-[#dadada]"
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
            title={`${fair.name} ${fair.edition}`}
            initialViewMode="cards"
            searchPlaceholder={SEARCH_CONFIG[selectedDataset].placeholder}
            searchAriaLabel={SEARCH_CONFIG[selectedDataset].ariaLabel}
            recentFairsSearch={tableSearch}
            onRecentFairsSearchChange={setTableSearch}
            items={datasetRows}
            columns={activeColumns}
            emptyMessage={SEARCH_CONFIG[selectedDataset].empty}
            initialItemsPerPage={6}
          />
        </div>

        <DashboardInfoTable
          initialViewMode="list"
          recentActivitySearch={recentActivitySearch}
          onRecentActivitySearchChange={setRecentActivitySearch}
          filteredActivities={filteredActivities}
          roleLabels={roleLabels}
          formatActivityDate={formatDate}
        />
      </div>
    </div>
  );
}
