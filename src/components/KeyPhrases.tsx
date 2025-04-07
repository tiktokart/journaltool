
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface KeyPhrasesProps {
  data: Array<{ 
    text: string; 
    sentiment: "positive" | "neutral" | "negative"; 
    count: number 
  }>;
}

export const KeyPhrases = ({ data }: KeyPhrasesProps) => {
  // Group phrases by sentiment
  const positiveItems = data.filter(item => item.sentiment === "positive");
  const neutralItems = data.filter(item => item.sentiment === "neutral");
  const negativeItems = data.filter(item => item.sentiment === "negative");

  // Sort by count (importance) within each category
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

  // Render phrase group
  const renderPhraseGroup = (
    items: typeof data, 
    title: string, 
    sentimentType: "positive" | "neutral" | "negative"
  ) => (
    <div>
      <h3 className="font-medium text-lg mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No {sentimentType} phrases detected</p>
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
        <CardTitle>Key Phrases</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {renderPhraseGroup(positiveItems, "Positive Phrases", "positive")}
          {renderPhraseGroup(neutralItems, "Neutral Phrases", "neutral")}
          {renderPhraseGroup(negativeItems, "Negative Phrases", "negative")}
        </div>
        <div className="mt-6 text-sm text-center text-muted-foreground">
          Key phrases extracted from the document, grouped by sentiment and sized by frequency.
        </div>
      </CardContent>
    </Card>
  );
};
