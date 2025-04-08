
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { DocumentEmbedding } from "@/components/DocumentEmbedding";
import { Point } from "@/types/embedding";
import { CircleDot, Search, X, RotateCcw, Info, Settings } from "lucide-react";
import { toast } from "sonner";

interface LatentEmotionalAnalysisProps {
  points: Point[];
  uniqueWords: string[];
  emotionalClusters: any[];
  clusterPoints: Record<string, Point[]>;
  clusterColors: Record<string, string>;
  clusterExpanded: Record<string, boolean>;
  sourceDescription?: string;
  className?: string;
}

export const LatentEmotionalAnalysis = ({
  points,
  uniqueWords,
  emotionalClusters,
  clusterPoints,
  clusterColors,
  clusterExpanded,
  sourceDescription,
  className = ""
}: LatentEmotionalAnalysisProps) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [filteredPoints, setFilteredPoints] = useState<Point[]>(points);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [visibleClusterCount, setVisibleClusterCount] = useState(5);
  
  const handlePointClick = (point: Point | null) => {
    if (point) {
      setSelectedWord(point.word);
      setSelectedPoint(point);
      toast.info(`Selected: ${point.word}`);
    } else {
      setSelectedWord(null);
      setSelectedPoint(null);
    }
  };

  const handleSelectWord = (word: string) => {
    const point = points.find(p => p.word === word);
    if (point) {
      setSelectedWord(word);
      setSelectedPoint(point);
      setOpen(false);
      toast.info(`Selected: ${word}`);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setOpen(false);
  };

  const handleResetVisualization = () => {
    setSelectedWord(null);
    setSelectedPoint(null);
    setSelectedCluster(null);
    setFilteredPoints(points);
    toast.info("Visualization reset");
  };
  
  const toggleClusterExpanded = (clusterName: string) => {
    const newClusterExpanded = { ...clusterExpanded };
    newClusterExpanded[clusterName] = !clusterExpanded[clusterName];
    // This component does not manage the clusterExpanded state, so we'd need to pass this up
    // For now we'll just handle it locally
  };

  const handleSelectCluster = (cluster: any) => {
    if (selectedCluster === cluster.name) {
      setSelectedCluster(null);
      setFilteredPoints(points);
      toast.info(`Showing all words`);
    } else {
      setSelectedCluster(cluster.name);
      const clusterWords = clusterPoints[cluster.name] || [];
      setFilteredPoints(clusterWords);
      toast.info(`Filtered to cluster: ${cluster.name}`);
    }
  };
  
  return (
    <div className={className}>
      <Card className="border border-border shadow-md overflow-hidden bg-card mb-8">
        <CardHeader className="z-10">
          <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center">
            <div>
              <CardTitle className="flex items-center">
                <span>Latent Emotional Analysis</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                This is data analyzed from a made up experience of a Panic Attack
              </p>
            </div>
            
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
            
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 w-full md:w-64">
                    <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {searchTerm || "Search words or emotions..."}
                    </span>
                    {searchTerm && (
                      <X 
                        className="h-4 w-4 ml-2 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearSearch();
                        }}
                      />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="p-0 w-full md:w-64 max-h-[300px] overflow-y-auto"
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
                </PopoverContent>
              </Popover>
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
              depressedJournalReference={false}
              focusOnWord={selectedWord}
              sourceDescription={sourceDescription}
              onResetView={handleResetVisualization}
              visibleClusterCount={visibleClusterCount}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="border border-border shadow-md bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Settings className="h-5 w-5 mr-2 text-primary" />
              Emotional Clusters
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Slider 
                value={[visibleClusterCount]}
                min={1}
                max={10}
                step={1}
                onValueChange={(values) => setVisibleClusterCount(values[0])}
                className="w-32"
              />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Show: {visibleClusterCount}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {emotionalClusters.length === 0 ? (
              <p className="text-sm text-muted-foreground">No emotional clusters detected</p>
            ) : (
              emotionalClusters.map((cluster) => (
                <div key={cluster.id} className="border border-border rounded-lg overflow-hidden">
                  <div 
                    className={`flex items-center justify-between p-3 cursor-pointer ${
                      selectedCluster === cluster.name ? 'bg-accent' : 'bg-card'
                    }`}
                    onClick={() => handleSelectCluster(cluster)}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: cluster.color }}
                      />
                      <span className="font-medium">{cluster.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {cluster.size} words
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleClusterExpanded(cluster.name);
                        }}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {clusterExpanded[cluster.name] && (
                    <div className="p-3 bg-muted/30 text-sm">
                      <p className="text-muted-foreground mb-2">
                        Sentiment: {(cluster.sentiment * 100).toFixed(0)}%
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(clusterPoints[cluster.name] || []).slice(0, 5).map((point) => (
                          <Badge 
                            key={point.id} 
                            className="bg-primary/10 text-primary hover:bg-primary/20"
                          >
                            {point.word}
                          </Badge>
                        ))}
                        {(clusterPoints[cluster.name] || []).length > 5 && (
                          <Badge variant="outline">
                            +{(clusterPoints[cluster.name] || []).length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
