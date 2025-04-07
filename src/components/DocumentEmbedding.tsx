
import { useRef, useState } from 'react';
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
  depressedJournalReference = false
}: DocumentEmbeddingProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  
  // Generate mock points if none are provided
  const getPoints = () => {
    if (points.length > 0) return points;
    return generateMockPoints(depressedJournalReference);
  };
  
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
        points={getPoints()}
        onPointHover={handlePointHover}
        onPointSelect={handlePointSelect}
        isInteractive={isInteractive}
        depressedJournalReference={depressedJournalReference}
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
