
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { KeyPhrases } from "@/components/KeyPhrases";
import { SentimentTimeline } from "@/components/SentimentTimeline";
import { EmotionalClusterView } from "@/components/EmotionalClusterView";
import { SentimentDistribution } from "@/components/SentimentDistribution";
import { WellbeingResources } from "@/components/WellbeingResources";
import { useLanguage } from "@/contexts/LanguageContext";
import { Point } from "@/types/embedding";

interface AnalysisTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sentimentData: any;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedPoint: Point | null;
  setSelectedPoint: (point: Point | null) => void;
  selectedWord: string | null;
  setSelectedWord: (word: string | null) => void;
  filteredPoints: Point[];
  setFilteredPoints: (points: Point[]) => void;
  uniqueWords: string[];
  visibleClusterCount?: number;
  handlePointClick: (point: Point | null) => void;
  handleResetVisualization: () => void;
  handleClearSearch: () => void;
  bertAnalysis?: any;
  connectedPoints: Point[];
  setConnectedPoints: (points: Point[]) => void;
}

export const AnalysisTabs = ({
  activeTab,
  setActiveTab,
  sentimentData,
  searchTerm,
  setSearchTerm,
  selectedPoint,
  setSelectedPoint,
  selectedWord,
  setSelectedWord,
  filteredPoints,
  setFilteredPoints,
  uniqueWords,
  visibleClusterCount = 8,
  handlePointClick,
  handleResetVisualization,
  handleClearSearch,
  bertAnalysis,
  connectedPoints,
  setConnectedPoints
}: AnalysisTabsProps) => {
  const { t } = useLanguage();
  const [clusterCount, setClusterCount] = useState<number>(visibleClusterCount);

  useEffect(() => {
    // Find word in embedding points when search changes
    if (searchTerm && searchTerm.length > 0) {
      const points = sentimentData?.embeddingPoints || [];
      
      // First try exact match
      const exactMatches = points.filter((p: Point) => p.word && p.word.toLowerCase() === searchTerm.toLowerCase());
      
      // If no exact matches, try contains
      const filteredResults = exactMatches.length > 0 ? exactMatches : 
        points.filter((p: Point) => p.word && p.word.toLowerCase().includes(searchTerm.toLowerCase()));
        
      if (filteredResults.length > 0) {
        setFilteredPoints(filteredResults);
        setSelectedWord(filteredResults[0].word);
        setSelectedPoint(filteredResults[0]);
      } else {
        // Reset if no matches
        setFilteredPoints(points);
      }
    } else {
      // Reset when search term is cleared
      setFilteredPoints(sentimentData?.embeddingPoints || []);
    }
  }, [searchTerm, sentimentData?.embeddingPoints, setFilteredPoints, setSelectedWord, setSelectedPoint]);

  const renderAnalysisContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <KeyPhrases 
                data={bertAnalysis?.keywords || sentimentData?.keyPhrases || []} 
              />
            </div>
            <div>
              <SentimentDistribution 
                distribution={sentimentData.distribution}
                totalWordCount={sentimentData.totalWordCount || 0}
              />
            </div>
          </div>
        );
      case "timeline":
        return (
          <div className="h-[400px]">
            <SentimentTimeline 
              data={sentimentData.timeline || []} 
              sourceDescription={sentimentData.sourceDescription}
            />
          </div>
        );
      case "clustering":
        return (
          <>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("searchKeywords")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                  {searchTerm.length > 0 && (
                    <button
                      className="absolute right-2 top-2.5"
                      onClick={handleClearSearch}
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleResetVisualization}
                  size="sm"
                >
                  {t("reset")}
                </Button>
              </div>
            </div>
            <div className="h-[400px]">
              <EmotionalClusterView
                points={filteredPoints}
                selectedPoint={selectedPoint}
                selectedWord={selectedWord}
                onPointClick={handlePointClick}
                clusterCount={clusterCount}
                connectedPoints={connectedPoints}
                setConnectedPoints={setConnectedPoints}
              />
            </div>
          </>
        );
      case "suggestions":
        return (
          <WellbeingResources
            embeddingPoints={sentimentData.embeddingPoints || []}
            sourceDescription={sentimentData.sourceDescription || "Based on your document"}
          />
        );
      default:
        return <div>{t("selectTab")}</div>;
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
        <TabsTrigger value="timeline">{t("timeline")}</TabsTrigger>
        <TabsTrigger value="clustering">{t("emotionalClusters")}</TabsTrigger>
        <TabsTrigger value="suggestions">{t("suggestions")}</TabsTrigger>
      </TabsList>
      
      <div className="mt-4">
        {renderAnalysisContent()}
      </div>
    </Tabs>
  );
};
