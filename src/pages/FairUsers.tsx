import { useMemo, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { users, roleLabels, fairs, bookings, type User } from "@/data/mockData";
import { AddFairUsersDialog } from "@/components/layout/AddFairUsersDialog";
import { Shield, Eye, Pencil, Settings, UserPlus, ChevronDown, ChevronUp, Mail, Edit, ArrowRight, Trash2 } from "lucide-react";
import { useProfile } from "@/context/ProfileContext";
import { motion, AnimatePresence } from "framer-motion";
import { usePagination } from "@/hooks/usePagination";
import { useTableSort } from "@/hooks/useTableSort";
import { useColumnFilters } from "@/hooks/useColumnFilters";
import { SortableHeader } from "@/components/shared/SortableHeader";
import { ColumnFilterButton } from "@/components/shared/ColumnFilterButton";
import { TableSearchBar } from "@/components/shared/TableSearchBar";

const permLabels = {
  admin: { icon: Settings, perms: ['Full control', 'Technical editing', 'Commercial editing', 'User management'] },
  architect: { icon: Shield, perms: ['Technical editing', 'Plan validation', 'Commercial reading'] },
  commercial: { icon: Pencil, perms: ['Commercial editing', 'Booking requests', 'Technical reading'] },
  organizer: { icon: Shield, perms: ['Fair reading', 'Booking tracking', 'Version consultation'] },
  exhibitor: { icon: Eye, perms: ['Stand reading', 'Documentation consultation'] },
  viewer: { icon: Eye, perms: ['General reading'] },
};

function FairUserCard({
  user,
  perm,
  canManageUsers,
}: {
  user: User;
  perm: typeof permLabels[keyof typeof permLabels];
  canManageUsers: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const PermIcon = perm.icon;

  return (
    <div className="bg-card border border-border overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
              <PermIcon className="h-3 w-3" />
              {roleLabels[user.role]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 text-xs text-status-approved">
            <span className="h-1.5 w-1.5 rounded-full bg-status-approved" />
          </span>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
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
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0 }}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{user.email}</span>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                className="flex items-start gap-2"
              >
                <PermIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {perm.perms.map((p) => (
                    <span key={p} className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                      {p}
                    </span>
                  ))}
                </div>
              </motion.div>
              {canManageUsers && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="pt-2 border-t border-border"
                >
                  <button className="flex items-center gap-1.5 min-h-[44px] px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded border border-border transition-colors">
                    <Edit className="h-4 w-4" /> Edit user
                  </button>
                </motion.div>
              )}
              {!canManageUsers && (
                <div className="pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">View only</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FairUsers() {
  const { fairId } = useParams();
  const [searchParams] = useSearchParams();
  const { can, canAccessFair } = useProfile();
  const canManageUsers = can("manage_users");
  const [isAddUsersDialogOpen, setIsAddUsersDialogOpen] = useState(false);
  const [removedUserIds, setRemovedUserIds] = useState<Set<string>>(new Set());
  const [tableSearch, setTableSearch] = useState("");

  const fair = fairs.find(item => item.id === fairId);

  const fairUsers = useMemo(() => {
    if (!fairId || !fair) return [];

    const involvedNames = new Set<string>();
    involvedNames.add(fair.responsible);

    fair.versions.forEach(version => {
      involvedNames.add(version.createdBy);
    });

    const allRelatedUsers = users.filter(user => involvedNames.has(user.name) && !removedUserIds.has(user.id));
    return allRelatedUsers;
  }, [fair, fairId, removedUserIds]);

  const associatedFairsByUser = useMemo(() => {
    const map = new Map<string, { id: string; name: string }[]>();

    users.forEach(user => {
      const relatedFairs = fairs
        .filter(currentFair => {
          const participatesAsResponsible = currentFair.responsible === user.name;
          const participatesInVersion = currentFair.versions.some(version => version.createdBy === user.name);
          const participatesInBookings = bookings.some(
            booking =>
              booking.fairId === currentFair.id &&
              (booking.requester === user.name || booking.validators.includes(user.name))
          );

          return participatesAsResponsible || participatesInVersion || participatesInBookings;
        })
        .map(currentFair => ({ id: currentFair.id, name: `${currentFair.name} ${currentFair.edition}` }));

      map.set(user.id, relatedFairs);
    });

    return map;
  }, []);

  const handleRemoveUser = (userId: string) => {
    setRemovedUserIds(prev => new Set(prev).add(userId));
  };

  const filteredFairUsers = useMemo(() => {
    const globalQuery = (searchParams.get("q") || "").trim().toLowerCase();
    const normalizedUser = (searchParams.get("ufUser") || "").trim().toLowerCase();
    const normalizedEmail = (searchParams.get("ufEmail") || "").trim().toLowerCase();
    const normalizedAssociatedFair = (searchParams.get("ufFair") || "").trim().toLowerCase();
    const roleFilter = (searchParams.get("ufRole") || "all") as 'all' | User['role'];

    return fairUsers.filter(user => {
      const associatedFairs = associatedFairsByUser.get(user.id) || [];
      const searchable = [
        user.name,
        user.email,
        user.role,
        associatedFairs.map(fairItem => fairItem.name).join(" "),
      ].join(" ").toLowerCase();

      const matchesGlobal = !globalQuery || searchable.includes(globalQuery);
      const matchesUser = !normalizedUser || user.name.toLowerCase().includes(normalizedUser);
      const matchesEmail = !normalizedEmail || user.email.toLowerCase().includes(normalizedEmail);
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      const matchesAssociatedFair =
        !normalizedAssociatedFair ||
        associatedFairs.some(fairItem => fairItem.name.toLowerCase().includes(normalizedAssociatedFair));

      return matchesGlobal && matchesUser && matchesEmail && matchesRole && matchesAssociatedFair;
    });
  }, [fairUsers, associatedFairsByUser, searchParams]);

  const { filters, setFilter, clearFilter, applyFilters } = useColumnFilters<(typeof filteredFairUsers)[number]>();
  const tableSearchFiltered = !tableSearch.trim()
    ? filteredFairUsers
    : filteredFairUsers.filter(u => [u.name, u.email, u.role].join(' ').toLowerCase().includes(tableSearch.trim().toLowerCase()));
  const columnFiltered = applyFilters(tableSearchFiltered, {
    name:    u => u.name,
    company: u => u.company || '',
    email:   u => u.email,
    role:    u => u.role,
  });

  const { sortedItems: sortedFairUsers, sortKey, sortDir, handleSort } = useTableSort(columnFiltered, (item, key) => {
    switch (key) {
      case 'name':    return item.name;
      case 'company': return item.company || '';
      case 'email':   return item.email;
      case 'role':    return item.role;
      default:        return null;
    }
  });

  const { paginatedItems: paginatedFairUsers, PaginationComponent } = usePagination({ items: sortedFairUsers, itemsPerPage: 10 });

  if (!fairId || !canAccessFair(fairId)) {
    return (
      <div className="space-y-4 animate-fade-in">
        <p className="text-sm text-muted-foreground">You don't have access to the team of this portfolio.</p>
        <Link to="/fairs" className="flex items-center gap-2 text-primary hover:underline">
          <ArrowRight className="h-4 w-4 rotate-180" /> Back to portfolios
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <p className="text-sm text-muted-foreground">{filteredFairUsers.length} team members assigned to this portfolio</p>
        {canManageUsers && (
          <button 
            className="flex items-center gap-2 min-h-[44px] px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            onClick={() => setIsAddUsersDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4" /> Add members
          </button>
        )}
      </motion.div>

      <div className="hidden md:block bg-card rounded-lg border border-border overflow-hidden">
        <TableSearchBar value={tableSearch} onChange={setTableSearch} resultCount={sortedFairUsers.length} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {[
                { label: 'User',    key: 'name',    mode: 'text' as const, opts: undefined,               lbls: undefined },
                { label: 'Firm',    key: 'company', mode: 'text' as const, opts: undefined,               lbls: undefined },
                { label: 'Email',   key: 'email',   mode: 'text' as const, opts: undefined,               lbls: undefined },
                { label: 'Role',    key: 'role',    mode: 'enum' as const, opts: Object.keys(roleLabels), lbls: roleLabels as Record<string,string> },
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
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedFairUsers.map((u, index) => {
              const perm = permLabels[u.role];
              const PermIcon = perm.icon;
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
                        {u.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <p className="font-medium text-foreground">{u.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {u.company || <span className="text-muted-foreground/50">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-sm text-foreground">
                      <PermIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      {roleLabels[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canManageUsers ? (
                      <button 
                        onClick={() => handleRemoveUser(u.id)}
                        className="min-h-[44px] px-3 py-1.5 text-xs text-status-conflict hover:bg-status-conflict/10 rounded border border-border transition-colors inline-flex items-center gap-1.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">View</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
            {filteredFairUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No team members match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredFairUsers.length === 0 ? (
          <div className="bg-card border border-border p-8 text-center text-muted-foreground text-sm">
            No team members match the current filters.
          </div>
        ) : (
          filteredFairUsers.map((u, index) => {
            const perm = permLabels[u.role];
            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <FairUserCard user={u} perm={perm} canManageUsers={canManageUsers} />
              </motion.div>
            );
          })
        )}
      </div>

      <AddFairUsersDialog 
        open={isAddUsersDialogOpen} 
        onOpenChange={setIsAddUsersDialogOpen}
        fairId={fairId || ""}
        currentUserIds={fairUsers.map(u => u.id)}
      />

      <PaginationComponent />
    </div>
  );
}
