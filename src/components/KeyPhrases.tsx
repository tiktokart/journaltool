
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface KeyPhrasesProps {
  data: Array<{ 
    text: string; 
    sentiment: "positive" | "neutral" | "negative"; 
    count: number 
  }>;
  sourceDescription?: string; // Add this to show where words came from
  maxWordsPerCategory?: number; // Add option to control how many words are displayed per category
}

export const KeyPhrases = ({ 
  data, 
  sourceDescription, 
  maxWordsPerCategory = 30 // Default to showing more words
}: KeyPhrasesProps) => {
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

  // Render word group with limited amount based on maxWordsPerCategory
  const renderWordGroup = (
    items: typeof data, 
    title: string, 
    sentimentType: "positive" | "neutral" | "negative"
  ) => {
    // Limit the number of words to display per category
    const displayItems = items.slice(0, maxWordsPerCategory);
    
    return (
      <div>
        <h3 className="font-medium text-lg mb-3">{title} ({items.length})</h3>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No {sentimentType} words detected</p>
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
            {items.length > maxWordsPerCategory && (
              <p className="text-xs text-muted-foreground mt-2 w-full">
                + {items.length - maxWordsPerCategory} more {sentimentType} words not shown
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
        <CardTitle>Common Words by Sentiment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {renderWordGroup(positiveItems, "Positive Words", "positive")}
          {renderWordGroup(neutralItems, "Neutral Words", "neutral")}
          {renderWordGroup(negativeItems, "Negative Words", "negative")}
        </div>
        <div className="mt-6 text-sm text-center text-muted-foreground">
          {sourceDescription ? (
            <div className="flex items-center justify-center">
              <Info className="h-4 w-4 mr-1" />
              {sourceDescription}
            </div>
          ) : (
            "All commonly used words in your document, grouped by sentiment and sized by frequency."
          )}
        </div>
      </CardContent>
    </Card>
  );
};
