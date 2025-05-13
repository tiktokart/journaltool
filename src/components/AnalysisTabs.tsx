
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, CircleDot, RotateCcw, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { useState, useEffect, useRef } from "react";
import { Point } from "@/types/embedding";
import { SentimentOverview } from "@/components/SentimentOverview";
import { SentimentTimeline } from "@/components/SentimentTimeline";
import { KeyPhrases } from "@/components/KeyPhrases";
import MentalHealthSuggestions from "@/components/suggestions/MentalHealthSuggestions";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollToSection } from "@/components/ScrollToSection";
import { SentimentDistribution } from "@/components/SentimentDistribution";
import { WellbeingResources } from "@/components/WellbeingResources";

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
  connectedPoints: Point[];
  setConnectedPoints: (points: Point[]) => void;
  visibleClusterCount: number;
  handlePointClick: (point: Point | null) => void;
  handleResetVisualization: () => void;
  handleClearSearch: () => void;
  bertAnalysis?: any;
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
  connectedPoints,
  setConnectedPoints,
  visibleClusterCount,
  handlePointClick,
  handleResetVisualization,
  handleClearSearch,
  bertAnalysis
}: AnalysisTabsProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const [isOverviewOpen, setIsOverviewOpen] = useState(true);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(true);
  const [isDistributionOpen, setIsDistributionOpen] = useState(true);

  // Check if the required data for each tab is available
  const hasEmbeddingData = sentimentData?.embeddingPoints && sentimentData.embeddingPoints.length > 0;
  const hasOverviewData = sentimentData?.overallSentiment && sentimentData?.distribution;
  const hasTimelineData = sentimentData?.timeline && sentimentData.timeline.length > 0;
  const hasKeyPhrasesData = sentimentData?.keyPhrases && sentimentData.keyPhrases.length > 0;
  const hasBertData = bertAnalysis || sentimentData?.bertAnalysis;

  // Extract text from either sentimentData or create a simulated journal entry for suggestions
  const textForSuggestions = sentimentData?.text || sentimentData?.pdfText || "";
  const journalEntries = textForSuggestions ? [{ text: textForSuggestions, date: new Date().toISOString() }] : [];

  // Ensure we have text data for visualization
  const hasTextData = sentimentData?.text && sentimentData.text.length > 0 || 
                      sentimentData?.pdfText && sentimentData.pdfText.length > 0;

  // Get the text content from either the text or pdfText property
  const textContent = sentimentData?.text || sentimentData?.pdfText || "";
  
  // Calculate total word count for distribution stats
  const calculateWordCount = (text: string): number => {
    if (!text) return 0;
    return text.split(/\s+/).filter(word => word.trim().length > 0).length;
  };
  
  const totalWordCount = calculateWordCount(textContent);
  
  useEffect(() => {
    if (!sentimentData) return;
    
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredPoints(sentimentData.embeddingPoints || []);
      return;
    }
    
    const filtered = sentimentData.embeddingPoints.filter((point: Point) => {
      return point.word?.toLowerCase().includes(term) || 
             (point.emotionalTone && point.emotionalTone.toLowerCase().includes(term));
    });
    
    setFilteredPoints(filtered);
    
    // Make sure the points are exposed to window for visualization connection
    if (filtered.length > 0) {
      window.documentEmbeddingPoints = filtered;
      console.log(`Updated filteredPoints: ${filtered.length} points`);
    }
  }, [searchTerm, sentimentData, setFilteredPoints]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);
  
  // Define the handleSelectWord function 
  function handleSelectWord(word: string) {
    setSearchTerm(word);
    setSelectedWord(word);
    setOpen(false);
    
    if (sentimentData && sentimentData.embeddingPoints) {
      const selected = sentimentData.embeddingPoints.find(
        (point: Point) => point.word === word
      );
      
      if (selected) {
        setSelectedPoint(selected);
        toast(`${t("selected")}: "${selected.word}" (${selected.emotionalTone || t("neutral")})`);
      }
    }
  }

  // Fallback component when data is missing
  const DataMissingFallback = ({ tabName }: { tabName: string }) => (
    <Card className="border border-border shadow-md mt-4 bg-white">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4 icon-dance" />
        <h3 className="text-lg font-medium mb-2">{t("noDataTabName").replace("{tabName}", tabName)}</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          {t("dataAvailableMissing")}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <div className="overflow-x-auto">
        <TabsList className="inline-flex w-full justify-start space-x-1 overflow-x-auto bg-white">
          <TabsTrigger value="overview" className="min-w-max">{t("overviewTab")}</TabsTrigger>
          <TabsTrigger value="timeline" className="min-w-max">{t("timelineTab")}</TabsTrigger>
          <TabsTrigger value="keyphrases" className="min-w-max">{t("keywordsTab")}</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="overview" className="mt-6">
        {!hasOverviewData ? (
          <DataMissingFallback tabName={t("overviewTab")} />
        ) : (
          <>
            <Collapsible open={isOverviewOpen} onOpenChange={setIsOverviewOpen} className="w-full mb-6">
              <div className="flex justify-between items-center pb-2">
                <h2 className="text-xl font-bold text-purple-900">{t("overviewTab")}</h2>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    {isOverviewOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <SentimentOverview 
                  data={{
                    overallSentiment: sentimentData.overallSentiment,
                    distribution: sentimentData.distribution,
                    fileName: sentimentData.fileName
                  }}
                  sourceDescription={sentimentData.sourceDescription}
                />
              </CollapsibleContent>
            </Collapsible>
            
            <Collapsible open={isDistributionOpen} onOpenChange={setIsDistributionOpen} className="w-full mb-6">
              <div className="flex justify-between items-center pb-2">
                <h2 className="text-xl font-bold text-purple-900">Word Sentiment Distribution</h2>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    {isDistributionOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <SentimentDistribution
                  distribution={sentimentData.distribution}
                  sourceDescription="Word sentiment distribution in text"
                  totalWordCount={totalWordCount}
                />
              </CollapsibleContent>
            </Collapsible>
          
            <div className="mt-6">
              <ScrollToSection isOpen={true} elementId="suggestions-section" />
              <Collapsible open={isSuggestionsOpen} onOpenChange={setIsSuggestionsOpen} className="w-full">
                <div className="flex justify-between items-center pb-2">
                  <h2 className="text-xl font-bold text-purple-900">Analysis Insights</h2>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-9 p-0">
                      {isSuggestionsOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div id="suggestions-section">
                    {hasTextData && hasEmbeddingData && (
                      <WellbeingResources
                        embeddingPoints={sentimentData.embeddingPoints || []}
                        sourceDescription="Based on your journal entry"
                      />
                    )}
                    {(hasBertData || hasTextData) && (
                      <MentalHealthSuggestions 
                        journalEntries={journalEntries}
                        bertAnalysis={sentimentData?.bertAnalysis || bertAnalysis}
                      />
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </>
        )}
      </TabsContent>
      
      <TabsContent value="timeline" className="mt-6">
        {!hasTimelineData ? (
          <DataMissingFallback tabName={t("timelineTab")} />
        ) : (
          <SentimentTimeline 
            data={sentimentData.timeline}
            sourceDescription={sentimentData.sourceDescription}
          />
        )}
      </TabsContent>
      
      <TabsContent value="keyphrases" className="mt-6">
        {!hasKeyPhrasesData ? (
          <DataMissingFallback tabName={t("keywordsTab")} />
        ) : (
          <KeyPhrases 
            data={sentimentData.keyPhrases}
            sourceDescription={sentimentData.sourceDescription}
          />
        )}
      </TabsContent>
    </Tabs>
  );
};
