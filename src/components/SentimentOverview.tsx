
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, AlertCircle, CheckCircle, HelpCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";

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
  
  const { score, label } = data.overallSentiment;
  const { positive, neutral, negative } = data.distribution;
  
  // Generate sentiment color based on score
  const getSentimentColor = () => {
    if (score >= 0.6) return "bg-sentiment-positive";
    if (score >= 0.4) return "bg-sentiment-neutral";
    return "bg-sentiment-negative";
  };
  
  // Generate sentiment icon based on label
  const getSentimentIcon = () => {
    if (label === "Positive") return <CheckCircle className="h-8 w-8 text-green-500" />;
    if (label === "Negative") return <AlertCircle className="h-8 w-8 text-red-500" />;
    return <HelpCircle className="h-8 w-8 text-blue-500" />;
  };
  
  const getScoreLabel = () => {
    if (score >= 0.75) return t("veryPositive");
    if (score >= 0.6) return t("positive");
    if (score >= 0.45) return t("neutral");
    if (score >= 0.3) return t("negative");
    return t("veryNegative");
  };
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border-0 shadow-md bg-light-lavender">
        <CardHeader>
          <CardTitle>{t("overallSentiment")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              {getSentimentIcon()}
              <div className="ml-4">
                <p className="font-semibold text-lg">{getScoreLabel()}</p>
                <p className="text-muted-foreground">{t("scoreLabel")}: {(score * 100).toFixed(0)}%</p>
              </div>
            </div>
            <div className={`${getSentimentColor()} h-14 w-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
              {(score * 100).toFixed(0)}
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div 
              className={`${getSentimentColor()} h-2.5 rounded-full transition-all duration-500 ease-out`} 
              style={{ width: `${score * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("negative")}</span>
            <span>{t("neutral")}</span>
            <span>{t("positive")}</span>
          </div>
          
          {sourceDescription && (
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <Info className="h-4 w-4 mr-1" />
              <p>{sourceDescription}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-md bg-light-lavender">
        <CardHeader>
          <CardTitle>{t("sentimentDistribution")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{t("positive")}</span>
                <span className="text-sm text-muted-foreground">{positive}%</span>
              </div>
              <Progress value={positive} className="h-2 bg-gray-200" indicatorClassName="bg-sentiment-positive" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{t("neutral")}</span>
                <span className="text-sm text-muted-foreground">{neutral}%</span>
              </div>
              <Progress value={neutral} className="h-2 bg-gray-200" indicatorClassName="bg-sentiment-neutral" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{t("negative")}</span>
                <span className="text-sm text-muted-foreground">{negative}%</span>
              </div>
              <Progress value={negative} className="h-2 bg-gray-200" indicatorClassName="bg-sentiment-negative" />
            </div>
          </div>
          
          {sourceDescription && (
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <Info className="h-4 w-4 mr-1" />
              <p>{sourceDescription}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
