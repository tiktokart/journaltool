
import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2, Download, Search, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import DeleteEntryConfirm from "./DeleteEntryConfirm";
import { SentimentTimeline } from "./SentimentTimeline";
import { KeyPhrases } from "./KeyPhrases";
import { DocumentEmbedding } from "./DocumentEmbedding";
import { TextEmotionViewer } from "./TextEmotionViewer";
import { jsPDF } from "jspdf";
import { extractKeyPhrases } from "@/utils/keyPhraseExtraction";
import { analyzeTextWithBert } from "@/utils/bertIntegration";
import { Point } from "@/types/embedding";
import { generateEmbeddingPoints } from "@/utils/embeddingGeneration";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { WordComparisonController } from "./WordComparisonController";

interface JournalEntry {
  id: string;
  text: string;
  date: string;
}

interface EntriesViewProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry | null) => void;
}

// Mental health suggestion resources from the published website
const mentalHealthResources = [
  {
    id: 'stress',
    keyword: 'stress',
    solutionStatement: 'Practice stress reduction techniques to improve mental wellbeing.',
    actionPlan: 'Try deep breathing exercises for 5 minutes daily, practice mindfulness meditation, or take short breaks throughout your day.',
    resourceLink: 'https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health'
  },
  {
    id: 'anxiety',
    keyword: 'anxiety',
    solutionStatement: 'Develop strategies to manage anxiety symptoms.',
    actionPlan: 'Identify anxiety triggers, practice grounding techniques, and consider speaking with a mental health professional.',
    resourceLink: 'https://adaa.org/understanding-anxiety'
  },
  {
    id: 'sad',
    keyword: 'sad',
    solutionStatement: 'Address feelings of sadness to improve emotional wellbeing.',
    actionPlan: 'Engage in activities you enjoy, connect with supportive friends or family, and consider talking to a therapist.',
    resourceLink: 'https://www.apa.org/topics/depression'
  },
  {
    id: 'depression',
    keyword: 'depression',
    solutionStatement: 'Take steps to manage feelings of depression.',
    actionPlan: 'Establish a regular sleep routine, engage in physical activity, and seek professional help if feelings persist.',
    resourceLink: 'https://www.nimh.nih.gov/health/topics/depression'
  },
  {
    id: 'sleep',
    keyword: 'sleep',
    solutionStatement: 'Improve sleep quality for better mental health.',
    actionPlan: 'Create a consistent sleep schedule, avoid screens before bed, and create a comfortable sleep environment.',
    resourceLink: 'https://www.sleepfoundation.org/mental-health'
  },
  {
    id: 'tired',
    keyword: 'tired',
    solutionStatement: 'Address fatigue to improve overall wellbeing.',
    actionPlan: 'Evaluate your sleep habits, consider your energy management throughout the day, and speak to a healthcare provider if fatigue persists.',
    resourceLink: 'https://www.mayoclinic.org/symptoms/fatigue/basics/definition/sym-20050894'
  },
  {
    id: 'worry',
    keyword: 'worry',
    solutionStatement: 'Manage excessive worrying for improved mental health.',
    actionPlan: 'Schedule "worry time," practice challenging negative thoughts, and focus on what you can control.',
    resourceLink: 'https://www.apa.org/topics/anxiety/worry'
  },
  {
    id: 'lonely',
    keyword: 'lonely',
    solutionStatement: 'Combat feelings of loneliness to improve wellbeing.',
    actionPlan: 'Reach out to friends or family, join community groups or classes, and consider volunteer opportunities.',
    resourceLink: 'https://www.mind.org.uk/information-support/tips-for-everyday-living/loneliness/about-loneliness/'
  },
  {
    id: 'angry',
    keyword: 'angry',
    solutionStatement: 'Develop healthy ways to manage anger.',
    actionPlan: 'Practice identifying anger triggers, use cooling-off techniques like deep breathing, and consider physical exercise as an outlet.',
    resourceLink: 'https://www.apa.org/topics/anger/control'
  },
  {
    id: 'overwhelmed',
    keyword: 'overwhelmed',
    solutionStatement: 'Manage feelings of being overwhelmed through structured approaches.',
    actionPlan: 'Break tasks into smaller steps, practice prioritization, and don\'t hesitate to ask for help when needed.',
    resourceLink: 'https://www.mind.org.uk/information-support/your-stories/10-ways-i-manage-feeling-overwhelmed/'
  }
];

