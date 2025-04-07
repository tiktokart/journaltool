import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Point } from '@/types/embedding';
import gsap from 'gsap';

interface EmbeddingSceneProps {
  points: Point[];
  isInteractive?: boolean;
  onPointClick?: (point: Point) => void;
  focusOnWord?: string | null;
}

const EmbeddingScene: React.FC<EmbeddingSceneProps> = ({ points, isInteractive = false, onPointClick, focusOnWord }) => {
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const cameraRef = useRef<THREE.PerspectiveCamera>(new THREE.PerspectiveCamera(75, 1, 0.1, 1000));
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const camera = useRef<THREE.PerspectiveCamera>(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000));
  const controls = useRef<OrbitControls | null>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;

    rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const renderer = rendererRef.current!;
    
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    renderer.setSize(containerWidth, containerHeight);
    containerRef.current.appendChild(renderer.domElement);
    
    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();
    camera.position.z = 5;

    scene.background = null;

    const controlsInstance = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controlsInstance;
    controlsInstance.enableDamping = true;
    controlsInstance.dampingFactor = 0.05;
    controlsInstance.screenSpacePanning = false;
    controlsInstance.minDistance = 1;
    controlsInstance.maxDistance = 10;
    controlsInstance.maxPolarAngle = Math.PI / 2;
    controlsInstance.autoRotateSpeed = 0.5;
    controlsInstance.autoRotate = true;
    controlsInstance.update();
    
    const animate = () => {
      requestAnimationFrame(animate);
      controlsInstance.update();
      renderer.render(scene, camera);
    };
    
    const handleResize = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      renderer.setSize(containerWidth, containerHeight);
      camera.aspect = containerWidth / containerHeight;
      camera.updateProjectionMatrix();
    };
    
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      controlsInstance.dispose();
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (pointsRef.current) {
      scene.remove(pointsRef.current);
    }

    const vertices: number[] = [];
    const colors: number[] = [];

    points.forEach(point => {
      vertices.push(point.position[0], point.position[1], point.position[2]);
      colors.push(point.color[0], point.color[1], point.color[2]);
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });

    pointsRef.current = new THREE.Points(geometry, material);
    scene.add(pointsRef.current);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointClick = (event: MouseEvent) => {
      if (!isInteractive || !containerRef.current || !pointsRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - containerRect.left) / containerRect.width) * 2 - 1;
      mouse.y = -((event.clientY - containerRect.top) / containerRect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersects = raycaster.intersectObject(pointsRef.current);

      if (intersects.length > 0) {
        const pointIndex = intersects[0].index;
        if (onPointClick) {
          onPointClick(points[pointIndex]);
        }
      }
    };

    if (isInteractive && containerRef.current) {
      containerRef.current.addEventListener('click', handlePointClick);
    }

    return () => {
      if (isInteractive && containerRef.current) {
        containerRef.current.removeEventListener('click', handlePointClick);
      }
    };
  }, [points, isInteractive, onPointClick]);

  const focusOnPoint = useCallback((targetPoint: Point | null) => {
    if (!targetPoint || !camera.current || !controls.current) return;
    
    const point = new THREE.Vector3(targetPoint.position[0], targetPoint.position[1], targetPoint.position[2]);
    
    // Create temporary vectors for the interpolation
    const startPosition = new THREE.Vector3();
    startPosition.copy(camera.current.position);
    
    const endPosition = new THREE.Vector3();
    endPosition.copy(point).add(new THREE.Vector3(0, 0, 5));
    
    // Animate the camera position
    gsap.to(camera.current.position, {
      x: endPosition.x,
      y: endPosition.y,
      z: endPosition.z,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        if (controls.current) {
          // Update the target to look at the point
          controls.current.target.set(point.x, point.y, point.z);
          controls.current.update();
        }
      }
    });
  }, []);

  useEffect(() => {
    if (focusOnWord) {
      const targetPoint = points.find(point => point.word === focusOnWord);
      focusOnPoint(targetPoint || null);
    }
  }, [focusOnWord, points, focusOnPoint]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
  );
};

export const zoomIn = (camera: THREE.PerspectiveCamera | null) => {
  if (!camera) return;
  
  gsap.to(camera.position, {
    z: Math.max(camera.position.z - 1, 1),
    duration: 0.5,
    ease: "power2.out"
  });
};

export const zoomOut = (camera: THREE.PerspectiveCamera | null) => {
  if (!camera) return;
  
  gsap.to(camera.position, {
    z: Math.min(camera.position.z + 1, 10),
    duration: 0.5,
    ease: "power2.out"
  });
};

export default EmbeddingScene;
