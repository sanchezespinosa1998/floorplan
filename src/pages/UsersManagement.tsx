import { useCallback, useMemo, useState } from "react";
import { DashboardInfoTable } from "@/components/dashboard/DashboardInfoTable";
import { DashboardStatsSection } from "@/components/dashboard/DashboardStatsSection";
import { RecentFairsTable } from "@/components/dashboard/RecentFairsTable";
import { DashboardEditModal } from "@/components/dashboard/DashboardEditModal";
import { bookings, fairs, roleLabels, users, type ActivityItem, type User, type UserRole } from "@/data/mockData";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function UsersManagement() {
  const [recentUsersSearch, setRecentUsersSearch] = useState("");
  const [recentActivitySearch, setRecentActivitySearch] = useState("");
  const [createdUsers, setCreatedUsers] = useState<User[]>([]);
  const [userEdits, setUserEdits] = useState<Record<string, Partial<User>>>({});
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userDraft, setUserDraft] = useState<{
    name: string;
    email: string;
    role: UserRole;
    company: string;
  }>({
    name: "",
    email: "",
    role: "viewer",
    company: "",
  });

  const usersWithEdits = useMemo(() => {
    return [...users, ...createdUsers].map((user) => ({
      ...user,
      ...(userEdits[user.id] ?? {}),
    }));
  }, [createdUsers, userEdits]);

  const handleOpenUserEdit = useCallback((user: User) => {
    setIsCreatingUser(false);
    setEditingUser(user);
    setUserDraft({
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company ?? "",
    });
  }, []);

  const handleOpenUserCreate = useCallback(() => {
    setEditingUser(null);
    setIsCreatingUser(true);
    setUserDraft({
      name: "",
      email: "",
      role: "viewer",
      company: "",
    });
  }, []);

  const handleSaveUserEdit = useCallback(() => {
    if (isCreatingUser) {
      const newUser: User = {
        id: `custom-user-${Date.now()}`,
        name: userDraft.name || "Nuevo usuario",
        email: userDraft.email || "nuevo@correo.com",
        role: userDraft.role,
        company: userDraft.company.trim() ? userDraft.company : undefined,
      };
      setCreatedUsers((previous) => [newUser, ...previous]);
      setIsCreatingUser(false);
      return;
    }

    if (!editingUser) return;

    setUserEdits((previous) => ({
      ...previous,
      [editingUser.id]: {
        ...previous[editingUser.id],
        name: userDraft.name,
        email: userDraft.email,
        role: userDraft.role,
        company: userDraft.company.trim() ? userDraft.company : undefined,
      },
    }));
    setEditingUser(null);
  }, [editingUser, isCreatingUser, userDraft]);

  const relatedFairsByUser = useMemo(() => {
    return usersWithEdits.reduce<Record<string, number>>((acc, user) => {
      const related = fairs.filter((currentFair) => {
        const participatesAsResponsible = currentFair.responsible === user.name;
        const participatesInVersions = currentFair.versions.some((version) => version.createdBy === user.name);
        const participatesInBookings = bookings.some(
          (booking) =>
            booking.fairId === currentFair.id &&
            (booking.requester === user.name || booking.validators.includes(user.name)),
        );

        return participatesAsResponsible || participatesInVersions || participatesInBookings;
      });

      acc[user.id] = related.length;
      return acc;
    }, {});
  }, [usersWithEdits]);

  const filteredUsers = useMemo(() => {
    const query = recentUsersSearch.trim().toLowerCase();

    return [...usersWithEdits]
      .sort((left, right) => left.name.localeCompare(right.name))
      .filter((user) => {
        if (!query) return true;

        return [user.name, user.email, roleLabels[user.role], user.company ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
  }, [recentUsersSearch, usersWithEdits]);

  const roleDistribution = usersWithEdits.reduce<Record<UserRole, number>>((acc, user) => {
    acc[user.role] = (acc[user.role] ?? 0) + 1;
    return acc;
  }, {
    admin: 0,
    architect: 0,
    commercial: 0,
    organizer: 0,
    exhibitor: 0,
    viewer: 0,
  });

  const mostCommonRole = (Object.entries(roleDistribution)
    .sort((left, right) => right[1] - left[1])[0]?.[0] ?? "viewer") as UserRole;

  const usersActivities = useMemo<ActivityItem[]>(() => {
    return usersWithEdits
      .map((user, index) => ({
        id: `user-activity-${user.id}`,
        user: user.name,
        role: user.role,
        action: "actualizo perfil",
        target: `${user.email} (${roleLabels[user.role]})`,
        date: new Date(2026, 2, 1 + index, 9, 0).toISOString(),
        type: "user" as const,
      }))
      .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());
  }, [usersWithEdits]);

  const filteredActivities = useMemo(() => {
    const query = recentActivitySearch.trim().toLowerCase();

    return usersActivities.filter((activity) => {
      if (!query) return true;

      return [activity.user, roleLabels[activity.role], activity.action, activity.target]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [recentActivitySearch, usersActivities]);

  const usersColumns = useMemo(() => [
    {
      key: "name",
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
      label: "Firm",
      sortable: true,
      sortResolver: (u: User) => u.company ?? "",
      filterable: true,
      filterMode: "text",
      filterResolver: (u: User) => u.company ?? "",
      render: (user: User) => user.company ?? "—",
    },
    {
      key: "fairs",
      label: "Portfolios",
      sortable: true,
      sortResolver: (u: User) => relatedFairsByUser[u.id] ?? 0,
      render: (user: User) => relatedFairsByUser[user.id] ?? 0,
    },
    {
      key: "action",
      label: "Action",
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <span className="ui-hover-surface ui-interactive-base inline-flex h-[31.25px] items-center justify-center rounded-[6.55px] border border-[#333333] bg-[#141414] px-[12.8px] py-[8.19px] text-[12.8px] font-extrabold text-[#fafafa]">
            Open
          </span>
          <button
            type="button"
            onClick={() => handleOpenUserEdit(user)}
            className="ui-hover-accent ui-interactive-base inline-flex h-[31.25px] items-center justify-center rounded-[6.55px] border border-[#2f4310] bg-[#2f4310] px-[12.8px] py-[8.19px] text-[12.8px] font-bold text-[#8fee00]"
          >
            Edit
          </button>
        </div>
      ),
    },
  ], [relatedFairsByUser, handleOpenUserEdit]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-[10.24px]">
      <DashboardStatsSection
        cards={[
          {
            id: "users-total",
            title: "Total\nusers",
            value: usersWithEdits.length,
            subtitle: "Provisioned accounts",
          },
          {
            id: "users-admins",
            title: "Heads of\ninvestment",
            value: roleDistribution.admin,
            subtitle: "Full firm access",
          },
          {
            id: "users-architects",
            title: "Risk\nanalysts",
            value: roleDistribution.architect,
            subtitle: "Mandate construction & limits",
          },
          {
            id: "users-commercial",
            title: "Portfolio\nmanagers",
            value: roleDistribution.commercial,
            subtitle: "Trading desk",
          },
          {
            id: "users-common-role",
            title: "Top\nrole",
            value: roleLabels[mostCommonRole],
            subtitle: "Most frequent role",
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
            title="Users"
            onCreateRow={handleOpenUserCreate}
            createRowLabel="New user"
            initialViewMode="list"
            searchPlaceholder="Search users"
            searchAriaLabel="Search users"
            recentFairsSearch={recentUsersSearch}
            onRecentFairsSearchChange={setRecentUsersSearch}
            items={filteredUsers}
            columns={usersColumns}
            emptyMessage="No users match the current filters."
            initialItemsPerPage={5}
          />
        </div>
      </div>

      <DashboardEditModal
        open={isCreatingUser || !!editingUser}
        title={isCreatingUser ? "New user" : "Edit user"}
        description={isCreatingUser ? "Create a new user record in the table" : "Update the visible fields of the selected user"}
        onOpenChange={(open) => {
          if (!open) {
            setEditingUser(null);
            setIsCreatingUser(false);
          }
        }}
        onSave={handleSaveUserEdit}
        saveLabel={isCreatingUser ? "Create user" : "Save changes"}
      >
        <label className="grid gap-1">
          <span className="text-[10.5px] font-bold uppercase tracking-[1px] text-[#9a9a9a]">Name</span>
          <input
            value={userDraft.name}
            onChange={(event) => setUserDraft((previous) => ({ ...previous, name: event.target.value }))}
            className="ui-hover-outline ui-interactive-base h-[38px] rounded-[8px] border border-[#333333] bg-[#101010] px-3 text-[12.8px] text-[#fafafa] outline-none"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-[10.5px] font-bold uppercase tracking-[1px] text-[#9a9a9a]">Email</span>
          <input
            type="email"
            value={userDraft.email}
            onChange={(event) => setUserDraft((previous) => ({ ...previous, email: event.target.value }))}
            className="ui-hover-outline ui-interactive-base h-[38px] rounded-[8px] border border-[#333333] bg-[#101010] px-3 text-[12.8px] text-[#fafafa] outline-none"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-[10.5px] font-bold uppercase tracking-[1px] text-[#9a9a9a]">Role</span>
            <select
              value={userDraft.role}
              onChange={(event) => setUserDraft((previous) => ({ ...previous, role: event.target.value as UserRole }))}
              className="ui-hover-outline ui-interactive-base h-[38px] rounded-[8px] border border-[#333333] bg-[#101010] px-3 text-[12.8px] text-[#fafafa] outline-none"
            >
              {Object.entries(roleLabels).map(([roleKey, label]) => (
                <option key={roleKey} value={roleKey}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-[10.5px] font-bold uppercase tracking-[1px] text-[#9a9a9a]">Firm</span>
            <input
              value={userDraft.company}
              onChange={(event) => setUserDraft((previous) => ({ ...previous, company: event.target.value }))}
              className="ui-hover-outline ui-interactive-base h-[38px] rounded-[8px] border border-[#333333] bg-[#101010] px-3 text-[12.8px] text-[#fafafa] outline-none"
            />
          </label>
        </div>
      </DashboardEditModal>
    </div>
  );
}
