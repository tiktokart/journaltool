import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Point } from '@/types/embedding';
import { getEmotionColor } from '@/utils/embeddingUtils';
import { useLanguage } from '@/contexts/LanguageContext';

interface EmbeddingSceneProps {
  containerRef: React.RefObject<HTMLDivElement>;
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>;
  controlsRef: React.RefObject<OrbitControls | null>;
  points: Point[];
  onPointHover?: (point: Point | null, position?: { x: number; y: number } | null) => void;
  onPointSelect?: (point: Point | null) => void;
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
  selectedEmotionalGroup = null,
  onResetView,
  visibleClusterCount = 8,
  showAllPoints = true
}: EmbeddingSceneProps) => {
  const { t } = useLanguage();
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pointsRef = useRef<THREE.Mesh[]>([]);
  const labelsRef = useRef<THREE.Sprite[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [emotionalGroups, setEmotionalGroups] = useState<Map<string, THREE.Group>>(new Map());
  const [emotionalGroupsVisible, setEmotionalGroupsVisible] = useState<Map<string, boolean>>(new Map());
  
  // Initialize the scene
  useEffect(() => {
    if (!containerRef.current || isInitialized) return;
    
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 30;
    if (cameraRef.current !== null) {
      // Instead of directly assigning, we update the current camera's properties
      cameraRef.current = camera;
    }
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);
    
    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.minDistance = 5;
    controls.maxDistance = 100;
    if (controlsRef.current !== null) {
      // Instead of directly assigning, we update the ref
      controlsRef.current = controls;
    }
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      if (controls) {
        controls.update();
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    setIsInitialized(true);
    
    // Expose reset view function to window
    if (!window.documentEmbeddingActions) {
      window.documentEmbeddingActions = {};
    }
    
    window.documentEmbeddingActions.resetView = () => {
      resetZoom(camera, controls);
      if (onResetView) {
        onResetView();
      }
    };
    
    window.documentEmbeddingActions.focusOnEmotionalGroup = (emotionalTone: string) => {
      // Hide all groups except the selected one
      emotionalGroups.forEach((group, tone) => {
        group.visible = tone === emotionalTone;
        emotionalGroupsVisible.set(tone, tone === emotionalTone);
      });
      
      setEmotionalGroupsVisible(new Map(emotionalGroupsVisible));
    };
    
    window.documentEmbeddingActions.resetEmotionalGroupFilter = () => {
      // Show all groups
      emotionalGroups.forEach((group, tone) => {
        group.visible = true;
        emotionalGroupsVisible.set(tone, true);
      });
      
      setEmotionalGroupsVisible(new Map(emotionalGroupsVisible));
    };
    
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (renderer && container) {
        container.removeChild(renderer.domElement);
      }
      
      // Clean up controls
      if (controls) {
        controls.dispose();
      }
      
      // Clean up scene
      if (scene) {
        scene.clear();
      }
    };
  }, [containerRef, isInitialized, onResetView]);
  
  // Update points when they change
  useEffect(() => {
    if (!sceneRef.current || !isInitialized || points.length === 0) return;
    
    const scene = sceneRef.current;
    
    // Clear existing points
    pointsRef.current.forEach(point => {
      scene.remove(point);
    });
    
    labelsRef.current.forEach(label => {
      scene.remove(label);
    });
    
    pointsRef.current = [];
    labelsRef.current = [];
    
    // Clear existing emotional groups
    emotionalGroups.forEach(group => {
      scene.remove(group);
    });
    
    const newEmotionalGroups = new Map<string, THREE.Group>();
    const newEmotionalGroupsVisible = new Map<string, boolean>();
    
    // Create a map of emotional tones to groups
    points.forEach(point => {
      const emotionalTone = point.emotionalTone || "Neutral";
      
      if (!newEmotionalGroups.has(emotionalTone)) {
        const group = new THREE.Group();
        group.name = `emotional-group-${emotionalTone}`;
        scene.add(group);
        newEmotionalGroups.set(emotionalTone, group);
        newEmotionalGroupsVisible.set(emotionalTone, true);
      }
    });
    
    setEmotionalGroups(newEmotionalGroups);
    setEmotionalGroupsVisible(newEmotionalGroupsVisible);
    
    // Create a sphere geometry for all points
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    
    // Create points
    points.forEach((point, index) => {
      const emotionalTone = point.emotionalTone || "Neutral";
      const group = newEmotionalGroups.get(emotionalTone);
      
      if (!group) return;
      
      // Determine color based on emotional tone or RGB values
      let color;
      if (point.emotionalTone) {
        color = new THREE.Color(getEmotionColor(point.emotionalTone));
      } else if (point.color) {
        color = new THREE.Color(
          point.color[0],
          point.color[1],
          point.color[2]
        );
      } else {
        color = new THREE.Color(0x3498db); // Default blue
      }
      
      // Create material
      const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.7,
        metalness: 0.2,
        transparent: true,
        opacity: 0.8
      });
      
      // Create sphere
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(
        point.position[0] * 20,
        point.position[1] * 20,
        point.position[2] * 20
      );
      
      sphere.userData = { pointId: point.id, pointIndex: index };
      
      // Add to group
      group.add(sphere);
      pointsRef.current.push(sphere);
      
      // Create label for the point
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = 256;
        canvas.height = 128;
        
        context.fillStyle = 'rgba(255, 255, 255, 0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.font = 'Bold 24px Arial';
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.fillText(point.word, canvas.width / 2, canvas.height / 2);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        
        sprite.position.set(
          point.position[0] * 20,
          point.position[1] * 20 + 1.2,
          point.position[2] * 20
        );
        
        sprite.scale.set(5, 2.5, 1);
        sprite.visible = false; // Hide by default
        
        group.add(sprite);
        labelsRef.current.push(sprite);
      }
      
      // Add event listeners if interactive
      if (isInteractive) {
        // Add a function to pass both point and position to the hover handler
        const handlePointMouseOver = (point: Point, event: MouseEvent) => {
          const position = {
            x: event.clientX,
            y: event.clientY
          };
          
          if (onPointHover) onPointHover(point, position);
        };
        
        // Add event listeners to the sphere
        sphere.addEventListener('mouseover', (event) => {
          handlePointMouseOver(point, event.data.originalEvent);
          
          // Show label
          if (labelsRef.current[index]) {
            labelsRef.current[index].visible = true;
          }
          
          // Highlight sphere
          const material = sphere.material as THREE.MeshStandardMaterial;
          material.emissive.set(0xffff00);
          material.emissiveIntensity = 0.5;
        });
        
        sphere.addEventListener('mouseout', () => {
          if (onPointHover) onPointHover(null);
          
          // Hide label
          if (labelsRef.current[index]) {
            labelsRef.current[index].visible = false;
          }
          
          // Remove highlight
          const material = sphere.material as THREE.MeshStandardMaterial;
          material.emissive.set(0x000000);
          material.emissiveIntensity = 0;
        });
        
        sphere.addEventListener('click', () => {
          if (onPointSelect) onPointSelect(point);
        });
      }
    });
    
    // Apply emotional group filter if one is selected
    if (selectedEmotionalGroup) {
      newEmotionalGroups.forEach((group, tone) => {
        group.visible = tone === selectedEmotionalGroup;
        newEmotionalGroupsVisible.set(tone, tone === selectedEmotionalGroup);
      });
      
      setEmotionalGroupsVisible(newEmotionalGroupsVisible);
    }
    
  }, [points, isInitialized, isInteractive, onPointHover, onPointSelect, selectedEmotionalGroup]);
  
  // Update point appearances based on selection, connection, etc.
  useEffect(() => {
    if (!isInitialized || points.length === 0 || pointsRef.current.length === 0) return;
    
    // Reset all points to default appearance
    pointsRef.current.forEach((sphere, index) => {
      const pointData = points[sphere.userData.pointIndex];
      if (!pointData) return;
      
      const material = sphere.material as THREE.MeshStandardMaterial;
      
      // Determine color based on emotional tone or RGB values
      let color;
      if (pointData.emotionalTone) {
        color = new THREE.Color(getEmotionColor(pointData.emotionalTone));
      } else if (pointData.color) {
        color = new THREE.Color(
          pointData.color[0],
          pointData.color[1],
          pointData.color[2]
        );
      } else {
        color = new THREE.Color(0x3498db); // Default blue
      }
      
      material.color.set(color);
      material.opacity = 0.8;
      material.emissive.set(0x000000);
      material.emissiveIntensity = 0;
      
      // Hide label
      if (labelsRef.current[index]) {
        labelsRef.current[index].visible = false;
      }
    });
    
    // Highlight selected point
    if (selectedPoint) {
      const selectedSphere = pointsRef.current.find(
        sphere => points[sphere.userData.pointIndex]?.id === selectedPoint.id
      );
      
      if (selectedSphere) {
        const material = selectedSphere.material as THREE.MeshStandardMaterial;
        material.emissive.set(0xffff00);
        material.emissiveIntensity = 0.8;
        material.opacity = 1.0;
        
        // Show label
        const index = selectedSphere.userData.pointIndex;
        if (labelsRef.current[index]) {
          labelsRef.current[index].visible = true;
        }
      }
    }
    
    // Highlight comparison point
    if (comparisonPoint) {
      const comparisonSphere = pointsRef.current.find(
        sphere => points[sphere.userData.pointIndex]?.id === comparisonPoint.id
      );
      
      if (comparisonSphere) {
        const material = comparisonSphere.material as THREE.MeshStandardMaterial;
        material.emissive.set(0x00ffff);
        material.emissiveIntensity = 0.8;
        material.opacity = 1.0;
        
        // Show label
        const index = comparisonSphere.userData.pointIndex;
        if (labelsRef.current[index]) {
          labelsRef.current[index].visible = true;
        }
      }
    }
    
    // Highlight connected points
    if (connectedPoints && connectedPoints.length > 0) {
      connectedPoints.forEach(connectedPoint => {
        const connectedSphere = pointsRef.current.find(
          sphere => points[sphere.userData.pointIndex]?.id === connectedPoint.id
        );
        
        if (connectedSphere) {
          const material = connectedSphere.material as THREE.MeshStandardMaterial;
          material.emissive.set(0x00ff00);
          material.emissiveIntensity = 0.5;
          material.opacity = 0.9;
          
          // Show label
          const index = connectedSphere.userData.pointIndex;
          if (labelsRef.current[index]) {
            labelsRef.current[index].visible = true;
          }
        }
      });
    }
    
    // Focus on word if specified
    if (focusOnWord) {
      const focusPoint = points.find(p => p.word === focusOnWord);
      if (focusPoint) {
        const focusSphere = pointsRef.current.find(
          sphere => points[sphere.userData.pointIndex]?.id === focusPoint.id
        );
        
        if (focusSphere && cameraRef.current && controlsRef.current) {
          // Animate camera to focus on this point
          const targetPosition = new THREE.Vector3(
            focusPoint.position[0] * 20,
            focusPoint.position[1] * 20,
            focusPoint.position[2] * 20
          );
          
          // Set camera to look at the target
          cameraRef.current.position.set(
            targetPosition.x + 10,
            targetPosition.y + 5,
            targetPosition.z + 15
          );
          
          controlsRef.current.target.copy(targetPosition);
          controlsRef.current.update();
          
          // Highlight the focused point
          const material = focusSphere.material as THREE.MeshStandardMaterial;
          material.emissive.set(0xff00ff);
          material.emissiveIntensity = 0.8;
          material.opacity = 1.0;
          
          // Show label
          const index = focusSphere.userData.pointIndex;
          if (labelsRef.current[index]) {
            labelsRef.current[index].visible = true;
          }
        }
      }
    }
    
    // Apply compare mode visual cue
    if (isCompareMode) {
      pointsRef.current.forEach(sphere => {
        const material = sphere.material as THREE.MeshStandardMaterial;
        material.wireframe = true;
      });
    } else {
      pointsRef.current.forEach(sphere => {
        const material = sphere.material as THREE.MeshStandardMaterial;
        material.wireframe = false;
      });
    }
    
  }, [
    isInitialized, 
    points, 
    selectedPoint, 
    comparisonPoint, 
    connectedPoints, 
    focusOnWord, 
    isCompareMode
  ]);
  
  return null;
};

// Helper functions for camera control
export const zoomIn = (camera: THREE.PerspectiveCamera | null) => {
  if (!camera) return;
  camera.position.multiplyScalar(0.9);
};

export const zoomOut = (camera: THREE.PerspectiveCamera | null) => {
  if (!camera) return;
  camera.position.multiplyScalar(1.1);
};

export const resetZoom = (camera: THREE.PerspectiveCamera | null, controls: OrbitControls | null) => {
  if (!camera || !controls) return;
  
  camera.position.set(0, 0, 30);
  camera.lookAt(0, 0, 0);
  controls.target.set(0, 0, 0);
  controls.update();
};

export default EmbeddingScene;
