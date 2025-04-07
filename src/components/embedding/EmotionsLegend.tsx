
import { useState } from "react";
import { getEmotionColor } from "../../utils/embeddingUtils";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const EmotionsLegend = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const emotions = [
    "Joy", "Sadness", "Anger", "Fear", 
    "Surprise", "Disgust", "Trust", "Anticipation"
  ];

  const filteredEmotions = searchQuery 
    ? emotions.filter(emotion => emotion.toLowerCase().includes(searchQuery.toLowerCase()))
    : emotions;

  const handleEmotionClick = (emotion: string) => {
    if (window.documentEmbeddingActions?.focusOnEmotionalGroup) {
      window.documentEmbeddingActions.focusOnEmotionalGroup(emotion);
    }
  };

  return (
    <div className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm p-2 rounded-lg shadow-md text-xs z-10 w-48">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <div className="font-medium">Emotional Tones:</div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <div className="mt-2 mb-2">
            <div className="relative">
              <Search className="absolute left-2 top-1.5 h-3 w-3 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search emotions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-7 pl-7 text-xs"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-y-1 mt-1">
            {filteredEmotions.map((emotion) => (
              <Button
                key={emotion}
                variant="ghost"
                size="sm" 
                className="flex items-center justify-start h-6 px-2 py-1 w-full hover:bg-accent transition-colors"
                onClick={() => handleEmotionClick(emotion)}
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: getEmotionColor(emotion) }}
                />
                <span>{emotion}</span>
              </Button>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
