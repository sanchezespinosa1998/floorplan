import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { currentUser, users, fairs, getOrganizerAssignment, type User, type UserRole, type Fair } from "@/data/mockData";
import { getHomePathForRole, hasPermission, type Permission } from "@/lib/authorization";

interface ProfileContextValue {
  activeUserId: string;
  setActiveUserId: (userId: string) => void;
  availableUsers: User[];
  activeUser: User;
  activeRole: UserRole;
  can: (permission: Permission) => boolean;
  isRole: (role: UserRole) => boolean;
  isInternalUser: boolean;
  homePath: string;
  activeFairId: string | null;
  setActiveFairId: (fairId: string | null) => void;
  activeFair: Fair | null;
  availableFairs: Fair[];
  canAccessFair: (fairId: string) => boolean;
  logout: () => void;
}

const STORAGE_KEY = "fairplan-active-user-id";
const STORAGE_KEY_FAIR = "fairplan-active-fair-id";

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [activeUserId, setActiveUserId] = useState<string>(() => {
    if (typeof window === "undefined") return currentUser.id;

    const storedUserId = window.localStorage.getItem(STORAGE_KEY);
    const isValid = storedUserId ? users.some(user => user.id === storedUserId) : false;

    return isValid && storedUserId ? storedUserId : currentUser.id;
  });

  const [activeFairId, setActiveFairId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;

    const storedFairId = window.localStorage.getItem(STORAGE_KEY_FAIR);
    const isValid = storedFairId ? fairs.some(fair => fair.id === storedFairId) : false;

    return isValid && storedFairId ? storedFairId : null;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, activeUserId);
  }, [activeUserId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (activeFairId) {
      window.localStorage.setItem(STORAGE_KEY_FAIR, activeFairId);
    } else {
      window.localStorage.removeItem(STORAGE_KEY_FAIR);
    }
  }, [activeFairId]);

  const activeUser = users.find(user => user.id === activeUserId) || currentUser;
  const organizerAssignment = getOrganizerAssignment(activeUser.id);
  const availableFairs = activeUser.role === "organizer"
    ? fairs.filter(fair => fair.id === organizerAssignment?.fairId)
    : fairs;
  const scopedFairId = activeUser.role === "organizer"
    ? organizerAssignment?.fairId || null
    : activeFairId;
  const activeFair = scopedFairId ? availableFairs.find(f => f.id === scopedFairId) || null : null;

  useEffect(() => {
    if (activeUser.role !== "organizer") return;

    const organizerFairId = organizerAssignment?.fairId || null;
    if (activeFairId !== organizerFairId) {
      setActiveFairId(organizerFairId);
    }
  }, [activeUser.role, organizerAssignment?.fairId, activeFairId]);

  const value = useMemo<ProfileContextValue>(() => {
    const activeRole = activeUser.role;

    const logout = () => {
      if (typeof window === "undefined") return;
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(STORAGE_KEY_FAIR);
      window.location.hash = "#/login";
      window.location.reload();
    };

    return {
      activeUserId: activeUser.id,
      setActiveUserId,
      availableUsers: users,
      activeUser,
      activeRole,
      can: (permission: Permission) => hasPermission(activeRole, permission),
      isRole: (role: UserRole) => activeRole === role,
      isInternalUser: activeRole !== "exhibitor",
      homePath: getHomePathForRole(activeRole),
      activeFairId: scopedFairId,
      setActiveFairId,
      activeFair,
      availableFairs,
      canAccessFair: (fairId: string) => availableFairs.some(fair => fair.id === fairId),
      logout,
    };
  }, [activeUser, scopedFairId, activeFair, availableFairs]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile debe usarse dentro de ProfileProvider.");
  }

  return context;
}
