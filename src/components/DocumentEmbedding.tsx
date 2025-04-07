import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Point, DocumentEmbeddingProps } from '../types/embedding';
import { generateMockPoints } from '../utils/embeddingUtils';
import { HoverInfoPanel } from './embedding/HoverInfoPanel';
import { EmotionsLegend } from './embedding/EmotionsLegend';
import { ZoomControls } from './embedding/ZoomControls';
import EmbeddingScene, { zoomIn, zoomOut, resetZoom } from './embedding/EmbeddingScene';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const DocumentEmbedding = ({ 
  points = [], 
  onPointClick, 
  isInteractive = true,
  depressedJournalReference = false,
  focusOnWord = null,
  onComparePoint
}: DocumentEmbeddingProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [comparisonPoint, setComparisonPoint] = useState<Point | null>(null);
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [currentFocusWord, setCurrentFocusWord] = useState<string | null>(null);
  const [generatedPoints, setGeneratedPoints] = useState<Point[]>([]);
  const [displayPoints, setDisplayPoints] = useState<Point[]>([]);
  const [connectedPoints, setConnectedPoints] = useState<Point[]>([]);
  
  useEffect(() => {
    if (focusOnWord !== currentFocusWord) {
      setCurrentFocusWord(focusOnWord);
      
      if (focusOnWord && displayPoints.length > 0) {
        const focusedPoint = displayPoints.find(p => p.word === focusOnWord);
        if (focusedPoint && focusedPoint.relationships) {
          const sortedRelationships = [...focusedPoint.relationships]
            .sort((a, b) => b.strength - a.strength)
            .slice(0, 3);
            
          const connected = sortedRelationships
            .map(rel => displayPoints.find(p => p.id === rel.id))
            .filter(p => p !== undefined) as Point[];
            
          setConnectedPoints(connected);
          if (focusedPoint) {
            setSelectedPoint(focusedPoint);
          }
        } else {
          setConnectedPoints([]);
        }
      } else {
        setConnectedPoints([]);
      }
    }
  }, [focusOnWord, currentFocusWord, displayPoints]);
  
  useEffect(() => {
    if (points.length > 0) {
      setDisplayPoints(points);
    } else if (generatedPoints.length === 0) {
      const mockPoints = generateMockPoints(depressedJournalReference);
      setGeneratedPoints(mockPoints);
      setDisplayPoints(mockPoints);
    }
  }, [points, depressedJournalReference, generatedPoints.length]);
  
  useEffect(() => {
    if (displayPoints.length > 0) {
      (window as any).documentEmbeddingPoints = displayPoints;
      console.log(`DocumentEmbedding: Exposed ${displayPoints.length} points`);
    }
  }, [displayPoints]);
  
  const handleZoomIn = () => {
    zoomIn(cameraRef.current);
  };
  
  const handleZoomOut = () => {
    zoomOut(cameraRef.current);
  };
  
  const handleResetZoom = () => {
    resetZoom(cameraRef.current, controlsRef.current);
  };
  
  const handlePointHover = (point: Point | null) => {
    setHoveredPoint(point);
  };
  
  const handlePointSelect = (point: Point | null) => {
    if (isCompareMode) {
      setComparisonPoint(point);
      setIsCompareMode(false);
      
      if (onComparePoint && selectedPoint && point) {
        onComparePoint(selectedPoint, point);
      }
      
      return;
    }
    
    setSelectedPoint(point);
    
    if (!point) {
      setConnectedPoints([]);
      setComparisonPoint(null);
      if (onPointClick) {
        onPointClick(null);
      }
      return;
    }
    
    if (point.relationships && point.relationships.length > 0) {
      const sortedRelationships = [...point.relationships]
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 3);
        
      const connected = sortedRelationships
        .map(rel => displayPoints.find(p => p.id === rel.id))
        .filter(p => p !== undefined) as Point[];
        
      setConnectedPoints(connected);
    } else {
      setConnectedPoints([]);
    }
    
    if (onPointClick) {
      onPointClick(point);
    }
  };
  
  const toggleCompareMode = () => {
    if (selectedPoint) {
      setIsCompareMode(!isCompareMode);
      if (!isCompareMode) {
        setComparisonPoint(null);
      }
    }
  };
  
  return (
    <div className="relative w-full h-full">
      <div 
        ref={containerRef} 
        className="w-full h-full rounded-lg overflow-hidden"
      />
      
      <EmbeddingScene 
        containerRef={containerRef}
        cameraRef={cameraRef}
        points={displayPoints}
        onPointHover={handlePointHover}
        onPointSelect={handlePointSelect}
        isInteractive={isInteractive}
        depressedJournalReference={depressedJournalReference}
        focusOnWord={currentFocusWord}
        connectedPoints={connectedPoints}
        selectedPoint={selectedPoint}
        comparisonPoint={comparisonPoint}
        isCompareMode={isCompareMode}
      />
      
      {isInteractive && (
        <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
          <ZoomControls 
            onZoomIn={handleZoomIn} 
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetZoom}
          />
          
          {selectedPoint && (
            <button
              onClick={toggleCompareMode}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                isCompareMode 
                  ? "bg-orange-500 text-white" 
                  : "bg-muted text-foreground"
              }`}
            >
              {isCompareMode ? "Selecting comparison..." : "Compare with another word"}
            </button>
          )}
        </div>
      )}
      
      {hoveredPoint && (
        <HoverInfoPanel point={hoveredPoint} />
      )}
      
      <EmotionsLegend />
    </div>
  );
};
