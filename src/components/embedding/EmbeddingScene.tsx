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
  selectedEmotionalGroup?: string | null;
  onResetView?: () => void;
  visibleClusterCount?: number;
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
  onFocusEmotionalGroup,
  selectedEmotionalGroup,
  onResetView,
  visibleClusterCount = 8
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
  const emotionalGroupsRef = useRef<Map<string, THREE.Vector3>>(new Map());
  const isZoomingRef = useRef<boolean>(false);
  const zoomTimeoutRef = useRef<number | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const rotationRef = useRef<THREE.Vector3>(new THREE.Vector3(0.0001, 0.0002, 0));
  const filteredPointsRef = useRef<Point[]>([]);
  const activeEmotionalGroupsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!points.length) return;
    
    const emotionCounts: Record<string, number> = {};
    points.forEach(point => {
      const emotion = point.emotionalTone || "Neutral";
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
    
    const sortedEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([emotion]) => emotion);
    
    activeEmotionalGroupsRef.current = sortedEmotions.slice(0, visibleClusterCount);
    
    if (selectedEmotionalGroup) {
      filteredPointsRef.current = points.filter(p => 
        (p.emotionalTone || "Neutral") === selectedEmotionalGroup
      );
    } else {
      filteredPointsRef.current = points.filter(p => 
        activeEmotionalGroupsRef.current.includes(p.emotionalTone || "Neutral")
      );
    }
    
    if (spheresGroupRef.current) {
      updateSpheres();
    }
  }, [points, visibleClusterCount, selectedEmotionalGroup]);

  useEffect(() => {
    const scene = sceneRef.current;
    
    if (!cameraRef.current) {
      cameraRef.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    }
    const camera = cameraRef.current;

    rendererRef.current = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      preserveDrawingBuffer: true
    });
    const renderer = rendererRef.current!;
    
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    renderer.setSize(containerWidth, containerHeight);
    containerRef.current.appendChild(renderer.domElement);
    
    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();
    camera.position.z = 20;
    
    scene.background = new THREE.Color(0xffffff);

    const controlsInstance = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controlsInstance;
    controlsInstance.enableDamping = true;
    controlsInstance.dampingFactor = 0.1;
    controlsInstance.screenSpacePanning = true;
    controlsInstance.minDistance = 1;
    controlsInstance.maxDistance = 50;
    controlsInstance.maxPolarAngle = Math.PI;
    controlsInstance.autoRotateSpeed = 0.5;
    controlsInstance.autoRotate = true;
    controlsInstance.enableZoom = true;
    controlsInstance.enableRotate = true;
    controlsInstance.rotateSpeed = 0.5;
    controlsInstance.zoomSpeed = 1.2;
    controlsInstance.panSpeed = 0.8;
    
    const handleMouseDown = () => {
      isDraggingRef.current = true;
    };
    
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };
    
    const handleMouseLeave = () => {
      isDraggingRef.current = false;
    };
    
    if (containerRef.current) {
      containerRef.current.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mouseup', handleMouseUp);
      containerRef.current.addEventListener('mouseleave', handleMouseLeave);
    }
    
    controlsInstance.update();
    
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      
      if (spheresGroupRef.current) {
        spheresGroupRef.current.rotation.x += rotationRef.current.x;
        spheresGroupRef.current.rotation.y += rotationRef.current.y;
      }
      
      if (!isZoomingRef.current) {
        controlsInstance.update();
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    const handleResize = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      renderer.setSize(containerWidth, containerHeight);
      camera.aspect = containerWidth / containerHeight;
      camera.updateProjectionMatrix();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousedown', handleMouseDown);
        containerRef.current.removeEventListener('mouseleave', handleMouseLeave);
      }
      window.removeEventListener('mouseup', handleMouseUp);
      
      if (zoomTimeoutRef.current !== null) {
        window.clearTimeout(zoomTimeoutRef.current);
      }
      
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      
      controlsInstance.dispose();
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [cameraRef, containerRef, controlsRef]);

  useEffect(() => {
    if (selectedEmotionalGroup) {
      filteredPointsRef.current = points.filter(p => 
        (p.emotionalTone || "Neutral") === selectedEmotionalGroup
      );
    } else {
      filteredPointsRef.current = points.filter(p => 
        activeEmotionalGroupsRef.current.includes(p.emotionalTone || "Neutral")
      );
    }
    
    emotionalGroupsRef.current.clear();
    
    const emotionalGroups = new Map<string, Point[]>();
    
    points.forEach(point => {
      const tone = point.emotionalTone || "Neutral";
      if (!emotionalGroups.has(tone)) {
        emotionalGroups.set(tone, []);
      }
      emotionalGroups.get(tone)!.push(point);
    });
    
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
    
    updateSpheres();
  }, [points, selectedEmotionalGroup, visibleClusterCount]);

  const updateSpheres = () => {
    const scene = sceneRef.current;
    
    if (spheresGroupRef.current) {
      scene.remove(spheresGroupRef.current);
      spheresGroupRef.current = null;
    }
    
    const spheresGroup = new THREE.Group();
    spheresGroupRef.current = spheresGroup;
    
    spheresRef.current = [];
    
    const pointsToRender = filteredPointsRef.current;
    
    const sphereGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    
    pointsToRender.forEach((point, index) => {
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
      sphere.userData.pointId = point.id;
      
      spheresGroup.add(sphere);
      
      spheresRef.current.push(sphere);
      
      if (isSelected || isComparison) {
        sphereGeometry.scale(1/1.5, 1/1.5, 1/1.5);
      }
    });
    
    scene.add(spheresGroup);
    
    if (spheresGroup) {
      spheresGroup.rotation.x = Math.random() * 0.2;
      spheresGroup.rotation.y = Math.random() * 0.2;
    }
  };

  const handlePointHover = (event: MouseEvent) => {
    if (!isInteractive || !containerRef.current || !spheresGroupRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - containerRect.left) / containerRect.width) * 2 - 1,
      -((event.clientY - containerRect.top) / containerRect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current!);

    const intersects = raycaster.intersectObjects(spheresGroupRef.current.children);

    if (intersects.length > 0) {
      const object = intersects[0].object as THREE.Mesh;
      const pointIndex = object.userData.pointIndex;
      
      if (pointIndex !== undefined && onPointHover) {
        onPointHover(filteredPointsRef.current[pointIndex]);
      }
    } else if (onPointHover) {
      onPointHover(null);
    }
  };

  const handlePointClick = (event: MouseEvent) => {
    if (!isInteractive || !containerRef.current || !spheresGroupRef.current) return;
    
    if (isDraggingRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - containerRect.left) / containerRect.width) * 2 - 1,
      -((event.clientY - containerRect.top) / containerRect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current!);

    const intersects = raycaster.intersectObjects(spheresGroupRef.current.children);

    if (intersects.length > 0) {
      const object = intersects[0].object as THREE.Mesh;
      const pointIndex = object.userData.pointIndex;
      
      if (pointIndex !== undefined) {
        const clickedPoint = filteredPointsRef.current[pointIndex];
        
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

  useEffect(() => {
    if (isInteractive && containerRef.current) {
      containerRef.current.addEventListener('click', handlePointClick);
      containerRef.current.addEventListener('mousemove', handlePointHover);
    }

    return () => {
      if (isInteractive && containerRef.current) {
        containerRef.current.removeEventListener('click', handlePointClick);
        containerRef.current.removeEventListener('mousemove', handlePointHover);
      }
    };
  }, [filteredPointsRef.current, isInteractive, onPointSelect, onPointHover, containerRef, selectedPoint, comparisonPoint, isCompareMode, selectedEmotionalGroup, visibleClusterCount]);

  const focusOnPoint = useCallback((targetPoint: Point | null) => {
    if (!targetPoint || !cameraRef.current || !controlsRef.current) return;
    
    isZoomingRef.current = true;
    
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
      },
      onComplete: () => {
        isZoomingRef.current = false;
      }
    });
  }, [cameraRef]);

  const resetView = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    isZoomingRef.current = true;
    
    gsap.to(cameraRef.current.position, {
      x: 0,
      y: 0,
      z: 20,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.update();
        }
      },
      onComplete: () => {
        isZoomingRef.current = false;
        if (controlsRef.current) {
          controlsRef.current.autoRotate = true;
        }
      }
    });
    
    if (onFocusEmotionalGroup) {
      onFocusEmotionalGroup("");
    }
  }, [cameraRef, controlsRef, onFocusEmotionalGroup]);

  const focusOnEmotionalGroup = useCallback((emotionalTone: string) => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    const groupCenter = emotionalGroupsRef.current.get(emotionalTone);
    if (!groupCenter) return;
    
    isZoomingRef.current = true;
    
    if (controlsRef.current) {
      controlsRef.current.autoRotate = false;
    }
    
    const point = groupCenter;
    
    const startPosition = new THREE.Vector3();
    startPosition.copy(cameraRef.current.position);
    
    const endPosition = new THREE.Vector3();
    endPosition.copy(point).add(new THREE.Vector3(0, 0, 10));
    
    gsap.to(cameraRef.current.position, {
      x: endPosition.x,
      y: endPosition.y,
      z: endPosition.z,
      duration: 2.0,
      ease: "power2.inOut",
      onUpdate: () => {
        if (controlsRef.current) {
          controlsRef.current.target.set(point.x, point.y, point.z);
          controlsRef.current.update();
        }
      },
      onComplete: () => {
        isZoomingRef.current = false;
      }
    });
    
    if (onFocusEmotionalGroup) {
      onFocusEmotionalGroup(emotionalTone);
    }
  }, [cameraRef, controlsRef, onFocusEmotionalGroup]);

  const resetEmotionalGroupFilter = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    isZoomingRef.current = true;
    
    gsap.to(cameraRef.current.position, {
      x: 0,
      y: 0,
      z: 20,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.update();
        }
      },
      onComplete: () => {
        isZoomingRef.current = false;
      }
    });
  }, [cameraRef]);

  useEffect(() => {
    if (focusOnWord) {
      const targetPoint = points.find(point => point.word === focusOnWord);
      focusOnPoint(targetPoint || null);
    }
  }, [focusOnWord, points, focusOnPoint]);

  useEffect(() => {
    if (!window.documentEmbeddingActions) {
      window.documentEmbeddingActions = {};
    }
    window.documentEmbeddingActions.focusOnEmotionalGroup = focusOnEmotionalGroup;
    window.documentEmbeddingActions.resetEmotionalGroupFilter = resetEmotionalGroupFilter;
    window.documentEmbeddingActions.resetView = resetView;
    
    return () => {
      if (window.documentEmbeddingActions) {
        window.documentEmbeddingActions.focusOnEmotionalGroup = undefined;
        window.documentEmbeddingActions.resetEmotionalGroupFilter = undefined;
        window.documentEmbeddingActions.resetView = undefined;
      }
    };
  }, [focusOnEmotionalGroup, resetEmotionalGroupFilter, resetView]);

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
    
    lineColors.push(1.0, 0.6, 0.0);
    lineColors.push(1.0, 0.6, 0.0);
    
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
    z: Math.min(camera.position.z + 3, 50),
    duration: 0.5,
    ease: "power2.out"
  });
};

export const resetZoom = (camera: THREE.PerspectiveCamera | null, controls: OrbitControls | null) => {
  if (!camera || !controls) return;
  
  gsap.to(camera.position, {
    x: 0,
    y: 0,
    z: 20,
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
