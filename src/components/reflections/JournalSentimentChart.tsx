
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

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
          <p className="text-xs font-medium">{data.date}</p>
          <p className="text-xs">
            Sentiment: {(data.sentiment * 100).toFixed(0)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={timelineData}
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 10 }} 
          tickLine={false} 
          axisLine={{ stroke: '#eaeaea' }}
        />
        <YAxis 
          hide={true} 
          domain={[0, 1]} 
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="sentiment"
          stroke="#27AE60"
          strokeWidth={2}
          dot={{ fill: '#27AE60', r: 4 }}
          activeDot={{ fill: '#219653', r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default JournalSentimentChart;
