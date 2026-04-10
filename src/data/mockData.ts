// ============ TYPES ============
export type UserRole = 'admin' | 'architect' | 'commercial' | 'organizer' | 'exhibitor' | 'viewer';
export type StandStatus = 'available' | 'proposed' | 'pending' | 'approved' | 'blocked' | 'sold' | 'unavailable' | 'conflict' | 'review';
export type ReservationStatus = 'solicitud' | 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada' | 'en_revision' | 'bloqueada';
export type FairStatus = 'planificación' | 'comercialización' | 'en_curso' | 'finalizada';
export type FairVersionStatus = 'borrador' | 'publicada';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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
  createdBy: string;
  summary: string;
  basedOnVersionId?: string;
  occupancySnapshot: number;
  standsSnapshot: number;
  pendingSnapshot: number;
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

export interface Reservation {
  id: string;
  standCode: string;
  standId: string;
  fairId: string;
  fairName: string;
  company: string;
  requester: string;
  requesterRole: UserRole;
  date: string;
  status: ReservationStatus;
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
};

export const users: User[] = [
  currentUser,
  { id: 'u2', name: 'Carlos Ruiz', email: 'carlos@fairplan.com', role: 'architect' },
  { id: 'u3', name: 'Ana López', email: 'ana@fairplan.com', role: 'commercial' },
  { id: 'u4', name: 'Pedro Martín', email: 'pedro@fairplan.com', role: 'commercial' },
  { id: 'u5', name: 'Laura Sánchez', email: 'laura@expositor.com', role: 'exhibitor' },
  { id: 'u6', name: 'Jorge Fernández', email: 'jorge@fairplan.com', role: 'viewer' },
  { id: 'u7', name: 'Isabel Torres', email: 'isabel@fairplan.com', role: 'architect' },
  { id: 'u8', name: 'Marta Romero', email: 'marta@organizacion.com', role: 'organizer' },
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
      { id: 'v-f1-1', fairId: 'f1', label: 'v1.0', status: 'publicada', createdAt: '2025-07-02T10:15:00', createdBy: 'Carlos Ruiz', summary: 'Initial hall base with 96 stands', occupancySnapshot: 41, standsSnapshot: 96, pendingSnapshot: 14 },
      { id: 'v-f1-2', fairId: 'f1', label: 'v2.0', status: 'publicada', createdAt: '2025-09-18T12:00:00', createdBy: 'Carlos Ruiz', summary: 'Aisles and access reorganization', basedOnVersionId: 'v-f1-1', occupancySnapshot: 53, standsSnapshot: 108, pendingSnapshot: 11 },
      { id: 'v-f1-3', fairId: 'f1', label: 'v2.3', status: 'publicada', createdAt: '2026-02-28T09:20:00', createdBy: 'Isabel Torres', summary: 'Adjustments in premium areas and services', basedOnVersionId: 'v-f1-2', occupancySnapshot: 68, standsSnapshot: 120, pendingSnapshot: 9 },
      { id: 'v-f1-4', fairId: 'f1', label: 'v2.4', status: 'publicada', createdAt: '2026-03-10T11:15:00', createdBy: 'Carlos Ruiz', summary: 'Technical conflict correction in zone E', basedOnVersionId: 'v-f1-3', occupancySnapshot: 72, standsSnapshot: 120, pendingSnapshot: 8 },
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
      { id: 'v-f2-1', fairId: 'f2', label: 'v0.9', status: 'borrador', createdAt: '2026-03-09T11:00:00', createdBy: 'Ana López', summary: 'Initial proposal under commercial review', occupancySnapshot: 15, standsSnapshot: 80, pendingSnapshot: 3 },
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
      { id: 'v-f3-1', fairId: 'f3', label: 'v1.0', status: 'publicada', createdAt: '2025-10-20T10:00:00', createdBy: 'Pedro Martín', summary: 'Initial design for the consumer-goods hall', occupancySnapshot: 29, standsSnapshot: 98, pendingSnapshot: 12 },
      { id: 'v-f3-2', fairId: 'f3', label: 'v1.2', status: 'publicada', createdAt: '2025-12-10T09:35:00', createdBy: 'Carlos Ruiz', summary: 'Flow and main aisle adjustments', basedOnVersionId: 'v-f3-1', occupancySnapshot: 36, standsSnapshot: 104, pendingSnapshot: 10 },
      { id: 'v-f3-3', fairId: 'f3', label: 'v1.5', status: 'publicada', createdAt: '2026-03-01T08:05:00', createdBy: 'Carlos Ruiz', summary: 'Current version for sales phase', basedOnVersionId: 'v-f3-2', occupancySnapshot: 45, standsSnapshot: 110, pendingSnapshot: 6 },
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
      { id: 'v-f4-1', fairId: 'f4', label: 'v2.0', status: 'publicada', createdAt: '2026-01-10T13:40:00', createdBy: 'Isabel Torres', summary: 'Reinforcement of premium ceramic areas', occupancySnapshot: 84, standsSnapshot: 72, pendingSnapshot: 5 },
      { id: 'v-f4-2', fairId: 'f4', label: 'v2.2', status: 'publicada', createdAt: '2026-03-03T14:30:00', createdBy: 'Carlos Ruiz', summary: 'Final blocks and sales validation', basedOnVersionId: 'v-f4-1', occupancySnapshot: 91, standsSnapshot: 75, pendingSnapshot: 2 },
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
      { id: 'v-f5-1', fairId: 'f5', label: 'v0.5', status: 'borrador', createdAt: '2026-03-08T10:00:00', createdBy: 'Carlos Ruiz', summary: 'Initial structure for technical review', occupancySnapshot: 5, standsSnapshot: 60, pendingSnapshot: 0 },
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
      { id: 'v-f6-1', fairId: 'f6', label: 'v1.0', status: 'publicada', createdAt: '2026-01-15T10:00:00', createdBy: 'Carlos Ruiz', summary: 'Final version of the fair', occupancySnapshot: 100, standsSnapshot: 50, pendingSnapshot: 0 },
    ]
  },
];

