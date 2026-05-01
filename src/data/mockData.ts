// ============ TYPES ============
// PortfolioMap — 3D portfolio & exposure visualizer
// Internal type names (User, Stand, Fair, Venue, Booking) are preserved for
// backwards compatibility with the 3D viewer and API simulation. Their
// semantic meaning has shifted:
//   Venue   → Mandate            (Equity, Fixed Income, Multi-Asset, Alternatives)
//   Fair    → Portfolio          (a managed strategy within a mandate)
//   Stand   → Position / Holding (an individual asset in the portfolio)
//   Booking → Trade order        (pending allocation request)
// Status enums are reused: status values map to position / order states.

export type UserRole = 'admin' | 'architect' | 'commercial' | 'organizer' | 'exhibitor' | 'viewer';
// Position states: available = "Open exposure", pending = "Pending settlement", reserved = "Active position"
export type StandStatus = 'available' | 'pending' | 'reserved';
// Trade-order states: available = "Rejected", pending = "Pending compliance", reserved = "Filled"
export type BookingStatus = 'available' | 'pending' | 'reserved';
// Portfolio lifecycle: planificación = "Pre-launch", comercialización = "Subscriptions open", en_curso = "Live", finalizada = "Closed"
export type FairStatus = 'planificación' | 'comercialización' | 'en_curso' | 'finalizada';
// Rebalance state: draft = "Working rebalance", published = "Approved rebalance"
export type FairVersionStatus = 'draft' | 'published';

export type AssetClass = 'Equity' | 'Bond' | 'ETF' | 'Derivative' | 'Cash';
export type AssetGeography = 'Europe' | 'North America' | 'APAC' | 'Emerging' | 'Global';
export type RiskScore = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  avatar?: string;
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  area: number;
  pavilions: number;
  description: string;
  fairCount: number;
}

export interface FairVersion {
  id: string;
  fairId: string;
  label: string;
  status: FairVersionStatus;
  createdAt: string;
  updatedAt?: string;
  rowVersion?: number;
  createdBy: string;
  updatedBy?: string;
  summary: string;
  basedOnVersionId?: string;
  basePublishedId?: string;
  occupancySnapshot: number;
  standsSnapshot: number;
  pendingSnapshot: number;
}

export type FairRealtimeEventType =
  | 'version.draft_saved'
  | 'version.commercial_draft_saved'
  | 'version.published'
  | 'stand.updated'
  | 'booking.created'
  | 'booking.updated';

export interface FairRealtimeEvent {
  fairId: string;
  type: FairRealtimeEventType;
  at: string;
  payload: Record<string, string | number | boolean | null | undefined>;
}

export interface SaveVersionRequest {
  fairId: string;
  versionId: string;
  actorName: string;
  summary?: string;
  expectedRowVersion?: number;
}

export interface VersionMutationResult {
  ok: boolean;
  conflict?: boolean;
  reason?: string;
  version?: FairVersion;
  expectedRowVersion?: number;
  actualRowVersion?: number;
}

export interface Fair {
  id: string;
  name: string;
  edition: string;
  startDate: string;
  endDate: string;
  venueId: string;
  venueName: string;
  status: FairStatus;
  occupancy: number;
  totalStands: number;
  freeStands: number;
  reservedStands: number;
  pendingReservations: number;
  responsible: string;
  lastActivity: string;
  currentVersionId: string;
  versions: FairVersion[];
}

export interface Stand {
  // Identifier and 3D scene fields (legacy, preserved for the visualizer)
  id: string;
  code: string;          // Repurposed as the asset ticker (AAPL, ASML, ...)
  fairId: string;        // Portfolio ID
  x: number;
  y: number;
  width: number;
  height: number;
  status: StandStatus;   // Position state — see StandStatus comments
  type: string;          // Repurposed as AssetClass
  area: number;          // Repurposed as exposure in M€ (millions of euro)
  company?: string;      // Repurposed as issuer / asset legal name
  price?: number;        // Repurposed as last traded price in EUR
  zone: string;          // Repurposed as sector
  notes?: string;
  // Fintech-specific fields (new)
  ticker?: string;
  assetClass?: AssetClass;
  sector?: string;
  geography?: AssetGeography;
  weight?: number;       // % of portfolio
  exposure?: number;     // EUR
  pnlAbs?: number;       // EUR
  pnlPct?: number;       // %
  riskScore?: RiskScore;
  lastPriceEUR?: number;
  currency?: string;
}

export interface Booking {
  id: string;
  standCode: string;
  standId: string;
  fairId: string;
  fairName: string;
  company: string;
  requester: string;
  requesterRole: UserRole;
  date: string;
  status: BookingStatus;
  validators: string[];
  comments: string;
  risk?: string;
}

export interface ActivityItem {
  id: string;
  user: string;
  role: UserRole;
  action: string;
  target: string;
  date: string;
  type: 'reservation' | 'plan' | 'user' | 'approval' | 'conflict';
}

