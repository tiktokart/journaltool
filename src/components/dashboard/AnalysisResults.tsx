
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Point } from "@/types/embedding";
import { AnalysisTabs } from "@/components/AnalysisTabs";
import { ScrollToSection } from "@/components/ScrollToSection";
import { SentimentDistribution } from "@/components/SentimentDistribution";
import AnalysisDataProcessor from "./AnalysisDataProcessor";
import SentimentScoreCard from "./SentimentScoreCard";

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
  handlePointClick,
  handleResetVisualization,
  handleClearSearch,
  onJournalEntryAdded,
  onMonthlyReflectionAdded,
  connectedPoints,
  setConnectedPoints
}: AnalysisResultsProps) => {
  const { t } = useLanguage();

  // Add total word count to data for distribution stats
  const totalWordCount = pdfText ? pdfText.split(/\s+/).filter(word => word.trim().length > 0).length : 0;

  if (!sentimentData) {
    return null;
  }

  return (
    <Card className="border border-border shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">{t("analysisResults")}</CardTitle>
        <ScrollToSection isOpen={activeTab === 'overview'} elementId="overview-section" />
        <ScrollToSection isOpen={activeTab === 'timeline'} elementId="timeline-section" />
      </CardHeader>
      <CardContent id="overview-section">
        <AnalysisDataProcessor sentimentData={sentimentData} pdfText={pdfText}>
          {(processedData, parsedScore, sentimentLabel, distribution) => (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <SentimentScoreCard 
                  parsedScore={parsedScore} 
                  sentimentLabel={sentimentLabel} 
                />
                
                <SentimentDistribution 
                  distribution={distribution}
                  sourceDescription="BERT Analysis"
                  totalWordCount={totalWordCount}
                />
              </div>

              <AnalysisTabs 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                sentimentData={{
                  ...sentimentData,
                  distribution: distribution,
                  timeline: processedData?.timeline || sentimentData.timeline
                }}
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
            </>
          )}
        </AnalysisDataProcessor>
      </CardContent>
    </Card>
  );
};

export default AnalysisResults;
