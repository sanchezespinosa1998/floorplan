// ============ TYPES ============
export type UserRole = 'admin' | 'architect' | 'commercial' | 'organizer' | 'exhibitor' | 'viewer';
export type StandStatus = 'available' | 'pending' | 'reserved';
export type BookingStatus = 'available' | 'pending' | 'reserved';
export type FairStatus = 'planificación' | 'comercialización' | 'en_curso' | 'finalizada';
export type FairVersionStatus = 'draft' | 'published';

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
  id: string;
  code: string;
  fairId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  status: StandStatus;
  type: string;
  area: number;
  company?: string;
  price?: number;
  zone: string;
  notes?: string;
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

export const currentUser: User = {
  id: 'u1',
  name: 'María García',
  email: 'maria@fairplan.com',
  role: 'admin',
  company: 'FairPlan',
};

export const users: User[] = [
  currentUser,
  { id: 'u2', name: 'Carlos Ruiz', email: 'carlos@fairplan.com', role: 'architect', company: 'FairPlan' },
  { id: 'u3', name: 'Ana López', email: 'ana@fairplan.com', role: 'commercial', company: 'FairPlan' },
  { id: 'u4', name: 'Pedro Martín', email: 'pedro@fairplan.com', role: 'commercial', company: 'FairPlan' },
  { id: 'u5', name: 'Laura Sánchez', email: 'laura@expositor.com', role: 'exhibitor', company: 'Expositor Corp' },
  { id: 'u6', name: 'Jorge Fernández', email: 'jorge@fairplan.com', role: 'viewer', company: 'FairPlan' },
  { id: 'u7', name: 'Isabel Torres', email: 'isabel@fairplan.com', role: 'architect', company: 'FairPlan' },
  { id: 'u8', name: 'Marta Romero', email: 'marta@organizacion.com', role: 'organizer', company: 'Organización SL' },
];

export const venues: Venue[] = [
  { id: 'v1', name: 'IFEMA Madrid', location: 'Madrid, Spain', area: 200000, pavilions: 12, description: 'Flagship fair venue in Spain with 12 halls and over 200,000m² of surface.', fairCount: 4 },
  { id: 'v2', name: 'Fira Barcelona – Gran Via', location: 'Barcelona, Spain', area: 240000, pavilions: 8, description: 'Modern fair complex in L\'Hospitalet de Llobregat designed by Toyo Ito.', fairCount: 3 },
  { id: 'v3', name: 'BEC Bilbao', location: 'Bilbao, Spain', area: 150000, pavilions: 6, description: 'Bilbao Exhibition Centre, major fair venue in the Basque Country.', fairCount: 2 },
  { id: 'v4', name: 'Valencia Fair', location: 'Valencia, Spain', area: 130000, pavilions: 7, description: 'Historic fair venue next to the City of Arts and Sciences.', fairCount: 3 },
];

