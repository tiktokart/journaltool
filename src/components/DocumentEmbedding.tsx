
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ZoomIn, ZoomOut, CircleDot } from "lucide-react";

interface Point {
  id: string;
  text: string;
  sentiment: number;
  position: [number, number, number];
  color: [number, number, number];
  keywords?: string[];
  emotionalTone?: string;
  relationships?: Array<{ id: string; strength: number; word?: string }>;
}

interface DocumentEmbeddingProps {
  points?: Point[];
  onPointClick?: (point: Point) => void;
  isInteractive?: boolean;
}

export const DocumentEmbedding = ({ 
  points = [], 
  onPointClick, 
  isInteractive = true 
}: DocumentEmbeddingProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  
  // Generate mock points if none are provided
  const getPoints = () => {
    if (points.length > 0) return points;
    
    // Generate mock points
    const mockPoints: Point[] = [];
    const particleCount = 5000;
    
    const emotionalTones = [
      "Joy", "Sadness", "Anger", "Fear", "Surprise", "Disgust", "Trust", "Anticipation"
    ];
    
    const commonKeywords = [
      "life", "feel", "time", "experience", "emotions", "thoughts", "mind", "people",
      "understand", "journey", "reflection", "growth", "challenge", "struggle", "hope",
      "frustration", "happiness", "anxiety", "motivation", "future", "past", "present"
    ];
    
    for (let i = 0; i < particleCount; i++) {
      // Generate points in a 3D gaussian distribution
      const radius = 10 * Math.pow(Math.random(), 1/3);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      // Color based on position (sentiment score)
      const distanceFromCenter = Math.sqrt(x*x + y*y + z*z) / 10;
      const sentiment = 1 - distanceFromCenter;
      
      // Generate color based on sentiment (red to blue gradient)
      const r = sentiment < 0.5 ? 1 : 2 * (1 - sentiment);
      const b = sentiment > 0.5 ? 1 : 2 * sentiment;
      const g = 0.3;
      
      // Generate random keywords
      const keywordCount = 2 + Math.floor(Math.random() * 4);
      const keywords = [];
      for (let k = 0; k < keywordCount; k++) {
        keywords.push(commonKeywords[Math.floor(Math.random() * commonKeywords.length)]);
      }
      
      mockPoints.push({
        id: `point-${i}`,
        text: `Sample text ${i}`,
        sentiment: sentiment,
        position: [x, y, z],
        color: [r, g, b],
        keywords: keywords,
        emotionalTone: emotionalTones[Math.floor(Math.random() * emotionalTones.length)],
        relationships: []
      });
    }
    
    // Add some relationships
    for (let i = 0; i < 20; i++) {
      const pointIndex = Math.floor(Math.random() * mockPoints.length);
      const relatedPoints = 2 + Math.floor(Math.random() * 3);
      
      const relationships = [];
      for (let j = 0; j < relatedPoints; j++) {
        let relatedIndex;
        do {
          relatedIndex = Math.floor(Math.random() * mockPoints.length);
        } while (relatedIndex === pointIndex);
        
        relationships.push({
          id: mockPoints[relatedIndex].id,
          strength: 0.3 + Math.random() * 0.7,
          word: commonKeywords[Math.floor(Math.random() * commonKeywords.length)]
        });
      }
      
      mockPoints[pointIndex].relationships = relationships;
    }
    
    return mockPoints;
  };
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8A898C); // Mid-gray background
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
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.maxDistance = 30;
    controls.minDistance = 5;
    controlsRef.current = controls;
    
    // Create particles
    createPointCloud(getPoints());
    
    // Animation function
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    // Setup mouse events for interactivity
    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current || !isInteractive) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calculate mouse position in normalized device coordinates (-1 to +1)
      mouseRef.current.x = ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 + 1;
      
      checkIntersection();
    };
    
    const handleClick = () => {
      if (!isInteractive || !hoveredPoint) return;
      
      setSelectedPoint(hoveredPoint);
      if (onPointClick) {
        onPointClick(hoveredPoint);
      }
    };
    
    window.addEventListener('resize', handleResize);
    if (isInteractive) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('click', handleClick);
    }
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (sceneRef.current && pointsRef.current) {
        sceneRef.current.remove(pointsRef.current);
      }
      
      if (pointsRef.current && pointsRef.current.geometry) {
        pointsRef.current.geometry.dispose();
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [points, onPointClick, isInteractive]);
  
  const createPointCloud = (pointsData: Point[]) => {
    if (!sceneRef.current) return;
    
    // Remove old points
    if (pointsRef.current) {
      sceneRef.current.remove(pointsRef.current);
      if (pointsRef.current.geometry) {
        pointsRef.current.geometry.dispose();
      }
      if (pointsRef.current.material) {
        (pointsRef.current.material as THREE.Material).dispose();
      }
    }
    
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(pointsData.length * 3);
    const colors = new Float32Array(pointsData.length * 3);
    const sizes = new Float32Array(pointsData.length);
    
    const defaultSize = 0.05;
    const highlightedSize = 0.15;
    
    // Fill the arrays
    pointsData.forEach((point, i) => {
      positions[i * 3] = point.position[0];
      positions[i * 3 + 1] = point.position[1];
      positions[i * 3 + 2] = point.position[2];
      
      colors[i * 3] = point.color[0];
      colors[i * 3 + 1] = point.color[1];
      colors[i * 3 + 2] = point.color[2];
      
      sizes[i] = defaultSize;
    });
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: defaultSize,
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
  };
  
  const checkIntersection = () => {
    if (!raycasterRef.current || !mouseRef.current || !cameraRef.current || !pointsRef.current || !sceneRef.current) return;
    
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObject(pointsRef.current);
    
    if (intersects.length > 0 && pointsRef.current.userData?.pointsData) {
      const index = intersects[0].index;
      if (index !== undefined) {
        const point = pointsRef.current.userData.pointsData[index];
        setHoveredPoint(point);
        
        // Highlight the point
        if (pointsRef.current.geometry.attributes.size) {
          const sizesAttribute = pointsRef.current.geometry.attributes.size;
          const sizesArray = sizesAttribute.array as Float32Array;
          
          // Reset all sizes
          for (let i = 0; i < sizesArray.length; i++) {
            sizesArray[i] = 0.05;
          }
          
          // Highlight the hovered point
          sizesArray[index] = 0.15;
          
          // Highlight related points if any
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
      setHoveredPoint(null);
      
      // Reset all point sizes
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
  
  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z *= 0.9;
    }
  };
  
  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.z *= 1.1;
      if (cameraRef.current.position.z > 30) {
        cameraRef.current.position.z = 30;
      }
    }
  };
  
  const getSentimentLabel = (score: number) => {
    if (score >= 0.7) return "Very Positive";
    if (score >= 0.5) return "Positive";
    if (score >= 0.4) return "Neutral";
    if (score >= 0.25) return "Negative";
    return "Very Negative";
  };
  
  return (
    <div className="relative w-full h-full">
      <div 
        ref={containerRef} 
        className="w-full h-full rounded-lg overflow-hidden"
      />
      
      {isInteractive && (
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      
      {hoveredPoint && (
        <div className="absolute bottom-4 left-4 bg-card p-3 rounded-lg shadow-md max-w-xs">
          <div className="flex items-center mb-2">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ 
                backgroundColor: `rgb(${hoveredPoint.color[0] * 255}, ${hoveredPoint.color[1] * 255}, ${hoveredPoint.color[2] * 255})` 
              }} 
            />
            <span className="font-medium">Text Excerpt</span>
          </div>
          <p className="text-sm mb-2 truncate">{hoveredPoint.text}</p>
          
          {hoveredPoint.keywords && (
            <div className="mb-2">
              <span className="text-xs font-medium block mb-1">Keywords:</span>
              <div className="flex flex-wrap gap-1">
                {hoveredPoint.keywords.map((keyword, idx) => (
                  <span key={idx} className="text-xs bg-accent px-1.5 py-0.5 rounded-full">{keyword}</span>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-xs flex justify-between mb-2">
            <span>Sentiment: {getSentimentLabel(hoveredPoint.sentiment)}</span>
            {hoveredPoint.emotionalTone && (
              <span>Emotional Tone: {hoveredPoint.emotionalTone}</span>
            )}
          </div>
          
          {hoveredPoint.relationships && hoveredPoint.relationships.length > 0 && (
            <div className="mt-2">
              <span className="text-xs font-medium block mb-1">Connected words:</span>
              <div className="grid grid-cols-2 gap-1">
                {hoveredPoint.relationships.map((rel, idx) => (
                  <div key={idx} className="text-xs flex items-center">
                    <div className="w-1 h-1 rounded-full bg-primary mr-1"></div>
                    <span>{rel.word || `Connection ${idx + 1}`}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
