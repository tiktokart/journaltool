
import React from "react";
import { HelpCircle, Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/contexts/LanguageContext";

interface SentimentScoreCardProps {
  parsedScore: number;
  sentimentLabel: string;
}

const SentimentScoreCard = ({ parsedScore, sentimentLabel }: SentimentScoreCardProps) => {
  const { t } = useLanguage();

  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="mb-4">
        <h3 className="text-lg font-medium">{t("overallSentiment")}</h3>
      </div>
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
      
      <div className="mb-3">
        <Slider 
          value={[parsedScore * 100]} 
          max={100} 
          step={1}
          disabled={true}
          className="cursor-default"
        />
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{t("negative")}</span>
        <span>{t("neutral")}</span>
        <span>{t("positive")}</span>
      </div>
      
      <div className="mt-4 flex items-center text-xs text-muted-foreground">
        <Info className="h-4 w-4 mr-1" />
        <p>Analysis with BERT Model</p>
      </div>
    </div>
  );
};

export default SentimentScoreCard;
