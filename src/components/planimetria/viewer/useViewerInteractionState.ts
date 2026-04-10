import { useEffect, useState, type MutableRefObject } from 'react';

const deepClone = (value: unknown) => JSON.parse(JSON.stringify(value));

interface UseViewerInteractionStateParams {
  canUseTools: boolean;
  canEditObjectType: (type: string) => boolean;
  islands: any[];
  stands: any[];
  setIslands: (value: any) => void;
  setStands: (value: any) => void;
  cutPreviewRef: MutableRefObject<any>;
  onConfirmCut: (id: any, type: any, cutInfo: any) => void;
}

export function useViewerInteractionState({
  canUseTools,
  canEditObjectType,
  islands,
  stands,
  setIslands,
  setStands,
  cutPreviewRef,
  onConfirmCut,
}: UseViewerInteractionStateParams) {
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [focusTarget, setFocusTarget] = useState<any>(null);
  const [isPlanViewActive, setIsPlanViewActive] = useState(false);
  const [isTopViewReached, setIsTopViewReached] = useState(false);
  const [editMode, setEditMode] = useState<'camera' | 'select' | 'move' | 'shape' | 'cut' | 'merge' | 'duplicate'>('select');
  const [moveToolMode, setMoveToolMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [layerVisibility, setLayerVisibility] = useState({ islands: true, stands: true });
  const [cutAxis, setCutAxis] = useState<'x' | 'z'>('x');
  const [isDragging, setIsDragging] = useState(false);
  const [projectVersions, setProjectVersions] = useState<any[]>([]);
  const [reservationName, setReservationName] = useState('');
  const [isSaveVersionPanelOpen, setIsSaveVersionPanelOpen] = useState(false);
  const [versionDraftName, setVersionDraftName] = useState('');
  const [versionDraftLabel, setVersionDraftLabel] = useState('');
  const [versionDraftNotes, setVersionDraftNotes] = useState('');
  const [objectSearchTerm, setObjectSearchTerm] = useState('');
  const [objectNameDraft, setObjectNameDraft] = useState('');
  const [publishedVersionInfo, setPublishedVersionInfo] = useState<any>(null);
  const [duplicatingItem, setDuplicatingItem] = useState<any>(null);
  const [duplicatePreview, setDuplicatePreview] = useState<any>(null);

  const [history, setHistory] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);

  const saveHistory = () => {
    setHistory((prev) => [...prev, { islands: deepClone(islands), stands: deepClone(stands), focusTarget }]);
    setRedoStack([]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const prevState = history[history.length - 1];
    setRedoStack((prev) => [...prev, { islands: deepClone(islands), stands: deepClone(stands), focusTarget }]);

    setIslands(prevState.islands);
    setStands(prevState.stands);
    setFocusTarget(prevState.focusTarget);
    setHistory((prev) => prev.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setHistory((prev) => [...prev, { islands: deepClone(islands), stands: deepClone(stands), focusTarget }]);

    setIslands(nextState.islands);
    setStands(nextState.stands);
    setFocusTarget(nextState.focusTarget);
    setRedoStack((prev) => prev.slice(0, -1));
  };

  const resetInteractionAfterReload = () => {
    setFocusTarget(null);
    setIsTopViewReached(false);
    setHistory([]);
    setRedoStack([]);
  };

  useEffect(() => {
    const hasEditableFocus = !focusTarget || canEditObjectType(focusTarget.type);
    if (!canUseTools || !hasEditableFocus) {
      if (editMode !== 'select') setEditMode('select');
      if (moveToolMode !== 'translate') setMoveToolMode('translate');
    }
  }, [canEditObjectType, canUseTools, editMode, focusTarget, moveToolMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        redo();
      } else if (editMode === 'cut' && focusTarget) {
        if (e.key.toLowerCase() === 'v') {
          setCutAxis('x');
          e.preventDefault();
        } else if (e.key.toLowerCase() === 'h') {
          setCutAxis('z');
          e.preventDefault();
        } else if ((e.key === 'Enter' || e.key === ' ') && cutPreviewRef.current?.cutInfo) {
          const { id, type, cutInfo } = cutPreviewRef.current;
          onConfirmCut(id, type, cutInfo);
          e.preventDefault();
        }
      } else if (editMode === 'move' && focusTarget && canUseTools) {
        if (e.key.toLowerCase() === 'm') {
          setMoveToolMode('translate');
          e.preventDefault();
        } else if (e.key.toLowerCase() === 'r') {
          setMoveToolMode('rotate');
          e.preventDefault();
        } else if (e.key.toLowerCase() === 's') {
          setMoveToolMode('scale');
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUseTools, cutPreviewRef, editMode, focusTarget, history, islands, onConfirmCut, redoStack, stands]);

  return {
    hoveredName,
    setHoveredName,
    focusTarget,
    setFocusTarget,
    isPlanViewActive,
    setIsPlanViewActive,
    isTopViewReached,
    setIsTopViewReached,
    editMode,
    setEditMode,
    moveToolMode,
    setMoveToolMode,
    layerVisibility,
    setLayerVisibility,
    cutAxis,
    setCutAxis,
    isDragging,
    setIsDragging,
    projectVersions,
    setProjectVersions,
    reservationName,
    setReservationName,
    isSaveVersionPanelOpen,
    setIsSaveVersionPanelOpen,
    versionDraftName,
    setVersionDraftName,
    versionDraftLabel,
    setVersionDraftLabel,
    versionDraftNotes,
    setVersionDraftNotes,
    objectSearchTerm,
    setObjectSearchTerm,
    objectNameDraft,
    setObjectNameDraft,
    publishedVersionInfo,
    setPublishedVersionInfo,
    duplicatingItem,
    setDuplicatingItem,
    duplicatePreview,
    setDuplicatePreview,
    history,
    redoStack,
    saveHistory,
    undo,
    redo,
    resetInteractionAfterReload,
  };
}
