
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Point, DocumentEmbeddingProps } from '../types/embedding';
import { generateMockPoints } from '../utils/embeddingUtils';
import { HoverInfoPanel } from './embedding/HoverInfoPanel';
import { EmotionsLegend } from './embedding/EmotionsLegend';
import { ZoomControls } from './embedding/ZoomControls';
import { EmbeddingScene, zoomIn, zoomOut } from './embedding/EmbeddingScene';

export const DocumentEmbedding = ({ 
  points = [], 
  onPointClick, 
  isInteractive = true,
  depressedJournalReference = false,
  focusOnWord = null
}: DocumentEmbeddingProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [currentFocusWord, setCurrentFocusWord] = useState<string | null>(null);
  const [generatedPoints, setGeneratedPoints] = useState<Point[]>([]);
  const [displayPoints, setDisplayPoints] = useState<Point[]>([]);
  
  // Update currentFocusWord when focusOnWord changes
  useEffect(() => {
    if (focusOnWord !== currentFocusWord) {
      setCurrentFocusWord(focusOnWord);
    }
  }, [focusOnWord, currentFocusWord]);
  
  // Generate mock points if none are provided
  useEffect(() => {
    if (points.length > 0) {
      setDisplayPoints(points);
    } else if (generatedPoints.length === 0) {
      const mockPoints = generateMockPoints(depressedJournalReference);
      setGeneratedPoints(mockPoints);
      setDisplayPoints(mockPoints);
    }
  }, [points, depressedJournalReference, generatedPoints.length]);
  
  // Expose generated points to parent component if needed
  useEffect(() => {
    if (displayPoints.length > 0) {
      if (window.parent) {
        // Expose points to parent (can be used by parent components)
        (window as any).documentEmbeddingPoints = displayPoints;
      }
    }
  }, [displayPoints]);
  
  const handleZoomIn = () => {
    zoomIn(cameraRef.current);
  };
  
  const handleZoomOut = () => {
    zoomOut(cameraRef.current);
  };
  
  const handlePointHover = (point: Point | null) => {
    setHoveredPoint(point);
  };
  
  const handlePointSelect = (point: Point | null) => {
    if (!point) return;
    
    setSelectedPoint(point);
    if (onPointClick) {
      onPointClick(point);
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
        points={displayPoints}
        onPointHover={handlePointHover}
        onPointSelect={handlePointSelect}
        isInteractive={isInteractive}
        depressedJournalReference={depressedJournalReference}
        focusOnWord={currentFocusWord}
      />
      
      {isInteractive && (
        <ZoomControls 
          onZoomIn={handleZoomIn} 
          onZoomOut={handleZoomOut} 
        />
      )}
      
      {hoveredPoint && (
        <HoverInfoPanel point={hoveredPoint} />
      )}
      
      <EmotionsLegend />
    </div>
  );
};
