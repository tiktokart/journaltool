import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Point } from '@/types/embedding';
import { gsap } from 'gsap';
import { useLanguage } from '@/contexts/LanguageContext';

export interface EmbeddingSceneProps {
  points: Point[];
  selectedPoint: Point | null;
  connectedPoints: Point[];
  onPointClick: (point: Point) => void;
  isRotating: boolean;
  isInteractive: boolean;
  focusOnWord: string | null;
  depressedJournalReference?: boolean;
  visibleClusterCount?: number;
  onCameraMove?: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
  cameraRef: React.RefObject<THREE.PerspectiveCamera>;
  visualizationSettings: {
    pointSize: number;
    lineWidth: number;
    connectionOpacity: number;
  };
  bertData?: any; // Add bertData as an optional prop
}

const EmbeddingScene: React.FC<EmbeddingSceneProps> = ({
  points,
  selectedPoint,
  connectedPoints,
  onPointClick,
  isRotating,
  isInteractive,
  focusOnWord,
  depressedJournalReference,
  visibleClusterCount = 10,
  onCameraMove,
  containerRef,
  cameraRef,
  visualizationSettings,
  bertData
}) => {
  const { gl, scene, camera } = useThree();
  const orbitControlsRef = useRef<OrbitControls>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const [cameraPosition, setCameraPosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 20));
  const { t } = useLanguage();

  useEffect(() => {
    if (cameraRef) {
      cameraRef.current = camera as THREE.PerspectiveCamera;
    }
  }, [camera, cameraRef]);

  useEffect(() => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = isInteractive;
    }
  }, [isInteractive]);

  useEffect(() => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.addEventListener('change', () => {
        setCameraPosition(camera.position.clone());
        if (onCameraMove) {
          onCameraMove();
        }
      });
    }
  }, [camera, onCameraMove]);

  useEffect(() => {
    if (!pointsRef.current || !points) return;

    const geometry = new THREE.BufferGeometry();
    const positions = points.map(p => p.position).flat();
    const colors = points.map(p => p.color).flat();

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    pointsRef.current.geometry = geometry;
    pointsRef.current.material.size = visualizationSettings.pointSize;
  }, [points, visualizationSettings.pointSize]);

  useEffect(() => {
    if (!linesRef.current || !points) return;

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: visualizationSettings.lineWidth,
      transparent: true,
      opacity: visualizationSettings.connectionOpacity,
    });

    const lineGeometry = new THREE.BufferGeometry();
    const linePositions: number[] = [];

    connectedPoints.forEach(connectedPoint => {
      if (selectedPoint) {
        linePositions.push(...selectedPoint.position, ...connectedPoint.position);
      }
    });

    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    linesRef.current.geometry = lineGeometry;
    linesRef.current.material = lineMaterial;
  }, [selectedPoint, connectedPoints, visualizationSettings.lineWidth, visualizationSettings.connectionOpacity, points]);

  useEffect(() => {
    if (focusOnWord && pointsRef.current && points) {
      const selected = points.find(point => point.word === focusOnWord);
      if (selected) {
        const targetPosition = new THREE.Vector3(...selected.position);
        const animationDuration = 1.5;

        gsap.to(camera.position, {
          x: targetPosition.x,
          y: targetPosition.y,
          z: targetPosition.z + 10,
          duration: animationDuration,
          ease: "power3.inOut",
          onUpdate: () => {
            camera.lookAt(targetPosition);
            orbitControlsRef.current?.update();
          }
        });
      }
    }
  }, [focusOnWord, camera, points]);

  useFrame(() => {
    if (isRotating && orbitControlsRef.current) {
      orbitControlsRef.current.enabled = false;
      const rotationSpeed = 0.002;
      camera.position.x = Math.cos(performance.now() * rotationSpeed) * 20;
      camera.position.z = Math.sin(performance.now() * rotationSpeed) * 20;
      camera.lookAt(scene.position);
    } else if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = isInteractive;
    }

    gl.render(scene, camera);
  });

  const handlePointClickWrapper = (event: THREE.Event) => {
    if (!isInteractive) return;
    const pointIndex = event.index;
    if (pointIndex !== undefined && points && points[pointIndex]) {
      onPointClick(points[pointIndex]);
    }
  };

  return (
    <>
      <PerspectiveCamera makeDefault position={cameraPosition} fov={45} near={0.1} far={1000} ref={cameraRef} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls ref={orbitControlsRef} args={[camera, gl.domElement]} enableDamping dampingFactor={0.1} />
      <Points
        ref={pointsRef}
        positions={points.map(p => p.position).flat()}
        colors={points.map(p => p.color).flat()}
        size={visualizationSettings.pointSize}
        onClick={handlePointClickWrapper}
      />
      <LineSegments ref={linesRef} positions={[]} />
    </>
  );
};

interface PointsProps {
  positions: number[];
  colors: number[];
  size: number;
  onClick: (event: THREE.Event) => void;
}

const Points = React.forwardRef<THREE.Points, PointsProps>(({ positions, colors, size, onClick }, ref) => {
  const { gl } = useThree();
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  useEffect(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometryRef.current = geometry;

    const material = new THREE.PointsMaterial({
      size: size,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      sizeAttenuation: true
    });
    materialRef.current = material;
  }, [colors, positions, size]);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.needsUpdate = true;
    }
  });

  const handleIntersection = (event: THREE.Event) => {
    onClick(event);
  };

  return (
    <points
      ref={ref}
      geometry={geometryRef.current}
      material={materialRef.current}
      onClick={handleIntersection}
    />
  );
});

Points.displayName = 'Points';

interface LineSegmentsProps {
  positions: number[];
}

const LineSegments = React.forwardRef<THREE.LineSegments, LineSegmentsProps>(({ positions }, ref) => {
  const { gl } = useThree();
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  useEffect(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometryRef.current = geometry;
  }, [positions]);

  return (
    <lineSegments ref={ref} geometry={geometryRef.current}>
      <lineBasicMaterial color={0xffffff} linewidth={2} />
    </lineSegments>
  );
});

LineSegments.displayName = 'LineSegments';

export default EmbeddingScene;
