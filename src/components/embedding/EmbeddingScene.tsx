
import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Point } from '@/types/embedding';
import gsap from 'gsap';

interface EmbeddingSceneProps {
  points: Point[];
  containerRef?: React.RefObject<HTMLDivElement>;
  cameraRef?: React.MutableRefObject<THREE.PerspectiveCamera | null>;
  controlsRef?: React.MutableRefObject<OrbitControls | null>;
  isInteractive?: boolean;
  onPointHover?: (point: Point | null) => void;
  onPointSelect?: (point: Point | null) => void;
  focusOnWord?: string | null;
  connectedPoints?: Point[];
  selectedPoint?: Point | null;
  comparisonPoint?: Point | null;
  isCompareMode?: boolean;
  depressedJournalReference?: boolean;
  onFocusEmotionalGroup?: (tone: string) => void;
}

const EmbeddingScene: React.FC<EmbeddingSceneProps> = ({ 
  points, 
  containerRef: externalContainerRef,
  cameraRef: externalCameraRef,
  controlsRef: externalControlsRef,
  isInteractive = true, 
  onPointHover,
  onPointSelect,
  focusOnWord,
  connectedPoints = [],
  selectedPoint,
  comparisonPoint,
  isCompareMode = false,
  onFocusEmotionalGroup
}) => {
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = externalContainerRef || internalContainerRef;
  
  const internalCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cameraRef = externalCameraRef || internalCameraRef;
  
  const internalControlsRef = useRef<OrbitControls | null>(null);
  const controlsRef = externalControlsRef || internalControlsRef;
  
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const spheresGroupRef = useRef<THREE.Group | null>(null);
  const linesRef = useRef<THREE.LineSegments | null>(null);
  const comparisonLinesRef = useRef<THREE.LineSegments | null>(null);
  const spheresRef = useRef<THREE.Mesh[]>([]);
  const isMiddleMouseDownRef = useRef<boolean>(false);
  const lastMousePositionRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const emotionalGroupsRef = useRef<Map<string, THREE.Vector3>>(new Map());

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
    camera.position.z = 15;

    scene.background = null;

    const controlsInstance = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controlsInstance;
    controlsInstance.enableDamping = true;
    controlsInstance.dampingFactor = 0.05;
    controlsInstance.screenSpacePanning = false;
    controlsInstance.minDistance = 1;
    controlsInstance.maxDistance = 30;
    controlsInstance.maxPolarAngle = Math.PI / 2;
    controlsInstance.autoRotateSpeed = 0.5;
    controlsInstance.autoRotate = true;
    controlsInstance.enableZoom = true; // Make sure zoom is enabled
    controlsInstance.zoomSpeed = 1.0; // Adjust zoom speed
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
    
    // Fix for the wheel event to properly zoom
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      
      // Determine zoom direction (in/out)
      const zoomDirection = event.deltaY > 0 ? 1 : -1;
      
      // Amount to zoom - adjust this value as needed
      const zoomAmount = 1.0;
      
      if (zoomDirection > 0) {
        // Zoom out
        const targetZ = Math.min(camera.position.z + zoomAmount, 30);
        gsap.to(camera.position, {
          z: targetZ,
          duration: 0.3,
          ease: "power2.out"
        });
      } else {
        // Zoom in
        const targetZ = Math.max(camera.position.z - zoomAmount, 1);
        gsap.to(camera.position, {
          z: targetZ,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    };
    
    const handleMiddleMouseDown = (event: MouseEvent) => {
      if (event.button === 1) { // Middle mouse button
        event.preventDefault();
        isMiddleMouseDownRef.current = true;
        lastMousePositionRef.current = { x: event.clientX, y: event.clientY };
        
        if (controlsRef.current) {
          controlsRef.current.enabled = false;
        }
      }
    };
    
    const handleMiddleMouseMove = (event: MouseEvent) => {
      if (!isMiddleMouseDownRef.current || !cameraRef.current) return;
      
      const deltaX = event.clientX - lastMousePositionRef.current.x;
      const deltaY = event.clientY - lastMousePositionRef.current.y;
      lastMousePositionRef.current.x = event.clientX;
      lastMousePositionRef.current.y = event.clientY;
      
      const panSpeed = 0.01 * cameraRef.current.position.z;
      
      const rightVector = new THREE.Vector3(1, 0, 0);
      rightVector.applyQuaternion(cameraRef.current.quaternion);
      
      const upVector = new THREE.Vector3(0, 1, 0);
      upVector.applyQuaternion(cameraRef.current.quaternion);
      
      cameraRef.current.position.addScaledVector(rightVector, -deltaX * panSpeed);
      cameraRef.current.position.addScaledVector(upVector, deltaY * panSpeed);
      
      if (controlsRef.current) {
        controlsRef.current.target.addScaledVector(rightVector, -deltaX * panSpeed);
        controlsRef.current.target.addScaledVector(upVector, deltaY * panSpeed);
      }
    };
    
    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 1) { // Middle mouse button
        isMiddleMouseDownRef.current = false;
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
        }
      }
    };
    
    const handleMouseLeave = () => {
      if (isMiddleMouseDownRef.current) {
        isMiddleMouseDownRef.current = false;
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
        }
      }
    };
    
    if (containerRef.current) {
      containerRef.current.addEventListener('mousedown', handleMiddleMouseDown);
      document.addEventListener('mousemove', handleMiddleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      containerRef.current.addEventListener('mouseleave', handleMouseLeave);
      containerRef.current.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousedown', handleMiddleMouseDown);
        containerRef.current.removeEventListener('mouseleave', handleMouseLeave);
        containerRef.current.removeEventListener('wheel', handleWheel);
      }
      document.removeEventListener('mousemove', handleMiddleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      controlsInstance.dispose();
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [cameraRef, containerRef, controlsRef]);

  useEffect(() => {
    // Calculate and store the centers of emotional groups
    emotionalGroupsRef.current.clear();
    
    // Group points by emotional tone
    const emotionalGroups = new Map<string, Point[]>();
    
    points.forEach(point => {
      const tone = point.emotionalTone || "Neutral";
      if (!emotionalGroups.has(tone)) {
        emotionalGroups.set(tone, []);
      }
      emotionalGroups.get(tone)!.push(point);
    });
    
    // Calculate center for each group
    emotionalGroups.forEach((groupPoints, tone) => {
      if (groupPoints.length === 0) return;
      
      let sumX = 0, sumY = 0, sumZ = 0;
      
      groupPoints.forEach(point => {
        sumX += point.position[0];
        sumY += point.position[1];
        sumZ += point.position[2];
      });
      
      const centerX = sumX / groupPoints.length;
      const centerY = sumY / groupPoints.length;
      const centerZ = sumZ / groupPoints.length;
      
      emotionalGroupsRef.current.set(tone, new THREE.Vector3(centerX, centerY, centerZ));
    });
  }, [points]);

  useEffect(() => {
    const scene = sceneRef.current;
    
    if (spheresGroupRef.current) {
      scene.remove(spheresGroupRef.current);
      spheresGroupRef.current = null;
    }
    
    const spheresGroup = new THREE.Group();
    spheresGroupRef.current = spheresGroup;
    
    spheresRef.current = [];
    
    const sphereGeometry = new THREE.SphereGeometry(0.04, 16, 16);
    
    points.forEach((point, index) => {
      const isSelected = selectedPoint && point.id === selectedPoint.id;
      const isComparison = comparisonPoint && point.id === comparisonPoint.id;
      
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(point.color[0], point.color[1], point.color[2]),
        transparent: true,
        opacity: 0.8
      });
      
      if (isSelected || isComparison) {
        sphereGeometry.scale(1.5, 1.5, 1.5);
        material.color.multiplyScalar(1.5);
        material.opacity = 1.0;
      }
      
      const sphere = new THREE.Mesh(sphereGeometry, material);
      
      sphere.position.set(point.position[0], point.position[1], point.position[2]);
      
      sphere.userData.pointIndex = index;
      
      spheresGroup.add(sphere);
      
      spheresRef.current.push(sphere);
      
      if (isSelected || isComparison) {
        sphereGeometry.scale(1/1.5, 1/1.5, 1/1.5);
      }
    });
    
    scene.add(spheresGroup);
    
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      if (!isInteractive || !containerRef.current || !spheresGroupRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - containerRect.left) / containerRect.width) * 2 - 1;
      mouse.y = -((event.clientY - containerRect.top) / containerRect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current!);

      const intersects = raycaster.intersectObjects(spheresGroupRef.current.children);

      if (intersects.length > 0) {
        const object = intersects[0].object as THREE.Mesh;
        const pointIndex = object.userData.pointIndex;
        
        if (pointIndex !== undefined && onPointHover) {
          onPointHover(points[pointIndex]);
        }
      } else if (onPointHover) {
        onPointHover(null);
      }
    };

    const handlePointClick = (event: MouseEvent) => {
      if (!isInteractive || !containerRef.current || !spheresGroupRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - containerRect.left) / containerRect.width) * 2 - 1;
      mouse.y = -((event.clientY - containerRect.top) / containerRect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current!);

      const intersects = raycaster.intersectObjects(spheresGroupRef.current.children);

      if (intersects.length > 0) {
        const object = intersects[0].object as THREE.Mesh;
        const pointIndex = object.userData.pointIndex;
        
        if (pointIndex !== undefined) {
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
    endPosition.copy(point).add(new THREE.Vector3(0, 0, 8));
    
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

  // Add a new function to focus on emotional group centers
  const focusOnEmotionalGroup = useCallback((emotionalTone: string) => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    const groupCenter = emotionalGroupsRef.current.get(emotionalTone);
    if (!groupCenter) return;
    
    const point = groupCenter;
    
    const startPosition = new THREE.Vector3();
    startPosition.copy(cameraRef.current.position);
    
    const endPosition = new THREE.Vector3();
    endPosition.copy(point).add(new THREE.Vector3(0, 0, 10)); // Zoomed out a bit more for groups
    
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
    
    if (onFocusEmotionalGroup) {
      onFocusEmotionalGroup(emotionalTone);
    }
  }, [cameraRef, onFocusEmotionalGroup]);

  useEffect(() => {
    if (focusOnWord) {
      const targetPoint = points.find(point => point.word === focusOnWord);
      focusOnPoint(targetPoint || null);
    }
  }, [focusOnWord, points, focusOnPoint]);

  // Expose the focusOnEmotionalGroup function to parent components
  useEffect(() => {
    if (!window.documentEmbeddingActions) {
      window.documentEmbeddingActions = {};
    }
    window.documentEmbeddingActions.focusOnEmotionalGroup = focusOnEmotionalGroup;
    
    return () => {
      if (window.documentEmbeddingActions) {
        window.documentEmbeddingActions.focusOnEmotionalGroup = undefined;
      }
    };
  }, [focusOnEmotionalGroup]);

  return (
    <div ref={externalContainerRef ? undefined : internalContainerRef} style={{ width: '100%', height: '100%' }} />
  );
};

export const zoomIn = (camera: THREE.PerspectiveCamera | null) => {
  if (!camera) return;
  
  gsap.to(camera.position, {
    z: Math.max(camera.position.z - 2, 1),
    duration: 0.5,
    ease: "power2.out"
  });
};

export const zoomOut = (camera: THREE.PerspectiveCamera | null) => {
  if (!camera) return;
  
  gsap.to(camera.position, {
    z: Math.min(camera.position.z + 3, 30),
    duration: 0.5,
    ease: "power2.out"
  });
};

export const resetZoom = (camera: THREE.PerspectiveCamera | null, controls: OrbitControls | null) => {
  if (!camera || !controls) return;
  
  gsap.to(camera.position, {
    x: 0,
    y: 0,
    z: 15,
    duration: 1,
    ease: "power2.inOut",
    onUpdate: () => {
      if (controls) {
        controls.target.set(0, 0, 0);
        controls.update();
      }
    }
  });
};

export default EmbeddingScene;
