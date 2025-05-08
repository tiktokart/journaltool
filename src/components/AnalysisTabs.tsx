import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, CircleDot, RotateCcw, AlertTriangle } from "lucide-react";
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
import { DocumentEmbedding } from "@/components/DocumentEmbedding";
import { SentimentOverview } from "@/components/SentimentOverview";
import { SentimentTimeline } from "@/components/SentimentTimeline";
import { EntitySentiment } from "@/components/EntitySentiment";
import { KeyPhrases } from "@/components/KeyPhrases";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { TextEmotionViewer } from "@/components/TextEmotionViewer";
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
  handleClearSearch
}: AnalysisTabsProps) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Check if the required data for each tab is available
  const hasEmbeddingData = sentimentData?.embeddingPoints && sentimentData.embeddingPoints.length > 0;
  const hasOverviewData = sentimentData?.overallSentiment && sentimentData?.distribution;
  const hasTimelineData = sentimentData?.timeline && sentimentData.timeline.length > 0;
  const hasEntitiesData = sentimentData?.entities && sentimentData.entities.length > 0;
  const hasKeyPhrasesData = sentimentData?.keyPhrases && sentimentData.keyPhrases.length > 0;

  // Ensure we have text data for visualization
  const hasTextData = sentimentData?.text && sentimentData.text.length > 0;

  useEffect(() => {
    if (!sentimentData) return;
    
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      setFilteredPoints(sentimentData.embeddingPoints || []);
      return;
    }
    
    const filtered = sentimentData.embeddingPoints.filter((point: Point) => {
      return point.word.toLowerCase().includes(term) || 
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
  
  const handleSelectWord = (word: string) => {
    setSearchTerm(word);
    setSelectedWord(word);
    setOpen(false);
    
    if (sentimentData && sentimentData.embeddingPoints) {
      const selected = sentimentData.embeddingPoints.find(
        (point: Point) => point.word === word
      );
      
      if (selected) {
        setSelectedPoint(selected);
        
        if (selected.relationships && selected.relationships.length > 0) {
          const sortedRelationships = [...selected.relationships]
            .sort((a, b) => b.strength - a.strength)
            .slice(0, 3);
            
          const connected = sentimentData.embeddingPoints
            .filter((p: Point) => sortedRelationships.some(rel => rel.id === p.id));
          
          setConnectedPoints(connected);
          toast(`${t("selected")}: "${selected.word}" (${selected.emotionalTone || t("neutral")})`);
        } else {
          setConnectedPoints([]);
        }
      }
    }
  };

  // Fallback component when data is missing
  const DataMissingFallback = ({ tabName }: { tabName: string }) => (
    <Card className="border border-border shadow-md mt-4 bg-light-lavender">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
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
        <TabsList className="inline-flex w-full justify-start space-x-1 overflow-x-auto bg-light-lavender">
          <TabsTrigger value="embedding" className="min-w-max">{t("latentEmotionalAnalysisTab")}</TabsTrigger>
          <TabsTrigger value="overview" className="min-w-max">{t("overviewTab")}</TabsTrigger>
          <TabsTrigger value="timeline" className="min-w-max">{t("timelineTab")}</TabsTrigger>
          <TabsTrigger value="themes" className="min-w-max">{t("themesTab")}</TabsTrigger>
          <TabsTrigger value="keyphrases" className="min-w-max">{t("keywordsTab")}</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="embedding" className="mt-6">
        {!hasEmbeddingData ? (
          <DataMissingFallback tabName={t("embedding")} />
        ) : (
          <>
            <Card className="border border-border shadow-md overflow-hidden bg-light-lavender">
              <CardHeader className="z-10">
                <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center">
                  <CardTitle className="flex items-center">
                    <span>{t("latentEmotionalAnalysis")}</span>
                  </CardTitle>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleResetVisualization}
                      className="h-9"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {t("resetView")}
                    </Button>
                    
                    <div className="relative w-full md:w-64">
                      <div className="relative w-full">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder={t("searchWordsOrEmotions")}
                          className="pl-8 w-full pr-8"
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                          }}
                          onFocus={() => {
                            if (uniqueWords.length > 0) {
                              setOpen(true);
                            }
                          }}
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
                      {uniqueWords.length > 0 && open && (
                        <div 
                          ref={searchDropdownRef}
                          className="absolute w-full mt-1 bg-popover border border-border rounded-md shadow-md z-50 max-h-[300px] overflow-y-auto"
                        >
                          <Command>
                            <CommandInput 
                              placeholder={t("searchWords")}
                              value={searchTerm}
                              onValueChange={setSearchTerm}
                            />
                            <CommandList>
                              <CommandEmpty>{t("noResultsFound")}</CommandEmpty>
                              <CommandGroup>
                                {uniqueWords
                                  .filter(word => word.toLowerCase().includes(searchTerm.toLowerCase()))
                                  .slice(0, 100)
                                  .map((word) => (
                                    <CommandItem 
                                      key={word} 
                                      value={word}
                                      onSelect={handleSelectWord}
                                    >
                                      {word}
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-normal flex items-center text-muted-foreground">
                  <CircleDot className="h-4 w-4 mr-2" />
                  <span>{t("hoverOrClick")}</span>
                </div>
                {sentimentData?.sourceDescription && (
                  <p className="text-sm mt-2 text-black">{sentimentData.sourceDescription}</p>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[500px] relative">
                  <DocumentEmbedding 
                    points={filteredPoints}
                    onPointClick={handlePointClick}
                    isInteractive={true}
                    focusOnWord={selectedWord || null}
                    sourceDescription={sentimentData.sourceDescription}
                    onResetView={handleResetVisualization}
                    visibleClusterCount={visibleClusterCount}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Add the TextEmotionViewer component to ensure connection with visualizations */}
            {hasTextData && hasEmbeddingData && (
              <div className="mt-6">
                <TextEmotionViewer
                  pdfText={sentimentData.text}
                  embeddingPoints={sentimentData.embeddingPoints}
                  sourceDescription={sentimentData.sourceDescription}
                />
              </div>
            )}
            
            {/* Add WellbeingResources component with proper data connection */}
            {hasEmbeddingData && (
              <div className="mt-6">
                <WellbeingResources
                  embeddingPoints={sentimentData.embeddingPoints}
                  sourceDescription={sentimentData.sourceDescription}
                />
              </div>
            )}
          </>
        )}
      </TabsContent>
      
      <TabsContent value="overview" className="mt-6">
        {!hasOverviewData ? (
          <DataMissingFallback tabName={t("overviewTab")} />
        ) : (
          <SentimentOverview 
            data={{
              overallSentiment: sentimentData.overallSentiment,
              distribution: sentimentData.distribution,
              fileName: sentimentData.fileName
            }}
            sourceDescription={sentimentData.sourceDescription}
          />
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
      
      <TabsContent value="themes" className="mt-6">
        {!hasEntitiesData ? (
          <DataMissingFallback tabName={t("themesTab")} />
        ) : (
          <EntitySentiment 
            data={sentimentData.entities}
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
