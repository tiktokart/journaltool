
import { useState } from "react";
import { getEmotionColor } from "../../utils/embeddingUtils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const EmotionsLegend = () => {
  const [isOpen, setIsOpen] = useState(true);
  
  const emotions = [
    "Joy", "Sadness", "Anger", "Fear", 
    "Surprise", "Disgust", "Trust", "Anticipation"
  ];

  return (
    <div className="absolute top-4 left-4 bg-card p-2 rounded-lg shadow-md text-xs z-10">
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
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
            {emotions.map((emotion) => (
              <div key={emotion} className="flex items-center">
                <div 
                  className="w-2 h-2 rounded-full mr-1" 
                  style={{ backgroundColor: getEmotionColor(emotion) }}
                />
                <span>{emotion}</span>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
