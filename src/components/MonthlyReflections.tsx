import { useState, useEffect } from "react";
import { format } from "date-fns";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { MonthlyReflectionCard } from "./reflections/MonthlyReflectionCard";
import JournalAnalysisSection from "./reflections/JournalAnalysisSection";

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
  journalRefreshTrigger?: number;
}

export const MonthlyReflections = ({ 
  journalText, 
  refreshTrigger = 0,
  journalRefreshTrigger = 0 
}: MonthlyReflectionsProps) => {
  const { t } = useLanguage();
  const [reflections, setReflections] = useState<MonthlyReflection[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [overallSentimentChange, setOverallSentimentChange] = useState<string>("No change");
  const [averageSentiment, setAverageSentiment] = useState<number>(0);
  const currentMonth = format(new Date(), 'MMMM yyyy');
  const [internalRefreshTrigger, setInternalRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    // Load reflections and journal entries when component mounts or refresh is triggered
    loadReflections();
    loadJournalEntries();
  }, [refreshTrigger, journalRefreshTrigger, internalRefreshTrigger]);

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

  // Add event listener for storage changes
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'journalEntries' || event.key === 'monthlyReflections') {
        setInternalRefreshTrigger(prev => prev + 1);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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
      } else {
        setJournalEntries([]);
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
      setJournalEntries([]);
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

  return (
    <>
      <MonthlyReflectionCard 
        reflections={reflections} 
        onDelete={handleDelete}
        onClearAll={handleClearAll}
        currentMonth={currentMonth}
      />
      
      <JournalAnalysisSection 
        journalEntries={journalEntries}
        timelineData={timelineData}
        overallSentimentChange={overallSentimentChange}
        averageSentiment={averageSentiment}
        getSentimentColor={getSentimentColor}
        refreshTrigger={internalRefreshTrigger}
      />
    </>
  );
};
