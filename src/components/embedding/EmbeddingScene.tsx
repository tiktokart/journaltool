
import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Point } from '@/types/embedding';
import gsap from 'gsap';

interface EmbeddingSceneProps {
  points: Point[];
  containerRef?: React.RefObject<HTMLDivElement>;
  cameraRef?: React.MutableRefObject<THREE.PerspectiveCamera | null>;
  isInteractive?: boolean;
  onPointHover?: (point: Point | null) => void;
  onPointSelect?: (point: Point | null) => void;
  focusOnWord?: string | null;
  connectedPoints?: Point[];
  selectedPoint?: Point | null;
  comparisonPoint?: Point | null;
  isCompareMode?: boolean;
  depressedJournalReference?: boolean;  // Added this property to fix the type error
}

const EmbeddingScene: React.FC<EmbeddingSceneProps> = ({ 
  points, 
  containerRef: externalContainerRef,
  cameraRef: externalCameraRef,
  isInteractive = true, 
  onPointHover,
  onPointSelect,
  focusOnWord,
  connectedPoints = [],
  selectedPoint,
  comparisonPoint,
  isCompareMode = false
}) => {
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = externalContainerRef || internalContainerRef;
  
  const internalCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cameraRef = externalCameraRef || internalCameraRef;
  
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const linesRef = useRef<THREE.LineSegments | null>(null);
  const comparisonLinesRef = useRef<THREE.LineSegments | null>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    
    if (!cameraRef.current) {
      cameraRef.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    }
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
    camera.position.z = 8;

    scene.background = null;

    const controlsInstance = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controlsInstance;
    controlsInstance.enableDamping = true;
    controlsInstance.dampingFactor = 0.05;
    controlsInstance.screenSpacePanning = false;
    controlsInstance.minDistance = 1;
    controlsInstance.maxDistance = 15;
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
  }, [cameraRef, containerRef]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (pointsRef.current) {
      scene.remove(pointsRef.current);
    }

    const vertices: number[] = [];
    const colors: number[] = [];
    const pointSizes: number[] = [];

    points.forEach(point => {
      vertices.push(point.position[0], point.position[1], point.position[2]);
      
      const isSelected = selectedPoint && point.id === selectedPoint.id;
      const isComparison = comparisonPoint && point.id === comparisonPoint.id;
      const isInCompareMode = isCompareMode && selectedPoint && point.id === selectedPoint.id;
      
      if (isSelected || isComparison) {
        colors.push(
          Math.min(1, point.color[0] * 1.5), 
          Math.min(1, point.color[1] * 1.5), 
          Math.min(1, point.color[2] * 1.5)
        );
        pointSizes.push(0.15);
      } else {
        colors.push(point.color[0], point.color[1], point.color[2]);
        pointSizes.push(0.1);
      }
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    geometry.setAttribute('pointSize', new THREE.Float32BufferAttribute(pointSizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace(
          'void main() {',
          `attribute float pointSize;
           void main() {`
        )
        .replace(
          'gl_PointSize = size;',
          'gl_PointSize = pointSize * 20.0;'
        );
    };

    pointsRef.current = new THREE.Points(geometry, material);
    scene.add(pointsRef.current);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      if (!isInteractive || !containerRef.current || !pointsRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - containerRect.left) / containerRect.width) * 2 - 1;
      mouse.y = -((event.clientY - containerRect.top) / containerRect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current!);

      const intersects = raycaster.intersectObject(pointsRef.current);

      if (intersects.length > 0) {
        const pointIndex = intersects[0].index;
        if (onPointHover) {
          onPointHover(points[pointIndex]);
        }
      } else if (onPointHover) {
        onPointHover(null);
      }
    };

    const handlePointClick = (event: MouseEvent) => {
      if (!isInteractive || !containerRef.current || !pointsRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - containerRect.left) / containerRect.width) * 2 - 1;
      mouse.y = -((event.clientY - containerRect.top) / containerRect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current!);

      const intersects = raycaster.intersectObject(pointsRef.current);

      if (intersects.length > 0) {
        const pointIndex = intersects[0].index;
        const clickedPoint = points[pointIndex];
        
        if (!isCompareMode && selectedPoint && clickedPoint.id === selectedPoint.id) {
          if (onPointSelect) {
            onPointSelect(null);
          }
        } else {
          if (onPointSelect) {
            onPointSelect(clickedPoint);
          }
        }
      }
    };

    if (isInteractive && containerRef.current) {
      containerRef.current.addEventListener('click', handlePointClick);
      containerRef.current.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (isInteractive && containerRef.current) {
        containerRef.current.removeEventListener('click', handlePointClick);
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [points, isInteractive, onPointSelect, onPointHover, containerRef, selectedPoint, comparisonPoint, isCompareMode]);

  useEffect(() => {
    const scene = sceneRef.current;
    
    if (linesRef.current) {
      scene.remove(linesRef.current);
      linesRef.current = null;
    }
    
    if (connectedPoints.length === 0 || !focusOnWord) return;
    
    const sourcePoint = points.find(p => p.word === focusOnWord);
    if (!sourcePoint) return;
    
    const lineVertices: number[] = [];
    const lineColors: number[] = [];
    
    connectedPoints.forEach(connectedPoint => {
      lineVertices.push(
        sourcePoint.position[0],
        sourcePoint.position[1],
        sourcePoint.position[2]
      );
      
      lineVertices.push(
        connectedPoint.position[0],
        connectedPoint.position[1],
        connectedPoint.position[2]
      );
      
      lineColors.push(
        sourcePoint.color[0],
        sourcePoint.color[1],
        sourcePoint.color[2]
      );
      
      lineColors.push(
        connectedPoint.color[0],
        connectedPoint.color[1],
        connectedPoint.color[2]
      );
    });
    
    if (lineVertices.length > 0) {
      const linesGeometry = new THREE.BufferGeometry();
      linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3));
      linesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
      
      const linesMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        linewidth: 3,
        transparent: true,
        opacity: 0.9
      });
      
      linesRef.current = new THREE.LineSegments(linesGeometry, linesMaterial);
      scene.add(linesRef.current);
      
      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.render(scene, cameraRef.current);
      }
    }
  }, [points, connectedPoints, focusOnWord]);

  useEffect(() => {
    const scene = sceneRef.current;
    
    if (comparisonLinesRef.current) {
      scene.remove(comparisonLinesRef.current);
      comparisonLinesRef.current = null;
    }
    
    if (!selectedPoint || !comparisonPoint) return;
    
    const lineVertices: number[] = [];
    const lineColors: number[] = [];
    
    lineVertices.push(
      selectedPoint.position[0],
      selectedPoint.position[1],
      selectedPoint.position[2]
    );
    
    lineVertices.push(
      comparisonPoint.position[0],
      comparisonPoint.position[1],
      comparisonPoint.position[2]
    );
    
    lineColors.push(1.0, 0.5, 0.0);
    lineColors.push(1.0, 0.5, 0.0);
    
    if (lineVertices.length > 0) {
      const linesGeometry = new THREE.BufferGeometry();
      linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3));
      linesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
      
      const linesMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        linewidth: 5,
        transparent: true,
        opacity: 1.0
      });
      
      comparisonLinesRef.current = new THREE.LineSegments(linesGeometry, linesMaterial);
      scene.add(comparisonLinesRef.current);
      
      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.render(scene, cameraRef.current);
      }
    }
  }, [selectedPoint, comparisonPoint]);

  const focusOnPoint = useCallback((targetPoint: Point | null) => {
    if (!targetPoint || !cameraRef.current || !controlsRef.current) return;
    
    const point = new THREE.Vector3(targetPoint.position[0], targetPoint.position[1], targetPoint.position[2]);
    
    const startPosition = new THREE.Vector3();
    startPosition.copy(cameraRef.current.position);
    
    const endPosition = new THREE.Vector3();
    endPosition.copy(point).add(new THREE.Vector3(0, 0, 4));
    
    gsap.to(cameraRef.current.position, {
      x: endPosition.x,
      y: endPosition.y,
      z: endPosition.z,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        if (controlsRef.current) {
          controlsRef.current.target.set(point.x, point.y, point.z);
          controlsRef.current.update();
        }
      }
    });
  }, [cameraRef]);

  useEffect(() => {
    if (focusOnWord) {
      const targetPoint = points.find(point => point.word === focusOnWord);
      focusOnPoint(targetPoint || null);
    }
  }, [focusOnWord, points, focusOnPoint]);

  return (
    <div ref={externalContainerRef ? undefined : internalContainerRef} style={{ width: '100%', height: '100%' }} />
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
    z: Math.min(camera.position.z + 1, 15),
    duration: 0.5,
    ease: "power2.out"
  });
};

export default EmbeddingScene;
