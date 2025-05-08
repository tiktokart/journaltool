
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TimelineEntry {
  page: number; 
  score: number;
  color?: string;
  event?: string;
  index?: number;
}

interface SentimentTimelineProps {
  data: Array<TimelineEntry>;
  sourceDescription?: string;
}

export const SentimentTimeline = ({ data, sourceDescription }: SentimentTimelineProps) => {
  const { t } = useLanguage();
  
  // Normalize data to ensure it's in the correct format
  const normalizedData: TimelineEntry[] = Array.isArray(data) ? 
    data.map((item, index) => {
      if (typeof item === 'object' && item !== null) {
        // Add a page number if it doesn't exist (using index + 1)
        return {
          ...item,
          page: item.page || index + 1,
          // Ensure score is between 0 and 1
          score: Math.max(0, Math.min(1, item.score || 0.5))
        };
      }
      // Fallback for unexpected data format
      return {
        page: index + 1,
        score: 0.5,
        index
      };
    }) : [];
  
  // Get color from data point or calculate based on score
  const getColor = (score: number, defaultColor?: string) => {
    // Use provided color if available
    if (defaultColor) return defaultColor;
    
    // Otherwise calculate based on score
    if (score >= 0.6) return "#27AE60";
    if (score >= 0.4) return "#3498DB";
    return "#E74C3C";
  };

  // Calculate average sentiment
  const averageSentiment = normalizedData.length > 0 
    ? normalizedData.reduce((acc, item) => acc + item.score, 0) / normalizedData.length
    : 0.5;

  return (
    <Card className="border-0 shadow-md w-full bg-white">
      <CardHeader>
        <CardTitle className="text-orange">{t("sentimentTimeline")}</CardTitle>
        {sourceDescription && (
          <p className="text-sm text-muted-foreground">{sourceDescription}</p>
        )}
      </CardHeader>
      <CardContent>
        {normalizedData.length === 0 ? (
          <div className="h-80 w-full flex items-center justify-center">
            <p className="text-muted-foreground">{t("noDataAvailable")}</p>
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={normalizedData}
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
                  formatter={(value: number, name: string, props: any) => [
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
                    if (!props || !props.cx || !props.cy) return null;
                    const { cx, cy, payload } = props;
                    if (!payload) return null;
                    
                    // Use the provided color if available, otherwise fall back to calculated color
                    const dotColor = payload.color || getColor(payload.score);
                    return (
                      <circle 
                        cx={cx} 
                        cy={cy} 
                        r={5} 
                        fill={dotColor} 
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
