
import { useState, useMemo } from "react";
import { getEmotionColor } from "../../utils/embeddingUtils";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";

export const EmotionsLegend = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const emotions = [
    "Joy", "Sadness", "Anger", "Fear", 
    "Surprise", "Disgust", "Trust", "Anticipation"
  ];

  const filteredEmotions = useMemo(() => {
    if (!searchQuery.trim()) return emotions;
    return emotions.filter(emotion => 
      emotion.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, emotions]);

  return (
    <div className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm p-2 rounded-lg shadow-md text-xs z-10">
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
          <div className="mt-1 mb-2 relative">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search emotions..."
                className="h-7 pl-7 text-xs py-1 pr-2"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
            {filteredEmotions.length > 0 ? (
              filteredEmotions.map((emotion) => (
                <div key={emotion} className="flex items-center">
                  <div 
                    className="w-2 h-2 rounded-full mr-1" 
                    style={{ backgroundColor: getEmotionColor(emotion) }}
                  />
                  <span>{emotion}</span>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-1 text-muted-foreground">No matching emotions</div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
