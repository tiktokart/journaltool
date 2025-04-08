
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface EntitySentimentProps {
  data: Array<{ name: string; score: number; mentions: number }>;
  sourceDescription?: string; // Add this to show where data came from
}

export const EntitySentiment = ({ data, sourceDescription }: EntitySentimentProps) => {
  const { t } = useLanguage();
  
  // Sort data by score for better visualization
  const sortedData = [...data].sort((a, b) => b.score - a.score);

  // Determine color for each bar based on score
  const getColor = (score: number) => {
    if (score >= 0.6) return "#27AE60";
    if (score >= 0.4) return "#3498DB";
    return "#E74C3C";
  };

  return (
    <Card className="border-0 shadow-md w-full">
      <CardHeader>
        <CardTitle>{t("themeAnalysisTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-80 w-full flex items-center justify-center">
            <p className="text-muted-foreground">{t("noThemeDataAvailable")}</p>
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedData}
                layout="vertical"
                margin={{ top: 20, right: 50, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                <XAxis 
                  type="number" 
                  domain={[0, 1]} 
                  ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]} 
                  label={{ value: t("sentimentScore"), position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => [
                    `${t("score")}: ${value.toFixed(2)}`, ""
                  ]}
                  contentStyle={{ 
                    borderRadius: '0.5rem',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {sortedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry.score)} />
                  ))}
                  <LabelList dataKey="score" position="right" formatter={(value: number) => value.toFixed(2)} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="mt-4 text-sm text-center text-muted-foreground">
          {sourceDescription ? (
            <div className="flex items-center justify-center">
              <Info className="h-4 w-4 mr-1" />
              {sourceDescription}
            </div>
          ) : (
            t("themeAnalysisDescription")
          )}
        </div>
      </CardContent>
    </Card>
  );
};
