import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Html, Environment, ContactShadows } from '@react-three/drei';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import planimetriaStands from '@/data/planimetria5-stands.json';

interface StandData {
  code: string;
  width: number;
  height: number;
  status: string;
  company: string | null;
}

interface PositionedStand extends StandData {
  id: string;
  position: [number, number, number];
}

const snapValue = (val: number) => Math.round(val);

function VertexHandle({ 
  position, 
  onPointerDown, 
  onDelete, 
  canDelete,
  color = "#f472b6" 
}: { 
  position: [number, number, number];
  onPointerDown?: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
  color?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [rightHovered, setRightHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.12;
      meshRef.current.scale.setScalar(hovered || dragging ? 1.4 : pulse);
    }
  });

  const deleteColor = "#ef4444";
  const displayColor = rightHovered && canDelete ? deleteColor : color;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'grab'; }}
        onPointerOut={() => { setHovered(false); setDragging(false); setRightHovered(false); document.body.style.cursor = 'default'; }}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (e.button === 2) {
            if (canDelete && onDelete) onDelete();
            return;
          }
          setDragging(true);
          document.body.style.cursor = 'grabbing';
          if (onPointerDown) onPointerDown();
        }}
        onContextMenu={(e) => { e.stopPropagation(); e.nativeEvent?.preventDefault?.(); }}
        onDoubleClick={(e) => { e.stopPropagation(); if (canDelete && onDelete) onDelete(); }}
      >
        <octahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial
          color={rightHovered && canDelete ? "#ffffff" : hovered || dragging ? "#ffffff" : displayColor}
          emissive={displayColor}
          emissiveIntensity={rightHovered && canDelete ? 1.5 : hovered || dragging ? 1.0 : 0.6}
          metalness={0.3}
          roughness={0.1}
          depthTest={false}
        />
      </mesh>
    </group>
  );
}

function StandMesh({ 
  stand, 
  isSelected, 
  onClick, 
  onPointerOver, 
  onPointerOut,
  isEditing
}: { 
  stand: PositionedStand;
  isSelected: boolean;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
  isEditing: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  
  const color = stand.status === 'reserved' ? '#ff0000' : '#99ff00';
  const opacity = isSelected ? 1 : hovered ? 0.85 : 0.7;
  
  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: isSelected ? (stand.status === 'reserved' ? '#431010' : '#2f4310') : color,
      metalness: isSelected ? 0.7 : 0.6,
      roughness: isSelected ? 0.15 : 0.2,
      transparent: true,
      opacity: opacity,
      emissive: isSelected ? color : '#000000',
      emissiveIntensity: isSelected ? 0.22 : 0,
    });
    return mat;
  }, [color, isSelected, stand.status, opacity]);

  return (
    <group position={[stand.position[0], stand.height / 2, stand.position[2]]}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onPointerOver(); }}
        onPointerOut={() => { setHovered(false); onPointerOut(); }}
        material={material}
      >
        <boxGeometry args={[stand.width, stand.height, stand.height]} />
      </mesh>
      
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(stand.width, stand.height, stand.height)]} />
        <lineBasicMaterial color={isSelected ? '#ffffff' : color} linewidth={2} />
      </lineSegments>

      {isSelected && (
        <mesh position={[0, stand.height / 2 + 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[stand.width + 0.5, stand.height + 0.5]} />
          <meshBasicMaterial color={color} transparent opacity={0.15} depthTest={false} />
        </mesh>
      )}
      
      <Html 
        position={[0, stand.height + 0.5, 0]} 
        center 
        distanceFactor={25}
        style={{ pointerEvents: 'none' }}
      >
        <div className={`border px-[6.55px] py-[3.36px] text-[10.24px] whitespace-nowrap ${
          stand.status === 'reserved' 
            ? 'bg-destructive-surface text-destructive border-destructive' 
            : 'bg-primary-surface text-primary border-primary'
        }`}>
          {stand.code}
        </div>
      </Html>
    </group>
  );
}

