
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface KeyPhrasesProps {
  data: Array<{ 
    text: string; 
    sentiment: "positive" | "neutral" | "negative"; 
    count: number 
  }>;
  sourceDescription?: string;
  maxWordsPerCategory?: number | null;
}

export const KeyPhrases = ({ 
  data, 
  sourceDescription, 
  maxWordsPerCategory = 30
}: KeyPhrasesProps) => {
  const { t } = useLanguage();
  
  // Group words by sentiment
  const positiveItems = data.filter(item => item.sentiment === "positive");
  const neutralItems = data.filter(item => item.sentiment === "neutral");
  const negativeItems = data.filter(item => item.sentiment === "negative");

  // Sort by count (frequency) within each category
  const sortByCount = (a: typeof data[0], b: typeof data[0]) => b.count - a.count;
  positiveItems.sort(sortByCount);
  neutralItems.sort(sortByCount);
  negativeItems.sort(sortByCount);

  // Get badge color based on sentiment
  const getBadgeVariant = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "bg-sentiment-positive text-white hover:bg-sentiment-positive/90";
      case "negative": return "bg-sentiment-negative text-white hover:bg-sentiment-negative/90";
      default: return "bg-sentiment-neutral text-white hover:bg-sentiment-neutral/90";
    }
  };

  // Render word group - limit to maxWordsPerCategory
  const renderWordGroup = (
    items: typeof data, 
    title: string, 
    sentimentType: "positive" | "neutral" | "negative"
  ) => {
    // Limit the number of words to display per category
    const displayItems = items.slice(0, maxWordsPerCategory || 30);
    
    // Get the correct "no words detected" message based on sentiment type
    const getNoWordsMessage = () => {
      if (sentimentType === "positive") return t("noPositiveWords");
      if (sentimentType === "negative") return t("noNegativeWords");
      return t("noNeutralWords");
    };
    
    return (
      <div>
        <h3 className="font-medium text-lg mb-3">{title} ({items.length})</h3>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{getNoWordsMessage()}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {displayItems.map((item, index) => (
              <Badge 
                key={index} 
                className={`text-sm py-1.5 ${getBadgeVariant(item.sentiment)}`}
                variant="secondary"
              >
                {item.text} ({item.count})
              </Badge>
            ))}
            {items.length > (maxWordsPerCategory || 30) && (
              <p className="text-xs text-muted-foreground mt-2 w-full">
                + {items.length - (maxWordsPerCategory || 30)} {t("moreWordsNotShown").replace("{sentiment}", sentimentType)}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-md w-full">
      <CardHeader>
        <CardTitle>{t("commonWordsBySentiment")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {renderWordGroup(positiveItems, t("positiveWords"), "positive")}
          {renderWordGroup(neutralItems, t("neutralWords"), "neutral")}
          {renderWordGroup(negativeItems, t("negativeWords"), "negative")}
        </div>
        <div className="mt-6 text-sm text-center text-muted-foreground">
          {sourceDescription ? (
            <div className="flex items-center justify-center">
              <Info className="h-4 w-4 mr-1" />
              {sourceDescription}
            </div>
          ) : (
            t("keywordsDescription")
          )}
        </div>
      </CardContent>
    </Card>
  );
};
