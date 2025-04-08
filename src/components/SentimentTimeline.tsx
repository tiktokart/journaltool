
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SentimentTimelineProps {
  data: Array<{ page: number; score: number }>;
  sourceDescription?: string; // Add this to show where data came from
}

export const SentimentTimeline = ({ data, sourceDescription }: SentimentTimelineProps) => {
  const { t } = useLanguage();
  
  // Determine color for each point based on score
  const getColor = (score: number) => {
    if (score >= 0.6) return "#27AE60";
    if (score >= 0.4) return "#3498DB";
    return "#E74C3C";
  };

  // Calculate average sentiment
  const averageSentiment = data.length > 0 
    ? data.reduce((acc, item) => acc + item.score, 0) / data.length
    : 0.5;

  return (
    <Card className="border-0 shadow-md w-full">
      <CardHeader>
        <CardTitle>{t("sentimentTimeline")}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-80 w-full flex items-center justify-center">
            <p className="text-muted-foreground">{t("noDataAvailable")}</p>
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="page" 
                  label={{ value: t("pageNumber"), position: 'insideBottom', offset: -10 }} 
                />
                <YAxis 
                  domain={[0, 1]} 
                  label={{ value: t("sentimentScore"), angle: -90, position: 'insideLeft', offset: -5 }}
                />
                <Tooltip 
                  formatter={(value: number) => [
                    `${t("score")}: ${value.toFixed(2)}`,
                    t("sentiment")
                  ]}
                  labelFormatter={(label) => `${t("page")} ${label}`}
                  contentStyle={{ 
                    borderRadius: '0.5rem',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <ReferenceLine 
                  y={averageSentiment} 
                  stroke="#8884d8" 
                  strokeDasharray="3 3" 
                  label={{ value: `${t("average")}: ${averageSentiment.toFixed(2)}`, position: 'right' }} 
                />
                <ReferenceLine 
                  y={0.6} 
                  stroke="#27AE60" 
                  strokeDasharray="3 3" 
                  label={{ value: t("positive"), position: 'left', fill: '#27AE60' }} 
                />
                <ReferenceLine 
                  y={0.4} 
                  stroke="#E74C3C" 
                  strokeDasharray="3 3" 
                  label={{ value: t("negative"), position: 'left', fill: '#E74C3C' }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#8884d8" 
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    return (
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={5} 
                        fill={getColor(payload.score)} 
                        stroke="white" 
                        strokeWidth={2} 
                      />
                    );
                  }}
                />
              </AreaChart>
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
            t("timelineDescription")
          )}
        </div>
      </CardContent>
    </Card>
  );
};
