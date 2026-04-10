import { LayoutDashboard, CalendarDays, Building2, Users, User, ChevronLeft, ChevronRight, Map, Palette } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { useMemo, useState, type ComponentType } from "react";
import { Link, useLocation } from "react-router-dom";
import { useProfile } from "@/context/ProfileContext";
import { fairs, getCurrentFairVersion, getExhibitorAssignment, venues } from "@/data/mockData";
import { type Permission } from "@/lib/authorization";

const navBlockTop = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, permission: "view_dashboard" as Permission },
  { title: "Design System", url: "/design-system", icon: Palette, permission: "view_dashboard" as Permission },

];

const navBlockStructure = [
  { title: "Venues", url: "/venues", icon: Building2, permission: "view_venues" as Permission },
  { title: "Fairs", url: "/fairs", icon: CalendarDays, permission: "view_fairs" as Permission },
  
];

const navBlockManagement = [
  { title: "User management", url: "/users", icon: Users, permission: "manage_users" as Permission },
];

const hierarchyLevels: Record<string, number> = {
  "Venue": 1,
  "Fair": 2,
  "Proyecto": 3,
  "Active version": 4,
  "Empresa": 2,
};

function getLevelStyles(level: number) {
  if (level === 1) {
    return {
      card: "border-l-[3.36px] border-l-primary bg-primary-surface/40",
      connector: "bg-primary/70",
      badge: "border-primary bg-primary-surface text-primary",
    };
  }

  if (level === 2) {
    return {
      card: "border-l-[3.36px] border-l-accent bg-accent-surface/40",
      connector: "bg-accent/70",
      badge: "border-accent bg-accent-surface text-accent",
    };
  }

  if (level === 3) {
    return {
      card: "border-l-[3.36px] border-l-warning bg-warning-surface/40",
      connector: "bg-warning/70",
      badge: "border-warning bg-warning-surface text-warning",
    };
  }

  return {
    card: "border-l-[3.36px] border-l-neutral bg-neutral-surface/40",
    connector: "bg-neutral/70",
    badge: "border-neutral bg-neutral-surface text-neutral",
  };
}

function parseContextLine(line: string) {
  const parts = line.split(": ");
  if (parts.length < 2) {
    return {
      label: "Detail",
      value: line,
      level: 1,
    };
  }

  const label = parts[0];
  const value = parts.slice(1).join(": ");

  return {
    label,
    value,
    level: hierarchyLevels[label] || 1,
  };
}

function SidebarLinks({
  items,
  collapsed,
}: {
  items: Array<{ title: string; url: string; icon: ComponentType<{ className?: string }> }>;
  collapsed: boolean;
}) {
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <NavLink
          key={item.url}
          to={item.url}
          end={item.url === "/"}
          className={cn(
            "flex min-h-[39.06px] items-center gap-[8.19px] border border-sidebar-border px-[12.8px] py-[8.19px] text-[12.8px] transition-colors",
            "text-sidebar-foreground hover:border-sidebar-primary hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-2"
          )}
          activeClassName="border-sidebar-primary bg-primary-surface text-sidebar-primary font-medium"
        >
          <item.icon className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>{item.title}</span>}
        </NavLink>
      ))}
    </div>
  );
}

