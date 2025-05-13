
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, HelpCircle } from "lucide-react";
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
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border shadow-sm bg-white">
        <CardHeader>
          <CardTitle>{t("overallSentiment")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <HelpCircle className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="font-semibold">{label}</p>
                <p className="text-sm text-muted-foreground">scoreLabel: {(score * 100).toFixed(0)}%</p>
              </div>
            </div>
            <div className="h-16 w-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold">
              {Math.round(score * 100)}
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
            <div 
              className="bg-blue-500 h-2.5 rounded-full"
              style={{ width: `${score * 100}%` }}
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
                <span className="text-sm text-muted-foreground">{positive}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-5 w-full">
                <div 
                  className="bg-yellow-400 h-5 rounded-full" 
                  style={{ width: `${positive}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{t("neutral")}</span>
                <span className="text-sm text-muted-foreground">{neutral}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-5 w-full">
                <div 
                  className="bg-yellow-400 h-5 rounded-full" 
                  style={{ width: `${neutral}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{t("negative")}</span>
                <span className="text-sm text-muted-foreground">{negative}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-5 w-full">
                <div 
                  className="bg-yellow-400 h-5 rounded-full" 
                  style={{ width: `${negative}%` }}
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
