
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SentimentOverview } from "@/components/SentimentOverview";
import { KeyPhrases } from "@/components/KeyPhrases";
import { SentimentTimeline } from "@/components/SentimentTimeline";
import { TextEmotionViewer } from "@/components/TextEmotionViewer";
import { ViewDetailedAnalysis } from "@/components/ViewDetailedAnalysis";
import { WellbeingResources } from "@/components/WellbeingResources";
import { EmotionalClusterView } from "@/components/embedding/EmotionalClusterView";
import { Point } from "@/types/embedding";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { SentimentDistribution } from "@/components/SentimentDistribution";

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
  const [normalizedData, setNormalizedData] = useState<any>(sentimentData);

  useEffect(() => {
    // Process sentiment data to ensure it has valid values
    if (sentimentData) {
      const processedData = {
        ...sentimentData,
        overallSentiment: {
          score: sentimentData.overallSentiment?.score || 0.5,
          label: sentimentData.overallSentiment?.label || "Neutral"
        },
        distribution: {
          positive: Math.max(1, sentimentData.distribution?.positive || 33),
          neutral: Math.max(1, sentimentData.distribution?.neutral || 34),
          negative: Math.max(1, sentimentData.distribution?.negative || 33)
        },
        // Make sure keyPhrases is valid
        keyPhrases: Array.isArray(sentimentData.keyPhrases) ? sentimentData.keyPhrases : 
                   (bertAnalysis?.keywords || []).map((kw: any) => ({
                      phrase: kw.text || kw.word || "",
                      score: kw.sentiment || 0.5,
                      count: 1
                    })),
        // Make sure timeline has valid data points
        timeline: Array.isArray(sentimentData.timeline) && sentimentData.timeline.length > 0 ? 
                 sentimentData.timeline : 
                 [
                   { page: 1, score: 0.4, time: "Start" },
                   { page: 2, score: 0.5, time: "Middle" },
                   { page: 3, score: 0.6, time: "End" }
                 ],
        // Ensure embeddingPoints is an array
        embeddingPoints: Array.isArray(sentimentData.embeddingPoints) ? sentimentData.embeddingPoints : []
      };
      
      setNormalizedData(processedData);
    }
  }, [sentimentData, bertAnalysis]);

  useEffect(() => {
    // Find word in embedding points when search changes
    if (searchTerm && searchTerm.length > 0) {
      const points = normalizedData?.embeddingPoints || [];
      
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
      setFilteredPoints(normalizedData?.embeddingPoints || []);
    }
  }, [searchTerm, normalizedData?.embeddingPoints, setFilteredPoints, setSelectedWord, setSelectedPoint]);

  const renderAnalysisContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <SentimentOverview 
              data={normalizedData} 
              sourceDescription={normalizedData.sourceDescription}
            />
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <KeyPhrases 
                  data={normalizedData.keyPhrases || []} 
                  sourceDescription={normalizedData.sourceDescription}
                />
              </div>
              <div>
                <SentimentDistribution 
                  distribution={normalizedData.distribution}
                  totalWordCount={normalizedData.totalWordCount || 0}
                />
              </div>
            </div>
          </div>
        );
      case "timeline":
        return (
          <div className="h-[400px]">
            <SentimentTimeline 
              data={normalizedData.timeline || []} 
              sourceDescription={normalizedData.sourceDescription}
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
            embeddingPoints={normalizedData.embeddingPoints || []}
            sourceDescription={normalizedData.sourceDescription || "Based on your document"}
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
