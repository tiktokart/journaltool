
import { useState } from "react";
import { getEmotionColor } from "../../utils/embeddingUtils";
import { ChevronDown, ChevronUp, Heart, Frown, Smile, Angry, Meh, Laugh } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Map of emotions to icons
const emotionIconMap: Record<string, JSX.Element> = {
  "Joy": <Smile className="h-3 w-3" />,
  "Sadness": <Frown className="h-3 w-3" />,
  "Anger": <Angry className="h-3 w-3" />,
  "Fear": <Frown className="h-3 w-3" />,
  "Surprise": <Laugh className="h-3 w-3" />,
  "Disgust": <Meh className="h-3 w-3" />,
  "Trust": <Heart className="h-3 w-3" />,
  "Anticipation": <Smile className="h-3 w-3" />
};

export const EmotionsLegend = () => {
  const [isOpen, setIsOpen] = useState(true);
  
  const emotions = [
    "Joy", "Sadness", "Anger", "Fear", 
    "Surprise", "Disgust", "Trust", "Anticipation"
  ];

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
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
            {emotions.map((emotion) => (
              <div key={emotion} className="flex items-center">
                <div 
                  className="w-2 h-2 rounded-full mr-1" 
                  style={{ backgroundColor: getEmotionColor(emotion) }}
                />
                <div className="flex items-center gap-1">
                  {emotionIconMap[emotion] || <Heart className="h-3 w-3" />}
                  <span>{emotion}</span>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