// Fairs con versiones integradas (migrado de projects + projectVersions)
export const fairs: Fair[] = [
  { 
    id: 'f1', 
    name: 'FITUR', 
    edition: '2026',
    startDate: '2026-01-21', 
    endDate: '2026-01-25', 
    venueId: 'v1', 
    venueName: 'IFEMA Madrid', 
    status: 'comercialización',
    occupancy: 65,
    totalStands: 215,
    freeStands: 74,
    reservedStands: 141,
    pendingReservations: 20,
    responsible: 'Ana López',
    lastActivity: '2026-03-11T09:30:00',
    currentVersionId: 'v-f1-4',
    versions: [
      { id: 'v-f1-1', fairId: 'f1', label: 'v1.0', status: 'published', createdAt: '2025-07-02T10:15:00', createdBy: 'Carlos Ruiz', summary: 'Initial hall base with 96 stands', occupancySnapshot: 41, standsSnapshot: 96, pendingSnapshot: 14 },
      { id: 'v-f1-2', fairId: 'f1', label: 'v2.0', status: 'published', createdAt: '2025-09-18T12:00:00', createdBy: 'Carlos Ruiz', summary: 'Aisles and access reorganization', basedOnVersionId: 'v-f1-1', basePublishedId: 'v-f1-1', occupancySnapshot: 53, standsSnapshot: 108, pendingSnapshot: 11 },
      { id: 'v-f1-3', fairId: 'f1', label: 'v2.3', status: 'published', createdAt: '2026-02-28T09:20:00', createdBy: 'Isabel Torres', summary: 'Adjustments in premium areas and services', basedOnVersionId: 'v-f1-2', basePublishedId: 'v-f1-2', occupancySnapshot: 68, standsSnapshot: 120, pendingSnapshot: 9 },
      { id: 'v-f1-4', fairId: 'f1', label: 'v2.4', status: 'published', createdAt: '2026-03-10T11:15:00', createdBy: 'Carlos Ruiz', summary: 'Technical conflict correction in zone E', basedOnVersionId: 'v-f1-3', basePublishedId: 'v-f1-3', occupancySnapshot: 72, standsSnapshot: 120, pendingSnapshot: 8 },
      { id: 'v-f1-draft', fairId: 'f1', label: 'Draft técnico', status: 'draft', createdAt: '2026-03-11T09:30:00', updatedAt: '2026-03-11T09:30:00', rowVersion: 1, createdBy: 'Carlos Ruiz', summary: 'Trabajo en curso basado en v2.4', basedOnVersionId: 'v-f1-4', basePublishedId: 'v-f1-4', occupancySnapshot: 72, standsSnapshot: 120, pendingSnapshot: 8 },
    ]
  },
  { 
    id: 'f2', 
    name: 'Mobile World Congress', 
    edition: '2026',
    startDate: '2026-02-23', 
    endDate: '2026-02-26', 
    venueId: 'v2', 
    venueName: 'Fira Barcelona – Gran Via', 
    status: 'planificación',
    occupancy: 15,
    totalStands: 80,
    freeStands: 68,
    reservedStands: 12,
    pendingReservations: 3,
    responsible: 'Ana López',
    lastActivity: '2026-03-09T11:00:00',
    currentVersionId: 'v-f2-1',
    versions: [
      { id: 'v-f2-1', fairId: 'f2', label: 'Draft técnico', status: 'draft', createdAt: '2026-03-09T11:00:00', updatedAt: '2026-03-09T11:00:00', rowVersion: 1, createdBy: 'Ana López', summary: 'Initial proposal under commercial review', occupancySnapshot: 15, standsSnapshot: 80, pendingSnapshot: 3 },
    ]
  },
  { 
    id: 'f3', 
    name: 'Alimentaria', 
    edition: '2026',
    startDate: '2026-04-06', 
    endDate: '2026-04-09', 
    venueId: 'v2', 
    venueName: 'Fira Barcelona – Gran Via', 
    status: 'comercialización',
    occupancy: 45,
    totalStands: 110,
    freeStands: 61,
    reservedStands: 49,
    pendingReservations: 6,
    responsible: 'Pedro Martín',
    lastActivity: '2026-03-11T08:15:00',
    currentVersionId: 'v-f3-3',
    versions: [
      { id: 'v-f3-1', fairId: 'f3', label: 'v1.0', status: 'published', createdAt: '2025-10-20T10:00:00', createdBy: 'Pedro Martín', summary: 'Initial design for the consumer-goods hall', occupancySnapshot: 29, standsSnapshot: 98, pendingSnapshot: 12 },
      { id: 'v-f3-2', fairId: 'f3', label: 'v1.2', status: 'published', createdAt: '2025-12-10T09:35:00', createdBy: 'Carlos Ruiz', summary: 'Flow and main aisle adjustments', basedOnVersionId: 'v-f3-1', basePublishedId: 'v-f3-1', occupancySnapshot: 36, standsSnapshot: 104, pendingSnapshot: 10 },
      { id: 'v-f3-3', fairId: 'f3', label: 'v1.5', status: 'published', createdAt: '2026-03-01T08:05:00', createdBy: 'Carlos Ruiz', summary: 'Current version for sales phase', basedOnVersionId: 'v-f3-2', basePublishedId: 'v-f3-2', occupancySnapshot: 45, standsSnapshot: 110, pendingSnapshot: 6 },
      { id: 'v-f3-draft', fairId: 'f3', label: 'Draft técnico', status: 'draft', createdAt: '2026-03-11T08:15:00', updatedAt: '2026-03-11T08:15:00', rowVersion: 1, createdBy: 'Pedro Martín', summary: 'Trabajo en curso basado en v1.5', basedOnVersionId: 'v-f3-3', basePublishedId: 'v-f3-3', occupancySnapshot: 45, standsSnapshot: 110, pendingSnapshot: 6 },
    ]
  },
  { 
    id: 'f4', 
    name: 'Cevisama', 
    edition: '2026',
    startDate: '2026-02-10', 
    endDate: '2026-02-14', 
    venueId: 'v4', 
    venueName: 'Fair de Valencia', 
    status: 'en_curso',
    occupancy: 91,
    totalStands: 75,
    freeStands: 7,
    reservedStands: 68,
    pendingReservations: 2,
    responsible: 'Ana López',
    lastActivity: '2026-03-10T14:30:00',
    currentVersionId: 'v-f4-2',
    versions: [
      { id: 'v-f4-1', fairId: 'f4', label: 'v2.0', status: 'published', createdAt: '2026-01-10T13:40:00', createdBy: 'Isabel Torres', summary: 'Reinforcement of premium ceramic areas', occupancySnapshot: 84, standsSnapshot: 72, pendingSnapshot: 5 },
      { id: 'v-f4-2', fairId: 'f4', label: 'v2.2', status: 'published', createdAt: '2026-03-03T14:30:00', createdBy: 'Carlos Ruiz', summary: 'Final blocks and sales validation', basedOnVersionId: 'v-f4-1', basePublishedId: 'v-f4-1', occupancySnapshot: 91, standsSnapshot: 75, pendingSnapshot: 2 },
      { id: 'v-f4-draft', fairId: 'f4', label: 'Draft técnico', status: 'draft', createdAt: '2026-03-10T14:30:00', updatedAt: '2026-03-10T14:30:00', rowVersion: 1, createdBy: 'Carlos Ruiz', summary: 'Trabajo en curso basado en v2.2', basedOnVersionId: 'v-f4-2', basePublishedId: 'v-f4-2', occupancySnapshot: 91, standsSnapshot: 75, pendingSnapshot: 2 },
    ]
  },
  { 
    id: 'f5', 
    name: 'BIEMH', 
    edition: '2026',
    startDate: '2026-05-25', 
    endDate: '2026-05-29', 
    venueId: 'v3', 
    venueName: 'BEC Bilbao', 
    status: 'planificación',
    occupancy: 5,
    totalStands: 60,
    freeStands: 57,
    reservedStands: 3,
    pendingReservations: 0,
    responsible: 'Carlos Ruiz',
    lastActivity: '2026-03-08T10:00:00',
    currentVersionId: 'v-f5-1',
    versions: [
      { id: 'v-f5-1', fairId: 'f5', label: 'Draft técnico', status: 'draft', createdAt: '2026-03-08T10:00:00', updatedAt: '2026-03-08T10:00:00', rowVersion: 1, createdBy: 'Carlos Ruiz', summary: 'Initial structure for technical review', occupancySnapshot: 5, standsSnapshot: 60, pendingSnapshot: 0 },
    ]
  },
  { 
    id: 'f6', 
    name: 'ARCOmadrid', 
    edition: '2026',
    startDate: '2026-02-19', 
    endDate: '2026-02-23', 
    venueId: 'v1', 
    venueName: 'IFEMA Madrid', 
    status: 'finalizada',
    occupancy: 100,
    totalStands: 50,
    freeStands: 0,
    reservedStands: 50,
    pendingReservations: 0,
    responsible: 'María García',
    lastActivity: '2026-02-24T10:00:00',
    currentVersionId: 'v-f6-1',
    versions: [
      { id: 'v-f6-1', fairId: 'f6', label: 'v1.0', status: 'published', createdAt: '2026-01-15T10:00:00', createdBy: 'Carlos Ruiz', summary: 'Final version of the fair', occupancySnapshot: 100, standsSnapshot: 50, pendingSnapshot: 0 },
    ]
  },
];

