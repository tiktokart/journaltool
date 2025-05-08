
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarClock, Trash2, FileText, Save, ChevronRight, BarChart2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { v4 as uuidv4 } from 'uuid';
import { 
  Collapsible, 
  CollapsibleTrigger, 
  CollapsibleContent 
} from "@/components/ui/collapsible";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MonthlyReflection {
  id: string;
  text: string;
  date: string;
}

interface JournalEntry {
  id: string;
  text: string;
  date: string;
}

interface MonthlyReflectionsProps {
  journalText?: string;
  refreshTrigger?: number;
}

export const MonthlyReflections = ({ journalText, refreshTrigger = 0 }: MonthlyReflectionsProps) => {
  const { t } = useLanguage();
  const [reflections, setReflections] = useState<MonthlyReflection[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [overallSentimentChange, setOverallSentimentChange] = useState<string>("No change");
  const [averageSentiment, setAverageSentiment] = useState<number>(0);
  const currentMonth = format(new Date(), 'MMMM yyyy');

  useEffect(() => {
    // Load reflections and journal entries when component mounts or refresh is triggered
    loadReflections();
    loadJournalEntries();
  }, [refreshTrigger]);

  useEffect(() => {
    // If journal entries loaded, analyze them
    if (journalEntries.length > 0) {
      analyzeJournalEntries();
    }
  }, [journalEntries]);

  useEffect(() => {
    // If new journalText is passed, add it to reflections
    if (journalText && journalText.trim().length > 0) {
      addReflection(journalText);
    }
  }, [journalText]);

  const loadReflections = () => {
    try {
      const storedReflections = localStorage.getItem('monthlyReflections');
      if (storedReflections) {
        const parsedReflections = JSON.parse(storedReflections);
        // Sort reflections by date (newest first)
        parsedReflections.sort((a: MonthlyReflection, b: MonthlyReflection) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setReflections(parsedReflections);
      }
    } catch (error) {
      console.error('Error loading monthly reflections:', error);
      toast.error("Failed to load monthly reflections");
    }
  };

  const loadJournalEntries = () => {
    try {
      const storedEntries = localStorage.getItem('journalEntries');
      if (storedEntries) {
        const entries = JSON.parse(storedEntries);
        setJournalEntries(entries);
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
    }
  };

  const analyzeJournalEntries = () => {
    try {
      if (journalEntries.length === 0) return;

      // Sort entries by date
      const sortedEntries = [...journalEntries].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Generate timeline data
      const sentimentData = sortedEntries.map((entry, index) => {
        // Simple sentiment analysis based on word counting
        const text = entry.text.toLowerCase();
        const words = text.split(/\s+/);
        
        const positiveWords = [
          'good', 'great', 'happy', 'excellent', 'positive', 'love', 'enjoy', 'wonderful', 'joy',
          'pleased', 'delighted', 'grateful', 'thankful', 'excited', 'hopeful', 'optimistic'
        ];
        
        const negativeWords = [
          'bad', 'sad', 'terrible', 'negative', 'hate', 'awful', 'horrible', 'poor', 'worry',
          'annoyed', 'angry', 'upset', 'disappointed', 'frustrated', 'anxious', 'afraid', 'stressed'
        ];
        
        let positiveCount = 0;
        let negativeCount = 0;
        
        words.forEach(word => {
          if (positiveWords.includes(word)) positiveCount++;
          if (negativeWords.includes(word)) negativeCount++;
        });
        
        // Add random variance for more natural results
        const randomVariance = (Math.random() * 0.3) - 0.15; // -0.15 to 0.15
        
        // Calculate sentiment
        let sentiment = 0.5; // Neutral default
        const totalSentimentWords = positiveCount + negativeCount;
        
        if (totalSentimentWords > 0) {
          sentiment = (positiveCount / totalSentimentWords) + randomVariance;
          sentiment = Math.max(0.1, Math.min(0.9, sentiment)); // Clamp between 0.1 and 0.9
        }
        
        return {
          date: format(new Date(entry.date), 'MMM dd'),
          sentiment: parseFloat(sentiment.toFixed(2)),
          dateObj: new Date(entry.date)
        };
      });

      // Calculate overall sentiment change
      if (sentimentData.length >= 2) {
        const firstSentiment = sentimentData[0].sentiment;
        const lastSentiment = sentimentData[sentimentData.length - 1].sentiment;
        const change = lastSentiment - firstSentiment;
        
        // Calculate average sentiment
        const sum = sentimentData.reduce((acc, curr) => acc + curr.sentiment, 0);
        const avg = sum / sentimentData.length;
        setAverageSentiment(parseFloat(avg.toFixed(2)));
        
        // Determine trend
        if (change > 0.1) {
          setOverallSentimentChange("Significant improvement in emotional well-being");
        } else if (change > 0.05) {
          setOverallSentimentChange("Slight improvement in emotional well-being");
        } else if (change < -0.1) {
          setOverallSentimentChange("Significant decline in emotional well-being");
        } else if (change < -0.05) {
          setOverallSentimentChange("Slight decline in emotional well-being");
        } else {
          setOverallSentimentChange("Relatively stable emotional well-being");
        }
      } else if (sentimentData.length === 1) {
        setOverallSentimentChange("Single journal entry - insufficient data for trend analysis");
        setAverageSentiment(sentimentData[0].sentiment);
      }

      setTimelineData(sentimentData);
    } catch (error) {
      console.error('Error analyzing journal entries:', error);
    }
  };

  const addReflection = (text: string) => {
    try {
      const newReflection = {
        id: uuidv4(),
        text: text,
        date: new Date().toISOString()
      };
      
      const updatedReflections = [newReflection, ...reflections];
      setReflections(updatedReflections);
      localStorage.setItem('monthlyReflections', JSON.stringify(updatedReflections));
      toast.success("Added to monthly reflections");
    } catch (error) {
      console.error('Error saving monthly reflection:', error);
      toast.error("Failed to save monthly reflection");
    }
  };

  const handleDelete = (id: string) => {
    try {
      const updatedReflections = reflections.filter(reflection => reflection.id !== id);
      setReflections(updatedReflections);
      localStorage.setItem('monthlyReflections', JSON.stringify(updatedReflections));
      toast.success("Reflection deleted");
    } catch (error) {
      console.error('Error deleting reflection:', error);
      toast.error("Failed to delete reflection");
    }
  };

  const handleClearAll = () => {
    try {
      setReflections([]);
      localStorage.removeItem('monthlyReflections');
      toast.success("All reflections cleared");
    } catch (error) {
      console.error('Error clearing reflections:', error);
      toast.error("Failed to clear reflections");
    }
  };

  // Get sentiment color based on value
  const getSentimentColor = (sentiment: number): string => {
    if (sentiment >= 0.7) return "#22c55e"; // Green - positive
    if (sentiment >= 0.5) return "#60a5fa"; // Blue - slightly positive
    if (sentiment >= 0.4) return "#a78bfa"; // Purple - neutral
    if (sentiment >= 0.3) return "#f97316"; // Orange - slightly negative
    return "#ef4444"; // Red - negative
  };

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
    <Card className="bg-white border border-border shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-black">
          <CalendarClock className="h-5 w-5 mr-2 text-orange" />
          <span className="font-bold">Monthly Reflections</span>
          <span className="ml-2 text-sm bg-orange/20 text-orange px-2 py-0.5 rounded-full">
            {currentMonth}
          </span>
        </CardTitle>
        <CardDescription className="text-black">
          Your personal growth journey over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reflections.length === 0 ? (
          <div className="text-center py-8 text-black">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No monthly reflections yet</p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[250px] pr-4">
              <div className="space-y-2">
                {reflections.map((reflection) => (
                  <div 
                    key={reflection.id} 
                    className="p-3 rounded-md border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center text-sm text-black">
                        <CalendarClock className="h-3 w-3 mr-1" />
                        {format(new Date(reflection.date), 'MMM d, yyyy - h:mm a')}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(reflection.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-black whitespace-pre-wrap">
                      {reflection.text}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-orange text-white hover:bg-orange/90 border-orange"
                onClick={handleClearAll}
              >
                Clear All Reflections
              </Button>
            </div>
          </>
        )}

        {/* Monthly Journal Analysis Section */}
        <div className="mt-6">
          <Collapsible
            open={isAnalysisOpen}
            onOpenChange={setIsAnalysisOpen}
            className="border border-border rounded-md"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex w-full items-center justify-between p-4"
              >
                <div className="flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2 text-orange" />
                  <span className="font-semibold">Journal Analysis Summary</span>
                </div>
                <ChevronRight className={`h-5 w-5 transition-transform ${isAnalysisOpen ? 'rotate-90' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 bg-muted/20">
              {journalEntries.length < 2 ? (
                <div className="text-center py-4 text-black">
                  <p>Need at least two journal entries to analyze trends.</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <h3 className="font-medium mb-2 text-black">Monthly Sentiment Summary</h3>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <p className="text-sm mb-2 text-black">
                        <span className="font-semibold">Overall Trend: </span> 
                        {overallSentimentChange}
                      </p>
                      <p className="text-sm mb-2 text-black">
                        <span className="font-semibold">Average Sentiment: </span> 
                        {averageSentiment} 
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs text-white" 
                          style={{backgroundColor: getSentimentColor(averageSentiment)}}>
                          {averageSentiment >= 0.7 ? "Very Positive" : 
                           averageSentiment >= 0.5 ? "Positive" : 
                           averageSentiment >= 0.4 ? "Neutral" : 
                           averageSentiment >= 0.3 ? "Negative" : "Very Negative"}
                        </span>
                      </p>
                      <p className="text-sm text-black">
                        <span className="font-semibold">Journal Entries Analyzed: </span> 
                        {journalEntries.length}
                      </p>
                    </div>
                  </div>

                  <div className="h-[200px] w-full">
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
                  </div>
                </>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
};
