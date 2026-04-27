import { LayoutDashboard, CalendarDays, Building2, Users, User, Menu, X, Palette } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { type Permission } from "@/lib/authorization";
import { useProfile } from "@/context/ProfileContext";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, permission: "view_dashboard" as Permission },

  { title: "Venues", url: "/venues", icon: Building2, permission: "view_venues" as Permission },
  { title: "Fairs", url: "/fairs", icon: CalendarDays, permission: "view_fairs" as Permission },
  { title: "Users", url: "/users", icon: Users, permission: "manage_users" as Permission },
  { title: "Exhibitor Portal", url: "/exhibitor", icon: User, permission: "view_exhibitor_portal" as Permission },
  
];

export function TopNavigation() {
  const { can } = useProfile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const visibleItems = navItems.filter(item => can(item.permission));

  return (
    <nav className="relative z-50 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-[12.8px] md:px-[12.8px]">
      <div className="hidden w-full items-center gap-[6.55px] overflow-x-auto md:flex">
        {visibleItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            className={({ isActive }) =>
              cn(
                "flex h-[39.06px] flex-1 items-center justify-center gap-[6.55px] whitespace-nowrap border border-border bg-card px-[12.8px] py-[8.19px] text-[12.8px] text-muted-foreground transition-colors hover:border-primary hover:text-foreground rounded-none",
                isActive && "border-primary bg-primary text-black hover:text-black"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-black" : "text-white")} />
                <span>{item.title}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <button
        className="flex h-[39.06px] w-[39.06px] items-center justify-center border border-border text-foreground transition-colors hover:border-primary md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMobileMenuOpen}
      >
        {isMobileMenuOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <Menu className="h-4 w-4" />
        )}
      </button>

      {isMobileMenuOpen && (
        <div className="absolute left-0 right-0 top-full z-50 border-b border-border bg-card p-[12.8px]">
          <div className="flex flex-col gap-[6.55px]">
            {visibleItems.map((item) => (
              <NavLink
                key={item.url}
                to={item.url}
                end={item.url === "/"}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex min-h-[39.06px] items-center gap-[8.19px] border border-border px-[12.8px] py-[8.19px] text-[12.8px] text-muted-foreground transition-colors hover:border-primary hover:text-foreground",
                )}
                activeClassName="border-primary bg-primary text-foreground hover:text-foreground"
              >
                <item.icon className="h-4 w-4 shrink-0 text-white" />
                <span>{item.title}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
