import { useState } from "react";
import { Link } from "react-router-dom";
import { fairs, reservations, users, roleLabels, type User, type UserRole } from "@/data/mockData";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ListFilters } from "@/components/shared/ListFilters";
import { InviteUserDialog } from "@/components/layout/InviteUserDialog";
import { EditUserDialog } from "@/components/layout/EditUserDialog";
import { Shield, Eye, Pencil, Settings, UserPlus, ChevronDown, ChevronUp, Mail, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePagination } from "@/hooks/usePagination";
import { useTableSort } from "@/hooks/useTableSort";
import { useColumnFilters } from "@/hooks/useColumnFilters";
import { SortableHeader } from "@/components/shared/SortableHeader";
import { ColumnFilterButton } from "@/components/shared/ColumnFilterButton";
import { TableSearchBar } from "@/components/shared/TableSearchBar";

const permLabels: Record<UserRole, { icon: typeof Eye; perms: string[] }> = {
  admin: { icon: Settings, perms: ["Control total", "Edicion tecnica", "Edicion comercial", "Gestion usuarios"] },
  architect: { icon: Shield, perms: ["Edicion tecnica", "Validacion de plano", "Lectura comercial"] },
  commercial: { icon: Pencil, perms: ["Edicion comercial", "Solicitud de reservas", "Lectura tecnica"] },
  organizer: { icon: Shield, perms: ["Lectura de su feria", "Reservations de su feria", "Versiones y usuarios de su feria"] },
  exhibitor: { icon: Eye, perms: ["Lectura de stand", "Consulta documentacion"] },
  viewer: { icon: Eye, perms: ["Lectura general"] },
};

const roleOptions: UserRole[] = ["admin", "architect", "commercial", "organizer", "exhibitor", "viewer"];

interface AssociatedFairLink {
  id: string;
  label: string;
}

