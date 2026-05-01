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

// Read-only client portal — beneficiaries see their statement, performance and key dates.
const services = [
  { name: 'Quarterly performance report', status: 'Contracted' },
  { name: 'Custodian statements (Citi)',  status: 'Contracted' },
  { name: 'Tax reporting (FATCA / CRS)',  status: 'Included' },
  { name: 'ESG impact disclosure',        status: 'Pending confirmation' },
  { name: 'Annual fee statement',         status: 'Confirmed' },
];

const dates = [
  { label: 'NAV cut-off',          date: '15 Apr 2026', status: 'Pending' },
  { label: 'Quarterly report',     date: '30 Apr 2026', status: 'Confirmed' },
  { label: 'AGM / fund review',    date: '15 May 2026', status: 'Confirmed' },
  { label: 'Subscription window',  date: '01 Jun 2026', status: 'Pending' },
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
      comments: "Order submitted from beneficiary portal",
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
          <h1 className="text-xl font-semibold text-foreground">Beneficiary portal</h1>
          <p className="text-sm text-muted-foreground mt-2">
            This view is only available to users with the beneficiary role.
          </p>
        </div>
      </div>
    );
  }

  if (!assignment || !fair) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
        <div className="bg-card rounded-lg border border-border p-6">
          <h1 className="text-xl font-semibold text-foreground">Beneficiary portal</h1>
          <p className="text-sm text-muted-foreground mt-2">
            No portfolio assigned to your account. Contact your relationship manager to activate access.
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
            <p className="text-xs font-medium text-primary uppercase tracking-wide">Beneficiary portal</p>
            <h1 className="text-2xl font-bold text-foreground mt-1">{assignment.companyName}</h1>
            <p className="text-sm text-muted-foreground mt-1">{fair.name} · {fair.edition}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Active rebalance {currentVersion?.label || "—"}
            </p>
          </div>
          <StatusBadge status={exhibitorReservation?.status || 'pending'} type="booking" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        {/* Stand info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-lg border border-border p-5">
            <h2 className="font-semibold text-foreground mb-4">Anchor position</h2>
            {!exhibitorStand ? (
              <p className="text-sm text-muted-foreground">No anchor position assigned to your portfolio.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {[
                { icon: Tag, label: 'Ticker', value: exhibitorStand.code },
                { icon: Ruler, label: 'Exposure', value: `€${exhibitorStand.area.toLocaleString("en-GB")} M` },
                { icon: MapPin, label: 'Sector', value: exhibitorStand.zone },
                { icon: Package, label: 'Asset class', value: exhibitorStand.type },
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
            <h2 className="font-semibold text-foreground mb-4">Position on the 3D map</h2>
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
                <text x={30 + 4 * 45 + 19} y={175} textAnchor="middle" className="text-[7px]" fill="hsl(215,65%,42%)">← Your position</text>
              </svg>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-5">
            <h2 className="font-semibold text-foreground mb-4">Suggested allocations</h2>
            {availableToRequest.length === 0 ? (
              <p className="text-sm text-muted-foreground">No suggested allocations open at this time.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-auto pr-1">
                {availableToRequest.slice(0, 12).map(stand => {
                  const alreadyRequested = exhibitorRequests.some(item => item.standId === stand.id);

                  return (
                    <div key={stand.id} className="flex items-center justify-between gap-2 py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{stand.code} · €{stand.area.toLocaleString("en-GB")} M</p>
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
            <h2 className="font-semibold text-foreground mb-4">Services included</h2>
            <div className="space-y-2">
              {services.map(s => (
                <div key={s.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-foreground">{s.name}</span>
                  <span className={`text-xs font-medium ${s.status === 'Contracted' || s.status === 'Confirmed' || s.status === 'Included' ? 'text-status-approved' : 'text-status-pending'}`}>
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
              <h2 className="font-semibold text-foreground">Key dates</h2>
            </div>
            <div className="space-y-3">
              {dates.map(d => (
                <div key={d.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{d.label}</p>
                    <p className="text-xs text-muted-foreground">{d.date}</p>
                  </div>
                  <span className={`text-xs ${d.status === 'Confirmed' ? 'text-status-approved' : 'text-status-pending'}`}>
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
              <h2 className="font-semibold text-foreground">Documents</h2>
            </div>
            <div className="space-y-2">
              {[
                'Investor handbook',
                `Latest rebalance · ${currentVersion?.label || ''}`.trim(),
                'Risk policy and limits',
                'Subscription / redemption terms',
              ].map(doc => (
                <button key={doc} className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm text-primary">
                  {doc}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="bg-card rounded-lg border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-foreground">Relationship manager</h2>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-foreground">{assignment.commercialContact.name}</p>
              <p className="text-xs text-muted-foreground">Portfolio manager</p>
              <p className="text-xs text-primary">{assignment.commercialContact.email}</p>
              <p className="text-xs text-muted-foreground">{assignment.commercialContact.phone}</p>
            </div>
            <button className="w-full mt-4 px-3 py-2 border border-primary text-primary rounded-md text-xs font-medium hover:bg-primary/10 transition-colors">
              <span className="inline-flex items-center gap-1.5"><Send className="h-3.5 w-3.5" /> Send enquiry</span>
            </button>
          </div>

          {/* Alerts */}
          <div className="bg-status-pending/10 border border-status-pending/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-status-pending mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-foreground">Action required</p>
                <p className="text-xs text-muted-foreground mt-1">Confirm ESG disclosure preferences before next NAV cut-off.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
