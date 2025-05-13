
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine, TooltipProps } from "recharts";
import { useEffect, useState } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface JournalSentimentChartProps {
  timelineData: {
    date: string;
    sentiment: number;
    textSnippet?: string; // Text snippets for significant points
  }[];
}

const JournalSentimentChart = ({ timelineData }: JournalSentimentChartProps) => {
  const [normalizedData, setNormalizedData] = useState<any[]>([]);
  const [averageSentiment, setAverageSentiment] = useState(0.5);
  const [significantPoints, setSignificantPoints] = useState<any[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<any | null>(null);

  // Process and normalize data
  useEffect(() => {
    if (!timelineData || timelineData.length === 0) {
      // Create sample data if none provided
      const sampleData = [
        { date: "Jan 01", sentiment: 0.4, textSnippet: "Started the month feeling down" },
        { date: "Jan 08", sentiment: 0.45, textSnippet: "Slight improvement in mood" },
        { date: "Jan 15", sentiment: 0.52, textSnippet: "Working through challenges" },
        { date: "Jan 22", sentiment: 0.6, textSnippet: "Made significant progress" },
        { date: "Jan 29", sentiment: 0.7, textSnippet: "Feeling much more positive" }
      ];
      setNormalizedData(sampleData);
      
      // Calculate average for sample data
      const avg = sampleData.reduce((sum, item) => sum + item.sentiment, 0) / sampleData.length;
      setAverageSentiment(avg);
      
      // Find significant points in sample data
      const significant = sampleData.filter((item, index, arr) => {
        if (index === 0 || index === arr.length - 1) return true;
        const prevItem = arr[index - 1];
        const nextItem = arr[index + 1];
        const diffPrev = Math.abs(item.sentiment - prevItem.sentiment);
        const diffNext = Math.abs(item.sentiment - nextItem.sentiment);
        return diffPrev > 0.08 || diffNext > 0.08 || (item.sentiment > 0.7) || (item.sentiment < 0.3);
      });
      setSignificantPoints(significant);
      return;
    }
    
    // Process actual data
    const processed = timelineData.map((item, index) => ({
      ...item,
      sentiment: Math.max(0, Math.min(1, item.sentiment || 0.5)),  // Ensure sentiment is between 0-1
      sequencePoint: index + 1 // Add sequence points for X-axis
    }));
    setNormalizedData(processed);
    
    // Calculate average sentiment
    const avg = processed.length > 0
      ? processed.reduce((sum, item) => sum + item.sentiment, 0) / processed.length
      : 0.5;
    setAverageSentiment(avg);
    
    // Enhanced algorithm to find significant points based on sentiment changes
    const significant = processed.length > 2
      ? processed.filter((item, index, arr) => {
          if (index === 0 || index === arr.length - 1) return true;
          
          const prevItem = arr[index - 1];
          const nextItem = index + 1 < arr.length ? arr[index + 1] : null;
          const diffPrev = Math.abs(item.sentiment - prevItem.sentiment);
          const diffNext = nextItem ? Math.abs(item.sentiment - nextItem.sentiment) : 0;
          
          // Check if this is a significant change or emotional peak/valley
          return diffPrev > 0.08 || diffNext > 0.08 || 
                (item.sentiment > 0.7) || (item.sentiment < 0.3);
        })
      : processed;
    setSignificantPoints(significant);
  }, [timelineData]);

  // Enhanced tooltip with better styling and text snippets
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md max-w-xs">
          <p className="text-sm font-semibold mb-1">{data.date}</p>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <p className="font-medium">
              Sentiment: <span className="text-purple-700">{(data.sentiment * 100).toFixed(0)}%</span>
            </p>
          </div>
          {data.textSnippet && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs italic font-georgia">
                "{data.textSnippet}"
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Determine text position
  const getTextYPosition = (sentiment: number, index: number, total: number) => {
    // Alternate between top and bottom for better readability
    return sentiment > 0.5 ? 15 + (index % 2) * 15 : 70 + (index % 2) * 15;
  };

  return (
    <div className="h-full w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={normalizedData}
          margin={{ top: 30, right: 30, left: 20, bottom: 30 }}
          onClick={(data) => {
            if (data?.activePayload?.[0]?.payload) {
              setSelectedPoint(data.activePayload[0].payload);
            }
          }}
        >
          <defs>
            <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#9b87f5" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          
          {/* X-Axis with improved labels */}
          <XAxis 
            dataKey="sequencePoint"
            tick={{ fontSize: 10 }} 
            tickLine={false} 
            axisLine={{ stroke: '#eaeaea' }}
            label={{ value: "sequencePoint", position: "insideBottom", offset: -10, fontSize: 10 }}
          />
          
          {/* Y-Axis with emotion labels */}
          <YAxis 
            domain={[0, 1]} 
            ticks={[0, 0.25, 0.5, 0.75, 1]}
            tick={{ fontSize: 10 }}
            width={80}
            tickFormatter={(value) => {
              if (value === 1) return "Very Positive";
              if (value === 0.75) return "Positive";
              if (value === 0.5) return "Neutral";
              if (value === 0.25) return "Negative";
              if (value === 0) return "Very Negative";
              return "";
            }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* Reference lines */}
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
            stroke="#9b87f5"
            strokeDasharray="3 3"
            label={{ value: "Average", position: 'insideRight', fontSize: 10 }}
          />
          
          {/* Enhanced area chart */}
          <Area
            type="monotone"
            dataKey="sentiment"
            stroke="#9b87f5"
            strokeWidth={2}
            fill="url(#colorSentiment)"
            activeDot={{ 
              r: 8, 
              fill: '#9b87f5', 
              stroke: '#fff', 
              strokeWidth: 2,
              onClick: (data: any) => {
                setSelectedPoint(data.payload);
              }
            }}
            dot={(props: any) => {
              if (!props || !props.cx || !props.cy || !props.payload) return null;
              
              // Check if this is a significant point to display
              const isSignificant = significantPoints.some(point => 
                point.date === props.payload.date || 
                point.sequencePoint === props.payload.sequencePoint
              );
              const isEndpoint = props.index === 0 || props.index === normalizedData.length - 1;
              
              if (!isSignificant && !isEndpoint) {
                return null;
              }
              
              // Get color based on sentiment
              let fill = '#27AE60';  // positive
              if (props.payload.sentiment < 0.4) fill = '#E74C3C';  // negative
              else if (props.payload.sentiment < 0.6) fill = '#3498DB';  // neutral
              
              return (
                <g>
                  <circle 
                    cx={props.cx} 
                    cy={props.cy} 
                    r={4} 
                    fill={fill} 
                    stroke="#fff"
                    strokeWidth={2} 
                  />
                  {props.payload.textSnippet && (
                    <circle 
                      cx={props.cx} 
                      cy={props.cy} 
                      r={6} 
                      fill="none" 
                      stroke={fill}
                      strokeWidth={1} 
                      strokeDasharray="2 2"
                      opacity={0.7}
                    />
                  )}
                </g>
              );
            }}
          />
          
          {/* Text annotations for significant points */}
          {significantPoints.map((point, index) => (
            point.textSnippet && (
              <g key={`annotation-${index}`}>
                <foreignObject
                  x={normalizedData.findIndex(d => 
                    d.date === point.date || 
                    d.sequencePoint === point.sequencePoint
                  ) * (100 / (normalizedData.length - 1)) + '%'}
                  y={getTextYPosition(point.sentiment, index, significantPoints.length)}
                  width="120"
                  height="30"
                  style={{ 
                    overflow: 'visible',
                    transform: 'translateX(-60px)'
                  }}
                >
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div 
                        className="text-xs font-medium cursor-pointer text-purple-800 bg-purple-100 px-2 py-1 rounded-full truncate hover:bg-purple-200"
                      >
                        {point.textSnippet.substring(0, 15)}...
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80 p-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">{point.date}</p>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ 
                              backgroundColor: point.sentiment > 0.6 ? '#27AE60' : 
                                             point.sentiment < 0.4 ? '#E74C3C' : 
                                             '#3498DB' 
                            }}
                          />
                          <p className="text-sm">Sentiment: {(point.sentiment * 100).toFixed(0)}%</p>
                        </div>
                        <p className="text-sm italic">{point.textSnippet}</p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </foreignObject>
              </g>
            )
          ))}
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Selected point details display */}
      {selectedPoint && (
        <div className="absolute bottom-0 left-0 right-0 bg-white p-3 border-t border-gray-200 rounded-b-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-sm">{selectedPoint.date}</p>
              <p className="text-xs text-gray-500">
                Sentiment: {(selectedPoint.sentiment * 100).toFixed(0)}%
              </p>
            </div>
            <button 
              onClick={() => setSelectedPoint(null)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
          {selectedPoint.textSnippet && (
            <p className="mt-2 text-sm italic border-t border-gray-100 pt-2">
              "{selectedPoint.textSnippet}"
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default JournalSentimentChart;
