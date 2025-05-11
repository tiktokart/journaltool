import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Point } from '../../src/types/embedding';
import { useFrame } from '@react-three/fiber';
import { useSnapshot } from 'valtio';
import { state } from './State';
import { getEmotionColor } from '../../src/utils/embeddingUtils';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface EmbeddingSceneProps {
  containerRef: React.RefObject<HTMLDivElement>;
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>;
  controlsRef: React.MutableRefObject<OrbitControls | null>;
  points: Point[];
  onPointHover: (point: Point | null) => void;
  onPointSelect: (point: Point | null) => void;
  isInteractive: boolean;
  depressedJournalReference: boolean;
  focusOnWord: string | null;
  connectedPoints: Point[];
  selectedPoint: Point | null;
  comparisonPoint: Point | null;
  isCompareMode: boolean;
  onFocusEmotionalGroup: (tone: string) => void;
  selectedEmotionalGroup: string | null;
  onResetView: () => void;
  visibleClusterCount: number;
  showAllPoints: boolean;
}

export const zoomIn = (camera: THREE.PerspectiveCamera | null) => {
  if (camera) {
    camera.position.z -= 5;
  }
};

export const zoomOut = (camera: THREE.PerspectiveCamera | null) => {
  if (camera) {
    camera.position.z += 5;
  }
};

export const resetZoom = (camera: THREE.PerspectiveCamera | null, controls: OrbitControls | null) => {
  if (camera) {
    camera.position.set(0, 0, 25);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }
  if (controls) {
    controls.reset();
  }
};

