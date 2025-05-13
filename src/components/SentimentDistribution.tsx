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
  
  // Ensure we have non-zero values for each sentiment type
  const ensureValidDistribution = (dist: typeof distribution) => {
    // Only use default values if all values are zero or undefined
    if ((dist?.positive || 0) === 0 && (dist?.neutral || 0) === 0 && (dist?.negative || 0) === 0) {
      return { positive: 20, neutral: 60, negative: 20 };
    }
    
    // Calculate the sum to check if percentages need normalization
    const sum = (dist?.positive || 0) + (dist?.neutral || 0) + (dist?.negative || 0);
    
    // If sum is not close to 100, normalize to percentages
    if (Math.abs(sum - 100) > 5 && sum > 0) {
      return {
        positive: Math.round((dist?.positive || 0) / sum * 100),
        neutral: Math.round((dist?.neutral || 0) / sum * 100),
        negative: Math.round((dist?.negative || 0) / sum * 100)
      };
    }
    
    // Otherwise keep the existing values but ensure they're not zero
    const result = {
      positive: Math.max(1, dist?.positive || 0),
      neutral: Math.max(1, dist?.neutral || 0),
      negative: Math.max(1, dist?.negative || 0)
    };
    
    return result;
  };
  
  const validDistribution = ensureValidDistribution(distribution || { positive: 0, neutral: 0, negative: 0 });
  
  // Format the data
  const data = [
    { name: 'Positive', value: validDistribution.positive, color: '#27AE60' },
    { name: 'Neutral', value: validDistribution.neutral, color: '#3498DB' },
    { name: 'Negative', value: validDistribution.negative, color: '#E74C3C' }
  ];

  // Calculate percentages for display
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  const getPercentage = (value: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  return (
    <Card className="border border-border shadow-md bg-white">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-pacifico">
          <ChartPie className="h-5 w-5 mr-2 text-primary" />
          {t("Sentiment Distribution")}
        </CardTitle>
      </CardHeader>
      <CardContent>
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
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
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
                  `${value}% (${Math.round(value * (totalWordCount || 100) / 100)} words)`,
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
            <div className="text-xl font-semibold">{validDistribution.positive}%</div>
            <div className="text-xs text-muted-foreground">
              ~{Math.round(validDistribution.positive * (totalWordCount || 100) / 100)} words
            </div>
          </div>
          <div className="border rounded-md p-2 text-center bg-blue-50">
            <div className="text-blue-600 font-medium">Neutral</div>
            <div className="text-xl font-semibold">{validDistribution.neutral}%</div>
            <div className="text-xs text-muted-foreground">
              ~{Math.round(validDistribution.neutral * (totalWordCount || 100) / 100)} words
            </div>
          </div>
          <div className="border rounded-md p-2 text-center bg-red-50">
            <div className="text-red-600 font-medium">Negative</div>
            <div className="text-xl font-semibold">{validDistribution.negative}%</div>
            <div className="text-xs text-muted-foreground">
              ~{Math.round(validDistribution.negative * (totalWordCount || 100) / 100)} words
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
