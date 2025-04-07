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
  focusOnWord?: string | null;
}

export const EmbeddingScene = ({ 
  containerRef, 
  points, 
  onPointHover, 
  onPointSelect, 
  isInteractive,
  depressedJournalReference = false,
  focusOnWord = null
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
    
    const wordFrequency: Record<string, number> = {};
    pointsData.forEach(point => {
      wordFrequency[point.word] = (wordFrequency[point.word] || 0) + 1;
    });
    
    const frequencies = Object.values(wordFrequency);
    const minFreq = Math.min(...frequencies);
    const maxFreq = Math.max(...frequencies);
    const freqRange = maxFreq - minFreq;
    
    const minSize = 0.03;
    const maxSize = 0.12;
    
    pointsData.forEach((point, i) => {
      positions[i * 3] = point.position[0];
      positions[i * 3 + 1] = point.position[1];
      positions[i * 3 + 2] = point.position[2];
      
      colors[i * 3] = point.color[0];
      colors[i * 3 + 1] = point.color[1];
      colors[i * 3 + 2] = point.color[2];
      
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
    
    const points = new THREE.Points(particlesGeometry, particlesMaterial);
    sceneRef.current.add(points);
    pointsRef.current = points;
    
    points.userData = { pointsData };
    
    createRelationshipLines(pointsData);
  };
  
  const createRelationshipLines = (pointsData: Point[]) => {
    if (!sceneRef.current) return;
    
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
          const targetPoint = pointsData.find((p) => p.id === rel.id);
          if (targetPoint) {
            if (rel.strength > 0.4) {
              const targetPos = new THREE.Vector3(
                targetPoint.position[0],
                targetPoint.position[1],
                targetPoint.position[2]
              );
              
              linePositions.push(
                pointPos.x, pointPos.y, pointPos.z,
                targetPos.x, targetPos.y, targetPos.z
              );
              
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
        
        if (pointsRef.current.geometry.attributes.size) {
          const sizesAttribute = pointsRef.current.geometry.attributes.size;
          const sizesArray = sizesAttribute.array as Float32Array;
          
          for (let i = 0; i < sizesArray.length; i++) {
            sizesArray[i] = 0.05;
          }
          
          sizesArray[index] = 0.15;
          
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
      
      if (pointsRef.current.geometry.attributes.size) {
        const sizesAttribute = pointsRef.current.geometry.attributes.size;
        const sizesArray = sizesAttribute.array as Float32Array;
        for (let i = 0; i < sizesArray.length; i++) {
          sizesArray[i] = 0.05;
        }
        sizesAttribute.needsUpdate = true;
      }
    }
  };
  
  const focusOnPoint = (wordToFocus: string) => {
    if (!pointsRef.current || !cameraRef.current || !controlsRef.current) return;
    
    const pointsData = pointsRef.current.userData?.pointsData as Point[];
    if (!pointsData) return;
    
    const targetPoint = pointsData.find(p => p.word === wordToFocus);
    if (!targetPoint) return;
    
    const targetPosition = new THREE.Vector3(
      targetPoint.position[0],
      targetPoint.position[1],
      targetPoint.position[2]
    );
    
    const distance = 5;
    const offsetPosition = targetPosition.clone().add(new THREE.Vector3(0, 0, distance));
    
    const startPosition = cameraRef.current.position.clone();
    const startTarget = controlsRef.current.target.clone();
    const endTarget = targetPosition.clone();
    
    const duration = 1000;
    const startTime = Date.now();
    
    const animateCamera = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      cameraRef.current!.position.lerpVectors(startPosition, offsetPosition, easeProgress);
      
      const newTarget = new THREE.Vector3();
      newTarget.lerpVectors(startTarget, endTarget, easeProgress);
      controlsRef.current!.target.copy(newTarget);
      controlsRef.current!.update();
      
      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      }
    };
    
    animateCamera();
  };
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFFFF);
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 20;
    cameraRef.current = camera;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.5;
    controls.screenSpacePanning = false;
    controls.maxDistance = 30;
    controls.minDistance = 5;
    controlsRef.current = controls;
    
    createPointCloud(points);
    
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();
    
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
  
  useEffect(() => {
    if (!containerRef.current || !isInteractive) return;
    
    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      
      mouseRef.current.x = ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;
      
      checkIntersection();
    };
    
    const handleClick = () => {
      if (!isInteractive || !raycasterRef.current || !cameraRef.current || !pointsRef.current) return;
      
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObject(pointsRef.current);
      
      if (intersects.length > 0 && pointsRef.current.userData?.pointsData) {
        const index = intersects[0].index;
        if (index !== undefined) {
          const point = pointsRef.current.userData.pointsData[index];
          onPointSelect(point);
        }
      }
    };
    
    containerRef.current.addEventListener('mousemove', handleMouseMove);
    containerRef.current.addEventListener('click', handleClick);
    
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('click', handleClick);
      }
    };
  }, [isInteractive, onPointHover, onPointSelect]);
  
  useEffect(() => {
    if (focusOnWord && pointsRef.current) {
      focusOnPoint(focusOnWord);
    }
  }, [focusOnWord]);
  
  useEffect(() => {
    if (cameraRef.current) {
      // Assignment to make the ref accessible to zoom controls
    }
  }, [cameraRef.current]);
  
  return null;
};

export const zoomIn = (camera: THREE.PerspectiveCamera | null) => {
  if (camera) {
    camera.position.z *= 0.95;
  }
};

export const zoomOut = (camera: THREE.PerspectiveCamera | null) => {
  if (camera) {
    camera.position.z *= 1.05;
    if (camera.position.z > 30) {
      camera.position.z = 30;
    }
  }
};