const EmbeddingScene: React.FC<EmbeddingSceneProps> = ({
  containerRef,
  cameraRef,
  controlsRef,
  points,
  onPointHover,
  onPointSelect,
  isInteractive,
  depressedJournalReference,
  focusOnWord,
  connectedPoints,
  selectedPoint,
  comparisonPoint,
  isCompareMode,
  onFocusEmotionalGroup,
  selectedEmotionalGroup,
  onResetView,
  visibleClusterCount,
  showAllPoints
}) => {
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const pointsRef = useRef<THREE.Points>(null);
  const lineRef = useRef<THREE.Line>(null);
  const camera = useRef<THREE.PerspectiveCamera>(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000));
  const orbitControls = useRef<OrbitControls | null>(null);
  const animationFrameId = useRef<number>(0);
  const { hoveredWord } = useSnapshot(state);
  const [frustum, setFrustum] = React.useState<THREE.Frustum>(new THREE.Frustum());
  
  const isPointVisible = (point: Point, camera: THREE.PerspectiveCamera, frustum: THREE.Frustum) => {
    if (!point || typeof point.x !== 'number' || typeof point.y !== 'number' || typeof point.z !== 'number') {
      return false;
    }
    
    const vector = new THREE.Vector3(point.x, point.y, point.z);
    vector.project(camera);
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    vector.x = (vector.x * width + width) / 2;
    vector.y = -(vector.y * height - height) / 2;
    
    const sphere = new THREE.Sphere(new THREE.Vector3(point.x, point.y, point.z), 1);
    return frustum.intersectsSphere(sphere);
  };
  
  useEffect(() => {
    if (cameraRef) {
      cameraRef.current = camera.current;
    }
  }, [cameraRef, camera]);
  
  useEffect(() => {
    const scene = sceneRef.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0); // Set clear color to transparent
    
    if (!containerRef.current) {
      console.error("Container ref is not yet available.");
      return;
    }
    
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    
    camera.current.aspect = width / height;
    camera.current.position.z = 25;
    camera.current.updateProjectionMatrix();
    
    // OrbitControls
    orbitControls.current = new OrbitControls(camera.current, renderer.domElement);
    orbitControls.current.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    orbitControls.current.dampingFactor = 0.05;
    orbitControls.current.screenSpacePanning = false;
    orbitControls.current.minDistance = 10;
    orbitControls.current.maxDistance = 50;
    orbitControls.current.maxPolarAngle = Math.PI / 2;
    
    if (controlsRef) {
      controlsRef.current = orbitControls.current;
    }
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1).normalize();
    scene.add(directionalLight);
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      
      camera.current.aspect = newWidth / newHeight;
      camera.current.updateProjectionMatrix();
      
      renderer.setSize(newWidth, newHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Raycaster for interactive points
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current || !pointsRef.current || !isInteractive) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera.current);
      
      const intersects = raycaster.intersectObject(pointsRef.current);
      
      if (intersects.length > 0) {
        const intersection = intersects[0];
        const index = intersection.index;
        
        if (points && points[index]) {
          const hoveredPoint = points[index];
          state.hoveredWord = hoveredPoint.word || null;
          onPointHover(hoveredPoint);
        } else {
          state.hoveredWord = null;
          onPointHover(null);
        }
      } else {
        state.hoveredWord = null;
        onPointHover(null);
      }
    };
    
    const handlePointClick = (event: MouseEvent) => {
      if (!containerRef.current || !pointsRef.current || !isInteractive) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera.current);
      
      const intersects = raycaster.intersectObject(pointsRef.current);
      
      if (intersects.length > 0) {
        const intersection = intersects[0];
        const index = intersection.index;
        
        if (points && points[index]) {
          const selectedPoint = points[index];
          onPointSelect(selectedPoint);
        } else {
          onPointSelect(null);
        }
      } else {
        onPointSelect(null);
      }
    };
    
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handlePointClick);
    
    const animate = () => {
      if (orbitControls.current) {
        orbitControls.current.update();
      }
      
      // Get current projection matrix
      camera.current.updateMatrixWorld();
      camera.current.matrixWorldInverse.copy(camera.current.matrixWorld).invert();
      
      // Update the frustum
      frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.current.projectionMatrix, camera.current.matrixWorldInverse));
      
      renderer.render(scene, camera.current);
      animationFrameId.current = window.requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.cancelAnimationFrame(animationFrameId.current);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handlePointClick);
      window.removeEventListener('resize', handleResize);
      
      // Dispose of resources
      renderer.dispose();
      scene.dispose();
      
      if (orbitControls.current) {
        orbitControls.current.dispose();
      }
    };
  }, [containerRef, points, isInteractive, onPointHover, onPointSelect]);
  
  useEffect(() => {
    if (onResetView) {
      window.documentEmbeddingActions = {
        ...window.documentEmbeddingActions,
        resetView: () => {
          resetZoom(camera.current, orbitControls.current);
        }
      };
    }
  }, [onResetView]);
  
  useEffect(() => {
    if (onFocusEmotionalGroup) {
      window.documentEmbeddingActions = {
        ...window.documentEmbeddingActions,
        focusOnEmotionalGroup: (tone: string) => {
          // Call the handler to focus on the emotional group
          onFocusEmotionalGroup(tone);
        },
        resetEmotionalGroupFilter: () => {
          // Call the handler to reset the emotional group filter
          onResetView();
        }
      };
    }
  }, [onFocusEmotionalGroup, onResetView]);
  
  const createPointMaterial = (point: Point) => {
    // Handle both position formats
    let positionArray: number[] = [];
    
    if (Array.isArray(point.position)) {
      positionArray = point.position;
    } else if (typeof point.x === 'number' && typeof point.y === 'number' && typeof point.z === 'number') {
      positionArray = [point.x, point.y, point.z];
    } else {
      // Fallback to origin if no valid position data
      positionArray = [0, 0, 0];
    }
    
    // Use position array values safely knowing they are numbers
    const distance = Math.sqrt(
      Math.pow(positionArray[0], 2) + 
      Math.pow(positionArray[1], 2) + 
      Math.pow(positionArray[2], 2)
    );
    
    let color;
    if (point.color) {
      if (Array.isArray(point.color)) {
        color = new THREE.Color(point.color[0], point.color[1], point.color[2]);
      } else {
        color = new THREE.Color(point.color);
      }
    } else if (point.emotionalTone) {
      color = new THREE.Color(getEmotionColor(point.emotionalTone));
    } else {
      color = new THREE.Color(0x95A5A6);
    }
    
    const size = point.size || 0.1;
    
    const material = new THREE.PointsMaterial({
      size: size,
      color: color,
      opacity: 0.7,
      transparent: true,
      sizeAttenuation: true,
    });
    
    return material;
  };
  
  useEffect(() => {
    const scene = sceneRef.current;
    
    // Clear any existing points
    if (pointsRef.current) {
      scene.remove(pointsRef.current);
      pointsRef.current.geometry.dispose();
      if (Array.isArray(pointsRef.current.material)) {
        pointsRef.current.material.forEach(material => material.dispose());
      } else {
        pointsRef.current.material.dispose();
      }
    }
    
    // Filter points based on selected emotional group
    let filteredPoints = points;
    if (selectedEmotionalGroup) {
      filteredPoints = points.filter(point => point.emotionalTone === selectedEmotionalGroup);
    }
    
    // Prepare data for the points
    const vertices: number[] = [];
    const materials: THREE.PointsMaterial[] = [];
    
    filteredPoints.forEach(point => {
      if (point.x !== undefined && point.y !== undefined && point.z !== undefined) {
        vertices.push(point.x, point.y, point.z);
        const material = createPointMaterial(point);
        materials.push(material);
      } else if (point.position && Array.isArray(point.position) && point.position.length === 3) {
        vertices.push(point.position[0], point.position[1], point.position[2]);
        const material = createPointMaterial(point);
        materials.push(material);
      }
    });
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    // Create points
    const pointsObj = new THREE.Points(geometry, materials);
    pointsRef.current = pointsObj;
    scene.add(pointsObj);
    
    return () => {
      if (pointsRef.current) {
        scene.remove(pointsRef.current);
        pointsRef.current.geometry.dispose();
        if (Array.isArray(pointsRef.current.material)) {
          pointsRef.current.material.forEach(material => material.dispose());
        } else {
          pointsRef.current.material.dispose();
        }
      }
    };
  }, [points, selectedEmotionalGroup]);
  
  const renderConnections = () => {
    const scene = sceneRef.current;
    
    if (lineRef.current) {
      scene.remove(lineRef.current);
      lineRef.current.geometry.dispose();
      if (Array.isArray(lineRef.current.material)) {
        lineRef.current.material.forEach(material => material.dispose());
      } else {
        lineRef.current.material.dispose();
      }
    }
    
    if (!selectedPoint || !connectedPoints || connectedPoints.length === 0) {
      return;
    }
    
    // Extract position safely for both data formats
    const getPointPosition = (point: Point): [number, number, number] => {
      if (Array.isArray(point.position) && point.position.length >= 3) {
        return [
          Number(point.position[0]), 
          Number(point.position[1]), 
          Number(point.position[2])
        ];
      }
      
      return [
        Number(point.x || 0),
        Number(point.y || 0),
        Number(point.z || 0)
      ];
    };
    
    // Get selected point position
    const p1Pos = getPointPosition(selectedPoint);
    
    // Prepare line geometry
    const lineGeometry = new THREE.BufferGeometry();
    const positions = [];
    
    // Add selected point position
    positions.push(p1Pos[0], p1Pos[1], p1Pos[2]);
    
    // Add connected points positions
    connectedPoints.forEach(point2 => {
      const p2Pos = getPointPosition(point2);
      positions.push(p2Pos[0], p2Pos[1], p2Pos[2]);
    });
    
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    // Create line material
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    
    // Create line object
    const line = new THREE.Line(lineGeometry, lineMaterial);
    lineRef.current = line;
    scene.add(line);
  };
  
  useEffect(() => {
    renderConnections();
  }, [selectedPoint, connectedPoints]);
  
  return null;
};

export default EmbeddingScene;
