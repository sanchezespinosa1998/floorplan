import { useState } from "react";
import { Menu, X, LayoutDashboard, Wallet, CreditCard, Receipt, LineChart, Briefcase, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useProfile } from "@/context/ProfileContext";
import { type Permission } from "@/lib/authorization";
import { cn } from "@/lib/utils";

// Primary nav: most-used everyday modules. The full catalogue lives in the
// "Modules" launcher in the topbar.
const navItems = [
  { title: "Dashboard",   to: "/",          icon: LayoutDashboard, permission: "view_dashboard"        as Permission },
  { title: "Accounts",    to: "/accounts",  icon: Wallet,          permission: "view_dashboard"        as Permission },
  { title: "Cards",       to: "/cards",     icon: CreditCard,      permission: "view_dashboard"        as Permission },
  { title: "Transactions",to: "/transactions", icon: Receipt,      permission: "view_dashboard"        as Permission },
  { title: "Markets",     to: "/markets",   icon: LineChart,       permission: "view_dashboard"        as Permission },
  { title: "Portfolios",  to: "/fairs",     icon: Briefcase,       permission: "view_fairs"            as Permission },
  { title: "Beneficiary", to: "/exhibitor", icon: User,            permission: "view_exhibitor_portal" as Permission },
];

export function DashboardNav() {
  const { can } = useProfile();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const visibleItems = navItems.filter((item) => can(item.permission));

  return (
    <nav className="relative z-40 bg-[#0a0a0a]">
      <div className="hidden items-center gap-[8.16px] md:flex">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => cn(
              "ui-hover-surface flex h-[39.06px] flex-1 items-center justify-center gap-[6.55px] rounded-[8.19px] border border-transparent bg-[#141414] px-[12.8px] py-[8.19px] text-[12.8px] font-semibold text-[#fafafa]",
              isActive && "bg-[#8fee00] text-[#0a0a0a]"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("h-4 w-4", isActive ? "text-[#0a0a0a]" : "text-[#fafafa]")} />
                <span>{item.title}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="flex items-center justify-between md:hidden">
        <p className="text-[12.8px] font-semibold text-[#dadada]">Navigation</p>
        <button
          type="button"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          aria-label={isMobileOpen ? "Close navigation" : "Open navigation"}
          className="ui-hover-surface inline-flex h-[39.06px] w-[39.06px] items-center justify-center rounded-[8.19px] border border-[#333333] bg-[#141414] text-[#fafafa]"
        >
          {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {isMobileOpen && (
        <div className="mt-[6.55px] flex flex-col gap-[6.55px] md:hidden">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => cn(
                "ui-hover-surface flex min-h-[39.06px] items-center gap-[8.19px] rounded-[8.19px] border border-[#333333] bg-[#141414] px-[12.8px] py-[8.19px] text-[12.8px] font-semibold text-[#fafafa]",
                isActive && "bg-[#8fee00] text-[#0a0a0a]"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("h-4 w-4", isActive ? "text-[#0a0a0a]" : "text-[#fafafa]")} />
                  <span>{item.title}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
