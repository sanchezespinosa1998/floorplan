// @ts-nocheck
/**
 * FreeShapeDrawSystem – herramienta de dibujo libre en el visor 3D.
 *
 * Flujo:
 *  1. El usuario activa "Dibujar isla libre" o "Dibujar stand libre" en la toolbar.
 *  2. FreeShapeDrawLayer captura clics en el suelo (plano invisible) y acumula puntos.
 *  3. Se muestra un preview: puntos, aristas y forma extruida translúcida.
 *  4. Doble clic (o Enter) → cierra el polígono y llama a onClose con los puntos.
 *  5. Escape → cancela.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const GRID_SNAP = 0.5;
const snapV = (v: number) => Math.round(v / GRID_SNAP) * GRID_SNAP;

// ─── FreeShapePreview ────────────────────────────────────────────────────────
// Renderiza el polígono en curso: aristas, vértices y forma extruida translúcida.
// Todo en coordenadas de mundo (World X, World Z).

interface FreeShapePreviewProps {
  worldPoints: [number, number][];          // puntos confirmados en mundo [wx, wz]
  cursorWorld: { x: number; z: number } | null;
  type: 'island' | 'stand';
}

function FreeShapePreview({ worldPoints, cursorWorld, type }: FreeShapePreviewProps) {
  const color = type === 'island' ? '#8B5CF6' : '#3B82F6';
  const h = type === 'island' ? 0.2 : 3;

  // Todos los puntos incluyendo la posición del cursor
  const allWorldPoints = useMemo<[number, number][]>(() => {
    if (cursorWorld && worldPoints.length >= 1) {
      return [...worldPoints, [cursorWorld.x, cursorWorld.z]];
    }
    return worldPoints;
  }, [worldPoints, cursorWorld]);

  // Buffer de líneas: aristas confirmadas + línea al cursor + cierre al primer punto
  const linePositions = useMemo<Float32Array>(() => {
    const verts: number[] = [];

    // Aristas entre puntos confirmados
    for (let i = 0; i < worldPoints.length - 1; i++) {
      verts.push(worldPoints[i][0], 0.18, worldPoints[i][1]);
      verts.push(worldPoints[i + 1][0], 0.18, worldPoints[i + 1][1]);
    }

    // Línea desde el último confirmado hasta el cursor
    if (cursorWorld && worldPoints.length >= 1) {
      const last = worldPoints[worldPoints.length - 1];
      verts.push(last[0], 0.18, last[1]);
      verts.push(cursorWorld.x, 0.18, cursorWorld.z);
    }

    // Línea de cierre (cursor → primer punto) cuando ya hay ≥3 puntos
    if (cursorWorld && worldPoints.length >= 3) {
      verts.push(cursorWorld.x, 0.18, cursorWorld.z);
      verts.push(worldPoints[0][0], 0.18, worldPoints[0][1]);
    }

    return new Float32Array(verts);
  }, [worldPoints, cursorWorld]);

  const lineGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    return g;
  }, [linePositions]);

  // Geometría de preview extruida (visible con ≥3 puntos en total)
  const previewGeom = useMemo<THREE.ExtrudeGeometry | null>(() => {
    if (allWorldPoints.length < 3) return null;
    // La shape usa coordenadas (worldX, -worldZ) para que después de
    // rotation=[-π/2, 0, 0] quede tumbada sobre el suelo correctamente.
    const s = new THREE.Shape();
    s.moveTo(allWorldPoints[0][0], -allWorldPoints[0][1]);
    for (let i = 1; i < allWorldPoints.length; i++) {
      s.lineTo(allWorldPoints[i][0], -allWorldPoints[i][1]);
    }
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false });
  }, [allWorldPoints, h]);

  return (
    <group>
      {/* Forma extruida translúcida */}
      {previewGeom && (
        <mesh
          geometry={previewGeom}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          renderOrder={3}
        >
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.22}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Aristas del polígono en curso */}
      {linePositions.length > 0 && (
        <lineSegments geometry={lineGeom} renderOrder={10}>
          <lineBasicMaterial
            color={color}
            transparent
            opacity={0.95}
            depthTest={false}
          />
        </lineSegments>
      )}

      {/* Puntos confirmados */}
      {worldPoints.map(([wx, wz], i) => (
        <mesh key={i} position={[wx, 0.28, wz]} renderOrder={20}>
          <sphereGeometry args={[0.22, 8, 8]} />
          <meshBasicMaterial
            color={i === 0 ? '#f97316' : color}
            depthTest={false}
          />
        </mesh>
      ))}

      {/* Indicador de posición del cursor */}
      {cursorWorld && (
        <mesh position={[cursorWorld.x, 0.28, cursorWorld.z]} renderOrder={22}>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.65} depthTest={false} />
        </mesh>
      )}

      {/* Etiqueta de estado sobre el primer punto */}
      {worldPoints.length > 0 && (
        <Html
          position={[worldPoints[0][0], h + 1.0, worldPoints[0][1]]}
          center
          distanceFactor={24}
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              background: 'rgba(8, 8, 12, 0.85)',
              color: '#fff',
              padding: '3px 9px',
              borderRadius: 6,
              fontSize: 11,
              border: `1px solid ${color}`,
              whiteSpace: 'nowrap',
              fontFamily: 'monospace',
              letterSpacing: '0.02em',
            }}
          >
            {worldPoints.length} pts
            {worldPoints.length >= 3
              ? ' · doble clic o Enter para cerrar'
              : ` · agrega ${3 - worldPoints.length} más`}
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── FreeShapeDrawLayer ───────────────────────────────────────────────────────
// Plano invisible de captura de clics + overlays de preview.
// Debe montarse dentro del <Canvas> de R3F.

