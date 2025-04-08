
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, CircleDot, RotateCcw } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

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
          toast(`Selected: "${selected.word}" (${selected.emotionalTone || 'Neutral'})`);
        } else {
          setConnectedPoints([]);
        }
      }
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <div className="overflow-x-auto">
        <TabsList className="inline-flex w-full justify-start space-x-1 overflow-x-auto">
          <TabsTrigger value="embedding" className="min-w-max">Latent Emotional Analysis</TabsTrigger>
          <TabsTrigger value="overview" className="min-w-max">Overview</TabsTrigger>
          <TabsTrigger value="timeline" className="min-w-max">Timeline</TabsTrigger>
          <TabsTrigger value="themes" className="min-w-max">Themes</TabsTrigger>
          <TabsTrigger value="keyphrases" className="min-w-max">Key Words</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="embedding" className="mt-6">
        <Card className="border border-border shadow-md overflow-hidden bg-card">
          <CardHeader className="z-10">
            <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center">
              <CardTitle className="flex items-center">
                <span>Latent Emotional Analysis</span>
              </CardTitle>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleResetVisualization}
                  className="h-9"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset View
                </Button>
                
                <div className="relative w-full md:w-64">
                  <div className="relative w-full">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search words or emotions..." 
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
                          placeholder="Search words..." 
                          value={searchTerm}
                          onValueChange={setSearchTerm}
                        />
                        <CommandList>
                          <CommandEmpty>No results found</CommandEmpty>
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
              <span>
                Hover or click on words to see emotional relationships. Use the Reset View button when needed.
              </span>
            </div>
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
      </TabsContent>
      
      <TabsContent value="overview" className="mt-6">
        <SentimentOverview 
          data={{
            overallSentiment: sentimentData.overallSentiment,
            distribution: sentimentData.distribution,
            fileName: sentimentData.fileName
          }}
          sourceDescription={sentimentData.sourceDescription}
        />
      </TabsContent>
      
      <TabsContent value="timeline" className="mt-6">
        <SentimentTimeline 
          data={sentimentData.timeline}
          sourceDescription={sentimentData.sourceDescription}
        />
      </TabsContent>
      
      <TabsContent value="themes" className="mt-6">
        <EntitySentiment 
          data={sentimentData.entities}
          sourceDescription={sentimentData.sourceDescription}
        />
      </TabsContent>
      
      <TabsContent value="keyphrases" className="mt-6">
        <KeyPhrases 
          data={sentimentData.keyPhrases}
          sourceDescription={sentimentData.sourceDescription}
        />
      </TabsContent>
    </Tabs>
  );
};
