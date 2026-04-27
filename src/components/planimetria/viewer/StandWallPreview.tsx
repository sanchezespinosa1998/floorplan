import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';

interface StandWallPreviewProps {
  stand: {
    points?: Array<[number, number]>;
    h?: number;
    color?: string;
    wallSides?: number[];
  };
  canEdit: boolean;
  onToggleWallSide: (sideIndex: number) => void;
}

interface PreviewStandMeshProps {
  points: Array<[number, number]>;
  height: number;
  color: string;
  wallSides: number[];
  canEdit: boolean;
  onToggleWallSide: (sideIndex: number) => void;
}

function buildShape(points: Array<[number, number]>) {
  const shape = new THREE.Shape();
  if (!points.length) return shape;
  shape.moveTo(points[0][0], points[0][1]);
  for (let index = 1; index < points.length; index += 1) {
    shape.lineTo(points[index][0], points[index][1]);
  }
  shape.closePath();
  return shape;
}

function computeBounds(points: Array<[number, number]>) {
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
    width: Math.max(1, maxX - minX),
    depth: Math.max(1, maxY - minY),
  };
}

function computeWallSegments(points: Array<[number, number]>, height: number) {
  if (points.length < 2) return [];

  return points.map((point, sideIndex) => {
    const nextPoint = points[(sideIndex + 1) % points.length];
    const x1 = point[0];
    const z1 = -point[1];
    const x2 = nextPoint[0];
    const z2 = -nextPoint[1];
    const dx = x2 - x1;
    const dz = z2 - z1;
    const length = Math.max(0.35, Math.hypot(dx, dz));

    return {
      sideIndex,
      length,
      position: [(x1 + x2) / 2, height / 2 + 0.02, (z1 + z2) / 2] as [number, number, number],
      rotationY: Math.atan2(dz, dx),
    };
  });
}

function PreviewStandMesh({ points, height, color, wallSides, canEdit, onToggleWallSide }: PreviewStandMeshProps) {
  const shape = useMemo(() => buildShape(points), [points]);
  const geometry = useMemo(
    () => new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false }),
    [shape, height],
  );
  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);
  const wallSegments = useMemo(() => computeWallSegments(points, height), [points, height]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow geometry={geometry}>
        <meshStandardMaterial color={color} metalness={0.22} roughness={0.42} transparent opacity={0.92} />
      </mesh>

      <lineSegments rotation={[-Math.PI / 2, 0, 0]} geometry={edgesGeometry}>
        <lineBasicMaterial color="#dbeafe" transparent opacity={0.9} />
      </lineSegments>

      {wallSegments.map((segment) => {
        const isActive = wallSides.includes(segment.sideIndex);

        return (
          <group key={`preview-wall-${segment.sideIndex}`}>
            <mesh
              position={segment.position}
              rotation={[0, segment.rotationY, 0]}
              castShadow
              receiveShadow
              onClick={(event) => {
                event.stopPropagation();
                if (!canEdit) return;
                onToggleWallSide(segment.sideIndex);
              }}
              onPointerOver={() => {
                if (canEdit) document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'default';
              }}
            >
              <boxGeometry args={[segment.length, height, isActive ? 0.22 : 0.12]} />
              <meshStandardMaterial
                color={isActive ? '#111827' : '#7dd3fc'}
                emissive={isActive ? '#1f2937' : '#0ea5e9'}
                emissiveIntensity={isActive ? 0.18 : 0.26}
                roughness={0.5}
                metalness={isActive ? 0.12 : 0.06}
                transparent
                opacity={isActive ? 0.98 : 0.32}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function StandWallPreview({ stand, canEdit, onToggleWallSide }: StandWallPreviewProps) {
  const points = Array.isArray(stand.points) ? stand.points : [];
  const height = typeof stand.h === 'number' ? stand.h : 3;
  const color = stand.color || '#4f7cff';
  const wallSides = Array.isArray(stand.wallSides) ? stand.wallSides : [];
  const bounds = useMemo(() => computeBounds(points), [points]);
  const cameraDistance = Math.max(bounds.width, bounds.depth, height) * 1.75;

  if (points.length < 3) {
    return <div className="stand-wall-preview-empty">No hay geometria suficiente para previsualizar este stand.</div>;
  }

  return (
    <div className="stand-wall-preview-shell">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [cameraDistance, cameraDistance * 0.85, cameraDistance], fov: 42 }}
      >
        <color attach="background" args={['#07111f']} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[8, 10, 6]} intensity={1.2} castShadow />
        <directionalLight position={[-6, 6, -4]} intensity={0.35} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[Math.max(bounds.width, bounds.depth) + 8, Math.max(bounds.width, bounds.depth) + 8]} />
          <meshStandardMaterial color="#08101b" roughness={0.95} metalness={0.02} />
        </mesh>

        <gridHelper args={[Math.max(bounds.width, bounds.depth) + 8, Math.max(8, Math.ceil(Math.max(bounds.width, bounds.depth) + 8)), '#334155', '#16202f']} />

        <PreviewStandMesh
          points={points}
          height={height}
          color={color}
          wallSides={wallSides}
          canEdit={canEdit}
          onToggleWallSide={onToggleWallSide}
        />

        <OrbitControls enablePan={false} minDistance={cameraDistance * 0.5} maxDistance={cameraDistance * 2.4} />
      </Canvas>

      <div className="stand-wall-preview-legend">
        <span className="is-active">Pared activa</span>
        <span className="is-inactive">Haz clic en un lateral para {canEdit ? 'crear o quitar' : 'ver'} la pared</span>
      </div>
    </div>
  );
}