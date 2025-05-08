
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface JournalSentimentChartProps {
  timelineData: any[];
}

const JournalSentimentChart = ({ timelineData }: JournalSentimentChartProps) => {
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const sentimentText = payload[0].value >= 0.5 ? "Positive" : "Negative";
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
          <p className="text-sm">{`Date: ${label}`}</p>
          <p className="text-sm">{`Sentiment: ${payload[0].value} (${sentimentText})`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={timelineData}
        margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          padding={{ left: 10, right: 10 }}
        />
        <YAxis 
          domain={[0, 1]} 
          tick={{ fontSize: 12 }}
          tickFormatter={(v) => v.toFixed(1)}
          label={{ 
            value: 'Sentiment', 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle' }
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="sentiment"
          stroke="#9b87f5"
          strokeWidth={2}
          dot={{ r: 4, fill: "#9b87f5" }}
          activeDot={{ r: 6, fill: "#7E69AB" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default JournalSentimentChart;
