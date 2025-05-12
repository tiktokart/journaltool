
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LineChart, Line } from "recharts";
import { Info, Calendar, ArrowRight } from "lucide-react";
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
  const [energyFlow, setEnergyFlow] = useState<{positive: number, negative: number, neutral: number}>({
    positive: 0,
    negative: 0,
    neutral: 0
  });

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
          // Add a page number if it doesn't exist (using index + 1)
          return {
            ...item,
            page: item.page || index + 1,
            // Ensure score is between 0 and 1
            score: Math.max(0, Math.min(1, item.score || 0.5)),
            // Make sure we have a time property
            time: item.time || `Section ${index + 1}`
          };
        }
        // Fallback for unexpected data format
        return {
          page: index + 1,
          score: 0.5,
          time: `Section ${index + 1}`,
          index
        };
      });

      setNormalizedData(processed);
      
      // Calculate average sentiment
      const avg = processed.length > 0 
        ? processed.reduce((acc, item) => acc + item.score, 0) / processed.length
        : 0.5;
      setAverageSentiment(avg);
      
      // Calculate energy flow
      let positive = 0;
      let negative = 0;
      let neutral = 0;
      
      processed.forEach(item => {
        if (item.score > 0.6) positive++;
        else if (item.score < 0.4) negative++;
        else neutral++;
      });
      
      setEnergyFlow({
        positive,
        negative,
        neutral
      });
      
      setIsDataValid(true);
    } catch (error) {
      console.error("Error processing timeline data:", error);
      setIsDataValid(false);
    }
  }, [data]);
  
  // Get color from data point or calculate based on score
  const getColor = (score: number, defaultColor?: string) => {
    // Use provided color if available
    if (defaultColor) return defaultColor;
    
    // Otherwise calculate based on score
    if (score >= 0.6) return "#27AE60";
    if (score >= 0.4) return "#3498DB";
    return "#E74C3C";
  };
  
  const handlePointClick = (point: TimelineEntry) => {
    setSelectedPoint(point === selectedPoint ? null : point);
  };

  const calculateTrend = () => {
    if (normalizedData.length < 2) return "stable";
    
    const firstHalf = normalizedData.slice(0, Math.floor(normalizedData.length / 2));
    const secondHalf = normalizedData.slice(Math.floor(normalizedData.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, point) => sum + point.score, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, point) => sum + point.score, 0) / secondHalf.length;
    
    const difference = secondHalfAvg - firstHalfAvg;
    
    if (difference > 0.1) return "improving";
    if (difference < -0.1) return "declining";
    return "stable";
  };

  return (
    <Card className="border-0 shadow-md w-full bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-orange font-pacifico flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Emotional Flow Timeline
          </CardTitle>
          
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
          <p className="text-sm text-muted-foreground font-georgia">{sourceDescription}</p>
        )}
      </CardHeader>
      <CardContent>
        {!isDataValid || normalizedData.length === 0 ? (
          <div className="h-80 w-full flex items-center justify-center">
            <p className="text-muted-foreground font-georgia">{t("noDataAvailable")}</p>
          </div>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-3 gap-4 text-center">
              <div className="border rounded-md p-2 bg-green-50">
                <div className="text-green-600 font-medium">Positive Energy</div>
                <div className="text-2xl font-semibold">{energyFlow.positive}</div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>
              <div className="border rounded-md p-2 bg-blue-50">
                <div className="text-blue-600 font-medium">Neutral Energy</div>
                <div className="text-2xl font-semibold">{energyFlow.neutral}</div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>
              <div className="border rounded-md p-2 bg-red-50">
                <div className="text-red-600 font-medium">Negative Energy</div>
                <div className="text-2xl font-semibold">{energyFlow.negative}</div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={normalizedData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="page" 
                    label={{ value: "Content Flow", position: 'insideBottom', offset: -10 }} 
                    // Use time property for labels
                    tickFormatter={(value) => {
                      const point = normalizedData.find(d => d.page === value);
                      return point?.time ? point.time.substring(0, 10) + '...' : `Point ${value}`;
                    }}
                    // Adjust for better readability if we have many points
                    tick={{ 
                      fontSize: 10,
                      textAnchor: normalizedData.length > 7 ? 'end' : 'middle',
                      transform: normalizedData.length > 7 ? 'rotate(-45)' : 'rotate(0)'
                    }}
                    height={60}
                  />
                  <YAxis 
                    domain={[0, 1]} 
                    label={{ value: "Emotional Energy", position: 'insideLeft', angle: -90, offset: 10 }}
                    ticks={[0, 0.25, 0.5, 0.75, 1]}
                    tickFormatter={(value) => {
                      if (value === 1) return "Very Positive";
                      if (value === 0.75) return "Positive";
                      if (value === 0.5) return "Neutral";
                      if (value === 0.25) return "Negative";
                      if (value === 0) return "Very Negative";
                      return "";
                    }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [
                      `Sentiment Score: ${value.toFixed(2)}`,
                      "Emotional Energy"
                    ]}
                    labelFormatter={(label) => {
                      const point = normalizedData.find(d => d.page === label);
                      return point?.time ? `${point.time}: ${point.event || ''}` : `Point ${label}`;
                    }}
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
                    label={{ value: `Average`, position: 'right', className: "font-georgia text-xs" }} 
                  />
                  <ReferenceLine 
                    y={0.6} 
                    stroke="#27AE60" 
                    strokeDasharray="3 3" 
                    label={{ value: "Positive Threshold", position: 'left', fill: '#27AE60', className: "font-georgia text-xs" }} 
                  />
                  <ReferenceLine 
                    y={0.4} 
                    stroke="#E74C3C" 
                    strokeDasharray="3 3" 
                    label={{ value: "Negative Threshold", position: 'left', fill: '#E74C3C', className: "font-georgia text-xs" }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    activeDot={{ 
                      onClick: (props: any) => {
                        if (props && props.payload) {
                          handlePointClick(props.payload);
                        }
                      },
                      style: { cursor: 'pointer' }
                    }}
                    dot={(props: any) => {
                      if (!props || !props.cx || !props.cy) return null;
                      const { cx, cy, payload } = props;
                      if (!payload) return null;
                      
                      // Use the provided color if available, otherwise fall back to calculated color
                      const dotColor = payload.color || getColor(payload.score);
                      const isSelected = selectedPoint && selectedPoint.page === payload.page;
                      
                      return (
                        <circle 
                          key={`dot-${cx}-${cy}`}
                          cx={cx} 
                          cy={cy} 
                          r={isSelected ? 7 : 5} 
                          fill={dotColor} 
                          stroke="white" 
                          strokeWidth={isSelected ? 3 : 2} 
                          style={{ cursor: 'pointer' }}
                        />
                      );
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {selectedPoint && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <h4 className="font-medium">{selectedPoint.time}</h4>
                <p className="text-sm mt-1">{selectedPoint.event}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-muted-foreground">Sentiment score:</span>
                  <span 
                    className={`ml-2 text-sm font-medium ${
                      selectedPoint.score >= 0.6 ? 'text-green-600' :
                      selectedPoint.score <= 0.4 ? 'text-red-600' :
                      'text-blue-600'
                    }`}
                  >
                    {selectedPoint.score.toFixed(2)} ({
                      selectedPoint.score >= 0.8 ? 'Very Positive' :
                      selectedPoint.score >= 0.6 ? 'Positive' :
                      selectedPoint.score <= 0.2 ? 'Very Negative' :
                      selectedPoint.score <= 0.4 ? 'Negative' :
                      'Neutral'
                    })
                  </span>
                </div>
              </div>
            )}
          </>
        )}
        
        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground font-georgia border-t pt-4">
          <div className="flex items-center">
            <ArrowRight className="h-4 w-4 mr-1" />
            <span>Text progresses left to right</span>
          </div>
          
          <div className="flex items-center">
            <Info className="h-4 w-4 mr-1" />
            <span>Click on points for details</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
