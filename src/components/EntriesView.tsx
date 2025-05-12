
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TextEmotionViewer } from './TextEmotionViewer';
import { DocumentSummary } from './DocumentSummary';
import { SentimentOverview } from './SentimentOverview';
import { SentimentTimeline } from './SentimentTimeline';
import { KeyPhrases } from './KeyPhrases';
import { EntitySentiment } from './EntitySentiment';
import { analyzeTextWithBert } from '@/utils/bertIntegration';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ScrollArea } from './ui/scroll-area';

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
  
  // States to control collapsible sections
  const [isDetailedAnalysisOpen, setIsDetailedAnalysisOpen] = useState(true);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  
  // States for Entry Analysis tab sections
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [isDocTextAnalysisOpen, setIsDocTextAnalysisOpen] = useState(false);
  const [isLatentEmotionalOpen, setIsLatentEmotionalOpen] = useState(false);
  const [isWordComparisonOpen, setIsWordComparisonOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isKeywordsOpen, setIsKeywordsOpen] = useState(false);

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
      {/* Main Content Area - Removed search and filter controls */}
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
          <Tabs defaultValue="entry" className="h-full flex flex-col">
            <div className="border-b">
              <TabsList className="p-3">
                <TabsTrigger value="entry">Journal Entry</TabsTrigger>
                <TabsTrigger value="analysis">Entry Analysis</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="entry" className="flex-grow overflow-y-auto p-4">
              {selectedEntry ? (
                <div>
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-1 font-pacifico">
                      Journal Entry
                    </h2>
                    <p className="text-gray-600">
                      {format(new Date(selectedEntry.date), 'MMMM d, yyyy - h:mm a')}
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
                  
                  {/* Detailed Analyzed Data Section */}
                  <Collapsible open={isDetailedAnalysisOpen} onOpenChange={setIsDetailedAnalysisOpen} className="mb-4 border rounded-lg overflow-hidden">
                    <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <h3 className="text-lg font-medium font-pacifico">Detailed Analyzed Data</h3>
                      {isDetailedAnalysisOpen ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 bg-white">
                      <ScrollArea className="h-[500px]">
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
                            <div className="flex flex-wrap gap-2">
                              {bertAnalysis?.keywords?.slice(0, 5).map((keyword: any, i: number) => (
                                <div 
                                  key={i} 
                                  className="px-3 py-2 rounded-full text-white text-sm"
                                  style={{ 
                                    backgroundColor: keyword.color || 
                                      (keyword.sentiment > 0 ? '#68D391' : '#FC8181')
                                  }}
                                >
                                  {keyword.word}
                                </div>
                              ))}
                              {(!bertAnalysis?.keywords || bertAnalysis.keywords.length === 0) && (
                                <p className="text-gray-500">No emotional keywords detected</p>
                              )}
                            </div>
                            
                            <div className="mt-6">
                              <h4 className="text-md font-medium mb-2">Main Subjects</h4>
                              <div className="flex flex-wrap gap-2">
                                {mainSubjects.map((subject, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                                  >
                                    {subject}
                                  </span>
                                ))}
                                {mainSubjects.length === 0 && (
                                  <p className="text-gray-500">No main subjects detected</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Suggestions Section */}
                  <Collapsible open={isSuggestionsOpen} onOpenChange={setIsSuggestionsOpen} className="mb-4 border rounded-lg overflow-hidden">
                    <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <h3 className="text-lg font-medium font-pacifico">Suggestions</h3>
                      {isSuggestionsOpen ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 bg-white">
                      <p className="text-gray-700 mb-4">
                        Based on your journal entry, here are some suggestions that might be helpful:
                      </p>
                      {bertAnalysis ? (
                        <div className="space-y-4">
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-medium mb-1">Consider adding more details</h4>
                            <p className="text-sm">Your entry could benefit from more specific examples or situations.</p>
                          </div>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="font-medium mb-1">Reflect on your emotions</h4>
                            <p className="text-sm">Try exploring why you felt the way you did during these events.</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-center text-gray-500 py-4">
                          No suggestions available yet
                        </p>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                  
                  <div className="flex justify-end gap-2 mt-6">
                    <Button 
                      variant="outline" 
                      className="border-purple-200 text-purple-700"
                    >
                      Export as PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-red-200 text-red-700"
                    >
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
            
            <TabsContent value="analysis" className="flex-grow overflow-y-auto">
              {selectedEntry ? (
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="p-4">
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold mb-1 font-pacifico">
                        Entry Analysis
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
                        {/* 1. Overview Section */}
                        <Collapsible open={isOverviewOpen} onOpenChange={setIsOverviewOpen} className="mb-4 border rounded-lg overflow-hidden">
                          <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                            <h3 className="text-lg font-medium font-pacifico">Overview</h3>
                            {isOverviewOpen ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-4 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">Overall Sentiment</h4>
                                <p className="text-xl font-semibold mb-1">
                                  {bertAnalysis?.sentiment?.label || "Neutral"}
                                </p>
                                <p className="text-gray-700">
                                  Score: {Math.round((bertAnalysis?.sentiment?.score || 0.5) * 100)}%
                                </p>
                                <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${bertAnalysis?.sentiment?.score > 0.6 ? 'bg-green-500' : 
                                      bertAnalysis?.sentiment?.score < 0.4 ? 'bg-red-500' : 'bg-yellow-500'}`}
                                    style={{ width: `${Math.round((bertAnalysis?.sentiment?.score || 0.5) * 100)}%` }}
                                  ></div>
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
                                      <span>{bertAnalysis?.distribution?.positive || 0}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-green-500"
                                        style={{ width: `${bertAnalysis?.distribution?.positive || 0}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <div className="flex justify-between mb-1 text-sm">
                                      <span>Neutral</span>
                                      <span>{bertAnalysis?.distribution?.neutral || 0}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-blue-400"
                                        style={{ width: `${bertAnalysis?.distribution?.neutral || 0}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <div className="flex justify-between mb-1 text-sm">
                                      <span>Negative</span>
                                      <span>{bertAnalysis?.distribution?.negative || 0}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-red-500"
                                        style={{ width: `${bertAnalysis?.distribution?.negative || 0}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* 2. Document Text Analysis */}
                        <Collapsible open={isDocTextAnalysisOpen} onOpenChange={setIsDocTextAnalysisOpen} className="mb-4 border rounded-lg overflow-hidden">
                          <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                            <h3 className="text-lg font-medium font-pacifico">Document Text Analysis</h3>
                            {isDocTextAnalysisOpen ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-4 bg-white">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Text Structure</h4>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-3xl font-bold">{documentStats.wordCount}</p>
                                    <p className="text-sm text-gray-600">Words</p>
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-3xl font-bold">{documentStats.sentenceCount}</p>
                                    <p className="text-sm text-gray-600">Sentences</p>
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-3xl font-bold">{documentStats.paragraphCount}</p>
                                    <p className="text-sm text-gray-600">Paragraphs</p>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4">
                                <h4 className="font-medium mb-2">Text Sample</h4>
                                <div className="bg-gray-50 p-3 rounded-lg border">
                                  <p className="text-gray-700">{selectedEntry.text.substring(0, 200)}...</p>
                                </div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* 3. Latent Emotional Analysis */}
                        <Collapsible open={isLatentEmotionalOpen} onOpenChange={setIsLatentEmotionalOpen} className="mb-4 border rounded-lg overflow-hidden">
                          <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                            <h3 className="text-lg font-medium font-pacifico">Latent Emotional Analysis</h3>
                            {isLatentEmotionalOpen ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-4 bg-white">
                            <div className="bg-gray-50 rounded-lg p-5">
                              {bertAnalysis ? (
                                <TextEmotionViewer 
                                  pdfText={selectedEntry.text}
                                  bertAnalysis={bertAnalysis}
                                />
                              ) : (
                                <p className="text-center text-gray-500 py-4">
                                  No emotional analysis available
                                </p>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* 4. Word Comparison */}
                        <Collapsible open={isWordComparisonOpen} onOpenChange={setIsWordComparisonOpen} className="mb-4 border rounded-lg overflow-hidden">
                          <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                            <h3 className="text-lg font-medium font-pacifico">Word Comparison</h3>
                            {isWordComparisonOpen ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-4 bg-white">
                            <p className="text-gray-700 mb-4">
                              Compare the emotional relationships between key words in your entry.
                            </p>
                            {bertAnalysis?.keywords?.length > 5 ? (
                              <div className="grid grid-cols-3 gap-3">
                                {bertAnalysis.keywords.slice(0, 9).map((kw: any, i: number) => (
                                  <div key={i} className="flex items-center bg-gray-50 p-2 rounded-lg">
                                    <div 
                                      className="w-3 h-3 rounded-full mr-2"
                                      style={{ backgroundColor: kw.color || "#aaaaaa" }}
                                    ></div>
                                    <span className="text-sm">{kw.word}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-center text-gray-500">
                                Not enough keywords for meaningful comparison
                              </p>
                            )}
                          </CollapsibleContent>
                        </Collapsible>

                        {/* 5. Timeline */}
                        <Collapsible open={isTimelineOpen} onOpenChange={setIsTimelineOpen} className="mb-4 border rounded-lg overflow-hidden">
                          <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                            <h3 className="text-lg font-medium font-pacifico">Timeline</h3>
                            {isTimelineOpen ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-4 bg-white">
                            <SentimentTimeline 
                              data={[
                                { date: "Begin", sentiment: bertAnalysis?.sentiment?.score || 0.5 },
                                { date: "Middle", sentiment: bertAnalysis?.sentiment?.score || 0.5 },
                                { date: "End", sentiment: bertAnalysis?.sentiment?.score || 0.5 },
                              ]}
                              sourceDescription="Emotional flow through journal entry"
                            />
                          </CollapsibleContent>
                        </Collapsible>

                        {/* 6. Keywords */}
                        <Collapsible open={isKeywordsOpen} onOpenChange={setIsKeywordsOpen} className="mb-4 border rounded-lg overflow-hidden">
                          <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                            <h3 className="text-lg font-medium font-pacifico">Keywords</h3>
                            {isKeywordsOpen ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="p-4 bg-white">
                            <div className="flex flex-wrap gap-2">
                              {bertAnalysis?.keywords?.map((keyword: any, i: number) => (
                                <span 
                                  key={i} 
                                  className="px-3 py-1 rounded-full text-sm"
                                  style={{ 
                                    backgroundColor: keyword.color ? `${keyword.color}33` : '#f3f4f6',
                                    color: keyword.color ? keyword.color : '#374151',
                                    border: `1px solid ${keyword.color || '#e5e7eb'}`
                                  }}
                                >
                                  {keyword.word}
                                </span>
                              ))}
                              {(!bertAnalysis?.keywords || bertAnalysis.keywords.length === 0) && (
                                <p className="text-center text-gray-500 w-full py-4">
                                  No keywords extracted
                                </p>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        <div className="mt-8">
                          <h3 className="text-lg font-medium mb-3 font-pacifico">Full Text</h3>
                          <div className="p-4 bg-gray-50 rounded-lg border">
                            <pre className="whitespace-pre-wrap text-sm font-georgia">{selectedEntry.text}</pre>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </ScrollArea>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">Select an entry to see its analysis</p>
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
