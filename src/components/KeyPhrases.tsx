
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface KeyPhrasesProps {
  data: Array<{ 
    phrase: string; 
    sentiment: number;
    relevance: number;
    occurrences: number;
  }>;
  sourceDescription?: string; // Add this to show where words came from
}

export const KeyPhrases = ({ data, sourceDescription }: KeyPhrasesProps) => {
  // Group words by sentiment
  const positiveItems = data ? data.filter(item => item.sentiment >= 0.6).map(item => ({
    text: item.phrase,
    sentiment: "positive" as const,
    count: item.occurrences
  })) : [];
  
  const neutralItems = data ? data.filter(item => item.sentiment < 0.6 && item.sentiment >= 0.4).map(item => ({
    text: item.phrase,
    sentiment: "neutral" as const,
    count: item.occurrences
  })) : [];
  
  const negativeItems = data ? data.filter(item => item.sentiment < 0.4).map(item => ({
    text: item.phrase,
    sentiment: "negative" as const,
    count: item.occurrences
  })) : [];

  // Sort by count (frequency) within each category
  const sortByCount = (a: {text: string, sentiment: string, count: number}, b: {text: string, sentiment: string, count: number}) => b.count - a.count;
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

  // Render word group
  const renderWordGroup = (
    items: Array<{text: string, sentiment: string, count: number}>, 
    title: string, 
    sentimentType: "positive" | "neutral" | "negative"
  ) => (
    <div>
      <h3 className="font-medium text-lg mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No {sentimentType} words detected</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <Badge 
              key={index} 
              className={`text-sm py-1.5 ${getBadgeVariant(item.sentiment)}`}
              variant="secondary"
            >
              {item.text} ({item.count})
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card className="border-0 shadow-md w-full">
      <CardHeader>
        <CardTitle>Most Common Words</CardTitle>
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
