
import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import WeeklyEntriesList from './journal/WeeklyEntriesList';
import BertAnalysisManager from './journal/BertAnalysisManager';
import WeekNavigator from './journal/WeekNavigator';
import JournalTabs from './journal/JournalTabs';
import TimelineExtractor from './journal/TimelineExtractor';

interface Entry {
  id: string;
  text: string;
  date: string;
  [key: string]: any;
}

interface EntriesViewProps {
  entries: Entry[];
  onSelectEntry?: (entry: Entry) => void;
}

const EntriesView: React.FC<EntriesViewProps> = ({ entries, onSelectEntry }) => {
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [weeklyEntries, setWeeklyEntries] = useState<{[key: string]: Entry[]}>({});
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const [bertAnalysis, setBertAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [documentStats, setDocumentStats] = useState({ wordCount: 0, sentenceCount: 0, paragraphCount: 0 });
  const [mainSubjects, setMainSubjects] = useState<string[]>([]);
  const [emotionGroups, setEmotionGroups] = useState<{[key: string]: any[]}>({});
  const [timelineData, setTimelineData] = useState<any[]>([]);
  
  // States to control collapsible sections
  const [isDetailedAnalysisOpen, setIsDetailedAnalysisOpen] = useState(true);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(true);
  
  // States for Entry Analysis tab sections
  const [isOverviewOpen, setIsOverviewOpen] = useState(true);
  const [isDocTextAnalysisOpen, setIsDocTextAnalysisOpen] = useState(false);
  const [isLatentEmotionalOpen, setIsLatentEmotionalOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isKeywordsOpen, setIsKeywordsOpen] = useState(false);

  // State for theme categories
  const [themeCategories, setThemeCategories] = useState<{name: string, words: string[], color: string}[]>([]);
  
  useEffect(() => {
    // Filter entries - now we just sort by date without search or date filters
    let filtered = [...entries];
    
    // Sort entries by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredEntries(filtered);

    // Organize entries by day of the week
    const weekStart = startOfWeek(currentWeekStart);
    const weekEnd = endOfWeek(currentWeekStart);
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    const entriesByDay: {[key: string]: Entry[]} = {};
    daysOfWeek.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      entriesByDay[dateStr] = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return format(entryDate, 'yyyy-MM-dd') === dateStr;
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
    
    setWeeklyEntries(entriesByDay);
  }, [entries, currentWeekStart]);

  const handleEntryClick = (entry: Entry) => {
    setSelectedEntry(entry);
    if (onSelectEntry) {
      onSelectEntry(entry);
    }
  };

  const handlePreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const handleNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-0">
        {/* Weekly View - Left Side */}
        <WeeklyEntriesList 
          weeklyEntries={weeklyEntries}
          currentWeekStart={currentWeekStart}
          selectedEntry={selectedEntry}
          onEntryClick={handleEntryClick}
          onPreviousWeek={handlePreviousWeek}
          onNextWeek={handleNextWeek}
        />
        
        {/* Entry and Analysis - Right Side */}
        <div className="md:col-span-2 h-full overflow-hidden">
          {/* Invisible components for logic handling */}
          <BertAnalysisManager
            selectedEntry={selectedEntry}
            setDocumentStats={setDocumentStats}
            setMainSubjects={setMainSubjects}
            setBertAnalysis={setBertAnalysis}
            setEmotionGroups={setEmotionGroups}
            setThemeCategories={setThemeCategories}
            setIsAnalyzing={setIsAnalyzing}
          />
          
          <TimelineExtractor
            selectedEntry={selectedEntry}
            bertAnalysis={bertAnalysis}
            onExtract={setTimelineData}
          />
          
          {/* UI Components */}
          <JournalTabs
            selectedEntry={selectedEntry}
            documentStats={documentStats}
            mainSubjects={mainSubjects}
            bertAnalysis={bertAnalysis}
            isAnalyzing={isAnalyzing}
            isDetailedAnalysisOpen={isDetailedAnalysisOpen}
            setIsDetailedAnalysisOpen={setIsDetailedAnalysisOpen}
            isSuggestionsOpen={isSuggestionsOpen}
            setIsSuggestionsOpen={setIsSuggestionsOpen}
            isOverviewOpen={isOverviewOpen}
            setIsOverviewOpen={setIsOverviewOpen}
            isDocTextAnalysisOpen={isDocTextAnalysisOpen}
            setIsDocTextAnalysisOpen={setIsDocTextAnalysisOpen}
            isLatentEmotionalOpen={isLatentEmotionalOpen}
            setIsLatentEmotionalOpen={setIsLatentEmotionalOpen}
            isTimelineOpen={isTimelineOpen}
            setIsTimelineOpen={setIsTimelineOpen}
            isKeywordsOpen={isKeywordsOpen}
            setIsKeywordsOpen={setIsKeywordsOpen}
            themeCategories={themeCategories}
          />
        </div>
      </div>
    </div>
  );
};

export default EntriesView;