function SidebarStructureLinks({
  items,
  collapsed,
}: {
  items: Array<{ title: string; url: string; icon: ComponentType<{ className?: string }> }>;
  collapsed: boolean;
}) {
  if (collapsed) {
    return <SidebarLinks items={items} collapsed={collapsed} />;
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const level = index + 1;
        const leftMargin = level === 1 ? "ml-0" : level === 2 ? "ml-2" : level === 3 ? "ml-4" : "ml-6";
        const connectorOffset = level === 1 ? "left-[-7px]" : level === 2 ? "left-[-9px]" : level === 3 ? "left-[-11px]" : "left-[-13px]";
        const cardStyle =
          level === 1
            ? "border-l-primary bg-primary-surface/40"
            : level === 2
              ? "border-l-accent bg-accent-surface/40"
              : level === 3
                ? "border-l-warning bg-warning-surface/40"
                : "border-l-neutral bg-neutral-surface/40";

        return (
          <div key={item.url} className={cn("relative", leftMargin)}>
            {level > 1 && (
              <>
                <span className={cn("absolute top-0 bottom-0 w-[2px] bg-sidebar-border/90", connectorOffset)} aria-hidden="true" />
                <span className={cn("absolute top-1/2 w-2 h-[2px] bg-sidebar-border/90", connectorOffset)} aria-hidden="true" />
              </>
            )}

            <NavLink
              to={item.url}
              end={item.url === "/"}
              className={cn(
                "relative flex min-h-[39.06px] items-center gap-[8.19px] border border-sidebar-border border-l-[3.36px] px-[12.8px] py-[8.19px] text-[12.8px] transition-colors",
                "text-sidebar-foreground hover:border-sidebar-primary hover:text-sidebar-accent-foreground",
                cardStyle
              )}
              activeClassName="border-sidebar-primary bg-primary-surface text-sidebar-primary font-medium"
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              <span>{item.title}</span>
              <span className="ml-auto border border-sidebar-border bg-sidebar px-[6.55px] py-[3.36px] text-[10.24px] font-semibold text-sidebar-foreground/80">
                N{level}
              </span>
            </NavLink>
          </div>
        );
      })}
    </div>
  );
}

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { can, isRole, activeUser } = useProfile();

  const isExhibitor = isRole("exhibitor");
  const visibleTop = navBlockTop.filter(item => item.url === "/design-system" || can(item.permission));
  const visibleStructure = navBlockStructure.filter(item => can(item.permission));
  const visibleManagement = navBlockManagement.filter(item => can(item.permission));

  const contextCard = useMemo(() => {
    const pathname = location.pathname;

    const venueId = pathname.match(/^\/venues\/([^/]+)/)?.[1];
    const fairId = pathname.match(/^\/fairs\/([^/]+)/)?.[1];

    const venueFromRoute = venueId ? venues.find(venue => venue.id === venueId) : undefined;
    const fairFromRoute = fairId ? fairs.find(fair => fair.id === fairId) : undefined;

    const linkedVenue = fairFromRoute
      ? venues.find(venue => venue.id === fairFromRoute.venueId)
      : venueFromRoute;

    const currentVersion = fairFromRoute ? getCurrentFairVersion(fairFromRoute.id) : undefined;

    if (pathname.startsWith("/exhibitor")) {
      const assignment = getExhibitorAssignment(activeUser.id);
      const exhibitorFair = assignment ? fairs.find(fair => fair.id === assignment.fairId) : undefined;
      const exhibitorVenue = exhibitorFair ? venues.find(venue => venue.id === exhibitorFair.venueId) : undefined;
      const exhibitorVersion = exhibitorFair ? getCurrentFairVersion(exhibitorFair.id) : undefined;

      return {
        title: "Exhibitor Portal",
        section: "Contexto actual",
        lines: [
          exhibitorVenue ? `Venue: ${exhibitorVenue.name}` : undefined,
          exhibitorFair ? `Fair: ${exhibitorFair.name} ${exhibitorFair.edition}` : "Fair: sin asignación",
          exhibitorVersion ? `Active version: ${exhibitorVersion.label}` : undefined,
          assignment?.companyName ? `Empresa: ${assignment.companyName}` : undefined,
        ].filter(Boolean) as string[],
      };
    }

    if (pathname.startsWith("/fairs/")) {
      return {
        title: "Fair detail",
        section: "Hierarchy",
        lines: [
          linkedVenue ? `Venue: ${linkedVenue.name}` : undefined,
          fairFromRoute ? `Fair: ${fairFromRoute.name} ${fairFromRoute.edition}` : "Fair: no identificada",
          currentVersion ? `Versión: ${currentVersion.label}` : undefined,
        ].filter(Boolean) as string[],
      };
    }

    if (pathname.startsWith("/venues/")) {
      return {
        title: "Venue detail",
        section: "Hierarchy",
        lines: [venueFromRoute ? `Venue: ${venueFromRoute.name}` : "Venue: no identificado"],
      };
    }

    
    if (pathname.startsWith("/design-system")) {
      return {
        title: "Design System",
        section: "Alcance",
        lines: ["Tokens, typography, and component states"],
      };
    }

    if (pathname.startsWith("/fairs")) {
      return {
        title: "Fairs module",
        section: "Alcance",
        lines: ["Fairs list and detail"],
      };
    }

    if (pathname.startsWith("/venues")) {
      return {
        title: "Venues module",
        section: "Alcance",
        lines: ["Venues list and detail"],
      };
    }

    if (pathname.startsWith("/reservations")) {
      return {
        title: "Reservations module",
        section: "Alcance",
        lines: ["Cross-functional reservation management"],
      };
    }

    if (pathname.startsWith("/users")) {
      return {
        title: "User management",
        section: "Alcance",
        lines: ["Role and access administration"],
      };
    }

    return {
      title: "Dashboard",
      section: "Contexto actual",
      lines: ["Resumen general de actividad"],
    };
  }, [activeUser.id, location.pathname]);

  return (
    <aside className={cn(
      "h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border transition-all duration-200 shrink-0",
      collapsed ? "w-16" : "w-80"
    )}>
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
        {!collapsed && (
          <span className="text-lg font-bold text-sidebar-primary tracking-tight">FloorPlan</span>
        )}
        {collapsed && (
          <span className="text-lg font-bold text-sidebar-primary mx-auto">FP</span>
        )}
      </div>

      {!collapsed && (
        <div className="px-2 pt-3">
          <div className="border border-sidebar-border bg-sidebar-accent/40 px-[12.8px] py-[12.8px]">
            <p className="text-[10.24px] text-sidebar-foreground/60">{contextCard.section}</p>
            <h2 className="mt-[5.24px] text-[12.8px] font-semibold text-sidebar-primary leading-tight">{contextCard.title}</h2>

            <div className="mt-3 space-y-2">
              {contextCard.lines.map((line, index) => {
                const parsed = parseContextLine(line);
                const styles = getLevelStyles(parsed.level);
                const leftPadding = parsed.level === 1 ? "pl-2" : parsed.level === 2 ? "pl-3" : parsed.level === 3 ? "pl-4" : "pl-5";
                const leftMargin = parsed.level === 1 ? "ml-0" : parsed.level === 2 ? "ml-1" : parsed.level === 3 ? "ml-2" : "ml-3";
                const connectorOffset = parsed.level === 1 ? "left-[-6px]" : parsed.level === 2 ? "left-[-8px]" : parsed.level === 3 ? "left-[-10px]" : "left-[-12px]";

                return (
                  <div
                    key={`${parsed.label}-${parsed.value}-${index}`}
                    className={cn(
                      "border border-sidebar-border py-[8.19px] pr-[10.24px]",
                      "relative",
                      styles.card,
                      leftPadding,
                      leftMargin
                    )}
                  >
                    {parsed.level > 1 && (
                      <>
                        <span className={cn("absolute top-0 bottom-0 w-[2px]", connectorOffset, styles.connector)} aria-hidden="true" />
                        <span className={cn("absolute top-1/2 w-2 h-[2px]", connectorOffset, styles.connector)} aria-hidden="true" />
                      </>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10.24px] text-sidebar-foreground/80 font-semibold">{parsed.label}</p>
                      <span className={cn("border px-[6.55px] py-[3.36px] text-[10.24px] font-semibold", styles.badge)}>N{parsed.level}</span>
                    </div>
                    <p className="mt-[5.24px] break-words text-[12.8px] leading-relaxed text-sidebar-primary font-medium">{parsed.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {collapsed ? (
          <>
            <SidebarLinks items={visibleTop} collapsed={collapsed} />

            {visibleStructure.length > 0 && (
              <>
                <div className="my-3 border-t border-sidebar-border" />
                <SidebarStructureLinks items={visibleStructure} collapsed={collapsed} />
              </>
            )}

            {visibleManagement.length > 0 && (
              <>
                <div className="my-3 border-t border-sidebar-border" />
                <SidebarLinks items={visibleManagement} collapsed={collapsed} />
              </>
            )}
            
          </>

          
        ) : (
          <div className="space-y-3">
            {visibleTop.length > 0 && (
              <section className="border border-sidebar-border bg-sidebar-accent/30 p-[8.19px]">
                <p className="px-[6.55px] pb-[5.24px] text-[10.24px] font-semibold text-sidebar-foreground/60">Navigation</p>
                <SidebarLinks items={visibleTop} collapsed={collapsed} />
              </section>
            )}

            {visibleStructure.length > 0 && (
              <section className="border border-sidebar-border bg-sidebar-accent/30 p-[8.19px]">
                <p className="px-[6.55px] pb-[5.24px] text-[10.24px] font-semibold text-sidebar-foreground/60">Estructura anidada</p>
                <div className="ml-2 border-l-2 border-sidebar-border/70 pl-2">
                  <SidebarStructureLinks items={visibleStructure} collapsed={collapsed} />
                </div>
              </section>
            )}

            {visibleManagement.length > 0 && (
              <section className="border border-sidebar-border bg-sidebar-accent/30 p-[8.19px]">
                <p className="px-[6.55px] pb-[5.24px] text-[10.24px] font-semibold text-sidebar-foreground/60">Management</p>
                <SidebarLinks items={visibleManagement} collapsed={collapsed} />
              </section>
            )}
          </div>
        )}

        {isExhibitor && !collapsed && (
          <div className="mt-3 border border-sidebar-border bg-sidebar-accent/40 px-[12.8px] py-[8.19px] text-[12.8px] leading-relaxed text-sidebar-foreground/80">
            Active exhibitor access for {activeUser.name}: assigned project, reservations, and documentation.
          </div>
        )}
      </nav>

      {isExhibitor && (
        <div className="px-2 pb-2">
          <NavLink
            to="/exhibitor"
            className={cn(
              "flex min-h-[39.06px] items-center gap-[8.19px] border border-sidebar-border px-[12.8px] py-[8.19px] text-[12.8px] transition-colors",
              "text-sidebar-foreground hover:border-sidebar-primary hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-2"
            )}
            activeClassName="border-sidebar-primary bg-primary-surface text-sidebar-primary font-medium"
          >
            <User className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Exhibitor Portal</span>}
          </NavLink>

          <Link
            to="/exhibitor#plano"
            className={cn(
              "mt-[6.55px] flex min-h-[39.06px] items-center gap-[8.19px] border border-sidebar-border px-[12.8px] py-[8.19px] text-[12.8px] transition-colors",
              "text-sidebar-foreground hover:border-sidebar-primary hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-2"
            )}
            title="Ir al plano"
          >
            <Map className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Ir al plano</span>}
          </Link>
        </div>
      )}

      <div className="px-2 pb-2 mt-auto pt-2 border-t border-sidebar-border">
        <button
          onClick={() => {
            window.localStorage.removeItem("fairplan-active-user-id");
            window.localStorage.removeItem("fairplan-active-fair-id");
            window.location.reload();
          }}
          className={cn(
            "flex w-full min-h-[39.06px] items-center gap-[8.19px] border border-sidebar-border px-[12.8px] py-[8.19px] text-[12.8px] transition-colors",
            "text-sidebar-foreground hover:border-destructive hover:text-destructive",
            collapsed && "justify-center px-2"
          )}
          title="Sign out"
        >
          <svg className="h-[18px] w-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="h-10 flex items-center justify-center border-t border-sidebar-border text-sidebar-foreground transition-colors hover:text-sidebar-primary"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