export interface ExhibitorAssignment {
  userId: string;
  fairId: string;
  companyName: string;
  primaryStandId?: string;
  commercialContact: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface OrganizerAssignment {
  userId: string;
  fairId: string;
  title: string;
}

// ============ MOCK DATA ============

// Roles map to fintech personas:
//   admin     → Head of Investment / CIO
//   architect → Risk Analyst (mandate construction & rebalances)
//   commercial → Portfolio Manager (trade execution)
//   organizer → Compliance / Audit
//   exhibitor → Beneficiary (read-only client portal)
//   viewer    → External Auditor / read-only

export const currentUser: User = {
  id: 'u1',
  name: 'Maria Garcia',
  email: 'maria.garcia@portfoliomap.io',
  role: 'admin',
  company: 'PortfolioMap Capital',
};

export const users: User[] = [
  currentUser,
  { id: 'u2', name: 'Carlos Ruiz',     email: 'carlos.ruiz@portfoliomap.io',    role: 'architect',  company: 'PortfolioMap Capital' },
  { id: 'u3', name: 'Ana Lopez',       email: 'ana.lopez@portfoliomap.io',      role: 'commercial', company: 'PortfolioMap Capital' },
  { id: 'u4', name: 'Pedro Martin',    email: 'pedro.martin@portfoliomap.io',   role: 'commercial', company: 'PortfolioMap Capital' },
  { id: 'u5', name: 'Laura Sanchez',   email: 'laura.sanchez@cliente.com',      role: 'exhibitor',  company: 'Sanchez Family Office' },
  { id: 'u6', name: 'Jorge Fernandez', email: 'jorge.fernandez@portfoliomap.io', role: 'viewer',    company: 'KPMG Audit' },
  { id: 'u7', name: 'Isabel Torres',   email: 'isabel.torres@portfoliomap.io',  role: 'architect',  company: 'PortfolioMap Capital' },
  { id: 'u8', name: 'Marta Romero',    email: 'marta.romero@portfoliomap.io',   role: 'organizer',  company: 'PortfolioMap Capital' },
];

// Mandates (top-level grouping). `area` carries AUM in M€, `pavilions` carries the
// number of strategies (sleeves) under that mandate, `fairCount` the number of
// active portfolios.
export const venues: Venue[] = [
  { id: 'v1', name: 'Multi-Asset Strategic',     location: 'Madrid, Spain',     area: 1200, pavilions: 4, description: 'Flagship multi-asset mandate with global exposure across equities, fixed income, ETFs and hedging overlays. 1.2 B€ AUM.', fairCount: 1 },
  { id: 'v2', name: 'European Equity Mandate',   location: 'Frankfurt, Germany', area: 420,  pavilions: 3, description: 'Concentrated long-only European equity book, focused on quality compounders and selected dividend names.', fairCount: 1 },
  { id: 'v3', name: 'Fixed Income Mandate',      location: 'London, United Kingdom', area: 480, pavilions: 4, description: 'Multi-strategy fixed income book covering sovereigns, IG credit, EM hard-currency debt and short-duration cash management.', fairCount: 2 },
  { id: 'v4', name: 'Alternatives & Hedging',    location: 'Luxembourg',        area: 280,  pavilions: 3, description: 'Tactical hedging overlay using FX forwards, equity index futures, options and credit derivatives. Notional 280 M€.', fairCount: 2 },
];

// Portfolios. Each "fair" represents a managed strategy.
// occupancy = invested ratio (%), totalStands = number of holdings,
// reservedStands = active positions, freeStands = dry-powder slots,
// pendingReservations = pending compliance trades.
// Versions = rebalances (draft = working rebalance, published = approved snapshot).
export const fairs: Fair[] = [
  {
    id: 'f1',
    name: 'Master Multi-Asset Fund',
    edition: 'Live · 2026',
    startDate: '2024-01-15',
    endDate: '2030-12-31',
    venueId: 'v1',
    venueName: 'Multi-Asset Strategic',
    status: 'en_curso',
    occupancy: 87,
    totalStands: 45,
    freeStands: 6,
    reservedStands: 35,
    pendingReservations: 4,
    responsible: 'Ana Lopez',
    lastActivity: '2026-03-11T09:30:00',
    currentVersionId: 'v-f1-4',
    versions: [
      { id: 'v-f1-1',     fairId: 'f1', label: 'Inception v1.0',        status: 'published', createdAt: '2024-01-15T10:15:00',                                       createdBy: 'Carlos Ruiz',   summary: 'Initial portfolio construction. NAV anchored at 100. 28 holdings across 4 asset classes.',                                                       occupancySnapshot: 72, standsSnapshot: 28, pendingSnapshot: 4 },
      { id: 'v-f1-2',     fairId: 'f1', label: 'Q3-2025 rebalance',     status: 'published', createdAt: '2025-09-15T12:00:00',                                       createdBy: 'Carlos Ruiz',   summary: 'Reduced US tech exposure by 4 pts. Added EM debt (BRZ30, MEX32) and EUR cash buffer.',          basedOnVersionId: 'v-f1-1', basePublishedId: 'v-f1-1', occupancySnapshot: 81, standsSnapshot: 38, pendingSnapshot: 6 },
      { id: 'v-f1-3',     fairId: 'f1', label: 'Q4-2025 rebalance',     status: 'published', createdAt: '2025-12-18T09:20:00',                                       createdBy: 'Isabel Torres', summary: 'Hedged FX exposure with EURUSD 3M FWD. Trimmed TSMC after run-up. Added LVMH overweight.',      basedOnVersionId: 'v-f1-2', basePublishedId: 'v-f1-2', occupancySnapshot: 84, standsSnapshot: 42, pendingSnapshot: 5 },
      { id: 'v-f1-4',     fairId: 'f1', label: 'Q1-2026 rebalance',     status: 'published', createdAt: '2026-03-04T11:15:00',                                       createdBy: 'Carlos Ruiz',   summary: 'Initiated DAX put protection. Increased Bund 10Y. Active book at 87% invested, 6.5% dry-powder.', basedOnVersionId: 'v-f1-3', basePublishedId: 'v-f1-3', occupancySnapshot: 87, standsSnapshot: 45, pendingSnapshot: 4 },
      { id: 'v-f1-draft', fairId: 'f1', label: 'Working draft Q2-2026', status: 'draft',     createdAt: '2026-03-11T09:30:00', updatedAt: '2026-03-11T09:30:00', rowVersion: 1, createdBy: 'Carlos Ruiz', summary: 'Sizing up Healthcare overweight (NOVN, AZN). Pending compliance review of EM cap.',           basedOnVersionId: 'v-f1-4', basePublishedId: 'v-f1-4', occupancySnapshot: 87, standsSnapshot: 45, pendingSnapshot: 4 },
    ]
  },
  {
    id: 'f2',
    name: 'European Quality Equity',
    edition: 'Live · 2026',
    startDate: '2024-04-01',
    endDate: '2030-12-31',
    venueId: 'v2',
    venueName: 'European Equity Mandate',
    status: 'en_curso',
    occupancy: 72,
    totalStands: 22,
    freeStands: 6,
    reservedStands: 16,
    pendingReservations: 2,
    responsible: 'Pedro Martin',
    lastActivity: '2026-03-09T11:00:00',
    currentVersionId: 'v-f2-1',
    versions: [
      { id: 'v-f2-1', fairId: 'f2', label: 'Q1-2026 rebalance', status: 'published', createdAt: '2026-02-20T11:00:00', updatedAt: '2026-02-20T11:00:00', rowVersion: 2, createdBy: 'Pedro Martin', summary: 'Initiated NESN, MC, ASML overweights. Trimmed BBVA on bank-credit risk.', occupancySnapshot: 72, standsSnapshot: 22, pendingSnapshot: 2 },
    ]
  },
  {
    id: 'f3',
    name: 'Sovereign & IG Credit',
    edition: 'Live · 2026',
    startDate: '2023-06-01',
    endDate: '2030-12-31',
    venueId: 'v3',
    venueName: 'Fixed Income Mandate',
    status: 'en_curso',
    occupancy: 94,
    totalStands: 32,
    freeStands: 2,
    reservedStands: 30,
    pendingReservations: 1,
    responsible: 'Isabel Torres',
    lastActivity: '2026-03-10T08:15:00',
    currentVersionId: 'v-f3-3',
    versions: [
      { id: 'v-f3-1', fairId: 'f3', label: 'Inception v1.0',     status: 'published', createdAt: '2023-06-12T10:00:00',                                       createdBy: 'Isabel Torres', summary: 'Inception book: 60% sovereigns, 40% IG corporates. Duration 6.2y.',                                                                  occupancySnapshot: 90, standsSnapshot: 24, pendingSnapshot: 1 },
      { id: 'v-f3-2', fairId: 'f3', label: 'Duration extension', status: 'published', createdAt: '2025-09-22T09:35:00',                                       createdBy: 'Carlos Ruiz',   summary: 'Extended duration to 7.4y on hold-to-maturity sovereigns. Added 30Y Bund.',  basedOnVersionId: 'v-f3-1', basePublishedId: 'v-f3-1', occupancySnapshot: 92, standsSnapshot: 28, pendingSnapshot: 2 },
      { id: 'v-f3-3', fairId: 'f3', label: 'Q1-2026 rebalance',  status: 'published', createdAt: '2026-02-15T08:05:00',                                       createdBy: 'Carlos Ruiz',   summary: 'Trimmed BBB IG (1.5%). Added US 5Y Treasury. Carry budget 4.1%.',           basedOnVersionId: 'v-f3-2', basePublishedId: 'v-f3-2', occupancySnapshot: 94, standsSnapshot: 32, pendingSnapshot: 1 },
    ]
  },
  {
    id: 'f4',
    name: 'EM Debt Tactical',
    edition: 'Pre-launch · 2026',
    startDate: '2026-04-01',
    endDate: '2030-12-31',
    venueId: 'v3',
    venueName: 'Fixed Income Mandate',
    status: 'planificación',
    occupancy: 0,
    totalStands: 12,
    freeStands: 12,
    reservedStands: 0,
    pendingReservations: 3,
    responsible: 'Pedro Martin',
    lastActivity: '2026-03-08T11:00:00',
    currentVersionId: 'v-f4-1',
    versions: [
      { id: 'v-f4-1', fairId: 'f4', label: 'Working draft', status: 'draft', createdAt: '2026-03-08T11:00:00', updatedAt: '2026-03-08T11:00:00', rowVersion: 1, createdBy: 'Pedro Martin', summary: 'Pre-launch sizing. Initial seed 120 M€ across 12 EM hard-currency sovereigns.', occupancySnapshot: 0, standsSnapshot: 12, pendingSnapshot: 3 },
    ]
  },
  {
    id: 'f5',
    name: 'Tactical Hedging Overlay',
    edition: 'Live · 2026',
    startDate: '2025-01-15',
    endDate: '2030-12-31',
    venueId: 'v4',
    venueName: 'Alternatives & Hedging',
    status: 'en_curso',
    occupancy: 100,
    totalStands: 8,
    freeStands: 0,
    reservedStands: 8,
    pendingReservations: 1,
    responsible: 'Carlos Ruiz',
    lastActivity: '2026-03-10T14:30:00',
    currentVersionId: 'v-f5-2',
    versions: [
      { id: 'v-f5-1', fairId: 'f5', label: 'Inception v1.0',    status: 'published', createdAt: '2025-01-15T13:40:00',                                       createdBy: 'Carlos Ruiz', summary: 'Initial hedging book: EURUSD 3M FWD, S&P 500 short futures, iTraxx CDX.',                                                  occupancySnapshot: 100, standsSnapshot: 6, pendingSnapshot: 0 },
      { id: 'v-f5-2', fairId: 'f5', label: 'Q1-2026 rebalance', status: 'published', createdAt: '2026-03-03T14:30:00',                                       createdBy: 'Carlos Ruiz', summary: 'Added DAX 16500 put for downside protection. Re-rolled FX hedge to 6M.',  basedOnVersionId: 'v-f5-1', basePublishedId: 'v-f5-1', occupancySnapshot: 100, standsSnapshot: 8, pendingSnapshot: 1 },
    ]
  },
  {
    id: 'f6',
    name: 'Multi-Sector Yield (closed)',
    edition: 'Wound down · 2025',
    startDate: '2022-01-15',
    endDate: '2025-12-31',
    venueId: 'v3',
    venueName: 'Fixed Income Mandate',
    status: 'finalizada',
    occupancy: 0,
    totalStands: 18,
    freeStands: 0,
    reservedStands: 0,
    pendingReservations: 0,
    responsible: 'Maria Garcia',
    lastActivity: '2025-12-31T16:00:00',
    currentVersionId: 'v-f6-1',
    versions: [
      { id: 'v-f6-1', fairId: 'f6', label: 'Final NAV', status: 'published', createdAt: '2025-12-31T16:00:00', createdBy: 'Maria Garcia', summary: 'Book wound down. Final TWR +14.2% over 4 years. All capital returned to investors.', occupancySnapshot: 0, standsSnapshot: 18, pendingSnapshot: 0 },
    ]
  },
];

// 45 holdings of the Master Multi-Asset Fund (f1).
// Total weight ≈ 100%, total exposure ≈ 1.2 B€.
// 3D layout: 5 rows on a 9-col grid (row 0 has 8, rows 1–3 have 9, row 4 has 10 = 45).
// 3D color is driven by riskScore (low/medium/high → green/amber/red).
// `status` reflects position lifecycle: reserved=Active, pending=Pending settlement, available=Closed.
interface AssetSeed {
  ticker: string;
  name: string;
  assetClass: AssetClass;
  sector: string;
  geography: AssetGeography;
  weight: number;       // % of portfolio (sums to ~100)
  pnlPct: number;       // unrealized P&L %
  riskScore: RiskScore;
  lastPriceEUR: number; // last reference price (EUR equivalent for non-EUR books)
  currency: string;
  status: StandStatus;
}

const assetSeeds: AssetSeed[] = [
  // Row 0 — Top 8 exposures (>4% each)
  { ticker: 'AAPL',     name: 'Apple Inc',                       assetClass: 'Equity',     sector: 'Technology',     geography: 'North America', weight: 6.0, pnlPct:   4.20, riskScore: 'medium', lastPriceEUR:  214.50, currency: 'USD', status: 'reserved' },
  { ticker: 'MSFT',     name: 'Microsoft Corp',                  assetClass: 'Equity',     sector: 'Technology',     geography: 'North America', weight: 5.7, pnlPct:   6.10, riskScore: 'low',    lastPriceEUR:  378.20, currency: 'USD', status: 'reserved' },
  { ticker: 'ASML',     name: 'ASML Holding NV',                 assetClass: 'Equity',     sector: 'Technology',     geography: 'Europe',        weight: 5.4, pnlPct:  -2.30, riskScore: 'medium', lastPriceEUR:  692.30, currency: 'EUR', status: 'reserved' },
  { ticker: 'UST10Y',   name: 'US Treasury 3.5% 2034',           assetClass: 'Bond',       sector: 'Sovereign',      geography: 'North America', weight: 5.4, pnlPct:   1.20, riskScore: 'low',    lastPriceEUR:   99.45, currency: 'USD', status: 'reserved' },
  { ticker: 'AGG',      name: 'iShares Core US Aggregate Bond',  assetClass: 'ETF',        sector: 'Fixed Income',   geography: 'North America', weight: 4.9, pnlPct:   0.80, riskScore: 'low',    lastPriceEUR:   95.10, currency: 'USD', status: 'reserved' },
  { ticker: 'VTI',      name: 'Vanguard Total US Market ETF',    assetClass: 'ETF',        sector: 'Diversified',    geography: 'North America', weight: 5.0, pnlPct:   3.40, riskScore: 'low',    lastPriceEUR:  240.10, currency: 'USD', status: 'reserved' },
  { ticker: 'NVDA',     name: 'Nvidia Corp',                     assetClass: 'Equity',     sector: 'Technology',     geography: 'North America', weight: 4.2, pnlPct:  12.80, riskScore: 'high',   lastPriceEUR:  870.40, currency: 'USD', status: 'reserved' },
  { ticker: 'DE10Y',    name: 'German Bund 2.4% 2034',           assetClass: 'Bond',       sector: 'Sovereign',      geography: 'Europe',        weight: 4.5, pnlPct:   0.50, riskScore: 'low',    lastPriceEUR:  102.30, currency: 'EUR', status: 'reserved' },
  // Row 1 — European core equities
  { ticker: 'LVMH',     name: 'LVMH Moet Hennessy',              assetClass: 'Equity',     sector: 'Consumer',       geography: 'Europe',        weight: 3.7, pnlPct:   2.10, riskScore: 'medium', lastPriceEUR:  685.40, currency: 'EUR', status: 'reserved' },
  { ticker: 'SAP',      name: 'SAP SE',                          assetClass: 'Equity',     sector: 'Technology',     geography: 'Europe',        weight: 3.2, pnlPct:   4.50, riskScore: 'low',    lastPriceEUR:  195.20, currency: 'EUR', status: 'reserved' },
  { ticker: 'BRK.B',    name: 'Berkshire Hathaway B',            assetClass: 'Equity',     sector: 'Financials',     geography: 'North America', weight: 2.1, pnlPct:   3.90, riskScore: 'low',    lastPriceEUR:  379.80, currency: 'USD', status: 'reserved' },
  { ticker: 'IBE',      name: 'Iberdrola SA',                    assetClass: 'Equity',     sector: 'Utilities',      geography: 'Europe',        weight: 2.0, pnlPct:   1.80, riskScore: 'low',    lastPriceEUR:   12.50, currency: 'EUR', status: 'reserved' },
  { ticker: 'SIE',      name: 'Siemens AG',                      assetClass: 'Equity',     sector: 'Industrials',    geography: 'Europe',        weight: 1.9, pnlPct:  -1.40, riskScore: 'medium', lastPriceEUR:  174.50, currency: 'EUR', status: 'reserved' },
  { ticker: 'ITX',      name: 'Inditex SA',                      assetClass: 'Equity',     sector: 'Consumer',       geography: 'Europe',        weight: 1.7, pnlPct:   5.20, riskScore: 'medium', lastPriceEUR:   48.90, currency: 'EUR', status: 'reserved' },
  { ticker: 'SAN',      name: 'Banco Santander',                 assetClass: 'Equity',     sector: 'Financials',     geography: 'Europe',        weight: 1.5, pnlPct:   7.80, riskScore: 'medium', lastPriceEUR:    4.85, currency: 'EUR', status: 'reserved' },
  { ticker: 'BBVA',     name: 'Banco Bilbao Vizcaya Argentaria', assetClass: 'Equity',     sector: 'Financials',     geography: 'Europe',        weight: 1.4, pnlPct:   9.20, riskScore: 'medium', lastPriceEUR:    9.20, currency: 'EUR', status: 'reserved' },
  { ticker: 'TEF',      name: 'Telefonica SA',                   assetClass: 'Equity',     sector: 'Communications', geography: 'Europe',        weight: 1.3, pnlPct:  -3.10, riskScore: 'high',   lastPriceEUR:    4.10, currency: 'EUR', status: 'reserved' },
  // Row 2 — Healthcare, EM equities, recent trades
  { ticker: 'NOVN',     name: 'Novartis AG',                     assetClass: 'Equity',     sector: 'Healthcare',     geography: 'Europe',        weight: 1.3, pnlPct:   2.40, riskScore: 'low',    lastPriceEUR:   92.10, currency: 'CHF', status: 'pending'  },
  { ticker: 'AZN',      name: 'AstraZeneca PLC',                 assetClass: 'Equity',     sector: 'Healthcare',     geography: 'Europe',        weight: 1.2, pnlPct:   3.10, riskScore: 'low',    lastPriceEUR:  135.80, currency: 'GBP', status: 'pending'  },
  { ticker: 'TSM',      name: 'Taiwan Semiconductor ADR',        assetClass: 'Equity',     sector: 'Technology',     geography: 'APAC',          weight: 1.2, pnlPct:   8.40, riskScore: 'medium', lastPriceEUR:  142.30, currency: 'USD', status: 'reserved' },
  { ticker: 'REP',      name: 'Repsol SA',                       assetClass: 'Equity',     sector: 'Energy',         geography: 'Europe',        weight: 1.1, pnlPct:  -4.60, riskScore: 'high',   lastPriceEUR:   13.45, currency: 'EUR', status: 'reserved' },
  { ticker: 'VALE',     name: 'Vale SA ADR',                     assetClass: 'Equity',     sector: 'Materials',      geography: 'Emerging',      weight: 1.0, pnlPct:  -8.20, riskScore: 'high',   lastPriceEUR:    9.80, currency: 'USD', status: 'reserved' },
  { ticker: 'JPM',      name: 'JPMorgan Chase',                  assetClass: 'Equity',     sector: 'Financials',     geography: 'North America', weight: 2.5, pnlPct:   5.60, riskScore: 'medium', lastPriceEUR:  195.20, currency: 'USD', status: 'reserved' },
  { ticker: 'MEX32',    name: 'United Mexican States 4% 2032',   assetClass: 'Bond',       sector: 'Sovereign EM',   geography: 'Emerging',      weight: 0.9, pnlPct:  -1.90, riskScore: 'medium', lastPriceEUR:   89.50, currency: 'USD', status: 'reserved' },
  { ticker: 'BRZ30',    name: 'Brazil Sovereign 3.875% 2030',    assetClass: 'Bond',       sector: 'Sovereign EM',   geography: 'Emerging',      weight: 1.1, pnlPct:   2.30, riskScore: 'high',   lastPriceEUR:   87.20, currency: 'USD', status: 'reserved' },
  { ticker: 'F28',      name: 'Ford Motor Co 4.75% 2028',        assetClass: 'Bond',       sector: 'Corporate HY',   geography: 'North America', weight: 0.8, pnlPct:  -0.50, riskScore: 'high',   lastPriceEUR:   92.30, currency: 'USD', status: 'pending'  },
  // Row 3 — Diversified ETFs and IG corporate credit
  { ticker: 'VEA',      name: 'Vanguard FTSE Developed Markets', assetClass: 'ETF',        sector: 'Diversified',    geography: 'Europe',        weight: 3.0, pnlPct:   2.10, riskScore: 'low',    lastPriceEUR:   50.40, currency: 'USD', status: 'reserved' },
  { ticker: 'IEFA',     name: 'iShares Core MSCI EAFE',          assetClass: 'ETF',        sector: 'Diversified',    geography: 'Europe',        weight: 2.3, pnlPct:   1.80, riskScore: 'low',    lastPriceEUR:   74.80, currency: 'USD', status: 'reserved' },
  { ticker: 'LQD',      name: 'iShares iBoxx IG Corp Bond',      assetClass: 'ETF',        sector: 'Fixed Income',   geography: 'North America', weight: 1.8, pnlPct:   0.40, riskScore: 'low',    lastPriceEUR:  105.20, currency: 'USD', status: 'reserved' },
  { ticker: 'AAPL30',   name: 'Apple 3.25% 2030',                assetClass: 'Bond',       sector: 'Corporate IG',   geography: 'North America', weight: 2.2, pnlPct:   0.90, riskScore: 'low',    lastPriceEUR:   96.50, currency: 'USD', status: 'reserved' },
  { ticker: 'BBVA28',   name: 'BBVA Senior 4.5% 2028',           assetClass: 'Bond',       sector: 'Corporate IG',   geography: 'Europe',        weight: 1.6, pnlPct:   1.10, riskScore: 'medium', lastPriceEUR:   98.20, currency: 'EUR', status: 'reserved' },
  { ticker: 'IBE31',    name: 'Iberdrola Green 1.5% 2031',       assetClass: 'Bond',       sector: 'Corporate IG',   geography: 'Europe',        weight: 1.0, pnlPct:   1.40, riskScore: 'low',    lastPriceEUR:   99.80, currency: 'EUR', status: 'reserved' },
  { ticker: 'TEF28',    name: 'Telefonica 1.788% 2028',          assetClass: 'Bond',       sector: 'Corporate IG',   geography: 'Europe',        weight: 1.0, pnlPct:  -0.30, riskScore: 'medium', lastPriceEUR:   97.40, currency: 'EUR', status: 'reserved' },
  { ticker: 'RENO27',   name: 'Renault SA 1% 2027',              assetClass: 'Bond',       sector: 'Corporate HY',   geography: 'Europe',        weight: 0.7, pnlPct:   0.20, riskScore: 'high',   lastPriceEUR:   95.10, currency: 'EUR', status: 'available' },
  { ticker: 'UST5Y',    name: 'US Treasury 3.875% 2029',         assetClass: 'Bond',       sector: 'Sovereign',      geography: 'North America', weight: 2.5, pnlPct:   1.40, riskScore: 'low',    lastPriceEUR:  100.20, currency: 'USD', status: 'reserved' },
  // Row 4 — Hedging, short-duration sovereigns, cash, EM ETFs
  { ticker: 'EURUSD3M', name: 'EUR/USD Forward 3M',              assetClass: 'Derivative', sector: 'FX Hedge',       geography: 'Global',        weight: 1.8, pnlPct:   0.80, riskScore: 'medium', lastPriceEUR:    1.085, currency: 'EUR', status: 'reserved' },
  { ticker: 'ESM4',     name: 'S&P 500 E-mini Future Dec',       assetClass: 'Derivative', sector: 'Equity Hedge',   geography: 'North America', weight: 1.8, pnlPct:   3.20, riskScore: 'high',   lastPriceEUR: 5210.00, currency: 'USD', status: 'reserved' },
  { ticker: 'DAXPUT',   name: 'DAX 16500 Put 6M',                assetClass: 'Derivative', sector: 'Equity Hedge',   geography: 'Europe',        weight: 0.8, pnlPct: -12.50, riskScore: 'high',   lastPriceEUR:  145.00, currency: 'EUR', status: 'reserved' },
  { ticker: 'ITRAXX',   name: 'iTraxx Crossover CDS 5Y',         assetClass: 'Derivative', sector: 'Credit Hedge',   geography: 'Europe',        weight: 0.6, pnlPct:  -2.10, riskScore: 'high',   lastPriceEUR:  380.00, currency: 'EUR', status: 'reserved' },
  { ticker: 'UST3M',    name: 'US T-Bill 3M',                    assetClass: 'Bond',       sector: 'Sovereign',      geography: 'North America', weight: 1.5, pnlPct:   0.90, riskScore: 'low',    lastPriceEUR:   99.70, currency: 'USD', status: 'reserved' },
  { ticker: 'DE5Y',     name: 'German Bund 2.1% 2029',           assetClass: 'Bond',       sector: 'Sovereign',      geography: 'Europe',        weight: 1.0, pnlPct:   0.40, riskScore: 'low',    lastPriceEUR:  101.50, currency: 'EUR', status: 'reserved' },
  { ticker: 'EURCASH',  name: 'EUR Cash & Equivalents',          assetClass: 'Cash',       sector: 'Liquidity',      geography: 'Europe',        weight: 2.3, pnlPct:   0.00, riskScore: 'low',    lastPriceEUR:    1.00, currency: 'EUR', status: 'reserved' },
  { ticker: 'USDMM',    name: 'USD Money Market',                assetClass: 'Cash',       sector: 'Liquidity',      geography: 'North America', weight: 1.6, pnlPct:   0.00, riskScore: 'low',    lastPriceEUR:    1.00, currency: 'USD', status: 'reserved' },
  { ticker: 'VWO',      name: 'Vanguard FTSE EM ETF',            assetClass: 'ETF',        sector: 'Diversified',    geography: 'Emerging',      weight: 0.9, pnlPct:   4.10, riskScore: 'medium', lastPriceEUR:   44.80, currency: 'USD', status: 'available' },
  { ticker: 'IEMG',     name: 'iShares Core MSCI EM',            assetClass: 'ETF',        sector: 'Diversified',    geography: 'Emerging',      weight: 0.7, pnlPct:   3.80, riskScore: 'medium', lastPriceEUR:   53.40, currency: 'USD', status: 'available' },
];

const PORTFOLIO_AUM_EUR = 1_200_000_000;        // 1.2 B€
const ROW_COLS = [8, 9, 9, 9, 10] as const;     // 8 + 9 + 9 + 9 + 10 = 45

export const stands: Stand[] = (() => {
  const out: Stand[] = [];
  let cursor = 0;
  for (let rowIdx = 0; rowIdx < ROW_COLS.length; rowIdx++) {
    const cols = ROW_COLS[rowIdx];
    for (let col = 0; col < cols; col++) {
      const seed = assetSeeds[cursor];
      const exposure = (seed.weight / 100) * PORTFOLIO_AUM_EUR;
      const exposureM = Math.round(exposure / 100_000) / 10;          // M€ with 1 decimal
      const pnlAbs = Math.round(exposure * (seed.pnlPct / 100));
      out.push({
        id: `s${cursor + 1}`,
        code: seed.ticker,
        fairId: 'f1',
        x: 60 + col * 105,
        y: 60 + rowIdx * 95,
        width: 90,
        height: 75,
        status: seed.status,
        type: seed.assetClass,
        area: exposureM,
        company: seed.name,
        price: seed.lastPriceEUR,
        zone: seed.sector,
        ticker: seed.ticker,
        assetClass: seed.assetClass,
        sector: seed.sector,
        geography: seed.geography,
        weight: seed.weight,
        exposure: Math.round(exposure),
        pnlAbs,
        pnlPct: seed.pnlPct,
        riskScore: seed.riskScore,
        lastPriceEUR: seed.lastPriceEUR,
        currency: seed.currency,
      });
      cursor++;
    }
  }
  return out;
})();

// Trade orders (was: bookings). status maps to order lifecycle:
//   pending  → awaiting compliance / pre-trade check
//   reserved → filled
//   available→ rejected / cancelled
export const bookings: Booking[] = [
  { id: 'r1', standCode: 'NOVN',    standId: 's17', fairId: 'f1', fairName: 'Master Multi-Asset Fund', company: 'Novartis AG',                   requester: 'Ana Lopez',    requesterRole: 'commercial', date: '2026-03-10', status: 'pending',  validators: ['Carlos Ruiz'],                 comments: 'BUY 16 M€. Healthcare overweight ahead of Q2 earnings season.',           risk: 'Sector concentration approaching 8% target' },
  { id: 'r2', standCode: 'AZN',     standId: 's18', fairId: 'f1', fairName: 'Master Multi-Asset Fund', company: 'AstraZeneca PLC',               requester: 'Ana Lopez',    requesterRole: 'commercial', date: '2026-03-09', status: 'pending',  validators: ['Carlos Ruiz'],                 comments: 'BUY 14 M€ as pair trade with NOVN. FX hedge included.' },
  { id: 'r3', standCode: 'NVDA',    standId: 's7',  fairId: 'f1', fairName: 'Master Multi-Asset Fund', company: 'Nvidia Corp',                   requester: 'Pedro Martin', requesterRole: 'commercial', date: '2026-03-08', status: 'reserved', validators: ['Carlos Ruiz', 'Maria Garcia'], comments: 'TRIM 8 M€ on profit-taking. Filled at €871.20 average.' },
  { id: 'r4', standCode: 'F28',     standId: 's26', fairId: 'f1', fairName: 'Master Multi-Asset Fund', company: 'Ford Motor Co 4.75% 2028',      requester: 'Ana Lopez',    requesterRole: 'commercial', date: '2026-03-07', status: 'pending',  validators: ['Carlos Ruiz'],                 comments: 'EXIT 9.6 M€ — credit deterioration, downgrade watch flagged by S&P.', risk: 'HY exposure above mandate cap' },
  { id: 'r5', standCode: 'VWO',     standId: 's44', fairId: 'f1', fairName: 'Master Multi-Asset Fund', company: 'Vanguard FTSE EM ETF',          requester: 'Pedro Martin', requesterRole: 'commercial', date: '2026-03-06', status: 'available', validators: ['Carlos Ruiz'],                comments: 'BUY rejected — EM allocation cap (3.0%) breached when combined with IEMG.' },
  { id: 'r6', standCode: 'TEF',     standId: 's16', fairId: 'f1', fairName: 'Master Multi-Asset Fund', company: 'Telefonica SA',                 requester: 'Ana Lopez',    requesterRole: 'commercial', date: '2026-03-05', status: 'pending',  validators: ['Carlos Ruiz'],                 comments: 'EXIT 15.6 M€ — counter-momentum, dividend coverage concern.',         risk: 'Counter-momentum, flagged by risk dashboard' },
  { id: 'r7', standCode: 'IEMG',    standId: 's45', fairId: 'f1', fairName: 'Master Multi-Asset Fund', company: 'iShares Core MSCI EM',          requester: 'Pedro Martin', requesterRole: 'commercial', date: '2026-03-11', status: 'pending',  validators: [],                              comments: 'New EM rotation request — 8.4 M€. Awaiting compliance assignment.' },
  { id: 'r8', standCode: 'JPM',     standId: 's23', fairId: 'f1', fairName: 'Master Multi-Asset Fund', company: 'JPMorgan Chase',                requester: 'Ana Lopez',    requesterRole: 'commercial', date: '2026-03-04', status: 'reserved', validators: ['Carlos Ruiz', 'Maria Garcia'], comments: 'BUY 30 M€ — financials overweight thesis. Filled at €195.10 average.' },
];

export const activities: ActivityItem[] = [
  { id: 'a1', user: 'Ana Lopez',     role: 'commercial', action: 'submitted BUY order for',         target: 'NOVN — 16 M€ — Master Multi-Asset Fund',                date: '2026-03-10T14:30:00', type: 'reservation' },
  { id: 'a2', user: 'Carlos Ruiz',   role: 'architect',  action: 'published Q1-2026 rebalance for', target: 'Master Multi-Asset Fund (87% invested, 6.5% dry-powder)', date: '2026-03-04T11:15:00', type: 'plan' },
  { id: 'a3', user: 'Maria Garcia',  role: 'admin',      action: 'approved trade execution for',   target: 'JPM — 30 M€ filled at €195.10',                          date: '2026-03-04T16:00:00', type: 'approval' },
  { id: 'a4', user: 'Pedro Martin',  role: 'commercial', action: 'opened EM rotation request for', target: 'IEMG — 8.4 M€ pending compliance',                       date: '2026-03-11T08:45:00', type: 'reservation' },
  { id: 'a5', user: 'Carlos Ruiz',   role: 'architect',  action: 'flagged concentration breach in', target: 'Telefonica — counter-momentum + HY risk score',          date: '2026-03-09T09:20:00', type: 'conflict' },
  { id: 'a6', user: 'Maria Garcia',  role: 'admin',      action: 'added',                          target: 'Isabel Torres as risk analyst on Sovereign & IG Credit',  date: '2026-03-08T15:00:00', type: 'user' },
  { id: 'a7', user: 'Carlos Ruiz',   role: 'architect',  action: 'rejected order for',             target: 'VWO BUY 10.8 M€ — EM cap breach (3.6% > 3.0%)',           date: '2026-03-07T12:30:00', type: 'approval' },
  { id: 'a8', user: 'Ana Lopez',     role: 'commercial', action: 'filed exit ticket for',          target: 'Ford 2028 HY — credit deterioration watch',               date: '2026-03-07T10:00:00', type: 'reservation' },
];

// Position lifecycle (was stand state):
//   available → "Closed" (position exited / slot empty)
//   pending   → "Pending" (trade pending settlement)
//   reserved  → "Active" (filled, in book)
export const standStatusLabels: Record<StandStatus, string> = {
  available: 'Closed',
  pending:   'Pending',
  reserved:  'Active',
};

// Trade-order lifecycle (was booking state):
export const bookingStatusLabels: Record<BookingStatus, string> = {
  available: 'Rejected',
  pending:   'Pending',
  reserved:  'Filled',
};

export const roleLabels: Record<UserRole, string> = {
  admin:      'Head of Investment',
  architect:  'Risk Analyst',
  commercial: 'Portfolio Manager',
  organizer:  'Compliance',
  exhibitor:  'Beneficiary',
  viewer:     'Auditor',
};

// Portfolio lifecycle:
export const fairStatusLabels: Record<FairStatus, string> = {
  planificación:    'Pre-launch',
  comercialización: 'Subscriptions open',
  en_curso:         'Live',
  finalizada:       'Closed',
};

// Rebalance lifecycle:
export const fairVersionStatusLabels: Record<FairVersionStatus, string> = {
  draft:            'Working draft',
  published:        'Approved',
  commercial_draft: 'Trading desk draft',
};

// ============ USER MANAGEMENT FUNCTIONS ============

let userIdCounter = users.length + 1;

export const addUser = (userData: Omit<User, 'id'>): User => {
  const newUser: User = {
    ...userData,
    id: `u${userIdCounter++}`,
  };
  users.push(newUser);
  return newUser;
};

export const updateUser = (id: string, userData: Partial<Omit<User, 'id'>>): User | null => {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;
  
  users[index] = { ...users[index], ...userData };
  return users[index];
};

export const deleteUser = (id: string): boolean => {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return false;
  
  users.splice(index, 1);
  return true;
};

// ============ FAIR MANAGEMENT FUNCTIONS ============

let fairIdCounter = fairs.length + 1;
let versionIdCounter = 100;

const fairRealtimeSubscribers = new Map<string, Set<(event: FairRealtimeEvent) => void>>();

const emitFairRealtime = (event: FairRealtimeEvent) => {
  const listeners = fairRealtimeSubscribers.get(event.fairId);
  if (!listeners || listeners.size === 0) return;

  listeners.forEach(listener => {
    listener(event);
  });
};

export const subscribeToFairRealtime = (
  fairId: string,
  listener: (event: FairRealtimeEvent) => void
) => {
  const listeners = fairRealtimeSubscribers.get(fairId) || new Set<(event: FairRealtimeEvent) => void>();
  listeners.add(listener);
  fairRealtimeSubscribers.set(fairId, listeners);

  return () => {
    const current = fairRealtimeSubscribers.get(fairId);
    if (!current) return;
    current.delete(listener);
    if (current.size === 0) {
      fairRealtimeSubscribers.delete(fairId);
    }
  };
};

export const addFair = (fairData: Omit<Fair, 'id' | 'currentVersionId' | 'lastActivity' | 'versions'>): Fair => {
  const now = new Date().toISOString();
  const newFairId = `f${fairIdCounter++}`;
  const newVersionId = `v-${newFairId}-1`;
  
  const newVersion: FairVersion = {
    id: newVersionId,
    fairId: newFairId,
    label: 'v1.0',
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    rowVersion: 1,
    createdBy: fairData.responsible,
    summary: 'Initial portfolio construction',
    occupancySnapshot: 0,
    standsSnapshot: fairData.totalStands,
    pendingSnapshot: 0,
  };
  
  const newFair: Fair = {
    ...fairData,
    id: newFairId,
    currentVersionId: newVersionId,
    lastActivity: now,
    versions: [newVersion],
  };
  
  fairs.push(newFair);
  
  return newFair;
};

export const updateFair = (id: string, fairData: Partial<Fair>): Fair | null => {
  const index = fairs.findIndex(f => f.id === id);
  if (index === -1) return null;
  
  fairs[index] = { 
    ...fairs[index], 
    ...fairData,
    lastActivity: new Date().toISOString() 
  };
  return fairs[index];
};

export const deleteFair = (id: string): boolean => {
  const index = fairs.findIndex(f => f.id === id);
  if (index === -1) return false;
  
  fairs.splice(index, 1);
  return true;
};

// ============ VENUE MANAGEMENT FUNCTIONS ============

export const addVenue = (venueData: Omit<Venue, 'id'>): Venue => {
  const newVenue: Venue = {
    ...venueData,
    id: `v${Date.now()}`,
  };
  venues.push(newVenue);
  return newVenue;
};

export const updateVenue = (id: string, venueData: Partial<Venue>): Venue | null => {
  const index = venues.findIndex(v => v.id === id);
  if (index === -1) return null;
  
  venues[index] = { ...venues[index], ...venueData };
  return venues[index];
};

export const exhibitorAssignments: ExhibitorAssignment[] = [
  {
    userId: 'u5',
    fairId: 'f1',
    companyName: 'Sanchez Family Office',
    primaryStandId: 's21',
    commercialContact: {
      name: 'Ana López',
      email: 'ana@flowspace.com',
      phone: '+34 600 123 456',
    },
  },
];

export const organizerAssignments: OrganizerAssignment[] = [
  {
    userId: 'u8',
    fairId: 'f1',
    title: 'Compliance oversight — Master Multi-Asset Fund',
  },
];

export const getFairVersions = (fairId: string) =>
  fairs.find(f => f.id === fairId)?.versions || [];

const getLatestPublishedVersionForFair = (fair: Fair): FairVersion | null => {
  const published = fair.versions
    .filter(v => v.status === 'published')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return published[0] || null;
};

const enforceSingleStatusVersion = (fair: Fair, status: Extract<FairVersionStatus, 'draft' | 'commercial_draft'>): FairVersion | null => {
  const matches = fair.versions
    .filter(v => v.status === status)
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

  if (matches.length === 0) return null;
  const [active, ...stale] = matches;
  if (stale.length > 0) {
    const staleIds = new Set(stale.map(v => v.id));
    fair.versions = fair.versions.filter(v => !staleIds.has(v.id));
  }

  return active;
};

export const getCurrentFairVersion = (fairId: string) => {
  const fair = fairs.find(f => f.id === fairId);
  if (!fair) return null;

  const byCurrentId = fair.versions.find(v => v.id === fair.currentVersionId);
  if (byCurrentId) return byCurrentId;

  return getLatestPublishedVersionForFair(fair) || fair.versions.find(v => v.status === 'draft') || null;
};

/** Returns the single draft for a fair, or null if none exists yet */
export const getFairDraft = (fairId: string): FairVersion | null => {
  const fair = fairs.find(f => f.id === fairId);
  if (!fair) return null;
  return enforceSingleStatusVersion(fair, 'draft');
};

export const getCommercialDraft = (fairId: string): FairVersion | null => {
  const fair = fairs.find(f => f.id === fairId);
  if (!fair) return null;
  return enforceSingleStatusVersion(fair, 'commercial_draft');
};

/** Returns all published versions sorted newest first */
export const getPublishedVersions = (fairId: string): FairVersion[] => {
  return getFairVersions(fairId)
    .filter(v => v.status === 'published')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * Ensures a draft exists for the fair.
 * If no draft exists, creates one as an exact copy of the latest published version.
 */
export const ensureDraftExists = (fairId: string): FairVersion | null => {
  const fair = fairs.find(f => f.id === fairId);
  if (!fair) return null;

  const existing = enforceSingleStatusVersion(fair, 'draft');
  if (existing) return existing;

  const lastPublished = getLatestPublishedVersionForFair(fair);

  if (!lastPublished) return null;

  const now = new Date().toISOString();

  const draft: FairVersion = {
    ...lastPublished,
    id: `v-${fairId}-${versionIdCounter++}`,
    status: 'draft',
    label: 'Draft técnico',
    createdAt: now,
    updatedAt: now,
    rowVersion: 1,
    basedOnVersionId: lastPublished.id,
    basePublishedId: lastPublished.id,
  };

  fair.versions.push(draft);
  return draft;
};

export const ensureCommercialDraftExists = (fairId: string): FairVersion | null => {
  const fair = fairs.find(f => f.id === fairId);
  if (!fair) return null;

  const existing = enforceSingleStatusVersion(fair, 'commercial_draft');
  if (existing) return existing;

  const lastPublished = getLatestPublishedVersionForFair(fair);
  if (!lastPublished) return null;

  const now = new Date().toISOString();

  const commercialDraft: FairVersion = {
    ...lastPublished,
    id: `v-${fairId}-cd-${versionIdCounter++}`,
    status: 'commercial_draft',
    label: 'Trading desk draft',
    createdAt: now,
    updatedAt: now,
    rowVersion: 1,
    basedOnVersionId: lastPublished.id,
    basePublishedId: lastPublished.id,
  };

  fair.versions.push(commercialDraft);
  return commercialDraft;
};

export const getOrganizerAssignment = (userId: string) =>
  organizerAssignments.find(assignment => assignment.userId === userId);

// ============ VERSION MANAGEMENT FUNCTIONS ============

export const deleteVersion = (fairId: string, versionId: string): boolean => {
  const fair = fairs.find(f => f.id === fairId);
  if (!fair) return false;

  const versionIndex = fair.versions.findIndex(v => v.id === versionId);
  if (versionIndex === -1) return false;

  const version = fair.versions[versionIndex];
  if (version.status === 'published') return false;

  if (fair.versions.length <= 1) return false;

  fair.versions.splice(versionIndex, 1);
  fair.lastActivity = new Date().toISOString();

  return true;
};

export const createVersion = (
  fairId: string, 
  label: string, 
  summary: string, 
  createdBy: string,
  basedOnVersionId?: string
): FairVersion | null => {
  const fair = fairs.find(f => f.id === fairId);
  if (!fair) return null;

  const now = new Date().toISOString();
  const currentPublished = getLatestPublishedVersionForFair(fair);
  const existingDraft = ensureDraftExists(fairId);

  if (existingDraft) {
    existingDraft.label = label || existingDraft.label;
    existingDraft.summary = summary;
    existingDraft.updatedAt = now;
    existingDraft.updatedBy = createdBy;
    existingDraft.rowVersion = (existingDraft.rowVersion || 0) + 1;
    existingDraft.basedOnVersionId = basedOnVersionId || existingDraft.basedOnVersionId || currentPublished?.id;
    fair.lastActivity = now;
    return existingDraft;
  }

  const newVersionId = `v-${fairId}-${versionIdCounter++}`;

  const newVersion: FairVersion = {
    id: newVersionId,
    fairId,
    label,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    rowVersion: 1,
    createdBy,
    summary,
    basedOnVersionId: basedOnVersionId || currentPublished?.id,
    basePublishedId: currentPublished?.id,
    occupancySnapshot: currentPublished?.occupancySnapshot || 0,
    standsSnapshot: currentPublished?.standsSnapshot || fair.totalStands,
    pendingSnapshot: currentPublished?.pendingSnapshot || 0,
  };

  fair.versions.push(newVersion);
  fair.lastActivity = new Date().toISOString();

  return newVersion;
};

export const publishVersion = (fairId: string, draftId: string): FairVersion | null => {
  const fair = fairs.find(f => f.id === fairId);
  if (!fair) return null;

  const draft = fair.versions.find(v => v.id === draftId && v.status === 'draft');
  if (!draft) return null;

  const now = new Date().toISOString();

  // Compute next version label based on published count
  const publishedCount = fair.versions.filter(v => v.status === 'published').length;
  const nextLabel = `v${publishedCount + 1}.0`;

  // Create a new published version from the draft
  const newPublished: FairVersion = {
    ...draft,
    id: `v-${fairId}-${versionIdCounter++}`,
    label: nextLabel,
    status: 'published',
    createdAt: now,
    updatedAt: now,
    rowVersion: 1,
    basedOnVersionId: draft.basedOnVersionId,
    basePublishedId: draft.basePublishedId || draft.basedOnVersionId,
  };

  // Keep architect draft as latest working copy and mark it based on this publish
  draft.basedOnVersionId = newPublished.id;
  draft.basePublishedId = newPublished.id;
  draft.updatedAt = now;
  draft.rowVersion = (draft.rowVersion || 0) + 1;

  // Append immutable published snapshot
  fair.versions.push(newPublished);
  fair.currentVersionId = newPublished.id;
  fair.lastActivity = now;

  // Refresh commercial draft only when it has no local edits (rowVersion <= 1).
  const commercialDraft = getCommercialDraft(fairId);
  if (!commercialDraft) {
    ensureCommercialDraftExists(fairId);
  } else {
    const hasCommercialChanges = (commercialDraft.rowVersion || 1) > 1;
    if (!hasCommercialChanges) {
      commercialDraft.summary = `Copia comercial basada en ${nextLabel}`;
      commercialDraft.basedOnVersionId = newPublished.id;
      commercialDraft.basePublishedId = newPublished.id;
      commercialDraft.occupancySnapshot = newPublished.occupancySnapshot;
      commercialDraft.standsSnapshot = newPublished.standsSnapshot;
      commercialDraft.pendingSnapshot = newPublished.pendingSnapshot;
      commercialDraft.updatedAt = now;
      commercialDraft.updatedBy = draft.createdBy;
      commercialDraft.rowVersion = 1;
    }
  }

  emitFairRealtime({
    fairId,
    type: 'version.published',
    at: now,
    payload: {
      publishedVersionId: newPublished.id,
      publishedLabel: newPublished.label,
      draftId,
    },
  });

  return newPublished;
};

export const saveDraftVersion = (fairId: string, versionId: string): FairVersion | null => {
  const fair = fairs.find(f => f.id === fairId);
  if (!fair) return null;

  const version = fair.versions.find(v => v.id === versionId);
  if (!version) return null;

  if (version.status !== 'draft') return null;

  version.updatedAt = new Date().toISOString();
  version.rowVersion = (version.rowVersion || 0) + 1;
  fair.lastActivity = version.updatedAt;

  emitFairRealtime({
    fairId,
    type: 'version.draft_saved',
    at: version.updatedAt,
    payload: {
      versionId,
      rowVersion: version.rowVersion,
    },
  });

  return version;
};

export const saveCommercialDraftVersion = (fairId: string, versionId: string): FairVersion | null => {
  const fair = fairs.find(f => f.id === fairId);
  if (!fair) return null;

  const version = fair.versions.find(v => v.id === versionId);
  if (!version || version.status !== 'commercial_draft') return null;

  version.updatedAt = new Date().toISOString();
  version.rowVersion = (version.rowVersion || 0) + 1;
  fair.lastActivity = version.updatedAt;

  emitFairRealtime({
    fairId,
    type: 'version.commercial_draft_saved',
    at: version.updatedAt,
    payload: {
      versionId,
      rowVersion: version.rowVersion,
    },
  });

  return version;
};

export const saveArchitectDraft = ({
  fairId,
  versionId,
  actorName,
  summary,
  expectedRowVersion,
}: SaveVersionRequest): VersionMutationResult => {
  const draft = getFairDraft(fairId);
  if (!draft || draft.id !== versionId) {
    return { ok: false, reason: 'Architect draft not found.' };
  }

  const currentRowVersion = draft.rowVersion || 1;
  if (typeof expectedRowVersion === 'number' && expectedRowVersion !== currentRowVersion) {
    return {
      ok: false,
      conflict: true,
      reason: 'Draft was updated by another user.',
      expectedRowVersion,
      actualRowVersion: currentRowVersion,
      version: draft,
    };
  }

  if (summary) {
    draft.summary = summary;
  }
  draft.updatedBy = actorName;

  const updated = saveDraftVersion(fairId, versionId);
  return updated ? { ok: true, version: updated } : { ok: false, reason: 'Could not save architect draft.' };
};

export const createArchitectDraftFromVersion = (
  fairId: string,
  sourceVersionId: string,
  actorName: string
): VersionMutationResult => {
  const fair = fairs.find(f => f.id === fairId);
  if (!fair) return { ok: false, reason: 'Portfolio not found.' };

  const source = fair.versions.find(v => v.id === sourceVersionId);
  if (!source) return { ok: false, reason: 'Source version not found.' };

  const now = new Date().toISOString();
  const activeDraft = getFairDraft(fairId);

  if (activeDraft) {
    activeDraft.summary = `Working copy based on ${source.label}`;
    activeDraft.basedOnVersionId = source.id;
    activeDraft.basePublishedId = source.status === 'published' ? source.id : source.basePublishedId || source.id;
    activeDraft.occupancySnapshot = source.occupancySnapshot;
    activeDraft.standsSnapshot = source.standsSnapshot;
    activeDraft.pendingSnapshot = source.pendingSnapshot;
    activeDraft.updatedBy = actorName;
    activeDraft.updatedAt = now;
    activeDraft.rowVersion = (activeDraft.rowVersion || 0) + 1;

    fair.lastActivity = now;

    emitFairRealtime({
      fairId,
      type: 'version.draft_saved',
      at: now,
      payload: {
        versionId: activeDraft.id,
        basedOnVersionId: source.id,
        rowVersion: activeDraft.rowVersion,
      },
    });

    return { ok: true, version: activeDraft };
  }

  const draft: FairVersion = {
    ...source,
    id: `v-${fairId}-${versionIdCounter++}`,
    status: 'draft',
    label: 'Working draft',
    summary: `Working copy based on ${source.label}`,
    createdAt: now,
    updatedAt: now,
    rowVersion: 1,
    createdBy: actorName,
    updatedBy: actorName,
    basedOnVersionId: source.id,
    basePublishedId: source.status === 'published' ? source.id : source.basePublishedId || source.id,
  };

  fair.versions.push(draft);
  fair.lastActivity = now;

  emitFairRealtime({
    fairId,
    type: 'version.draft_saved',
    at: now,
    payload: {
      versionId: draft.id,
      basedOnVersionId: source.id,
      rowVersion: draft.rowVersion,
    },
  });

  return { ok: true, version: draft };
};

export const saveCommercialDraft = ({
  fairId,
  versionId,
  actorName,
  summary,
  expectedRowVersion,
}: SaveVersionRequest): VersionMutationResult => {
  const draft = getCommercialDraft(fairId);
  if (!draft || draft.id !== versionId) {
    return { ok: false, reason: 'Commercial draft not found.' };
  }

  const currentRowVersion = draft.rowVersion || 1;
  if (typeof expectedRowVersion === 'number' && expectedRowVersion !== currentRowVersion) {
    return {
      ok: false,
      conflict: true,
      reason: 'Commercial draft was updated by another user.',
      expectedRowVersion,
      actualRowVersion: currentRowVersion,
      version: draft,
    };
  }

  if (summary) {
    draft.summary = summary;
  }
  draft.updatedBy = actorName;

  const updated = saveCommercialDraftVersion(fairId, versionId);
  return updated ? { ok: true, version: updated } : { ok: false, reason: 'Could not save commercial draft.' };
};

export const publishArchitectVersion = (
  fairId: string,
  actorName: string,
  expectedDraftRowVersion?: number
): VersionMutationResult => {
  const draft = ensureDraftExists(fairId);
  if (!draft) {
    return { ok: false, reason: 'Architect draft does not exist.' };
  }

  const currentRowVersion = draft.rowVersion || 1;
  if (typeof expectedDraftRowVersion === 'number' && expectedDraftRowVersion !== currentRowVersion) {
    return {
      ok: false,
      conflict: true,
      reason: 'Draft changed before publish.',
      expectedRowVersion: expectedDraftRowVersion,
      actualRowVersion: currentRowVersion,
      version: draft,
    };
  }

  draft.updatedBy = actorName;
  const published = publishVersion(fairId, draft.id);
  return published ? { ok: true, version: published } : { ok: false, reason: 'Could not publish draft.' };
};

export const getExhibitorAssignment = (userId: string) =>
  exhibitorAssignments.find(assignment => assignment.userId === userId);

// ============ API SIMULATION ============

export interface FloorPlanData {
  fair: Fair;
  stands: Stand[];
  sourceVersionStatus: FairVersionStatus;
  sourceVersionId?: string;
}

export interface FloorPlanFetchOptions {
  viewerRole?: UserRole;
  preferredVersionStatus?: FairVersionStatus;
}

export const getWorkingVersionForRole = (
  fairId: string,
  role?: UserRole,
  preferredVersionStatus?: FairVersionStatus
): FairVersion | null => {
  if (preferredVersionStatus === 'published') {
    return getPublishedVersions(fairId)[0] || null;
  }

  if (preferredVersionStatus === 'draft') {
    return ensureDraftExists(fairId);
  }

  if (preferredVersionStatus === 'commercial_draft') {
    return ensureCommercialDraftExists(fairId);
  }

  if (role === 'architect' || role === 'admin') {
    return ensureDraftExists(fairId) || getPublishedVersions(fairId)[0] || null;
  }

  if (role === 'commercial' || role === 'exhibitor') {
    return ensureCommercialDraftExists(fairId) || getPublishedVersions(fairId)[0] || null;
  }

  return getCurrentFairVersion(fairId);
};

type RequestBookingStatus = Extract<BookingStatus, 'pending'>;

export const createBookingForStand = ({
  fairId,
  standCode,
  userId,
  standId,
  company,
  comments,
  status = 'pending',
  validators = [],
}: {
  fairId: string;
  standCode: string;
  userId: string;
  standId?: string;
  company?: string;
  comments?: string;
  status?: RequestBookingStatus;
  validators?: string[];
}): Booking | null => {
  const user = users.find(u => u.id === userId);
  const fairData = fairs.find(f => f.id === fairId);
  if (!user || !fairData) return null;

  const effectiveCompany = company?.trim() || 'Empresa Temporal';
  const targetStandIndex = standId ? stands.findIndex(s => s.id === standId) : -1;
  if (targetStandIndex !== -1 && stands[targetStandIndex].status !== 'available') {
    return null;
  }

  const duplicatePending = bookings.find(r =>
    r.fairId === fairId &&
    (standId ? r.standId === standId : r.standCode === standCode) &&
    r.status === 'pending'
  );
  if (duplicatePending) return duplicatePending;

  const newBooking: Booking = {
    id: `r-local-${Date.now()}`,
    standCode,
    standId: standId || `stand-${standCode}`,
    fairId,
    fairName: `${fairData.name} ${fairData.edition}`,
    company: effectiveCompany,
    requester: user.name,
    requesterRole: user.role,
    date: new Date().toISOString(),
    status,
    validators,
    comments: comments || 'New trade order — pending compliance review.',
  };

  bookings.push(newBooking);

  if (targetStandIndex !== -1) {
    stands[targetStandIndex].status = 'pending';
    stands[targetStandIndex].company = effectiveCompany;

    emitFairRealtime({
      fairId,
      type: 'stand.updated',
      at: new Date().toISOString(),
      payload: {
        standId: stands[targetStandIndex].id,
        status: stands[targetStandIndex].status,
        company: stands[targetStandIndex].company,
      },
    });
  }

  emitFairRealtime({
    fairId,
    type: 'booking.created',
    at: new Date().toISOString(),
    payload: {
      bookingId: newBooking.id,
      standId: newBooking.standId,
      status: newBooking.status,
      requesterRole: newBooking.requesterRole,
    },
  });

  return newBooking;
};

export const setBookingStatus = (bookingId: string, status: BookingStatus): Booking | null => {
  const booking = bookings.find(r => r.id === bookingId);
  if (!booking) return null;

  booking.status = status;

  const standIndex = stands.findIndex(s => s.id === booking.standId);
  if (standIndex !== -1) {
    if (status === 'reserved') {
      stands[standIndex].status = 'reserved';
      stands[standIndex].company = booking.company;
    } else if (status === 'available') {
      stands[standIndex].status = 'available';
      if (stands[standIndex].company === booking.company) {
        stands[standIndex].company = undefined;
      }
    } else if (status === 'pending') {
      stands[standIndex].status = 'pending';
      stands[standIndex].company = booking.company;
    }

    emitFairRealtime({
      fairId: booking.fairId,
      type: 'stand.updated',
      at: new Date().toISOString(),
      payload: {
        standId: stands[standIndex].id,
        status: stands[standIndex].status,
        company: stands[standIndex].company,
      },
    });
  }

  emitFairRealtime({
    fairId: booking.fairId,
    type: 'booking.updated',
    at: new Date().toISOString(),
    payload: {
      bookingId: booking.id,
      standId: booking.standId,
      status: booking.status,
    },
  });

  return booking;
};

export const fetchFloorPlanData = (fairId: string, options?: FloorPlanFetchOptions): Promise<FloorPlanData> => {
  console.log(`Simulating API fetch for fair: ${fairId}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const fair = fairs.find(f => f.id === fairId);
      if (!fair) {
        return reject(new Error("Portfolio not found"));
      }

      const sourceVersion = getWorkingVersionForRole(
        fairId,
        options?.viewerRole,
        options?.preferredVersionStatus
      );
      
      const fairStands = stands.filter(s => s.fairId === fairId);
      
      resolve({
        fair,
        stands: fairStands,
        sourceVersionStatus: sourceVersion?.status || 'published',
        sourceVersionId: sourceVersion?.id,
      });
    }, 1000);
  });
};

export const requestBooking = (
  standId: string,
  userId: string,
  options?: {
    company?: string;
    comments?: string;
    status?: RequestBookingStatus;
    validators?: string[];
  }
): Promise<Stand> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const standIndex = stands.findIndex(s => s.id === standId);
      const user = users.find(u => u.id === userId);
      const stand = stands.find(s => s.id === standId);

      if (standIndex === -1 || !user || !stand) {
        return reject(new Error("Position, user or portfolio not found."));
      }

      if (stands[standIndex].status !== 'available') {
        return reject(new Error("Position is no longer available."));
      }

      const createdBooking = createBookingForStand({
        fairId: stands[standIndex].fairId,
        standCode: stands[standIndex].code,
        standId: stands[standIndex].id,
        userId,
        company: options?.company,
        comments: options?.comments || 'New order ticket from positions / 3D map.',
        status: options?.status || 'pending',
        validators: options?.validators || [],
      });

      if (!createdBooking) {
        return reject(new Error("Position is no longer available to open."));
      }
      
      resolve(stands[standIndex]);
    }, 500);
  });
};

export const approveBooking = (standId: string): Promise<Stand> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const standIndex = stands.findIndex(s => s.id === standId);
      if (standIndex === -1) {
        return reject(new Error("Position not found."));
      }

      stands[standIndex].status = 'reserved';
      
      const bookingToApprove = bookings.find(
        r => r.standId === standId && r.status === 'pending'
      );
      if (bookingToApprove) {
        setBookingStatus(bookingToApprove.id, 'reserved');
      }
      
      resolve(stands[standIndex]);
    }, 500);
  });
};

export const rejectBooking = (standId: string): Promise<Stand> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const standIndex = stands.findIndex(s => s.id === standId);
      if (standIndex === -1) {
        return reject(new Error("Position not found."));
      }

      stands[standIndex].status = 'available';
      stands[standIndex].company = undefined;
      
      const bookingToReject = bookings.find(
        r => r.standId === standId && r.status === 'pending'
      );
      if (bookingToReject) {
        setBookingStatus(bookingToReject.id, 'available');
      }
      
      resolve(stands[standIndex]);
    }, 500);
  });
};
