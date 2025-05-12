
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";

interface JournalSentimentChartProps {
  timelineData: {
    date: string;
    sentiment: number;
    textSnippet?: string; // Add text snippets
  }[];
}

const JournalSentimentChart = ({ timelineData }: JournalSentimentChartProps) => {
  // Add minimal styling for chart appearance
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-sm rounded-md">
          <p className="text-xs font-pacifico">{data.date}</p>
          <p className="text-xs font-georgia">
            Sentiment: {(data.sentiment * 100).toFixed(0)}%
          </p>
          {data.textSnippet && (
            <p className="text-xs font-georgia mt-1 max-w-[200px] truncate">
              {data.textSnippet}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Calculate average sentiment
  const averageSentiment = timelineData.length > 0
    ? timelineData.reduce((sum, item) => sum + item.sentiment, 0) / timelineData.length
    : 0.5;
    
  // Find significant changes in sentiment for highlighting
  const significantPoints = timelineData.length > 2
    ? timelineData.filter((item, index) => {
        if (index === 0 || index === timelineData.length - 1) return true;
        const prevItem = timelineData[index - 1];
        const nextItem = timelineData[index + 1];
        const diffPrev = Math.abs(item.sentiment - prevItem.sentiment);
        const diffNext = Math.abs(item.sentiment - nextItem.sentiment);
        return diffPrev > 0.1 || diffNext > 0.1;
      })
    : timelineData;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={timelineData}
        margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
      >
        <defs>
          <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 10 }} 
          tickLine={false} 
          axisLine={{ stroke: '#eaeaea' }}
          height={40}
        />
        <YAxis 
          domain={[0, 1]} 
          ticks={[0, 0.25, 0.5, 0.75, 1]}
          tick={{ fontSize: 10 }}
          width={30}
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
        <ReferenceLine
          y={0.5}
          stroke="#888888"
          strokeDasharray="3 3"
          label={{ value: "Neutral", position: "insideLeft", fontSize: 10 }}
        />
        <ReferenceLine
          y={averageSentiment}
          stroke="#8884d8"
          strokeDasharray="3 3"
          label={{ value: "Average", position: "insideRight", fontSize: 10 }}
        />
        
        {/* Add text snippets for significant points */}
        {significantPoints.map((point, index) => (
          <text
            key={`text-${index}`}
            x={`${(index / (significantPoints.length - 1)) * 90 + 5}%`}
            y={15}
            textAnchor="middle"
            fill="#333"
            fontSize={9}
          >
            {point.textSnippet ? point.textSnippet.substring(0, 10) + '...' : point.date}
          </text>
        ))}
        
        <Area
          type="monotone"
          dataKey="sentiment"
          stroke="#8884d8"
          strokeWidth={2}
          fill="url(#colorSentiment)"
          dot={(props: any) => {
            if (!props || !props.cx || !props.cy || !props.payload) return null;
            
            // Check if this is a significant point to display
            const isSignificant = significantPoints.some(point => point.date === props.payload.date);
            if (!isSignificant && props.index !== 0 && props.index !== timelineData.length - 1) {
              return null;
            }
            
            // Get color based on sentiment
            let fill = '#27AE60';  // default: positive
            if (props.payload.sentiment < 0.4) fill = '#E74C3C';  // negative
            else if (props.payload.sentiment < 0.6) fill = '#3498DB';  // neutral
            
            return (
              <circle 
                cx={props.cx} 
                cy={props.cy} 
                r={4} 
                fill={fill} 
                stroke="#fff"
                strokeWidth={2} 
              />
            );
          }}
          activeDot={{ fill: '#219653', r: 6 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default JournalSentimentChart;
