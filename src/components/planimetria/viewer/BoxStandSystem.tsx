// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from 'react';
import { Html, TransformControls } from '@react-three/drei';
import * as THREE from 'three';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface BoxStand {
  id: string;
  name: string;
  /** World-space center of the box */
  position: [number, number, number];
  /** [width, height, depth] in metres */
  size: [number, number, number];
  rotationY: number;
  color: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const snap = (v: number) => Math.round(v * 2) / 2;

const DEFAULT_SIZE: [number, number, number] = [3, 3, 3];
const BOX_TOOL_TOUCH_RADIUS = 0.96;
const clampNumber = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const getAdaptiveHandleScale = (distance: number, baseScale = 1) => clampNumber(distance * 0.035 * baseScale, 0.92 * baseScale, 1.95 * baseScale);

export const BOX_STAND_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

let colorCursor = 0;
const nextColor = () => BOX_STAND_COLORS[colorCursor++ % BOX_STAND_COLORS.length];

// ─── Floor click plane (inside Canvas) ───────────────────────────────────────

interface FloorClickPlaneProps {
  active: boolean;
  gridSnapEnabled?: boolean;
  onPlace: (x: number, z: number) => void;
}

export function FloorClickPlane({ active, gridSnapEnabled = true, onPlace }: FloorClickPlaneProps) {
  if (!active) return null;
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.01, 0]}
      renderOrder={-1}
      onClick={(e) => {
        e.stopPropagation();
        onPlace(gridSnapEnabled ? snap(e.point.x) : e.point.x, gridSnapEnabled ? snap(e.point.z) : e.point.z);
      }}
    >
      <planeGeometry args={[100000, 100000]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─── BoxStandMesh (inside Canvas) ────────────────────────────────────────────

interface BoxStandMeshProps {
  stand: BoxStand;
  isSelected: boolean;
  selectionEnabled?: boolean;
  showDuplicateArrows?: boolean;
  isScaleMode?: boolean;
  orbitRef: React.RefObject<any>;
  suppressClickRef: React.RefObject<boolean>;
  onSelect: (id: string) => void;
  onUpdatePosition: (id: string, pos: [number, number, number]) => void;
  onResizeFromFace?: (id: string, face: 'left' | 'right' | 'front' | 'back' | 'top', delta: number) => void;
  onDuplicateTowards: (id: string, side: 'left' | 'right' | 'front' | 'back') => void;
  gridSnapEnabled?: boolean;
  onSaveHistory?: () => void;
}

interface SideDuplicateArrowProps {
  position: [number, number, number];
  side: 'left' | 'right' | 'front' | 'back';
  onClick: (side: 'left' | 'right' | 'front' | 'back') => void;
}

function SideDuplicateArrow({ position, side, onClick }: SideDuplicateArrowProps) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group | null>(null);
  const worldPositionRef = useRef(new THREE.Vector3());

  const rotationY = {
    front: 0,
    right: -Math.PI / 2,
    back: Math.PI,
    left: Math.PI / 2,
  }[side];

  useFrame(({ clock, camera }) => {
    if (!groupRef.current) return;
    groupRef.current.getWorldPosition(worldPositionRef.current);
    const distance = camera.position.distanceTo(worldPositionRef.current);
    groupRef.current.scale.setScalar(getAdaptiveHandleScale(distance, 1.04));
    groupRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 1.8) * 0.04;
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotationY, 0]}
      onClick={(event) => {
        event.stopPropagation();
        onClick(side);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'copy';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      <mesh position={[0, -0.02, 0.08]} renderOrder={1198} raycast={() => null}>
        <cylinderGeometry args={[0.76, 0.92, 0.14, 28]} />
        <meshBasicMaterial color="#09111f" transparent opacity={0.8} depthTest={false} />
      </mesh>

      <mesh position={[0, 0, 0.12]} renderOrder={1199}>
        <cylinderGeometry args={[BOX_TOOL_TOUCH_RADIUS, BOX_TOOL_TOUCH_RADIUS, 0.22, 24]} />
        <meshBasicMaterial transparent opacity={0.01} depthWrite={false} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} renderOrder={1200} raycast={() => null}>
        <ringGeometry args={[0.98, 1.14, 32]} />
        <meshBasicMaterial color={hovered ? '#dbeafe' : '#1e3a8a'} transparent opacity={hovered ? 0.3 : 0.18} depthTest={false} />
      </mesh>

      <mesh position={[0, 0.08, 0.02]} renderOrder={1200}>
        <cylinderGeometry args={[0.22, 0.28, 0.22, 20]} />
        <meshStandardMaterial color={hovered ? '#f8fafc' : '#dbeafe'} emissive={hovered ? '#93c5fd' : '#60a5fa'} emissiveIntensity={0.34} metalness={0.18} roughness={0.22} depthTest={false} />
      </mesh>

      <mesh position={[0, 0.08, 0.4]} renderOrder={1200}>
        <coneGeometry args={[0.48, 0.92, 18]} />
        <meshBasicMaterial
          color={hovered ? '#f8fafc' : '#bfdbfe'}
          transparent
          opacity={1}
          depthTest={false}
        />
      </mesh>
      <mesh position={[0, 0.08, -0.14]} renderOrder={1200}>
        <cylinderGeometry args={[0.18, 0.18, 0.82, 14]} />
        <meshBasicMaterial
          color={hovered ? '#dbeafe' : '#60a5fa'}
          transparent
          opacity={0.98}
          depthTest={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} renderOrder={1200}>
        <ringGeometry args={[0.72, 0.92, 32]} />
        <meshBasicMaterial color={hovered ? '#60a5fa' : '#1d4ed8'} transparent opacity={hovered ? 0.92 : 0.62} depthTest={false} />
      </mesh>

      <Html
        position={[0, 0.12, 0.04]}
        center
        distanceFactor={10}
        zIndexRange={[80, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div className={`duplicate-tool-label ${hovered ? 'is-hovered' : ''}`}>
          Duplicar
        </div>
      </Html>
    </group>
  );
}

export function BoxStandMesh({
  stand,
  isSelected,
  selectionEnabled = true,
  showDuplicateArrows = false,
  isScaleMode = false,
  orbitRef,
  suppressClickRef,
  onSelect,
  onUpdatePosition,
  onResizeFromFace,
  onDuplicateTowards,
  gridSnapEnabled = true,
  onSaveHistory,
}: BoxStandMeshProps) {
  const [groupObj, setGroupObj] = useState<THREE.Group | null>(null);
  const [hovered, setHovered] = useState(false);
  const isDraggingTC = useRef(false);
  const faceDragRef = useRef<{
    active: boolean;
    face: 'left' | 'right' | 'front' | 'back' | 'top' | null;
    startX: number;
    startY: number;
    lastValue: number;
  }>({ active: false, face: null, startX: 0, startY: 0, lastValue: 0 });

  const [w, h, d] = stand.size;

  const edgesGeo = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)),
    [w, h, d],
  );

  // Dispose edges geometry when unmounted or size changes
  useEffect(() => () => { edgesGeo.dispose(); }, [edgesGeo]);

  const startFaceDrag = (face: 'left' | 'right' | 'front' | 'back' | 'top', e: any) => {
    e.stopPropagation();
    faceDragRef.current = {
      active: true,
      face,
      startX: e.nativeEvent?.clientX ?? 0,
      startY: e.nativeEvent?.clientY ?? 0,
      lastValue: 0,
    };
    onSaveHistory?.();
    if (orbitRef?.current) orbitRef.current.enabled = false;
    if (suppressClickRef) suppressClickRef.current = true;
    if (e.target?.setPointerCapture) {
      e.target.setPointerCapture(e.pointerId);
    }
    document.body.style.cursor = face === 'top' ? 'ns-resize' : 'ew-resize';
  };

  const moveFaceDrag = (face: 'left' | 'right' | 'front' | 'back' | 'top', e: any) => {
    const drag = faceDragRef.current;
    if (!drag.active || drag.face !== face || !onResizeFromFace) return;
    e.stopPropagation();

    const currentX = e.nativeEvent?.clientX ?? drag.startX;
    const currentY = e.nativeEvent?.clientY ?? drag.startY;
    const dx = currentX - drag.startX;
    const dy = currentY - drag.startY;

    let rawValue = 0;
    if (face === 'right') rawValue = dx * 0.02;
    if (face === 'left') rawValue = -dx * 0.02;
    if (face === 'front') rawValue = -dy * 0.02;
    if (face === 'back') rawValue = dy * 0.02;
    if (face === 'top') rawValue = -dy * 0.02;

    const step = rawValue - drag.lastValue;
    if (Math.abs(step) >= 0.01) {
      onResizeFromFace(stand.id, face, step);
      drag.lastValue = rawValue;
    }
  };

  const endFaceDrag = (face: 'left' | 'right' | 'front' | 'back' | 'top', e: any) => {
    const drag = faceDragRef.current;
    if (!drag.active || drag.face !== face) return;
    e.stopPropagation();
    drag.active = false;
    drag.face = null;
    drag.lastValue = 0;
    if (e.target?.releasePointerCapture) {
      e.target.releasePointerCapture(e.pointerId);
    }
    if (orbitRef?.current) orbitRef.current.enabled = true;
    setTimeout(() => {
      if (suppressClickRef) suppressClickRef.current = false;
    }, 60);
    document.body.style.cursor = 'default';
  };

  return (
    <>
      <group ref={setGroupObj} position={stand.position} rotation={[0, stand.rotationY, 0]}>
        {/* ── Main box mesh ── */}
        <mesh
          castShadow
          receiveShadow
          onClick={(e) => {
            e.stopPropagation();
            if (suppressClickRef?.current) return;
            if (!selectionEnabled) return;
            onSelect(stand.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'default';
          }}
        >
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial
            color={stand.color}
            metalness={0.15}
            roughness={0.5}
            transparent
            opacity={isSelected ? 0.88 : hovered ? 0.82 : 0.70}
            emissive={stand.color}
            emissiveIntensity={isSelected ? 0.28 : hovered ? 0.12 : 0.04}
          />
        </mesh>

        {/* ── Wireframe edges ── */}
        <lineSegments geometry={edgesGeo}>
          <lineBasicMaterial
            color={isSelected ? '#bfdbfe' : hovered ? '#93c5fd' : '#1e3a8a'}
            transparent
            opacity={isSelected ? 1 : hovered ? 0.7 : 0.35}
            depthTest={false}
          />
        </lineSegments>

        {/* ── Dimension label at top ── */}
        <Html
          position={[0, h / 2 + 0.5, 0]}
          center
          distanceFactor={18}
          zIndexRange={[30, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className={`box-stand-label ${isSelected ? 'box-stand-label--selected' : ''}`}>
            {stand.name}
            {isSelected && (
              <span className="bsl-dims">
                {w}×{d}×{h}m
              </span>
            )}
          </div>
        </Html>

        {isSelected && showDuplicateArrows && (
          <>
            <SideDuplicateArrow
              side="front"
              position={[0, h / 2 + 1.0, -(d / 2 + 1.6)]}
              onClick={(side) => onDuplicateTowards(stand.id, side)}
            />
            <SideDuplicateArrow
              side="back"
              position={[0, h / 2 + 1.0, d / 2 + 1.6]}
              onClick={(side) => onDuplicateTowards(stand.id, side)}
            />
            <SideDuplicateArrow
              side="right"
              position={[w / 2 + 1.6, h / 2 + 1.0, 0]}
              onClick={(side) => onDuplicateTowards(stand.id, side)}
            />
            <SideDuplicateArrow
              side="left"
              position={[-(w / 2 + 1.6), h / 2 + 1.0, 0]}
              onClick={(side) => onDuplicateTowards(stand.id, side)}
            />
          </>
        )}

        {isSelected && isScaleMode && (
          <>
            <mesh
              position={[w / 2 + 0.1, 0, 0]}
              onPointerDown={(e) => startFaceDrag('right', e)}
              onPointerMove={(e) => moveFaceDrag('right', e)}
              onPointerUp={(e) => endFaceDrag('right', e)}
            >
              <boxGeometry args={[0.74, Math.max(1.4, h * 0.66), Math.max(1.4, d * 0.66)]} />
              <meshBasicMaterial color="#fde68a" transparent opacity={0.7} depthTest={false} />
            </mesh>
            <mesh
              position={[-(w / 2 + 0.1), 0, 0]}
              onPointerDown={(e) => startFaceDrag('left', e)}
              onPointerMove={(e) => moveFaceDrag('left', e)}
              onPointerUp={(e) => endFaceDrag('left', e)}
            >
              <boxGeometry args={[0.74, Math.max(1.4, h * 0.66), Math.max(1.4, d * 0.66)]} />
              <meshBasicMaterial color="#fde68a" transparent opacity={0.7} depthTest={false} />
            </mesh>
            <mesh
              position={[0, 0, -(d / 2 + 0.1)]}
              onPointerDown={(e) => startFaceDrag('front', e)}
              onPointerMove={(e) => moveFaceDrag('front', e)}
              onPointerUp={(e) => endFaceDrag('front', e)}
            >
              <boxGeometry args={[Math.max(1.4, w * 0.66), Math.max(1.4, h * 0.66), 0.74]} />
              <meshBasicMaterial color="#fde68a" transparent opacity={0.7} depthTest={false} />
            </mesh>
            <mesh
              position={[0, 0, d / 2 + 0.1]}
              onPointerDown={(e) => startFaceDrag('back', e)}
              onPointerMove={(e) => moveFaceDrag('back', e)}
              onPointerUp={(e) => endFaceDrag('back', e)}
            >
              <boxGeometry args={[Math.max(1.4, w * 0.66), Math.max(1.4, h * 0.66), 0.74]} />
              <meshBasicMaterial color="#fde68a" transparent opacity={0.7} depthTest={false} />
            </mesh>
            <mesh
              position={[0, h / 2 + 0.1, 0]}
              onPointerDown={(e) => startFaceDrag('top', e)}
              onPointerMove={(e) => moveFaceDrag('top', e)}
              onPointerUp={(e) => endFaceDrag('top', e)}
            >
              <boxGeometry args={[Math.max(1.5, w * 0.56), 0.46, Math.max(1.5, d * 0.56)]} />
              <meshBasicMaterial color="#fef3c7" transparent opacity={0.65} depthTest={false} />
            </mesh>
          </>
        )}
      </group>

      {/* ── TransformControls (translate X-Z only) ── */}
      {isSelected && groupObj && !isScaleMode && (
        <TransformControls
          object={groupObj}
          mode="translate"
          translationSnap={gridSnapEnabled ? 0.5 : undefined}
          showX
          showY={false}
          showZ
          onMouseDown={() => {
            isDraggingTC.current = true;
            onSaveHistory?.();
            if (suppressClickRef) suppressClickRef.current = true;
            if (orbitRef?.current) orbitRef.current.enabled = false;
          }}
          onMouseUp={() => {
            isDraggingTC.current = false;
            if (!groupObj) return;
            const p = groupObj.position;
            onUpdatePosition(stand.id, [gridSnapEnabled ? snap(p.x) : p.x, stand.position[1], gridSnapEnabled ? snap(p.z) : p.z]);
            if (orbitRef?.current) orbitRef.current.enabled = true;
            setTimeout(() => {
              if (suppressClickRef) suppressClickRef.current = false;
            }, 60);
          }}
        />
      )}
    </>
  );
}

// ─── BoxStandProperties panel (outside Canvas) ───────────────────────────────

interface BoxStandPropertiesProps {
  stand: BoxStand | null;
  onUpdate: (id: string, patch: Partial<BoxStand>) => void;
  onDelete: (id: string) => void;
}

export function BoxStandProperties({ stand, onUpdate, onDelete }: BoxStandPropertiesProps) {
  if (!stand) return null;

  const [w, h, d] = stand.size;

  const handleDim = (axis: 0 | 1 | 2, raw: string) => {
    const val = Math.max(0.5, snap(parseFloat(raw) || 0.5));
    const newSize: [number, number, number] = [...stand.size] as any;
    newSize[axis] = val;
    // Adjust Y position so bottom stays on ground when height changes
    const newY = newSize[1] / 2;
    onUpdate(stand.id, {
      size: newSize,
      position: [stand.position[0], newY, stand.position[2]],
    });
  };

  return (
    <div className="bsp-panel">
      {/* Header: name + delete */}
      <div className="bsp-header">
        <input
          className="bsp-name"
          value={stand.name}
          onChange={(e) => onUpdate(stand.id, { name: e.target.value })}
          placeholder="Nombre del stand"
        />
        <button
          className="bsp-delete"
          onClick={() => onDelete(stand.id)}
          title="Eliminar stand"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>

      {/* Dimensions */}
      <div className="bsp-dims-grid">
        {([
          { label: 'Ancho', axis: 0 as 0 | 1 | 2, val: w, title: 'Dimensión X (izq-der)' },
          { label: 'Fondo', axis: 2 as 0 | 1 | 2, val: d, title: 'Dimensión Z (frente-fondo)' },
          { label: 'Alto', axis: 1 as 0 | 1 | 2, val: h, title: 'Dimensión Y (altura)' },
        ] as const).map(({ label, axis, val, title }) => (
          <label key={axis} className="bsp-dim-field" title={title}>
            <span className="bsp-dim-label">{label}</span>
            <div className="bsp-dim-input-wrap">
              <input
                type="number"
                className="bsp-dim-input"
                value={val}
                min={0.5}
                step={0.5}
                onChange={(e) => handleDim(axis, e.target.value)}
              />
              <span className="bsp-dim-unit">m</span>
            </div>
          </label>
        ))}
      </div>

      {/* Color chips */}
      <div className="bsp-colors">
        {BOX_STAND_COLORS.map((c) => (
          <button
            key={c}
            className={`bsp-chip ${stand.color === c ? 'bsp-chip--active' : ''}`}
            style={{ '--chip-color': c } as React.CSSProperties}
            onClick={() => onUpdate(stand.id, { color: c })}
            title={c}
          />
        ))}
      </div>

      {/* Position info */}
      <div className="bsp-pos-info">
        <span>X {stand.position[0].toFixed(1)}</span>
        <span>·</span>
        <span>Z {stand.position[2].toFixed(1)}</span>
      </div>
    </div>
  );
}

// ─── BoxStandToolbar button (outside Canvas) ──────────────────────────────────

interface BoxStandToolbarProps {
  isPlacing: boolean;
  canEdit: boolean;
  onToggle: () => void;
}

export function BoxStandToolbar({ isPlacing, canEdit, onToggle }: BoxStandToolbarProps) {
  if (!canEdit) return null;
  return (
    <div className={`bst-fab ${isPlacing ? 'bst-fab--active' : ''}`}>
      <button className="bst-btn" onClick={onToggle} title={isPlacing ? 'Cancelar colocación (Esc)' : 'Añadir stand (clic en el plano)'}>
        {isPlacing ? (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span>Cancelar</span>
          </>
        ) : (
          <>
            {/* Cube icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span>Añadir Stand</span>
          </>
        )}
      </button>
      {isPlacing && (
        <div className="bst-hint">Haz clic en el plano para colocar el stand</div>
      )}
    </div>
  );
}

// ─── Placement cursor overlay (outside Canvas) ────────────────────────────────

export function PlacementCursor({ active }: { active: boolean }) {
  useEffect(() => {
    if (active) {
      document.body.style.cursor = 'crosshair';
    } else {
      document.body.style.cursor = '';
    }
    return () => { document.body.style.cursor = ''; };
  }, [active]);
  return null;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createBoxStand(x: number, z: number, index: number): BoxStand {
  const [w, h, d] = DEFAULT_SIZE;
  return {
    id: `bs-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    name: `Stand ${index + 1}`,
    position: [snap(x), h / 2, snap(z)],
    size: [...DEFAULT_SIZE] as [number, number, number],
    rotationY: 0,
    color: nextColor(),
  };
}
