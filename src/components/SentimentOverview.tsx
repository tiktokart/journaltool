
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Info } from "lucide-react"; 
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
  sourceDescription?: string; // Add this to show where data came from
}

export const SentimentOverview = ({ data, sourceDescription }: SentimentOverviewProps) => {
  const { t } = useLanguage();
  const { overallSentiment, distribution, fileName } = data;
  
  // Prepare data for pie chart
  const pieData = [
    { name: t("positive"), value: distribution.positive, color: "#27AE60" },
    { name: t("neutral"), value: distribution.neutral, color: "#3498DB" },
    { name: t("negative"), value: distribution.negative, color: "#E74C3C" },
  ];

  // Determine sentiment color
  const getSentimentColor = (score: number) => {
    if (score >= 0.6) return "bg-sentiment-positive";
    if (score >= 0.4) return "bg-sentiment-neutral";
    return "bg-sentiment-negative";
  };

  const sentimentColor = getSentimentColor(overallSentiment.score);
  
  // Translate sentiment label
  const getTranslatedSentiment = (label: string): string => {
    const key = label.toLowerCase().replace(/\s+/g, '');
    if (t(key)) {
      return t(key);
    }
    return label;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-0 shadow-md md:col-span-1">
        <CardHeader>
          <CardTitle>{t("overallSentiment")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <div className="w-32 h-32 rounded-full border-8 border-muted flex items-center justify-center mb-6">
            <div className={`w-24 h-24 rounded-full ${sentimentColor} flex items-center justify-center text-white`}>
              <span className="text-2xl font-bold">
                {Math.round(overallSentiment.score * 100)}%
              </span>
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-2">{getTranslatedSentiment(overallSentiment.label)}</h3>
          <p className="text-sm text-muted-foreground text-center">
            {fileName ? (
              <>{t("documentWithName")} <strong>{fileName}</strong> {t("hasSentiment")} {getTranslatedSentiment(overallSentiment.label.toLowerCase())} {t("sentiment")}</>
            ) : (
              <>{t("documentSentiment")} {getTranslatedSentiment(overallSentiment.label.toLowerCase())} {t("sentiment")}</>
            )}
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md md:col-span-2">
        <CardHeader>
          <CardTitle>{t("sentimentDistribution")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, t("sentiment")]}
                  contentStyle={{ 
                    borderRadius: '0.5rem',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full md:w-1/2 space-y-4">
            {pieData.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-muted-foreground">{item.value}%</span>
                </div>
                <Progress 
                  value={item.value} 
                  className="h-2"
                  style={{ backgroundColor: `${item.color}40` }} 
                />
              </div>
            ))}
          </div>
        </CardContent>
        {sourceDescription && (
          <div className="px-6 pb-4 text-sm text-center text-muted-foreground">
            <div className="flex items-center justify-center">
              <Info className="h-4 w-4 mr-1" />
              {sourceDescription}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
