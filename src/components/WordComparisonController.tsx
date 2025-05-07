
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GitCompareArrows, Search, X } from "lucide-react";
import { Point } from "@/types/embedding";
import { WordComparison } from "@/components/WordComparison";
import { toast } from "sonner";
import { getEmotionColor } from "@/utils/embeddingUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";

interface WordComparisonControllerProps {
  points: Point[];
  selectedPoint: Point | null;
  sourceDescription?: string;
  calculateRelationship: (point1: Point, point2: Point) => any;
}

export const WordComparisonController = ({
  points,
  selectedPoint,
  sourceDescription,
  calculateRelationship
}: WordComparisonControllerProps) => {
  const [compareWords, setCompareWords] = useState<Point[]>([]);
  const [compareSearchOpen, setCompareSearchOpen] = useState(false);
  const [compareSearchTerm, setCompareSearchTerm] = useState("");
  const [compareSearchResults, setCompareSearchResults] = useState<Point[]>([]);
  const [availableEmotions, setAvailableEmotions] = useState<string[]>([]);
  const { t, language } = useLanguage();
  const [forceUpdate, setForceUpdate] = useState(0);

  // Update search results and extract available emotions when points change
  useEffect(() => {
    if (points && points.length > 0) {
      setCompareSearchResults(points.slice(0, 15));
      
      // Extract unique emotions
      const emotions = new Set<string>();
      points.forEach(point => {
        if (point.emotionalTone) {
          emotions.add(point.emotionalTone);
        }
      });
      setAvailableEmotions(Array.from(emotions).sort());
    }
  }, [points]);

  // Force re-render when language changes
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
    
    if (compareSearchTerm) {
      const currentTerm = compareSearchTerm;
      setCompareSearchTerm("");
      setTimeout(() => setCompareSearchTerm(currentTerm), 0);
    }
  }, [language]);

  const handleCompareSearchChange = (value: string) => {
    setCompareSearchTerm(value);
    
    if (!value.trim()) {
      setCompareSearchResults([]);
      return;
    }
    
    if (!points.length) return;
    
    const results = points.filter((point: Point) => 
      (point.emotionalTone && point.emotionalTone.toLowerCase().includes(value.toLowerCase())) ||
      point.word.toLowerCase().includes(value.toLowerCase()) ||
      (point.keywords && point.keywords.some(keyword => 
        keyword.toLowerCase().includes(value.toLowerCase())
      ))
    );
    
    results.sort((a: Point, b: Point) => {
      const aEmotionMatch = a.emotionalTone && a.emotionalTone.toLowerCase().includes(value.toLowerCase());
      const bEmotionMatch = b.emotionalTone && b.emotionalTone.toLowerCase().includes(value.toLowerCase());
      
      if (aEmotionMatch && !bEmotionMatch) return -1;
      if (!aEmotionMatch && bEmotionMatch) return 1;
      return 0;
    });
    
    setCompareSearchResults(results);
  };

  const handleAddToComparison = (point: Point) => {
    if (compareWords.length >= 4) {
      toast.error(t("maxComparisonWordsError"));
      return;
    }
    
    if (compareWords.some(p => p.id === point.id)) {
      toast.info(`"${point.word}" ${t("alreadyInComparison")}`);
      return;
    }
    
    setCompareWords([...compareWords, point]);
    setCompareSearchOpen(false);
    toast.success(`${t("addedToComparison")} "${point.word}" ${t("toComparison")}`);
  };

  const handleRemoveFromComparison = (point: Point) => {
    setCompareWords(compareWords.filter(p => p.id !== point.id));
    toast.info(`${t("removedFromComparison")} "${point.word}" ${t("fromComparison")}`);
  };

  const handleClearComparison = () => {
    setCompareWords([]);
    toast.info(t("clearedAllComparisonWords"));
  };

  const handleEmotionFilter = (emotion: string) => {
    // Filter points by the selected emotion and add up to 4 to comparison
    const emotionPoints = points
      .filter(point => point.emotionalTone === emotion)
      .slice(0, 4);
    
    if (emotionPoints.length === 0) {
      toast.info(`No words with emotion "${emotion}" found`);
      return;
    }
    
    setCompareWords(emotionPoints);
    toast.success(`Added ${emotionPoints.length} words with "${emotion}" emotion to comparison`);
  };

  return (
    <Card className="border border-border shadow-md" style={{ backgroundColor: "#DFC5FE" }}>
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle className="flex items-center text-xl text-orange">
            <GitCompareArrows className="h-5 w-5 mr-2 text-primary" />
            {t("wordComparison")}
          </CardTitle>
          
          <div className="flex gap-2">
            <Popover 
              open={compareSearchOpen} 
              onOpenChange={setCompareSearchOpen}
            >
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Search className="h-4 w-4 mr-2" />
                  {t("addWord")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="end" style={{ backgroundColor: "#DFC5FE" }}>
                <Command>
                  <CommandInput 
                    placeholder={t("searchWords")} 
                    value={compareSearchTerm}
                    onValueChange={handleCompareSearchChange}
                  />
                  <CommandList>
                    <CommandEmpty>{t("noMatchingWords")}</CommandEmpty>
                    <CommandGroup>
                      {compareSearchResults.map((point) => (
                        <CommandItem 
                          key={`${point.id}-${language}`} 
                          onSelect={() => handleAddToComparison(point)}
                        >
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ 
                                backgroundColor: point.emotionalTone 
                                  ? getEmotionColor(point.emotionalTone)
                                  : `rgb(${point.color[0] * 255}, ${point.color[1] * 255}, ${point.color[2] * 255})` 
                              }} 
                            />
                            <span>{point.word}</span>
                          </div>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {point.emotionalTone ? t(point.emotionalTone.toLowerCase()) || point.emotionalTone : t("neutral")}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            
            {compareWords.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9"
                onClick={handleClearComparison}
              >
                <X className="h-4 w-4 mr-2" />
                {t("clearAll")}
              </Button>
            )}
          </div>
        </div>
        
        {availableEmotions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-sm text-muted-foreground mr-1 flex items-center">
              Search by Emotion:
            </span>
            {availableEmotions.map(emotion => (
              <Badge 
                key={emotion}
                variant="outline" 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                style={{
                  borderColor: getEmotionColor(emotion),
                  backgroundColor: `${getEmotionColor(emotion)}20`
                }}
                onClick={() => handleEmotionFilter(emotion)}
              >
                {emotion}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <WordComparison 
          words={compareWords}
          onRemoveWord={handleRemoveFromComparison}
          calculateRelationship={calculateRelationship}
          onAddWordClick={() => setCompareSearchOpen(true)}
          sourceDescription={sourceDescription}
        />
      </CardContent>
    </Card>
  );
};