// Generate stands for fair f1 (FITUR)
const standStatuses: StandStatus[] = ['available', 'pending', 'reserved'];
const companies = ['Iberia', 'Meliá Hotels', 'Paradores', 'Turespaña', 'Vueling', 'Booking.com', 'Amadeus', 'Barceló', 'NH Hotels', 'Iberostar', 'Renfe', 'Air Europa', 'Visit London', 'Tourism Australia', 'Japan Travel Bureau', 'Korea Tourism', 'Dubai Tourism', 'Turkish Airlines'];
const zones = ['Zone A – Premium', 'Zone B – Standard', 'Zone C – Basic', 'Zone D – Central Aisle', 'Zone E – Corner'];
const standTypes = ['Premium', 'Standard', 'Island', 'Corner', 'Row'];

export const stands: Stand[] = Array.from({ length: 48 }, (_, i) => {
  const row = Math.floor(i / 8);
  const col = i % 8;
  const statusIdx = i < 5 ? 0 : i < 20 ? 1 : i < 38 ? 2 : 0;
  const st = standStatuses[Math.min(statusIdx, standStatuses.length - 1)];
  return {
    id: `s${i + 1}`,
    code: `P3-${String.fromCharCode(65 + row)}${String(col + 1).padStart(2, '0')}`,
    fairId: 'f1',
    x: 60 + col * 105,
    y: 60 + row * 95,
    width: 90,
    height: 75,
    status: st,
    type: standTypes[i % standTypes.length],
    area: [9, 12, 16, 20, 25, 30][i % 6],
    company: st !== 'available' ? companies[i % companies.length] : undefined,
    price: [2500, 3200, 4500, 6000, 8000][i % 5],
    zone: zones[row % zones.length],
  };
});

