
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Legend, Cell } from "recharts";
import { Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

interface SentimentTimelineProps {
  data: Array<{ page: number; score: number }>;
  sourceDescription?: string; // Add this to show where data came from
}

// MHA mental health statistics data
const mentalHealthData = [
  { state: "Hawaii", rank: 1, accessRank: 15, prevalenceRank: 1, value: 85.7 },
  { state: "Massachusetts", rank: 2, accessRank: 1, prevalenceRank: 9, value: 83.8 },
  { state: "Minnesota", rank: 3, accessRank: 4, prevalenceRank: 4, value: 82.3 },
  { state: "Utah", rank: 4, accessRank: 7, prevalenceRank: 6, value: 81.4 },
  { state: "New York", rank: 5, accessRank: 2, prevalenceRank: 16, value: 80.1 },
  { state: "Washington", rank: 6, accessRank: 14, prevalenceRank: 2, value: 79.8 },
  { state: "District of Columbia", rank: 7, accessRank: 3, prevalenceRank: 28, value: 79.2 },
  { state: "Maryland", rank: 8, accessRank: 5, prevalenceRank: 21, value: 78.9 },
  { state: "New Jersey", rank: 9, accessRank: 10, prevalenceRank: 12, value: 78.5 },
  { state: "Illinois", rank: 10, accessRank: 9, prevalenceRank: 18, value: 77.8 }
];

// Color function for the states
const getStateColor = (index: number) => {
  const colors = [
    "#27AE60", // Green for top ranks
    "#3498DB", // Blue for middle ranks
    "#E74C3C"  // Red for bottom ranks
  ];
  
  if (index < 3) return colors[0];
  if (index < 7) return colors[1];
  return colors[2];
};

export const SentimentTimeline = ({ data, sourceDescription }: SentimentTimelineProps) => {
  const { t } = useLanguage();
  const [showMHAStats, setShowMHAStats] = useState(false);
  
  // Determine color for each point based on score
  const getColor = (score: number) => {
    if (score >= 0.6) return "#27AE60";
    if (score >= 0.4) return "#3498DB";
    return "#E74C3C";
  };

  // Calculate average sentiment
  const averageSentiment = data.length > 0 
    ? data.reduce((acc, item) => acc + item.score, 0) / data.length
    : 0.5;

  return (
    <Card className="border-0 shadow-md w-full" style={{ backgroundColor: "#DFC5FE" }}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-orange">{t("sentimentTimeline")}</CardTitle>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowMHAStats(false)}
              className={`px-3 py-1 text-sm rounded-md ${!showMHAStats 
                ? 'bg-orange text-white' 
                : 'bg-white/50 text-gray-700'}`}
            >
              {t("timeline")}
            </button>
            <button 
              onClick={() => setShowMHAStats(true)}
              className={`px-3 py-1 text-sm rounded-md ${showMHAStats 
                ? 'bg-orange text-white' 
                : 'bg-white/50 text-gray-700'}`}
            >
              MHA Stats
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showMHAStats ? (
          <div className="h-80 w-full">
            <div className="mb-2 text-sm text-center">
              <p className="font-semibold">Mental Health America's State Rankings 2023</p>
              <p className="text-xs text-gray-600">Top 10 states with best mental health outcomes and access to care</p>
            </div>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={mentalHealthData}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="state" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  label={{ value: 'Overall Mental Health Score', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: number, name: string, props: any) => [
                    `Score: ${value}`,
                    `Rank: ${props.payload.rank}`
                  ]}
                  labelFormatter={(label) => `State: ${label}`}
                  contentStyle={{ 
                    borderRadius: '0.5rem',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  content={() => (
                    <div className="flex justify-center mt-2 text-xs">
                      <div className="flex items-center mx-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                        <span>Top Tier (1-3)</span>
                      </div>
                      <div className="flex items-center mx-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                        <span>Mid Tier (4-7)</span>
                      </div>
                      <div className="flex items-center mx-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                        <span>Lower Tier (8-10)</span>
                      </div>
                    </div>
                  )}
                />
                <Bar dataKey="value" name="Mental Health Score">
                  {mentalHealthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStateColor(index)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-center text-yellow">
              <div className="flex items-center justify-center">
                <Info className="h-4 w-4 mr-1" />
                Data from Mental Health America's State and County Dashboard 2023
              </div>
            </div>
          </div>
        ) : (
          <>
            {data.length === 0 ? (
              <div className="h-80 w-full flex items-center justify-center">
                <p className="text-yellow">{t("noDataAvailable")}</p>
              </div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data}
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
                      formatter={(value: number) => [
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
                        const { cx, cy, payload } = props;
                        return (
                          <circle 
                            cx={cx} 
                            cy={cy} 
                            r={5} 
                            fill={getColor(payload.score)} 
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
            <div className="mt-4 text-sm text-center text-yellow">
              {sourceDescription ? (
                <div className="flex items-center justify-center">
                  <Info className="h-4 w-4 mr-1" />
                  {sourceDescription}
                </div>
              ) : (
                t("timelineDescription")
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
