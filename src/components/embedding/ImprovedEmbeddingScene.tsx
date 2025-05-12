
import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Point } from '@/types/embedding';
import ParticleSystem from './ParticleSystem';
import ConnectionLines from './ConnectionLines';
import { gsap } from 'gsap';
import * as THREE from 'three';

interface EmbeddingSceneProps {
  points: Point[];
  selectedPoint: Point | null;
  connectedPoints: Point[];
  onPointClick: (point: Point | null) => void;
  isRotating?: boolean;
  isInteractive?: boolean;
  selectedEmotionalGroup?: string | null;
  visualizationSettings?: {
    pointSize: number;
    lineWidth: number;
    connectionOpacity: number;
  };
  containerRef?: React.RefObject<HTMLDivElement>;
  cameraRef?: React.RefObject<THREE.PerspectiveCamera>;
  controlsRef?: React.RefObject<any>;
}

const ImprovedEmbeddingScene: React.FC<EmbeddingSceneProps> = ({
  points,
  selectedPoint,
  connectedPoints,
  onPointClick,
  isRotating = false,
  isInteractive = true,
  selectedEmotionalGroup = null,
  visualizationSettings = { pointSize: 5, lineWidth: 2, connectionOpacity: 0.5 },
  containerRef,
  cameraRef,
  controlsRef
}) => {
  const orbitControlsRef = useRef<any>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const sceneRef = useRef<THREE.Scene | null>(null);
  
  // Zoom controls for export
  const zoomIn = () => {
    if (cameraRef && cameraRef.current) {
      gsap.to(cameraRef.current.position, {
        z: cameraRef.current.position.z * 0.8,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  };
  
  const zoomOut = () => {
    if (cameraRef && cameraRef.current) {
      gsap.to(cameraRef.current.position, {
        z: cameraRef.current.position.z * 1.2,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  };
  
  const resetZoom = () => {
    if (cameraRef && cameraRef.current && orbitControlsRef.current) {
      gsap.to(cameraRef.current.position, {
        x: 0,
        y: 0,
        z: 20,
        duration: 1,
        ease: "power2.inOut",
        onUpdate: () => {
          cameraRef.current?.lookAt(0, 0, 0);
          if (orbitControlsRef.current) orbitControlsRef.current.update();
        }
      });
    }
  };
  
  // Assign zoom functions to window for external access
  useEffect(() => {
    // Export functions to window
    if (!window.documentEmbeddingActions) {
      window.documentEmbeddingActions = {};
    }
    
    window.documentEmbeddingActions.zoomIn = zoomIn;
    window.documentEmbeddingActions.zoomOut = zoomOut;
    window.documentEmbeddingActions.resetZoom = resetZoom;
    
    return () => {
      // Cleanup
      if (window.documentEmbeddingActions) {
        delete window.documentEmbeddingActions.zoomIn;
        delete window.documentEmbeddingActions.zoomOut;
        delete window.documentEmbeddingActions.resetZoom;
      }
    };
  }, []);
  
  // Handle orbit controls reference
  useEffect(() => {
    if (controlsRef && orbitControlsRef.current) {
      // Safely assign the reference
      if (typeof controlsRef === 'object' && controlsRef !== null) {
        Object.defineProperty(controlsRef, 'current', {
          get: () => orbitControlsRef.current,
          configurable: true
        });
      }
    }
  }, [controlsRef]);
  
  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      camera={{ position: [0, 0, 20], fov: 45 }}
    >
      <PerspectiveCamera
        makeDefault
        position={[0, 0, 20]}
        fov={45}
        near={0.1}
        far={1000}
        ref={cameraRef}
      />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      {/* Particles */}
      <ParticleSystem 
        points={points}
        selectedPoint={selectedPoint}
        selectedEmotionalGroup={selectedEmotionalGroup}
        pointSize={visualizationSettings.pointSize}
      />
      
      {/* Connection lines */}
      <ConnectionLines 
        selectedPoint={selectedPoint}
        connectedPoints={connectedPoints}
        lineWidth={visualizationSettings.lineWidth}
        lineOpacity={visualizationSettings.connectionOpacity}
      />
      
      {/* Controls */}
      <OrbitControls
        ref={orbitControlsRef}
        enableDamping
        dampingFactor={0.1}
        enabled={isInteractive}
      />
      
      {/* Event handling sphere (invisible) for point selection */}
      <mesh visible={false} onClick={(e) => {
        e.stopPropagation();
        
        if (!points || points.length === 0) return;
        
        // Create raycaster
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(
          (e.nativeEvent.clientX / e.nativeEvent.target.offsetWidth) * 2 - 1,
          -(e.nativeEvent.clientY / e.nativeEvent.target.offsetHeight) * 2 + 1
        );
        
        // Find closest point
        const particlePositions = points.map(p => new THREE.Vector3(p.position[0], p.position[1], p.position[2]));
        const closest = { index: -1, distance: Infinity };
        
        raycaster.setFromCamera(mouse, e.camera);
        
        particlePositions.forEach((pos, i) => {
          const dist = raycaster.ray.distanceToPoint(pos);
          if (dist < closest.distance && dist < 2) {
            closest.distance = dist;
            closest.index = i;
          }
        });
        
        // Select point if found, otherwise deselect
        if (closest.index >= 0) {
          onPointClick(points[closest.index]);
        } else {
          onPointClick(null);
        }
      }}>
        <sphereGeometry args={[100, 32, 32]} />
        <meshBasicMaterial opacity={0} transparent />
      </mesh>
    </Canvas>
  );
};

export default ImprovedEmbeddingScene;

// Export functions for external use
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

export const resetZoom = (camera: THREE.PerspectiveCamera, controls: any) => {
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
