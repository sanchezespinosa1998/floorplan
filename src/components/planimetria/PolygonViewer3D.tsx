// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Grid, PerspectiveCamera, ContactShadows, TransformControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';
import { Camera, Grid3x3, Magnet, MonitorUp, Save, Unplug } from 'lucide-react';
import {
  requestBooking as requestReservation,
  bookings as reservations,
  roleLabels,
  setBookingStatus as setReservationStatus,
  stands as fairStandsRegistry,
  subscribeToFairRealtime,
} from '@/data/mockData';
import { useProfile } from '@/context/ProfileContext';
import { CameraController, PlanViewController } from '@/components/planimetria/viewer/CameraControllers';
import { useViewerInteractionState } from '@/components/planimetria/viewer/useViewerInteractionState';
import { ObjectListPanel } from '@/components/planimetria/viewer/ObjectListPanel';
import { ObjectPropertiesPanel } from '@/components/planimetria/viewer/ObjectPropertiesPanel';
import { ViewerEditingToolbar } from '@/components/planimetria/viewer/ViewerEditingToolbar';
import { ViewerActionBar } from '@/components/planimetria/viewer/ViewerActionBar';
import { Model3D } from '@/components/planimetria/viewer/RevitModelLoader';
import {
  BoxStandMesh,
  BoxStandProperties,
  BoxStandToolbar,
  FloorClickPlane,
  PlacementCursor,
  createBoxStand,
  type BoxStand,
} from '@/components/planimetria/viewer/BoxStandSystem';
import { FreeShapeDrawLayer } from '@/components/planimetria/viewer/FreeShapeDrawSystem';
import './PolygonViewer3D.css';

// --- HELPERS ---
const GRID_SNAP = 0.5;
const snapValue = (val) => Math.round(val / GRID_SNAP) * GRID_SNAP;
const snapPoint = ([x, z]) => [snapValue(x), snapValue(z)];
const snapPoints = (points = []) => points.map((point) => snapPoint(point));
const snapPosition = ([x, y = 0, z]) => [snapValue(x), y, snapValue(z)];

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const REAL_STAND_REFERENCES = [
  {
    id: 'rs-premium',
    name: 'Stand Premium Abierto',
    footprint: 36,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    caption: 'Corner con isla central y mostrador curvo',
  },
  {
    id: 'rs-modular',
    name: 'Stand Modular 6x4',
    footprint: 24,
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
    caption: 'Sistema modular para demos y reuniones cortas',
  },
  {
    id: 'rs-compact',
    name: 'Stand Compacto 4x4',
    footprint: 16,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    caption: 'Formato de impacto para marcas emergentes',
  },
  {
    id: 'rs-micro',
    name: 'Stand Micro 3x3',
    footprint: 9,
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
    caption: 'Punto de contacto rapido para lead capture',
  },
];

const calculateBounds = (islands, stands) => {
  let minX = Infinity, maxX = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  
  const processPoints = (points, offsetX, offsetZ, rotationY = 0) => {
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);

    points.forEach(([px, pz]) => {
      const localX = px;
      // In this model, the second polygon coordinate maps to world -Z.
      const localZ = -pz;

      const rotatedX = localX * cosY - localZ * sinY;
      const rotatedZ = localX * sinY + localZ * cosY;

      const x = rotatedX + offsetX;
      const z = rotatedZ + offsetZ;

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    });
  };
  
  islands.forEach(island => {
    if (island.points && island.position) {
      processPoints(island.points, island.position[0], island.position[2], island.rotationY || 0);
    }
  });
  
  stands.forEach(stand => {
    if (stand.points && stand.position) {
      processPoints(stand.points, stand.position[0], stand.position[2], stand.rotationY || 0);
    }
  });
  
  if (minX === Infinity) {
    return { centerX: 0, centerZ: 0, width: 50, height: 50 };
  }
  
  const padding = 15;
  const width = (maxX - minX) + padding * 2;
  const height = (maxZ - minZ) + padding * 2;
  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;
  
  return { centerX, centerZ, width, height };
};

const renumberStands = (standsList) => {
  const ordered = [...standsList].sort((a, b) => {
    if (a.islandId !== b.islandId) return String(a.islandId).localeCompare(String(b.islandId));
    if (a.position[0] !== b.position[0]) return a.position[0] - b.position[0];
    return a.position[2] - b.position[2];
  });
  return ordered.map((stand, index) => ({
    ...stand,
    name: stand.standCode || stand.name || `Stand ${index + 1}`,
  }));
};

const summarizeNames = (items, maxItems = 4) => {
  if (!items.length) return 'Ninguno';
  const names = items.map((item) => item.name);
  if (names.length <= maxItems) return names.join(', ');
  return `${names.slice(0, maxItems).join(', ')} +${names.length - maxItems}`;
};

const TOOL_HANDLE_TOUCH_RADIUS = 0.66;
const TOOL_DUPLICATE_TOUCH_RADIUS = 0.94;
const clampNumber = (value, min, max) => Math.min(max, Math.max(min, value));
const getAdaptiveHandleScale = (distance, baseScale = 1) => clampNumber(distance * 0.035 * baseScale, 0.94 * baseScale, 1.9 * baseScale);