// Generate stands for fair f1 (FITUR)
const standStatuses: StandStatus[] = ['available', 'proposed', 'pending', 'approved', 'sold', 'blocked', 'conflict', 'review', 'unavailable'];
const companies = ['Iberia', 'Meliá Hotels', 'Paradores', 'Turespaña', 'Vueling', 'Booking.com', 'Amadeus', 'Barceló', 'NH Hotels', 'Iberostar', 'Renfe', 'Air Europa', 'Visit London', 'Tourism Australia', 'Japan Travel Bureau', 'Korea Tourism', 'Dubai Tourism', 'Turkish Airlines'];
const zones = ['Zone A – Premium', 'Zone B – Standard', 'Zone C – Basic', 'Zone D – Central Aisle', 'Zone E – Corner'];
const standTypes = ['Premium', 'Standard', 'Island', 'Corner', 'Row'];

export const stands: Stand[] = Array.from({ length: 48 }, (_, i) => {
  const row = Math.floor(i / 8);
  const col = i % 8;
  const statusIdx = i < 5 ? 0 : i < 8 ? 1 : i < 12 ? 2 : i < 20 ? 3 : i < 28 ? 4 : i < 32 ? 5 : i < 35 ? 6 : i < 38 ? 7 : 8;
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
    company: st !== 'available' && st !== 'unavailable' ? companies[i % companies.length] : undefined,
    price: [2500, 3200, 4500, 6000, 8000][i % 5],
    zone: zones[row % zones.length],
    notes: st === 'conflict' ? 'Conflict between commercial request and technical restriction' : st === 'review' ? 'Pending technical review due to dimension change' : undefined,
  };
});

