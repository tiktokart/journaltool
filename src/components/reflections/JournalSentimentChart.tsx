
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";

interface JournalSentimentChartProps {
  timelineData: {
    date: string;
    sentiment: number;
  }[];
}

const JournalSentimentChart = ({ timelineData }: JournalSentimentChartProps) => {
  // Add minimal styling for chart appearance
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
          <p className="text-xs font-pacifico">{data.date}</p>
          <p className="text-xs font-georgia">
            Sentiment: {(data.sentiment * 100).toFixed(0)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate average sentiment
  const averageSentiment = timelineData.length > 0
    ? timelineData.reduce((sum, item) => sum + item.sentiment, 0) / timelineData.length
    : 0.5;
    
  // Get the sentiment trend
  const getSentimentTrend = () => {
    if (timelineData.length < 2) return null;
    
    const firstValue = timelineData[0].sentiment;
    const lastValue = timelineData[timelineData.length - 1].sentiment;
    const difference = lastValue - firstValue;
    
    if (Math.abs(difference) < 0.1) return null; // Not significant change
    
    return difference > 0 ? {
      label: "Positive trend",
      color: "#27AE60"
    } : {
      label: "Declining trend",
      color: "#E74C3C"
    };
  };
  
  const trend = getSentimentTrend();

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
        {trend && (
          <ReferenceLine
            y={0}
            stroke={trend.color}
            strokeDasharray="5 5"
            label={{ value: trend.label, position: "insideBottom", fontSize: 10, fill: trend.color }}
          />
        )}
        <Area
          type="monotone"
          dataKey="sentiment"
          stroke="#8884d8"
          strokeWidth={2}
          fill="url(#colorSentiment)"
          dot={{ fill: '#27AE60', r: 4 }}
          activeDot={{ fill: '#219653', r: 6 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default JournalSentimentChart;
