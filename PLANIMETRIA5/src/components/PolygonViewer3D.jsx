import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera, OrthographicCamera, Environment, ContactShadows, TransformControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import './PolygonViewer3D.css';

// --- HELPERS ---
const snapValue = (val) => Math.round(val);
const TOOL_ENABLED_ROLES = new Set(['comercial', 'arquitecto']);
const MVP_ROLES = ['expositor', 'comercial', 'arquitecto', 'administrador'];

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const renumberStands = (standsList) => {
  const ordered = [...standsList].sort((a, b) => {
    if (a.islandId !== b.islandId) return String(a.islandId).localeCompare(String(b.islandId));
    if (a.position[0] !== b.position[0]) return a.position[0] - b.position[0];
    return a.position[2] - b.position[2];
  });
  return ordered.map((stand, index) => ({ ...stand, name: `Stand ${index + 1}` }));
};

const summarizeNames = (items, maxItems = 4) => {
  if (!items.length) return 'Ninguno';
  const names = items.map((item) => item.name);
  if (names.length <= maxItems) return names.join(', ');
  return `${names.slice(0, maxItems).join(', ')} +${names.length - maxItems}`;
};

// Manejador de vértice: diamante sólido con pulso — para ARRASTRAR y reposicionar
// Clic derecho (o doble clic) sobre él lo ELIMINA si el polígono tiene > 3 vértices
function VertexHandle({ position, onPointerDown, onDelete, canDelete, color = "#f472b6" }) {
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [rightHovered, setRightHovered] = useState(false);
  const meshRef = useRef();
  const ringRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.12;
      meshRef.current.scale.setScalar(hovered || dragging ? 1.4 : pulse);
    }
    if (ringRef.current) {
      ringRef.current.rotation.y += 0.03;
      ringRef.current.material.opacity = rightHovered ? 0.9 : hovered ? 0.7 : 0.3;
    }
  });

  const deleteColor = "#ef4444";
  const displayColor = rightHovered && canDelete ? deleteColor : color;

  return (
    <group position={position}>
      {/* Anillo exterior giratorio — se vuelve rojo al hover derecho */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.38, 0.04, 8, 24]} />
        <meshBasicMaterial color={displayColor} transparent opacity={0.3} depthTest={false} />
      </mesh>

      {/* Cuerpo principal: octaedro (diamante) */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          setHovered(false);
          setDragging(false);
          setRightHovered(false);
          document.body.style.cursor = 'default';
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (e.button === 2) {
            // Clic derecho: eliminar vértice
            if (canDelete && onDelete) onDelete();
            return;
          }
          setDragging(true);
          document.body.style.cursor = 'grabbing';
          onPointerDown(e);
        }}
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
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.8;
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.5;
      meshRef.current.material.opacity = hovered ? 0.95 : 0.45;
    }
  });

  return (
    <group position={position}>
      {/* Cubo rotado en movimiento — indica "insertar" */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'cell'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial
          color={hovered ? "#86efac" : "#4ade80"}
          emissive="#4ade80"
          emissiveIntensity={hovered ? 1.2 : 0.4}
          transparent
          opacity={0.45}
          depthTest={false}
        />
      </mesh>

      {/* Cruz de + alrededor del cubo */}
      <mesh raycast={() => null}>
        <boxGeometry args={[0.44, 0.06, 0.06]} />
        <meshBasicMaterial color={hovered ? "#86efac" : "#4ade80"} transparent opacity={hovered ? 0.9 : 0.5} depthTest={false} />
      </mesh>
      <mesh raycast={() => null}>
        <boxGeometry args={[0.06, 0.06, 0.44]} />
        <meshBasicMaterial color={hovered ? "#86efac" : "#4ade80"} transparent opacity={hovered ? 0.9 : 0.5} depthTest={false} />
      </mesh>
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

// --- COMPONENTS ---

const MoveIcon = () => (
  <svg width="20" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="5 9 2 12 5 15" />
    <polyline points="9 5 12 2 15 5" />
    <polyline points="15 19 12 22 9 19" />
    <polyline points="19 9 22 12 19 15" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="12" y1="2" x2="12" y2="22" />
  </svg>
);

const ShapeIcon = () => (
  <svg width="20" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.37 2.63a2.12 2.12 0 1 1 3 3L12 15l-4 1 1-4Z" />
  </svg>
);

const CutIcon = () => (
  <svg width="20" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

const MergeIcon = () => (
  <svg width="20" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const PlanIcon = () => (
  <svg width="20" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

const DuplicateIcon = () => (
  <svg width="20" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="8" width="14" height="14" rx="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const GroupIcon = () => (
  <svg width="20" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="8" height="12" rx="1" />
    <rect x="14" y="6" width="8" height="12" rx="1" />
    <rect x="8" y="2" width="8" height="12" rx="1" />
  </svg>
);

function EditablePolygon({ id, type, position, points, h, color, name, isSelected, editMode, moveToolMode, cutAxis, onClick, onHover, onUpdatePoints, onUpdatePosition, onUpdateRotation, onSplit, onMerge, onSaveHistory, onDragChange, orbitRef, suppressClickRef, cutPreviewRef, canEditTools = true, reserved = false, reservedBy = '', rotationY = 0 }) {
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
      opacity: isSelected ? (type === 'island' ? 0.95 : 1.0) : (type === 'island' ? 0.9 : 1.0),
      emissive: isSelected ? selAcc : '#000000',
      emissiveIntensity: isSelected ? 0.22 : 0,
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
        vec3 grid = abs(fract(vWorldPos - 0.5) - 0.5) / (fwidth(vWorldPos) + 0.001);
        
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
                <span className="srt-owner">{reservationOwner || 'Unnamed'}</span>
              )}
            </div>
          </Html>
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
          showX={moveToolMode === 'translate'}
          showY={moveToolMode === 'rotate'}
          showZ={moveToolMode === 'translate'}
          translationSnap={moveToolMode === 'translate' ? 1 : undefined}
          rotationSnap={moveToolMode === 'rotate' ? Math.PI / 12 : undefined}
          onMouseDown={() => {
            if (onSaveHistory) onSaveHistory();
          }}
          onMouseUp={() => {
            if (!meshRef.current) return;
            if (moveToolMode === 'translate') {
              const newPos = meshRef.current.position;
              onUpdatePosition(id, type, [snapValue(newPos.x), position[1], snapValue(newPos.z)]);
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

function CameraController({ focusTarget, isTopView, onTopViewReached, isDragging, editMode, orbitRef, viewMode }) {
  const { camera } = useThree();
  const [reached, setReached] = useState(false);

  useFrame(() => {
    if (isDragging || editMode === 'merge') return;

    if (viewMode === 'plan') {
      camera.position.set(0, 50, 0);
      camera.lookAt(0, 0, 0);
      if (orbitRef.current) {
        orbitRef.current.target.set(0, 0, 0);
        orbitRef.current.update();
      }
      return;
    }

    if (focusTarget && orbitRef.current) {
      const targetPos = new THREE.Vector3(focusTarget.x, focusTarget.y, focusTarget.z);
      const camPos = new THREE.Vector3(focusTarget.x, focusTarget.y + 30, focusTarget.z);
      orbitRef.current.target.lerp(targetPos, 0.1);
      camera.position.lerp(camPos, 0.1);
      if (camera.position.distanceTo(camPos) < 0.1 && !reached) {
        setReached(true);
        if (onTopViewReached) onTopViewReached(true);
      }
      orbitRef.current.update();
    } else if (reached) {
      setReached(false);
      if (onTopViewReached) onTopViewReached(false);
    }
  });

  const isOrbitEnabled = !focusTarget && editMode !== 'merge' && !isDragging && viewMode !== 'plan';

  return <OrbitControls ref={orbitRef} makeDefault enableDamping dampingFactor={0.05} enabled={isOrbitEnabled} />;
}

export default function PolygonViewer3D({ onBack }) {
  const [hoveredName, setHoveredName] = useState(null);
  const [focusTarget, setFocusTarget] = useState(null);
  const [viewMode, setViewMode] = useState('3D'); // '3D' | 'plan'
  const [isTopViewReached, setIsTopViewReached] = useState(false);
  const [editMode, setEditMode] = useState('move'); // 'move' or 'shape'
  const [moveToolMode, setMoveToolMode] = useState('translate'); // 'translate' | 'rotate'
  const [activeRole, setActiveRole] = useState('arquitecto');
  const [layerVisibility, setLayerVisibility] = useState({ islands: true, stands: true });
  const [cutAxis, setCutAxis] = useState('x'); // 'x' = vertical cut (línea X fija), 'z' = horizontal cut (línea Z fija)
  const [isDragging, setIsDragging] = useState(false);
  const [projectVersions, setProjectVersions] = useState([]);
  const [reservationName, setReservationName] = useState('');
  const [isSaveVersionPanelOpen, setIsSaveVersionPanelOpen] = useState(false);
  const [versionDraftName, setVersionDraftName] = useState('');
  const [versionDraftLabel, setVersionDraftLabel] = useState('');
  const [versionDraftNotes, setVersionDraftNotes] = useState('');
  const [objectSearchTerm, setObjectSearchTerm] = useState('');
  const [objectNameDraft, setObjectNameDraft] = useState('');
  const [publishedVersionInfo, setPublishedVersionInfo] = useState(null);
  const orbitRef = useRef();
  const suppressClickRef = useRef(false);
  const cutPreviewRef = useRef(null);
  const [duplicatingItem, setDuplicatingItem] = useState(null); // { type: 'stand'|'island', id, offset: [x,y,z] }
  const [duplicatePreview, setDuplicatePreview] = useState(null); // { position, rotationY }

  const [islands, setIslands] = useState([
    { id: 'i1', name: 'Isla Norte', position: [-8, 0, -5], rotationY: 0, h: 0.2, color: '#1a1a1a', points: [[-7, -10], [7, -10], [7, 10], [-7, 10]] },
    { id: 'i2', name: 'Isla Central', position: [8, 0, 5], rotationY: 0, h: 0.2, color: '#1a1a1a', points: [[-9, -8], [9, -8], [9, 8], [-9, 8]] },
  ]);

  const [stands, setStands] = useState([
    { id: 1, islandId: 'i1', name: 'Stand N1', position: [-8, 0, -5], rotationY: 0, h: 5, color: '#3083ff', points: [[-5, -7], [5, -7], [5, 7], [-5, 7]], reserved: false, reservedBy: '' },
    { id: 2, islandId: 'i2', name: 'Stand C1', position: [5, 0, 0], rotationY: 0, h: 2, color: '#7147ff', points: [[-6, -4], [6, -4], [6, 4], [-6, 4]], reserved: false, reservedBy: '' },
  ]);

  // --- HISTORIAL (UNDO/REDO) ---
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const canUseTools = TOOL_ENABLED_ROLES.has(activeRole);
  const isCommercialRole = activeRole === 'comercial';
  const canEditObjectType = (type) => canUseTools && (!isCommercialRole || type === 'stand');
  const canCreateObjects = canUseTools && !isCommercialRole;
  const canEditFocusedObject = focusTarget ? canEditObjectType(focusTarget.type) : canUseTools;
  const hasEditableFocus = !focusTarget || canEditObjectType(focusTarget.type);
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

  useEffect(() => {
    if (!selectedStand) {
      setReservationName('');
      return;
    }
    setReservationName(selectedStand.reservedBy || '');
  }, [selectedStand]);

  useEffect(() => {
    setObjectNameDraft(selectedObject?.name ?? '');
  }, [selectedObject]);

  const saveHistory = () => {
    setHistory(prev => [...prev, { islands: deepClone(islands), stands: deepClone(stands), focusTarget }]);
    setRedoStack([]); // Al hacer una nueva acción, limpiamos el redo
  };

  const undo = () => {
    if (history.length === 0) return;
    const prevState = history[history.length - 1];
    setRedoStack(prev => [...prev, { islands: deepClone(islands), stands: deepClone(stands), focusTarget }]);

    setIslands(prevState.islands);
    setStands(prevState.stands);
    setFocusTarget(prevState.focusTarget);
    setHistory(prev => prev.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setHistory(prev => [...prev, { islands: deepClone(islands), stands: deepClone(stands), focusTarget }]);

    setIslands(nextState.islands);
    setStands(nextState.stands);
    setFocusTarget(nextState.focusTarget);
    setRedoStack(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    if (!canUseTools || !hasEditableFocus) {
      if (editMode !== 'move') setEditMode('move');
      if (moveToolMode !== 'translate') setMoveToolMode('translate');
    }
  }, [canUseTools, editMode, hasEditableFocus, moveToolMode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        redo();
      } else if (editMode === 'cut' && focusTarget) {
        if (e.key.toLowerCase() === 'v') { setCutAxis('x'); e.preventDefault(); }
        else if (e.key.toLowerCase() === 'h') { setCutAxis('z'); e.preventDefault(); }
        else if ((e.key === 'Enter' || e.key === ' ') && cutPreviewRef.current?.cutInfo) {
          const { id, type, cutInfo } = cutPreviewRef.current;
          handleSplit(id, type, cutInfo);
          e.preventDefault();
        }
      } else if (editMode === 'move' && focusTarget && canUseTools) {
        if (e.key.toLowerCase() === 'm') { setMoveToolMode('translate'); e.preventDefault(); }
        else if (e.key.toLowerCase() === 'r') { setMoveToolMode('rotate'); e.preventDefault(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, redoStack, islands, stands, focusTarget, editMode, canUseTools]);

  const handleUpdatePoints = (id, type, newPoints) => {
    if (!canEditObjectType(type)) return;
    // Para updates continuos (drag), guardamos el estado inicial solo al empezar
    // pero aquí se llama en cada frame de drag. 
    // Lo ideal es que saveHistory se llame al iniciar el drag o en acciones discretas.
    if (type === 'island') setIslands(prev => prev.map(isl => isl.id === id ? { ...isl, points: newPoints } : isl));
    else setStands(prev => prev.map(std => std.id === id ? { ...std, points: newPoints } : std));
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
      position: [col * 14 - 14, 0, row * 14 - 8],
      rotationY: 0,
      h: 0.2,
      color: '#1a1a1a',
      points: [[-6, -8], [6, -8], [6, 8], [-6, 8]],
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
        position: [targetIsland.position[0], 0, targetIsland.position[2]],
        rotationY: 0,
        h: 3,
        color: '#4f7cff',
        points: [[-4, -3], [4, -3], [4, 3], [-4, 3]],
        reserved: false,
        reservedBy: '',
      },
    ]);
    const newestStand = nextStands.find((stand) => stand.id === createdStandId);
    setStands(nextStands);
    if (newestStand) {
      setFocusTarget({ id: newestStand.id, type: 'stand', x: newestStand.position[0], y: newestStand.position[1], z: newestStand.position[2] });
    }
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
      position: [standToDuplicate.position[0] + offset, standToDuplicate.position[1], standToDuplicate.position[2] + offset],
    };
    setStands(prev => {
      const updated = [...prev, newStand];
      return renumberStands(updated);
    });
    setFocusTarget({ id: newStand.id, type: 'stand', x: newStand.position[0], y: newStand.position[1], z: newStand.position[2] });
    setDuplicatingItem({ type: 'stand', id: newStand.id, offset: [offset, 0, offset] });
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
      position: [standToDuplicate.position[0] + offset, standToDuplicate.position[1], standToDuplicate.position[2] + offset],
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
      position: [islandToDuplicate.position[0] + offset, islandToDuplicate.position[1], islandToDuplicate.position[2] + offset],
    };
    const standsInIsland = stands.filter(s => s.islandId === islandToDuplicate.id);
    const newStands = standsInIsland.map(stand => ({
      ...stand,
      id: createUniqueId('s'),
      islandId: newIslandId,
      name: `${stand.name} (copia)`,
      position: [stand.position[0] + offset, stand.position[1], stand.position[2] + offset],
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
    setIsTopViewReached(false);
  };

  const handleReserveSelectedStand = () => {
    if (!selectedStand || !canUseTools) return;
    const reserverName = reservationName.trim();
    if (!reserverName) return;
    saveHistory();
    setStands((prev) =>
      prev.map((stand) =>
        stand.id === selectedStand.id
          ? { ...stand, reserved: true, reservedBy: reserverName }
          : stand
      )
    );
  };

  const handleReleaseSelectedStand = () => {
    if (!selectedStand || !canUseTools) return;
    saveHistory();
    setStands((prev) =>
      prev.map((stand) =>
        stand.id === selectedStand.id
          ? { ...stand, reserved: false, reservedBy: '' }
          : stand
      )
    );
    setReservationName('');
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
    setVersionDraftName(`Session version ${projectVersions.length + 1}`);
    setVersionDraftLabel(`v${projectVersions.length + 1}.0`);
    setVersionDraftNotes('');
    setIsSaveVersionPanelOpen(true);
  };

  const handleRestoreVersion = (versionId) => {
    const version = projectVersions.find(v => v.id === versionId);
    if (!version) return;
    saveHistory();
    setIslands(deepClone(version.snapshot.islands));
    setStands(deepClone(version.snapshot.stands));
    setFocusTarget(version.snapshot.focusTarget ?? null);
    setIsTopViewReached(Boolean(version.snapshot.focusTarget));
  };

  const activeToolHelp = useMemo(() => {
    if (editMode === 'move') {
      return {
        title: 'Herramienta: Mover',
        subtitle: `Reposiciona o rota el objeto seleccionado (${moveToolMode === 'translate' ? 'trasladar' : 'rotar'}).`,
        accentClass: 'tool-move',
        bullets: [
          'Usa M para trasladar y R para rotar.',
          'Arrastra el gizmo para transformar el objeto completo.',
          'Movement snaps to 1m to maintain alignment.',
          'Si rotas o mueves una isla, sus stands asociados se actualizan contigo.',
        ],
        shortcut: 'M / R + arrastre',
      };
    }
    if (editMode === 'cut') {
      return {
        title: 'Herramienta: Cortar',
        subtitle: `Split polygon by ${cutAxis === 'x' ? 'vertical cut' : 'horizontal cut'} at the current position.`,
        accentClass: 'tool-cut',
        bullets: [
          'Move the mouse to position the cut line.',
          'Usa V para vertical y H para horizontal.',
          'Confirma con clic, Enter o barra espaciadora.',
        ],
        shortcut: 'V / H / Enter',
      };
    }
    if (editMode === 'merge') {
      return {
        title: 'Herramienta: Fusionar',
        subtitle: 'Merge two adjacent objects of the same type into one piece.',
        accentClass: 'tool-merge',
        bullets: [
          'Selecciona un primer objeto como base.',
          'Haz clic sobre un segundo objeto contiguo del mismo tipo.',
          'Se recalcula el contorno exterior y se mantiene el foco en el resultado.',
        ],
        shortcut: 'Selecciona base + objeto contiguo',
      };
    }
    return {
      title: 'Tool: Edit shape',
      subtitle: 'Modify polygon geometry with vertex and midpoint controls.',
      accentClass: 'tool-shape',
      bullets: [
        'Drag a vertex to adjust shape.',
        'Click a midpoint to insert a new vertex.',
        'Right-click or double-click a vertex to remove it.',
      ],
      shortcut: 'Drag + edit clicks',
    };
  }, [editMode, cutAxis, moveToolMode]);

  const handleUpdatePosition = (id, type, newPos) => {
    if (!canEditObjectType(type)) return;
    if (type === 'island') {
      const oldPos = islands.find(isl => isl.id === id).position;
      const dx = newPos[0] - oldPos[0];
      const dz = newPos[2] - oldPos[2];
      setIslands(prev => prev.map(isl => isl.id === id ? { ...isl, position: newPos } : isl));
      setStands(prev => prev.map(std => std.islandId === id ? { ...std, position: [std.position[0] + dx, std.position[1], std.position[2] + dz] } : std));
    } else {
      setStands(prev => prev.map(std => std.id === id ? { ...std, position: newPos } : std));
    }
    setFocusTarget(prev => ({ ...prev, x: newPos[0], z: newPos[2] }));
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
          return {
            ...std,
            position: [Math.round(nextX * 100) / 100, std.position[1], Math.round(nextZ * 100) / 100],
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
    saveHistory(); // Save antes de dividir
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
          orthographic={viewMode === 'plan'}
          onContextMenu={(e) => e.preventDefault()}
          onPointerMissed={() => {
            if (suppressClickRef.current) return;
            setFocusTarget(null);
            setIsTopViewReached(false);
            setDuplicatingItem(null);
            setDuplicatePreview(null);
          }}
        >
          {viewMode === 'plan' ? (
            <OrthographicCamera makeDefault position={[0, 50, 0]} zoom={5} near={0.1} far={500} />
          ) : (
            <PerspectiveCamera makeDefault position={[40, 40, 40]} fov={50} />
          )}
          <CameraController
            focusTarget={focusTarget}
            isTopView={isTopViewReached || viewMode === 'plan'}
            onTopViewReached={setIsTopViewReached}
            isDragging={isDragging}
            editMode={editMode}
            orbitRef={orbitRef}
            viewMode={viewMode}
          />

          <color attach="background" args={['#070707']} />
          <fog attach="fog" args={['#070707', 30, 150]} />
          <ambientLight intensity={0.4} />
          <spotLight position={[20, 40, 20]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <directionalLight position={[-10, 20, -10]} intensity={0.5} />
          <Environment preset="city" />
          <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={100} blur={2} far={4.5} />
          <Grid infiniteGrid fadeDistance={100} sectionSize={1} cellSize={1} sectionColor="#444" cellColor="#222" opacity={0.8} />

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
            />
          ))}
        </Canvas>

        {/* Botones de navegación flotantes en esquina superior derecha */}


        <div className="polygon-card ds-card object-list-panel">
          <div className="object-list-header">
            <h4>Objetos</h4>
            <label className="mvp-field">
              <span className="mvp-field-label">Rol</span>
              <select value={activeRole} onChange={(e) => setActiveRole(e.target.value)}>
                {MVP_ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </label>
            <input
              type="text"
              value={objectSearchTerm}
              onChange={(e) => setObjectSearchTerm(e.target.value)}
              placeholder="Search island or stand..."
              className="object-list-search"
            />
          </div>
          <div className="object-list-section">
            <div className="object-list-groups">
              {filteredIslands.map((island) => {
                const islandStands = stands.filter(s => s.islandId === island.id);
                return (
                  <div key={island.id} className="object-list-group">
                    <button
                      className={`object-list-item ${focusTarget?.type === 'island' && focusTarget.id === island.id ? 'is-active' : ''}`}
                      onClick={() => setFocusTarget({ id: island.id, type: 'island', x: island.position[0], y: island.position[1], z: island.position[2] })}
                      style={{ border: 'none', background: 'transparent', padding: '0 0 6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRadius: 0, marginBottom: '6px' }}
                    >
                      <strong style={{ fontSize: '13px', color: 'var(--ds-text-primary)' }}>{island.name}</strong>
                      <small>{islandStands.length} stands</small>
                    </button>
                    {islandStands.length > 0 && (
                      <div className="object-list-items" style={{ marginLeft: '4px', paddingLeft: '8px', borderLeft: '1px solid var(--ds-border-medium)' }}>
                        {islandStands.map((stand) => (
                          <button
                            key={stand.id}
                            className={`object-list-item ${stand.reserved ? 'is-reserved' : ''} ${focusTarget?.type === 'stand' && focusTarget.id === stand.id ? 'is-active' : ''}`}
                            onClick={() => handleFocusStand(stand)}
                          >
                            <span>{stand.name}</span>
                            <small>{stand.reserved ? (stand.reservedBy || 'Reservado') : 'Libre'}</small>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="object-list-toggles">

            <label><input type="checkbox" checked={layerVisibility.islands} onChange={() => setLayerVisibility(prev => ({ ...prev, islands: !prev.islands }))} /> Ver islas</label>
            <label className="mvp-field"><input type="checkbox" checked={layerVisibility.stands} onChange={() => setLayerVisibility(prev => ({ ...prev, stands: !prev.stands }))} /> Ver stands</label>

          </div>
        </div>

        {isSaveVersionPanelOpen && (
          <div className="mvp-save-version-overlay" onClick={() => setIsSaveVersionPanelOpen(false)}>
            <div className="polygon-card ds-card mvp-save-version-panel" onClick={(e) => e.stopPropagation()}>
              <h4>Save final version</h4>
              <p className="mvp-save-version-subtitle">
                This version will be marked as final in the current session.
              </p>

              <label className="mvp-field">
                <span className="mvp-field-label">Version name</span>
                <input
                  type="text"
                  value={versionDraftName}
                  onChange={(e) => setVersionDraftName(e.target.value)}
                  placeholder="Ej: Cierre comercial día 1"
                />
              </label>

              <label className="mvp-field">
                <span className="mvp-field-label">Version label</span>
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
                <strong>Session summary</strong>
                <span>Active role: {activeRole}</span>
                <span>Islas: {islands.length}</span>
                <span>Stands: {stands.length}</span>
                <span>Reservados: {reservedStandsCount}</span>
                <span>Current selection: {focusTarget ? `${focusTarget.type} ${focusTarget.id}` : 'None'}</span>
              </div>

              <div className="mvp-save-version-actions">
                <button className="ds-btn ds-btn-outline" onClick={() => setIsSaveVersionPanelOpen(false)}>
                  Cancel
                </button>
                <button
                  className="ds-btn ds-btn-secondary"
                  onClick={handleSaveVersion}
                  disabled={!versionDraftName.trim() || !versionDraftLabel.trim()}
                >
                  Save final
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toolbar Inferior */}
        {(isTopViewReached || viewMode === 'plan') && canEditFocusedObject && (
          <>
            <div className="polygon-toolbar-viewmode">
              <button
                className={`viewmode-btn ${viewMode === '3D' ? 'active' : ''}`}
                onClick={() => setViewMode('3D')}
                title="Vista 3D"
              >
                <span className="viewmode-icon">3D</span>
              </button>
              <button
                className={`viewmode-btn ${viewMode === 'plan' ? 'active' : ''}`}
                onClick={() => setViewMode('plan')}
                title="Vista de Planta"
              >
                <PlanIcon />
              </button>
            </div>
            {viewMode === 'plan' ? (
              <div className="polygon-toolbar plan-mode-toolbar">
                <button
                  className="toolbar-btn toolbar-btn-action"
                  onClick={handleCreateStand}
                  disabled={!canCreateObjects || !selectedIsland}
                  title="Add stand to active island"
                >
                  +S
                  <span className="toolbar-tooltip">Add stand</span>
                </button>
                <button
                  className="toolbar-btn toolbar-btn-action"
                  onClick={handleDuplicateStand}
                  disabled={!focusTarget || focusTarget.type !== 'stand'}
                  title="Duplicar Stand"
                >
                  <DuplicateIcon />
                  <span className="toolbar-tooltip">Duplicar Stand</span>
                </button>
                <button
                  className="toolbar-btn toolbar-btn-action"
                  onClick={handleDuplicateGroup}
                  disabled={!focusTarget || focusTarget.type !== 'stand'}
                  title="Duplicar Grupo de Stands"
                >
                  <GroupIcon />
                  <span className="toolbar-tooltip">Duplicar Grupo</span>
                </button>
                <button
                  className="toolbar-btn toolbar-btn-action"
                  onClick={handleDuplicateIsland}
                  disabled={!focusTarget || focusTarget.type !== 'island'}
                  title="Duplicar Isla"
                >
                  +I
                  <span className="toolbar-tooltip">Duplicar Isla</span>
                </button>
                <div className="toolbar-divider" />
                <button
                  className="toolbar-btn toolbar-btn-action"
                  onClick={handleDeleteSelection}
                  disabled={!focusTarget || !canEditObjectType(focusTarget.type)}
                  title="Delete selection"
                >
                  Del
                  <span className="toolbar-tooltip">Delete</span>
                </button>
              </div>
            ) : (
              <div className="polygon-toolbar">
                <button
                  className="toolbar-btn toolbar-btn-action"
                  onClick={handleDeleteSelection}
                  disabled={!focusTarget || !canEditObjectType(focusTarget.type)}
                  title="Delete selection"
                >
                  Del
                  <span className="toolbar-tooltip">Delete</span>
                </button>
              </div>
            )}
            <div className="polygon-toolbar-help">
              <div className={`toolbar-help-card ${activeToolHelp.accentClass}`}>
                <div className="toolbar-help-header">
                  <strong>{activeToolHelp.title}</strong>
                  <span className="toolbar-help-shortcut">{activeToolHelp.shortcut}</span>
                </div>
                <p className="toolbar-help-subtitle">{activeToolHelp.subtitle}</p>
                <ul className="toolbar-help-list">
                  {activeToolHelp.bullets.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
            {(editMode === 'move' || editMode === 'cut') && (
              <div className="polygon-toolbar-context-controls">
                {editMode === 'move' ? (
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
                ) : (
                  <div className="cut-axis-selector">
                    <button
                      className={`cut-axis-btn ${cutAxis === 'x' ? 'active' : ''}`}
                      onClick={() => setCutAxis('x')}
                      title="Corte vertical (V)"
                    >

                      <span>Vertical</span>
                      <kbd className="cut-axis-kbd">V</kbd>
                    </button>
                    <button
                      className={`cut-axis-btn ${cutAxis === 'z' ? 'active' : ''}`}
                      onClick={() => setCutAxis('z')}
                      title="Corte horizontal (H)"
                    >

                      <span>Horizontal</span>
                      <kbd className="cut-axis-kbd">H</kbd>
                    </button>
                  </div>
                )}
              </div>
            )}
            <div className="polygon-toolbar">
              <button
                className={`toolbar-btn ${editMode === 'move' ? 'active' : ''}`}
                onClick={() => setEditMode('move')}
              >
                <MoveIcon />
                <span className="toolbar-tooltip">Mover</span>
              </button>
              <button
                className={`toolbar-btn ${editMode === 'cut' ? 'active' : ''}`}
                onClick={() => setEditMode('cut')}
              >
                <CutIcon />
                <span className="toolbar-tooltip">Cortar</span>
              </button>
              <button
                className={`toolbar-btn ${editMode === 'merge' ? 'active' : ''}`}
                onClick={() => setEditMode('merge')}
              >
                <MergeIcon />
                <span className="toolbar-tooltip">Fusionar</span>
              </button>
              <button
                className={`toolbar-btn ${editMode === 'shape' ? 'active' : ''}`}
                onClick={() => setEditMode('shape')}
              >
                <ShapeIcon />
                <span className="toolbar-tooltip">Edit shape</span>
              </button>
              <div className="toolbar-divider" />
              <button
                className="toolbar-btn toolbar-btn-action"
                onClick={handleCreateIsland}
                disabled={!canCreateObjects}
                title="Add island"
              >
                +I
                <span className="toolbar-tooltip">Add island</span>
              </button>
              <button
                className="toolbar-btn toolbar-btn-action"
                onClick={handleCreateStand}
                disabled={!canCreateObjects}
                title="Add stand"
              >
                +S
                <span className="toolbar-tooltip">Add stand</span>
              </button>
              <button
                className="toolbar-btn toolbar-btn-action"
                onClick={handleDeleteSelection}
                disabled={!focusTarget || !canEditObjectType(focusTarget.type)}
                title="Delete selection"
              >
Del
                  <span className="toolbar-tooltip">Delete</span>
                </button>
              </div>
            </>
          )}

        <div className="polygon-card ds-card object-properties-panel">
          <h4>Propiedades</h4>
          {selectedObject ? (
            <div className="object-properties-content">
              <div className="object-property-row"><span>Tipo</span><strong>{focusTarget?.type === 'island' ? 'Isla' : 'Stand'}</strong></div>
              <div className="object-property-row"><span>ID</span><strong>{String(selectedObject.id)}</strong></div>
              <div className="object-property-row object-property-row-name">
                <span>Nombre</span>
                <div className="object-name-editor">
                  <input
                    type="text"
                    value={objectNameDraft}
                    onChange={(e) => setObjectNameDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleRenameSelectedObject();
                      }
                    }}
                    disabled={!canEditObjectType(focusTarget.type)}
                  />
                  <button
                    className="ds-btn ds-btn-outline"
                    onClick={handleRenameSelectedObject}
                    disabled={!canEditObjectType(focusTarget.type) || !objectNameDraft.trim() || objectNameDraft.trim() === selectedObject.name}
                  >
                    Save
                  </button>
                </div>
              </div>
              <div className="object-property-row"><span>Position X</span><strong>{selectedObject.position[0].toFixed(2)} m</strong></div>
              <div className="object-property-row"><span>Position Z</span><strong>{selectedObject.position[2].toFixed(2)} m</strong></div>
              <div className="object-property-row"><span>Rotation Y</span><strong>{(((selectedObject.rotationY ?? 0) * 180) / Math.PI).toFixed(1)}°</strong></div>
              {selectedObjectMetrics && (
                <>
                  <div className="object-property-row"><span>Area</span><strong>{selectedObjectMetrics.area.toFixed(2)} m²</strong></div>
                  <div className="object-property-row"><span>Ancho</span><strong>{selectedObjectMetrics.width.toFixed(2)} m</strong></div>
                  <div className="object-property-row"><span>Fondo</span><strong>{selectedObjectMetrics.depth.toFixed(2)} m</strong></div>
                  <div className="object-property-row"><span>Perimeter</span><strong>{selectedObjectMetrics.perimeter.toFixed(2)} m</strong></div>
                </>
              )}
              {focusTarget?.type === 'stand' && (
                <div className="object-reservation-block">
                  <span className={`mvp-reservation-chip ${selectedObject.reserved ? 'is-reserved' : 'is-free'}`}>
                    {selectedObject.reserved ? 'Reservado' : 'Disponible'}
                  </span>
                  <input
                    type="text"
                    value={reservationName}
                    onChange={(e) => setReservationName(e.target.value)}
                    placeholder="Reservation name"
                    disabled={!canUseTools}
                  />
                  <div className="object-reservation-actions">
                    <button
                      className="ds-btn ds-btn-outline"
                      onClick={handleReserveSelectedStand}
                      disabled={!canUseTools || !reservationName.trim()}
                    >
                      Reservar
                    </button>
                    <button
                      className="ds-btn ds-btn-outline"
                      onClick={handleReleaseSelectedStand}
                      disabled={!canUseTools || !selectedObject.reserved}
                    >
                      Liberar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="object-properties-empty">Selecciona una isla o un stand para ver sus propiedades.</p>
          )}
        </div>
      </div>
    </div>
  );
}
