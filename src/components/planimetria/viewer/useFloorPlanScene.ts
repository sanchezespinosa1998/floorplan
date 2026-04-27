import { fetchFloorPlanData, subscribeToFairRealtime, type FairVersionStatus, type UserRole } from '@/data/mockData';
import { startTransition, useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { buildViewerScene, type ViewerIsland, type ViewerStand } from './sceneModel';

interface UseFloorPlanSceneResult {
  islands: ViewerIsland[];
  stands: ViewerStand[];
  setIslands: Dispatch<SetStateAction<ViewerIsland[]>>;
  setStands: Dispatch<SetStateAction<ViewerStand[]>>;
  isLoadingFloorPlan: boolean;
  floorPlanError: string;
  setFloorPlanError: (message: string) => void;
  loadFloorPlan: () => Promise<void>;
}

export function useFloorPlanScene(fairId: string): UseFloorPlanSceneResult {
  const [isLoadingFloorPlan, setIsLoadingFloorPlan] = useState(true);
  const [floorPlanError, setFloorPlanError] = useState('');
  const [islands, setIslands] = useState<ViewerIsland[]>(() => buildViewerScene([], fairId).islands);
  const [stands, setStands] = useState<ViewerStand[]>(() => buildViewerScene([], fairId).stands);

  const loadFloorPlan = useCallback(async (options?: { viewerRole?: UserRole; preferredVersionStatus?: FairVersionStatus }) => {
    setIsLoadingFloorPlan(true);
    setFloorPlanError('');

    try {
      const floorPlan = await fetchFloorPlanData(fairId, {
        viewerRole: options?.viewerRole,
        preferredVersionStatus: options?.preferredVersionStatus,
      });
      const nextScene = buildViewerScene(floorPlan.stands, fairId);

      startTransition(() => {
        setIslands(nextScene.islands);
        setStands(nextScene.stands);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo cargar el plano de la feria.';

      startTransition(() => {
        const emptyScene = buildViewerScene([], fairId);
        setIslands(emptyScene.islands);
        setStands(emptyScene.stands);
        setFloorPlanError(message);
      });
    } finally {
      setIsLoadingFloorPlan(false);
    }
  }, [fairId]);

  useEffect(() => {
    void loadFloorPlan();
  }, [loadFloorPlan]);

  useEffect(() => {
    if (!fairId) return;

    return subscribeToFairRealtime(fairId, event => {
      if (event.type === 'stand.updated' || event.type === 'booking.created' || event.type === 'booking.updated') {
        void loadFloorPlan();
      }
    });
  }, [fairId, loadFloorPlan]);

  return {
    islands,
    stands,
    setIslands,
    setStands,
    isLoadingFloorPlan,
    floorPlanError,
    setFloorPlanError,
    loadFloorPlan,
  };
}
