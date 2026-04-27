import {
  Box,
  BrickWall,
  CopyPlus,
  Hand,
  Maximize,
  PenLine,
  RotateCw,
  Scaling,
  ScanEye,
  Spline,
  SquareMousePointer,
  Trash2,
  Undo2,
  Redo2,
  XCircle,
} from 'lucide-react';
import React from 'react';

/** Icono compuesto: icono base + mini lápiz en esquina inferior-derecha */
function IconWithPen({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={20} />
      <PenLine
        size={9}
        style={{
          position: 'absolute',
          bottom: -2,
          right: -3,
          color: '#a78bfa',
          filter: 'drop-shadow(0 0 2px #7c3aed)',
          pointerEvents: 'none',
        }}
      />
    </span>
  );
}

interface FocusTarget {
  id: string | number;
  type: string;
}

interface ViewerEditingToolbarProps {
  isPlanViewActive: boolean;
  canEditFocusedObject: boolean;
  canCreateObjects: boolean;
  focusTarget: FocusTarget | null;
  hasBoxStandSelection?: boolean;
  canEditObjectType: (type: string) => boolean;
  editMode: string;
  moveToolMode: string;
  freeShapeMode: string | null;
  onActivateCameraMode: () => void;
  onActivateSelectMode: () => void;
  onActivateShapeMode: () => void;
  onActivateRotateMode: () => void;
  onActivateDuplicateTool: () => void;
  onActivateScaleMode: () => void;
  onActivateWallsTool: () => void;
  onFocusSelectedObject: () => void;
  handleCreateStand: () => void;
  handleCreateIsland: () => void;
  handleCreateFreeIsland: () => void;
  handleCreateFreeStand: () => void;
  handleDeleteSelection: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function ViewerEditingToolbar({
  isPlanViewActive,
  canEditFocusedObject,
  canCreateObjects,
  focusTarget,
  hasBoxStandSelection = false,
  canEditObjectType,
  editMode,
  moveToolMode,
  freeShapeMode,
  onActivateCameraMode,
  onActivateSelectMode,
  onActivateShapeMode,
  onActivateRotateMode,
  onActivateDuplicateTool,
  onActivateScaleMode,
  onActivateWallsTool,
  onFocusSelectedObject,
  handleCreateStand,
  handleCreateIsland,
  handleCreateFreeIsland,
  handleCreateFreeStand,
  handleDeleteSelection,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: ViewerEditingToolbarProps) {

  if (!canEditFocusedObject) {
    return null;
  }

  const canDeleteSelection = Boolean(focusTarget && canEditObjectType(focusTarget.type));
  const hasSelection = Boolean(focusTarget);
  const hasAnySelection = hasSelection || hasBoxStandSelection;
  const hasDuplicateTarget = hasAnySelection;

  return (
    <React.Fragment>
      {editMode === 'walls' && (
        <div
          style={{
            position: 'fixed',
            bottom: 110,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(10,10,18,0.92)',
            border: '1px solid #1d4ed8',
            color: '#bfdbfe',
            padding: '6px 18px',
            borderRadius: 8,
            fontSize: 12,
            fontFamily: 'monospace',
            pointerEvents: 'none',
            zIndex: 9999,
            whiteSpace: 'nowrap',
            letterSpacing: '0.03em',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <BrickWall size={14} />
          Herramienta de paredes · clic en un lateral para añadir · clic en una pared para quitar · Esc para salir
        </div>
      )}
      {freeShapeMode && (
        <div
          style={{
            position: 'fixed',
            bottom: 110,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(10,10,18,0.88)',
            border: `1px solid ${freeShapeMode === 'island' ? '#8B5CF6' : '#3B82F6'}`,
            color: '#fff',
            padding: '6px 16px',
            borderRadius: 8,
            fontSize: 12,
            fontFamily: 'monospace',
            pointerEvents: 'none',
            zIndex: 9999,
            whiteSpace: 'nowrap',
            letterSpacing: '0.03em',
          }}
        >
          Dibujando {freeShapeMode === 'island' ? 'isla' : 'stand'} libre
          &nbsp;·&nbsp;
          clic para agregar punto &nbsp;·&nbsp; doble clic / Enter para cerrar &nbsp;·&nbsp; Esc para cancelar
        </div>
      )}
      <div className="polygon-toolbar polygon-toolbar-pen">
        <div className="polygon-toolbar-group">
          <button
            className={`toolbar-btn ${editMode === 'camera' ? 'active' : ''}`}
            onClick={onActivateCameraMode}
            title="Mover camara"
          >
            <Hand size={20} />
            <span className="toolbar-tooltip">Mover camara</span>
          </button>
          <button
            className={`toolbar-btn ${editMode === 'move' && moveToolMode === 'translate' ? 'active' : ''}`}
            onClick={onActivateSelectMode}
            title="Seleccionar objeto"
          >
            <SquareMousePointer size={20} />
            <span className="toolbar-tooltip">Seleccionar</span>
          </button>
          <button
            className={`toolbar-btn ${editMode === 'shape' ? 'active' : ''}`}
            onClick={onActivateShapeMode}
            title="Editar forma"
            disabled={!hasSelection}
          >
            <Spline size={20} />
            <span className="toolbar-tooltip">Editar Forma</span>
          </button>
          <button
            className={`toolbar-btn ${editMode === 'walls' ? 'active' : ''}`}
            onClick={onActivateWallsTool}
            title="Herramienta de paredes (W)"
            disabled={focusTarget?.type !== 'stand'}
          >
            <BrickWall size={20} />
            <span className="toolbar-tooltip">Paredes (W)</span>
          </button>
          <button
            className={`toolbar-btn ${editMode === 'move' && moveToolMode === 'rotate' ? 'active' : ''}`}
            onClick={onActivateRotateMode}
            disabled={!hasSelection}
            title="Rotar objeto"
          >
            <RotateCw size={20} />
            <span className="toolbar-tooltip">Rotar</span>
          </button>
          <button
            className={`toolbar-btn ${editMode === 'duplicate' ? 'active' : ''}`}
            onClick={onActivateDuplicateTool}
            disabled={!hasDuplicateTarget}
            title="Duplicar"
          >
            <CopyPlus size={20} />
            <span className="toolbar-tooltip">Duplicar</span>
          </button>
          <button
            className={`toolbar-btn ${editMode === 'move' && moveToolMode === 'scale' ? 'active' : ''}`}
            onClick={onActivateScaleMode}
            disabled={!hasAnySelection}
            title="Escalar objeto"
          >
            <Scaling size={20} />
            <span className="toolbar-tooltip">Escalar</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={onFocusSelectedObject}
            disabled={!hasSelection}
            title="Enfocar objeto"
          >
            <ScanEye size={20} />
            <span className="toolbar-tooltip">Enfocar objeto</span>
          </button>
        </div>
        <div className="toolbar-divider" />
        <div className="polygon-toolbar-group">
          <button
            className="toolbar-btn"
            onClick={handleCreateStand}
            disabled={!canCreateObjects}
            title="Crear stand"
          >
            <Box size={20} />
            <span className="toolbar-tooltip">Nuevo stand</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={handleCreateIsland}
            disabled={!canCreateObjects}
            title="Crear isla"
          >
            <Maximize size={20} />
            <span className="toolbar-tooltip">Nueva isla</span>
          </button>
          <button
            className={`toolbar-btn ${freeShapeMode === 'island' ? 'active' : ''}`}
            onClick={handleCreateFreeIsland}
            disabled={!canCreateObjects && freeShapeMode !== 'island'}
            title="Dibujar isla libre"
          >
            <IconWithPen icon={Maximize} />
            <span className="toolbar-tooltip">Isla libre</span>
          </button>
          <button
            className={`toolbar-btn ${freeShapeMode === 'stand' ? 'active' : ''}`}
            onClick={handleCreateFreeStand}
            disabled={!canCreateObjects && freeShapeMode !== 'stand'}
            title="Dibujar stand libre"
          >
            <IconWithPen icon={Box} />
            <span className="toolbar-tooltip">Stand libre</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={handleDeleteSelection}
            disabled={!canDeleteSelection}
            title="Eliminar selección"
          >
            <Trash2 size={20} />
            <span className="toolbar-tooltip">Eliminar</span>
          </button>
        </div>
        <div className="toolbar-divider" />
        <div className="polygon-toolbar-group">
          <button
            className="toolbar-btn"
            onClick={onUndo}
            disabled={!canUndo}
            title="Atras"
          >
            <Undo2 size={20} />
            <span className="toolbar-tooltip">Atras</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={onRedo}
            disabled={!canRedo}
            title="Adelante"
          >
            <Redo2 size={20} />
            <span className="toolbar-tooltip">Adelante</span>
          </button>
        </div>
      </div>
    </React.Fragment>
  );
}
