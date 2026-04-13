// @ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import * as THREE from 'three';

interface Model3DProps {
  file: File;
  orbitRef?: React.RefObject<any>;
  unitMode?: ModelUnitMode;
  manualScale?: number;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (msg: string) => void;
}

export type ModelUnitMode = 'auto' | 'm' | 'cm' | 'mm' | 'ft';
export type RevitUnitMode = ModelUnitMode;

// Snap to 0.5m grid
const snap = (v: number) => Math.round(v * 2) / 2;

const getUnitScaleForMode = (mode: ModelUnitMode) => {
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

export function Model3D({
  file,
  orbitRef,
  unitMode = 'auto',
  manualScale = 1,
  onLoadStart,
  onLoadEnd,
  onError,
}: Model3DProps) {
  const { scene, camera } = useThree();
  const modelRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const url = URL.createObjectURL(file);
    onLoadStart?.();

    const cleanup = () => URL.revokeObjectURL(url);

    const applyToScene = (object: THREE.Object3D) => {
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

      let baseUnitScale = autoDetectedScale;

      if (unitMode === 'auto') {
        baseUnitScale = autoDetectedScale;
      } else {
        baseUnitScale = getUnitScaleForMode(unitMode);
      }

      const sanitizedManualScale = Number.isFinite(manualScale) && manualScale > 0 ? manualScale : 1;
      const baseFinalScale = baseUnitScale * sanitizedManualScale;

      if (baseFinalScale !== 1) {
        object.scale.setScalar(baseFinalScale);
        object.updateMatrixWorld(true);
      }

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

    if (ext === 'gltf' || ext === 'glb') {
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
      onError?.(`Formato "${ext}" no soportado. Usa GLTF, GLB u OBJ.`);
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

interface ModelUploadPanelProps {
  modelFile: File | null;
  isLoading: boolean;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export function ModelUploadPanel({ modelFile, isLoading, onFileSelect, onClear }: ModelUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const supported = ['gltf', 'glb', 'obj'];
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

  if (modelFile) {
    return (
      <div className="revit-panel revit-panel--loaded">
        <div className="revit-panel__icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <span className="revit-panel__filename" title={modelFile.name}>
          {modelFile.name}
        </span>
        {isLoading && <span className="revit-panel__loading">Cargando…</span>}
        <button
          className="revit-panel__clear"
          onClick={onClear}
          title="Eliminar modelo 3D"
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
      title="Cargar modelo 3D (GLTF, GLB, OBJ)"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <span>Cargar modelo</span>
      <input
        ref={inputRef}
        type="file"
        accept=".gltf,.glb,.obj"
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

export const RevitModel = Model3D;
export function RevitUploadPanel(props: {
  revitFile: File | null;
  isLoading: boolean;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}) {
  return <ModelUploadPanel modelFile={props.revitFile} isLoading={props.isLoading} onFileSelect={props.onFileSelect} onClear={props.onClear} />;
}

