import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { gsap } from 'gsap';
import { useLanguage } from '@/contexts/LanguageContext';

// Define the interface for the component props
interface EmbeddingSceneProps {
  points: any[];
  selectedPoint: any | null;
  connectedPoints: any[];
  onPointClick: (point: any | null) => void;
  isRotating?: boolean;
  isInteractive?: boolean;
  focusOnWord?: string | null;
  onPointHover?: (point: any | null) => void;
  depressedJournalReference?: boolean;
  onFocusEmotionalGroup?: (tone: string) => void;
  selectedEmotionalGroup?: string | null;
  onResetView?: () => void;
  visibleClusterCount?: number;
  showAllPoints?: boolean;
  onCameraMove?: () => void;
  containerRef?: React.RefObject<HTMLDivElement>;
  cameraRef?: React.RefObject<THREE.PerspectiveCamera>;
  controlsRef?: React.RefObject<OrbitControls>;
  visualizationSettings?: any;
  bertAnalysis?: any;
}

const EmbeddingScene = ({
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
  controlsRef,
  visualizationSettings = { pointSize: 5, lineWidth: 2, connectionOpacity: 0.5 },
  bertAnalysis
}: EmbeddingSceneProps) => {
  const { gl, scene, camera } = useThree();
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const linesRef = useRef<THREE.LineSegments | null>(null);
  const [cameraPosition, setCameraPosition] = useState(new THREE.Vector3(0, 0, 20));
  const { t } = useLanguage();

  useEffect(() => {
    if (cameraRef && cameraRef.current) {
      // Instead of direct assignment, we store the reference
      // We'll set up the camera position elsewhere
      setCameraPosition(camera.position.clone());
    }
  }, [camera, cameraRef]);

  useEffect(() => {
    if (controlsRef && orbitControlsRef.current) {
      controlsRef.current = orbitControlsRef.current;
    }
  }, [controlsRef]);

  useEffect(() => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = isInteractive !== false;
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
    if (!points || points.length === 0) return;
    
    // Instead of modifying the ref directly, we'll create a new geometry and points
    const geometry = new THREE.BufferGeometry();
    const positions = points.map((p) => p.position).flat();
    const colors = points.map((p) => p.color).flat();
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    if (pointsRef.current) {
      pointsRef.current.geometry.dispose();
      pointsRef.current.geometry = geometry;
      if (pointsRef.current.material instanceof THREE.PointsMaterial) {
        pointsRef.current.material.size = visualizationSettings.pointSize;
      }
    }
  }, [points, visualizationSettings.pointSize]);

  useEffect(() => {
    if (!points || points.length === 0) return;
    
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: visualizationSettings.lineWidth,
      transparent: true,
      opacity: visualizationSettings.connectionOpacity
    });
    
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions: number[] = [];
    
    connectedPoints.forEach((connectedPoint) => {
      if (selectedPoint) {
        linePositions.push(...selectedPoint.position, ...connectedPoint.position);
      }
    });
    
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    
    if (linesRef.current) {
      linesRef.current.geometry.dispose();
      linesRef.current.geometry = lineGeometry;
      linesRef.current.material = lineMaterial;
    }
  }, [selectedPoint, connectedPoints, visualizationSettings.lineWidth, visualizationSettings.connectionOpacity, points]);

  const handlePointClickWrapper = (event: THREE.Event) => {
    event.stopPropagation();
    const array = points.map(point => new THREE.Vector3(point.position[0], point.position[1], point.position[2]));
    const geometry = new THREE.BufferGeometry().setFromPoints(array);
    const pointCloud = new THREE.Points(geometry);
    
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    mouse.x = (event.clientX / gl.domElement.clientWidth) * 2 - 1;
    mouse.y = - (event.clientY / gl.domElement.clientHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObject(pointCloud);
    
    if (intersects.length > 0 && pointsRef.current) {
      const index = intersects[0].index;
      const clickedPoint = points[index];
      onPointClick(clickedPoint);
    } else {
      onPointClick(null);
    }
  };

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={cameraPosition}
        fov={45}
        near={0.1}
        far={1000}
      />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls
        ref={orbitControlsRef}
        args={[camera, gl.domElement]}
        enableDamping
        dampingFactor={0.1}
      />
      <Points
        ref={pointsRef}
        positions={points.map((p) => p.position).flat()}
        colors={points.map((p) => p.color).flat()}
        size={visualizationSettings.pointSize}
        onClick={handlePointClickWrapper}
      />
      <LineSegments
        ref={linesRef}
        positions={[]}
      />
    </>
  );
};

const Points = React.forwardRef<THREE.Points, { positions: number[]; colors: number[]; size: number; onClick: (event: THREE.Event) => void }>(
  ({ positions, colors, size, onClick }, ref) => {
    const geometryRef = useRef(new THREE.BufferGeometry());
    const materialRef = useRef(new THREE.PointsMaterial({ size, vertexColors: true }));

    useEffect(() => {
      geometryRef.current = new THREE.BufferGeometry();
      geometryRef.current.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometryRef.current.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      materialRef.current = new THREE.PointsMaterial({ size, vertexColors: true });
    }, [positions, colors, size]);

    return (
      <points geometry={geometryRef.current} material={materialRef.current} onClick={onClick} ref={ref} />
    );
  }
);

const LineSegments = React.forwardRef<THREE.LineSegments, { positions: number[] }>(
  ({ positions }, ref) => {
    const geometryRef = useRef(new THREE.BufferGeometry());
    const materialRef = useRef(new THREE.LineBasicMaterial({ color: 0xffffff }));

    useEffect(() => {
      geometryRef.current = new THREE.BufferGeometry();
      geometryRef.current.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    }, [positions]);

    return (
      <lineSegments geometry={geometryRef.current} material={materialRef.current} ref={ref} />
    );
  }
);

export default EmbeddingScene;

// Add these exported functions for zoom control
export const zoomIn = (camera: THREE.PerspectiveCamera) => {
  gsap.to(camera.position, {
    z: camera.position.z * 0.8,
    duration: 0.5,
    ease: "power2.out"
  });
};

export const zoomOut = (camera: THREE.PerspectiveCamera) => {
  gsap.to(camera.position, {
    z: camera.position.z * 1.2,
    duration: 0.5,
    ease: "power2.out"
  });
};

export const resetZoom = (camera: THREE.PerspectiveCamera, controls: OrbitControls) => {
  gsap.to(camera.position, {
    x: 0,
    y: 0,
    z: 20,
    duration: 1,
    ease: "power2.inOut",
    onUpdate: () => {
      camera.lookAt(0, 0, 0);
      if (controls) controls.update();
    }
  });
};
