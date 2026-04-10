// @ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { IFCLoader } from 'web-ifc-three/IFCLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';

interface RevitModelProps {
  file: File;
  orbitRef?: React.RefObject<any>;
  unitMode?: RevitUnitMode;
  manualScale?: number;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (msg: string) => void;
}

export type RevitUnitMode = 'auto' | 'm' | 'cm' | 'mm' | 'ft';

type DetectedUnitMode = RevitUnitMode | 'unknown';

const IFC_PREFIX_TO_SCALE: Record<string, number> = {
  EXA: 1e18,
  PETA: 1e15,
  TERA: 1e12,
  GIGA: 1e9,
  MEGA: 1e6,
  KILO: 1e3,
  HECTO: 1e2,
  DECA: 1e1,
  DECI: 1e-1,
  CENTI: 1e-2,
  MILLI: 1e-3,
  MICRO: 1e-6,
  NANO: 1e-9,
};

const roundTo = (value: number, decimals = 3) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const roundToGrid = (value: number, grid = 0.5) => {
  if (!Number.isFinite(value) || value <= 0) return value;
  return Math.max(grid, Math.round(value / grid) * grid);
};

// Snap to 0.5m grid
const snap = (v: number) => Math.round(v * 2) / 2;

const getUnitScaleForMode = (mode: RevitUnitMode) => {
  switch (mode) {
    case 'mm':
      return 0.001;
    case 'cm':
      return 0.01;
    case 'ft':
      return 0.3048;
    case 'm':
    case 'auto':
    default:
      return 1;
  }
};

const guessIfcScaleFromText = async (file: File): Promise<{ unit: DetectedUnitMode; scale: number } | null> => {
  try {
    const text = await file.text();
    const upper = text.toUpperCase();

    const siMatches = upper.match(/IFCSIUNIT\([^;]*\.LENGTHUNIT\.[^;]*\)/g);
    if (siMatches?.length) {
      for (const entry of siMatches) {
        if (!entry.includes('.METRE.')) continue;
        const prefixMatch = entry.match(/\.(EXA|PETA|TERA|GIGA|MEGA|KILO|HECTO|DECA|DECI|CENTI|MILLI|MICRO|NANO)\./);
        if (prefixMatch?.[1]) {
          const prefix = prefixMatch[1];
          const scale = IFC_PREFIX_TO_SCALE[prefix];
          if (!scale) continue;
          if (prefix === 'MILLI') return { unit: 'mm', scale };
          if (prefix === 'CENTI') return { unit: 'cm', scale };
          return { unit: 'm', scale };
        }
        return { unit: 'm', scale: 1 };
      }
    }

    if (upper.includes("'FOOT'") || upper.includes('.FOOT.')) {
      return { unit: 'ft', scale: 0.3048 };
    }

    if (upper.includes("'INCH'") || upper.includes('.INCH.')) {
      return { unit: 'unknown', scale: 0.0254 };
    }

    return null;
  } catch {
    return null;
  }
};

