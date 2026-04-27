import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-[10.24px] bg-[#0a0a0a] px-4 pt-3 md:px-6 mb-[10.24px]">
      <DashboardTopBar />
      <DashboardNav />
    </div>
  );
}
