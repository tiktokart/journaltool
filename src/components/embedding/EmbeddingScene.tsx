
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Point } from '../../types/embedding';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { toast } from 'sonner';
import { generateMockPoints } from '../../utils/embeddingUtils';

// Define props for the EmbeddingScene component
interface EmbeddingSceneProps {
  containerRef: React.RefObject<HTMLDivElement>;
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>;
  controlsRef: React.RefObject<OrbitControls | null>;
  points: Point[];
  onPointHover: (point: Point | null) => void;
  onPointSelect: (point: Point | null) => void;
  isInteractive?: boolean;
  depressedJournalReference?: boolean;
  focusOnWord?: string | null;
  connectedPoints?: Point[];
  selectedPoint?: Point | null;
  comparisonPoint?: Point | null;
  isCompareMode?: boolean;
  onFocusEmotionalGroup?: (emotionalTone: string) => void;
  selectedEmotionalGroup?: string | null;
  onResetView?: () => void;
  visibleClusterCount?: number;
  showAllPoints?: boolean;
}

// Camera helper functions
export const zoomIn = (camera: THREE.PerspectiveCamera) => {
  camera.position.multiplyScalar(0.9);
};

export const zoomOut = (camera: THREE.PerspectiveCamera) => {
  camera.position.multiplyScalar(1.1);
};

export const resetZoom = (camera: THREE.PerspectiveCamera, controls: OrbitControls) => {
  // Reset camera to default position
  camera.position.set(0, 0, 30);
  camera.lookAt(0, 0, 0);
  controls.update();
};

