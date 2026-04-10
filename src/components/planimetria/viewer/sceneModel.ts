import type { Stand } from '@/data/mockData';

export const WORLD_SCALE = 0.05;
const ISLAND_PADDING = 1.75;

const STAND_STATUS_COLORS: Record<Stand['status'], string> = {
  available: '#3083ff',
  proposed: '#6366f1',
  pending: '#f59e0b',
  approved: '#10b981',
  sold: '#06b6d4',
  blocked: '#ef4444',
  conflict: '#f97316',
  review: '#a855f7',
  unavailable: '#6b7280',
};

export interface ViewerIsland {
  id: string;
  fairZone?: string;
  name: string;
  position: [number, number, number];
  rotationY: number;
  h: number;
  color: string;
  points: Array<[number, number]>;
}

export interface ViewerStand {
  id: string;
  fairStandId: string;
  islandId: string;
  name: string;
  standCode: string;
  position: [number, number, number];
  rotationY: number;
  h: number;
  color: string;
  points: Array<[number, number]>;
  reserved: boolean;
  reservedBy: string;
  sourceStatus: Stand['status'];
  typeLabel: string;
  notes: string;
  wallSides: number[];
}

export interface ViewerScene {
  islands: ViewerIsland[];
  stands: ViewerStand[];
}

export const toWorldUnits = (value: number) => value * WORLD_SCALE;

const isReservedStatus = (status: Stand['status']) => status !== 'available';

export function buildViewerScene(fairStands: Stand[], fairId: string): ViewerScene {
  if (!fairStands.length) {
    return {
      islands: [
        {
          id: `zone-${fairId}-empty`,
          name: 'Plano sin stands cargados',
          position: [0, 0, 0],
          rotationY: 0,
          h: 0.2,
          color: '#1f2937',
          points: [[-12, -10], [12, -10], [12, 10], [-12, 10]],
        },
      ],
      stands: [],
    };
  }

  const standsByZone = fairStands.reduce((acc, stand) => {
    const zoneKey = stand.zone || 'Sin zona';
    if (!acc.has(zoneKey)) acc.set(zoneKey, []);
    acc.get(zoneKey)?.push(stand);
    return acc;
  }, new Map<string, Stand[]>());

  const islands: ViewerIsland[] = Array.from(standsByZone.entries()).map(([zoneName, zoneStands], index) => {
    const minX = Math.min(...zoneStands.map((stand) => stand.x));
    const maxX = Math.max(...zoneStands.map((stand) => stand.x + stand.width));
    const minY = Math.min(...zoneStands.map((stand) => stand.y));
    const maxY = Math.max(...zoneStands.map((stand) => stand.y + stand.height));

    const width = toWorldUnits(maxX - minX);
    const depth = toWorldUnits(maxY - minY);
    const centerX = toWorldUnits((minX + maxX) / 2);
    const centerZ = -toWorldUnits((minY + maxY) / 2);

    return {
      id: `zone-${fairId}-${index + 1}`,
      fairZone: zoneName,
      name: zoneName,
      position: [centerX, 0, centerZ],
      rotationY: 0,
      h: 0.25,
      color: '#1f2937',
      points: [
        [-(width / 2) - ISLAND_PADDING, -(depth / 2) - ISLAND_PADDING],
        [(width / 2) + ISLAND_PADDING, -(depth / 2) - ISLAND_PADDING],
        [(width / 2) + ISLAND_PADDING, (depth / 2) + ISLAND_PADDING],
        [-(width / 2) - ISLAND_PADDING, (depth / 2) + ISLAND_PADDING],
      ],
    };
  });

  const zoneToIslandId = new Map(islands.map((island) => [island.fairZone, island.id]));

  const stands: ViewerStand[] = fairStands.map((stand) => {
    const width = toWorldUnits(stand.width);
    const depth = toWorldUnits(stand.height);

    return {
      id: stand.id,
      fairStandId: stand.id,
      islandId: zoneToIslandId.get(stand.zone) || islands[0]?.id || `zone-${fairId}-empty`,
      name: stand.code,
      standCode: stand.code,
      position: [toWorldUnits(stand.x + stand.width / 2), 0, -toWorldUnits(stand.y + stand.height / 2)],
      rotationY: 0,
      h: Math.max(2.4, Math.min(4.4, Math.sqrt(Math.max(stand.area || 1, 1)) * 0.7)),
      color: STAND_STATUS_COLORS[stand.status] || '#3083ff',
      points: [
        [-width / 2, -depth / 2],
        [width / 2, -depth / 2],
        [width / 2, depth / 2],
        [-width / 2, depth / 2],
      ],
      reserved: isReservedStatus(stand.status),
      reservedBy: stand.company || '',
      sourceStatus: stand.status,
      typeLabel: stand.type,
      notes: stand.notes || '',
      wallSides: [],
    };
  });

  return { islands, stands };
}
