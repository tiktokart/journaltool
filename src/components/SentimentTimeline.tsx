
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Info, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface TimelineEntry {
  page: number; 
  score: number;
  color?: string;
  event?: string;
  index?: number;
  time?: string;
  textSnippet?: string;
}

interface SentimentTimelineProps {
  data: Array<TimelineEntry>;
  sourceDescription?: string;
}

export const SentimentTimeline = ({ data, sourceDescription }: SentimentTimelineProps) => {
  const { t } = useLanguage();
  const [normalizedData, setNormalizedData] = useState<TimelineEntry[]>([]);
  const [averageSentiment, setAverageSentiment] = useState(0.5);
  const [isDataValid, setIsDataValid] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<TimelineEntry | null>(null);

  useEffect(() => {
    try {
      // Validate the data
      if (!Array.isArray(data) || data.length === 0) {
        console.warn("SentimentTimeline received invalid data:", data);
        setIsDataValid(false);
        return;
      }

      // Process and normalize the data
      const processed: TimelineEntry[] = data.map((item, index) => {
        if (typeof item === 'object' && item !== null) {
          return {
            ...item,
            page: item.page || index + 1,
            score: Math.max(0, Math.min(1, item.score || 0.5)),
            time: item.time || `Section ${index + 1}`,
            textSnippet: item.textSnippet || item.event || `Content point ${index + 1}`
          };
        }
        return {
          page: index + 1,
          score: 0.5,
          time: `Section ${index + 1}`,
          index,
          textSnippet: `Content point ${index + 1}`
        };
      });
      
      setNormalizedData(processed);
      
      // Calculate average sentiment
      const avg = processed.length > 0 
        ? processed.reduce((acc, item) => acc + item.score, 0) / processed.length
        : 0.5;
      setAverageSentiment(avg);
      
      setIsDataValid(true);
    } catch (error) {
      console.error("Error processing timeline data:", error);
      setIsDataValid(false);
    }
  }, [data]);

  const calculateTrend = () => {
    if (normalizedData.length < 2) return "stable";
    
    const firstHalf = normalizedData.slice(0, Math.floor(normalizedData.length / 2));
    const secondHalf = normalizedData.slice(Math.floor(normalizedData.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, point) => sum + point.score, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, point) => sum + point.score, 0) / secondHalf.length;
    
    const difference = secondHalfAvg - firstHalfAvg;
    
    if (difference > 0.08) return "improving";
    if (difference < -0.08) return "declining";
    return "stable";
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-100">
          <p className="font-medium text-sm">{data.time || data.event || `Point ${data.page}`}</p>
          <p className="text-sm text-muted-foreground">
            Sentiment: {(data.score * 100).toFixed(0)}%
          </p>
          {data.textSnippet && (
            <p className="text-xs mt-1 max-w-[200px] text-muted-foreground italic">
              "{data.textSnippet}"
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-0 shadow-md w-full bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-orange-500" />
            <CardTitle>Sentiment Timeline</CardTitle>
          </div>
          
          <Badge 
            variant="outline" 
            className={`${
              calculateTrend() === 'improving' ? 'bg-green-50 text-green-700' :
              calculateTrend() === 'declining' ? 'bg-red-50 text-red-700' :
              'bg-blue-50 text-blue-700'
            }`}
          >
            {calculateTrend() === 'improving' ? 'Improving Trend' :
             calculateTrend() === 'declining' ? 'Declining Trend' :
             'Stable Trend'}
          </Badge>
        </div>
        {sourceDescription && (
          <p className="text-sm text-muted-foreground">{sourceDescription}</p>
        )}
      </CardHeader>
      <CardContent>
        {!isDataValid || normalizedData.length === 0 ? (
          <div className="h-64 w-full flex items-center justify-center">
            <p className="text-muted-foreground">{t("noDataAvailable")}</p>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={normalizedData}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#9b87f5" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis 
                  dataKey="page" 
                  tick={false}
                  axisLine={{ stroke: '#eaeaea' }}
                />
                <YAxis 
                  domain={[0, 1]} 
                  ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
                  tickFormatter={(value) => {
                    if (value === 0) return "0";
                    if (value === 0.2) return "0.2";
                    if (value === 0.4) return "0.4";
                    if (value === 0.6) return "0.6";
                    if (value === 0.8) return "0.8";
                    if (value === 1) return "1";
                    return "";
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine 
                  y={0.6} 
                  stroke="#27AE60" 
                  strokeDasharray="3 3" 
                  label={{ value: "Positive", position: 'insideLeft', fontSize: 10, fill: "#27AE60" }} 
                />
                <ReferenceLine 
                  y={0.4} 
                  stroke="#E74C3C" 
                  strokeDasharray="3 3" 
                  label={{ value: "Negative", position: 'insideLeft', fontSize: 10, fill: "#E74C3C" }} 
                />
                <ReferenceLine 
                  y={averageSentiment} 
                  stroke="#FFB347" 
                  strokeDasharray="3 3" 
                  label={{ value: "Avg", position: 'right', fontSize: 10 }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#9b87f5" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#sentimentGradient)"
                  activeDot={{ 
                    r: 6, 
                    onClick: (props: any) => {
                      if (props && props.payload) {
                        setSelectedPoint(props.payload === selectedPoint ? null : props.payload);
                      }
                    },
                    style: { cursor: 'pointer' }
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {selectedPoint && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <h4 className="font-medium">{selectedPoint.time || `Point ${selectedPoint.page}`}</h4>
            <p className="text-sm mt-1">
              {selectedPoint.textSnippet || "No text available"}
            </p>
          </div>
        )}
        
        <div className="mt-4 flex items-center text-xs text-muted-foreground">
          <Info className="h-4 w-4 mr-1" />
          <span>Analysis with BERT Model</span>
        </div>
      </CardContent>
    </Card>
  );
};
