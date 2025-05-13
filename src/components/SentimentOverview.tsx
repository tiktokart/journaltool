
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, HelpCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

interface SentimentOverviewProps {
  data: {
    overallSentiment: {
      score: number;
      label: string;
    };
    distribution: {
      positive: number;
      neutral: number;
      negative: number;
    };
    fileName?: string;
  };
  sourceDescription?: string;
}

export const SentimentOverview = ({ data, sourceDescription }: SentimentOverviewProps) => {
  const { t } = useLanguage();
  const [parsedScore, setParsedScore] = useState(0.5);
  const [sentimentLabel, setSentimentLabel] = useState("Neutral");
  const [distribution, setDistribution] = useState({
    positive: 33,
    neutral: 34,
    negative: 33
  });
  
  // Process and validate data on component load
  useEffect(() => {
    try {
      // Validate overall sentiment
      const score = data?.overallSentiment?.score;
      if (score !== undefined && !isNaN(score)) {
        setParsedScore(Math.max(0, Math.min(1, score))); // Clamp between 0-1
      }
      
      // Set sentiment label
      const label = data?.overallSentiment?.label || '';
      if (label) {
        setSentimentLabel(label);
      } else {
        // Generate label based on score
        if (parsedScore >= 0.7) setSentimentLabel("Very Positive");
        else if (parsedScore >= 0.55) setSentimentLabel("Positive");
        else if (parsedScore >= 0.45) setSentimentLabel("Neutral");
        else if (parsedScore >= 0.3) setSentimentLabel("Negative");
        else setSentimentLabel("Very Negative");
      }
      
      // Validate distribution values
      if (data?.distribution) {
        const positive = Math.max(1, data.distribution.positive || 33);
        const neutral = Math.max(1, data.distribution.neutral || 34);
        const negative = Math.max(1, data.distribution.negative || 33);
        
        // Normalize to make sure they add up to 100%
        const total = positive + neutral + negative;
        setDistribution({
          positive: Math.round((positive / total) * 100),
          neutral: Math.round((neutral / total) * 100),
          negative: Math.round((negative / total) * 100)
        });
      }
    } catch (error) {
      console.error("Error processing sentiment data:", error);
    }
  }, [data]);
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border shadow-sm bg-white">
        <CardHeader>
          <CardTitle>{t("overallSentiment")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <HelpCircle className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="font-semibold">{sentimentLabel}</p>
                <p className="text-sm text-muted-foreground">{t("scoreLabel")}: {(parsedScore * 100).toFixed(0)}%</p>
              </div>
            </div>
            <div className="h-16 w-16 rounded-full bg-purple-500 text-white flex items-center justify-center text-xl font-bold">
              {Math.round(parsedScore * 100)}
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
            <div 
              className="bg-purple-500 h-2.5 rounded-full"
              style={{ width: `${parsedScore * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("negative")}</span>
            <span>{t("neutral")}</span>
            <span>{t("positive")}</span>
          </div>
          
          {sourceDescription && (
            <div className="mt-4 flex items-center text-xs text-muted-foreground">
              <Info className="h-4 w-4 mr-1" />
              <p>Analysis with BERT Model</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="border shadow-sm bg-white">
        <CardHeader>
          <CardTitle>{t("sentimentDistribution")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{t("positive")}</span>
                <span className="text-sm text-muted-foreground">{distribution.positive}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-5 w-full">
                <div 
                  className="bg-green-400 h-5 rounded-full" 
                  style={{ width: `${distribution.positive}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{t("neutral")}</span>
                <span className="text-sm text-muted-foreground">{distribution.neutral}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-5 w-full">
                <div 
                  className="bg-blue-400 h-5 rounded-full" 
                  style={{ width: `${distribution.neutral}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{t("negative")}</span>
                <span className="text-sm text-muted-foreground">{distribution.negative}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-5 w-full">
                <div 
                  className="bg-red-400 h-5 rounded-full" 
                  style={{ width: `${distribution.negative}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center text-xs text-muted-foreground">
            <Info className="h-4 w-4 mr-1" />
            <p>Analysis with BERT Model</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
