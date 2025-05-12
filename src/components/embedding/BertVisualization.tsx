
import React, { useRef, useState, useEffect } from 'react';
import ImprovedEmbeddingScene from './ImprovedEmbeddingScene';
import { Point } from '@/types/embedding';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import * as THREE from 'three';
import { zoomIn, zoomOut, resetZoom } from './ImprovedEmbeddingScene';

interface BertVisualizationProps {
  points: Point[];
  bertAnalysis?: any;
  onPointSelect?: (point: Point | null) => void;
  sourceDescription?: string;
  filterByEmotionalGroup?: string | null;
}

const BertVisualization = ({
  points,
  bertAnalysis,
  onPointSelect,
  sourceDescription,
  filterByEmotionalGroup
}: BertVisualizationProps) => {
  const { t } = useLanguage();
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [connectedPoints, setConnectedPoints] = useState<Point[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredPoints, setFilteredPoints] = useState<Point[]>(points || []);
  const [emotionalGroups, setEmotionalGroups] = useState<string[]>([]);
  const [selectedEmotionalGroup, setSelectedEmotionalGroup] = useState<string | null>(filterByEmotionalGroup || null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const controlsRef = useRef<any>(null);
  
  // Update points when props change
  useEffect(() => {
    if (points && points.length > 0) {
      setFilteredPoints(points);
      extractEmotionalGroups();
    }
  }, [points]);
  
  // Filter points when search term changes
  useEffect(() => {
    if (!points) return;
    
    if (!searchTerm) {
      setFilteredPoints(points);
      return;
    }
    
    const term = searchTerm.toLowerCase().trim();
    const filtered = points.filter(point => {
      return point.word?.toLowerCase().includes(term) || 
             point.emotionalTone?.toLowerCase().includes(term);
    });
    
    setFilteredPoints(filtered);
  }, [searchTerm, points]);
  
  // Extract unique emotional groups from points
  const extractEmotionalGroups = () => {
    if (!points || points.length === 0) return;
    
    const groups = new Set<string>();
    points.forEach(point => {
      if (point.emotionalTone) {
        groups.add(point.emotionalTone);
      }
    });
    
    setEmotionalGroups(Array.from(groups));
  };
  
  // Handle point selection
  const handlePointClick = (point: Point | null) => {
    setSelectedPoint(point);
    
    if (!point) {
      setConnectedPoints([]);
      if (onPointSelect) onPointSelect(null);
      return;
    }
    
    if (onPointSelect) onPointSelect(point);
    
    // Find connected points
    if (point.relationships && point.relationships.length > 0) {
      const connected = point.relationships
        .map(rel => points.find(p => p.id === rel.id))
        .filter(p => p !== undefined) as Point[];
      
      setConnectedPoints(connected);
      toast.info(`Selected "${point.word}"`);
    } else {
      setConnectedPoints([]);
    }
  };
  
  // Handle emotional group selection
  const handleSelectEmotionalGroup = (group: string | null) => {
    setSelectedEmotionalGroup(group);
    if (group) {
      toast.info(`Filtering by ${group} emotional tone`);
    } else {
      toast.info('Showing all emotional tones');
    }
  };
  
  // Zoom controls
  const handleZoomIn = () => {
    if (cameraRef.current) {
      zoomIn(cameraRef.current);
    }
  };
  
  const handleZoomOut = () => {
    if (cameraRef.current) {
      zoomOut(cameraRef.current);
    }
  };
  
  const handleResetView = () => {
    if (cameraRef.current && controlsRef.current) {
      resetZoom(cameraRef.current, controlsRef.current);
      setSelectedPoint(null);
      setConnectedPoints([]);
      setSelectedEmotionalGroup(null);
      toast.info('View reset');
    }
  };
  
  return (
    <Card className="border border-border shadow-md overflow-hidden bg-white">
      <CardHeader>
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center">
          <CardTitle className="flex items-center">
            <span>{t("latentEmotionalAnalysis")}</span>
          </CardTitle>
          
          <div className="flex flex-wrap gap-2">
            <div className="relative w-full md:w-64">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder={t("searchWordsOrEmotions")}
                  className="pl-8 pr-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleZoomIn}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom In</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleZoomOut}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom Out</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleResetView}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset View</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
        
        {/* Emotion filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge 
            variant={selectedEmotionalGroup === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleSelectEmotionalGroup(null)}
          >
            All
          </Badge>
          {emotionalGroups.map((group) => (
            <Badge
              key={group}
              variant={selectedEmotionalGroup === group ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleSelectEmotionalGroup(group)}
            >
              {group}
            </Badge>
          ))}
        </div>
        
        {/* Selected point info */}
        {selectedPoint && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <div className="font-medium">{selectedPoint.word}</div>
            <div className="text-sm flex flex-wrap gap-2 mt-1">
              <span className="text-muted-foreground">Emotion:</span> 
              <Badge variant="outline">{selectedPoint.emotionalTone}</Badge>
              
              {selectedPoint.sentiment !== undefined && (
                <>
                  <span className="text-muted-foreground">Sentiment:</span>
                  <span>{Math.round(selectedPoint.sentiment * 100)}%</span>
                </>
              )}
              
              {selectedPoint.frequency !== undefined && (
                <>
                  <span className="text-muted-foreground">Frequency:</span>
                  <span>{selectedPoint.frequency}</span>
                </>
              )}
            </div>
            
            {connectedPoints.length > 0 && (
              <div className="mt-2">
                <span className="text-sm text-muted-foreground">Connected words:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {connectedPoints.map(cp => (
                    <Badge key={cp.id} variant="secondary" className="text-xs">
                      {cp.word}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {sourceDescription && (
          <p className="text-sm text-muted-foreground mt-2">{sourceDescription}</p>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-[500px] relative">
          <ImprovedEmbeddingScene
            points={filteredPoints}
            selectedPoint={selectedPoint}
            connectedPoints={connectedPoints}
            onPointClick={handlePointClick}
            isInteractive={true}
            selectedEmotionalGroup={selectedEmotionalGroup}
            cameraRef={cameraRef}
            controlsRef={controlsRef}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BertVisualization;
