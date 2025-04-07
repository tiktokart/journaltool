import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Point } from '../../types/embedding';

interface EmbeddingSceneProps {
  containerRef: React.RefObject<HTMLDivElement>;
  cameraRef?: React.RefObject<THREE.PerspectiveCamera | null>;
  points: Point[];
  onPointHover: (point: Point | null) => void;
  onPointSelect: (point: Point | null) => void;
  isInteractive: boolean;
  depressedJournalReference?: boolean;
  focusOnWord?: string | null;
  connectedPoints?: Point[];
}

export const EmbeddingScene = ({ 
  containerRef, 
  cameraRef,
  points, 
  onPointHover, 
  onPointSelect, 
  isInteractive,
  depressedJournalReference = false,
  focusOnWord = null,
  connectedPoints = []
}: EmbeddingSceneProps) => {
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const internalCameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const linesRef = useRef<THREE.LineSegments | null>(null);
  const highlightLinesRef = useRef<THREE.LineSegments | null>(null);
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
    
    if (highlightLinesRef.current) {
      sceneRef.current.remove(highlightLinesRef.current);
      if (highlightLinesRef.current.geometry) {
        highlightLinesRef.current.geometry.dispose();
      }
      if (highlightLinesRef.current.material) {
        (highlightLinesRef.current.material as THREE.Material).dispose();
      }
      highlightLinesRef.current = null;
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
  
  const updateHighlightLines = (focusPoint: Point | null, connectedPoints: Point[]) => {
    if (!sceneRef.current || !focusPoint) return;
    
    if (highlightLinesRef.current) {
      sceneRef.current.remove(highlightLinesRef.current);
      if (highlightLinesRef.current.geometry) {
        highlightLinesRef.current.geometry.dispose();
      }
      if (highlightLinesRef.current.material) {
        (highlightLinesRef.current.material as THREE.Material).dispose();
      }
      highlightLinesRef.current = null;
    }
    
    if (connectedPoints.length === 0) return;
    
    const linePositions: number[] = [];
    const lineColors: number[] = [];
    
    const focusPos = new THREE.Vector3(
      focusPoint.position[0],
      focusPoint.position[1],
      focusPoint.position[2]
    );
    
    connectedPoints.forEach(targetPoint => {
      const targetPos = new THREE.Vector3(
        targetPoint.position[0],
        targetPoint.position[1],
        targetPoint.position[2]
      );
      
      linePositions.push(
        focusPos.x, focusPos.y, focusPos.z,
        targetPos.x, targetPos.y, targetPos.z
      );
      
      lineColors.push(
        focusPoint.color[0], focusPoint.color[1], focusPoint.color[2],
        targetPoint.color[0], targetPoint.color[1], targetPoint.color[2]
      );
    });
    
    if (linePositions.length > 0) {
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
      
      const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        linewidth: 2,
        depthWrite: false
      });
      
      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      sceneRef.current.add(lines);
      highlightLinesRef.current = lines;
    }
  };
  
  const checkIntersection = () => {
    if (!raycasterRef.current || !mouseRef.current || !internalCameraRef.current || !pointsRef.current || !sceneRef.current) return;
    
    raycasterRef.current.setFromCamera(mouseRef.current, internalCameraRef.current);
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
          
          if (point.relationships && point.relationships.length > 0) {
            const sortedRelationships = [...point.relationships].sort((a, b) => b.strength - a.strength);
            const topConnections = sortedRelationships.slice(0, 3);
            
            topConnections.forEach(rel => {
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
    if (!pointsRef.current || !internalCameraRef.current || !controlsRef.current) return;
    
    const pointsData = pointsRef.current.userData?.pointsData as Point[];
    if (!pointsData) return;
    
    const targetPoint = pointsData.find(p => p.word === wordToFocus);
    if (!targetPoint) return;
    
    if (pointsRef.current.geometry.attributes.size && targetPoint.relationships && targetPoint.relationships.length > 0) {
      const sizesAttribute = pointsRef.current.geometry.attributes.size;
      const sizesArray = sizesAttribute.array as Float32Array;
      
      for (let i = 0; i < sizesArray.length; i++) {
        sizesArray[i] = 0.05;
      }
      
      const targetIndex = pointsData.findIndex(p => p.word === wordToFocus);
      if (targetIndex !== -1) {
        sizesArray[targetIndex] = 0.15;
      }
      
      const sortedRelationships = [...targetPoint.relationships].sort((a, b) => b.strength - a.strength);
      const topConnections = sortedRelationships.slice(0, 3);
      
      topConnections.forEach(rel => {
        const relatedIndex = pointsData.findIndex(p => p.id === rel.id);
        if (relatedIndex !== -1) {
          sizesArray[relatedIndex] = 0.1;
        }
      });
      
      sizesAttribute.needsUpdate = true;
    }
    
    const targetPosition = new THREE.Vector3(
      targetPoint.position[0],
      targetPoint.position[1],
      targetPoint.position[2]
    );
    
    const distance = 5;
    const offsetPosition = targetPosition.clone().add(new THREE.Vector3(0, 0, distance));
    
    const startPosition = internalCameraRef.current.position.clone();
    const startTarget = controlsRef.current.target.clone();
    const endTarget = targetPosition.clone();
    
    const duration = 1000;
    const startTime = Date.now();
    
    const animateCamera = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      internalCameraRef.current!.position.lerpVectors(startPosition, offsetPosition, easeProgress);
      
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
    internalCameraRef.current = camera;
    if (cameraRef) {
      cameraRef.current = camera;
    }
    
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
      
      if (rendererRef.current && sceneRef.current && internalCameraRef.current) {
        rendererRef.current.render(sceneRef.current, internalCameraRef.current);
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
        
        if (highlightLinesRef.current) {
          sceneRef.current.remove(highlightLinesRef.current);
          if (highlightLinesRef.current.geometry) highlightLinesRef.current.geometry.dispose();
          if (highlightLinesRef.current.material) (highlightLinesRef.current.material as THREE.Material).dispose();
        }
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [points, cameraRef]);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const handleResize = () => {
      if (!containerRef.current || !internalCameraRef.current || !rendererRef.current) return;
      
      internalCameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      internalCameraRef.current.updateProjectionMatrix();
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
      if (!isInteractive || !raycasterRef.current || !internalCameraRef.current || !pointsRef.current) return;
      
      raycasterRef.current.setFromCamera(mouseRef.current, internalCameraRef.current);
      const intersects = raycasterRef.current.intersectObject(pointsRef.current);
      
      if (intersects.length > 0 && pointsRef.current.userData?.pointsData) {
        const index = intersects[0].index;
        if (index !== undefined) {
          const point = pointsRef.current.userData.pointsData[index];
          onPointSelect(point);
          
          focusOnPoint(point.word);
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
    if (focusOnWord && pointsRef.current && pointsRef.current.userData?.pointsData) {
      const pointsData = pointsRef.current.userData.pointsData as Point[];
      const focusPoint = pointsData.find(p => p.word === focusOnWord);
      
      if (focusPoint) {
        updateHighlightLines(focusPoint, connectedPoints);
        
        if (pointsRef.current.geometry.attributes.size) {
          const sizesAttribute = pointsRef.current.geometry.attributes.size;
          const sizesArray = sizesAttribute.array as Float32Array;
          
          for (let i = 0; i < sizesArray.length; i++) {
            sizesArray[i] = 0.05;
          }
          
          const focusIndex = pointsData.findIndex(p => p.word === focusOnWord);
          if (focusIndex !== -1) {
            sizesArray[focusIndex] = 0.15;
          }
          
          connectedPoints.forEach(connectedPoint => {
            const connectedIndex = pointsData.findIndex(p => p.id === connectedPoint.id);
            if (connectedIndex !== -1) {
              sizesArray[connectedIndex] = 0.12;
            }
          });
          
          sizesAttribute.needsUpdate = true;
        }
      }
    }
  }, [focusOnWord, connectedPoints]);
  
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
