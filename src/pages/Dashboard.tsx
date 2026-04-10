import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Building2, Clock, AlertTriangle, TrendingUp, ArrowRight, Plus } from "lucide-react";
import { KpiCard } from "@/components/shared/KpiCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ActivityTimeline } from "@/components/shared/ActivityTimeline";
import {
  activities,
  reservations,
} from "@/data/mockData";
import { useProfile } from "@/context/ProfileContext";

export default function Dashboard() {
  const { activeFair, availableFairs, isRole } = useProfile();
  const scopedFairIds = new Set(availableFairs.map(fair => fair.id));
  
  const activeFairs = availableFairs.filter(f => f.status !== 'finalizada');
  const avgOccupancy = Math.round(availableFairs.reduce((s, f) => s + f.occupancy, 0) / (availableFairs.length || 1));
  const pendingRes = reservations.filter(r => scopedFairIds.has(r.fairId) && ['pendiente', 'solicitud', 'en_revision'].includes(r.status));
  const totalStands = availableFairs.reduce((s, f) => s + f.totalStands, 0);
  const freeStands = availableFairs.reduce((s, f) => s + f.freeStands, 0);
  const scopedActivities = activities.filter(activity => {
    if (availableFairs.some(fair => activity.target.includes(fair.name))) return true;
    return pendingRes.some(reservation => activity.target.includes(reservation.standCode));
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 border-b border-border pb-[16px]">
        <div className="flex items-start gap-6 flex-1">
          <div>
            <h1 className="text-[31.25px] font-bold text-foreground tracking-tight">
              {isRole('organizer') ? 'My current fair' : 'Dashboard'}
            </h1>
            <p className="mt-[8.19px] text-[12.8px] text-muted-foreground">
              {isRole('organizer') && activeFair
                ? `Operational tracking for ${activeFair.name} ${activeFair.edition}`
                : 'General view of the fair management platform'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Active fairs" value={activeFairs.length} subtitle={`of ${availableFairs.length} visible`} icon={CalendarDays} delay={0} />
        <KpiCard title="Available stands" value={freeStands} subtitle={`of ${totalStands} total`} icon={Building2} delay={0.1} />
        <KpiCard title="Average occupancy" value={`${avgOccupancy}%`} subtitle="across all fairs" icon={TrendingUp} trend={{ value: "+5% vs. previous month", positive: true }} delay={0.2} />
        <KpiCard title="Pending reservations" value={pendingRes.length} subtitle="require validation" icon={AlertTriangle} delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 overflow-hidden border-[1.72px] border-border bg-card">
          <div className="flex items-center justify-between border-b-[1.72px] border-border px-[25px] py-[16px]">
            <h2 className="text-[12.8px] font-bold uppercase tracking-[1.37px] text-foreground">
              Recent fairs
            </h2>
            <Link to="/fairs" aria-label="View all fairs" className="flex items-center gap-[6.55px] text-[12.8px] font-bold text-primary hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y-[1.72px] divide-border">
            {availableFairs.slice(0, 5).map((fair, index) => (
              <div key={fair.id}>
                <Link
                  to={`/fairs/${fair.id}`}
                  aria-label={`View fair ${fair.name} ${fair.edition}`}
                  className="flex items-center justify-between px-[25px] py-[12.8px] transition-colors hover:bg-secondary group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.8px] font-bold text-foreground group-hover:text-primary transition-colors">{fair.name} {fair.edition}</p>
                    <p className="mt-[5.24px] text-[12.8px] text-muted-foreground">{fair.venueName}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <div className="text-right">
                      <p className="text-[12.8px] font-bold text-foreground">{fair.occupancy}%</p>
                      <p className="text-[10.24px] text-muted-foreground">Occupancy</p>
                    </div>
                    <StatusBadge status={fair.status} type="fair" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden border-[1.72px] border-border bg-card">
          <div className="border-b-[1.72px] border-border px-[25px] py-[16px]">
            <h2 className="text-[12.8px] font-bold uppercase tracking-[1.37px] text-foreground">
              Recent activity
            </h2>
          </div>
          <div className="px-[25px] py-[16px]">
            <ActivityTimeline activities={scopedActivities} maxItems={6} />
          </div>
        </div>
      </div>


    </div>
  );
}
