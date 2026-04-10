import { Outlet } from "react-router-dom";
import { Topbar } from "./Topbar";
import { TopNavigation } from "./TopNavigation";

export function AppLayout() {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <Topbar />
      <TopNavigation />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-auto bg-background p-4 md:p-6 scrollbar-thin relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
