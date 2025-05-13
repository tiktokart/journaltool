
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import { useEffect, useState } from "react";

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
    const processed = timelineData.map(item => ({
      ...item,
      sentiment: Math.max(0, Math.min(1, item.sentiment || 0.5))  // Ensure sentiment is between 0-1
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
          const nextItem = arr[index + 1];
          const diffPrev = Math.abs(item.sentiment - prevItem.sentiment);
          const diffNext = Math.abs(item.sentiment - nextItem.sentiment);
          
          // Check if this is a significant change or emotional peak/valley
          return diffPrev > 0.08 || diffNext > 0.08 || 
                (item.sentiment > 0.7) || (item.sentiment < 0.3);
        })
      : processed;
    setSignificantPoints(significant);
  }, [timelineData]);

  // Enhanced tooltip with better styling and text snippets
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md max-w-xs">
          <p className="text-sm font-semibold mb-1">{data.date}</p>
          <p className="text-xs mb-2">
            Sentiment: <span className="font-medium">{(data.sentiment * 100).toFixed(0)}%</span>
          </p>
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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={normalizedData}
        margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#9b87f5" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        
        {/* X-Axis with improved labels */}
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 10 }} 
          tickLine={false} 
          axisLine={{ stroke: '#eaeaea' }}
          height={40}
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
        
        {/* Neutral reference line */}
        <ReferenceLine
          y={0.5}
          stroke="#888888"
          strokeDasharray="3 3"
          label={{ value: "Neutral", position: "insideLeft", fontSize: 10 }}
        />
        
        {/* Average reference line */}
        <ReferenceLine
          y={averageSentiment}
          stroke="#9b87f5"
          strokeDasharray="3 3"
          label={{ value: "Average", position: "insideRight", fontSize: 10 }}
        />
        
        {/* Add text snippets above significant points */}
        {significantPoints.map((point, index) => (
          <text
            key={`text-${index}`}
            x={`${(index / (significantPoints.length - 1)) * 90 + 5}%`}
            y={10}
            textAnchor="middle"
            fill="#333"
            fontSize={9}
            className="font-medium"
          >
            {point.textSnippet 
              ? point.textSnippet.substring(0, 15) + '...' 
              : point.date}
          </text>
        ))}
        
        {/* Enhanced area chart with better styling */}
        <Area
          type="monotone"
          dataKey="sentiment"
          stroke="#9b87f5"
          strokeWidth={2}
          fill="url(#colorSentiment)"
          activeDot={{ r: 8, fill: '#9b87f5', stroke: '#fff', strokeWidth: 2 }}
          dot={(props: any) => {
            if (!props || !props.cx || !props.cy || !props.payload) return null;
            
            // Check if this is a significant point to display
            const isSignificant = significantPoints.some(point => point.date === props.payload.date);
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
                {props.payload.textSnippet && isSignificant && (
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
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default JournalSentimentChart;
