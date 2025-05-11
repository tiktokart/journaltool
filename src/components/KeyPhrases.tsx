
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type KeyPhrase = {
  phrase: string;
  score: number;
  mentions?: number;
};

interface KeyPhrasesProps {
  data?: string[] | KeyPhrase[];
  keywords?: any[];  // Add this property to support the older API
  sourceDescription?: string;
}

export const KeyPhrases = ({ data = [], keywords = [], sourceDescription }: KeyPhrasesProps) => {
  const { t } = useLanguage();

  // Use keywords prop if data is empty
  const dataToUse = data.length > 0 ? data : keywords;

  // Normalize data to ensure consistent structure
  const normalizedData: KeyPhrase[] = dataToUse.map(item => {
    if (typeof item === 'string') {
      // Convert string items to KeyPhrase structure with default values
      return {
        phrase: item,
        score: 0.5, // Default middle score
      };
    } else if (typeof item === 'object' && item !== null) {
      // Handle the case where the item is an object but may have different property names
      if ('phrase' in item) {
        return item as KeyPhrase;
      } else if ('word' in item) {
        // Convert from word format to phrase format
        return {
          phrase: item.word,
          score: item.sentiment || 0.5
        };
      }
    }
    // Fallback for any other format
    return {
      phrase: String(item),
      score: 0.5
    };
  });

  // Group phrases by approximate score range
  const highImportance = normalizedData.filter(item => item.score >= 0.7);
  const mediumImportance = normalizedData.filter(item => item.score >= 0.4 && item.score < 0.7);
  const lowImportance = normalizedData.filter(item => item.score < 0.4);

  // Helper to render phrase badges
  const renderPhraseBadges = (phrases: KeyPhrase[], importance: "high" | "medium" | "low") => {
    if (!phrases.length) return <p className="text-sm text-muted-foreground">{t("noKeyPhrasesFound")}</p>;

    const colorClass = 
      importance === "high" ? "bg-yellow text-black" : 
      importance === "medium" ? "bg-yellow-soft text-black" : 
      "bg-slate-100 text-slate-800";

    return (
      <div className="flex flex-wrap gap-2">
        {phrases.map((phrase, index) => (
          <Badge 
            key={index} 
            className={`${colorClass} hover:${colorClass} font-normal py-1 px-2`}
          >
            {phrase.phrase}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <Card className="border border-border shadow-md bg-light-lavender">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-orange" />
          Key Phrases and Themes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {normalizedData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t("noKeyPhrasesExtracted")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2 text-black">Primary Themes</h3>
              {renderPhraseBadges(highImportance, "high")}
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2 text-black">Secondary Themes</h3>
              {renderPhraseBadges(mediumImportance, "medium")}
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2 text-black">Tertiary Themes</h3>
              {renderPhraseBadges(lowImportance, "low")}
            </div>
          </div>
        )}
        
        {sourceDescription && (
          <div className="flex items-center justify-center mt-6 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mr-1" />
            {sourceDescription}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
