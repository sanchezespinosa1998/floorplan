import { useParams, Link } from "react-router-dom";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { venues, fairs } from "@/data/mockData";
import { MapPin, Maximize, Building2, CalendarDays } from "lucide-react";

export default function VenueDetail() {
  const { venueId } = useParams();
  const venue = venues.find(v => v.id === venueId);

  if (!venue) return <div className="text-center py-20 text-muted-foreground">Venue no encontrado</div>;

  const venueFairs = fairs.filter(f => f.venueId === venueId);

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/" }, { label: "Venues", href: "/venues" }, { label: venue.name }]} />

      <h1 className="text-2xl font-bold text-foreground">{venue.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: MapPin, label: 'Ubicación', value: venue.location },
          { icon: Maximize, label: 'Superficie', value: `${venue.area.toLocaleString('es-ES')} m²` },
          { icon: Building2, label: 'Pabellones', value: venue.pavilions },
          { icon: CalendarDays, label: 'Fairs', value: venueFairs.length },
        ].map(item => (
          <div key={item.label} className="bg-card rounded-lg border border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <item.icon className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{item.label}</p>
            </div>
            <p className="text-lg font-bold text-foreground">{item.value}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">{venue.description}</p>

      {/* Fairs */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Fairs vinculadas</h2>
        </div>
        <div className="divide-y divide-border">
          {venueFairs.map(f => (
            <Link key={f.id} to={`/fairs/${f.id}`} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div>
                <p className="text-sm font-medium text-foreground">{f.name} {f.edition}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(f.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} – {new Date(f.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <StatusBadge status={f.status} type="fair" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
