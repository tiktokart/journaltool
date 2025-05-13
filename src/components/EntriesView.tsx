
import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { analyzeTextWithBert } from '@/utils/bertIntegration';
import WeeklyEntriesList from './journal/WeeklyEntriesList';
import JournalEntryView from './journal/JournalEntryView';
import EntryAnalysisView from './journal/EntryAnalysisView';

interface Entry {
  id: string;
  text: string;
  date: string;
  [key: string]: any; // Allow for additional properties
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
  
  // States to control collapsible sections
  const [isDetailedAnalysisOpen, setIsDetailedAnalysisOpen] = useState(true);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  
  // States for Entry Analysis tab sections
  const [isOverviewOpen, setIsOverviewOpen] = useState(true);
  const [isDocTextAnalysisOpen, setIsDocTextAnalysisOpen] = useState(false);
  const [isLatentEmotionalOpen, setIsLatentEmotionalOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isKeywordsOpen, setIsKeywordsOpen] = useState(false);

  // Add a new state for theme categories
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

  // Analyze entry text with BERT when entry changes
  useEffect(() => {
    const analyzeEntry = async () => {
      if (!selectedEntry) {
        setBertAnalysis(null);
        setDocumentStats({ wordCount: 0, sentenceCount: 0, paragraphCount: 0 });
        setMainSubjects([]);
        setEmotionGroups({});
        setThemeCategories([]);
        return;
      }
      
      setIsAnalyzing(true);
      try {
        // Calculate document stats
        const text = selectedEntry.text;
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        
        setDocumentStats({
          wordCount: words.length,
          sentenceCount: sentences.length,
          paragraphCount: Math.max(1, paragraphs.length)
        });
        
        // Run BERT analysis
        console.log("Analyzing entry with BERT...");
        const analysis = await analyzeTextWithBert(selectedEntry.text);
        setBertAnalysis(analysis);
        
        // Extract main subjects and emotion groups as before
        
        // Create theme categories from keywords
        if (analysis.keywords && Array.isArray(analysis.keywords)) {
          // Group by tones first
          const toneGroups: {[key: string]: any[]} = {};
          analysis.keywords.forEach(kw => {
            const tone = kw.tone || 'Neutral';
            if (!toneGroups[tone]) {
              toneGroups[tone] = [];
            }
            toneGroups[tone].push(kw);
          });
          
          // Create theme categories based on emotional tones and related concepts
          const themes: {name: string, words: string[], color: string}[] = [];
          
          // Process each emotional tone group
          Object.entries(toneGroups).forEach(([tone, keywords]) => {
            if (keywords.length >= 2) {
              // Extract words for this theme
              const themeWords = keywords.map(k => k.word);
              
              // Use the first keyword's color for the theme
              const themeColor = keywords[0]?.color || '#CCCCCC';
              
              themes.push({
                name: `${tone} Theme`,
                words: themeWords.slice(0, 5),
                color: themeColor
              });
            }
          });
          
          // Add additional themes based on related concepts if available
          const relatedConcepts = new Set<string>();
          analysis.keywords.forEach(kw => {
            if (kw.relatedConcepts && Array.isArray(kw.relatedConcepts)) {
              kw.relatedConcepts.forEach(concept => relatedConcepts.add(concept));
            }
          });
          
          if (relatedConcepts.size >= 3) {
            themes.push({
              name: 'Related Concepts',
              words: Array.from(relatedConcepts).slice(0, 5),
              color: '#6C5CE7'
            });
          }
          
          setThemeCategories(themes);
        }
        
        console.log("BERT analysis complete with themes");
      } catch (error) {
        console.error("Error analyzing entry:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };
    
    analyzeEntry();
  }, [selectedEntry]);

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
        <div className="md:col-span-2">
          <Tabs defaultValue="entry" className="h-full flex flex-col">
            <div className="border-b">
              <TabsList className="p-3">
                <TabsTrigger value="entry">Journal Entry</TabsTrigger>
                <TabsTrigger value="analysis">Entry Analysis</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="entry" className="flex-grow overflow-y-auto p-4">
              <JournalEntryView 
                selectedEntry={selectedEntry}
                documentStats={documentStats}
                mainSubjects={mainSubjects}
                bertAnalysis={bertAnalysis}
                isDetailedAnalysisOpen={isDetailedAnalysisOpen}
                setIsDetailedAnalysisOpen={setIsDetailedAnalysisOpen}
                isSuggestionsOpen={isSuggestionsOpen}
                setIsSuggestionsOpen={setIsSuggestionsOpen}
              />
            </TabsContent>
            
            <TabsContent value="analysis" className="flex-grow overflow-y-auto">
              <EntryAnalysisView 
                selectedEntry={selectedEntry}
                isAnalyzing={isAnalyzing}
                bertAnalysis={bertAnalysis}
                documentStats={documentStats}
                themeCategories={themeCategories}
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
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EntriesView;