export const bookings: Booking[] = [
  { id: 'r1', standCode: 'P3-B01', standId: 's9', fairId: 'f1', fairName: 'FITUR 2026', company: 'Meliá Hotels', requester: 'Ana López', requesterRole: 'commercial', date: '2026-03-10', status: 'pending', validators: ['Carlos Ruiz'], comments: 'Premium stand requested for main brand.', risk: 'Stand adjacent to direct competitor' },
  { id: 'r2', standCode: 'P3-B02', standId: 's10', fairId: 'f1', fairName: 'FITUR 2026', company: 'Paradores', requester: 'Ana López', requesterRole: 'commercial', date: '2026-03-09', status: 'pending', validators: ['Carlos Ruiz'], comments: 'Stand expansion compared to previous edition.' },
  { id: 'r3', standCode: 'P3-C01', standId: 's17', fairId: 'f1', fairName: 'FITUR 2026', company: 'Amadeus', requester: 'Pedro Martín', requesterRole: 'commercial', date: '2026-03-08', status: 'reserved', validators: ['Carlos Ruiz', 'María García'], comments: 'Approved without changes.' },
  { id: 'r4', standCode: 'P3-A03', standId: 's3', fairId: 'f1', fairName: 'FITUR 2026', company: 'Turespaña', requester: 'Ana López', requesterRole: 'commercial', date: '2026-03-07', status: 'pending', validators: ['Carlos Ruiz'], comments: 'Dimension change request. Architect reviewing feasibility.', risk: 'Requires adjacent aisle adjustment' },
  { id: 'r5', standCode: 'P3-D02', standId: 's26', fairId: 'f1', fairName: 'FITUR 2026', company: 'Visit London', requester: 'Pedro Martín', requesterRole: 'commercial', date: '2026-03-06', status: 'available', validators: ['Carlos Ruiz'], comments: 'Stand location incompatible with evacuation regulations.' },
  { id: 'r6', standCode: 'P3-E01', standId: 's33', fairId: 'f1', fairName: 'FITUR 2026', company: 'Tourism Australia', requester: 'Ana López', requesterRole: 'commercial', date: '2026-03-05', status: 'pending', validators: ['Carlos Ruiz'], comments: 'Request temporarily on hold.', risk: 'Overlap with Japan Travel Bureau request' },
  { id: 'r7', standCode: 'P3-C05', standId: 's21', fairId: 'f1', fairName: 'FITUR 2026', company: 'Barceló', requester: 'Pedro Martín', requesterRole: 'commercial', date: '2026-03-11', status: 'pending', validators: [], comments: 'New request. Pending validator assignment.' },
  { id: 'r8', standCode: 'P3-D04', standId: 's28', fairId: 'f1', fairName: 'FITUR 2026', company: 'NH Hotels', requester: 'Ana López', requesterRole: 'commercial', date: '2026-03-04', status: 'reserved', validators: ['Carlos Ruiz', 'María García'], comments: 'Island stand reserved with premium services.' },
];