export function RevitModel({
  file,
  orbitRef,
  unitMode = 'auto',
  manualScale = 1,
  onLoadStart,
  onLoadEnd,
  onError,
}: RevitModelProps) {
  const { scene, camera } = useThree();
  const modelRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const url = URL.createObjectURL(file);
    onLoadStart?.();

    const cleanup = () => URL.revokeObjectURL(url);

    const ifcScalePromise = ext === 'ifc' ? guessIfcScaleFromText(file) : Promise.resolve(null);

    const applyToScene = async (object: THREE.Object3D) => {
      // --- Compute raw bounding box before any repositioning ---
      object.position.set(0, 0, 0);
      object.rotation.set(0, 0, 0);
      object.scale.set(1, 1, 1);
      object.updateMatrixWorld(true);

      const rawBox = new THREE.Box3().setFromObject(object);
      const rawSize = rawBox.getSize(new THREE.Vector3());
      const maxRawDim = Math.max(rawSize.x, rawSize.y, rawSize.z);

      // --- Auto-detect unit scale ---
      // IFC exported in mm (common from Revit) → values in tens of thousands
      // IFC in meters → values in tens to hundreds
      // GLTF/OBJ may vary
      let autoDetectedScale = 1;
      if (maxRawDim > 5000) {
        autoDetectedScale = 0.001; // millimetres → metres
      } else if (maxRawDim > 500) {
        autoDetectedScale = 0.01;  // centimetres → metres
      }

      const ifcDetected = unitMode === 'auto' ? await ifcScalePromise : null;

      let baseUnitScale = autoDetectedScale;
      let baseUnitMode: RevitUnitMode = 'auto';
      let source: 'ifc-metadata' | 'bbox-heuristic' | 'manual' = 'bbox-heuristic';
      let detectedUnit: DetectedUnitMode = 'unknown';

      if (unitMode === 'auto') {
        if (ifcDetected?.scale) {
          baseUnitScale = ifcDetected.scale;
          detectedUnit = ifcDetected.unit;
          baseUnitMode = ifcDetected.unit === 'unknown' ? 'auto' : ifcDetected.unit;
          source = 'ifc-metadata';
        }
      } else {
        baseUnitScale = getUnitScaleForMode(unitMode);
        baseUnitMode = unitMode;
        source = 'manual';
      }

      const sanitizedManualScale = Number.isFinite(manualScale) && manualScale > 0 ? manualScale : 1;
      const baseFinalScale = baseUnitScale * sanitizedManualScale;

      if (baseFinalScale !== 1) {
        object.scale.setScalar(baseFinalScale);
        object.updateMatrixWorld(true);
      }

      // Ajuste isotropico para que las dimensiones en planta encajen en celdas de 0.5 m.
      let gridFitScale = 1;
      if (ext === 'ifc') {
        const preGridFitBox = new THREE.Box3().setFromObject(object);
        const preGridFitSize = preGridFitBox.getSize(new THREE.Vector3());
        const targetX = roundToGrid(preGridFitSize.x, 0.5);
        const targetZ = roundToGrid(preGridFitSize.z, 0.5);
        const ratioX = preGridFitSize.x > 0 ? targetX / preGridFitSize.x : 1;
        const ratioZ = preGridFitSize.z > 0 ? targetZ / preGridFitSize.z : 1;
        const averagedRatio = (ratioX + ratioZ) / 2;
        if (Number.isFinite(averagedRatio) && averagedRatio > 0) {
          gridFitScale = averagedRatio;
        }
      }

      if (gridFitScale !== 1) {
        object.scale.multiplyScalar(gridFitScale);
        object.updateMatrixWorld(true);
      }

      const finalScale = baseFinalScale * gridFitScale;

      // --- Recompute after scale ---
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());

      // Snap horizontal center to 0.5m grid, sit on ground
      const snapX = snap(-center.x);
      const snapZ = snap(-center.z);
      const groundY = -box.min.y;

      object.position.set(snapX, groundY, snapZ);
      object.updateMatrixWorld(true);

      // --- Final bounds (after positioning) ---
      const finalBox = new THREE.Box3().setFromObject(object);
      const finalSize = finalBox.getSize(new THREE.Vector3());
      const finalCenter = finalBox.getCenter(new THREE.Vector3());
      const maxDim = Math.max(finalSize.x, finalSize.z);

      // --- Frame camera so the whole model is visible ---
      const distance = maxDim * 1.2;
      camera.position.set(
        finalCenter.x + distance * 0.6,
        distance * 0.6,
        finalCenter.z + distance * 0.6,
      );
      camera.near = Math.max(0.05, maxDim * 0.0001);
      camera.far = maxDim * 20;
      camera.updateProjectionMatrix();

      if (orbitRef?.current) {
        orbitRef.current.target.set(finalCenter.x, 0, finalCenter.z);
        orbitRef.current.minDistance = Math.max(0.1, maxDim * 0.002);
        orbitRef.current.maxDistance = maxDim * 15;
        orbitRef.current.update();
      }

      // --- Replace previous model ---
      if (modelRef.current) {
        scene.remove(modelRef.current);
        disposeObject(modelRef.current);
      }
      modelRef.current = object;
      scene.add(object);
      onLoadEnd?.();
      cleanup();
    };

    if (ext === 'ifc') {
      const loader = new IFCLoader();
      loader.ifcManager.setWasmPath('/');
      loader.load(url, applyToScene, undefined, (err) => {
        console.error('IFC load error:', err);
        onError?.('No se pudo cargar el archivo IFC. Asegúrate de que sea un archivo IFC válido.');
        onLoadEnd?.();
        cleanup();
      });
    } else if (ext === 'gltf' || ext === 'glb') {
      const loader = new GLTFLoader();
      loader.load(url, (gltf) => applyToScene(gltf.scene), undefined, (err) => {
        console.error('GLTF load error:', err);
        onError?.('No se pudo cargar el archivo GLTF/GLB.');
        onLoadEnd?.();
        cleanup();
      });
    } else if (ext === 'obj') {
      const loader = new OBJLoader();
      loader.load(url, applyToScene, undefined, (err) => {
        console.error('OBJ load error:', err);
        onError?.('No se pudo cargar el archivo OBJ.');
        onLoadEnd?.();
        cleanup();
      });
    } else {
      onError?.(`Formato "${ext}" no soportado. Usa IFC, GLTF, GLB u OBJ.`);
      onLoadEnd?.();
      cleanup();
    }

    return () => {
      if (modelRef.current) {
        scene.remove(modelRef.current);
        disposeObject(modelRef.current);
        modelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, manualScale, unitMode]);

  return null;
}

function disposeObject(obj: THREE.Object3D) {
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.geometry?.dispose();
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => m?.dispose());
    }
  });
}

// ---------------------------------------------------------------------------

interface RevitUploadPanelProps {
  revitFile: File | null;
  isLoading: boolean;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export function RevitUploadPanel({ revitFile, isLoading, onFileSelect, onClear }: RevitUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const supported = ['ifc', 'gltf', 'glb', 'obj'];
    if (!supported.includes(ext ?? '')) {
      alert(`Formato no soportado. Usa: ${supported.join(', ').toUpperCase()}`);
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  if (revitFile) {
    return (
      <div className="revit-panel revit-panel--loaded">
        <div className="revit-panel__icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <span className="revit-panel__filename" title={revitFile.name}>
          {revitFile.name}
        </span>
        {isLoading && <span className="revit-panel__loading">Cargando…</span>}
        <button
          className="revit-panel__clear"
          onClick={onClear}
          title="Eliminar modelo Revit"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`revit-panel revit-panel--upload ${isDragging ? 'revit-panel--drag' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      title="Cargar archivo de Revit (IFC, GLTF, GLB, OBJ)"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <span>Cargar Revit</span>
      <input
        ref={inputRef}
        type="file"
        accept=".ifc,.gltf,.glb,.obj"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}

