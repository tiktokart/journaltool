
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Point, DocumentEmbeddingProps } from '../types/embedding';
import { generateMockPoints, getEmotionColor } from '../utils/embeddingUtils';
import { HoverInfoPanel } from './embedding/HoverInfoPanel';
import { EmotionsLegend } from './embedding/EmotionsLegend';
import { ZoomControls } from './embedding/ZoomControls';
import EmbeddingScene, { zoomIn, zoomOut, resetZoom } from './embedding/EmbeddingScene';
import ParticleBackground from './embedding/ParticleBackground';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ChevronDown, ChevronUp, CircleDot, Target, RotateCcw, Filter, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const [isEmotionalGroupsOpen, setIsEmotionalGroupsOpen] = useState<boolean>(true);
  const [filterApplied, setFilterApplied] = useState<boolean>(false);
  
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
      setDisplayPoints(points);
    } else if (generatedPoints.length === 0) {
      console.log("Generating mock points");
      const mockPoints = generateMockPoints(depressedJournalReference);
      setGeneratedPoints(mockPoints);
      setDisplayPoints(mockPoints);
    }
  }, [points, depressedJournalReference, generatedPoints.length]);
  
  useEffect(() => {
    if (displayPoints.length > 0) {
      (window as any).documentEmbeddingPoints = displayPoints;
      console.log(`DocumentEmbedding: Exposed ${displayPoints.length} points`);
      
      const sampleWords = displayPoints.slice(0, 10).map(p => p.word);
      console.log("Sample words in visualization:", sampleWords.join(", "));
      
      const uniqueGroups = new Set<string>();
      displayPoints.forEach(point => {
        if (point.emotionalTone) {
          uniqueGroups.add(point.emotionalTone);
        } else {
          uniqueGroups.add("Neutral");
        }
      });
      
      setEmotionalGroups(Array.from(uniqueGroups));
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
      
      <div className="absolute top-3 right-4 z-10 text-sm font-normal flex items-center text-muted-foreground bg-card/80 backdrop-blur-sm px-2 py-1 rounded-md">
        <CircleDot className="h-4 w-4 mr-2" />
        <span>
          {wordCount ? 
            `Showing Words: ${wordCount}` : 
            `Showing Words: ${displayPoints.length}`
          }
        </span>
      </div>
      
      {filterApplied && (
        <div className="absolute top-3 left-4 z-10 flex items-center text-sm font-normal bg-card/80 backdrop-blur-sm px-2 py-1 rounded-md">
          <Filter className="h-4 w-4 mr-2 text-primary" />
          <span>Filtered: {selectedEmotionalGroup}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 ml-2"
            onClick={resetEmotionalGroupFilter}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      )}
      
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
        <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
          <ZoomControls 
            onZoomIn={handleZoomIn} 
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetZoom}
          />
          
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 px-2 py-1 text-xs"
            onClick={handleResetView}
          >
            <RotateCcw className="h-3 w-3" />
            {t("resetView")}
          </Button>
          
          {selectedPoint && (
            <button
              onClick={toggleCompareMode}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                isCompareMode 
                  ? "bg-orange-500 text-white" 
                  : "bg-muted text-foreground"
              }`}
            >
              {isCompareMode ? t("selectingComparison") : t("compareWithAnotherWord")}
            </button>
          )}
        </div>
      )}
      
      {emotionalGroups.length > 0 && (
        <div className="absolute top-16 right-4 z-10 bg-light-lavender backdrop-blur-sm p-2 rounded-md">
          <Collapsible 
            open={isEmotionalGroupsOpen} 
            onOpenChange={setIsEmotionalGroupsOpen}
            className="w-full max-w-[200px]"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold flex items-center">
                <Target className="h-3 w-3 mr-1.5" />
                Jump to Emotional Groups
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  {isEmotionalGroupsOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="mt-1 space-y-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">Filter by Emotion</span>
                {selectedEmotionalGroup && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetEmotionalGroupFilter}
                    className="h-6 py-0 px-1 text-xs"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    {t("reset")}
                  </Button>
                )}
              </div>
              
              {emotionalGroups.map(group => (
                <Button
                  key={group}
                  size="sm"
                  variant={selectedEmotionalGroup === group ? "default" : "outline"}
                  className="h-7 text-xs justify-start px-2 w-full"
                  onClick={() => focusOnEmotionalGroup(group)}
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-1.5" 
                    style={{ backgroundColor: getEmotionColor(group) }}
                  />
                  {group}
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
      
      {hoveredPoint && (
        <HoverInfoPanel point={hoveredPoint} />
      )}
      
      <EmotionsLegend />
      
      {sourceDescription && (
        <div className="absolute bottom-4 right-4 z-10 flex items-center text-xs bg-card/80 backdrop-blur-sm px-2 py-1 rounded-md text-muted-foreground">
          <Info className="h-3.5 w-3.5 mr-1" />
          {sourceDescription}
        </div>
      )}
    </div>
  );
};

declare global {
  interface Window {
    documentEmbeddingPoints?: Point[];
    documentEmbeddingActions?: {
      focusOnEmotionalGroup?: (tone: string) => void;
      resetEmotionalGroupFilter?: () => void;
      resetView?: () => void;
    };
  }
}
