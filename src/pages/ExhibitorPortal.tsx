import { useEffect, useMemo, useState } from "react";
import { useProfile } from "@/context/ProfileContext";
import {
  stands,
  bookings,
  createBookingForStand,
  fairs,
  getExhibitorAssignment,
  getCurrentFairVersion,
  subscribeToFairRealtime,
} from "@/data/mockData";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MapPin, Ruler, Tag, FileText, Phone, Calendar, AlertCircle, Package, Send } from "lucide-react";

const services = [
  { name: 'Electricity 220V', status: 'Contracted' },
  { name: 'Fiber internet connection', status: 'Contracted' },
  { name: 'Daily cleaning', status: 'Included' },
  { name: 'Standard assembly', status: 'Pending confirmation' },
  { name: 'Exhibitor badges (x4)', status: 'Confirmed' },
];

const dates = [
  { label: 'Setup', date: '19-20 Jan 2026', status: 'Pending' },
  { label: 'Opening', date: '21 Jan 2026', status: 'Confirmed' },
  { label: 'Closing', date: '25 Jan 2026', status: 'Confirmed' },
  { label: 'Dismantling', date: '26 Jan 2026', status: 'Pending' },
];

export default function ExhibitorPortal() {
  const { activeUser, isRole } = useProfile();
  const assignment = getExhibitorAssignment(activeUser.id);
  const fair = fairs.find(item => item.id === assignment?.fairId);
  const currentVersion = fair ? getCurrentFairVersion(fair.id) : undefined;

  const fairStands = stands.filter(stand => stand.fairId === fair?.id);
  const [refreshSeed, setRefreshSeed] = useState(0);

  const exhibitorRequests = useMemo(() => {
    if (!fair || !assignment) return [];

    return bookings.filter(
      booking => booking.fairId === fair.id && booking.company === assignment.companyName
    );
  }, [fair, assignment, refreshSeed]);

  useEffect(() => {
    if (!fair?.id) return;

    return subscribeToFairRealtime(fair.id, () => {
      setRefreshSeed(seed => seed + 1);
    });
  }, [fair?.id]);

  const exhibitorStand = assignment?.primaryStandId
    ? fairStands.find(stand => stand.id === assignment.primaryStandId)
    : undefined;

  const availableToRequest = fairStands
    .filter(stand => stand.status === 'available')
    .sort((a, b) => a.code.localeCompare(b.code));

  const requestBooking = (standId: string) => {
    if (!fair || !assignment) return;

    const stand = fairStands.find(item => item.id === standId);
    if (!stand) return;

    const alreadyRequested = exhibitorRequests.some(item => item.standId === standId);
    if (alreadyRequested) return;

    const newRequest = createBookingForStand({
      fairId: fair.id,
      standCode: stand.code,
      standId: stand.id,
      userId: activeUser.id,
      company: assignment.companyName,
      comments: "Request sent from exhibitor portal",
      status: "pending",
      validators: [assignment.commercialContact.name],
    });

    if (!newRequest) return;
    setRefreshSeed(seed => seed + 1);
  };

  if (!isRole("exhibitor")) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
        <div className="bg-card rounded-lg border border-border p-6">
          <h1 className="text-xl font-semibold text-foreground">Exhibitor Portal</h1>
          <p className="text-sm text-muted-foreground mt-2">
            This view is only available for users with exhibitor role.
          </p>
        </div>
      </div>
    );
  }

  if (!assignment || !fair) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
        <div className="bg-card rounded-lg border border-border p-6">
          <h1 className="text-xl font-semibold text-foreground">Exhibitor Portal</h1>
          <p className="text-sm text-muted-foreground mt-2">
            No fair assigned for this exhibitor. Contact administration to activate your access.
          </p>
        </div>
      </div>
    );
  }

  const exhibitorReservation = exhibitorRequests[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-primary uppercase tracking-wide">Exhibitor Portal</p>
            <h1 className="text-2xl font-bold text-foreground mt-1">{assignment.companyName}</h1>
            <p className="text-sm text-muted-foreground mt-1">{fair.name} {fair.edition}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Active version {currentVersion?.label || "—"}
            </p>
          </div>
          <StatusBadge status={exhibitorReservation?.status || 'pending'} type="booking" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stand info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-lg border border-border p-5">
            <h2 className="font-semibold text-foreground mb-4">Mi Stand</h2>
            {!exhibitorStand ? (
              <p className="text-sm text-muted-foreground">You don't have a main stand assigned yet.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Tag, label: 'Code', value: exhibitorStand.code },
                { icon: Ruler, label: 'Surface', value: `${exhibitorStand.area} m²` },
                { icon: MapPin, label: 'Zone', value: exhibitorStand.zone },
                { icon: Package, label: 'Type', value: exhibitorStand.type },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{item.label}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
              </div>
            )}
          </div>

          {/* Mini plan */}
          <div id="plano" className="bg-card rounded-lg border border-border p-5">
            <h2 className="font-semibold text-foreground mb-4">Plan location</h2>
            <div className="bg-muted/50 rounded-lg p-4">
              <svg viewBox="0 0 400 200" className="w-full h-auto">
                <defs>
                  <pattern id="miniGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(214,18%,89%)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="400" height="200" fill="url(#miniGrid)" rx="4" />
                {[0,1,2,3,4,5,6,7].map(i => (
                  <rect key={i} x={30 + i * 45} y={30} width={38} height={30} fill="hsl(0,0%,85%)" rx={3} />
                ))}
                {[0,1,2,3,4,5,6,7].map(i => (
                  <rect key={`b${i}`} x={30 + i * 45} y={80} width={38} height={30} fill="hsl(0,0%,85%)" rx={3} />
                ))}
                {[0,1,2,3,4,5,6,7].map(i => (
                  <rect key={`c${i}`} x={30 + i * 45} y={130} width={38} height={30} fill={i === 4 ? "hsl(215,65%,42%)" : "hsl(0,0%,85%)"} rx={3} stroke={i === 4 ? "hsl(215,25%,14%)" : "none"} strokeWidth={i === 4 ? 2 : 0} />
                ))}
                {exhibitorStand && (
                  <text x={30 + 4 * 45 + 19} y={150} textAnchor="middle" className="text-[8px] font-bold" fill="hsl(0,0%,100%)">{exhibitorStand.code}</text>
                )}
                <text x={30 + 4 * 45 + 19} y={175} textAnchor="middle" className="text-[7px]" fill="hsl(215,65%,42%)">← Tu stand</text>
              </svg>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-5">
            <h2 className="font-semibold text-foreground mb-4">Request stand bookings</h2>
            {availableToRequest.length === 0 ? (
              <p className="text-sm text-muted-foreground">No stands available to request at this time.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-auto pr-1">
                {availableToRequest.slice(0, 12).map(stand => {
                  const alreadyRequested = exhibitorRequests.some(item => item.standId === stand.id);

                  return (
                    <div key={stand.id} className="flex items-center justify-between gap-2 py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{stand.code} · {stand.area} m²</p>
                        <p className="text-xs text-muted-foreground">{stand.zone}</p>
                      </div>
                      <button
                        onClick={() => requestBooking(stand.id)}
                        disabled={alreadyRequested}
                        className="px-3 py-1.5 rounded-md text-xs font-medium border border-primary text-primary hover:bg-primary/10 transition-colors disabled:border-border disabled:text-muted-foreground disabled:cursor-not-allowed"
                      >
                        {alreadyRequested ? "Requested" : "Request"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Services */}
          <div className="bg-card rounded-lg border border-border p-5">
            <h2 className="font-semibold text-foreground mb-4">Servicios contratados</h2>
            <div className="space-y-2">
              {services.map(s => (
                <div key={s.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-foreground">{s.name}</span>
                  <span className={`text-xs font-medium ${s.status === 'Contratado' || s.status === 'Confirmado' || s.status === 'Incluido' ? 'text-status-approved' : 'text-status-pending'}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Key dates */}
          <div className="bg-card rounded-lg border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-foreground">Fechas clave</h2>
            </div>
            <div className="space-y-3">
              {dates.map(d => (
                <div key={d.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{d.label}</p>
                    <p className="text-xs text-muted-foreground">{d.date}</p>
                  </div>
                  <span className={`text-xs ${d.status === 'Confirmada' ? 'text-status-approved' : 'text-status-pending'}`}>
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-card rounded-lg border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-foreground">Documentation</h2>
            </div>
            <div className="space-y-2">
              {[
                'Exhibitor manual',
                `Current plan ${currentVersion?.label || ''}`.trim(),
                'Technical assembly standards',
                'Contract terms',
              ].map(doc => (
                <button key={doc} className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm text-primary">
                  📄 {doc}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="bg-card rounded-lg border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-foreground">Contacto</h2>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-foreground">{assignment.commercialContact.name}</p>
              <p className="text-xs text-muted-foreground">Comercial asignado</p>
              <p className="text-xs text-primary">{assignment.commercialContact.email}</p>
              <p className="text-xs text-muted-foreground">{assignment.commercialContact.phone}</p>
            </div>
            <button className="w-full mt-4 px-3 py-2 border border-primary text-primary rounded-md text-xs font-medium hover:bg-primary/10 transition-colors">
              <span className="inline-flex items-center gap-1.5"><Send className="h-3.5 w-3.5" /> Enviar consulta</span>
            </button>
          </div>

          {/* Alerts */}
          <div className="bg-status-pending/10 border border-status-pending/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-status-pending mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground">Action required</p>
                <p className="text-xs text-muted-foreground mt-1">Confirm assembly service before January 15.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
