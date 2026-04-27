import { Outlet } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export function AppLayout() {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <DashboardHeader />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="relative z-0 flex-1 overflow-auto bg-background px-4 md:px-6 scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
