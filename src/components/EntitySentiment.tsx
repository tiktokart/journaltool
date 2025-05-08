
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSentimentColor } from '@/utils/bertSentimentAnalysis';

interface Entity {
  name: string;
  value: number;
}

interface EntitySentimentProps {
  entities: Entity[];
  sourceDescription?: string;
}

const renderBarLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  
  return (
    <g>
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
      >
        {value.toFixed(2)}
      </text>
    </g>
  );
};

export const EntitySentiment = ({ entities, sourceDescription }: EntitySentimentProps) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(entities);
  
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      setFilteredData(
        entities.filter(entity => entity.name.toLowerCase().includes(term))
      );
    } else {
      setFilteredData(entities);
    }
  }, [searchTerm, entities]);
  
  return (
    <Card className="border-0 shadow-md w-full bg-white">
      <CardHeader>
        <CardTitle className="text-orange">{t("entitySentimentAnalysis")}</CardTitle>
        {sourceDescription && (
          <p className="text-sm text-muted-foreground">{sourceDescription}</p>
        )}
      </CardHeader>
      <CardContent>
        {filteredData.length === 0 ? (
          <div className="h-80 w-full flex items-center justify-center">
            <p className="text-muted-foreground">{t("noDataAvailable")}</p>
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  type="number" 
                  domain={[0, 1]} 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => v.toFixed(1)}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  width={150}
                  label={{ value: t("entities"), position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: number) => [
                    value.toFixed(2), 
                    t("sentiment")
                  ]}
                  contentStyle={{ 
                    borderRadius: '0.5rem',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Bar
                  dataKey="value"
                  name={t("sentimentScore")}
                  fill="#8884d8"
                  background={{ fill: '#eee' }}
                  barSize={20}
                  radius={[0, 4, 4, 0]}
                  label={renderBarLabel}
                >
                  {filteredData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getSentimentColor(entry.value)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <div className="mt-4 flex items-center space-x-2">
          <Label htmlFor="search" className="text-sm text-muted-foreground">
            {t("filterEntities")}
          </Label>
          <Input
            id="search"
            type="text"
            placeholder={t("searchByName")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-sm"
          />
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          {t("sentimentAnalysisRepresents")}
        </div>
      </CardContent>
    </Card>
  );
};
