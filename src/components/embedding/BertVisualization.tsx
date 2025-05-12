
import React, { useState, useEffect } from 'react';
import { Point } from '@/types/embedding';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, RotateCcw } from "lucide-react";
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredPoints, setFilteredPoints] = useState<Point[]>(points || []);
  const [emotionalGroups, setEmotionalGroups] = useState<string[]>([]);
  const [selectedEmotionalGroup, setSelectedEmotionalGroup] = useState<string | null>(filterByEmotionalGroup || null);
  
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
  const handlePointClick = (point: Point) => {
    setSelectedPoint(point);
    
    if (onPointSelect) onPointSelect(point);
    
    toast.info(`Selected "${point.word}"`);
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
  
  // Handle reset view
  const handleResetView = () => {
    setSelectedPoint(null);
    setSelectedEmotionalGroup(null);
    toast.info('View reset');
  };
  
  return (
    <Card className="border border-border shadow-md overflow-hidden bg-white">
      <CardHeader>
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center">
          <CardTitle className="flex items-center">
            <span>{t("emotionalAnalysis")}</span>
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
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleResetView}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              {t("reset")}
            </Button>
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
          </div>
        )}
        
        {sourceDescription && (
          <p className="text-sm text-muted-foreground mt-2">{sourceDescription}</p>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredPoints.map(point => (
            <div 
              key={point.id} 
              className={`p-3 rounded-md cursor-pointer border hover:bg-muted ${
                selectedPoint?.id === point.id ? 'bg-muted border-primary' : 'border-border'
              }`}
              onClick={() => handlePointClick(point)}
            >
              <div className="font-medium">{point.word}</div>
              <div className="flex justify-between text-sm mt-1">
                <Badge variant="outline">{point.emotionalTone}</Badge>
                <span>{Math.round((point.sentiment || 0.5) * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
        
        {filteredPoints.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "No matching words found" : "No words to display"}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BertVisualization;
