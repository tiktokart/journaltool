
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, RotateCcw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { EmotionalClustersControl } from "../EmotionalClustersControl";
import { ScrollToSection } from "@/components/ScrollToSection";
import { Point } from "@/types/embedding";

interface AnalysisResultsProps {
  sentimentData: any;
  pdfText: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedPoint: Point | null;
  setSelectedPoint: (point: Point | null) => void;
  selectedWord: string | null;
  setSelectedWord: (word: string | null) => void;
  filteredPoints: Point[];
  setFilteredPoints: (points: Point[]) => void;
  uniqueWords: string[];
  visibleClusterCount: number;
  setVisibleClusterCount: (count: number) => void;
  handlePointClick: (point: Point | null) => void;
  handleResetVisualization: () => void;
  handleClearSearch: () => void;
  calculateRelationship?: (point1: Point, point2: Point) => any;
  onJournalEntryAdded?: () => void;
  onMonthlyReflectionAdded?: () => void;
}

const AnalysisResults = ({
  sentimentData,
  pdfText,
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  selectedPoint,
  setSelectedPoint,
  selectedWord,
  setSelectedWord,
  filteredPoints,
  setFilteredPoints,
  uniqueWords,
  visibleClusterCount,
  setVisibleClusterCount,
  handlePointClick,
  handleResetVisualization,
  handleClearSearch,
  calculateRelationship,
  onJournalEntryAdded,
  onMonthlyReflectionAdded
}: AnalysisResultsProps) => {
  const { t } = useLanguage();

  // Filter words based on search term
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredPoints(sentimentData.embeddingPoints || []);
      return;
    }
    
    const lowerTerm = term.toLowerCase();
    const filtered = (sentimentData.embeddingPoints || []).filter((point: Point) => {
      if (!point.word) return false;
      return point.word.toLowerCase().includes(lowerTerm);
    });
    
    setFilteredPoints(filtered);
  };
  
  return (
    <Card>
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="analysis" asChild>
            <ScrollToSection>
              <span className="w-full">Data Analysis</span>
            </ScrollToSection>
          </TabsTrigger>
          <TabsTrigger value="emotions" asChild>
            <ScrollToSection>
              <span className="w-full">Emotional Words</span>
            </ScrollToSection>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="analysis">
          <CardContent>
            <div className="space-y-6">
              {/* Sentiment Analysis Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-border">
                  <h3 className="text-lg font-medium mb-2">Overall Sentiment</h3>
                  <div className="text-3xl font-bold" style={{ 
                    color: sentimentData.overallSentiment?.score > 0.6 
                      ? 'green' 
                      : sentimentData.overallSentiment?.score < 0.4 
                        ? 'red' 
                        : 'orange' 
                  }}>
                    {sentimentData.overallSentiment?.label || "Neutral"}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Score: {Math.round((sentimentData.overallSentiment?.score || 0.5) * 100)}%
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-border">
                  <h3 className="text-lg font-medium mb-2">Distribution</h3>
                  <div className="flex items-center space-x-1">
                    <div 
                      className="h-4 bg-green-500 rounded-l" 
                      style={{ width: `${sentimentData.distribution?.positive || 0}%` }}
                    ></div>
                    <div 
                      className="h-4 bg-gray-300" 
                      style={{ width: `${sentimentData.distribution?.neutral || 0}%` }}
                    ></div>
                    <div 
                      className="h-4 bg-red-500 rounded-r" 
                      style={{ width: `${sentimentData.distribution?.negative || 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Positive: {sentimentData.distribution?.positive || 0}%</span>
                    <span>Neutral: {sentimentData.distribution?.neutral || 0}%</span>
                    <span>Negative: {sentimentData.distribution?.negative || 0}%</span>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-border">
                  <h3 className="text-lg font-medium mb-2">Stats</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Word count:</span>
                      <span className="font-medium">{sentimentData.wordCount || pdfText.split(/\s+/).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Unique emotional words:</span>
                      <span className="font-medium">{sentimentData.embeddingPoints?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Text Summary */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-border">
                <h3 className="text-lg font-medium mb-2">Summary</h3>
                <p className="text-sm text-muted-foreground">
                  {sentimentData.summary || "No summary available."}
                </p>
              </div>
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="emotions">
          <CardContent>
            <div className="space-y-6">
              {/* Emotion Filtering */}
              <div className="mb-4">
                <EmotionalClustersControl
                  visibleClusterCount={visibleClusterCount}
                  setVisibleClusterCount={setVisibleClusterCount}
                  activeTab={activeTab}
                />
              </div>
              
              {/* Word Search */}
              <div className="mb-6 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder={t("searchWords")}
                    className="pl-8 pr-8"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  {searchTerm && (
                    <button 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={handleClearSearch}
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleResetVisualization}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Word List */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {filteredPoints.map((point: Point) => (
                  <div 
                    key={point.id} 
                    className={`p-2 rounded border cursor-pointer transition-colors ${
                      selectedWord === point.word ? 'bg-muted border-primary' : 'hover:bg-muted border-border'
                    }`}
                    onClick={() => handlePointClick(point)}
                  >
                    <div className="font-medium truncate">{point.word}</div>
                    <div className="flex justify-between items-center mt-1 text-xs">
                      <span 
                        className="px-1.5 py-0.5 rounded-full text-xs"
                        style={{ 
                          backgroundColor: typeof point.color === 'string' 
                            ? point.color 
                            : `rgb(${Math.round((point.color?.[0] || 0) * 255)}, ${Math.round((point.color?.[1] || 0) * 255)}, ${Math.round((point.color?.[2] || 0) * 255)})`,
                          color: (point.color?.[0] || 0) + (point.color?.[1] || 0) > 1.0 ? 'black' : 'white'
                        }}
                      >
                        {point.emotionalTone}
                      </span>
                      <span className="ml-1 text-muted-foreground">
                        {Math.round((point.sentiment || 0) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredPoints.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No words matching your search" : "No emotional words found"}
                </div>
              )}
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AnalysisResults;
