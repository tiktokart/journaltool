
// Fix the TypeError: Type 'Element' is not assignable to type 'string'
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
import { Pencil, Trash2, Download, Search, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import DeleteEntryConfirm from "./DeleteEntryConfirm";
import SentimentTimeline from "./SentimentTimeline";
import KeyPhrases from "./KeyPhrases";
import DocumentEmbedding from "./DocumentEmbedding";
import { jsPDF } from "jspdf";
import { extractKeywords } from "@/utils/keyPhraseExtraction";
import { analyzeTextWithBert } from "@/utils/bertIntegration";
import { Point } from "@/types/embedding";
import { generateEmbedding } from "@/utils/embeddingGeneration";

interface JournalEntry {
  id: string;
  text: string;
  date: string;
}

interface EntriesViewProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry | null) => void;
}

const EntriesView: React.FC<EntriesViewProps> = ({ entries, onSelectEntry }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>(entries);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [keywordResults, setKeywordResults] = useState<any[]>([]);
  const [sentimentTimeline, setSentimentTimeline] = useState<any[]>([]);
  const [embeddingPoints, setEmbeddingPoints] = useState<Point[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const analyzeEntry = async (entry: JournalEntry) => {
    try {
      setIsProcessing(true);
      
      // Extract keywords
      const keywords = await extractKeywords(entry.text);
      setKeywordResults(keywords);
      
      // Generate sentiment timeline for this entry
      const sentiment = await analyzeTextWithBert(entry.text);
      const timeline = [
        {
          date: format(new Date(entry.date), "MMM dd"),
          sentiment: sentiment.score || 0,
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
      const embedding = await generateEmbedding(text);
      
      // Simple tokenization to get words
      const words = text.split(/\s+/).filter(word => word.trim().length > 1);
      const wordSet = new Set(words.map(word => word.toLowerCase()));
      
      // Count word frequencies
      const wordCounts: {[key: string]: number} = {};
      words.forEach(word => {
        const cleanWord = word.toLowerCase().replace(/[^\w\s]|_/g, "");
        if (cleanWord.length > 0) {
          wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
        }
      });
      
      // Create points for visualization
      const points: Point[] = [];
      
      // Process the keywords to add to visualization
      keywordResults.forEach((keyword, index) => {
        if (typeof keyword === 'object' && keyword.text) {
          const cleanWord = keyword.text.toLowerCase().replace(/[^\w\s]|_/g, "");
          
          // Generate a color based on sentiment (if available)
          // Higher sentiment = more green, lower = more red
          const sentiment = keyword.sentiment || 0.5;
          const color: [number, number, number] = [
            Math.max(0, 1 - sentiment),
            Math.min(1, sentiment),
            0.2
          ];
          
          points.push({
            id: `keyword-${index}`,
            position: [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1],
            text: keyword.text,
            sentiment: keyword.sentiment || 0.5,
            emotionalTone: keyword.tone || 'Neutral',
            keywords: keyword.relatedConcepts || [],
            color: keyword.color || [0.8, 0.8, 0.2] as [number, number, number], // Brighter default color
            frequency: keyword.frequency || 1
          } as Point);
        }
      });
      
      // Add remaining common words if not enough points yet
      if (points.length < 30) {
        const topWords = Object.entries(wordCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 30 - points.length);
        
        topWords.forEach(([word, count]) => {
          const exists = points.some(p => p.text.toLowerCase() === word.toLowerCase());
          if (!exists && word.length > 3) {
            // Random position in visualization space
            const position: [number, number, number] = [
              Math.random() * 2 - 1, 
              Math.random() * 2 - 1, 
              Math.random() * 2 - 1
            ];
            
            // Neutral sentiment by default
            const color: [number, number, number] = [0.5, 0.5, 0.7];
            
            points.push({
              id: `word-${word}`,
              position,
              text: word,
              sentiment: 0.5,
              emotionalTone: 'Neutral',
              keywords: [],
              color,
              frequency: count
            } as Point);
          }
        });
      }
      
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
      const bertAnalysis = await analyzeTextWithBert(selectedEntry.text);
      
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
      doc.text(`Sentiment Score: ${bertAnalysis.score.toFixed(2)}`, 20, 40);
      
      // Emotional tone
      doc.text(`Emotional Tone: ${bertAnalysis.sentiment}`, 20, 50);
      
      // Journal text
      doc.setFontSize(12);
      doc.text("Journal Content:", 20, 65);
      
      const splitText = doc.splitTextToSize(selectedEntry.text, 170);
      doc.text(splitText, 20, 75);
      
      // Analysis
      const textHeight = splitText.length * 7; // Approximate height of text
      doc.setFontSize(14);
      doc.text("BERT Analysis:", 20, 85 + textHeight);
      
      const analysisText = bertAnalysis.text || "No detailed analysis available";
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
          if (typeof keyword === 'object' && keyword.text) {
            doc.setFontSize(12);
            doc.text(`${index + 1}. ${keyword.text}`, 20, yPosition);
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
                <p className="text-xs text-gray-500 mb-1">
                  {format(new Date(entry.date), "MMM dd, yyyy 'at' h:mm a")}
                </p>
                <p className="text-sm line-clamp-2">{entry.text}</p>
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
                <h2 className="text-2xl font-semibold">Journal Entry</h2>
                <p className="text-gray-500">
                  {format(new Date(selectedEntry.date), "MMMM dd, yyyy 'at' h:mm a")}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={exportEntryToPDF}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export as PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Entry Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap">
                  {selectedEntry.text}
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="latent-emotional">Latent Emotional Analysis</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="keywords">Keywords</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Entry Overview</CardTitle>
                    <CardDescription>
                      A summary of insights from your journal entry
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isProcessing ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto mb-4"></div>
                        <p>Analyzing your journal entry...</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-2">Word Count</h3>
                          <p>{selectedEntry.text.split(/\s+/).filter(Boolean).length} words</p>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-2">Emotional Tone</h3>
                          <div className="flex items-center">
                            {/* This would be replaced with actual sentiment data */}
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-green-600 h-2.5 rounded-full" 
                                style={{ width: `${((sentimentTimeline[0]?.sentiment || 0) * 50) + 50}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm">
                              {sentimentTimeline[0]?.sentiment > 0.2 ? 'Positive' : 
                               sentimentTimeline[0]?.sentiment < -0.2 ? 'Negative' : 'Neutral'}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium mb-2">Common Themes</h3>
                          <div className="flex flex-wrap gap-2">
                            {keywordResults.slice(0, 5).map((keyword, index) => (
                              <span 
                                key={index}
                                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                              >
                                {typeof keyword === 'object' ? keyword.text : keyword}
                              </span>
                            ))}
                            
                            {keywordResults.length === 0 && (
                              <p className="text-gray-500">No themes identified</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="latent-emotional">
                <Card className="min-h-[300px]">
                  <CardHeader>
                    <CardTitle>Latent Emotional Analysis</CardTitle>
                    <CardDescription>
                      Visualizing the emotional landscape of your entry
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isProcessing ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto mb-4"></div>
                        <p>Generating emotional analysis...</p>
                      </div>
                    ) : embeddingPoints.length > 0 ? (
                      <div className="h-[500px] rounded-lg overflow-hidden border border-gray-200">
                        <DocumentEmbedding points={embeddingPoints} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-500">
                        <div className="text-center">
                          <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <p>Not enough data to generate emotional analysis</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="timeline">
                <Card className="min-h-[300px]">
                  <CardHeader>
                    <CardTitle>Sentiment Timeline</CardTitle>
                    <CardDescription>
                      Tracking the emotional journey in your entry
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isProcessing ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto mb-4"></div>
                        <p>Analyzing sentiment...</p>
                      </div>
                    ) : sentimentTimeline.length > 0 ? (
                      <div className="h-[300px]">
                        <SentimentTimeline data={sentimentTimeline} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-500">
                        <p>No sentiment data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="keywords">
                <Card className="min-h-[300px]">
                  <CardHeader>
                    <CardTitle>Key Phrases</CardTitle>
                    <CardDescription>
                      Important concepts and phrases from your entry
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isProcessing ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto mb-4"></div>
                        <p>Extracting key phrases...</p>
                      </div>
                    ) : keywordResults.length > 0 ? (
                      <KeyPhrases keywords={keywordResults} />
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-500">
                        <p>No key phrases identified</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <DeleteEntryConfirm 
              isOpen={deleteConfirmOpen}
              onClose={() => setDeleteConfirmOpen(false)}
              onConfirm={handleDeleteEntry}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="mb-4">
                <Pencil className="h-12 w-12 mx-auto text-gray-300" />
              </div>
              <h3 className="text-xl font-medium mb-1">No Entry Selected</h3>
              <p>Select a journal entry from the list to view its details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntriesView;
