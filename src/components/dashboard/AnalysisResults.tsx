
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Point } from "@/types/embedding";
import { AnalysisTabs } from "@/components/AnalysisTabs";
import { ScrollToSection } from "@/components/ScrollToSection";
import { useLanguage } from "@/contexts/LanguageContext"; 
import { HelpCircle, Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { SentimentDistribution } from "@/components/SentimentDistribution";

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
  const [processedData, setProcessedData] = useState<any>(null);
  const [parsedScore, setParsedScore] = useState(0.5);
  const [sentimentLabel, setSentimentLabel] = useState("Neutral");

  // Expose points to window object for use in visualization
  useEffect(() => {
    if (filteredPoints?.length > 0) {
      window.documentEmbeddingPoints = filteredPoints;
    }
  }, [filteredPoints]);
  
  // Process data for visualization
  useEffect(() => {
    if (!sentimentData) return;
    
    try {
      // Validate overall sentiment
      let score = sentimentData?.overallSentiment?.score;
      if (score !== undefined && !isNaN(score)) {
        setParsedScore(Math.max(0, Math.min(1, score))); // Clamp between 0-1
      } else if (sentimentData?.bertAnalysis?.overallSentiment) {
        // Fallback to BERT analysis overall sentiment
        score = sentimentData.bertAnalysis.overallSentiment;
        setParsedScore(Math.max(0, Math.min(1, score)));
      }
      
      // Set sentiment label
      const label = sentimentData?.overallSentiment?.label || '';
      if (label) {
        setSentimentLabel(label);
      } else {
        // Generate label based on score
        if (parsedScore >= 0.7) setSentimentLabel("Very Positive");
        else if (parsedScore >= 0.55) setSentimentLabel("Positive");
        else if (parsedScore >= 0.45) setSentimentLabel("Neutral");
        else if (parsedScore >= 0.3) setSentimentLabel("Negative");
        else setSentimentLabel("Very Negative");
      }
      
      // Extract text snippets for timeline data
      const processTimeline = (timeline: any[]) => {
        if (!timeline || !Array.isArray(timeline)) return timeline;
        
        return timeline.map((item, index) => {
          // Try to extract text snippets from the document
          let textSnippet = item.event || "";
          if (pdfText) {
            const wordCount = 20;
            const position = Math.floor((index / timeline.length) * pdfText.length);
            const startPos = Math.max(0, pdfText.indexOf(' ', position - 100) + 1);
            const endPos = pdfText.indexOf('.', startPos + 10) + 1 || startPos + wordCount;
            textSnippet = pdfText.substring(startPos, endPos).trim();
          }
          
          return {
            ...item,
            textSnippet
          };
        });
      };
      
      // Process data for visualization
      setProcessedData({
        ...sentimentData,
        timeline: processTimeline(sentimentData.timeline)
      });
    } catch (error) {
      console.error("Error processing data:", error);
    }
  }, [sentimentData, pdfText, parsedScore]);
  
  // Add total word count to data for distribution stats
  const totalWordCount = pdfText ? pdfText.split(/\s+/).filter(word => word.trim().length > 0).length : 0;
  
  if (!sentimentData) {
    return null;
  }

  // Format numbers to avoid adding strings
  const formatNumber = (value: number | string | undefined): number => {
    if (value === undefined) return 0;
    return typeof value === 'string' ? parseFloat(value) : value;
  };

  // Format sentiment for display
  const formatSentiment = (value: number | undefined): string => {
    if (value === undefined) return "0%";
    return `${Math.round(Number(value) * 100)}%`;
  };

  const calculateSentimentChange = () => {
    if (!sentimentData?.timeline || sentimentData.timeline.length < 2) {
      return "neutral";
    }
    
    const firstSentiment = sentimentData.timeline[0].sentiment || sentimentData.timeline[0].score;
    const lastSentiment = sentimentData.timeline[sentimentData.timeline.length - 1].sentiment || 
      sentimentData.timeline[sentimentData.timeline.length - 1].score;
    
    const diff = Number(lastSentiment) - Number(firstSentiment);
    if (diff > 0.05) return "improving";
    if (diff < -0.05) return "declining";
    return "stable";
  };

  // Ensure we have properly structured distribution data
  const ensureDistribution = () => {
    // First check BERT analysis for distribution data
    if (sentimentData.bertAnalysis) {
      // Try to use BERT-specific distribution if available
      const bertDistribution = sentimentData.bertAnalysis.distribution || {
        positive: sentimentData.bertAnalysis.positiveWordCount || 0,
        neutral: sentimentData.bertAnalysis.neutralWordCount || 0,
        negative: sentimentData.bertAnalysis.negativeWordCount || 0
      };
      
      // Calculate percentages if needed
      const sum = bertDistribution.positive + bertDistribution.neutral + bertDistribution.negative;
      if (sum > 0) {
        return {
          positive: Math.round((bertDistribution.positive / sum) * 100),
          neutral: Math.round((bertDistribution.neutral / sum) * 100),
          negative: Math.round((bertDistribution.negative / sum) * 100)
        };
      }
    }
    
    // Fallback to sentimentData distribution
    if (sentimentData.distribution) {
      return sentimentData.distribution;
    }
    
    // Generate a basic distribution based on overall sentiment
    const overallSentiment = sentimentData.overallSentiment?.score || 
                           sentimentData.overallSentiment || 0.5;
                           
    return {
      positive: Math.round(overallSentiment * 100),
      negative: Math.round((1 - overallSentiment) * 0.7 * 100),
      neutral: 100 - Math.round(overallSentiment * 100) - Math.round((1 - overallSentiment) * 0.7 * 100)
    };
  };

  const distribution = ensureDistribution();

  return (
    <Card className="border border-border shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">{t("analysisResults")}</CardTitle>
        <ScrollToSection isOpen={activeTab === 'overview'} elementId="overview-section" />
        <ScrollToSection isOpen={activeTab === 'timeline'} elementId="timeline-section" />
      </CardHeader>
      <CardContent id="overview-section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 border rounded-lg bg-white">
            <div className="mb-4">
              <h3 className="text-lg font-medium">{t("overallSentiment")}</h3>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <HelpCircle className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <p className="font-semibold">{sentimentLabel}</p>
                  <p className="text-sm text-muted-foreground">{t("scoreLabel")}: {(parsedScore * 100).toFixed(0)}%</p>
                </div>
              </div>
              <div className="h-16 w-16 rounded-full bg-purple-500 text-white flex items-center justify-center text-xl font-bold">
                {Math.round(parsedScore * 100)}
              </div>
            </div>
            
            <div className="mb-3">
              <Slider 
                value={[parsedScore * 100]} 
                max={100} 
                step={1}
                disabled={true}
                className="cursor-default"
              />
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("negative")}</span>
              <span>{t("neutral")}</span>
              <span>{t("positive")}</span>
            </div>
            
            <div className="mt-4 flex items-center text-xs text-muted-foreground">
              <Info className="h-4 w-4 mr-1" />
              <p>Analysis with BERT Model</p>
            </div>
          </div>
          
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
      </CardContent>
    </Card>
  );
};

export default AnalysisResults;