const EntriesView: React.FC<EntriesViewProps> = ({ entries, onSelectEntry }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>(entries);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [keywordResults, setKeywordResults] = useState<any[]>([]);
  const [sentimentTimeline, setSentimentTimeline] = useState<any[]>([]);
  const [embeddingPoints, setEmbeddingPoints] = useState<Point[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("analysis");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [entryContentExpanded, setEntryContentExpanded] = useState(true);
  const [latentAnalysisExpanded, setLatentAnalysisExpanded] = useState(false);
  const [wordComparisonExpanded, setWordComparisonExpanded] = useState(false);
  const [bertAnalysisResult, setBertAnalysisResult] = useState<any>(null);
  const [overviewExpanded, setOverviewExpanded] = useState(true);
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const [keywordsExpanded, setKeywordsExpanded] = useState(false);

  // Update filtered entries when entries or search query changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredEntries(entries);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredEntries(
        entries.filter(
          entry => 
            entry.text.toLowerCase().includes(query) || 
            format(new Date(entry.date), "MMM dd, yyyy").toLowerCase().includes(query)
        )
      );
    }
  }, [entries, searchQuery]);

  const handleSearch = () => {
    if (searchInputRef.current) {
      setSearchQuery(searchInputRef.current.value);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
  };

  const handleSelectEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    onSelectEntry(entry);
    analyzeEntry(entry);
  };

  const handleDeleteEntry = () => {
    if (selectedEntry) {
      const entryId = selectedEntry.id;
      // Get entries from localStorage
      const storedEntries = localStorage.getItem('journalEntries');
      if (storedEntries) {
        const entries = JSON.parse(storedEntries);
        const updatedEntries = entries.filter((entry: JournalEntry) => entry.id !== entryId);
        
        // Save updated entries to localStorage
        localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
        
        // Dispatch storage event to notify other components
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'journalEntries',
          newValue: JSON.stringify(updatedEntries)
        }));
        
        setSelectedEntry(null);
        setDeleteConfirmOpen(false);
        toast.success("Journal entry deleted successfully");
      }
    }
  };

  // Function to calculate relationship between two points
  const calculateRelationship = (point1: Point, point2: Point) => {
    if (!point1 || !point2) return null;
    
    // Calculate spatial similarity (normalized distance in 3D space)
    const position1 = point1.position;
    const position2 = point2.position;
    
    if (!position1 || !position2) return null;
    
    const distance = Math.sqrt(
      Math.pow(position1[0] - position2[0], 2) +
      Math.pow(position1[1] - position2[1], 2) +
      Math.pow(position1[2] - position2[2], 2)
    );
    
    // Normalize distance to similarity (closer = higher similarity)
    const maxDistance = 10; // assuming points are in a 10x10x10 cube
    const spatialSimilarity = 1 - Math.min(distance / maxDistance, 1);
    
    // Calculate sentiment similarity
    const sentimentSimilarity = 1 - Math.abs(point1.sentiment - point2.sentiment);
    
    // Check if they belong to the same emotional group
    const sameEmotionalGroup = point1.emotionalTone === point2.emotionalTone;
    
    // Find shared keywords/concepts - with type safety
    const keywords1 = (point1 as any).relatedConcepts || [];
    const keywords2 = (point2 as any).relatedConcepts || [];
    const sharedKeywords = keywords1.filter((k: string) => keywords2.includes(k));
    
    return {
      spatialSimilarity,
      sentimentSimilarity,
      sameEmotionalGroup,
      sharedKeywords
    };
  };

  const analyzeEntry = async (entry: JournalEntry) => {
    try {
      setIsProcessing(true);
      
      // Extract keywords
      const keywords = await extractKeyPhrases(entry.text);
      setKeywordResults(keywords);
      
      // Get BERT analysis
      const bertResult = await analyzeTextWithBert(entry.text);
      setBertAnalysisResult(bertResult);
      
      // Generate sentiment timeline for this entry
      const sentiment = bertResult;
      const timeline = [
        {
          date: format(new Date(entry.date), "MMM dd"),
          sentiment: sentiment.overallSentiment || 0,
        }
      ];
      setSentimentTimeline(timeline);
      
      // Generate embedding points
      await generateEmbeddingVisualization(entry.text);
      
      setIsProcessing(false);
    } catch (error) {
      console.error("Error analyzing entry:", error);
      setIsProcessing(false);
      toast.error("Failed to analyze entry");
    }
  };

  // Generate embedding visualization data
  const generateEmbeddingVisualization = async (text: string) => {
    try {
      if (!text || text.trim().length === 0) {
        setEmbeddingPoints([]);
        return;
      }
      
      // Generate embedding using utility function
      const points = await generateEmbeddingPoints(text);
      setEmbeddingPoints(points);
      
    } catch (error) {
      console.error("Error generating embedding visualization:", error);
      toast.error("Failed to generate visualization");
    }
  };

  // Export entry to PDF
  const exportEntryToPDF = async () => {
    if (!selectedEntry) return;
    
    try {
      toast.info("Preparing PDF export...");
      
      // Get BERT analysis of the entry
      const bertAnalysis = bertAnalysisResult || await analyzeTextWithBert(selectedEntry.text);
      
      const doc = new jsPDF();
      const entryDate = format(parseISO(selectedEntry.date), "MMMM dd, yyyy 'at' h:mm a");
      
      // Title
      doc.setFontSize(22);
      doc.text("Journal Entry BERT Analysis", 20, 20);
      
      // Date
      doc.setFontSize(12);
      doc.text(`Date: ${entryDate}`, 20, 30);
      
      // Sentiment score
      doc.setFontSize(14);
      doc.text(`Sentiment Score: ${bertAnalysis.overallSentiment?.toFixed(2) || "N/A"}`, 20, 40);
      
      // Emotional tone - use overallTone if emotionalTone doesn't exist
      doc.text(`Emotional Tone: ${bertAnalysis.emotionalTone || bertAnalysis.overallTone || "N/A"}`, 20, 50);
      
      // Journal text
      doc.setFontSize(12);
      doc.text("Journal Content:", 20, 65);
      
      const splitText = doc.splitTextToSize(selectedEntry.text, 170);
      doc.text(splitText, 20, 75);
      
      // Analysis
      const textHeight = splitText.length * 7; // Approximate height of text
      doc.setFontSize(14);
      doc.text("BERT Analysis:", 20, 85 + textHeight);
      
      const analysisText = bertAnalysis.analysis || 
        `Analysis of sentiment: ${bertAnalysis.overallTone} (${bertAnalysis.overallSentiment.toFixed(2)})`;
      const splitAnalysis = doc.splitTextToSize(analysisText, 170);
      doc.setFontSize(12);
      doc.text(splitAnalysis, 20, 95 + textHeight);
      
      // If there are keywords, add them
      if (keywordResults && keywordResults.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text("Key Phrases:", 20, 20);
        
        let yPosition = 30;
        keywordResults.slice(0, 10).forEach((keyword, index) => {
          if (typeof keyword === 'object' && keyword.phrase) {
            doc.setFontSize(12);
            doc.text(`${index + 1}. ${keyword.phrase}`, 20, yPosition);
            yPosition += 10;
          }
        });
      }
      
      // Save the PDF
      doc.save(`journal-analysis-${format(parseISO(selectedEntry.date), "yyyy-MM-dd")}.pdf`);
      
      toast.success("Journal entry exported to PDF");
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast.error("Failed to export entry");
    }
  };

  // Generate suggestions based on entry text
  const generateSuggestions = (text: string) => {
    if (!text) return [];
    
    const lowercaseText = text.toLowerCase();
    return mentalHealthResources.filter(resource => 
      lowercaseText.includes(resource.keyword)
    );
  };

  // Helper function to extract main subject from text
  const extractMainSubject = (text: string) => {
    if (!text || text.length === 0) return "No subject identified";
    
    // Simple subject extraction - first sentence or paragraph
    const firstSentence = text.split(/[.!?]/).filter(s => s.trim().length > 0)[0] || "";
    if (firstSentence.length < 30) return firstSentence;
    
    // Return first 50 characters as subject
    return text.substring(0, 50) + "...";
  };

  return (
    <div className="grid grid-cols-12 h-full">
      {/* Left sidebar - Entry list */}
      <div className="col-span-3 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
        <div className="mb-4">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search entries..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={handleClearSearch}
            >
              {searchQuery ? "×" : <Search size={18} />}
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No journal entries found</p>
            </div>
          ) : (
            filteredEntries.map(entry => (
              <div 
                key={entry.id}
                className={`p-3 rounded-md cursor-pointer transition ${
                  selectedEntry?.id === entry.id 
                    ? 'bg-green-100 border-l-4 border-green-600' 
                    : 'bg-white hover:bg-gray-100 border border-gray-200'
                }`}
                onClick={() => handleSelectEntry(entry)}
              >
                <p className="text-xs text-gray-500 mb-1 font-georgia">
                  {format(new Date(entry.date), "MMM dd, yyyy 'at' h:mm a")}
                </p>
                <p className="text-sm line-clamp-2 font-georgia">{entry.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Right content - Selected entry */}
      <div className="col-span-9 overflow-y-auto">
        {selectedEntry ? (
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-pacifico">Journal Entry</h2>
                <p className="text-gray-500 font-georgia">
                  {format(new Date(selectedEntry.date), "MMMM dd, yyyy 'at' h:mm a")}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={exportEntryToPDF}
                  className="flex items-center gap-2 font-georgia"
                >
                  <Download className="h-4 w-4" />
                  Export as PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 font-georgia"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
            
            {/* Entry Content - Expandable */}
            <Collapsible
              open={entryContentExpanded}
              onOpenChange={setEntryContentExpanded}
              className="mb-8"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-pacifico">Entry Content</CardTitle>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {entryContentExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <div className="whitespace-pre-wrap font-georgia">
                      {selectedEntry.text}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="analysis" className="font-pacifico">Analysis</TabsTrigger>
                <TabsTrigger value="entry" className="font-pacifico">Entry</TabsTrigger>
              </TabsList>

              {/* Analysis Tab */}
              <TabsContent value="analysis">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-pacifico">Detailed Analysis Data</CardTitle>
                      <CardDescription className="font-georgia">
                        In-depth analysis of your journal entry
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="font-georgia">
                      {isProcessing ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto mb-4"></div>
                          <p>Generating detailed analysis...</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Content Overview & Emotional Actions based on image reference */}
                          <div className="grid md:grid-cols-2 gap-6 mb-6">
                            {/* Content Overview - Left Side */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                              <h3 className="font-medium mb-4 text-black text-center font-pacifico">Content Overview</h3>
                              <div className="text-sm text-black leading-relaxed font-georgia">
                                <div className="flex flex-col space-y-4">
                                  <div className="bg-white p-3 rounded-lg shadow-sm">
                                    <div className="font-medium mb-1 text-black">Document Statistics</div>
                                    <div className="text-sm">
                                      This document contains {selectedEntry.text.split(/\s+/).filter(w => w.trim().length > 0).length} words, 
                                      {selectedEntry.text.split(/[.!?]+/).filter(s => s.trim().length > 0).length} sentences, and approximately 
                                      {selectedEntry.text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length} paragraphs.
                                    </div>
                                  </div>
                                  
                                  <div className="bg-white p-3 rounded-lg shadow-sm">
                                    <div className="font-medium mb-1 text-black">Document Structure</div>
                                    <div className="flex justify-between">
                                      <div className="text-center">
                                        <div className="text-3xl font-bold text-orange">
                                          {selectedEntry.text.split(/\s+/).filter(w => w.trim().length > 0).length}
                                        </div>
                                        <div className="text-xs">Words</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-3xl font-bold text-purple-500">
                                          {selectedEntry.text.split(/[.!?]+/).filter(s => s.trim().length > 0).length}
                                        </div>
                                        <div className="text-xs">Sentences</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-3xl font-bold text-blue-500">
                                          {selectedEntry.text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length}
                                        </div>
                                        <div className="text-xs">Paragraphs</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Emotional Actions - Right Side */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                              <h3 className="font-medium mb-4 text-black text-center font-pacifico">Emotional Actions</h3>
                              {bertAnalysisResult?.keywords?.length > 0 ? (
                                <div className="flex flex-wrap gap-4 justify-center">
                                  {bertAnalysisResult.keywords.slice(0, 6).map((item: any, index: number) => (
                                    <div key={index} className="flex flex-col items-center">
                                      <div 
                                        className="rounded-full flex items-center justify-center bg-gray-100 border-2 border-white shadow-md"
                                        style={{
                                          width: `${60 + (item.score * 40)}px`,
                                          height: `${60 + (item.score * 40)}px`,
                                        }}
                                      >
                                        <span className="font-bold text-center font-georgia">
                                          {item.word}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground text-center font-georgia">
                                  No significant emotional actions detected
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Main Subjects - Below */}
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                            <h3 className="font-medium mb-4 text-black text-center font-pacifico">Main Subjects</h3>
                            {keywordResults?.length > 0 ? (
                              <div className="flex justify-center gap-6 flex-wrap">
                                {keywordResults.slice(0, 8).map((item, index) => (
                                  <div key={index} className="text-center">
                                    <div 
                                      className="mx-auto bg-slate-100 rounded-xl p-4 shadow-sm border border-white"
                                      style={{
                                        width: `${Math.max(100, item.score * 140)}px`,
                                        height: `${Math.max(60, item.score * 80)}px`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'column'
                                      }}
                                    >
                                      <div className="font-semibold font-georgia">{typeof item === 'string' ? item : item.phrase || item.word}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground text-center font-georgia">
                                No significant subjects detected
                              </p>
                            )}
                          </div>
                          
                          {/* Full Text Section */}
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h3 className="font-medium mb-2 text-black font-pacifico">Full Text</h3>
                            <div className="text-sm text-black leading-relaxed whitespace-pre-line max-h-[400px] overflow-y-auto border border-border p-4 rounded-md bg-white font-georgia">
                              {selectedEntry.text}
                            </div>
                          </div>
                          
                          {/* Suggestions based on content */}
                          {generateSuggestions(selectedEntry.text).length > 0 && (
                            <div>
                              <h3 className="text-lg font-medium mb-2 font-pacifico">Suggested Resources</h3>
                              <div className="space-y-3">
                                {generateSuggestions(selectedEntry.text).map(suggestion => (
                                  <div key={suggestion.id} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                    <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-medium text-orange-700 font-georgia">{suggestion.solutionStatement}</h4>
                                      <span className="text-xs px-2 py-1 bg-orange-100 rounded-full text-orange-800 font-georgia">
                                        Triggered by: "{suggestion.keyword}"
                                      </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-700 font-georgia">{suggestion.actionPlan}</p>
                                    <a 
                                      href={suggestion.resourceLink}
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="mt-2 text-xs text-orange-600 hover:text-orange-800 inline-block font-georgia"
                                    >
                                      Learn more about managing {suggestion.keyword}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Entry Tab with Document Text Visualization */}
              <TabsContent value="entry">
                <div className="space-y-6">
                  {/* Document Text Visualization with BERT highlighting */}
                  <div className="mb-6">
                    <TextEmotionViewer 
                      pdfText={selectedEntry.text} 
                      embeddingPoints={embeddingPoints}
                      sourceDescription="BERT Emotional Analysis" 
                    />
                  </div>
                  
                  {/* Latent Emotional Analysis - Expandable */}
                  <Collapsible 
                    open={latentAnalysisExpanded} 
                    onOpenChange={setLatentAnalysisExpanded}
                    className="mb-6"
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-pacifico">Latent Emotional Analysis</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            {latentAnalysisExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </CardHeader>
                      <CollapsibleContent>
                        <CardContent className="p-4">
                          <div className="h-[300px] w-full bg-gray-50 rounded-lg overflow-hidden">
                            <DocumentEmbedding 
                              points={embeddingPoints} 
                              isInteractive={true} 
                              depressedJournalReference={(bertAnalysisResult?.overallSentiment || 0.5) < 0.4}
                            />
                          </div>
                          <div className="mt-4">
                            <h4 className="font-medium mb-2 font-pacifico">Emotional Clusters</h4>
                            <p className="text-sm mb-2 font-georgia">
                              This visualization represents the latent emotional patterns in your journal entry.
                              Similar emotions are clustered together in 3D space.
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                              {["Joy", "Sadness", "Anxiety", "Contentment"].map(emotion => (
                                <div key={emotion} className="flex items-center">
                                  <div className={`w-3 h-3 rounded-full mr-2 ${
                                    emotion === "Joy" ? "bg-yellow-400" :
                                    emotion === "Sadness" ? "bg-blue-400" :
                                    emotion === "Anxiety" ? "bg-red-400" :
                                    "bg-green-400"
                                  }`}></div>
                                  <span className="text-sm font-georgia">{emotion}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                  
                  {/* Word Comparison - Expandable */}
                  <Collapsible 
                    open={wordComparisonExpanded} 
                    onOpenChange={setWordComparisonExpanded}
                    className="mb-6"
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-pacifico">Word Comparison</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            {wordComparisonExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </CardHeader>
                      <CollapsibleContent>
                        <CardContent className="p-4">
                          <WordComparisonController 
                            points={embeddingPoints}
                            selectedPoint={null}
                            sourceDescription="Journal Entry Word Comparison"
                            calculateRelationship={calculateRelationship}
                          />
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                  
                  {/* Overview section - not expandable */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="font-pacifico">Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                          <h3 className="text-lg font-medium mb-2 font-pacifico">Overall Sentiment</h3>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-semibold text-lg font-georgia">
                                {bertAnalysisResult?.overallTone || 'Neutral'}
                              </p>
                              <p className="text-muted-foreground font-georgia">Score: {((bertAnalysisResult?.overallSentiment || 0.5) * 100).toFixed(0)}%</p>
                            </div>
                            <div className="bg-green-500 h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {((bertAnalysisResult?.overallSentiment || 0.5) * 100).toFixed(0)}
                            </div>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                            <div 
                              className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
                              style={{ width: `${(bertAnalysisResult?.overallSentiment || 0.5) * 100}%` }}
                            ></div>
                          </div>
                          
                          <div className="flex justify-between text-xs text-muted-foreground font-georgia">
                            <span>Negative</span>
                            <span>Neutral</span>
                            <span>Positive</span>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                          <h3 className="text-lg font-medium mb-2 font-pacifico">Sentiment Distribution</h3>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium font-georgia">Positive</span>
                                <span className="text-sm text-muted-foreground font-georgia">
                                  {bertAnalysisResult?.distribution?.positive || 0}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-green-500 h-2.5 rounded-full" 
                                  style={{ width: `${bertAnalysisResult?.distribution?.positive || 0}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium font-georgia">Neutral</span>
                                <span className="text-sm text-muted-foreground font-georgia">
                                  {bertAnalysisResult?.distribution?.neutral || 0}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-blue-500 h-2.5 rounded-full" 
                                  style={{ width: `${bertAnalysisResult?.distribution?.neutral || 0}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium font-georgia">Negative</span>
                                <span className="text-sm text-muted-foreground font-georgia">
                                  {bertAnalysisResult?.distribution?.negative || 0}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-red-500 h-2.5 rounded-full" 
                                  style={{ width: `${bertAnalysisResult?.distribution?.negative || 0}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Timeline section - Expandable */}
                  <Collapsible 
                    open={timelineExpanded} 
                    onOpenChange={setTimelineExpanded}
                    className="mb-6"
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-pacifico">Timeline</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            {timelineExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </CardHeader>
                      <CollapsibleContent>
                        <CardContent>
                          <div className="h-[200px] w-full">
                            <SentimentTimeline data={sentimentTimeline} />
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                  
                  {/* Keywords section - Expandable */}
                  <Collapsible 
                    open={keywordsExpanded} 
                    onOpenChange={setKeywordsExpanded}
                    className="mb-6"
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-pacifico">Keywords</CardTitle>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            {keywordsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </CardHeader>
                      <CollapsibleContent>
                        <CardContent>
                          <KeyPhrases data={keywordResults} sourceDescription="BERT Analysis" />
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <p className="text-lg font-georgia">Select a journal entry to view details</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete confirmation dialog */}
      <DeleteEntryConfirm 
        isOpen={deleteConfirmOpen} 
        onOpenChange={setDeleteConfirmOpen}
        onConfirmDelete={handleDeleteEntry}
      />
    </div>
  );
};

export default EntriesView;

