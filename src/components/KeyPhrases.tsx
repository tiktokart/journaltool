
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
  data: string[] | KeyPhrase[];
  sourceDescription?: string;
}

export const KeyPhrases = ({ data = [], sourceDescription }: KeyPhrasesProps) => {
  const { t } = useLanguage();

  // Normalize data to ensure consistent structure
  const normalizedData: KeyPhrase[] = data.map(item => {
    if (typeof item === 'string') {
      // Convert string items to KeyPhrase structure with default values
      return {
        phrase: item,
        score: 0.5, // Default middle score
        mentions: 1
      };
    }
    // Already in KeyPhrase format
    return item as KeyPhrase;
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
            {phrase.mentions && phrase.mentions > 1 && (
              <span className="ml-1 text-xs opacity-70">({phrase.mentions})</span>
            )}
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
          {t("keyPhrasesAndThemes")}
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
              <h3 className="text-lg font-medium mb-2 text-black">{t("primaryThemes")}</h3>
              {renderPhraseBadges(highImportance, "high")}
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2 text-black">{t("secondaryThemes")}</h3>
              {renderPhraseBadges(mediumImportance, "medium")}
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2 text-black">{t("tertiaryThemes")}</h3>
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