// Main component
const EmbeddingScene = ({
  containerRef,
  cameraRef,
  controlsRef,
  points,
  onPointHover,
  onPointSelect,
  isInteractive = true,
  depressedJournalReference = false,
  focusOnWord = null,
  connectedPoints = [],
  selectedPoint = null,
  comparisonPoint = null,
  isCompareMode = false,
  onFocusEmotionalGroup,
  selectedEmotionalGroup,
  onResetView,
  visibleClusterCount = 8,
  showAllPoints = true
}: EmbeddingSceneProps) => {
  // Refs for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pointsMeshRef = useRef<THREE.Points | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  
  // State variables for interaction
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [comparisonIndex, setComparisonIndex] = useState<number | null>(null);
  
  // Animation state
  const [animationTimestamp, setAnimationTimestamp] = useState<number>(0);
  const animationSpeed = useRef<number>(0.002);
  
  // Create local camera and controls if not provided
  const localCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const localControlsRef = useRef<OrbitControls | null>(null);

  // Setup Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    
    // Create a scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#FFFFFF');
    sceneRef.current = scene;
    
    // Set up the camera
    const camera = new THREE.PerspectiveCamera(
      75, 
      container.clientWidth / container.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 30;
    
    // Use provided camera ref or local ref
    if (cameraRef.current === null) {
      // Store the camera in the provided ref
      if (cameraRef) {
        localCameraRef.current = camera;
      }
    }
    
    // Set up the renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add OrbitControls for camera interaction
    if (isInteractive) {
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.rotateSpeed = 0.7;
      
      // Use provided controls ref or local ref
      if (controlsRef.current === null) {
        if (controlsRef) {
          localControlsRef.current = controls;
        }
      }
    }
    
    // Expose actions to window for external components
    window.documentEmbeddingActions = {
      focusOnEmotionalGroup: (tone: string) => {
        if (onFocusEmotionalGroup) onFocusEmotionalGroup(tone);
      },
      resetEmotionalGroupFilter: () => {
        // Reset filter logic here
      },
      resetView: () => {
        if (onResetView) onResetView();
      }
    };
    
    // Handle window resize
    const handleResize = () => {
      if (!camera || !rendererRef.current || !container) return;
      
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      
      rendererRef.current.setSize(container.clientWidth, container.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation function
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (localControlsRef.current) {
        localControlsRef.current.update();
      } else if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      // Slowly rotate the point cloud for visual interest
      if (pointsMeshRef.current && !isCompareMode) {
        pointsMeshRef.current.rotation.y += animationSpeed.current;
      }
      
      // Update the scene
      if (rendererRef.current && camera && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, camera);
      }
      
      // Update timestamp for animation effects
      setAnimationTimestamp(prev => prev + 1);
    };
    
    animate();
    
    // Cleanup function
    return () => {
      // Remove the canvas from the DOM
      if (containerRef.current && rendererRef.current && containerRef.current.contains(rendererRef.current.domElement)) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      // Dispose of Three.js resources
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      window.removeEventListener('resize', handleResize);
      
      // Clean up the scene
      if (sceneRef.current) {
        // Clear all objects from the scene
        while (sceneRef.current.children.length > 0) {
          const object = sceneRef.current.children[0];
          sceneRef.current.remove(object);
        }
      }
    };
  }, [containerRef, isInteractive]);
  
  // Handle point cloud creation and updates
  useEffect(() => {
    if (!sceneRef.current || !points || !rendererRef.current) return;
    
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current || localCameraRef.current;
    if (!camera) return;
    
    // Remove existing point cloud if it exists
    if (pointsMeshRef.current) {
      scene.remove(pointsMeshRef.current);
      pointsMeshRef.current.geometry.dispose();
      (pointsMeshRef.current.material as THREE.Material).dispose();
      pointsMeshRef.current = null;
    }
    
    // Prepare geometry and material for the point cloud
    const geometry = new THREE.BufferGeometry();
    
    // Extract positions and colors from points data
    const positionsArray = new Float32Array(points.length * 3);
    const colorsArray = new Float32Array(points.length * 3);
    const sizesArray = new Float32Array(points.length);
    
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      
      // Set position
      positionsArray[i * 3] = point.position[0];
      positionsArray[i * 3 + 1] = point.position[1];
      positionsArray[i * 3 + 2] = point.position[2];
      
      // Set color
      if (typeof point.color === 'string') {
        const color = new THREE.Color(point.color);
        colorsArray[i * 3] = color.r;
        colorsArray[i * 3 + 1] = color.g;
        colorsArray[i * 3 + 2] = color.b;
      } else if (Array.isArray(point.color)) {
        colorsArray[i * 3] = point.color[0];
        colorsArray[i * 3 + 1] = point.color[1];
        colorsArray[i * 3 + 2] = point.color[2];
      } else {
        colorsArray[i * 3] = 1;
        colorsArray[i * 3 + 1] = 1;
        colorsArray[i * 3 + 2] = 1;
      }
      
      // Set size
      sizesArray[i] = point.size || 1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positionsArray, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizesArray, 1));
    
    // Define the point cloud material
    const material = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      sizeAttenuation: true
    });
    
    // Create the point cloud
    const pointsMesh = new THREE.Points(geometry, material);
    pointsMeshRef.current = pointsMesh;
    scene.add(pointsMesh);
    
    // Initial render
    renderer.render(scene, camera);
    
    // Function to handle visibility based on emotional group
    const updatePointVisibility = () => {
      if (!pointsMeshRef.current || !pointsMeshRef.current.geometry) return;
      
      const positions = pointsMeshRef.current.geometry.attributes.position.array as Float32Array;
      const colors = pointsMeshRef.current.geometry.attributes.color.array as Float32Array;
      const sizes = pointsMeshRef.current.geometry.attributes.size.array as Float32Array;
      
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const isConnected = connectedPoints.some(cp => cp.word === point.word);
        
        let isVisible = true;
        
        // Apply emotional group filter
        if (selectedEmotionalGroup && point.emotionalTone !== selectedEmotionalGroup) {
          isVisible = false;
        }
        
        // Apply focus on word filter
        if (focusOnWord && point.word !== focusOnWord && !isConnected) {
          isVisible = false;
        }
        
        // Hide points if showAllPoints is false and cluster is greater than visibleClusterCount
        if (!showAllPoints && point.cluster && point.cluster > visibleClusterCount) {
          isVisible = false;
        }
        
        // Apply depressed journal reference filter
        if (depressedJournalReference && point.sentiment && point.sentiment > 0) {
          isVisible = false;
        }
        
        // Apply selected point filter
        if (selectedPoint && selectedPoint.word === point.word) {
          isVisible = true;
        }
        
        // Apply comparison point filter
        if (comparisonPoint && comparisonPoint.word === point.word) {
          isVisible = true;
        }
        
        // Apply connected points filter
        if (isConnected) {
          isVisible = true;
        }
        
        // Set visibility by adjusting size and color
        if (isVisible) {
          sizes[i] = point.size || 1;
          if (Array.isArray(point.color)) {
            colors[i * 3] = point.color[0] || 1;
            colors[i * 3 + 1] = point.color[1] || 1;
            colors[i * 3 + 2] = point.color[2] || 1;
          }
        } else {
          sizes[i] = 0;
          colors[i * 3] = 0;
          colors[i * 3 + 1] = 0;
          colors[i * 3 + 2] = 0;
        }
      }
      
      pointsMeshRef.current.geometry.attributes.size.needsUpdate = true;
      pointsMeshRef.current.geometry.attributes.color.needsUpdate = true;
      
      renderer.render(scene, camera);
    };
    
    updatePointVisibility();
    
    // Update point visibility when selectedEmotionalGroup changes
    useEffect(() => {
      updatePointVisibility();
    }, [selectedEmotionalGroup, focusOnWord, visibleClusterCount, showAllPoints, depressedJournalReference, selectedPoint, comparisonPoint, connectedPoints, points]);
    
    // Handle raycasting and hover effects
    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current || !camera || !pointsMeshRef.current) return;
      
      const containerBounds = containerRef.current.getBoundingClientRect();
      
      // Calculate mouse position in normalized device coordinates
      mouseRef.current.x = ((event.clientX - containerBounds.left) / containerBounds.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - containerBounds.top) / containerBounds.height) * 2 + 1;
      
      // Update the raycaster with the mouse position
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      
      // Calculate objects intersecting the raycaster
      const intersects = raycasterRef.current.intersectObject(pointsMeshRef.current);
      
      if (intersects.length > 0) {
        const index = intersects[0].index;
        
        if (index !== hoveredIndex) {
          setHoveredIndex(index);
          onPointHover(points[index]);
        }
      } else {
        setHoveredIndex(null);
        onPointHover(null);
      }
    };
    
    // Handle point selection on click
    const handlePointClick = (event: MouseEvent) => {
      if (!containerRef.current || !camera || !pointsMeshRef.current) return;
      
      event.preventDefault();
      
      const containerBounds = containerRef.current.getBoundingClientRect();
      
      // Calculate mouse position in normalized device coordinates
      mouseRef.current.x = ((event.clientX - containerBounds.left) / containerBounds.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - containerBounds.top) / containerBounds.height) * 2 + 1;
      
      // Update the raycaster with the mouse position
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      
      // Calculate objects intersecting the raycaster
      const intersects = raycasterRef.current.intersectObject(pointsMeshRef.current);
      
      if (intersects.length > 0) {
        const index = intersects[0].index;
        setSelectedIndex(index);
        onPointSelect(points[index]);
      } else {
        setSelectedIndex(null);
        onPointSelect(null);
      }
    };
    
    // Add event listeners for mouse interaction
    if (isInteractive && containerRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
      containerRef.current.addEventListener('click', handlePointClick);
    }
    
    // Clean up event listeners
    return () => {
      if (isInteractive && containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('click', handlePointClick);
      }
    };
  }, [points, containerRef, isInteractive, onPointHover, onPointSelect, selectedEmotionalGroup, focusOnWord, visibleClusterCount, showAllPoints, depressedJournalReference, selectedPoint, comparisonPoint, connectedPoints]);

  return (
    <div className="absolute inset-0">
      {/* Container managed by Three.js */}
      {/* We don't need to put anything here as the canvas is appended in useEffect */}
    </div>
  );
};

export default EmbeddingScene;