export const reservations: Reservation[] = [
  { id: 'r1', standCode: 'P3-B01', standId: 's9', fairId: 'f1', fairName: 'FITUR 2026', company: 'Meliá Hotels', requester: 'Ana López', requesterRole: 'commercial', date: '2026-03-10', status: 'pendiente', validators: ['Carlos Ruiz'], comments: 'Premium stand requested for main brand.', risk: 'Stand adjacent to direct competitor' },
  { id: 'r2', standCode: 'P3-B02', standId: 's10', fairId: 'f1', fairName: 'FITUR 2026', company: 'Paradores', requester: 'Ana López', requesterRole: 'commercial', date: '2026-03-09', status: 'pendiente', validators: ['Carlos Ruiz'], comments: 'Stand expansion compared to previous edition.' },
  { id: 'r3', standCode: 'P3-C01', standId: 's17', fairId: 'f1', fairName: 'FITUR 2026', company: 'Amadeus', requester: 'Pedro Martín', requesterRole: 'commercial', date: '2026-03-08', status: 'aprobada', validators: ['Carlos Ruiz', 'María García'], comments: 'Approved without changes.' },
  { id: 'r4', standCode: 'P3-A03', standId: 's3', fairId: 'f1', fairName: 'FITUR 2026', company: 'Turespaña', requester: 'Ana López', requesterRole: 'commercial', date: '2026-03-07', status: 'en_revision', validators: ['Carlos Ruiz'], comments: 'Dimension change request. Architect reviewing feasibility.', risk: 'Requires adjacent aisle adjustment' },
  { id: 'r5', standCode: 'P3-D02', standId: 's26', fairId: 'f1', fairName: 'FITUR 2026', company: 'Visit London', requester: 'Pedro Martín', requesterRole: 'commercial', date: '2026-03-06', status: 'rechazada', validators: ['Carlos Ruiz'], comments: 'Rejected: location incompatible with evacuation regulations.' },
  { id: 'r6', standCode: 'P3-E01', standId: 's33', fairId: 'f1', fairName: 'FITUR 2026', company: 'Tourism Australia', requester: 'Ana López', requesterRole: 'commercial', date: '2026-03-05', status: 'bloqueada', validators: ['Carlos Ruiz'], comments: 'Temporarily blocked due to conflict with another request.', risk: 'Overlap with Japan Travel Bureau request' },
  { id: 'r7', standCode: 'P3-C05', standId: 's21', fairId: 'f1', fairName: 'FITUR 2026', company: 'Barceló', requester: 'Pedro Martín', requesterRole: 'commercial', date: '2026-03-11', status: 'solicitud', validators: [], comments: 'New request. Pending validator assignment.' },
  { id: 'r8', standCode: 'P3-D04', standId: 's28', fairId: 'f1', fairName: 'FITUR 2026', company: 'NH Hotels', requester: 'Ana López', requesterRole: 'commercial', date: '2026-03-04', status: 'aprobada', validators: ['Carlos Ruiz', 'María García'], comments: 'Island stand approved with premium services.' },
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
  proposed: 'Proposed',
  pending: 'Pending validation',
  approved: 'Approved reservation',
  blocked: 'Blocked',
  sold: 'Sold',
  unavailable: 'Unavailable',
  conflict: 'Conflict',
  review: 'Technical review',
};

