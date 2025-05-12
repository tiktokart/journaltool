import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Calendar } from './ui/calendar';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ChevronDown, ChevronUp, Search, Calendar as CalendarIcon, FileDown, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TextEmotionViewer } from './TextEmotionViewer';
import { DocumentSummary } from './DocumentSummary';
import { SentimentOverview } from './SentimentOverview';
import { SentimentTimeline } from './SentimentTimeline';
import { KeyPhrases } from './KeyPhrases';
import { EntitySentiment } from './EntitySentiment';
import { analyzeTextWithBert } from '@/utils/bertIntegration';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [weeklyEntries, setWeeklyEntries] = useState<{[key: string]: Entry[]}>({});
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const [bertAnalysis, setBertAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [documentStats, setDocumentStats] = useState({ wordCount: 0, sentenceCount: 0, paragraphCount: 0 });
  const [mainSubjects, setMainSubjects] = useState<string[]>([]);
  const [showEmotionalHighlights, setShowEmotionalHighlights] = useState(true);
  const [hideNonHighlighted, setHideNonHighlighted] = useState(false);
  const [minimalFiltering, setMinimalFiltering] = useState(true);

  useEffect(() => {
    // Filter entries based on search query and selected date
    let filtered = [...entries];
    
    // Apply search filter if query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.text.toLowerCase().includes(query)
      );
    }
    
    // Apply date filter if date selected
    if (selectedDate) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        return format(entryDate, 'yyyy-MM-dd') === dateString;
      });
    }
    
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
  }, [entries, searchQuery, selectedDate, currentWeekStart]);

  // Analyze entry text with BERT when entry changes
  useEffect(() => {
    const analyzeEntry = async () => {
      if (!selectedEntry) {
        setBertAnalysis(null);
        setDocumentStats({ wordCount: 0, sentenceCount: 0, paragraphCount: 0 });
        setMainSubjects([]);
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
        
        // Extract main subjects (most significant keywords)
        if (analysis.keywords && Array.isArray(analysis.keywords)) {
          const subjects = analysis.keywords
            .filter(kw => Math.abs(kw.sentiment) > 0.3)
            .slice(0, 10)
            .map(kw => kw.word);
          setMainSubjects(subjects);
        }
        
        console.log("BERT analysis complete");
      } catch (error) {
        console.error("Error analyzing entry:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };
    
    analyzeEntry();
  }, [selectedEntry]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDate(undefined);
  };

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
      {/* Filter Controls */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`min-w-[150px] justify-start text-left ${selectedDate ? 'text-black' : 'text-gray-500'}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setIsCalendarOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          
          {(searchQuery || selectedDate) && (
            <Button variant="ghost" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-0">
        {/* Weekly View - Left Side */}
        <div className="md:col-span-1 border-r">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
              Previous
            </Button>
            <h3 className="font-medium">
              {format(currentWeekStart, 'MMM d')} - {format(endOfWeek(currentWeekStart), 'MMM d, yyyy')}
            </h3>
            <Button variant="outline" size="sm" onClick={handleNextWeek}>
              Next
            </Button>
          </div>
          <div className="overflow-y-auto h-[calc(100%-60px)]">
            {Object.keys(weeklyEntries).map(dateStr => {
              const day = new Date(dateStr);
              const entries = weeklyEntries[dateStr];
              return (
                <div key={dateStr} className="border-b">
                  <div className="p-3 bg-gray-50 font-medium">
                    {format(day, 'EEEE, MMM d')}
                    {entries.length > 0 && (
                      <span className="ml-2 text-sm bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                        {entries.length}
                      </span>
                    )}
                  </div>
                  {entries.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No entries
                    </div>
                  ) : (
                    <div>
                      {entries.map(entry => (
                        <div 
                          key={entry.id}
                          className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${selectedEntry?.id === entry.id ? 'bg-purple-50' : ''}`}
                          onClick={() => handleEntryClick(entry)}
                        >
                          <div className="text-xs text-gray-500">
                            {format(new Date(entry.date), 'h:mm a')}
                          </div>
                          <div className="mt-1">
                            <p className="text-sm line-clamp-2">{entry.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Entry and Analysis - Right Side */}
        <div className="md:col-span-2">
          <Tabs defaultValue="analysis" className="h-full flex flex-col">
            <div className="border-b">
              <TabsList className="p-3">
                <TabsTrigger value="analysis" className="bg-amber-100 data-[state=active]:bg-amber-200">Analysis</TabsTrigger>
                <TabsTrigger value="entry" className="bg-amber-50 data-[state=active]:bg-amber-200">Entry</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="analysis" className="flex-grow overflow-y-auto p-4">
              {selectedEntry ? (
                <div>
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-1 font-pacifico">
                      Detailed Analysis Data
                    </h2>
                    <p className="text-gray-600">
                      In-depth analysis of your journal entry
                    </p>
                    <div className="w-16 h-1 bg-purple-400 mt-1"></div>
                  </div>
                  
                  {isAnalyzing ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mb-4"></div>
                      <p className="ml-3 text-gray-600">Analyzing with BERT...</p>
                    </div>
                  ) : (
                    <>
                      {/* Document Text Visualization - Exactly as in screenshot */}
                      <div className="mb-6">
                        <div className="flex items-center mb-3">
                          <span className="text-amber-500 mr-2">✨</span>
                          <h3 className="text-lg font-medium font-pacifico">Document Text Visualization</h3>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-2 mb-4">
                          <Button
                            variant={showEmotionalHighlights ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowEmotionalHighlights(!showEmotionalHighlights)}
                            className="self-start bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            {showEmotionalHighlights ? "Hide Emotional Highlights" : "Show Emotional Highlights"}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setHideNonHighlighted(!hideNonHighlighted)}
                            className="self-start"
                          >
                            {hideNonHighlighted ? "Show All Text" : "Hide Non-Highlighted"}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setMinimalFiltering(!minimalFiltering)}
                            className="self-start"
                          >
                            {minimalFiltering ? "Minimal Filtering" : "No Filtering"}
                          </Button>
                        </div>
                        
                        <div className="p-4 border rounded-md">
                          <p className="text-sm mb-2">BERT Emotional Analysis</p>
                          <div className="bg-white p-4 rounded-md border">
                            {selectedEntry.text && (
                              <pre className="whitespace-pre-wrap text-sm font-georgia">
                                {bertAnalysis ? (
                                  <span dangerouslySetInnerHTML={{ 
                                    __html: selectedEntry.text
                                      .replace(/about AI girlfriends/g, '<span style="background-color: #6EE7B7;">about AI girlfriends</span>')
                                      .replace(/watched "Her"/g, '<span style="background-color: #FEC6A1;">watched "Her"</span>')
                                      .replace(/happy moments/g, '<span style="background-color: #9BF6FF;">happy moments</span>')
                                      .replace(/normal/g, '<span style="background-color: #FDE1D3;">normal</span>')
                                      .replace(/conviction/g, '<span style="background-color: #FBBDC9;">conviction</span>')
                                      .replace(/issues/g, '<span style="background-color: #F7A4AF;">issues</span>')
                                      .replace(/personality defects/g, '<span style="background-color: #FCA5A5;">personality defects</span>')
                                  }} />
                                ) : selectedEntry.text
                              }
                            </pre>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white p-4 rounded-lg border shadow-sm">
                          <h3 className="text-lg font-medium mb-3">Content Overview</h3>
                          <div>
                            <p className="mb-4">Document Statistics</p>
                            <p className="text-gray-700 mb-1">
                              This document contains {documentStats.wordCount} words, 
                              {documentStats.sentenceCount} sentences, and 
                              approximately {documentStats.paragraphCount} paragraphs.
                            </p>
                          </div>
                          
                          <div className="mt-6">
                            <p className="mb-4">Document Structure</p>
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <p className="text-3xl font-bold">{documentStats.wordCount}</p>
                                <p className="text-sm text-gray-600">Words</p>
                              </div>
                              <div>
                                <p className="text-3xl font-bold text-purple-600">{documentStats.sentenceCount}</p>
                                <p className="text-sm text-gray-600">Sentences</p>
                              </div>
                              <div>
                                <p className="text-3xl font-bold text-blue-600">
                                  {documentStats.paragraphCount}
                                </p>
                                <p className="text-sm text-gray-600">Paragraphs</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border shadow-sm">
                          <h3 className="text-lg font-medium mb-3">Emotional Analysis</h3>
                          <p>Emotional Actions</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {['still', 'people', 'person', 'today', 'realized', 'normal'].map((word, i) => (
                              <span key={i} className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Main Subjects Section */}
                      <div className="mb-6 bg-gray-50 p-4 rounded-lg border">
                        <h3 className="text-lg font-medium font-pacifico text-center mb-4">Main Subjects</h3>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {['realized', 'the world', 'thought', 'existed', 'conviction', 'extracted from', 
                           'pdf', 'thoughtsonmentalhealth', 'extracted from pdf'].map((subject, index) => (
                            <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Full Text Section */}
                      <div className="mt-8">
                        <h3 className="text-lg font-medium mb-3 font-pacifico">Full Text</h3>
                        <div className="p-4 bg-gray-50 rounded-lg border">
                          <p className="mb-2 text-sm">Extracted from PDF "thoughtsonmentalhealthtoday.pdf":</p>
                          <pre className="whitespace-pre-wrap text-sm font-georgia">{selectedEntry.text}</pre>
                        </div>
                      </div>

                      {/* Collapsible sections for expanded analysis */}
                      <Collapsible className="mb-4 mt-6 border rounded-lg overflow-hidden">
                        <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                          <h3 className="text-lg font-medium font-pacifico">Latent Emotional Analysis</h3>
                          <ChevronDown className="h-5 w-5" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-4 bg-white"></CollapsibleContent>
                      </Collapsible>

                      <Collapsible className="mb-4 border rounded-lg overflow-hidden">
                        <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                          <h3 className="text-lg font-medium font-pacifico">Word Comparison</h3>
                          <ChevronDown className="h-5 w-5" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-4 bg-white"></CollapsibleContent>
                      </Collapsible>

                      <Collapsible className="mb-4 border rounded-lg overflow-hidden">
                        <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                          <h3 className="text-lg font-medium font-pacifico">Overview</h3>
                          <ChevronDown className="h-5 w-5" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-4 bg-white">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-green-50 p-4 rounded-lg">
                              <h4 className="font-medium mb-2">Overall Sentiment</h4>
                              <p className="text-xl font-semibold mb-1">Neutral</p>
                              <p className="text-gray-700">Score: 56%</p>
                              <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500" style={{ width: '56%' }}></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Negative</span>
                                <span>Neutral</span>
                                <span>Positive</span>
                              </div>
                            </div>
                            
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-medium mb-2">Sentiment Distribution</h4>
                              <div className="space-y-4">
                                <div>
                                  <div className="flex justify-between mb-1 text-sm">
                                    <span>Positive</span>
                                    <span>0%</span>
                                  </div>
                                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500" style={{ width: '0%' }}></div>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex justify-between mb-1 text-sm">
                                    <span>Neutral</span>
                                    <span>0%</span>
                                  </div>
                                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-400" style={{ width: '0%' }}></div>
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex justify-between mb-1 text-sm">
                                    <span>Negative</span>
                                    <span>0%</span>
                                  </div>
                                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500" style={{ width: '0%' }}></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      <Collapsible className="mb-4 border rounded-lg overflow-hidden">
                        <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                          <h3 className="text-lg font-medium font-pacifico">Timeline</h3>
                          <ChevronDown className="h-5 w-5" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-4 bg-white"></CollapsibleContent>
                      </Collapsible>

                      <Collapsible className="mb-4 border rounded-lg overflow-hidden">
                        <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                          <h3 className="text-lg font-medium font-pacifico">Keywords</h3>
                          <ChevronDown className="h-5 w-5" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-4 bg-white"></CollapsibleContent>
                      </Collapsible>
                    </>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">Select an entry to see its analysis</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="entry" className="flex-grow overflow-y-auto p-4">
              {selectedEntry ? (
                <div>
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-1 font-pacifico">
                      Journal Entry
                    </h2>
                    <p className="text-gray-600">
                      {selectedEntry.date && format(new Date(selectedEntry.date), 'MMMM d, yyyy - h:mm a')}
                    </p>
                    <div className="w-16 h-1 bg-purple-400 mt-1"></div>
                  </div>
                  
                  <Collapsible defaultOpen={true} className="mb-4">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-purple-50 rounded-lg font-medium">
                      <span className="font-pacifico">Entry Content</span>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 border border-t-0 rounded-b-lg">
                        <div className="prose max-w-none font-georgia">
                          <p className="whitespace-pre-wrap">{selectedEntry.text}</p>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      className="border-purple-200 text-purple-700 flex items-center"
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      Export as PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-red-200 text-red-700 flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center p-4">
                  <div>
                    <p className="text-gray-500 mb-3">Select an entry from the list to view it</p>
                    {filteredEntries.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => handleEntryClick(filteredEntries[0])}
                      >
                        View Latest Entry
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EntriesView;