// Manejador de vértice: diamante sólido con pulso — para ARRASTRAR y reposicionar
// Clic derecho (o doble clic) sobre él lo ELIMINA si el polígono tiene > 3 vértices
function VertexHandle({ position, onPointerDown, onDelete, canDelete, color = "#f472b6" }) {
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [rightHovered, setRightHovered] = useState(false);
  const groupRef = useRef();
  const meshRef = useRef();
  const ringRef = useRef();
  const plateRef = useRef();
  const worldPositionRef = useRef(new THREE.Vector3());

  const handlePointerEnter = (e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'grab';
  };

  const handlePointerLeave = () => {
    setHovered(false);
    setDragging(false);
    setRightHovered(false);
    document.body.style.cursor = 'default';
  };

  const handlePointerPress = (e) => {
    e.stopPropagation();
    if (e.button === 2) {
      if (canDelete && onDelete) onDelete();
      return;
    }
    setDragging(true);
    document.body.style.cursor = 'grabbing';
    onPointerDown(e);
  };

  useFrame(({ clock, camera }) => {
    if (groupRef.current) {
      groupRef.current.getWorldPosition(worldPositionRef.current);
      const distance = camera.position.distanceTo(worldPositionRef.current);
      groupRef.current.scale.setScalar(getAdaptiveHandleScale(distance, 1));
    }
    if (meshRef.current) {
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.12;
      meshRef.current.scale.setScalar(hovered || dragging ? 1.4 : pulse);
    }
    if (ringRef.current) {
      ringRef.current.rotation.y += 0.03;
      ringRef.current.material.opacity = rightHovered ? 0.96 : hovered ? 0.82 : 0.46;
    }
    if (plateRef.current) {
      plateRef.current.rotation.y -= 0.01;
      plateRef.current.material.opacity = hovered || dragging ? 0.92 : 0.68;
    }
  });

  const deleteColor = "#ef4444";
  const displayColor = rightHovered && canDelete ? deleteColor : color;

  return (
    <group ref={groupRef} position={position}>
      <mesh
        onPointerOver={handlePointerEnter}
        onPointerOut={handlePointerLeave}
        onPointerDown={handlePointerPress}
        onContextMenu={(e) => {
          e.stopPropagation();
          e.nativeEvent?.preventDefault?.();
        }}
        onPointerMove={(e) => {
          if (e.buttons === 2) setRightHovered(true);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (canDelete && onDelete) onDelete();
        }}
      >
        <sphereGeometry args={[TOOL_HANDLE_TOUCH_RADIUS, 20, 20]} />
        <meshBasicMaterial transparent opacity={0.01} depthWrite={false} />
      </mesh>

      <mesh ref={plateRef} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <cylinderGeometry args={[0.62, 0.74, 0.12, 28]} />
        <meshBasicMaterial color={rightHovered && canDelete ? '#3f0a0a' : '#09111f'} transparent opacity={0.78} depthTest={false} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} raycast={() => null}>
        <ringGeometry args={[0.84, 0.98, 32]} />
        <meshBasicMaterial color={displayColor} transparent opacity={hovered || dragging ? 0.38 : 0.2} depthTest={false} />
      </mesh>

      {/* Anillo exterior giratorio — se vuelve rojo al hover derecho */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <torusGeometry args={[0.56, 0.07, 12, 32]} />
        <meshBasicMaterial color={displayColor} transparent opacity={hovered || dragging ? 0.7 : 0.4} depthTest={false} />
      </mesh>

      <mesh position={[0, 0.06, 0]} raycast={() => null}>
        <cylinderGeometry args={[0.36, 0.42, 0.18, 20]} />
        <meshStandardMaterial color={displayColor} emissive={displayColor} emissiveIntensity={hovered || dragging ? 0.55 : 0.28} metalness={0.18} roughness={0.28} depthTest={false} />
      </mesh>

      {/* Núcleo principal */}
      <mesh
        ref={meshRef}
        position={[0, 0.18, 0]}
        onPointerOver={handlePointerEnter}
        onPointerOut={handlePointerLeave}
        onPointerDown={handlePointerPress}
        onContextMenu={(e) => {
          e.stopPropagation();
          e.nativeEvent?.preventDefault?.();
        }}
        onPointerMove={(e) => {
          // Detectar si el botón derecho está presionado para colorear en rojo
          if (e.buttons === 2) setRightHovered(true);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (canDelete && onDelete) onDelete();
        }}
      >
        <sphereGeometry args={[0.28, 20, 20]} />
        <meshStandardMaterial
          color={rightHovered && canDelete ? "#ffffff" : hovered || dragging ? "#ffffff" : displayColor}
          emissive={displayColor}
          emissiveIntensity={rightHovered && canDelete ? 1.5 : hovered || dragging ? 1.0 : 0.6}
          metalness={0.3}
          roughness={0.1}
          depthTest={false}
        />
      </mesh>

      <mesh position={[0, 0.31, 0]} raycast={() => null}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={hovered || dragging ? 0.95 : 0.72} depthTest={false} />
      </mesh>

      <Html
        position={[0, 0.78, 0]}
        center
        distanceFactor={9}
        zIndexRange={[90, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div className={`shape-handle-label shape-handle-label--move ${hovered || dragging ? 'is-hovered' : ''}`}>
          Mover
        </div>
      </Html>

      {/* Cruz de × visible solo en hover derecho cuando se puede eliminar */}
      {rightHovered && canDelete && (
        <group>
          <mesh raycast={() => null} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.5, 0.06, 0.06]} />
            <meshBasicMaterial color={deleteColor} depthTest={false} />
          </mesh>
          <mesh raycast={() => null} rotation={[0, -Math.PI / 4, 0]}>
            <boxGeometry args={[0.5, 0.06, 0.06]} />
            <meshBasicMaterial color={deleteColor} depthTest={false} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// Manejador de punto medio: cubo rotado — para AÑADIR un nuevo vértice
function MidpointHandle({ position, onClick }) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef();
  const plateRef = useRef();
  const coreRef = useRef();
  const worldPositionRef = useRef(new THREE.Vector3());

  const handlePointerEnter = (e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'cell';
  };

  const handlePointerLeave = () => {
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  useFrame(({ clock, camera }) => {
    if (groupRef.current) {
      groupRef.current.getWorldPosition(worldPositionRef.current);
      const distance = camera.position.distanceTo(worldPositionRef.current);
      groupRef.current.scale.setScalar(getAdaptiveHandleScale(distance, 0.96));
    }
    if (plateRef.current) {
      plateRef.current.rotation.y = clock.getElapsedTime() * 0.6;
      plateRef.current.material.opacity = hovered ? 0.92 : 0.66;
    }
    if (coreRef.current) {
      coreRef.current.position.y = 0.12 + Math.sin(clock.getElapsedTime() * 2.4) * 0.02;
      coreRef.current.scale.setScalar(hovered ? 1.12 : 1);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={handlePointerEnter}
        onPointerOut={handlePointerLeave}
      >
        <sphereGeometry args={[TOOL_HANDLE_TOUCH_RADIUS * 0.92, 18, 18]} />
        <meshBasicMaterial transparent opacity={0.01} depthWrite={false} />
      </mesh>

      <mesh ref={plateRef} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} raycast={() => null}>
        <cylinderGeometry args={[0.54, 0.66, 0.12, 28]} />
        <meshBasicMaterial color="#091713" transparent opacity={0.7} depthTest={false} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} raycast={() => null}>
        <ringGeometry args={[0.72, 0.86, 28]} />
        <meshBasicMaterial color={hovered ? '#bbf7d0' : '#4ade80'} transparent opacity={hovered ? 0.36 : 0.2} depthTest={false} />
      </mesh>

      <group ref={coreRef}>
        <mesh onClick={(e) => { e.stopPropagation(); onClick(); }} onPointerOver={handlePointerEnter} onPointerOut={handlePointerLeave}>
          <cylinderGeometry args={[0.22, 0.28, 0.18, 20]} />
          <meshStandardMaterial color={hovered ? '#86efac' : '#4ade80'} emissive="#4ade80" emissiveIntensity={hovered ? 0.9 : 0.35} metalness={0.12} roughness={0.22} depthTest={false} />
        </mesh>
      </group>

      <mesh raycast={() => null} position={[0, 0.12, 0]}>
        <boxGeometry args={[0.76, 0.08, 0.12]} />
        <meshBasicMaterial color={hovered ? "#86efac" : "#4ade80"} transparent opacity={hovered ? 0.9 : 0.5} depthTest={false} />
      </mesh>
      <mesh raycast={() => null} position={[0, 0.12, 0]}>
        <boxGeometry args={[0.12, 0.08, 0.76]} />
        <meshBasicMaterial color={hovered ? "#86efac" : "#4ade80"} transparent opacity={hovered ? 0.9 : 0.5} depthTest={false} />
      </mesh>
      <mesh raycast={() => null} position={[0, 0.24, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color="#f0fdf4" transparent opacity={hovered ? 0.96 : 0.76} depthTest={false} />
      </mesh>

      <Html
        position={[0, 0.72, 0]}
        center
        distanceFactor={9}
        zIndexRange={[90, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div className={`shape-handle-label shape-handle-label--add ${hovered ? 'is-hovered' : ''}`}>
          Añadir
        </div>
      </Html>
    </group>
  );
}

function StandDuplicateArrow3D({ position, side, onClick }) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef();
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
    groupRef.current.scale.setScalar(getAdaptiveHandleScale(distance, 1.02));
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
      <mesh position={[0, -0.02, 0.08]} renderOrder={1098} raycast={() => null}>
        <cylinderGeometry args={[0.74, 0.88, 0.14, 28]} />
        <meshBasicMaterial color="#22081f" transparent opacity={0.76} depthTest={false} />
      </mesh>

      <mesh position={[0, 0.05, 0.18]} renderOrder={1099}>
        <cylinderGeometry args={[TOOL_DUPLICATE_TOUCH_RADIUS, TOOL_DUPLICATE_TOUCH_RADIUS, 0.2, 24]} />
        <meshBasicMaterial transparent opacity={0.01} depthWrite={false} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} renderOrder={1100}>
        <ringGeometry args={[0.68, 0.88, 28]} />
        <meshBasicMaterial color={hovered ? '#f472b6' : '#ec4899'} transparent opacity={hovered ? 0.95 : 0.72} depthTest={false} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} renderOrder={1100} raycast={() => null}>
        <ringGeometry args={[0.92, 1.06, 28]} />
        <meshBasicMaterial color={hovered ? '#f9a8d4' : '#831843'} transparent opacity={hovered ? 0.34 : 0.18} depthTest={false} />
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

// --- HELPERS DE MÉTRICAS ---
function computePolygonMetrics(points) {
  if (!points || points.length < 3) return { area: 0, width: 0, depth: 0, perimeter: 0 };
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  let area = 0, perimeter = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const [x, y] = points[i];
    const [nx, ny] = points[(i + 1) % n];
    area += x * ny - nx * y;
    perimeter += Math.sqrt((nx - x) ** 2 + (ny - y) ** 2);
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
  return {
    area: Math.abs(area / 2),
    width: maxX - minX,
    depth: maxY - minY,
    perimeter,
  };
}

// Cotas técnicas sobre cada arista del polígono
function EdgeDimensions({ points, h, name, type }) {
  const accentColor = type === 'island' ? '#38bdf8' : '#f472b6';
  const dimY = h + 0.15; // Altura a la que flotan las cotas sobre la cara superior

  // Calcula el centroide para saber en qué dirección "sacar" la cota hacia afuera
  const centroid = useMemo(() => {
    const cx = points.reduce((s, p) => s + p[0], 0) / points.length;
    const cy = points.reduce((s, p) => s + p[1], 0) / points.length;
    return { x: cx, y: cy };
  }, [points]);

  const metrics = useMemo(() => computePolygonMetrics(points), [points]);

  const edges = useMemo(() => {
    return points.map((p, i) => {
      const next = points[(i + 1) % points.length];
      const mx = (p[0] + next[0]) / 2;
      const my = (p[1] + next[1]) / 2;
      const len = Math.sqrt((next[0] - p[0]) ** 2 + (next[1] - p[1]) ** 2);

      // Vector normal de la arista apuntando hacia afuera del centroide
      const edgeDx = next[0] - p[0];
      const edgeDy = next[1] - p[1];
      const normalX = edgeDy;
      const normalY = -edgeDx;
      const normalLen = Math.sqrt(normalX ** 2 + normalY ** 2) || 1;
      const outX = normalX / normalLen;
      const outY = normalY / normalLen;

      // Verificar que apunta hacia afuera (no hacia el centroide)
      const toCentX = centroid.x - mx;
      const toCentY = centroid.y - my;
      const dot = outX * toCentX + outY * toCentY;
      const sign = dot < 0 ? 1 : -1;

      const offset = 0.7; // metros de separación de la arista
      return {
        key: i,
        // Puntos extremos de la línea de cota en 3D [x, y(altura), z]
        p1: [p[0] + outX * sign * offset, dimY, -p[1] + outY * sign * offset * -1],
        p2: [next[0] + outX * sign * offset, dimY, -next[1] + outY * sign * offset * -1],
        // Punto medio para colocar la etiqueta Html
        mid: [mx + outX * sign * (offset + 0.1), dimY, -(my + outY * sign * (offset + 0.1) * -1)],
        len,
      };
    });
  }, [points, centroid, dimY]);

  // Construir buffer de líneas de cota (una línea por arista + dos "patillas" en los extremos)
  const linePositions = useMemo(() => {
    const verts = [];
    const patilla = 0.25;
    edges.forEach(({ p1, p2 }) => {
      // Línea principal de cota
      verts.push(...p1, ...p2);
      // Patilla inicial
      verts.push(p1[0], p1[1] - patilla, p1[2], p1[0], p1[1] + patilla, p1[2]);
      // Patilla final
      verts.push(p2[0], p2[1] - patilla, p2[2], p2[0], p2[1] + patilla, p2[2]);
    });
    return new Float32Array(verts);
  }, [edges]);

  const lineGeom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    return g;
  }, [linePositions]);

  return (
    <group>
      {/* Líneas de cota */}
      <lineSegments geometry={lineGeom} raycast={() => null}>
        <lineBasicMaterial color={accentColor} transparent opacity={0.75} depthTest={false} />
      </lineSegments>

      {/* Etiqueta Html en el punto medio de cada arista */}
      {edges.map(({ key, mid, len }) => (
        <Html
          key={key}
          position={mid}
          center
          distanceFactor={22}
          zIndexRange={[50, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="edge-dim-label" style={{ '--label-accent': accentColor }}>
            {len.toFixed(1)}<span className="edl-unit">m</span>
          </div>
        </Html>
      ))}

      {/* Etiqueta central con nombre y área */}
      <Html
        position={[centroid.x, dimY + 0.3, -centroid.y]}
        center
        distanceFactor={22}
        zIndexRange={[50, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div className="stand-center-label" style={{ '--label-accent': accentColor }}>
          <span className="scl-name">{name}</span>
          <span className="scl-area">{metrics.area.toFixed(1)} m²</span>
        </div>
      </Html>
    </group>
  );
}

// Pared interactiva para la herramienta de paredes
// Lateral activo: sólido oscuro; Lateral inactivo: panel translucido azul
// Clic en cualquiera los alterna
function WallSideHandle({ sideIndex, length, position, rotationY, h, isActive, onToggle, isFront = false, onSetFront = null }) {
  const [hovered, setHovered] = useState(false);
  const [frontHovered, setFrontHovered] = useState(false);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Área de clic invisible — más ancha que el visual para facilitar la interacción */}
      <mesh
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <boxGeometry args={[length, h, 0.72]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* Visual del panel de pared */}
      <mesh castShadow receiveShadow raycast={() => null}>
        <boxGeometry args={[length, h, isActive ? 0.22 : 0.1]} />
        <meshStandardMaterial
          color={isActive ? '#0f172a' : '#38bdf8'}
          emissive={isActive ? (hovered ? '#7f1d1d' : '#1e293b') : (hovered ? '#7dd3fc' : '#0369a1')}
          emissiveIntensity={isActive ? (hovered ? 0.75 : 0.1) : (hovered ? 0.62 : 0.36)}
          transparent
          opacity={isActive ? 0.96 : (hovered ? 0.68 : 0.32)}
          roughness={0.5}
          metalness={0.12}
        />
      </mesh>
      {/* Indicador de frente — cono clicable encima del panel */}
      {onSetFront && (
        <group position={[0, h / 2 + 0.32, 0]}>
          {/* Área de clic del indicador de frente */}
          <mesh
            onClick={(e) => { e.stopPropagation(); onSetFront(); }}
            onPointerOver={(e) => { e.stopPropagation(); setFrontHovered(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setFrontHovered(false); document.body.style.cursor = 'default'; }}
          >
            <cylinderGeometry args={[0.22, 0.22, 0.5, 8]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          {/* Visual del cono */}
          <mesh raycast={() => null}>
            <coneGeometry args={[0.14, 0.28, 8]} />
            <meshStandardMaterial
              color={isFront ? '#FBBF24' : '#6B7280'}
              emissive={isFront ? (frontHovered ? '#FCD34D' : '#F59E0B') : (frontHovered ? '#9CA3AF' : '#374151')}
              emissiveIntensity={isFront ? (frontHovered ? 0.9 : 0.5) : (frontHovered ? 0.5 : 0.15)}
              transparent
              opacity={isFront ? 1 : (frontHovered ? 0.85 : 0.45)}
              roughness={0.3}
              metalness={0.2}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

function EditablePolygon({ id, type, position, points, h, color, name, isSelected, editMode, moveToolMode, cutAxis, onClick, onHover, onUpdatePoints, onUpdatePosition, onUpdateRotation, onSplit, onMerge, onSaveHistory, onDragChange, orbitRef, suppressClickRef, cutPreviewRef, canEditTools = true, reserved = false, reservedBy = '', rotationY = 0, wallSides = [], frontSide = null, isCreationLocked = false, onCreationComplete, onDuplicateTowards, onToggleWallSide = null, onSetFrontSide = null, gridSnapEnabled = true, showDuplicateArrows = false, selectionEnabled = true }) {
  const [hovered, setHovered] = useState(false);
  const [draggingVertex, setDraggingVertex] = useState(null);
  const [cutPreview, setCutPreview] = useState(null); // { axis, value }
  const meshRef = useRef();
  const { raycaster, mouse, camera } = useThree();

  const basePos = [snapValue(position[0]), type === 'island' ? 0 : 0.2, snapValue(position[2])];
  const accentColor = type === 'island' ? '#8B5CF6' : '#3B82F6';
  const reservationOwner = typeof reservedBy === 'string' ? reservedBy.trim() : '';
  const isStandReserved = type === 'stand' && Boolean(reserved);

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    if (!points || points.length === 0) return s;
    s.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) s.lineTo(points[i][0], points[i][1]);
    s.closePath();
    return s;
  }, [points]);

  // Material con rejilla técnica integrada
  const material = useMemo(() => {
    const selAcc = type === 'island' ? '#38bdf8' : '#f472b6';
    const mat = new THREE.MeshStandardMaterial({
      color: isSelected ? (type === 'island' ? '#1e3a5f' : '#3b1a2e') : color,
      metalness: isSelected ? 0.7 : 0.6,
      roughness: isSelected ? 0.15 : 0.2,
      transparent: true,
      opacity: type === 'stand'
        ? (isSelected ? 0.62 : 0.46)
        : (isSelected ? 0.95 : 0.9),
      emissive: isSelected ? selAcc : '#000000',
      emissiveIntensity: isSelected ? 0.22 : 0,
      depthWrite: type !== 'stand',
    });

    mat.onBeforeCompile = (shader) => {
      shader.vertexShader = 'varying vec3 vWorldPos;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <worldpos_vertex>',
        `
        #include <worldpos_vertex>
        vWorldPos = worldPosition.xyz;
        `
      );
      shader.fragmentShader = 'varying vec3 vWorldPos;\n' + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        `
        #include <color_fragment>
        
        // Rejilla de 1m x 1m en coordenadas de mundo
        // Usamos fwidth para que las líneas tengan un grosor constante en píxeles
        vec3 grid = abs(fract(vWorldPos * 2.0 - 0.5) - 0.5) / (fwidth(vWorldPos * 2.0) + 0.001);
        
        // Para superficies horizontales (X-Z), usamos grid.x y grid.z
        // Para superficies verticales, incluimos grid.y
        float line = min(grid.x, grid.z);
        line = min(line, grid.y);
        
        float mask = 1.0 - min(line, 1.0);
        
        // Aplicar la rejilla con un color que coincida con el grid del suelo (#333 -> ~0.2)
        // Usamos un valor un poco más alto para que resalte sobre el color del polígono
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.5), mask * 0.3);
        `
      );
    };
    return mat;
  }, [color, type, isSelected, accentColor]);

  const handleVertexPointerDown = (index) => {
    if (onSaveHistory) onSaveHistory();
    setDraggingVertex(index);
    if (suppressClickRef) suppressClickRef.current = true;
    if (orbitRef?.current) orbitRef.current.enabled = false;
    if (onDragChange) onDragChange(true);
  };

  useEffect(() => {
    const up = () => {
      if (draggingVertex !== null) {
        if (onDragChange) onDragChange(false);
        if (orbitRef?.current) orbitRef.current.enabled = true;
        // Mantener la supresión activa un frame más para que el onClick no se dispare
        if (suppressClickRef) {
          setTimeout(() => { suppressClickRef.current = false; }, 50);
        }
      }
      setDraggingVertex(null);
    };
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, [draggingVertex, onDragChange, orbitRef, suppressClickRef]);

  const addVertex = (index) => {
    if (onSaveHistory) onSaveHistory();
    const next = (index + 1) % points.length;
    const mid = [(points[index][0] + points[next][0]) / 2, (points[index][1] + points[next][1]) / 2];
    const newPoints = [...points];
    newPoints.splice(index + 1, 0, [snapValue(mid[0]), snapValue(mid[1])]);
    onUpdatePoints(id, type, newPoints);
  };

  const removeVertex = (index) => {
    if (points.length <= 3) return; // Un polígono necesita mínimo 3 vértices
    if (onSaveHistory) onSaveHistory();
    const newPoints = points.filter((_, i) => i !== index);
    onUpdatePoints(id, type, newPoints);
  };

  // Geometría para los bordes reforzados
  const edgesGeom = useMemo(() => {
    return new THREE.EdgesGeometry(new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false }));
  }, [shape, h]);

  const standWallSegments = useMemo(() => {
    if (type !== 'stand' || !Array.isArray(wallSides) || wallSides.length === 0 || points.length < 2) {
      return [];
    }

    return wallSides
      .filter((sideIndex) => Number.isInteger(sideIndex) && sideIndex >= 0 && sideIndex < points.length)
      .map((sideIndex) => {
        const nextIndex = (sideIndex + 1) % points.length;
        const p1 = points[sideIndex];
        const p2 = points[nextIndex];
        const x1 = p1[0];
        const z1 = -p1[1];
        const x2 = p2[0];
        const z2 = -p2[1];
        const dx = x2 - x1;
        const dz = z2 - z1;
        const length = Math.max(0.35, Math.hypot(dx, dz));
        return {
          sideIndex,
          position: [(x1 + x2) / 2, h / 2 + 0.02, (z1 + z2) / 2],
          rotationY: Math.atan2(dz, dx),
          length,
        };
      });
  }, [h, points, type, wallSides]);

  // Todos los laterales del stand — necesarios para la herramienta de paredes
  const allEdgeSegments = useMemo(() => {
    if (type !== 'stand' || points.length < 2) return [];
    return points.map((p1, sideIndex) => {
      const p2 = points[(sideIndex + 1) % points.length];
      const x1 = p1[0];
      const z1 = -p1[1];
      const x2 = p2[0];
      const z2 = -p2[1];
      const dx = x2 - x1;
      const dz = z2 - z1;
      const length = Math.max(0.35, Math.hypot(dx, dz));
      return {
        sideIndex,
        length,
        position: [(x1 + x2) / 2, h / 2 + 0.02, (z1 + z2) / 2],
        rotationY: Math.atan2(dz, dx),
        isActive: Array.isArray(wallSides) && wallSides.includes(sideIndex),
      };
    });
  }, [type, points, h, wallSides]);

  const standBounds = useMemo(() => {
    if (!Array.isArray(points) || points.length === 0) {
      return { width: 0, depth: 0, minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    points.forEach(([px, py]) => {
      minX = Math.min(minX, px);
      maxX = Math.max(maxX, px);
      minY = Math.min(minY, py);
      maxY = Math.max(maxY, py);
    });
    return {
      width: maxX - minX,
      depth: maxY - minY,
      minX,
      maxX,
      minY,
      maxY,
    };
  }, [points]);

  // Geometría de contorno de selección ligeramente escalada hacia afuera
  const selectionEdgesGeom = useMemo(() => {
    return new THREE.EdgesGeometry(new THREE.ExtrudeGeometry(shape, { depth: h + 0.05, bevelEnabled: false }));
  }, [shape, h]);

  // Ref para animar el contorno de selección
  const selectionLineRef = useRef();
  const haloPulseRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (draggingVertex !== null) {
      raycaster.setFromCamera(mouse, camera);
      const planeY = basePos[1] + h;
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY);
      const intersectPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersectPoint);
      if (intersectPoint) {
        const localPoint = meshRef.current.worldToLocal(intersectPoint.clone());
        const newPoints = [...points];
        newPoints[draggingVertex] = [snapValue(localPoint.x), snapValue(-localPoint.z)];
        onUpdatePoints(id, type, newPoints);
      }
    }

    if (isSelected && editMode === 'cut') {
      raycaster.setFromCamera(mouse, camera);
      const planeY = basePos[1] + h;
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY);
      const intersectPoint = new THREE.Vector3();
      const hit = raycaster.ray.intersectPlane(plane, intersectPoint);
      if (hit) {
        const local = meshRef.current.worldToLocal(intersectPoint.clone());
        const snapX = snapValue(local.x);
        const snapZ = snapValue(-local.z);
        const cutInfo = { axis: cutAxis, value: cutAxis === 'x' ? snapX : snapZ };
        if (cutPreviewRef) cutPreviewRef.current = { id, type, cutInfo };
        if (!cutPreview || cutPreview.axis !== cutInfo.axis || cutPreview.value !== cutInfo.value) {
          setCutPreview(cutInfo);
        }
      } else {
        if (cutPreviewRef) cutPreviewRef.current = null;
        if (cutPreview) setCutPreview(null);
      }
    } else if (cutPreview) {
      if (cutPreviewRef) cutPreviewRef.current = null;
      setCutPreview(null);
    }

    // Animación del contorno de selección
    if (selectionLineRef.current && isSelected) {
      selectionLineRef.current.material.opacity = 0.55 + Math.sin(t * 2.5) * 0.35;
    }
    // Animación del halo de suelo
    if (haloPulseRef.current && isSelected) {
      const s = 1 + Math.sin(t * 2) * 0.04;
      haloPulseRef.current.scale.set(s, 1, s);
      haloPulseRef.current.material.opacity = 0.12 + Math.sin(t * 2) * 0.06;
    }
  });

  const selectionAccent = type === 'island' ? '#38bdf8' : '#f472b6';

  return (
    <>
      <group position={basePos} rotation={[0, rotationY, 0]} ref={meshRef}>
        {/* Halo de suelo bajo el objeto seleccionado */}
        {isSelected && (
          <mesh
            ref={haloPulseRef}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.02, 0]}
            raycast={() => null}
          >
            <extrudeGeometry args={[shape, { depth: 0.04, bevelEnabled: false }]} />
            <meshBasicMaterial color={selectionAccent} transparent opacity={0.15} depthTest={false} />
          </mesh>
        )}

        <mesh
          castShadow receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            if (suppressClickRef?.current) return;
            if (!selectionEnabled && canEditTools) return;
            if (!canEditTools) {
              onClick({ id, type, x: basePos[0], y: basePos[1], z: basePos[2] });
            } else if (editMode === 'cut' && cutPreview) {
              onSplit(id, type, cutPreview);
            } else if (editMode === 'merge') {
              onMerge(id, type);
            } else {
              onClick({ id, type, x: basePos[0], y: basePos[1], z: basePos[2] });
            }
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            onHover(name);
            if (canEditTools && editMode === 'cut') document.body.style.cursor = 'crosshair';
            if (canEditTools && editMode === 'merge') document.body.style.cursor = 'copy';
          }}
          onPointerOut={() => {
            setHovered(false);
            onHover(null);
            document.body.style.cursor = 'default';
          }}
          material={material}
        >
          <extrudeGeometry args={[shape, { depth: h, bevelEnabled: false }]} />
        </mesh>

        {standWallSegments.map((segment) => (
          // Paredes activas estáticas: solo se muestran fuera del modo walls
          !(canEditTools && isSelected && editMode === 'walls') && (
          <mesh
            key={`stand-wall-${id}-${segment.sideIndex}`}
            position={segment.position}
            rotation={[0, segment.rotationY, 0]}
            castShadow
            receiveShadow
            raycast={() => null}
          >
            <boxGeometry args={[segment.length, h, 0.22]} />
            <meshStandardMaterial color="#111827" roughness={0.55} metalness={0.1} />
          </mesh>
          )
        ))}

        {/* Herramienta de paredes: paneles interactivos para cada lateral del stand */}
        {canEditTools && isSelected && editMode === 'walls' && type === 'stand' && allEdgeSegments.map((seg) => (
          <WallSideHandle
            key={`wall-handle-${id}-${seg.sideIndex}`}
            sideIndex={seg.sideIndex}
            length={seg.length}
            position={seg.position}
            rotationY={seg.rotationY}
            h={h}
            isActive={seg.isActive}
            isFront={frontSide === seg.sideIndex}
            onToggle={() => {
              if (onSaveHistory) onSaveHistory();
              if (onToggleWallSide) onToggleWallSide(seg.sideIndex);
            }}
            onSetFront={onSetFrontSide ? () => {
              if (onSaveHistory) onSaveHistory();
              onSetFrontSide(seg.sideIndex);
            } : null}
          />
        ))}

        {/* Flecha de frente: indicador estático cuando no estamos en modo paredes */}
        {type === 'stand' && frontSide !== null && editMode !== 'walls' && (() => {
          if (!Array.isArray(points) || points.length < 2 || frontSide >= points.length) return null;
          const p1 = points[frontSide];
          const p2 = points[(frontSide + 1) % points.length];
          const mx = (p1[0] + p2[0]) / 2;
          const mz = -(p1[1] + p2[1]) / 2;
          const dx = p2[0] - p1[0];
          const dz = -(p2[1] - p1[1]);
          const edgeAngle = Math.atan2(dz, dx);
          return (
            <group
              key={`front-arrow-${id}`}
              position={[mx, h + 0.28, mz]}
              rotation={[0, edgeAngle, 0]}
            >
              {/* Flecha cono apuntando hacia afuera (+Z local = fuera del polígono) */}
              <mesh rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
                <coneGeometry args={[0.18, 0.36, 8]} />
                <meshStandardMaterial
                  color="#FBBF24"
                  emissive="#F59E0B"
                  emissiveIntensity={0.6}
                  roughness={0.3}
                  metalness={0.2}
                />
              </mesh>
              {/* Tallo de la flecha */}
              <mesh position={[0, 0, -0.22]} rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
                <cylinderGeometry args={[0.05, 0.05, 0.32, 8]} />
                <meshStandardMaterial
                  color="#FBBF24"
                  emissive="#F59E0B"
                  emissiveIntensity={0.4}
                  roughness={0.3}
                  metalness={0.2}
                />
              </mesh>
            </group>
          );
        })()}

        {type === 'stand' && (
          <Html
            position={[0, h + (isSelected ? 0.9 : 0.7), 0]}
            center
            distanceFactor={20}
            zIndexRange={[55, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <div className={`stand-reservation-tag ${isStandReserved ? 'is-reserved' : 'is-free'} ${isSelected ? 'is-selected' : ''}`}>
              <span className="srt-status">{isStandReserved ? 'Reservado' : 'Disponible'}</span>
              {isStandReserved && (
                <span className="srt-owner">{reservationOwner || 'Sin nombre'}</span>
              )}
            </div>
          </Html>
        )}

        {type === 'stand' && isSelected && showDuplicateArrows && typeof onDuplicateTowards === 'function' && (
          <>
            <StandDuplicateArrow3D
              side="front"
              position={[0, h + 0.18, -(standBounds.maxY + 1.15)]}
              onClick={(side) => onDuplicateTowards(id, side)}
            />
            <StandDuplicateArrow3D
              side="back"
              position={[0, h + 0.18, -(standBounds.minY - 1.15)]}
              onClick={(side) => onDuplicateTowards(id, side)}
            />
            <StandDuplicateArrow3D
              side="right"
              position={[standBounds.maxX + 1.15, h + 0.18, 0]}
              onClick={(side) => onDuplicateTowards(id, side)}
            />
            <StandDuplicateArrow3D
              side="left"
              position={[standBounds.minX - 1.15, h + 0.18, 0]}
              onClick={(side) => onDuplicateTowards(id, side)}
            />
          </>
        )}

        {/* Bordes base siempre visibles */}
        <lineSegments rotation={[-Math.PI / 2, 0, 0]} geometry={edgesGeom}>
          <lineBasicMaterial color={isSelected ? selectionAccent : accentColor} linewidth={2} transparent opacity={isSelected ? 0.5 : 0.6} />
        </lineSegments>

        {/* Cotas técnicas sobre los bordes del objeto seleccionado */}
        {isSelected && (
          <EdgeDimensions
            points={points}
            h={h}
            name={name}
            type={type}
          />
        )}

        {/* Contorno de selección animado — ligeramente más grande y pulsante */}
        {isSelected && (
          <lineSegments
            ref={selectionLineRef}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.01, 0]}
            geometry={selectionEdgesGeom}
            raycast={() => null}
          >
            <lineBasicMaterial color={selectionAccent} transparent opacity={0.9} depthTest={false} />
          </lineSegments>
        )}

        {canEditTools && isSelected && editMode === 'shape' && (
          <>
            {points.map((p, i) => (
              <group key={`v-${i}`}>
                <VertexHandle
                  position={[p[0], h + 0.05, -p[1]]}
                  onPointerDown={() => handleVertexPointerDown(i)}
                  onDelete={() => removeVertex(i)}
                  canDelete={points.length > 3}
                  color={accentColor}
                />
                <MidpointHandle
                  position={[
                    (p[0] + points[(i + 1) % points.length][0]) / 2,
                    h + 0.05,
                    -(p[1] + points[(i + 1) % points.length][1]) / 2
                  ]}
                  onClick={() => addVertex(i)}
                />
              </group>
            ))}
          </>
        )}

        {canEditTools && isSelected && editMode === 'cut' && (
          <>
            {/* Plano invisible para capturar clics de corte fuera del polígono pero sobre la cuadrícula */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, h + 0.05, 0]}
              onClick={(e) => {
                e.stopPropagation();
                if (cutPreview) onSplit(id, type, cutPreview);
              }}
            >
              <planeGeometry args={[200, 200]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>

            {cutPreview && (
              <group raycast={() => null}>
                {/* Línea principal de corte — más gruesa y visible */}
                <mesh
                  position={[
                    cutPreview.axis === 'x' ? cutPreview.value : 0,
                    h + 0.12,
                    cutPreview.axis === 'z' ? -cutPreview.value : 0
                  ]}
                >
                  <boxGeometry args={[
                    cutPreview.axis === 'x' ? 0.15 : 120,
                    0.08,
                    cutPreview.axis === 'z' ? 0.15 : 120
                  ]} />
                  <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} transparent opacity={0.9} depthTest={false} />
                </mesh>
                {/* Etiqueta con el valor de la posición */}
                <Html
                  position={[
                    cutPreview.axis === 'x' ? cutPreview.value : 0,
                    h + 0.5,
                    cutPreview.axis === 'z' ? -cutPreview.value : 0
                  ]}
                  center
                  distanceFactor={18}
                  zIndexRange={[60, 0]}
                  style={{ pointerEvents: 'none' }}
                >
                  <div className="cut-preview-label">
                    {cutPreview.axis === 'x' ? `X = ${cutPreview.value}` : `Z = ${cutPreview.value}`}
                  </div>
                </Html>
              </group>
            )}
          </>
        )}
      </group>

      {canEditTools && isSelected && editMode === 'move' && (
        <TransformControls
          object={meshRef.current}
          mode={moveToolMode}
          showX={moveToolMode === 'translate' || moveToolMode === 'scale'}
          showY={moveToolMode === 'rotate' || moveToolMode === 'scale'}
          showZ={moveToolMode === 'translate' || moveToolMode === 'scale'}
          translationSnap={moveToolMode === 'translate' && gridSnapEnabled ? 0.5 : undefined}
          rotationSnap={moveToolMode === 'rotate' ? Math.PI / 12 : undefined}
          onMouseDown={() => {
            if (onSaveHistory) onSaveHistory();
          }}
          onMouseUp={() => {
            if (!meshRef.current) return;
            if (moveToolMode === 'translate') {
              const newPos = meshRef.current.position;
              onUpdatePosition(id, type, [snapValue(newPos.x), position[1], snapValue(newPos.z)]);
              if (isCreationLocked && onCreationComplete) onCreationComplete();
              return;
            }
            const nextRotationY = meshRef.current.rotation.y;
            onUpdateRotation(id, type, nextRotationY);
          }}
        />
      )}
    </>
  );
}