export const reservationStatusLabels: Record<ReservationStatus, string> = {
  solicitud: 'Request',
  pendiente: 'Pending',
  aprobada: 'Approved',
  rechazada: 'Rejected',
  cancelada: 'Canceled',
  en_revision: 'In review',
  bloqueada: 'Blocked',
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
  borrador: 'Draft',
  publicada: 'Published',
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

export const addFair = (fairData: Omit<Fair, 'id' | 'currentVersionId' | 'lastActivity' | 'versions'>): Fair => {
  const now = new Date().toISOString();
  const newFairId = `f${fairIdCounter++}`;
  const newVersionId = `v-${newFairId}-1`;
  
  const newVersion: FairVersion = {
    id: newVersionId,
    fairId: newFairId,
    label: 'v1.0',
    status: 'borrador',
    createdAt: now,
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

export const getCurrentFairVersion = (fairId: string) => {
  const versions = getFairVersions(fairId);
  return versions.find(v => v.status === 'publicada') || versions.find(v => v.status === 'borrador') || null;
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
  if (version.status === 'publicada') return false;

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

  const currentPublished = fair.versions.find(v => v.status === 'publicada');
  
  const newVersionId = `v-${fairId}-${versionIdCounter++}`;
  
  const newVersion: FairVersion = {
    id: newVersionId,
    fairId,
    label,
    status: 'borrador',
    createdAt: new Date().toISOString(),
    createdBy,
    summary,
    basedOnVersionId: basedOnVersionId || currentPublished?.id,
    occupancySnapshot: currentPublished?.occupancySnapshot || 0,
    standsSnapshot: currentPublished?.standsSnapshot || fair.totalStands,
    pendingSnapshot: currentPublished?.pendingSnapshot || 0,
  };

  fair.versions.push(newVersion);
  fair.lastActivity = new Date().toISOString();

  return newVersion;
};

export const publishVersion = (fairId: string, versionId: string): FairVersion | null => {
  const fair = fairs.find(f => f.id === fairId);
  if (!fair) return null;

  const versionToPublish = fair.versions.find(v => v.id === versionId);
  if (!versionToPublish) return null;

  const currentPublished = fair.versions.find(v => v.status === 'publicada');
  if (currentPublished) {
    currentPublished.status = 'borrador';
  }

  versionToPublish.status = 'publicada';
  fair.lastActivity = new Date().toISOString();

  return versionToPublish;
};

export const saveDraftVersion = (fairId: string, versionId: string): FairVersion | null => {
  const fair = fairs.find(f => f.id === fairId);
  if (!fair) return null;

  const version = fair.versions.find(v => v.id === versionId);
  if (!version) return null;

  if (version.status !== 'borrador') return null;

  fair.lastActivity = new Date().toISOString();
  return version;
};

export const getExhibitorAssignment = (userId: string) =>
  exhibitorAssignments.find(assignment => assignment.userId === userId);

// ============ API SIMULATION ============

export interface FloorPlanData {
  fair: Fair;
  stands: Stand[];
}

type RequestReservationStatus = Extract<ReservationStatus, 'solicitud' | 'pendiente' | 'en_revision'>;

export const createReservationForStand = ({
  fairId,
  standCode,
  userId,
  standId,
  company,
  comments,
  status = 'solicitud',
  validators = [],
}: {
  fairId: string;
  standCode: string;
  userId: string;
  standId?: string;
  company?: string;
  comments?: string;
  status?: RequestReservationStatus;
  validators?: string[];
}): Reservation | null => {
  const user = users.find(u => u.id === userId);
  const fairData = fairs.find(f => f.id === fairId);
  if (!user || !fairData) return null;

  const effectiveCompany = company?.trim() || 'Empresa Temporal';
  const targetStandIndex = standId ? stands.findIndex(s => s.id === standId) : -1;
  if (targetStandIndex !== -1 && stands[targetStandIndex].status !== 'available') {
    return null;
  }

  const duplicatePending = reservations.find(r =>
    r.fairId === fairId &&
    (standId ? r.standId === standId : r.standCode === standCode) &&
    ['solicitud', 'pendiente', 'en_revision'].includes(r.status)
  );
  if (duplicatePending) return duplicatePending;

  const newReservation: Reservation = {
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

  reservations.push(newReservation);

  if (targetStandIndex !== -1) {
    stands[targetStandIndex].status = 'pending';
    stands[targetStandIndex].company = effectiveCompany;
  }

  return newReservation;
};

export const setReservationStatus = (reservationId: string, status: ReservationStatus): Reservation | null => {
  const reservation = reservations.find(r => r.id === reservationId);
  if (!reservation) return null;

  reservation.status = status;

  const standIndex = stands.findIndex(s => s.id === reservation.standId);
  if (standIndex !== -1) {
    if (status === 'aprobada') {
      stands[standIndex].status = 'approved';
      stands[standIndex].company = reservation.company;
    } else if (status === 'rechazada' || status === 'cancelada') {
      stands[standIndex].status = 'available';
      if (stands[standIndex].company === reservation.company) {
        stands[standIndex].company = undefined;
      }
    } else if (status === 'solicitud' || status === 'pendiente' || status === 'en_revision') {
      stands[standIndex].status = 'pending';
      stands[standIndex].company = reservation.company;
    }
  }

  return reservation;
};

export const fetchFloorPlanData = (fairId: string): Promise<FloorPlanData> => {
  console.log(`Simulating API fetch for fair: ${fairId}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const fair = fairs.find(f => f.id === fairId);
      if (!fair) {
        return reject(new Error("Fair no encontrada"));
      }
      
      const fairStands = stands.filter(s => s.fairId === fairId);
      
      resolve({
        fair,
        stands: fairStands,
      });
    }, 1000);
  });
};

export const requestReservation = (
  standId: string,
  userId: string,
  options?: {
    company?: string;
    comments?: string;
    status?: RequestReservationStatus;
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

      const createdReservation = createReservationForStand({
        fairId: stands[standIndex].fairId,
        standCode: stands[standIndex].code,
        standId: stands[standIndex].id,
        userId,
        company: options?.company,
        comments: options?.comments || 'Nueva solicitud desde stands/plano.',
        status: options?.status || 'solicitud',
        validators: options?.validators || [],
      });

      if (!createdReservation) {
        return reject(new Error("El stand ya no está disponible para reservar."));
      }
      
      resolve(stands[standIndex]);
    }, 500);
  });
};

export const approveReservation = (standId: string): Promise<Stand> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const standIndex = stands.findIndex(s => s.id === standId);
      if (standIndex === -1) {
        return reject(new Error("Stand no encontrado."));
      }

      stands[standIndex].status = 'approved';
      
      const reservationToApprove = reservations.find(
        r => r.standId === standId && ['pendiente', 'solicitud', 'en_revision'].includes(r.status)
      );
      if (reservationToApprove) {
        setReservationStatus(reservationToApprove.id, 'aprobada');
      }
      
      resolve(stands[standIndex]);
    }, 500);
  });
};

export const rejectReservation = (standId: string): Promise<Stand> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const standIndex = stands.findIndex(s => s.id === standId);
      if (standIndex === -1) {
        return reject(new Error("Stand no encontrado."));
      }

      stands[standIndex].status = 'available';
      stands[standIndex].company = undefined;
      
      const reservationToReject = reservations.find(
        r => r.standId === standId && ['pendiente', 'solicitud', 'en_revision'].includes(r.status)
      );
      if (reservationToReject) {
        setReservationStatus(reservationToReject.id, 'rechazada');
      }
      
      resolve(stands[standIndex]);
    }, 500);
  });
};
