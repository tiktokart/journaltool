
import { useState } from "react";
import { getEmotionColor } from "../../utils/embeddingUtils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLanguage } from "@/contexts/LanguageContext";

export const EmotionsLegend = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useLanguage();
  
  const emotions = [
    "Joy", "Sadness", "Anger", "Fear", 
    "Surprise", "Disgust", "Trust", "Anticipation"
  ];

  // Translate emotion name
  const getTranslatedEmotion = (emotion: string): string => {
    const lowerCaseEmotion = emotion.toLowerCase();
    if (t(lowerCaseEmotion)) {
      return t(lowerCaseEmotion);
    }
    return emotion;
  };

  return (
    <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm p-2 rounded-lg shadow-md text-xs z-10 border border-border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <div className="font-medium">{t("emotionalTones")}:</div>
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
                <span>{getTranslatedEmotion(emotion)}</span>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
