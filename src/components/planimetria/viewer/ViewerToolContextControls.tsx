interface ViewerToolContextControlsProps {
  editMode: string;
  moveToolMode: string;
  setMoveToolMode: (mode: 'translate' | 'rotate') => void;
}

export function ViewerToolContextControls({
  editMode,
  moveToolMode,
  setMoveToolMode,
}: ViewerToolContextControlsProps) {
  if (editMode !== 'move') {
    return null;
  }

  return (
    <div className="polygon-toolbar-context-controls">
      <div className="move-mode-selector">
        <button
          className={`move-mode-btn ${moveToolMode === 'translate' ? 'active' : ''}`}
          onClick={() => setMoveToolMode('translate')}
          title="Mover (M)"
        >
          Mover
          <kbd>M</kbd>
        </button>
        <button
          className={`move-mode-btn ${moveToolMode === 'rotate' ? 'active' : ''}`}
          onClick={() => setMoveToolMode('rotate')}
          title="Rotar (R)"
        >
          Rotar
          <kbd>R</kbd>
        </button>
      </div>
    </div>
  );
}