export interface FreeShapeDrawLayerProps {
  active: boolean;
  /** Puntos en mundo [wx, wz] ya confirmados */
  worldPoints: [number, number][];
  type: 'island' | 'stand';
  gridSnapEnabled?: boolean;
  onAddPoint: (wx: number, wz: number) => void;
  /** Se llama cuando el usuario cierra el polígono (≥3 puntos) */
  onClose: () => void;
  /** Se llama cuando el usuario cancela (Escape) */
  onCancel: () => void;
}

export function FreeShapeDrawLayer({
  active,
  worldPoints,
  type,
  gridSnapEnabled = true,
  onAddPoint,
  onClose,
  onCancel,
}: FreeShapeDrawLayerProps) {
  const [cursorWorld, setCursorWorld] = useState<{ x: number; z: number } | null>(null);

  // Timer para distinguir clic simple de doble clic
  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Atajos de teclado: Escape para cancelar, Enter para cerrar
  useEffect(() => {
    if (!active) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter' && worldPoints.length >= 3) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [active, onCancel, onClose, worldPoints.length]);

  // Limpiar cursor al desactivar
  useEffect(() => {
    if (!active) {
      setCursorWorld(null);
      document.body.style.cursor = 'default';
    }
  }, [active]);

  // Limpiar timer pendiente al desmontar
  useEffect(() => {
    return () => {
      if (pendingRef.current) clearTimeout(pendingRef.current);
    };
  }, []);

  if (!active) return null;

  const getSnapped = (point: THREE.Vector3) => ({
    x: gridSnapEnabled ? snapV(point.x) : point.x,
    z: gridSnapEnabled ? snapV(point.z) : point.z,
  });

  return (
    <>
      {/* Plano transparente horizontal para capturar eventos del ratón */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.03, 0]}
        renderOrder={-1}
        onPointerMove={(e) => {
          e.stopPropagation();
          const { x, z } = getSnapped(e.point);
          setCursorWorld({ x, z });
          document.body.style.cursor = 'crosshair';
        }}
        onPointerLeave={() => {
          setCursorWorld(null);
          document.body.style.cursor = 'default';
        }}
        onClick={(e) => {
          e.stopPropagation();
          const { x, z } = getSnapped(e.point);

          if (pendingRef.current) {
            // Segundo clic dentro de la ventana → doble clic → cerrar
            clearTimeout(pendingRef.current);
            pendingRef.current = null;
            if (worldPoints.length >= 3) onClose();
            return;
          }

          pendingRef.current = setTimeout(() => {
            pendingRef.current = null;
            onAddPoint(x, z);
          }, 220);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (pendingRef.current) {
            clearTimeout(pendingRef.current);
            pendingRef.current = null;
          }
          if (worldPoints.length >= 3) onClose();
        }}
      >
        <planeGeometry args={[100000, 100000]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <FreeShapePreview
        worldPoints={worldPoints}
        cursorWorld={cursorWorld}
        type={type}
      />
    </>
  );
}
