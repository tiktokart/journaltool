
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Point } from '../../types/embedding';

interface EmbeddingSceneProps {
  containerRef: React.RefObject<HTMLDivElement>;
  points: Point[];
  onPointHover: (point: Point | null) => void;
  onPointSelect: (point: Point | null) => void;
  isInteractive: boolean;
  depressedJournalReference?: boolean;
}

export const EmbeddingScene = ({ 
  containerRef, 
  points, 
  onPointHover, 
  onPointSelect, 
  isInteractive,
  depressedJournalReference = false
}: EmbeddingSceneProps) => {
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const linesRef = useRef<THREE.LineSegments | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const animationFrameRef = useRef<number | null>(null);
  
  const createPointCloud = (pointsData: Point[]) => {
    if (!sceneRef.current) return;
    
    // Remove old points and lines
    if (pointsRef.current) {
      sceneRef.current.remove(pointsRef.current);
      if (pointsRef.current.geometry) {
        pointsRef.current.geometry.dispose();
      }
      if (pointsRef.current.material) {
        (pointsRef.current.material as THREE.Material).dispose();
      }
    }
    
    if (linesRef.current) {
      sceneRef.current.remove(linesRef.current);
      if (linesRef.current.geometry) {
        linesRef.current.geometry.dispose();
      }
      if (linesRef.current.material) {
        (linesRef.current.material as THREE.Material).dispose();
      }
      linesRef.current = null;
    }
    
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(pointsData.length * 3);
    const colors = new Float32Array(pointsData.length * 3);
    const sizes = new Float32Array(pointsData.length);
    
    // Determine frequency of words for size calculation
    const wordFrequency: Record<string, number> = {};
    pointsData.forEach(point => {
      wordFrequency[point.word] = (wordFrequency[point.word] || 0) + 1;
    });
    
    // Calculate min and max frequency for normalization
    const frequencies = Object.values(wordFrequency);
    const minFreq = Math.min(...frequencies);
    const maxFreq = Math.max(...frequencies);
    const freqRange = maxFreq - minFreq;
    
    // Size range
    const minSize = 0.03;
    const maxSize = 0.12;
    
    // Fill the arrays
    pointsData.forEach((point, i) => {
      positions[i * 3] = point.position[0];
      positions[i * 3 + 1] = point.position[1];
      positions[i * 3 + 2] = point.position[2];
      
      colors[i * 3] = point.color[0];
      colors[i * 3 + 1] = point.color[1];
      colors[i * 3 + 2] = point.color[2];
      
      // Calculate size based on frequency
      const frequency = wordFrequency[point.word] || 1;
      const normalizedFreq = freqRange > 0 
        ? (frequency - minFreq) / freqRange 
        : 0.5;
        
      sizes[i] = minSize + normalizedFreq * (maxSize - minSize);
    });
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });
    
    // Create points
    const points = new THREE.Points(particlesGeometry, particlesMaterial);
    sceneRef.current.add(points);
    pointsRef.current = points;
    
    // Store point data for raycasting
    points.userData = { pointsData };
    
    // Create lines between related points
    createRelationshipLines(pointsData);
  };
  
  const createRelationshipLines = (pointsData: Point[]) => {
    if (!sceneRef.current) return;
    
    // Collect line positions from relationships
    const linePositions: number[] = [];
    const lineColors: number[] = [];
    
    pointsData.forEach((point) => {
      if (point.relationships && point.relationships.length > 0) {
        const pointPos = new THREE.Vector3(
          point.position[0],
          point.position[1],
          point.position[2]
        );
        
        point.relationships.forEach((rel) => {
          // Find the target point
          const targetPoint = pointsData.find((p) => p.id === rel.id);
          if (targetPoint) {
            // Only draw lines where the relationships are strong enough
            if (rel.strength > 0.4) {
              const targetPos = new THREE.Vector3(
                targetPoint.position[0],
                targetPoint.position[1],
                targetPoint.position[2]
              );
              
              // Add line vertices
              linePositions.push(
                pointPos.x, pointPos.y, pointPos.z,
                targetPos.x, targetPos.y, targetPos.z
              );
              
              // Add line colors - use a blend of both point colors
              lineColors.push(
                point.color[0], point.color[1], point.color[2], 
                targetPoint.color[0], targetPoint.color[1], targetPoint.color[2]
              );
            }
          }
        });
      }
    });
    
    if (linePositions.length > 0) {
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
      
      const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.25,
        depthWrite: false
      });
      
      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      sceneRef.current.add(lines);
      linesRef.current = lines;
    }
  };
  
  const checkIntersection = () => {
    if (!raycasterRef.current || !mouseRef.current || !cameraRef.current || !pointsRef.current || !sceneRef.current) return;
    
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObject(pointsRef.current);
    
    if (intersects.length > 0 && pointsRef.current.userData?.pointsData) {
      const index = intersects[0].index;
      if (index !== undefined) {
        const point = pointsRef.current.userData.pointsData[index];
        onPointHover(point);
        
        // Highlight the point
        if (pointsRef.current.geometry.attributes.size) {
          const sizesAttribute = pointsRef.current.geometry.attributes.size;
          const sizesArray = sizesAttribute.array as Float32Array;
          
          // Reset all sizes
          for (let i = 0; i < sizesArray.length; i++) {
            sizesArray[i] = 0.05;
          }
          
          // Highlight the hovered point - more gradual transition
          sizesArray[index] = 0.15;
          
          // Highlight related points if any - more gradual transition
          if (point.relationships) {
            point.relationships.forEach(rel => {
              const relatedIndex = pointsRef.current!.userData.pointsData.findIndex((p: Point) => p.id === rel.id);
              if (relatedIndex !== -1) {
                sizesArray[relatedIndex] = 0.1;
              }
            });
          }
          
          sizesAttribute.needsUpdate = true;
        }
      }
    } else {
      onPointHover(null);
      
      // Reset all point sizes more gradually
      if (pointsRef.current.geometry.attributes.size) {
        const sizesAttribute = pointsRef.current.geometry.attributes.size;
        const sizesArray = sizesAttribute.array as Float32Array;
        for (let i = 0; i < sizesArray.length; i++) {
          // Gradually reduce size rather than immediately setting to 0.05
          sizesArray[i] = Math.max(0.05, sizesArray[i] * 0.95);
        }
        sizesAttribute.needsUpdate = true;
      }
    }
  };
  
  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFFFF); // White background
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 20;
    cameraRef.current = camera;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08; // Increased damping for smoother rotation
    controls.rotateSpeed = 0.5; // Slower rotation speed
    controls.screenSpacePanning = false;
    controls.maxDistance = 30;
    controls.minDistance = 5;
    controlsRef.current = controls;
    
    // Create particles
    createPointCloud(points);
    
    // Animation function
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (sceneRef.current) {
        if (pointsRef.current) {
          sceneRef.current.remove(pointsRef.current);
          if (pointsRef.current.geometry) pointsRef.current.geometry.dispose();
          if (pointsRef.current.material) (pointsRef.current.material as THREE.Material).dispose();
        }
        
        if (linesRef.current) {
          sceneRef.current.remove(linesRef.current);
          if (linesRef.current.geometry) linesRef.current.geometry.dispose();
          if (linesRef.current.material) (linesRef.current.material as THREE.Material).dispose();
        }
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [points]);
  
  // Handle window resize
  useEffect(() => {
    if (!containerRef.current) return;
    
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Setup mouse events for interactivity
  useEffect(() => {
    if (!containerRef.current || !isInteractive) return;
    
    const handleMouseMove = (event: MouseEvent) => {
      const rect = containerRef.current!.getBoundingClientRect();
      
      // Calculate mouse position in normalized device coordinates (-1 to +1)
      mouseRef.current.x = ((event.clientX - rect.left) / containerRef.current!.clientWidth) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / containerRef.current!.clientHeight) * 2 + 1;
      
      checkIntersection();
    };
    
    const handleClick = () => {
      if (!isInteractive) return;
      
      // This will be called after mousemove has already set the hover state
      // So the currently hovered point will be the one that gets clicked
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current!);
      const intersects = raycasterRef.current.intersectObject(pointsRef.current!);
      
      if (intersects.length > 0 && pointsRef.current?.userData?.pointsData) {
        const index = intersects[0].index;
        if (index !== undefined) {
          const point = pointsRef.current.userData.pointsData[index];
          onPointSelect(point);
        }
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [isInteractive, onPointHover, onPointSelect]);

  // Update zoom methods for parent component
  useEffect(() => {
    // This effect is empty as we're just exposing the camera reference
    // The actual zoom methods are handled in the parent component
  }, []);

  return null; // This is a non-rendering component that manages the Three.js scene
};

// Export a function to zoom in with smoother transition
export const zoomIn = (camera: THREE.PerspectiveCamera | null) => {
  if (camera) {
    // More gradual zoom for smoother effect
    camera.position.z *= 0.95;
  }
};

// Export a function to zoom out with smoother transition
export const zoomOut = (camera: THREE.PerspectiveCamera | null) => {
  if (camera) {
    // More gradual zoom for smoother effect
    camera.position.z *= 1.05;
    if (camera.position.z > 30) {
      camera.position.z = 30;
    }
  }
};
