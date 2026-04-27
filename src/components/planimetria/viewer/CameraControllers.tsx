import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface CameraControllerProps {
  focusTarget: any;
  isTopView: boolean;
  onTopViewReached: (value: boolean) => void;
  isDragging: boolean;
  editMode: string;
  isCameraLocked: boolean;
  orbitRef: any;
  isPlanView: boolean;
  bounds: any;
}

export function CameraController({
  focusTarget,
  isTopView,
  onTopViewReached,
  isDragging,
  editMode,
  isCameraLocked,
  orbitRef,
  isPlanView,
  bounds,
}: CameraControllerProps) {
  const { camera } = useThree();
  const [reached, setReached] = useState(false);
  const consumedFocusKeyRef = useRef<string | null>(null);

  useFrame(() => {
    if (isDragging || editMode === 'merge' || isCameraLocked) return;

    if (focusTarget && orbitRef.current) {
      const focusKey = `${focusTarget.type ?? 'obj'}-${focusTarget.id ?? 'none'}-${focusTarget.x ?? 0}-${focusTarget.y ?? 0}-${focusTarget.z ?? 0}-${focusTarget.requestId ?? 'static'}`;
      if (consumedFocusKeyRef.current === focusKey) {
        return;
      }

      const targetPos = new THREE.Vector3(focusTarget.x, focusTarget.y ?? 0, focusTarget.z);
      const camPos = isPlanView
        ? new THREE.Vector3(focusTarget.x, camera.position.y, focusTarget.z)
        : new THREE.Vector3(focusTarget.x + 18, (focusTarget.y ?? 0) + 20, focusTarget.z + 18);
      orbitRef.current.target.lerp(targetPos, 0.1);
      camera.position.lerp(camPos, 0.1);
      const distanceToGoal = isPlanView
        ? Math.hypot(camera.position.x - camPos.x, camera.position.z - camPos.z)
        : camera.position.distanceTo(camPos);
      if (distanceToGoal < 0.1 && !reached) {
        setReached(true);
        consumedFocusKeyRef.current = focusKey;
        if (onTopViewReached) onTopViewReached(true);
      }
      orbitRef.current.update();
    } else if (reached) {
      setReached(false);
      consumedFocusKeyRef.current = null;
      if (onTopViewReached) onTopViewReached(false);
    }
  });

  const isOrbitEnabled = editMode !== 'merge' && !isDragging && !isCameraLocked;

  return (
    <OrbitControls
      ref={orbitRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      enabled={isOrbitEnabled}
      enableRotate={!isPlanView}
      enablePan
      enableZoom
      zoomSpeed={1.2}
      minDistance={0.1}
      maxDistance={5000}
    />
  );
}

interface PlanViewControllerProps {
  isActive: boolean;
  bounds: any;
  orbitRef: any;
}

export function PlanViewController({ isActive, bounds, orbitRef }: PlanViewControllerProps) {
  const { camera } = useThree();
  const hasEnteredRef = useRef(false);

  useFrame(() => {
    if (!isActive || !bounds) return;

    if (!hasEnteredRef.current) {
      hasEnteredRef.current = true;

      const centerX = bounds.centerX;
      const centerZ = bounds.centerZ;

      const distance = Math.max(bounds.width, bounds.height) * 1.2;

      camera.position.set(centerX, distance, centerZ);
      camera.lookAt(centerX, 0, centerZ);

      if (orbitRef?.current) {
        orbitRef.current.target.set(centerX, 0, centerZ);
        orbitRef.current.update();
      }
    }
  });

  useEffect(() => {
    if (!isActive) {
      hasEnteredRef.current = false;
    }
  }, [isActive]);

  return null;
}