export default function PolygonViewer3D({ onBack, fairId = 'f1' }) {
  const navigate = useNavigate();
  const { activeRole, activeUser, can } = useProfile();
  const orbitRef = useRef();
  const suppressClickRef = useRef(false);
  const cutPreviewRef = useRef(null);
  const cameraRef = useRef();
  // Escena vacía — el suelo es el modelo Revit cargado por el usuario
  const [islands, setIslands] = useState([
    { id: 'i-1', name: 'Isla 1', position: [-14, 0, -8], rotationY: 0, h: 0.2, color: '#4a4a5a', points: [[-6, -8], [6, -8], [6, 8], [-6, 8]] },
    { id: 'i-2', name: 'Isla 2', position: [0, 0, -8], rotationY: 0, h: 0.2, color: '#4a4a5a', points: [[-6, -8], [6, -8], [6, 8], [-6, 8]] },
    { id: 'i-3', name: 'Isla 3', position: [14, 0, -8], rotationY: 0, h: 0.2, color: '#4a4a5a', points: [[-6, -8], [6, -8], [6, 8], [-6, 8]] },
  ]);
  const [stands, setStands] = useState([
    { id: 's-1', islandId: 'i-1', name: 'Stand 1', position: [-14, 0, -8], rotationY: 0, h: 3, color: '#4f7cff', points: [[-4, -3], [4, -3], [4, 3], [-4, 3]], reserved: false, reservedBy: '', wallSides: [] },
    { id: 's-2', islandId: 'i-2', name: 'Stand 2', position: [0, 0, -8], rotationY: 0, h: 3, color: '#4f7cff', points: [[-4, -3], [4, -3], [4, 3], [-4, 3]], reserved: false, reservedBy: '', wallSides: [] },
    { id: 's-3', islandId: 'i-3', name: 'Stand 3', position: [14, 0, -8], rotationY: 0, h: 3, color: '#4f7cff', points: [[-4, -3], [4, -3], [4, 3], [-4, 3]], reserved: false, reservedBy: '', wallSides: [] },
  ]);
  const [isLoadingFloorPlan] = useState(false);
  const [floorPlanError, setFloorPlanError] = useState('');

  // Estado del modelo Revit
  const [revitFile, setRevitFile] = useState<File | null>(null);
  const [isRevitLoading, setIsRevitLoading] = useState(false);
  const [isCreatingStand, setIsCreatingStand] = useState(false);
  const [isGridSnapEnabled, setIsGridSnapEnabled] = useState(true);

  // Estado de la herramienta de dibujo libre
  const [freeShapeMode, setFreeShapeMode] = useState(null); // 'island' | 'stand' | null
  const [freeShapePoints, setFreeShapePoints] = useState([]); // [[wx, wz], ...]
  const [isObjectSnapEnabled, setIsObjectSnapEnabled] = useState(true);
  const [isReservationFormOpen, setIsReservationFormOpen] = useState(false);
  const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(false);
  const [cameraFocusTarget, setCameraFocusTarget] = useState(null);
  const [standCarouselIndex, setStandCarouselIndex] = useState(0);
  const [reservationForm, setReservationForm] = useState({
    company: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    notes: '',
  });
  const [reservationRefreshToken, setReservationRefreshToken] = useState(0);

  // ── Box stands (cubos 3D sobre el plano Revit) ──────────────────────────
  const [boxStands, setBoxStands] = useState<BoxStand[]>([]);
  const [selectedBoxStandId, setSelectedBoxStandId] = useState<string | null>(null);
  const [isPlacingBoxStand, setIsPlacingBoxStand] = useState(false);

  const selectedBoxStand = useMemo(
    () => boxStands.find((b) => b.id === selectedBoxStandId) ?? null,
    [boxStands, selectedBoxStandId],
  );

  const applyGridSnapPosition = (positionValue) => {
    if (!isGridSnapEnabled) return [positionValue[0], positionValue[1], positionValue[2]];
    return snapPosition(positionValue);
  };

  const applyObjectSnapPosition = (id, type, positionValue) => {
    if (!isObjectSnapEnabled) return positionValue;

    const SNAP_THRESHOLD = 1;
    const candidates = [
      ...islands.filter((item) => !(type === 'island' && item.id === id)),
      ...stands.filter((item) => !(type === 'stand' && item.id === id)),
      ...boxStands.filter((item) => !(type === 'box-stand' && item.id === id)),
    ];

    let bestXDistance = Infinity;
    let bestZDistance = Infinity;
    let snappedX = positionValue[0];
    let snappedZ = positionValue[2];

    candidates.forEach((candidate) => {
      if (!candidate?.position) return;
      const dx = Math.abs(candidate.position[0] - positionValue[0]);
      if (dx <= SNAP_THRESHOLD && dx < bestXDistance) {
        bestXDistance = dx;
        snappedX = candidate.position[0];
      }

      const dz = Math.abs(candidate.position[2] - positionValue[2]);
      if (dz <= SNAP_THRESHOLD && dz < bestZDistance) {
        bestZDistance = dz;
        snappedZ = candidate.position[2];
      }
    });

    return [snappedX, positionValue[1], snappedZ];
  };

  const handlePlaceBoxStand = (x: number, z: number) => {
    const snappedPlacement = applyObjectSnapPosition('new', 'box-stand', applyGridSnapPosition([x, 1.5, z]));
    const newStand = createBoxStand(snappedPlacement[0], snappedPlacement[2], boxStands.length);
    setBoxStands((prev) => [...prev, newStand]);
    setSelectedBoxStandId(newStand.id);
    setIsPlacingBoxStand(false);
    setIsCreatingStand(false);
    // Clear polygon-stand selection
    setFocusTarget(null);
  };

  const handleSelectBoxStand = (id: string) => {
    setSelectedBoxStandId(id);
    setFocusTarget(null); // deselect polygon stands
  };

  const handleUpdateBoxStand = (id: string, patch: Partial<BoxStand>) => {
    setBoxStands((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    );
  };

  const handleUpdateBoxStandPosition = (id: string, pos: [number, number, number]) => {
    const gridSnappedPos = applyGridSnapPosition(pos);
    const snappedPos = applyObjectSnapPosition(id, 'box-stand', gridSnappedPos);
    setBoxStands((prev) =>
      prev.map((b) => (b.id === id ? { ...b, position: snappedPos } : b)),
    );
  };

  const handleResizeBoxStandFromFace = (
    id: string,
    face: 'left' | 'right' | 'front' | 'back' | 'top',
    delta: number
  ) => {
    const clampSize = (value: number) => Math.max(0.5, Math.round(value * 2) / 2);

    setBoxStands((prev) =>
      prev.map((stand) => {
        if (stand.id !== id) return stand;

        const [w, h, d] = stand.size;
        let nextW = w;
        let nextH = h;
        let nextD = d;
        let localShiftX = 0;
        let localShiftZ = 0;
        let shiftY = 0;

        if (face === 'right' || face === 'left') {
          const proposed = clampSize(w + delta);
          const applied = proposed - w;
          nextW = proposed;
          localShiftX = (face === 'right' ? 1 : -1) * (applied / 2);
        }

        if (face === 'front' || face === 'back') {
          const proposed = clampSize(d + delta);
          const applied = proposed - d;
          nextD = proposed;
          localShiftZ = (face === 'back' ? 1 : -1) * (applied / 2);
        }

        if (face === 'top') {
          const proposed = clampSize(h + delta);
          const applied = proposed - h;
          nextH = proposed;
          shiftY = applied / 2;
        }

        const angle = stand.rotationY || 0;
        const cosY = Math.cos(angle);
        const sinY = Math.sin(angle);
        const worldShiftX = localShiftX * cosY - localShiftZ * sinY;
        const worldShiftZ = localShiftX * sinY + localShiftZ * cosY;

        const nextPosition: [number, number, number] = [
          stand.position[0] + worldShiftX,
          stand.position[1] + shiftY,
          stand.position[2] + worldShiftZ,
        ];

        return {
          ...stand,
          size: [nextW, nextH, nextD] as [number, number, number],
          position: nextPosition,
        };
      })
    );
  };

  const handleDeleteBoxStand = (id: string) => {
    setBoxStands((prev) => prev.filter((b) => b.id !== id));
    setSelectedBoxStandId(null);
  };

  const handleDuplicateBoxStandTowards = (id: string, side: 'left' | 'right' | 'front' | 'back') => {
    const source = boxStands.find((item) => item.id === id);
    if (!source) return;

    const sideVectors = {
      left: [-1, 0],
      right: [1, 0],
      front: [0, -1],
      back: [0, 1],
    } as const;

    const [dirX, dirZ] = sideVectors[side];
    const spacing = 1;
    const [w, , d] = source.size;
    const localOffsetX = dirX * (w + spacing);
    const localOffsetZ = dirZ * (d + spacing);
    const cosY = Math.cos(source.rotationY || 0);
    const sinY = Math.sin(source.rotationY || 0);
    const worldOffsetX = localOffsetX * cosY - localOffsetZ * sinY;
    const worldOffsetZ = localOffsetX * sinY + localOffsetZ * cosY;

    const duplicatePosition = applyObjectSnapPosition(
      id,
      'box-stand',
      applyGridSnapPosition([source.position[0] + worldOffsetX, source.position[1], source.position[2] + worldOffsetZ])
    );

    const duplicate: BoxStand = {
      ...source,
      id: `bs-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      name: `${source.name} copia`,
      position: duplicatePosition,
    };

    setBoxStands((prev) => [...prev, duplicate]);
    setSelectedBoxStandId(duplicate.id);
    setFocusTarget(null);
  };

  // Cancel placement on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPlacingBoxStand(false);
        setIsCreatingStand(false);
        setSelectedBoxStandId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const bounds = useMemo(() => calculateBounds(islands, stands), [islands, stands]);

  const canUseTools = can('edit_plan');
  const canManageReservations = can('manage_reservations') || can('approve_reservations');
  const canEditObjectType = () => canUseTools;
  const canCreateObjects = canUseTools;
  const {
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
  } = useViewerInteractionState({
    canUseTools,
    canEditObjectType,
    islands,
    stands,
    setIslands,
    setStands,
    cutPreviewRef,
    onConfirmCut: (id, type, cutInfo) => handleSplit(id, type, cutInfo),
  });

  const canEditFocusedObject = focusTarget ? canEditObjectType(focusTarget.type) : canUseTools;
  const selectedStand = useMemo(
    () => (focusTarget?.type === 'stand' ? stands.find((stand) => stand.id === focusTarget.id) ?? null : null),
    [focusTarget, stands]
  );
  const selectedObject = useMemo(() => {
    if (!focusTarget) return null;
    if (focusTarget.type === 'island') return islands.find((island) => island.id === focusTarget.id) ?? null;
    return stands.find((stand) => stand.id === focusTarget.id) ?? null;
  }, [focusTarget, islands, stands]);
  const selectedObjectMetrics = useMemo(
    () => (selectedObject ? computePolygonMetrics(selectedObject.points) : null),
    [selectedObject]
  );
  const selectedArea = useMemo(() => {
    if (selectedObjectMetrics?.area) return selectedObjectMetrics.area;
    if (selectedBoxStand?.size) return Number(selectedBoxStand.size[0] || 0) * Number(selectedBoxStand.size[2] || 0);
    return 0;
  }, [selectedObjectMetrics, selectedBoxStand]);
  const standCarouselItems = useMemo(
    () =>
      REAL_STAND_REFERENCES.map((item) => ({
        ...item,
        fitCount: selectedArea > 0 ? Math.max(0, Math.floor(selectedArea / item.footprint)) : 0,
      })),
    [selectedArea]
  );

  useEffect(() => {
    setStandCarouselIndex(0);
  }, [focusTarget?.id, selectedBoxStandId]);

  const activeStandReference = standCarouselItems.length
    ? standCarouselItems[((standCarouselIndex % standCarouselItems.length) + standCarouselItems.length) % standCarouselItems.length]
    : null;

  useEffect(() => {
    if (!isCreatingStand) return;
    if (isPlacingBoxStand) return;
    if (focusTarget?.type === 'stand') return;
    setIsCreatingStand(false);
  }, [focusTarget, isCreatingStand, isPlacingBoxStand]);

  const normalizedObjectSearch = objectSearchTerm.trim().toLowerCase();
  const groupedStandsByIsland = useMemo(() => {
    const matches = (value) => String(value ?? '').toLowerCase().includes(normalizedObjectSearch);
    const grouped = islands.map((island) => {
      const islandMatch = !normalizedObjectSearch || matches(island.name) || matches(island.id);
      const islandStands = stands.filter((stand) => {
        if (stand.islandId !== island.id) return false;
        if (!normalizedObjectSearch || islandMatch) return true;
        return matches(stand.name) || matches(stand.id) || matches(stand.reservedBy);
      });
      return { island, stands: islandStands };
    });

    return grouped.filter(({ island, stands: islandStands }) => {
      if (!normalizedObjectSearch) return true;
      if (matches(island.name) || matches(island.id)) return true;
      return islandStands.length > 0;
    });
  }, [islands, stands, normalizedObjectSearch]);
  const filteredIslands = useMemo(() => groupedStandsByIsland.map(({ island }) => island), [groupedStandsByIsland]);
  const selectedIsland = useMemo(() => {
    if (focusTarget?.type === 'island') return islands.find((island) => island.id === focusTarget.id) ?? null;
    if (focusTarget?.type === 'stand') {
      const stand = stands.find((item) => item.id === focusTarget.id);
      if (!stand) return null;
      return islands.find((island) => island.id === stand.islandId) ?? null;
    }
    return null;
  }, [focusTarget, islands, stands]);
  const standsInSelectedIsland = useMemo(() => {
    if (!selectedIsland) return [];
    return stands.filter((stand) => stand.islandId === selectedIsland.id);
  }, [stands, selectedIsland]);
  const availableStands = useMemo(
    () => stands.filter((stand) => !stand.reserved),
    [stands]
  );
  const reservedStands = useMemo(
    () => stands.filter((stand) => stand.reserved),
    [stands]
  );
  const reservedStandsCount = useMemo(
    () => stands.filter((stand) => stand.reserved).length,
    [stands]
  );
  const availableStandsCount = stands.length - reservedStandsCount;

  const fairReservations = useMemo(
    () => reservations.filter((reservation) => reservation.fairId === fairId),
    [fairId, reservationRefreshToken]
  );

  useEffect(() => {
    if (!fairId) return;

    return subscribeToFairRealtime(fairId, (event) => {
      if (!['stand.updated', 'booking.created', 'booking.updated'].includes(event.type)) return;

      setReservationRefreshToken((prev) => prev + 1);
      setStands((prev) =>
        prev.map((stand) => {
          const matched = fairStandsRegistry.find((item) => {
            if (stand.fairStandId) {
              return String(item.id) === String(stand.fairStandId);
            }
            return String(item.id) === String(stand.id);
          });

          if (!matched) return stand;

          return {
            ...stand,
            reserved: matched.status !== 'available',
            reservedBy: matched.company || '',
            sourceStatus: matched.status,
          };
        })
      );
    });
  }, [fairId]);

  const reloadFloorPlan = async () => {
    resetInteractionAfterReload();
  };

  useEffect(() => {
    if (!selectedStand) {
      setReservationName('');
      setReservationForm({ company: '', contactName: '', contactPhone: '', contactEmail: '', notes: '' });
      return;
    }
    setReservationName(selectedStand.reservedBy || '');
    setReservationForm((prev) => ({
      ...prev,
      company: selectedStand.reservedBy || '',
    }));
  }, [selectedStand]);

  useEffect(() => {
    setObjectNameDraft(selectedObject?.name ?? '');
  }, [selectedObject]);

  const handleUpdatePoints = (id, type, newPoints) => {
    if (!canEditObjectType(type)) return;
    const snappedPoints = snapPoints(newPoints);
    // Para updates continuos (drag), guardamos el estado inicial solo al empezar
    // pero aquí se llama en cada frame de drag. 
    // Lo ideal es que saveHistory se llame al iniciar el drag o en acciones discretas.
    if (type === 'island') setIslands(prev => prev.map(isl => isl.id === id ? { ...isl, points: snappedPoints } : isl));
    else setStands(prev => prev.map(std => std.id === id ? { ...std, points: snappedPoints } : std));
  };

  const createUniqueId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  const handleCreateIsland = () => {
    if (!canCreateObjects) return;
    saveHistory();
    const index = islands.length;
    const col = index % 3;
    const row = Math.floor(index / 3);
    const newIsland = {
      id: createUniqueId('i'),
      name: `Isla ${index + 1}`,
      position: snapPosition([col * 14 - 14, 0, row * 14 - 8]),
      rotationY: 0,
      h: 0.2,
      color: '#4a4a5a',
      points: snapPoints([[-6, -8], [6, -8], [6, 8], [-6, 8]]),
    };
    setIslands(prev => [...prev, newIsland]);
    setFocusTarget({ id: newIsland.id, type: 'island', x: newIsland.position[0], y: newIsland.position[1], z: newIsland.position[2] });
  };

  const handleCreateStand = () => {
    if (!canCreateObjects) return;
    const selectedIslandId = focusTarget?.type === 'island' ? focusTarget.id : focusTarget?.type === 'stand'
      ? stands.find(s => s.id === focusTarget.id)?.islandId
      : null;
    const targetIsland = islands.find(isl => isl.id === selectedIslandId) || islands[0];
    if (!targetIsland) return;
    saveHistory();
    const createdStandId = createUniqueId('s');
    const nextStands = renumberStands([
      ...stands,
      {
        id: createdStandId,
        islandId: targetIsland.id,
        name: 'Stand',
        position: snapPosition([targetIsland.position[0], 0, targetIsland.position[2]]),
        rotationY: 0,
        h: 3,
        color: '#4f7cff',
        points: snapPoints([[-4, -3], [4, -3], [4, 3], [-4, 3]]),
        reserved: false,
        reservedBy: '',
        wallSides: [],
      },
    ]);
    const newestStand = nextStands.find((stand) => stand.id === createdStandId);
    setStands(nextStands);
    setEditMode('move');
    setMoveToolMode('translate');
    setIsCreatingStand(true);
    if (newestStand) {
      setFocusTarget({ id: newestStand.id, type: 'stand', x: newestStand.position[0], y: newestStand.position[1], z: newestStand.position[2] });
    }
  };

  const handleCompleteStandCreation = () => {
    setIsCreatingStand(false);
  };

  // ── Herramienta de forma libre ──────────────────────────────────────────────

  const handleStartFreeIsland = () => {
    if (freeShapeMode === 'island') { setFreeShapeMode(null); setFreeShapePoints([]); return; }
    if (!canCreateObjects) return;
    setFreeShapeMode('island');
    setFreeShapePoints([]);
    setFocusTarget(null);
  };

  const handleStartFreeStand = () => {
    if (freeShapeMode === 'stand') { setFreeShapeMode(null); setFreeShapePoints([]); return; }
    if (!canCreateObjects) return;
    setFreeShapeMode('stand');
    setFreeShapePoints([]);
    setFocusTarget(null);
  };

  const handleFreeShapeAddPoint = (wx, wz) => {
    setFreeShapePoints((prev) => [...prev, [wx, wz]]);
  };

  const handleFreeShapeClose = () => {
    if (freeShapePoints.length < 3) return;
    saveHistory();

    // Centroide del polígono dibujado en mundo
    const cx = freeShapePoints.reduce((s, [x]) => s + x, 0) / freeShapePoints.length;
    const cz = freeShapePoints.reduce((s, [, z]) => s + z, 0) / freeShapePoints.length;

    // Convertir puntos mundo a coordenadas locales del polígono:
    //   point[0] = worldX - cx
    //   point[1] = -(worldZ - cz)   ← porque la malla usa rotation=[-π/2,0,0]
    const localPoints = freeShapePoints.map(([wx, wz]) => [
      snapValue(wx - cx),
      snapValue(-(wz - cz)),
    ]);

    const newId = createUniqueId(freeShapeMode === 'island' ? 'i' : 's');

    if (freeShapeMode === 'island') {
      const newIsland = {
        id: newId,
        name: `Isla libre ${islands.length + 1}`,
        position: snapPosition([cx, 0, cz]),
        rotationY: 0,
        h: 0.2,
        color: '#4a4a5a',
        points: localPoints,
      };
      setIslands((prev) => [...prev, newIsland]);
      setFocusTarget({ id: newId, type: 'island', x: cx, y: 0, z: cz });
    } else {
      // Asociar al island que esté seleccionado o al primero disponible
      const selectedIslandId =
        focusTarget?.type === 'island'
          ? focusTarget.id
          : focusTarget?.type === 'stand'
          ? stands.find((s) => s.id === focusTarget.id)?.islandId
          : islands[0]?.id;

      const newStand = {
        id: newId,
        islandId: selectedIslandId || (islands[0]?.id ?? `${newId}-island`),
        name: 'Stand libre',
        standCode: '',
        position: snapPosition([cx, 0, cz]),
        rotationY: 0,
        h: 3,
        color: '#4f7cff',
        points: localPoints,
        reserved: false,
        reservedBy: '',
        wallSides: [],
      };
      const nextStands = renumberStands([...stands, newStand]);
      setStands(nextStands);
      setFocusTarget({ id: newId, type: 'stand', x: cx, y: 0, z: cz });
    }

    setFreeShapeMode(null);
    setFreeShapePoints([]);
  };

  const handleFreeShapeCancel = () => {
    setFreeShapeMode(null);
    setFreeShapePoints([]);
  };

  const handleDuplicateStand = () => {
    if (!canCreateObjects || !focusTarget || focusTarget.type !== 'stand') return;
    const standToDuplicate = stands.find(s => s.id === focusTarget.id);
    if (!standToDuplicate) return;
    saveHistory();
    const newStandId = createUniqueId('s');
    const offset = 3;
    const newStand = {
      ...standToDuplicate,
      id: newStandId,
      name: `${standToDuplicate.name} (copia)`,
      position: snapPosition([standToDuplicate.position[0] + offset, standToDuplicate.position[1], standToDuplicate.position[2] + offset]),
      points: snapPoints(standToDuplicate.points),
    };
    setStands(prev => {
      const updated = [...prev, newStand];
      return renumberStands(updated);
    });
    setFocusTarget({ id: newStand.id, type: 'stand', x: newStand.position[0], y: newStand.position[1], z: newStand.position[2] });
    setDuplicatingItem({ type: 'stand', id: newStand.id, offset: [offset, 0, offset] });
  };

  const handleDuplicateStandTowards = (standId, side) => {
    if (!canCreateObjects) return;
    const source = stands.find((item) => item.id === standId);
    if (!source) return;
    saveHistory();

    const sideVectors = {
      left: [-1, 0],
      right: [1, 0],
      front: [0, -1],
      back: [0, 1],
    };
    const [dirX, dirZ] = sideVectors[side] || [1, 0];

    const metrics = computePolygonMetrics(source.points || []);
    const baseDistance = Math.max(metrics.width, metrics.depth, 2);
    const spacing = baseDistance + 1.2;
    const localOffsetX = dirX * spacing;
    const localOffsetZ = dirZ * spacing;

    const angle = source.rotationY || 0;
    const cosY = Math.cos(angle);
    const sinY = Math.sin(angle);
    const worldOffsetX = localOffsetX * cosY - localOffsetZ * sinY;
    const worldOffsetZ = localOffsetX * sinY + localOffsetZ * cosY;

    const duplicateId = createUniqueId('s');
    const duplicate = {
      ...source,
      id: duplicateId,
      name: `${source.name} (copia)`,
      position: snapPosition([source.position[0] + worldOffsetX, source.position[1], source.position[2] + worldOffsetZ]),
      points: snapPoints(source.points),
      reserved: false,
      reservedBy: '',
      sourceStatus: 'available',
      fairStandId: undefined,
    };

    setStands((prev) => renumberStands([...prev, duplicate]));
    setFocusTarget({ id: duplicateId, type: 'stand', x: duplicate.position[0], y: duplicate.position[1], z: duplicate.position[2] });
  };

  const handleDuplicateGroup = () => {
    if (!canCreateObjects || !focusTarget || focusTarget.type !== 'stand') return;
    const standToDuplicate = stands.find(s => s.id === focusTarget.id);
    if (!standToDuplicate) return;
    saveHistory();
    const offset = 3;
    const newStandId = createUniqueId('s');
    const newStand = {
      ...standToDuplicate,
      id: newStandId,
      name: `${standToDuplicate.name} (copia)`,
      position: snapPosition([standToDuplicate.position[0] + offset, standToDuplicate.position[1], standToDuplicate.position[2] + offset]),
      points: snapPoints(standToDuplicate.points),
    };
    setStands(prev => {
      const updated = [...prev, newStand];
      return renumberStands(updated);
    });
    setFocusTarget({ id: newStand.id, type: 'stand', x: newStand.position[0], y: newStand.position[1], z: newStand.position[2] });
  };

  const handleDuplicateIsland = () => {
    if (!canCreateObjects || !focusTarget || focusTarget.type !== 'island') return;
    const islandToDuplicate = islands.find(isl => isl.id === focusTarget.id);
    if (!islandToDuplicate) return;
    saveHistory();
    const offset = 5;
    const newIslandId = createUniqueId('i');
    const newIsland = {
      ...islandToDuplicate,
      id: newIslandId,
      name: `${islandToDuplicate.name} (copia)`,
      position: snapPosition([islandToDuplicate.position[0] + offset, islandToDuplicate.position[1], islandToDuplicate.position[2] + offset]),
      points: snapPoints(islandToDuplicate.points),
    };
    const standsInIsland = stands.filter(s => s.islandId === islandToDuplicate.id);
    const newStands = standsInIsland.map(stand => ({
      ...stand,
      id: createUniqueId('s'),
      islandId: newIslandId,
      name: `${stand.name} (copia)`,
      position: snapPosition([stand.position[0] + offset, stand.position[1], stand.position[2] + offset]),
      points: snapPoints(stand.points),
    }));
    setIslands(prev => [...prev, newIsland]);
    setStands(prev => renumberStands([...prev, ...newStands]));
    setFocusTarget({ id: newIsland.id, type: 'island', x: newIsland.position[0], y: newIsland.position[1], z: newIsland.position[2] });
  };

  const handleDeleteSelection = () => {
    if (!focusTarget || !canEditObjectType(focusTarget.type)) return;
    saveHistory();
    if (focusTarget.type === 'island') {
      setIslands(prev => prev.filter(isl => isl.id !== focusTarget.id));
      setStands(prev => renumberStands(prev.filter(std => std.islandId !== focusTarget.id)));
    } else {
      setStands(prev => renumberStands(prev.filter(std => std.id !== focusTarget.id)));
    }
    setFocusTarget(null);
    setCameraFocusTarget(null);
    setIsTopViewReached(false);
  };

  const handleReserveSelectedStand = async () => {
    if (!selectedStand) return;
    const reserverName = reservationForm.company.trim();
    if (!reserverName) return;
    setFloorPlanError('');

    const reservationDetails = [
      reservationForm.contactName ? `Contacto: ${reservationForm.contactName}` : null,
      reservationForm.contactPhone ? `Telefono: ${reservationForm.contactPhone}` : null,
      reservationForm.contactEmail ? `Email: ${reservationForm.contactEmail}` : null,
      reservationForm.notes ? `Notas: ${reservationForm.notes}` : null,
    ].filter(Boolean).join(' | ');

    try {
      await requestReservation(selectedStand.id, activeUser.id, {
        company: reserverName,
        comments: reservationDetails || 'Solicitud creada directamente desde el plano 3D.',
        status: 'pending',
        validators: [],
      });
      setStands((prev) =>
        prev.map((stand) =>
          stand.id === selectedStand.id
            ? {
                ...stand,
                reserved: true,
                reservedBy: reserverName,
                reservedContact: {
                  name: reservationForm.contactName,
                  phone: reservationForm.contactPhone,
                  email: reservationForm.contactEmail,
                },
                reservedNotes: reservationForm.notes,
                sourceStatus: 'pending',
              }
            : stand
        )
      );
      setReservationRefreshToken((prev) => prev + 1);
      setIsReservationFormOpen(false);
      setReservationForm({ company: '', contactName: '', contactPhone: '', contactEmail: '', notes: '' });
    } catch (error) {
      setFloorPlanError(error instanceof Error ? error.message : 'No se pudo crear la reserva del stand.');
    }
  };

  const handleReleaseSelectedStand = async () => {
    if (!selectedStand) return;

    const activeReservation = [...reservations]
      .reverse()
      .find((reservation) => reservation.standId === selectedStand.id && ['pending', 'reserved'].includes(reservation.status));

    if (!activeReservation) {
      setFloorPlanError('No existe una reserva activa asociada a este stand.');
      return;
    }

    setFloorPlanError('');
    setReservationStatus(activeReservation.id, 'available');
    setStands((prev) =>
      prev.map((stand) =>
        stand.id === selectedStand.id
          ? {
              ...stand,
              reserved: false,
              reservedBy: '',
              reservedContact: null,
              reservedNotes: '',
              sourceStatus: 'available',
            }
          : stand
      )
    );
    setReservationRefreshToken((prev) => prev + 1);
    setReservationName('');
    await reloadFloorPlan();
  };

  const handleQuickApproveReservation = (reservationId) => {
    const reservation = reservations.find((item) => item.id === reservationId);
    if (!reservation || !canManageReservations) return;

    setReservationStatus(reservation.id, 'reserved');
    setStands((prev) =>
      prev.map((stand) => {
        const matchesStand = stand.fairStandId
          ? String(stand.fairStandId) === String(reservation.standId)
          : String(stand.id) === String(reservation.standId);
        if (!matchesStand) return stand;
        return {
          ...stand,
          reserved: true,
          reservedBy: reservation.company,
          sourceStatus: 'reserved',
        };
      })
    );
    setReservationRefreshToken((prev) => prev + 1);
  };

  const handleQuickCancelReservation = (reservationId) => {
    const reservation = reservations.find((item) => item.id === reservationId);
    if (!reservation || !canManageReservations) return;

    setReservationStatus(reservation.id, 'available');
    setStands((prev) =>
      prev.map((stand) => {
        const matchesStand = stand.fairStandId
          ? String(stand.fairStandId) === String(reservation.standId)
          : String(stand.id) === String(reservation.standId);
        if (!matchesStand) return stand;
        return {
          ...stand,
          reserved: false,
          reservedBy: '',
          sourceStatus: 'available',
        };
      })
    );
    setReservationRefreshToken((prev) => prev + 1);
  };

  const handleFocusStand = (stand) => {
    if (!stand) return;
    setFocusTarget({
      id: stand.id,
      type: 'stand',
      x: stand.position[0],
      y: stand.position[1],
      z: stand.position[2],
    });
  };

  const handleActivateCameraMode = () => {
    setEditMode('camera');
    setFocusTarget(null);
    setCameraFocusTarget(null);
    setIsTopViewReached(false);
  };

  const handleActivateSelectMode = () => {
    setEditMode('move');
    setMoveToolMode('translate');
    setCameraFocusTarget(null);
  };

  const handleActivateShapeMode = () => {
    if (!focusTarget) return;
    setEditMode('shape');
  };

  const handleActivateRotateMode = () => {
    if (!focusTarget) return;
    setEditMode('move');
    setMoveToolMode('rotate');
  };

  const handleActivateDuplicateTool = () => {
    setEditMode('duplicate');
    setCameraFocusTarget(null);
  };

  const handleActivateScaleMode = () => {
    if (!focusTarget) return;
    setEditMode('move');
    setMoveToolMode('scale');
  };

  const handleActivateWallsTool = () => {
    if (!focusTarget || focusTarget.type !== 'stand') return;
    setEditMode('walls');
  };

  const handleFocusSelectedObject = () => {
    if (!focusTarget) return;
    setCameraFocusTarget({ ...focusTarget, requestId: Date.now() });
    setIsTopViewReached(false);
  };

  const handleRenameSelectedObject = () => {
    if (!selectedObject || !focusTarget) return;
    if (!canEditObjectType(focusTarget.type)) return;
    const cleanName = objectNameDraft.trim();
    if (!cleanName || cleanName === selectedObject.name) return;
    saveHistory();
    if (focusTarget.type === 'island') {
      setIslands((prev) => prev.map((island) => (island.id === focusTarget.id ? { ...island, name: cleanName } : island)));
      return;
    }
    setStands((prev) => prev.map((stand) => (stand.id === focusTarget.id ? { ...stand, name: cleanName } : stand)));
  };

  const handleApplySelectedObjectTransform = ({ x, z, rotationDeg }) => {
    if (!selectedObject || !focusTarget || !canEditObjectType(focusTarget.type)) return;
    saveHistory();
    handleUpdatePosition(focusTarget.id, focusTarget.type, [x, selectedObject.position[1], z]);
    handleUpdateRotation(focusTarget.id, focusTarget.type, (rotationDeg * Math.PI) / 180);
  };

  const handleApplySelectedObjectArea = (targetArea) => {
    if (!selectedObject || !focusTarget || !selectedObjectMetrics || !canEditObjectType(focusTarget.type)) return;
    if (targetArea <= 0 || selectedObjectMetrics.area <= 0) return;
    const scale = Math.sqrt(targetArea / selectedObjectMetrics.area);
    if (!Number.isFinite(scale) || scale <= 0) return;
    saveHistory();
    const scaledPoints = snapPoints((selectedObject.points || []).map(([px, py]) => [px * scale, py * scale]));
    if (focusTarget.type === 'island') {
      setIslands((prev) => prev.map((island) => (island.id === focusTarget.id ? { ...island, points: scaledPoints } : island)));
      return;
    }
    setStands((prev) => prev.map((stand) => (stand.id === focusTarget.id ? { ...stand, points: scaledPoints } : stand)));
  };

  const setReservationFormField = (field, value) => {
    setReservationForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleStandWallSide = (sideIndex) => {
    if (!focusTarget || focusTarget.type !== 'stand' || !canEditObjectType('stand')) return;
    if (!Number.isInteger(sideIndex) || sideIndex < 0) return;
    saveHistory();
    setStands((prev) =>
      prev.map((stand) => {
        if (stand.id !== focusTarget.id) return stand;
        const current = Array.isArray(stand.wallSides) ? stand.wallSides : [];
        const hasSide = current.includes(sideIndex);
        const nextSides = hasSide
          ? current.filter((idx) => idx !== sideIndex)
          : [...current, sideIndex].sort((a, b) => a - b);
        return { ...stand, wallSides: nextSides };
      })
    );
  };

  const handleSetStandFrontSide = (sideIndex) => {
    if (!focusTarget || focusTarget.type !== 'stand' || !canEditObjectType('stand')) return;
    if (!Number.isInteger(sideIndex) || sideIndex < 0) return;
    saveHistory();
    setStands((prev) =>
      prev.map((stand) => {
        if (stand.id !== focusTarget.id) return stand;
        // Toggle: si ya es el frente, lo desmarca; si no, lo marca
        return { ...stand, frontSide: stand.frontSide === sideIndex ? null : sideIndex };
      })
    );
  };

  const handleSaveVersion = () => {
    const cleanName = versionDraftName.trim();
    const cleanLabel = versionDraftLabel.trim();
    if (!cleanName || !cleanLabel) return;
    const version = {
      id: createUniqueId('v'),
      name: cleanName,
      label: cleanLabel,
      notes: versionDraftNotes.trim(),
      timestamp: new Date().toISOString(),
      createdByRole: activeRole,
      isDefinitive: true,
      snapshotStats: {
        islands: islands.length,
        stands: stands.length,
        standsReserved: reservedStandsCount,
      },
      snapshot: {
        islands: deepClone(islands),
        stands: deepClone(stands),
        focusTarget: deepClone(focusTarget),
      },
    };
    setProjectVersions(prev => [...prev.map((item) => ({ ...item, isDefinitive: false })), version]);
    setVersionDraftName('');
    setVersionDraftLabel('');
    setVersionDraftNotes('');
    setIsSaveVersionPanelOpen(false);
  };

  const handlePublishDefinitiveVersion = () => {
    const definitiveVersion = [...projectVersions].reverse().find((item) => item.isDefinitive);
    if (!definitiveVersion) return;
    setPublishedVersionInfo({
      id: definitiveVersion.id,
      name: definitiveVersion.name,
      label: definitiveVersion.label,
      publishedAt: new Date().toISOString(),
    });
  };

  const openSaveVersionPanel = () => {
    setVersionDraftName(`Versión sesión ${projectVersions.length + 1}`);
    setVersionDraftLabel(`v${projectVersions.length + 1}.0`);
    setVersionDraftNotes('');
    setIsSaveVersionPanelOpen(true);
  };

  const handleRestoreVersion = (versionId) => {
    const version = projectVersions.find(v => v.id === versionId);
    if (!version) return;
    saveHistory();
    const snappedIslands = deepClone(version.snapshot.islands).map((island) => ({
      ...island,
      position: snapPosition(island.position),
      points: snapPoints(island.points),
    }));
    const snappedStands = deepClone(version.snapshot.stands).map((stand) => ({
      ...stand,
      position: snapPosition(stand.position),
      points: snapPoints(stand.points),
    }));
    setIslands(snappedIslands);
    setStands(snappedStands);
    setFocusTarget(version.snapshot.focusTarget ?? null);
    setIsTopViewReached(Boolean(version.snapshot.focusTarget));
  };

  const handleEnterPlanView = () => {
    setIsPlanViewActive(true);
  };

  const handleExitPlanView = () => {
    setIsPlanViewActive(false);
  };

  const handleUpdatePosition = (id, type, newPos) => {
    if (!canEditObjectType(type)) return;
    const gridSnappedPos = applyGridSnapPosition(newPos);
    const snappedPos = applyObjectSnapPosition(id, type, gridSnappedPos);
    if (type === 'island') {
      const oldPos = islands.find(isl => isl.id === id).position;
      const dx = snappedPos[0] - oldPos[0];
      const dz = snappedPos[2] - oldPos[2];
      setIslands(prev => prev.map(isl => isl.id === id ? { ...isl, position: snappedPos } : isl));
      setStands(prev => prev.map(std => std.islandId === id ? { ...std, position: applyGridSnapPosition([std.position[0] + dx, std.position[1], std.position[2] + dz]) } : std));
    } else {
      setStands(prev => prev.map(std => std.id === id ? { ...std, position: snappedPos } : std));
    }
    setFocusTarget(prev => ({ ...prev, x: snappedPos[0], z: snappedPos[2] }));
  };

  const normalizeRadians = (rad) => {
    const twoPi = Math.PI * 2;
    let value = rad % twoPi;
    if (value > Math.PI) value -= twoPi;
    if (value < -Math.PI) value += twoPi;
    return value;
  };

  const handleUpdateRotation = (id, type, newRotationY) => {
    const snappedRotation = normalizeRadians(newRotationY);
    if (type === 'island') {
      const island = islands.find((isl) => isl.id === id);
      if (!island) return;
      const prevRotation = island.rotationY ?? 0;
      const delta = snappedRotation - prevRotation;
      const centerX = island.position[0];
      const centerZ = island.position[2];
      const cos = Math.cos(delta);
      const sin = Math.sin(delta);

      setIslands((prev) => prev.map((isl) => (isl.id === id ? { ...isl, rotationY: snappedRotation } : isl)));
      setStands((prev) =>
        prev.map((std) => {
          if (std.islandId !== id) return std;
          const relX = std.position[0] - centerX;
          const relZ = std.position[2] - centerZ;
          const nextX = centerX + relX * cos - relZ * sin;
          const nextZ = centerZ + relX * sin + relZ * cos;
          const snappedStandPosition = snapPosition([nextX, std.position[1], nextZ]);
          return {
            ...std,
            position: snappedStandPosition,
            rotationY: normalizeRadians((std.rotationY ?? 0) + delta),
          };
        })
      );
      return;
    }

    setStands((prev) => prev.map((std) => (std.id === id ? { ...std, rotationY: snappedRotation } : std)));
  };

  const handleMerge = (secondaryId, secondaryType) => {
    if (!canEditObjectType(secondaryType)) return;
    if (!focusTarget) return;
    const { id: primaryId, type: primaryType } = focusTarget;
    if (!canEditObjectType(primaryType)) return;
    if (primaryId === secondaryId && primaryType === secondaryType) return;
    if (primaryType !== secondaryType) return;

    saveHistory();

    const targetArray = primaryType === 'island' ? islands : stands;
    const obj1 = targetArray.find(o => o.id === primaryId);
    const obj2 = targetArray.find(o => o.id === secondaryId);
    if (!obj1 || !obj2) return;

    const toWorld = (obj) => obj.points.map(p => [
      p[0] + obj.position[0],
      p[1] + (-obj.position[2])
    ]);

    const poly1 = toWorld(obj1);
    const poly2 = toWorld(obj2);

    // ── Utilidades geométricas ──────────────────────────────────────────

    const EPS = 1e-9;
    const ptKey = ([x, y]) => `${Math.round(x * 1e6)},${Math.round(y * 1e6)}`;
    const ptEq = (a, b) => Math.abs(a[0] - b[0]) < EPS && Math.abs(a[1] - b[1]) < EPS;

    // Intersección de segmento AB con segmento CD — devuelve el punto o null
    const segIntersect = (a, b, c, d) => {
      const dx1 = b[0] - a[0], dy1 = b[1] - a[1];
      const dx2 = d[0] - c[0], dy2 = d[1] - c[1];
      const denom = dx1 * dy2 - dy1 * dx2;
      if (Math.abs(denom) < EPS) return null; // paralelos
      const dx3 = c[0] - a[0], dy3 = c[1] - a[1];
      const t = (dx3 * dy2 - dy3 * dx2) / denom;
      const u = (dx3 * dy1 - dy3 * dx1) / denom;
      if (t < -EPS || t > 1 + EPS || u < -EPS || u > 1 + EPS) return null;
      return [a[0] + t * dx1, a[1] + t * dy1];
    };

    // Winding number: punto dentro de polígono (incluyendo borde con tolerancia)
    const pointInPoly = (pt, poly) => {
      let winding = 0;
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i];
        const b = poly[(i + 1) % poly.length];
        // En borde → considerar dentro
        const dx = b[0] - a[0], dy = b[1] - a[1];
        const len2 = dx * dx + dy * dy;
        if (len2 > EPS) {
          const t = ((pt[0] - a[0]) * dx + (pt[1] - a[1]) * dy) / len2;
          const tc = Math.max(0, Math.min(1, t));
          const cx = a[0] + tc * dx, cy = a[1] + tc * dy;
          if (Math.abs(pt[0] - cx) < EPS * 10 && Math.abs(pt[1] - cy) < EPS * 10) return true;
        }
        if (a[1] <= pt[1]) {
          if (b[1] > pt[1] && (b[0] - a[0]) * (pt[1] - a[1]) - (pt[0] - a[0]) * (b[1] - a[1]) > 0) winding++;
        } else {
          if (b[1] <= pt[1] && (b[0] - a[0]) * (pt[1] - a[1]) - (pt[0] - a[0]) * (b[1] - a[1]) < 0) winding--;
        }
      }
      return winding !== 0;
    };

    // ── Enriquecer cada polígono con los puntos de intersección ──────────
    // Para cada arista de poly, insertar los puntos donde las aristas del otro poly la cruzan
    const enrichPoly = (poly, otherPoly) => {
      const result = [];
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i];
        const b = poly[(i + 1) % poly.length];
        result.push(a);
        // Recoger intersecciones con todas las aristas del otro polígono
        const hits = [];
        for (let j = 0; j < otherPoly.length; j++) {
          const c = otherPoly[j];
          const d = otherPoly[(j + 1) % otherPoly.length];
          const pt = segIntersect(a, b, c, d);
          if (pt && !ptEq(pt, a) && !ptEq(pt, b)) hits.push(pt);
        }
        // Ordenar intersecciones a lo largo de AB por parámetro t
        const len2 = (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2;
        hits.sort((p, q) => {
          const tp = ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / len2;
          const tq = ((q[0] - a[0]) * (b[0] - a[0]) + (q[1] - a[1]) * (b[1] - a[1])) / len2;
          return tp - tq;
        });
        result.push(...hits);
      }
      return result;
    };

    const rich1 = enrichPoly(poly1, poly2);
    const rich2 = enrichPoly(poly2, poly1);

    // ── Construir el contorno exterior ──────────────────────────────────
    // Tomar los segmentos de cada polígono enriquecido cuyo punto medio
    // NO esté estrictamente dentro del otro polígono (son aristas exteriores)
    const exteriorEdges = [];

    const collectExterior = (poly, otherPoly) => {
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i];
        const b = poly[(i + 1) % poly.length];
        const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        if (!pointInPoly(mid, otherPoly) || pointInPoly(mid, otherPoly) === true && ptEq(mid, mid)) {
          // Solo incluir si el punto medio NO está estrictamente dentro del otro
          const inside = pointInPoly(mid, otherPoly);
          // "en borde" se considera parte del exterior compartido → no duplicar
          if (!inside) exteriorEdges.push([a, b]);
        }
      }
    };

    collectExterior(rich1, rich2);
    collectExterior(rich2, rich1);

    if (exteriorEdges.length === 0) return;

    // ── Construir mapa de adyacencia y recorrer el contorno ─────────────
    const adjMap = new Map();
    const addHalfEdge = (a, b) => {
      const ka = ptKey(a), kb = ptKey(b);
      if (!adjMap.has(ka)) adjMap.set(ka, { pt: a, neighbors: [] });
      if (!adjMap.has(kb)) adjMap.set(kb, { pt: b, neighbors: [] });
      // Evitar duplicados
      if (!adjMap.get(ka).neighbors.some(n => n.k === kb))
        adjMap.get(ka).neighbors.push({ k: kb, pt: b });
      if (!adjMap.get(kb).neighbors.some(n => n.k === ka))
        adjMap.get(kb).neighbors.push({ k: ka, pt: a });
    };

    exteriorEdges.forEach(([a, b]) => addHalfEdge(a, b));

    // Punto de inicio: mínimo X (luego Y) — garantizado exterior
    let startKey = null;
    let bestX = Infinity, bestY = Infinity;
    adjMap.forEach(({ pt }, k) => {
      if (pt[0] < bestX || (pt[0] === bestX && pt[1] < bestY)) {
        bestX = pt[0]; bestY = pt[1]; startKey = k;
      }
    });

    const outline = [];
    const visited = new Set();
    let curKey = startKey;
    let prevKey = null;

    for (let iter = 0; iter <= adjMap.size; iter++) {
      const node = adjMap.get(curKey);
      if (!node) break;
      outline.push(node.pt);
      visited.add(curKey);

      // Entre los vecinos no visitados (y no el de donde venimos), elegir
      // el que forma el ángulo más a la izquierda (giro CCW) para seguir
      // el contorno exterior correctamente
      const cands = node.neighbors.filter(n => n.k !== prevKey);
      if (cands.length === 0) break;

      let nextKey;
      if (cands.length === 1) {
        nextKey = cands[0].k;
      } else {
        // Seleccionar el vecino con menor ángulo polar desde la dirección de llegada
        const prev = prevKey ? adjMap.get(prevKey)?.pt : null;
        const dx0 = prev ? node.pt[0] - prev[0] : 1;
        const dy0 = prev ? node.pt[1] - prev[1] : 0;
        const baseAngle = Math.atan2(dy0, dx0);
        const angleOf = (cand) => {
          const dx = cand.pt[0] - node.pt[0];
          const dy = cand.pt[1] - node.pt[1];
          let a = Math.atan2(dy, dx) - baseAngle;
          if (a <= -Math.PI) a += 2 * Math.PI;
          if (a > Math.PI) a -= 2 * Math.PI;
          return a;
        };
        // Girar siempre a la derecha (ángulo más negativo) para trazar el exterior
        cands.sort((a, b) => angleOf(a) - angleOf(b));
        nextKey = cands[0].k;
      }

      if (nextKey === startKey) break;
      prevKey = curKey;
      curKey = nextKey;
    }

    if (outline.length < 3) return;

    // ── Recentralizar y convertir a coords locales ───────────────────────
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    outline.forEach(([x, y]) => { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); });
    const newCX = (minX + maxX) / 2;
    const newCY = (minY + maxY) / 2;
    const newPosition = [snapValue(newCX), obj1.position[1], snapValue(-newCY)];
    const newPoints = outline.map(([x, y]) => [snapValue(x - newCX), snapValue(y - newCY)]);

    const newId = `${obj1.id}-${Math.random().toString(36).substr(2, 4)}`;
    const newObj = {
      ...obj1,
      id: newId,
      name: `${obj1.name} (Unido)`,
      position: newPosition,
      points: newPoints,
    };

    if (primaryType === 'island') {
      setIslands(prev => [...prev.filter(isl => isl.id !== primaryId && isl.id !== secondaryId), newObj]);
    } else {
      setStands(prev => renumberStands([...prev.filter(std => std.id !== primaryId && std.id !== secondaryId), newObj]));
    }

    setFocusTarget({ id: newId, type: primaryType, x: newPosition[0], y: newPosition[1], z: newPosition[2] });
  };

  const handleSplit = (id, type, cutInfo) => {
    if (!canEditObjectType(type)) return;
    if (!cutInfo) return;
    saveHistory(); // Guardar antes de dividir
    const { axis, value } = cutInfo;

    const targetArray = type === 'island' ? islands : stands;
    const targetObj = targetArray.find(o => o.id === id);
    if (!targetObj) return;

    const points = targetObj.points;
    const pointsA = [];
    const pointsB = [];

    // Algoritmo de corte axial
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      const val1 = axis === 'x' ? p1[0] : p1[1];
      const val2 = axis === 'x' ? p2[0] : p2[1];

      if (val1 <= value) pointsA.push(p1);
      if (val1 >= value) pointsB.push(p1);

      if ((val1 < value && val2 > value) || (val1 > value && val2 < value)) {
        const t = (value - val1) / (val2 - val1);
        const intersect = axis === 'x'
          ? [value, p1[1] + (p2[1] - p1[1]) * t]
          : [p1[0] + (p2[0] - p1[0]) * t, value];
        pointsA.push(intersect);
        pointsB.push(intersect);
      }
    }

    const filterUnique = (pts) => {
      const unique = [];
      for (const p of pts) {
        if (unique.length === 0 || !(unique[unique.length - 1][0] === p[0] && unique[unique.length - 1][1] === p[1])) {
          unique.push(p);
        }
      }
      if (unique.length > 1 && unique[0][0] === unique[unique.length - 1][0] && unique[0][1] === unique[unique.length - 1][1]) unique.pop();
      return unique;
    };

    const cleanPointsA = filterUnique(pointsA);
    const cleanPointsB = filterUnique(pointsB);

    if (cleanPointsA.length < 3 || cleanPointsB.length < 3) return;

    // --- RE-CENTRALIZACIÓN DE LOS NUEVOS BLOQUES ---
    const getCenterAndRelativePoints = (pts, originalPos) => {
      let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
      pts.forEach(p => {
        minX = Math.min(minX, p[0]); minZ = Math.min(minZ, p[1]);
        maxX = Math.max(maxX, p[0]); maxZ = Math.max(maxZ, p[1]);
      });

      // Nuevo centro en coordenadas de mundo
      // IMPORTANTE: El eje local Y del polígono mapea al eje Z del mundo invertido
      const centerX = snapValue(originalPos[0] + (minX + maxX) / 2);
      const centerZ = snapValue(originalPos[2] - (minZ + maxZ) / 2);

      // Los puntos se vuelven relativos a este nuevo centro local
      const relativePoints = pts.map(p => [
        snapValue(p[0] + originalPos[0] - centerX),
        snapValue(p[1] - (originalPos[2] - centerZ))
      ]);

      return { position: [centerX, originalPos[1], centerZ], points: relativePoints };
    };

    const dataA = getCenterAndRelativePoints(cleanPointsA, targetObj.position);
    const dataB = getCenterAndRelativePoints(cleanPointsB, targetObj.position);

    const newIdA = `${targetObj.id}-${Math.random().toString(36).substr(2, 4)}`;
    const newIdB = `${targetObj.id}-${Math.random().toString(36).substr(2, 4)}`;

    const newObj1 = { ...targetObj, id: newIdA, ...dataA, name: `${targetObj.name} (P1)` };
    const newObj2 = { ...targetObj, id: newIdB, ...dataB, name: `${targetObj.name} (P2)` };

    if (type === 'island') {
      // Reasignar stands a la pieza de isla sobre la que están físicamente
      // Corregimos la comparación usando el sistema invertido para Z
      const originalAbsCutVal = axis === 'x'
        ? targetObj.position[0] + value
        : targetObj.position[2] - value;

      setStands(prev => prev.map(std => {
        if (std.islandId === id) {
          const stdVal = axis === 'x' ? std.position[0] : std.position[2];
          const belongsToA = axis === 'x' ? stdVal <= originalAbsCutVal : stdVal >= originalAbsCutVal;
          return { ...std, islandId: belongsToA ? newIdA : newIdB };
        }
        return std;
      }));
      setIslands(prev => [...prev.filter(isl => isl.id !== id), newObj1, newObj2]);
    } else {
      setStands(prev => renumberStands([...prev.filter(std => std.id !== id), newObj1, newObj2]));
    }

    // Seleccionar automáticamente una de las nuevas piezas
    setFocusTarget({
      id: newIdA,
      type,
      x: dataA.position[0],
      y: dataA.position[1],
      z: dataA.position[2]
    });
  };

  return (
    <div className="polygon-viewer-container">
      <div className="polygon-viewer-content">
        <Canvas
          shadows
          gl={{ antialias: true }}
          onContextMenu={(e) => e.preventDefault()}
          onPointerMissed={() => {
            if (suppressClickRef.current) return;
            setFocusTarget(null);
            setCameraFocusTarget(null);
            setIsTopViewReached(false);
            setDuplicatingItem(null);
            setDuplicatePreview(null);
            setIsCreatingStand(false);
          }}
        >
          <PerspectiveCamera makeDefault position={[40, 40, 40]} fov={50} near={0.05} far={10000} ref={cameraRef} />
          <CameraController
            focusTarget={cameraFocusTarget}
            isTopView={isTopViewReached || isPlanViewActive}
            onTopViewReached={setIsTopViewReached}
            isDragging={isDragging}
            editMode={editMode}
            isCameraLocked={isCreatingStand || isPlacingBoxStand || freeShapeMode !== null}
            orbitRef={orbitRef}
            isPlanView={isPlanViewActive}
            bounds={bounds}
          />
          <PlanViewController
            isActive={isPlanViewActive}
            bounds={bounds}
            orbitRef={orbitRef}
          />

          <color attach="background" args={['#070707']} />
          <ambientLight intensity={0.4} />
          <spotLight position={[20, 40, 20]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <directionalLight position={[-10, 20, -10]} intensity={0.5} />
          <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={100} blur={2} far={4.5} />
          <Grid
            infiniteGrid
            fadeDistance={3000}
            sectionSize={5}
            cellSize={0.5}
            sectionThickness={1}
            cellThickness={1}
            sectionColor="#6b7280"
            cellColor="#4b5563"
            opacity={1}
          />

          {/* Modelo 3D cargado por el usuario — base del suelo */}
          {revitFile && (
            <Model3D
              file={revitFile}
              orbitRef={orbitRef}
              unitMode="auto"
              manualScale={1}
              onLoadStart={() => setIsRevitLoading(true)}
              onLoadEnd={() => setIsRevitLoading(false)}
              onError={(msg) => { setFloorPlanError(msg); setIsRevitLoading(false); }}
            />
          )}

          {/* ── Box stands (cubos) ── */}
          <FloorClickPlane active={isPlacingBoxStand} gridSnapEnabled={isGridSnapEnabled} onPlace={handlePlaceBoxStand} />

          {/* ── Herramienta de dibujo libre de polígonos ── */}
          <FreeShapeDrawLayer
            active={freeShapeMode !== null}
            worldPoints={freeShapePoints}
            type={freeShapeMode || 'island'}
            gridSnapEnabled={isGridSnapEnabled}
            onAddPoint={handleFreeShapeAddPoint}
            onClose={handleFreeShapeClose}
            onCancel={handleFreeShapeCancel}
          />
          {boxStands.map((bs) => (
            <BoxStandMesh
              key={bs.id}
              stand={bs}
              isSelected={selectedBoxStandId === bs.id}
              selectionEnabled={editMode !== 'camera'}
              showDuplicateArrows={editMode === 'duplicate'}
              isScaleMode={editMode === 'move' && moveToolMode === 'scale'}
              orbitRef={orbitRef}
              suppressClickRef={suppressClickRef}
              onSelect={handleSelectBoxStand}
              onUpdatePosition={handleUpdateBoxStandPosition}
              onResizeFromFace={handleResizeBoxStandFromFace}
              onDuplicateTowards={handleDuplicateBoxStandTowards}
              gridSnapEnabled={isGridSnapEnabled}
            />
          ))}

          {layerVisibility.islands && islands.map(isl => (
            <EditablePolygon
              key={isl.id} {...isl} type="island"
              isSelected={focusTarget?.id === isl.id && focusTarget?.type === 'island'}
              editMode={editMode}
              moveToolMode={moveToolMode}
              cutAxis={cutAxis}
              onClick={setFocusTarget} onHover={setHoveredName}
              onUpdatePoints={handleUpdatePoints} onUpdatePosition={handleUpdatePosition} onUpdateRotation={handleUpdateRotation}
              onSplit={handleSplit}
              onMerge={handleMerge}
              onSaveHistory={saveHistory}
              onDragChange={setIsDragging}
              orbitRef={orbitRef}
              suppressClickRef={suppressClickRef}
              cutPreviewRef={cutPreviewRef}
              canEditTools={canEditObjectType('island')}
              gridSnapEnabled={isGridSnapEnabled}
              showDuplicateArrows={false}
              selectionEnabled={editMode !== 'camera'}
            />
          ))}

          {layerVisibility.stands && stands.map(std => (
            <EditablePolygon
              key={std.id} {...std} type="stand"
              isSelected={focusTarget?.id === std.id && focusTarget?.type === 'stand'}
              editMode={editMode}
              moveToolMode={moveToolMode}
              cutAxis={cutAxis}
              onClick={setFocusTarget} onHover={setHoveredName}
              onUpdatePoints={handleUpdatePoints} onUpdatePosition={handleUpdatePosition} onUpdateRotation={handleUpdateRotation}
              onSplit={handleSplit}
              onMerge={handleMerge}
              onSaveHistory={saveHistory}
              onDragChange={setIsDragging}
              orbitRef={orbitRef}
              suppressClickRef={suppressClickRef}
              cutPreviewRef={cutPreviewRef}
              canEditTools={canEditObjectType('stand')}
              isCreationLocked={isCreatingStand && focusTarget?.id === std.id && focusTarget?.type === 'stand'}
              onCreationComplete={handleCompleteStandCreation}
              onDuplicateTowards={handleDuplicateStandTowards}
              gridSnapEnabled={isGridSnapEnabled}
              showDuplicateArrows={editMode === 'duplicate'}
              selectionEnabled={editMode !== 'camera'}
              onToggleWallSide={handleToggleStandWallSide}
              frontSide={std.frontSide ?? null}
              onSetFrontSide={handleSetStandFrontSide}
            />
          ))}
        </Canvas>

        <div 
          className="viewer-superior-toolbar" 
          aria-label="SUPERIOR"
          style={{ display: 'flex', visibility: 'visible', opacity: 1 }}
        >
          <button
            className={`superior-btn ${isPlanViewActive ? 'active' : ''}`}
            onClick={() => {
              if (editMode === 'duplicate') {
                setEditMode('move');
                setMoveToolMode('translate');
              }
              if (isPlanViewActive) {
                handleExitPlanView();
              } else {
                handleEnterPlanView();
              }
            }}
            title={isPlanViewActive ? 'Salir de Vista de Planta' : 'Vista de Planta'}
          >
            <Camera size={20} />
          </button>
          <button
            className={`superior-btn ${isObjectSnapEnabled ? 'active' : ''}`}
            onClick={() => {
              if (editMode === 'duplicate') {
                setEditMode('move');
                setMoveToolMode('translate');
              }
              setIsObjectSnapEnabled((prev) => !prev);
            }}
            title={isObjectSnapEnabled ? 'Snap de objetos activo' : 'Snap de objetos inactivo'}
          >
            <Magnet size={20} />
          </button>
          <button
            className={`superior-btn ${isGridSnapEnabled ? 'active' : ''}`}
            onClick={() => {
              if (editMode === 'duplicate') {
                setEditMode('move');
                setMoveToolMode('translate');
              }
              setIsGridSnapEnabled((prev) => !prev);
            }}
            title={isGridSnapEnabled ? 'Snap a cuadrícula activo' : 'Snap a cuadrícula inactivo'}
          >
            <Grid3x3 size={20} />
          </button>

          {/* Divisor */}
          <div className="superior-divider" />

          <button
            className="superior-btn"
            onClick={openSaveVersionPanel}
            title="Guardar versión"
          >
            <Save size={20} />
          </button>
          <button
            className="superior-btn"
            onClick={handlePublishDefinitiveVersion}
            title="Publicar versión"
          >
            <MonitorUp size={20} />
          </button>
          <button
            className="superior-btn superior-btn-exit"
            onClick={() => navigate(-1)}
            title="Salir"
          >
            <Unplug size={20} />
          </button>
        </div>

        {/* Botones de navegación flotantes en esquina superior izquierda */}
        <div className="polygon-nav-buttons">
          <button
            className="toolbar-btn"
            onClick={() => (onBack ? onBack() : navigate(`/fairs/${fairId}`))}
            title="Volver a la feria"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="toolbar-btn-label">Feria</span>
          </button>
        </div>

        {isLoadingFloorPlan && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/35 backdrop-blur-sm">
            <div className="border border-border bg-card px-4 py-3 text-sm font-medium text-foreground">
              Cargando plano 3D...
            </div>
          </div>
        )}

        {floorPlanError && (
          <div className="absolute bottom-6 left-1/2 z-30 w-[min(560px,calc(100%-2rem))] -translate-x-1/2 border border-destructive bg-card px-4 py-3 text-sm text-destructive">
            {floorPlanError}
          </div>
        )}

        <ObjectListPanel
          activeRole={activeRole}
          roleLabels={roleLabels}
          objectSearchTerm={objectSearchTerm}
          setObjectSearchTerm={setObjectSearchTerm}
          filteredIslands={filteredIslands}
          stands={stands}
          focusTarget={focusTarget}
          setFocusTarget={setFocusTarget}
          handleFocusStand={handleFocusStand}
          layerVisibility={layerVisibility}
          setLayerVisibility={setLayerVisibility}
          reservations={fairReservations}
          canManageReservations={canManageReservations}
          onQuickApproveReservation={handleQuickApproveReservation}
          onQuickCancelReservation={handleQuickCancelReservation}
        />

        {isSaveVersionPanelOpen && (
          <div className="mvp-save-version-overlay" onClick={() => setIsSaveVersionPanelOpen(false)}>
            <div className="polygon-card ds-card mvp-save-version-panel" onClick={(e) => e.stopPropagation()}>
              <h4>Guardar versión definitiva</h4>
              <p className="mvp-save-version-subtitle">
                Esta versión quedará marcada como definitiva en la sesión actual.
              </p>

              <label className="mvp-field">
                <span className="mvp-field-label">Nombre de versión</span>
                <input
                  type="text"
                  value={versionDraftName}
                  onChange={(e) => setVersionDraftName(e.target.value)}
                  placeholder="e.g. Sales close day 1"
                />
              </label>

              <label className="mvp-field">
                <span className="mvp-field-label">Etiqueta de versión</span>
                <input
                  type="text"
                  value={versionDraftLabel}
                  onChange={(e) => setVersionDraftLabel(e.target.value)}
                  placeholder="Ej: v1.0"
                />
              </label>

              <label className="mvp-field">
                <span className="mvp-field-label">Notas (opcional)</span>
                <textarea
                  value={versionDraftNotes}
                  onChange={(e) => setVersionDraftNotes(e.target.value)}
                  placeholder="Resumen de cambios, criterio de cierre, observaciones..."
                  rows={3}
                />
              </label>

              <div className="mvp-save-version-meta">
                <strong>Resumen de la sesión</strong>
                <span>Rol activo: {roleLabels[activeRole] || activeRole}</span>
                <span>Islas: {islands.length}</span>
                <span>Stands: {stands.length}</span>
                <span>Reservados: {reservedStandsCount}</span>
                <span>Selección actual: {focusTarget ? `${focusTarget.type} ${focusTarget.id}` : 'Ninguna'}</span>
              </div>

              <div className="mvp-save-version-actions">
                <button className="ds-btn ds-btn-outline" onClick={() => setIsSaveVersionPanelOpen(false)}>
                  Cancelar
                </button>
                <button
                  className="ds-btn ds-btn-secondary"
                  onClick={handleSaveVersion}
                  disabled={!versionDraftName.trim() || !versionDraftLabel.trim()}
                >
                  Guardar definitiva
                </button>
              </div>
            </div>
          </div>
        )}

        {isReservationFormOpen && selectedStand && !selectedStand.reserved && (
          <div className="mvp-save-version-overlay" onClick={() => setIsReservationFormOpen(false)}>
            <div className="polygon-card ds-card mvp-save-version-panel reservation-modal-panel" onClick={(e) => e.stopPropagation()}>
              <h4>Reservar stand</h4>
              <p className="mvp-save-version-subtitle">
                Completa los datos para reservar {selectedStand.name}.
              </p>

              <label className="mvp-field">
                <span className="mvp-field-label">Empresa</span>
                <input value={reservationForm.company} onChange={(e) => setReservationFormField('company', e.target.value)} />
              </label>

              <label className="mvp-field">
                <span className="mvp-field-label">Nombre contacto</span>
                <input value={reservationForm.contactName} onChange={(e) => setReservationFormField('contactName', e.target.value)} />
              </label>

              <label className="mvp-field">
                <span className="mvp-field-label">Telefono</span>
                <input value={reservationForm.contactPhone} onChange={(e) => setReservationFormField('contactPhone', e.target.value)} />
              </label>

              <label className="mvp-field">
                <span className="mvp-field-label">Email</span>
                <input type="email" value={reservationForm.contactEmail} onChange={(e) => setReservationFormField('contactEmail', e.target.value)} />
              </label>

              <label className="mvp-field">
                <span className="mvp-field-label">Notas</span>
                <textarea rows={4} value={reservationForm.notes} onChange={(e) => setReservationFormField('notes', e.target.value)} />
              </label>

              <div className="mvp-save-version-actions">
                <button className="ds-btn ds-btn-outline" onClick={() => setIsReservationFormOpen(false)}>
                  Cancelar
                </button>
                <button
                  className="ds-btn ds-btn-secondary"
                  onClick={handleReserveSelectedStand}
                  disabled={!reservationForm.company.trim()}
                >
                  Confirmar reserva
                </button>
              </div>
            </div>
          </div>
        )}

        {isClientDetailsOpen && selectedStand && selectedStand.reserved && (
          <div className="mvp-save-version-overlay" onClick={() => setIsClientDetailsOpen(false)}>
            <div className="polygon-card ds-card mvp-save-version-panel reservation-modal-panel" onClick={(e) => e.stopPropagation()}>
              <h4>Datos del cliente</h4>
              <p className="mvp-save-version-subtitle">
                Información del cliente para {selectedStand.name}.
              </p>

              <div className="client-details-content">
                <div className="object-property-row">
                  <span>Empresa</span>
                  <strong>{selectedStand.reservedBy || 'No especificada'}</strong>
                </div>
                
                {selectedStand.reservedContact && (
                  <>
                    {selectedStand.reservedContact.name && (
                      <div className="object-property-row">
                        <span>Nombre contacto</span>
                        <strong>{selectedStand.reservedContact.name}</strong>
                      </div>
                    )}
                    {selectedStand.reservedContact.phone && (
                      <div className="object-property-row">
                        <span>Telefono</span>
                        <strong>{selectedStand.reservedContact.phone}</strong>
                      </div>
                    )}
                    {selectedStand.reservedContact.email && (
                      <div className="object-property-row">
                        <span>Email</span>
                        <strong>{selectedStand.reservedContact.email}</strong>
                      </div>
                    )}
                  </>
                )}
                
                {selectedStand.reservedNotes && (
                  <div className="client-notes">
                    <span>Notas</span>
                    <p>{selectedStand.reservedNotes}</p>
                  </div>
                )}
              </div>

              <div className="mvp-save-version-actions">
                <button className="ds-btn ds-btn-secondary" onClick={() => setIsClientDetailsOpen(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        <ViewerEditingToolbar
          isPlanViewActive={isPlanViewActive}
          canEditFocusedObject={canEditFocusedObject}
          canCreateObjects={canCreateObjects}
          focusTarget={focusTarget}
          hasBoxStandSelection={Boolean(selectedBoxStandId)}
          canEditObjectType={canEditObjectType}
          editMode={editMode}
          moveToolMode={moveToolMode}
          freeShapeMode={freeShapeMode}
          onActivateCameraMode={handleActivateCameraMode}
          onActivateSelectMode={handleActivateSelectMode}
          onActivateShapeMode={handleActivateShapeMode}
          onActivateRotateMode={handleActivateRotateMode}
          onActivateDuplicateTool={handleActivateDuplicateTool}
          onActivateScaleMode={handleActivateScaleMode}
          onActivateWallsTool={handleActivateWallsTool}
          onFocusSelectedObject={handleFocusSelectedObject}
          handleCreateStand={handleCreateStand}
          handleCreateIsland={handleCreateIsland}
          handleCreateFreeIsland={handleStartFreeIsland}
          handleCreateFreeStand={handleStartFreeStand}
          handleDeleteSelection={handleDeleteSelection}
          onUndo={undo}
          onRedo={redo}
          canUndo={history.length > 0}
          canRedo={redoStack.length > 0}
        />

        <div className="right-panels-column">
          <ObjectPropertiesPanel
            selectedObject={selectedObject}
            focusTarget={focusTarget}
            objectNameDraft={objectNameDraft}
            setObjectNameDraft={setObjectNameDraft}
            handleRenameSelectedObject={handleRenameSelectedObject}
            canEditObjectType={canEditObjectType}
            selectedObjectMetrics={selectedObjectMetrics}
            onApplyObjectTransform={handleApplySelectedObjectTransform}
            onApplyObjectArea={handleApplySelectedObjectArea}
            canManageReservations={canManageReservations}
            openReservationForm={() => setIsReservationFormOpen(true)}
            handleReleaseSelectedStand={handleReleaseSelectedStand}
            onToggleStandWallSide={handleToggleStandWallSide}
            openClientDetails={() => setIsClientDetailsOpen(true)}
          />

          {focusTarget?.type === 'stand' && <section className="polygon-card ds-card object-stand-carousel-panel" aria-label="Stands de referencia">
            <div className="osc-header">
              <h4>Stands Reales</h4>
              <span className="osc-chip">{selectedArea > 0 ? `${selectedArea.toFixed(1)} m2` : 'Sin hueco'}</span>
            </div>

            {activeStandReference ? (
              <>
                <div className="osc-image-wrap">
                  <img src={activeStandReference.image} alt={activeStandReference.name} />
                  <div className="osc-overlay">
                    <strong>{activeStandReference.name}</strong>
                    <span>{activeStandReference.caption}</span>
                  </div>
                </div>

                <div className="osc-stats-grid">
                  <div className="osc-stat-card">
                    <span>Huella base</span>
                    <strong>{activeStandReference.footprint} m2</strong>
                  </div>
                  <div className="osc-stat-card">
                    <span>Encajan aprox.</span>
                    <strong>{activeStandReference.fitCount}</strong>
                  </div>
                </div>

                <div className="osc-controls">
                  <button
                    className="osc-nav-btn"
                    onClick={() => setStandCarouselIndex((prev) => prev - 1)}
                    title="Anterior"
                  >
                    Anterior
                  </button>
                  <div className="osc-dots" role="tablist" aria-label="Variantes de stand">
                    {standCarouselItems.map((item, idx) => {
                      const isActive = item.id === activeStandReference.id;
                      return (
                        <button
                          key={item.id}
                          className={`osc-dot ${isActive ? 'active' : ''}`}
                          onClick={() => setStandCarouselIndex(idx)}
                          aria-label={`Mostrar ${item.name}`}
                          aria-selected={isActive}
                        />
                      );
                    })}
                  </div>
                  <button
                    className="osc-nav-btn"
                    onClick={() => setStandCarouselIndex((prev) => prev + 1)}
                    title="Siguiente"
                  >
                    Siguiente
                  </button>
                </div>
              </>
            ) : (
              <p className="object-properties-empty">Selecciona un hueco para ver referencias de stands.</p>
            )}
          </section>}
        </div>

        {/* ── Box stand system (fuera del Canvas) ── */}
        <PlacementCursor active={isPlacingBoxStand} />
        <BoxStandToolbar
          isPlacing={isPlacingBoxStand}
          canEdit={canUseTools}
          onToggle={() => {
            const nextIsPlacing = !isPlacingBoxStand;
            setIsPlacingBoxStand(nextIsPlacing);
            setIsCreatingStand(nextIsPlacing);
            setSelectedBoxStandId(null);
            setFocusTarget(null);
          }}
        />
        <BoxStandProperties
          stand={selectedBoxStand}
          onUpdate={handleUpdateBoxStand}
          onDelete={handleDeleteBoxStand}
        />
      </div>
    </div>
  );
}