export const activities: ActivityItem[] = [
  { id: 'a1', user: 'Ana López', role: 'commercial', action: 'requested stand reservation for', target: 'P3-B01 for Meliá Hotels', date: '2026-03-10T14:30:00', type: 'reservation' },
  { id: 'a2', user: 'Carlos Ruiz', role: 'architect', action: 'updated the plan for', target: 'FITUR 2026 (v2.4)', date: '2026-03-10T11:15:00', type: 'plan' },
  { id: 'a3', user: 'María García', role: 'admin', action: 'approved reservation for', target: 'P3-C01 for Amadeus', date: '2026-03-09T16:00:00', type: 'approval' },
  { id: 'a4', user: 'Pedro Martín', role: 'commercial', action: 'generated sales proposal for', target: 'P3-C05 – Barceló', date: '2026-03-11T08:45:00', type: 'reservation' },
  { id: 'a5', user: 'Carlos Ruiz', role: 'architect', action: 'detected technical conflict in', target: 'P3-E01 – evacuation zone', date: '2026-03-09T09:20:00', type: 'conflict' },
  { id: 'a6', user: 'María García', role: 'admin', action: 'added', target: 'Isabel Torres as architect for MWC 2026', date: '2026-03-08T15:00:00', type: 'user' },
  { id: 'a7', user: 'Carlos Ruiz', role: 'architect', action: 'rejected request for', target: 'P3-D02 – Visit London due to regulations', date: '2026-03-07T12:30:00', type: 'approval' },
  { id: 'a8', user: 'Ana López', role: 'commercial', action: 'requested dimension change in', target: 'P3-A03 for Turespaña', date: '2026-03-07T10:00:00', type: 'reservation' },
];

export const standStatusLabels: Record<StandStatus, string> = {
  available: 'Available',
  pending: 'Pending',
  reserved: 'Reserved',
};

export const bookingStatusLabels: Record<BookingStatus, string> = {
  available: 'Available',
  pending: 'Pending',
  reserved: 'Reserved',
};

export const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  architect: 'Architect',
  commercial: 'Commercial',
  organizer: 'Organizer',
  exhibitor: 'Exhibitor',
  viewer: 'Viewer',
};

export const fairStatusLabels: Record<FairStatus, string> = {
  planificación: 'Planning',
  comercialización: 'Sales',
  en_curso: 'In progress',
  finalizada: 'Completed',
};

export const fairVersionStatusLabels: Record<FairVersionStatus, string> = {
  draft: 'Draft tecnico',
  published: 'Published',
  commercial_draft: 'Commercial draft',
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
    summary: 'Versión inicial de la feria',
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
    companyName: 'Barceló Hotel Group',
    primaryStandId: 's21',
    commercialContact: {
      name: 'Ana López',
      email: 'ana@fairplan.com',
      phone: '+34 600 123 456',
    },
  },
];

export const organizerAssignments: OrganizerAssignment[] = [
  {
    userId: 'u8',
    fairId: 'f1',
    title: 'Organización general del evento',
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
    label: 'Draft comercial',
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
  if (!fair) return { ok: false, reason: 'Fair not found.' };

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
    label: 'Draft tecnico',
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
    comments: comments || 'Nueva solicitud de reserva.',
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
        return reject(new Error("Fair no encontrada"));
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
        return reject(new Error("Stand, usuario o feria no encontrado."));
      }

      if (stands[standIndex].status !== 'available') {
        return reject(new Error("El stand ya no está disponible."));
      }

      const createdBooking = createBookingForStand({
        fairId: stands[standIndex].fairId,
        standCode: stands[standIndex].code,
        standId: stands[standIndex].id,
        userId,
        company: options?.company,
        comments: options?.comments || 'Nueva solicitud desde stands/plano.',
        status: options?.status || 'pending',
        validators: options?.validators || [],
      });

      if (!createdBooking) {
        return reject(new Error("El stand ya no está disponible para reservar."));
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
        return reject(new Error("Stand no encontrado."));
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
        return reject(new Error("Stand no encontrado."));
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
