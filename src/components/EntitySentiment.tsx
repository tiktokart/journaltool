
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { Info, Filter, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Entity {
  name: string;
  score?: number;
  sentiment?: number;
  type?: string;
  mentions?: number;
}

interface EntitySentimentProps {
  data: Array<Entity>;
  sourceDescription?: string;
}

export const EntitySentiment = ({ data = [], sourceDescription }: EntitySentimentProps) => {
  const { t } = useLanguage();
  
  // Normalize data to ensure all entities have the necessary properties
  const normalizedData: Entity[] = data.map(item => {
    return {
      ...item,
      // Use sentiment if available, otherwise use score, otherwise default to 0.5
      score: item.sentiment !== undefined ? item.sentiment : 
             (item.score !== undefined ? item.score : 0.5)
    };
  });
  
  const [filteredData, setFilteredData] = useState(normalizedData);
  const [filterTerm, setFilterTerm] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  
  useEffect(() => {
    if (!filterTerm) {
      setFilteredData(normalizedData);
      setIsFiltering(false);
      return;
    }
    
    const term = filterTerm.toLowerCase();
    const filtered = normalizedData.filter(item => 
      item.name.toLowerCase().includes(term)
    );
    
    setFilteredData(filtered);
    setIsFiltering(filtered.length < normalizedData.length);
  }, [filterTerm, normalizedData]);

  // Sort data by score for better visualization
  const sortedData = [...filteredData]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 15); // Limit to 15 entities for better visual display

  // Determine color for each bar based on score
  const getColor = (score: number) => {
    if (score >= 0.6) return "#27AE60";
    if (score >= 0.4) return "#3498DB";
    return "#E74C3C";
  };

  return (
    <Card className="border-0 shadow-md w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("themeAnalysisTitle")}</CardTitle>
        <div className="relative w-full max-w-xs">
          <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange" />
          <Input
            className="pl-8 pr-8"
            placeholder={t("filterThemesPlaceholder") || "Filter themes..."}
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
          />
          {filterTerm && (
            <Button 
              variant="ghost" 
              className="absolute right-0 top-0 h-full px-2"
              onClick={() => setFilterTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isFiltering && (
          <div className="mb-4 flex items-center justify-between">
            <Badge className="bg-orange/20 text-orange border-none">
              {t("showingFilteredResults", { 
                filtered: filteredData.length, 
                total: normalizedData.length 
              })}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setFilterTerm("")}>
              {t("clearFilter") || "Clear filter"}
            </Button>
          </div>
        )}
        
        {filteredData.length === 0 ? (
          <div className="h-80 w-full flex items-center justify-center">
            <p className="text-muted-foreground">
              {filterTerm ? t("noMatchingThemesFound") : t("noThemeDataAvailable")}
            </p>
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedData}
                layout="vertical"
                margin={{ top: 20, right: 50, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                <XAxis 
                  type="number" 
                  domain={[0, 1]} 
                  ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]} 
                  label={{ value: t("sentimentScore"), position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  width={150}
                  label={{ value: t("themes") || "Themes", position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: number) => [
                    `${t("score")}: ${value.toFixed(2)}`, 
                    t("sentiment")
                  ]}
                  contentStyle={{ 
                    borderRadius: '0.5rem',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  labelFormatter={(label) => `${t("theme")}: ${label}`}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {sortedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry.score || 0.5)} />
                  ))}
                  <LabelList dataKey="score" position="right" formatter={(value: number) => value.toFixed(2)} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="mt-4 text-sm text-center text-muted-foreground">
          {sourceDescription ? (
            <div className="flex items-center justify-center">
              <Info className="h-4 w-4 mr-1" />
              {sourceDescription}
            </div>
          ) : (
            t("themeAnalysisDescription")
          )}
        </div>
      </CardContent>
    </Card>
  );
};
