
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Point } from "@/types/embedding";

interface WellbeingResourcesProps {
  embeddingPoints: Point[];
}

export const WellbeingResources: React.FC<WellbeingResourcesProps> = ({ 
  embeddingPoints
}) => {
  const { t } = useLanguage();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  useEffect(() => {
    // If we have embedding points, analyze them for negative emotions
    if (embeddingPoints && embeddingPoints.length > 0) {
      const negativePoints = embeddingPoints.filter(
        point => point.sentiment < 0.4 || 
        ["Sadness", "Fear", "Anger", "Disgust"].includes(point.emotionalTone || "")
      );
      
      const suggestionsToShow: string[] = [];
      
      // Generate suggestions based on negative emotions found
      if (negativePoints.length > 0) {
        // Look for specific negative words to give targeted suggestions
        const wordsToCheck = [
          { words: ["anxious", "anxiety", "worry", "stress", "stressed"], 
            suggestion: "Try deep breathing exercises or meditation to reduce anxiety." },
          { words: ["sad", "depression", "depressed", "unhappy", "upset"], 
            suggestion: "Consider speaking with a friend or therapist about your feelings of sadness." },
          { words: ["angry", "anger", "frustrated", "annoyed", "mad"], 
            suggestion: "Physical activity can help release anger in a healthy way." },
          { words: ["tired", "exhausted", "fatigue", "sleep", "insomnia"], 
            suggestion: "Focus on improving your sleep hygiene and establishing a regular sleep schedule." },
          { words: ["lonely", "alone", "isolated", "disconnected"], 
            suggestion: "Reach out to an old friend or join a community group to build connections." },
          { words: ["pain", "hurt", "ache", "headache", "sick"], 
            suggestion: "Remember to take care of your physical health and see a doctor if needed." },
          { words: ["work", "job", "career", "boss", "overwhelmed"], 
            suggestion: "Try setting boundaries at work and practicing time management." }
        ];
        
        // Check for matches in the negative points
        negativePoints.forEach(point => {
          wordsToCheck.forEach(wordGroup => {
            if (wordGroup.words.includes(point.word.toLowerCase()) && 
                !suggestionsToShow.includes(wordGroup.suggestion)) {
              suggestionsToShow.push(wordGroup.suggestion);
            }
          });
        });
        
        // Add some general suggestions if we don't have enough specific ones
        if (suggestionsToShow.length < 2) {
          suggestionsToShow.push("Practice self-compassion and remember it's okay to have difficult emotions.");
          
          if (negativePoints.length > 3) {
            suggestionsToShow.push("Consider journaling about your emotions to better understand them.");
          }
        }
      } else {
        // If no negative points found, give positive reinforcement
        suggestionsToShow.push("You're doing great. Keep working on yourself.");
      }
      
      // Limit to 5 suggestions
      setSuggestions(suggestionsToShow.slice(0, 5));
    } else {
      setSuggestions(["You're doing great. Keep working on yourself."]);
    }
  }, [embeddingPoints]);
  
  return (
    <Card className="border border-border shadow-md bg-yellow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl">
          <Heart className="h-5 w-5 mr-2 text-orange" />
          Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            "You're doing great. Keep working on yourself."
          </p>
        ) : (
          <ul className="space-y-2">
            {suggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-orange mt-0.5 mr-2 flex-shrink-0" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
