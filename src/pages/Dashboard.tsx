
import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import AskAI from "@/components/AskAI";
import MonthlyCalendar from "@/components/MonthlyCalendar";
import EntriesView from "@/components/EntriesView";
import VectorDecorations from "@/components/VectorDecorations";
import { format, isSameDay } from "date-fns";

// Rename PerfectLifePlan to Goals
const Goals = () => {
  const [dailyGoals, setDailyGoals] = useState<string>("");
  const [weeklyGoals, setWeeklyGoals] = useState<string>("");
  const [monthlyGoals, setMonthlyGoals] = useState<string>("");

  // Load goals from local storage on component mount
  useEffect(() => {
    try {
      const storedDailyGoals = localStorage.getItem('perfectLifeDailyPlan');
      const storedWeeklyGoals = localStorage.getItem('perfectLifeWeeklyPlan');
      const storedMonthlyGoals = localStorage.getItem('perfectLifeMonthlyPlan');
      
      if (storedDailyGoals) setDailyGoals(storedDailyGoals);
      if (storedWeeklyGoals) setWeeklyGoals(storedWeeklyGoals);
      if (storedMonthlyGoals) setMonthlyGoals(storedMonthlyGoals);
    } catch (error) {
      console.error('Error loading goals from storage:', error);
    }
  }, []);

  // Save goals to local storage
  const handleSaveGoals = () => {
    try {
      localStorage.setItem('perfectLifeDailyPlan', dailyGoals);
      localStorage.setItem('perfectLifeWeeklyPlan', weeklyGoals);
      localStorage.setItem('perfectLifeMonthlyPlan', monthlyGoals);
      toast.success("Goals saved successfully");
    } catch (error) {
      console.error('Error saving goals to storage:', error);
      toast.error("Failed to save goals");
    }
  };

  return (
    <Card className="rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 bg-green-50 border-b border-green-100">
        <h2 className="text-xl font-semibold text-black">Goals</h2>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Daily</label>
            <textarea 
              className="w-full p-3 border border-green-200 rounded-md min-h-[60px]"
              placeholder="What are your goals for today?"
              value={dailyGoals}
              onChange={(e) => setDailyGoals(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Weekly</label>
            <textarea 
              className="w-full p-3 border border-green-200 rounded-md min-h-[60px]"
              placeholder="What do you want to accomplish this week?"
              value={weeklyGoals}
              onChange={(e) => setWeeklyGoals(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-black">Monthly</label>
            <textarea 
              className="w-full p-3 border border-green-200 rounded-md min-h-[60px]"
              placeholder="What are your goals for this month?"
              value={monthlyGoals}
              onChange={(e) => setMonthlyGoals(e.target.value)}
            />
          </div>
          
          <button 
            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
            onClick={handleSaveGoals}
          >
            Save Goals
          </button>
        </div>
      </div>
    </Card>
  );
};

// Import MonthlyReflections and JournalAnalysisSection (already exists)
import { MonthlyReflections } from "@/components/MonthlyReflections";
import JournalAnalysisSection from "@/components/reflections/JournalAnalysisSection";

interface JournalEntry {
  id: string;
  text: string;
  date: string;
}

const Dashboard = () => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isEntriesView, setIsEntriesView] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Load journal entries from local storage
  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem('journalEntries');
      if (storedEntries) {
        const entries: JournalEntry[] = JSON.parse(storedEntries);
        setJournalEntries(entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
    }
  }, [refreshTrigger]);

  // Handle storage events (when journal entries change)
  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Check if we should show the entries view based on URL hash
  useEffect(() => {
    setIsEntriesView(location.hash === "#entries");
  }, [location.hash]);

  // Handle date selection in calendar
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    
    // Find entries for the selected date
    const entriesForDate = journalEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return isSameDay(entryDate, date);
    });
    
    if (entriesForDate.length > 0) {
      setSelectedEntry(entriesForDate[0]);
    } else {
      setSelectedEntry(null);
    }
  };

  // Generate synthetic timeline data for JournalAnalysisSection
  const generateTimelineData = () => {
    return journalEntries.map(entry => {
      // Create a simple mapping from entry text to sentiment value
      const textLength = entry.text.length;
      // Generate a sentiment between -0.8 and 0.8 based on text length
      const sentiment = Math.sin(textLength * 0.01) * 0.8;
      
      return {
        date: new Date(entry.date),
        sentiment: sentiment,
        text: entry.text.substring(0, 100) + (entry.text.length > 100 ? "..." : "")
      };
    }).sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  // Determine sentiment change direction
  const getOverallSentimentChange = () => {
    if (journalEntries.length < 2) return "neutral";
    
    const timelineData = generateTimelineData();
    if (timelineData.length < 2) return "neutral";
    
    const firstSentiment = timelineData[0].sentiment;
    const lastSentiment = timelineData[timelineData.length - 1].sentiment;
    
    if (lastSentiment > firstSentiment + 0.1) return "positive";
    if (lastSentiment < firstSentiment - 0.1) return "negative";
    return "neutral";
  };

  // Calculate average sentiment
  const getAverageSentiment = () => {
    const timelineData = generateTimelineData();
    if (timelineData.length === 0) return 0;
    
    const total = timelineData.reduce((sum, item) => sum + item.sentiment, 0);
    return total / timelineData.length;
  };

  // Helper function to get sentiment color
  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return "#27AE60"; // Positive
    if (sentiment < -0.3) return "#E74C3C"; // Negative
    return "#3498DB"; // Neutral
  };

  return (
    <div className="min-h-screen flex flex-col bg-green">
      <Header />
      
      <main className="flex-grow container mx-auto max-w-7xl px-4 py-6 relative">
        <VectorDecorations className="absolute inset-0 pointer-events-none" />
        
        {isEntriesView ? (
          // Entries View
          <div className="bg-white rounded-xl overflow-hidden shadow-md h-[calc(100vh-140px)]">
            <EntriesView 
              entries={journalEntries}
              onSelectEntry={setSelectedEntry}
            />
          </div>
        ) : (
          // Monthly View
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <MonthlyCalendar 
                onSelectDate={handleDateSelect}
                journalEntries={journalEntries}
              />
              
              <Card className="rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 bg-green-50 border-b border-green-100">
                  <h2 className="text-xl font-semibold text-black">Journal Entries</h2>
                  <p className="text-sm text-gray-600">
                    {format(selectedDate, 'MMMM d, yyyy')}
                  </p>
                </div>
                <div className="p-4">
                  {journalEntries
                    .filter(entry => {
                      const entryDate = new Date(entry.date);
                      return isSameDay(entryDate, selectedDate);
                    })
                    .map(entry => (
                      <div key={entry.id} className="mb-4 last:mb-0">
                        <div className="text-xs text-gray-500 mb-1">
                          {format(new Date(entry.date), 'h:mm a')}
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm line-clamp-5">{entry.text}</p>
                        </div>
                      </div>
                    ))}
                  
                  {journalEntries.filter(entry => {
                    const entryDate = new Date(entry.date);
                    return isSameDay(entryDate, selectedDate);
                  }).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No journal entries for this date
                    </div>
                  )}
                </div>
              </Card>
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              <Goals />
              
              <MonthlyReflections 
                journalText=""
                refreshTrigger={refreshTrigger}
                journalRefreshTrigger={refreshTrigger}
              />
              
              <JournalAnalysisSection 
                journalEntries={journalEntries}
                timelineData={generateTimelineData()}
                overallSentimentChange={getOverallSentimentChange()}
                averageSentiment={getAverageSentiment()}
                getSentimentColor={getSentimentColor}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>
        )}
        
        {/* Ask AI Section at the bottom */}
        <div className="mt-6">
          <AskAI 
            journalText={journalEntries.map(entry => entry.text).join(" ")}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