export default function PlanViewer3D() {
  const [selectedStandCode, setSelectedStandCode] = useState<string | null>(null);
  const [hoveredStand, setHoveredStand] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'move' | 'shape' | 'cut'>('move');
  const [viewMode, setViewMode] = useState<'3D' | 'plan'>('3D');
  const orbitRef = useRef<any>(null);

  const standsData: StandData[] = planimetriaStands.stands;

  const positionedStands = useMemo(() => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L'];
    const result: PositionedStand[] = [];
    
    let currentX = -50;
    let currentZ = -40;
    let rowMaxHeight = 0;
    let colIndex = 0;

    standsData.forEach((stand, index) => {
      if (index > 0 && index % 8 === 0) {
        currentX += 25;
        currentZ = -40;
        rowMaxHeight = 0;
        colIndex++;
      }
      
      const x = currentX;
      const z = currentZ + stand.height / 2;
      
      result.push({
        ...stand,
        id: `stand-${index}`,
        position: [x, 0, z]
      });
      
      currentZ += stand.height + 1;
      rowMaxHeight = Math.max(rowMaxHeight, stand.height);
    });
    
    return result;
  }, [standsData]);

  const selectedStand = selectedStandCode 
    ? positionedStands.find(s => s.code === selectedStandCode) 
    : null;

  const reservedCount = standsData.filter(s => s.status === 'reserved').length;
  const availableCount = standsData.filter(s => s.status === 'available').length;

  const handleStandClick = (code: string) => {
    setSelectedStandCode(code);
  };

  const handleResetView = () => {
    if (orbitRef.current) {
      orbitRef.current.reset();
    }
  };

  return (
    <div className="w-full h-full relative">
      <Canvas shadows camera={{ position: [0, 60, 40], fov: 50 }} gl={{ antialias: true }}>
        <color attach="background" args={['#0a0a0a']} />
        
        <ambientLight intensity={0.4} />
        <directionalLight position={[50, 80, 30]} intensity={1} castShadow />
        
        <Grid 
          args={[200, 200]} 
          cellSize={1} 
          cellThickness={0.5} 
          cellColor="#27292d" 
          sectionSize={5} 
          sectionThickness={1}
          sectionColor="#333333"
          fadeDistance={150}
          infiniteGrid
        />
        
        <group>
          {positionedStands.map((stand) => (
            <StandMesh
              key={stand.id}
              stand={stand}
              isSelected={selectedStandCode === stand.code}
              onClick={() => handleStandClick(stand.code)}
              onPointerOver={() => setHoveredStand(stand.code)}
              onPointerOut={() => setHoveredStand(null)}
              isEditing={editMode === 'shape'}
            />
          ))}
        </group>
        
        <ContactShadows 
          position={[0, -0.01, 0]} 
          opacity={0.4} 
          scale={100} 
          blur={2} 
          far={50} 
        />
        
        <OrbitControls 
          ref={orbitRef}
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={viewMode === 'plan' ? 0 : Math.PI / 2.1}
          minDistance={10}
          maxDistance={150}
        />
      </Canvas>

      <div className="absolute left-4 top-4 min-w-[180px] border border-border bg-card px-[16px] py-[12.8px]">
        <h3 className="mb-[8.19px] text-[12.8px] font-semibold text-foreground">LEYENDA</h3>
        <div className="space-y-[6.55px] text-[12.8px]">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 border border-primary bg-primary-surface"></div>
            <span className="text-muted-foreground">Disponibles ({availableCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 border border-destructive bg-destructive-surface"></div>
            <span className="text-muted-foreground">Reservados ({reservedCount})</span>
          </div>
        </div>
      </div>

      {selectedStand && (
        <div className="absolute right-4 top-4 min-w-[220px] border border-border bg-card px-[16px] py-[12.8px]">
          <div className="mb-[8.19px] flex items-center justify-between gap-2">
            <h3 className="text-[16px] font-bold text-foreground">{selectedStand.code}</h3>
            <span className={`border px-[6.55px] py-[3.36px] text-[10.24px] font-bold ${
              selectedStand.status === 'reserved' 
                ? 'bg-destructive-surface text-destructive border-destructive'
                : 'bg-primary-surface text-primary border-primary'
            }`}>
              {selectedStand.status === 'reserved' ? 'RESERVADO' : 'DISPONIBLE'}
            </span>
          </div>
          <div className="space-y-[6.55px] text-[12.8px] text-muted-foreground">
            <div className="flex justify-between">
              <span>Ancho:</span>
              <span className="font-medium text-foreground">{selectedStand.width}m</span>
            </div>
            <div className="flex justify-between">
              <span>Fondo:</span>
              <span className="font-medium text-foreground">{selectedStand.height}m</span>
            </div>
            <div className="flex justify-between">
              <span>Area:</span>
              <span className="font-medium text-foreground">{selectedStand.width * selectedStand.height}m²</span>
            </div>
            {selectedStand.company && (
              <div className="mt-[8.19px] border-t border-border pt-[8.19px]">
                <span className="mb-[5.24px] block text-[10.24px] text-muted-foreground">Empresa:</span>
                <span className="font-medium text-foreground">{selectedStand.company}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-[6.55px] border border-border bg-card p-[8.19px]">
        <button
          onClick={() => setViewMode(viewMode === '3D' ? 'plan' : '3D')}
          className={`border px-[12.8px] py-[8.19px] text-[12.8px] font-medium transition-colors ${
            viewMode === '3D' ? 'border-primary bg-primary-surface text-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
          }`}
        >
          {viewMode === '3D' ? 'Vista 3D' : 'Vista Planta'}
        </button>
        <div className="mx-[3.36px] w-px bg-border"></div>
        <button
          onClick={() => setEditMode('move')}
          className={`border px-[12.8px] py-[8.19px] text-[12.8px] font-medium transition-colors ${
            editMode === 'move' ? 'border-accent bg-accent-surface text-accent' : 'border-border text-muted-foreground hover:border-accent hover:text-foreground'
          }`}
        >
          Mover
        </button>
        <button
          onClick={() => setEditMode('shape')}
          className={`border px-[12.8px] py-[8.19px] text-[12.8px] font-medium transition-colors ${
            editMode === 'shape' ? 'border-primary bg-primary-surface text-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
          }`}
        >
          Forma
        </button>
        <button
          onClick={() => setEditMode('cut')}
          className={`border px-[12.8px] py-[8.19px] text-[12.8px] font-medium transition-colors ${
            editMode === 'cut' ? 'border-destructive bg-destructive-surface text-destructive' : 'border-border text-muted-foreground hover:border-destructive hover:text-foreground'
          }`}
        >
          Cortar
        </button>
      </div>

      <div className="absolute bottom-20 right-4 max-w-[220px] border border-border bg-card px-[12.8px] py-[8.19px] text-[12.8px] text-muted-foreground">
        {editMode === 'move' && (
          <p>Usa M para trasladar y R para rotar. Arrastra el gizmo para transformar.</p>
        )}
        {editMode === 'shape' && (
          <p>Arrastra vértices para ajustar. Clic en punto medio para insertar. Clic derecho para eliminar.</p>
        )}
        {editMode === 'cut' && (
          <p>Usa V para vertical cut y H para horizontal. Confirma con Enter.</p>
        )}
      </div>
    </div>
  );
}
