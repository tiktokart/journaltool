
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Point } from "../types/embedding";
import EmbeddingScene from "./embedding/EmbeddingScene";
import HoverInfoPanel from "./embedding/HoverInfoPanel";
import EmotionsLegend from "./embedding/EmotionsLegend";
import { ZoomControls } from "./embedding/ZoomControls";
import ParticleBackground from "./embedding/ParticleBackground";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { toast } from "sonner";

interface DocumentEmbeddingProps {
  depressedJournalReference?: boolean;
  isInteractive?: boolean;
  onPointClick?: (point: Point | null) => void;
  onComparePoint?: (point1: Point, point2: Point) => void;
  showControls?: boolean;
  onSearchSelect?: (point: Point) => void;
  focusOnWord?: string | null;
  points?: Point[];
  onToggleSearch?: () => void;
}

export const DocumentEmbedding: React.FC<DocumentEmbeddingProps> = ({
  depressedJournalReference = false,
  isInteractive = true,
  onPointClick,
  onComparePoint,
  showControls = true,
  onSearchSelect,
  focusOnWord,
  points: providedPoints,
  onToggleSearch
}) => {
  const [embeddingPoints, setEmbeddingPoints] = useState<Point[]>([]);
  const [connectedPoints, setConnectedPoints] = useState<Point[]>([]);
  const [currentHoveredPoint, setCurrentHoveredPoint] = useState<Point | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [selectedComparisonPoint, setSelectedComparisonPoint] = useState<Point | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [highlightedEmotionalTone, setHighlightedEmotionalTone] = useState<string | null>(null);

  useEffect(() => {
    if (providedPoints && providedPoints.length > 0) {
      setEmbeddingPoints(providedPoints);
    } else if ((window as any).documentEmbeddingPoints) {
      setEmbeddingPoints((window as any).documentEmbeddingPoints);
    }
  }, [providedPoints]);

  useEffect(() => {
    if (embeddingPoints.length > 0) {
      (window as any).documentEmbeddingPoints = embeddingPoints;
    }
  }, [embeddingPoints]);

  const handlePointHover = (point: Point | null) => {
    setCurrentHoveredPoint(point);
  };

  const handlePointSelect = (point: Point | null) => {
    if (isCompareMode) {
      if (selectedPoint && point && selectedPoint.id === point.id) {
        setSelectedComparisonPoint(null);
        setSelectedPoint(null);
        setIsCompareMode(false);
        if (onPointClick) {
          onPointClick(null);
        }
        return;
      }
      
      if (selectedPoint) {
        setSelectedComparisonPoint(point);
        if (point && onComparePoint) {
          onComparePoint(selectedPoint, point);
        }
      } else {
        setSelectedPoint(point);
        setSelectedComparisonPoint(null);
        if (onPointClick) {
          onPointClick(point);
        }
      }
    } else {
      setSelectedPoint(point);
      setSelectedComparisonPoint(null);
      if (onPointClick) {
        onPointClick(point);
      }
    }
  };

  const handleSelectComparison = (point: Point) => {
    if (selectedPoint && onComparePoint) {
      onComparePoint(selectedPoint, point);
    }
  };

  const handleToggleCompare = () => {
    setIsCompareMode(!isCompareMode);
    if (!selectedPoint) {
      toast.info("Select a word first to compare");
    }
  };

  useEffect(() => {
    if (selectedPoint) {
      const relatedWords = selectedPoint.relationships?.map(rel => rel.word) || [];
      const connected = embeddingPoints.filter(point => relatedWords.includes(point.word));
      setConnectedPoints(connected);
    } else {
      setConnectedPoints([]);
    }
  }, [selectedPoint, embeddingPoints]);

  const handleFocusEmotionalGroup = (tone: string) => {
    setHighlightedEmotionalTone(tone);
    toast.info(`Focusing on ${tone} words`);
  };

  return (
    <div className="relative w-full h-full">
      {depressedJournalReference && <ParticleBackground containerRef={containerRef} />}
      
      <div className="absolute inset-0" ref={containerRef}>
        {embeddingPoints.length > 0 && (
          <EmbeddingScene
            points={embeddingPoints}
            containerRef={containerRef}
            cameraRef={cameraRef}
            controlsRef={controlsRef}
            isInteractive={isInteractive}
            onPointHover={handlePointHover}
            onPointSelect={handlePointSelect}
            focusOnWord={focusOnWord}
            connectedPoints={connectedPoints}
            selectedPoint={selectedPoint}
            comparisonPoint={selectedComparisonPoint}
            isCompareMode={isCompareMode}
            onFocusEmotionalGroup={handleFocusEmotionalGroup}
            onToggleSearch={onToggleSearch}
          />
        )}
      </div>
      
      {embeddingPoints.length > 0 && showControls && (
        <>
          <EmotionsLegend onFocusEmotionalGroup={handleFocusEmotionalGroup} />
          <ZoomControls 
            cameraRef={cameraRef} 
            controlsRef={controlsRef} 
            isCompareMode={isCompareMode}
            onToggleCompare={handleToggleCompare}
          />
          <HoverInfoPanel 
            hoveredPoint={currentHoveredPoint} 
            selectedPoint={selectedPoint} 
            onSelectComparison={handleSelectComparison}
            onHighlightEmotionalTone={handleFocusEmotionalGroup}
          />
        </>
      )}
    </div>
  );
};

export default DocumentEmbedding;
