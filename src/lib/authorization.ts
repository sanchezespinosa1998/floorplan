import { type UserRole } from "@/data/mockData";

export type Permission =
  | "view_dashboard"
  | "view_fairs"
  | "view_venues"
  | "view_fair_detail"
  | "view_plan"
  | "edit_plan"
  | "view_reservations"
  | "manage_reservations"
  | "approve_reservations"
  | "view_fair_users"
  | "manage_users"
  | "view_fair_versions"
  | "manage_versions"
  | "view_exhibitor_portal";

const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    "view_dashboard",
    "view_fairs",
    "view_venues",
    "view_fair_detail",
    "view_plan",
    "edit_plan",
    "view_reservations",
    "manage_reservations",
    "approve_reservations",
    "view_fair_users",
    "manage_users",
    "view_fair_versions",
    "manage_versions",
  ],
  architect: [
    "view_dashboard",
    "view_fairs",
    "view_venues",
    "view_fair_detail",
    "view_plan",
    "edit_plan",
    "view_reservations",
    "manage_reservations",
    "approve_reservations",
    "view_fair_users",
    "view_fair_versions",
    "manage_versions",
  ],
  commercial: [
    "view_dashboard",
    "view_fairs",
    "view_venues",
    "view_fair_detail",
    "view_plan",
    "view_reservations",
    "manage_reservations",
    "approve_reservations",
    "view_fair_versions",
  ],
  organizer: [
    "view_dashboard",
    "view_fairs",
    "view_fair_detail",
    "view_plan",
    "view_reservations",
    "manage_reservations",
    "view_fair_users",
    "view_fair_versions",
  ],
  exhibitor: [
    "view_exhibitor_portal",
    "view_reservations",
    "manage_reservations",
  ],
  viewer: [
    "view_dashboard",
    "view_fairs",
    "view_venues",
    "view_fair_detail",
    "view_plan",
    "view_reservations",
    "manage_reservations",
    "view_fair_users",
    "view_fair_versions",
  ],
};

export function hasPermission(role: UserRole, permission: Permission) {
  return rolePermissions[role].includes(permission);
}

export function getHomePathForRole(role: UserRole) {
  if (role === "exhibitor") return "/exhibitor";
  return "/";
}
