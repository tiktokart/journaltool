
import { Point } from "../../types/embedding";
import { getEmotionColor, getSentimentLabel } from "../../utils/embeddingUtils";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";

interface HoverInfoPanelProps {
  point: Point;
}

export const HoverInfoPanel = ({ point }: HoverInfoPanelProps) => {
  const [emotionSearchOpen, setEmotionSearchOpen] = useState(false);
  const [emotionSearchValue, setEmotionSearchValue] = useState("");
  
  const emotions = useMemo(() => [
    "Joy", "Sadness", "Anger", "Fear", 
    "Surprise", "Disgust", "Trust", "Anticipation", "Neutral"
  ], []);
  
  const filteredEmotions = useMemo(() => {
    if (!emotionSearchValue.trim()) return emotions;
    
    return emotions.filter(emotion => 
      emotion.toLowerCase().includes(emotionSearchValue.toLowerCase())
    );
  }, [emotionSearchValue, emotions]);
  
  if (!point) return null;
  
  // Use gray color for neutral words
  const emotionColor = point.emotionalTone === "Neutral" 
    ? "rgb(128, 128, 128)" 
    : getEmotionColor(point.emotionalTone || "");
  
  const handleSelectEmotion = (emotion: string) => {
    if (window.documentEmbeddingActions && 
        window.documentEmbeddingActions.focusOnEmotionalGroup) {
      window.documentEmbeddingActions.focusOnEmotionalGroup(emotion);
    }
    setEmotionSearchOpen(false);
  };
  
  return (
    <div className="absolute bottom-4 left-4 bg-card p-3 rounded-lg shadow-md max-w-xs z-10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-2" 
            style={{ backgroundColor: emotionColor }} 
          />
          <span className="font-medium">{point.emotionalTone || "Neutral"}</span>
        </div>
        
        <Popover open={emotionSearchOpen} onOpenChange={setEmotionSearchOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-2">
              <Search className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[200px]" align="end">
            <Command>
              <Input
                placeholder="Find emotion..."
                value={emotionSearchValue}
                onChange={(e) => setEmotionSearchValue(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-8"
              />
              <CommandList>
                <CommandEmpty>No emotions found</CommandEmpty>
                <CommandGroup>
                  {filteredEmotions.map((emotion) => (
                    <CommandItem 
                      key={emotion}
                      onSelect={() => handleSelectEmotion(emotion)}
                      className="flex items-center gap-2 text-xs py-1"
                    >
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: getEmotionColor(emotion === "Neutral" ? "" : emotion) }}
                      />
                      {emotion}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      
      <p className="text-lg font-bold mb-2">{point.word}</p>
      
      {point.keywords && (
        <div className="mb-2">
          <span className="text-xs font-medium block mb-1">Related Concepts:</span>
          <div className="flex flex-wrap gap-1">
            {point.keywords.map((keyword, idx) => (
              <span key={idx} className="text-xs bg-accent px-1.5 py-0.5 rounded-full">{keyword}</span>
            ))}
          </div>
        </div>
      )}
      
      <div className="text-xs flex justify-between mb-2">
        <span>Sentiment: {getSentimentLabel(point.sentiment)}</span>
        {point.emotionalTone && (
          <span>Emotional Tone: {point.emotionalTone}</span>
        )}
      </div>
      
      {point.relationships && point.relationships.length > 0 && (
        <div className="mt-2">
          <span className="text-xs font-medium block mb-1">Connected words:</span>
          <div className="grid grid-cols-2 gap-1">
            {point.relationships.map((rel, idx) => (
              <li key={idx} className="text-xs flex items-center">
                <div className="w-1 h-1 rounded-full bg-primary mr-1"></div>
                <span>{rel.word || `Connection ${idx + 1}`}</span>
              </li>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
