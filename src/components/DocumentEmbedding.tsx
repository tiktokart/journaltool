import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Point, DocumentEmbeddingProps } from '../types/embedding';
import { generateMockPoints } from '../utils/embeddingUtils';
import { HoverInfoPanel } from './embedding/HoverInfoPanel';
import EmbeddingScene, { zoomIn, zoomOut, resetZoom } from './embedding/EmbeddingScene';
import ParticleBackground from './embedding/ParticleBackground';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { WellbeingResources } from './WellbeingResources';
import { useLocation } from 'react-router-dom';
import { enrichPoints, extractEmotionalGroups } from './embedding/PointUtils';
import EmotionalGroupsPanel from './embedding/EmotionalGroupsPanel';
import WordMetadataDisplay from './embedding/WordMetadataDisplay';
import EmbeddingControls from './embedding/EmbeddingControls';

export const DocumentEmbedding = ({ 
  points = [], 
  onPointClick, 
  isInteractive = true,
  depressedJournalReference = false,
  focusOnWord = null,
  onComparePoint,
  onSearchSelect,
  sourceDescription,
  onResetView,
  visibleClusterCount = 8,
  showAllPoints = true,
  wordCount
}: DocumentEmbeddingProps) => {
  const { t } = useLanguage();
  const location = useLocation();
  const isHomepage = location.pathname === '/';
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
  const [emotionalGroups, setEmotionalGroups] = useState<string[]>([]);
  const [selectedEmotionalGroup, setSelectedEmotionalGroup] = useState<string | null>(null);
  const [filterApplied, setFilterApplied] = useState<boolean>(false);

  // Ensure points have proper position format to fix type errors
  const normalizePoints = (inputPoints: Point[]): Point[] => {
    return inputPoints.map(point => {
      // If point already has position array, keep it
      if (point.position && Array.isArray(point.position)) {
        return point;
      }
      
      // If point has x,y,z properties, create position array
      if (typeof point.x === 'number' && typeof point.y === 'number' && typeof point.z === 'number') {
        return {
          ...point,
          position: [point.x, point.y, point.z]
        };
      }
      
      // If point has position as array of numbers in text form, convert to numbers
      if (Array.isArray(point.position)) {
        return {
          ...point,
          position: point.position.map(Number)
        };
      }
      
      // Fallback - create random position if no valid position data exists
      return {
        ...point,
        position: [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20
        ]
      };
    });
  };
  
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
      console.log(`Setting display points with ${points.length} points from props`);
      const normalizedPoints = normalizePoints(points);
      const pointsWithCorrectColors = enrichPoints(normalizedPoints, isHomepage);
      setDisplayPoints(pointsWithCorrectColors);
      
      // Export points to window for TextEmotionViewer to access
      window.documentEmbeddingPoints = pointsWithCorrectColors;
    } else if (generatedPoints.length === 0) {
      console.log("Generating mock points");
      const mockPoints = generateMockPoints(depressedJournalReference);
      const normalizedMockPoints = normalizePoints(mockPoints);
      setGeneratedPoints(normalizedMockPoints);
      setDisplayPoints(normalizedMockPoints);
      
      // Export points to window for TextEmotionViewer to access
      window.documentEmbeddingPoints = normalizedMockPoints;
    }
  }, [points, depressedJournalReference, generatedPoints.length, isHomepage]);
  
  useEffect(() => {
    if (displayPoints.length > 0) {
      (window as any).documentEmbeddingPoints = displayPoints;
      console.log(`DocumentEmbedding: Exposed ${displayPoints.length} points`);
      
      // Add this debug message to verify points data
      console.log("Sample words in visualization:", displayPoints.slice(0, 10).map(p => p.word).join(", "));
      console.log("Points have emotionalTone:", displayPoints.some(p => p.emotionalTone));
      
      const uniqueGroups = extractEmotionalGroups(displayPoints);
      setEmotionalGroups(uniqueGroups);
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
  
  const handleVisualSearchSelect = (point: Point) => {
    handlePointSelect(point);
    if (onSearchSelect) {
      onSearchSelect(point);
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
  
  const handleFocusEmotionalGroup = (tone: string) => {
    setSelectedEmotionalGroup(tone);
    setFilterApplied(true);
  };
  
  const focusOnEmotionalGroup = (emotionalTone: string) => {
    setSelectedEmotionalGroup(emotionalTone);
    setFilterApplied(true);
    
    if (window.documentEmbeddingActions && 
        window.documentEmbeddingActions.focusOnEmotionalGroup) {
      window.documentEmbeddingActions.focusOnEmotionalGroup(emotionalTone);
    }
    
    toast.info(`${t("showingOnlyEmotionalGroup")} "${emotionalTone}" ${t("emotionalGroup")}`);
  };
  
  const resetEmotionalGroupFilter = () => {
    setSelectedEmotionalGroup(null);
    setFilterApplied(false);
    
    if (window.documentEmbeddingActions && 
        window.documentEmbeddingActions.resetEmotionalGroupFilter) {
      window.documentEmbeddingActions.resetEmotionalGroupFilter();
    }
    
    toast.info(t("showingAllEmotionalGroups"));
  };
  
  const handleResetView = () => {
    if (window.documentEmbeddingActions && 
        window.documentEmbeddingActions.resetView) {
      window.documentEmbeddingActions.resetView();
    }
    
    if (onResetView) {
      onResetView();
    }
    
    setSelectedEmotionalGroup(null);
    setFilterApplied(false);
    toast.info(t("viewReset"));
  };
  
  return (
    <div className="relative w-full h-full">
      <div 
        ref={containerRef} 
        className="w-full h-full rounded-lg overflow-hidden bg-white/50"
      />
      
      <ParticleBackground containerRef={containerRef} points={displayPoints} />
      
      <WordMetadataDisplay
        wordCount={wordCount}
        displayPointsLength={displayPoints.length}
        filterApplied={filterApplied}
        selectedEmotionalGroup={selectedEmotionalGroup}
        resetEmotionalGroupFilter={resetEmotionalGroupFilter}
        sourceDescription={sourceDescription}
      />
      
      <EmbeddingScene 
        containerRef={containerRef}
        cameraRef={cameraRef}
        controlsRef={controlsRef}
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
        onFocusEmotionalGroup={handleFocusEmotionalGroup}
        selectedEmotionalGroup={selectedEmotionalGroup}
        onResetView={handleResetView}
        visibleClusterCount={visibleClusterCount}
        showAllPoints={true}
      />
      
      {isInteractive && (
        <EmbeddingControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          onResetView={handleResetView}
          selectedPoint={selectedPoint}
          isCompareMode={isCompareMode}
          toggleCompareMode={toggleCompareMode}
        />
      )}
      
      {emotionalGroups.length > 0 && (
        <EmotionalGroupsPanel
          emotionalGroups={emotionalGroups}
          selectedEmotionalGroup={selectedEmotionalGroup}
          onSelectEmotionalGroup={focusOnEmotionalGroup}
          onResetFilter={resetEmotionalGroupFilter}
          isHomepage={isHomepage}
        />
      )}
      
      {hoveredPoint && (
        <HoverInfoPanel point={hoveredPoint} />
      )}
      
      {displayPoints.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 z-10 transform translate-y-full transition-transform duration-300 hover:translate-y-0">
          <WellbeingResources 
            embeddingPoints={displayPoints} 
            sourceDescription={sourceDescription} 
          />
        </div>
      )}
    </div>
  );
};

// Implement handler methods that were only referenced above
function handlePointHover(point: Point | null) {
  setHoveredPoint(point);
}

function handlePointSelect(point: Point | null) {
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
}

function handleZoomIn() {
  zoomIn(cameraRef.current);
}

function handleZoomOut() {
  zoomOut(cameraRef.current);
}

function handleResetZoom() {
  resetZoom(cameraRef.current, controlsRef.current);
}

function handleFocusEmotionalGroup(tone: string) {
  setSelectedEmotionalGroup(tone);
  setFilterApplied(true);
}

function focusOnEmotionalGroup(emotionalTone: string) {
  setSelectedEmotionalGroup(emotionalTone);
  setFilterApplied(true);
  
  if (window.documentEmbeddingActions && 
      window.documentEmbeddingActions.focusOnEmotionalGroup) {
    window.documentEmbeddingActions.focusOnEmotionalGroup(emotionalTone);
  }
  
  toast.info(`${t("showingOnlyEmotionalGroup")} "${emotionalTone}" ${t("emotionalGroup")}`);
}

function resetEmotionalGroupFilter() {
  setSelectedEmotionalGroup(null);
  setFilterApplied(false);
  
  if (window.documentEmbeddingActions && 
      window.documentEmbeddingActions.resetEmotionalGroupFilter) {
    window.documentEmbeddingActions.resetEmotionalGroupFilter();
  }
  
  toast.info(t("showingAllEmotionalGroups"));
}

function handleResetView() {
  if (window.documentEmbeddingActions && 
      window.documentEmbeddingActions.resetView) {
    window.documentEmbeddingActions.resetView();
  }
  
  if (onResetView) {
    onResetView();
  }
  
  setSelectedEmotionalGroup(null);
  setFilterApplied(false);
  toast.info(t("viewReset"));
}

function toggleCompareMode() {
  if (selectedPoint) {
    setIsCompareMode(!isCompareMode);
    if (!isCompareMode) {
      setComparisonPoint(null);
    }
  }
}

// Define the global window interfaces
declare global {
  interface Window {
    documentEmbeddingPoints?: Point[];
    lastProcessedEmbeddingPoints?: Point[];
    documentEmbeddingActions?: {
      focusOnEmotionalGroup?: (tone: string) => void;
      resetEmotionalGroupFilter?: () => void;
      resetView?: () => void;
    };
  }
}
