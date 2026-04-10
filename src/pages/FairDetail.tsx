import { useParams, Link, Outlet, useLocation } from "react-router-dom";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KpiCard } from "@/components/shared/KpiCard";
import { ActivityTimeline } from "@/components/shared/ActivityTimeline";
import { fairs, reservations, stands, getCurrentFairVersion, activities } from "@/data/mockData";
import { BarChart3, Map, GitPullRequest, Users, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/context/ProfileContext";
import { type Permission } from "@/lib/authorization";

const tabs = [
  { label: "Resumen", path: "", permission: null as Permission | null },
  { label: "Stands", path: "stands", permission: "view_fairs" as Permission },
  { label: "Reservations", path: "reservations", permission: "view_reservations" as Permission },
  { label: "Users", path: "users", permission: "view_fair_users" as Permission },
  { label: "Versiones", path: "versions", permission: "view_fair_versions" as Permission },
];

export default function FairDetail() {
  const { fairId } = useParams();
  const location = useLocation();
  const { can, availableFairs } = useProfile();
  const fair = availableFairs.find(f => f.id === fairId);

  if (!fair) {
    return <div className="text-center py-20 text-muted-foreground">Fair no encontrada</div>;
  }

  const currentTab = location.pathname.split('/').pop();
  const isRoot = location.pathname === `/fairs/${fairId}`;
  const fairStands = stands.filter(s => s.fairId === fairId);
  const fairReservations = reservations.filter(r => r.fairId === fairId);
  const pendingRes = fairReservations.filter(r => ['pendiente', 'solicitud', 'en_revision'].includes(r.status));
  const conflictStands = fairStands.filter(s => s.status === 'conflict');
  const currentVersion = getCurrentFairVersion(fair.id);
  const availableTabs = tabs.filter(tab => !tab.permission || can(tab.permission));
  const fairStandCodes = new Set(fairStands.map(stand => stand.code));
  const fairActivities = activities.filter(activity => {
    if (activity.target.includes(fair.name)) return true;
    return Array.from(fairStandCodes).some(code => activity.target.includes(code));
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs items={[
        { label: "Dashboard", href: "/" },
        { label: "Fairs", href: "/fairs" },
        { label: fair.name },
      ]} />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{fair.name} {fair.edition}</h1>
            <StatusBadge status={fair.status} type="fair" />
            <span className="px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
              Versión {currentVersion?.label || '—'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {fair.venueName}
            {currentVersion ? ` · Publicada por ${currentVersion.createdBy}` : ''}
          </p>
        </div>
        {can("view_plan") && (
          <Link to={`/fairs/${fairId}/plan`} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Map className="h-4 w-4" /> Abrir plano
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-0 -mb-px">
          {availableTabs.map(tab => {
            const isActive = isRoot ? tab.path === "" : currentTab === tab.path;
            return (
              <Link
                key={tab.path}
                to={`/fairs/${fairId}${tab.path ? '/' + tab.path : ''}`}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                  isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Content - show summary if root, otherwise outlet */}
      {isRoot ? (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <KpiCard title="Ocupación" value={`${fair.occupancy}%`} icon={BarChart3} />
            <KpiCard title="Stands libres" value={fair.freeStands} subtitle={`de ${fair.totalStands}`} icon={Map} />
            <KpiCard title="Reservados" value={fair.reservedStands} icon={CheckCircle2} />
            <KpiCard title="Pendientes" value={pendingRes.length} icon={Clock} />
            <KpiCard title="Conflictos" value={conflictStands.length} icon={AlertTriangle} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending requests */}
            <div className="lg:col-span-1 bg-card rounded-lg border border-border">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground text-sm">Solicitudes pendientes</h2>
                <Link to={`/fairs/${fairId}/reservations`} className="text-xs text-primary hover:underline">Ver todas</Link>
              </div>
              <div className="divide-y divide-border">
                {pendingRes.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">Sin solicitudes pendientes</p>
                ) : (
                  pendingRes.map(r => (
                    <div key={r.id} className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">{r.standCode}</span>
                        <StatusBadge status={r.status} type="reservation" />
                      </div>
                      <p className="text-xs text-muted-foreground">{r.company} · {r.requester}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Activity */}
            <div className="lg:col-span-2 bg-card rounded-lg border border-border">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-foreground text-sm">Actividad reciente</h2>
              </div>
              <div className="px-4">
                {fairActivities.length === 0 ? (
                  <p className="py-4 text-sm text-muted-foreground">Sin actividad reciente para esta feria.</p>
                ) : (
                  <ActivityTimeline activities={fairActivities} maxItems={6} />
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
}
