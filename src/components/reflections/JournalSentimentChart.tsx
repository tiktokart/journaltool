
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart } from "recharts";

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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={timelineData}
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
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
          ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
          tick={{ fontSize: 10 }}
          width={30}
        />
        <Tooltip content={<CustomTooltip />} />
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
