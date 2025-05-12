
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartPie } from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";

interface SentimentDistributionProps {
  distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  sourceDescription?: string;
  totalWordCount?: number;
}

export const SentimentDistribution = ({ 
  distribution, 
  sourceDescription,
  totalWordCount 
}: SentimentDistributionProps) => {
  const { t } = useLanguage();
  
  const data = [
    { name: 'Positive', value: distribution.positive, color: '#27AE60' },
    { name: 'Neutral', value: distribution.neutral, color: '#3498DB' },
    { name: 'Negative', value: distribution.negative, color: '#E74C3C' }
  ].filter(item => item.value > 0);

  return (
    <Card className="border border-border shadow-md bg-white">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-pacifico">
          <ChartPie className="h-5 w-5 mr-2 text-primary" />
          {t("Sentiment Distribution")}
        </CardTitle>
        {sourceDescription && (
          <p className="text-sm text-muted-foreground font-georgia">{sourceDescription}</p>
        )}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-60 flex items-center justify-center">
            <p className="text-muted-foreground">{t("No distribution data available")}</p>
          </div>
        ) : (
          <>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text 
                          x={x} 
                          y={y} 
                          fill="white" 
                          textAnchor={x > cx ? 'start' : 'end'} 
                          dominantBaseline="central"
                          className="text-xs font-medium"
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value}${totalWordCount ? ` (${Math.round(value / totalWordCount * 100)}%)` : ''}`,
                      name
                    ]}
                    contentStyle={{
                      borderRadius: '0.5rem',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="border rounded-md p-2 text-center bg-green-50">
                <div className="text-green-600 font-medium">Positive</div>
                <div className="text-xl font-semibold">{distribution.positive}</div>
                <div className="text-xs text-muted-foreground">words</div>
              </div>
              <div className="border rounded-md p-2 text-center bg-blue-50">
                <div className="text-blue-600 font-medium">Neutral</div>
                <div className="text-xl font-semibold">{distribution.neutral}</div>
                <div className="text-xs text-muted-foreground">words</div>
              </div>
              <div className="border rounded-md p-2 text-center bg-red-50">
                <div className="text-red-600 font-medium">Negative</div>
                <div className="text-xl font-semibold">{distribution.negative}</div>
                <div className="text-xs text-muted-foreground">words</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
