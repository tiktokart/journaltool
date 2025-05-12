
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Point } from "@/types/embedding";
import { AnalysisTabs } from "@/components/AnalysisTabs";
import { ScrollToSection } from "@/components/ScrollToSection";
import { useLanguage } from "@/contexts/LanguageContext"; 

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
  setVisibleClusterCount?: (count: number) => void;
  handlePointClick: (point: Point | null) => void;
  handleResetVisualization: () => void;
  handleClearSearch: () => void;
  onJournalEntryAdded?: () => void;
  onMonthlyReflectionAdded?: () => void;
  connectedPoints: Point[];
  setConnectedPoints: (points: Point[]) => void;
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
  onJournalEntryAdded,
  onMonthlyReflectionAdded,
  connectedPoints,
  setConnectedPoints
}: AnalysisResultsProps) => {
  const { t } = useLanguage();

  // Expose points to window object for use in visualization
  useEffect(() => {
    if (filteredPoints?.length > 0) {
      window.documentEmbeddingPoints = filteredPoints;
    }
  }, [filteredPoints]);
  
  // Parse and format data for sentiment displays
  const formatSentiment = (value: number | undefined): string => {
    if (value === undefined) return "0%";
    return `${Math.round(Number(value) * 100)}%`;
  };

  const calculateSentimentChange = () => {
    if (!sentimentData?.timeline || sentimentData.timeline.length < 2) {
      return "neutral";
    }
    
    const firstSentiment = sentimentData.timeline[0].sentiment;
    const lastSentiment = sentimentData.timeline[sentimentData.timeline.length - 1].sentiment;
    
    const diff = Number(lastSentiment) - Number(firstSentiment);
    if (diff > 0.05) return "improving";
    if (diff < -0.05) return "declining";
    return "stable";
  };
  
  if (!sentimentData) {
    return null;
  }

  // Format numbers to avoid adding strings
  const formatNumber = (value: number | string | undefined): number => {
    if (value === undefined) return 0;
    return typeof value === 'string' ? parseFloat(value) : value;
  };

  return (
    <Card className="border border-border shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">{t("analysisResults")}</CardTitle>
        <ScrollToSection isOpen={activeTab === 'overview'} elementId="overview-section" />
        <ScrollToSection isOpen={activeTab === 'timeline'} elementId="timeline-section" />
      </CardHeader>
      <CardContent id="overview-section">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[150px]">
            <div className="text-sm text-muted-foreground">{t("overallSentiment")}</div>
            <div className="text-2xl font-semibold">
              {formatSentiment(sentimentData.overallSentiment)}
            </div>
            <div className={`text-sm ${
              calculateSentimentChange() === "improving" ? "text-green-600" :
              calculateSentimentChange() === "declining" ? "text-red-600" :
              "text-blue-600"
            }`}>
              {t(calculateSentimentChange())}
            </div>
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <div className="text-sm text-muted-foreground">{t("keywordCount")}</div>
            <div className="text-2xl font-semibold">
              {sentimentData.keyPhrases?.length || 0}
            </div>
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <div className="text-sm text-muted-foreground">{t("textLength")}</div>
            <div className="text-2xl font-semibold">
              {formatNumber(sentimentData.pdfText?.length || pdfText.length)} {t("chars")}
            </div>
          </div>
        </div>

        <AnalysisTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sentimentData={sentimentData}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedPoint={selectedPoint}
          setSelectedPoint={setSelectedPoint}
          selectedWord={selectedWord}
          setSelectedWord={setSelectedWord}
          filteredPoints={filteredPoints}
          setFilteredPoints={setFilteredPoints}
          uniqueWords={uniqueWords}
          connectedPoints={connectedPoints}
          setConnectedPoints={setConnectedPoints}
          visibleClusterCount={visibleClusterCount}
          handlePointClick={handlePointClick}
          handleResetVisualization={handleResetVisualization}
          handleClearSearch={handleClearSearch}
          bertAnalysis={sentimentData.bertAnalysis}
        />
      </CardContent>
    </Card>
  );
};

export default AnalysisResults;