function UserCard({
  user,
  perm,
  associatedFairs,
  onRoleChange,
  onEdit,
}: {
  user: User;
  perm: typeof permLabels[keyof typeof permLabels];
  associatedFairs: AssociatedFairLink[];
  onRoleChange: (userId: string, role: UserRole) => void;
  onEdit: (user: User) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const PermIcon = perm.icon;

  return (
    <div className="bg-card border border-border overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? `Collapse user ${user.name}` : `Expand user ${user.name}`}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
            {user.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{roleLabels[user.role]}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border"
          >
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{user.email}</span>
              </div>
              <div className="flex items-start gap-2">
                <PermIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {associatedFairs.length > 0 ? (
                    associatedFairs.map((fairItem) => (
                      <Link
                        key={fairItem.id}
                        to={`/fairs/${fairItem.id}`}
                        className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        {fairItem.label}
                      </Link>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No fairs</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => onEdit(user)}
                  className="flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 text-xs text-primary hover:bg-primary/10 rounded border border-border transition-colors"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function UsersManagement() {
  const [managedUsers, setManagedUsers] = useState<User[]>(users);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [tableSearch, setTableSearch] = useState('');

  const changeUserRole = (userId: string, role: UserRole) => {
    setManagedUsers((previous) => previous.map((user) => (
      user.id === userId ? { ...user, role } : user
    )));
  };

  const handleEditUser = (userId: string, data: { name: string; email: string; role: UserRole; password?: string }) => {
    setManagedUsers((previous) => previous.map((user) => (
      user.id === userId ? { ...user, name: data.name, email: data.email, role: data.role } : user
    )));
  };

  const filteredUsers = managedUsers.filter(u => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      u.name.toLowerCase().includes(normalizedSearch) ||
      u.email.toLowerCase().includes(normalizedSearch);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const associatedFairsByUser = managedUsers.reduce<Record<string, AssociatedFairLink[]>>((acc, user) => {
    const relatedFairs = fairs
      .filter(currentFair => {
        const participatesAsResponsible = currentFair.responsible === user.name;
        const participatesInVersion = currentFair.versions.some(version => version.createdBy === user.name);
        const participatesInReservations = reservations.some(
          reservation =>
            reservation.fairId === currentFair.id &&
            (reservation.requester === user.name || reservation.validators.includes(user.name))
        );

        return participatesAsResponsible || participatesInVersion || participatesInReservations;
      })
      .map(currentFair => ({
        id: currentFair.id,
        label: `${currentFair.name} ${currentFair.edition}`,
      }));

    acc[user.id] = relatedFairs;
    return acc;
  }, {});

  const tableSearchFiltered = !tableSearch.trim()
    ? filteredUsers
    : filteredUsers.filter(u => [u.name, u.email, u.role].join(' ').toLowerCase().includes(tableSearch.trim().toLowerCase()));

  const { filters, setFilter, clearFilter, applyFilters } = useColumnFilters<(typeof filteredUsers)[number]>();
  const columnFiltered = applyFilters(tableSearchFiltered, {
    name: u => u.name,
    role: u => u.role,
  });

  const { sortedItems: sortedUsers, sortKey, sortDir, handleSort } = useTableSort(columnFiltered, (item, key) => {
    switch (key) {
      case 'name':  return item.name;
      case 'role':  return item.role;
      case 'fairs': return associatedFairsByUser[item.id]?.length ?? 0;
      default:      return null;
    }
  });

  const { paginatedItems: paginatedUsers, PaginationComponent } = usePagination({ items: sortedUsers, itemsPerPage: 10 });

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/" }, { label: "Gestion usuarios" }]} />

      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between gap-4"
      >
        <div className="flex items-start gap-6 flex-1">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestion de usuarios</h1>
            <p className="text-sm text-muted-foreground mt-1">{filteredUsers.length} usuarios activos con los filtros actuales</p>
          </div>
        </div>
        <button 
          aria-label="Invitar nuevo usuario" 
          className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
          onClick={() => setIsInviteDialogOpen(true)}
        >
          <UserPlus className="h-3.5 w-3.5" /> Invitar usuario
        </button>
      </motion.div>

      <ListFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nombre o email"
        searchAriaLabel="Buscar usuarios"
        selects={[
          {
            label: 'Rol',
            value: roleFilter,
            onChange: (value) => setRoleFilter(value as UserRole | 'all'),
            options: [
              { value: 'all', label: 'Todos los roles' },
              ...roleOptions.map(role => ({ value: role, label: roleLabels[role] })),
            ],
          },
        ]}
        onReset={() => {
          setSearch('');
          setRoleFilter('all');
        }}
      />

      {/* Desktop table */}
      <div className="hidden md:block bg-card border border-border overflow-hidden">
        <TableSearchBar value={tableSearch} onChange={setTableSearch} resultCount={sortedUsers.length} />
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {[
                { label: 'Usuario',          key: 'name',  mode: 'text' as const, opts: undefined,                             lbls: undefined },
                { label: 'Rol',              key: 'role',  mode: 'enum' as const, opts: Object.keys(roleLabels),               lbls: roleLabels as Record<string,string> },
                { label: 'Ferias asociadas', key: 'fairs', mode: null,            opts: undefined,                             lbls: undefined },
              ].map(col => (
                <SortableHeader
                  key={col.key}
                  label={col.label}
                  sortKey={col.key}
                  currentSortKey={sortKey}
                  currentSortDir={sortDir}
                  onSort={handleSort}
                  className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
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
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedUsers.map((u, index) => {
              const perm = permLabels[u.role];
              const PermIcon = perm.icon;
              const associatedFairs = associatedFairsByUser[u.id] || [];

              return (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + index * 0.03 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                        {u.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-sm text-foreground">
                      <PermIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      {roleLabels[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {associatedFairs.length > 0 ? (
                        associatedFairs.slice(0, 2).map((fairItem) => (
                          <Link
                            key={fairItem.id}
                            to={`/fairs/${fairItem.id}`}
                            className="px-2 py-1 bg-muted rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          >
                            {fairItem.label}
                          </Link>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">No fairs</span>
                      )}
                      {associatedFairs.length > 2 && (
                        <span className="px-2 py-1 bg-muted rounded text-[10px] text-muted-foreground">
                          +{associatedFairs.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setIsEditDialogOpen(true);
                      }}
                      className="min-h-[36px] px-3 py-1.5 text-xs text-primary hover:bg-primary/10 rounded border border-border transition-colors inline-flex items-center gap-1.5"
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {paginatedUsers.map((u, index) => {
          const perm = permLabels[u.role];
          const associatedFairs = associatedFairsByUser[u.id] || [];
          return (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <UserCard
                user={u}
                perm={perm}
                associatedFairs={associatedFairs}
                onRoleChange={changeUserRole}
                onEdit={(user) => { setSelectedUser(user); setIsEditDialogOpen(true); }}
              />
            </motion.div>
          );
        })}
      </div>

      <InviteUserDialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen} />
      <EditUserDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
        user={selectedUser}
        onSave={handleEditUser}
      />

      <PaginationComponent />
    </div>
  );
}
