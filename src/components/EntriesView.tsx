
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Point } from '@/types/embedding';
import { DocumentEmbedding } from './DocumentEmbedding'; 
import MentalHealthSuggestions from './suggestions/MentalHealthSuggestions';
import { WordComparisonController } from './WordComparisonController';
import { analyzeTextWithBert } from '@/utils/bertIntegration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EntriesViewProps {
  entries: any[];
  onSelectEntry?: (entry: any) => void;
}

const EntriesView: React.FC<EntriesViewProps> = ({ entries = [], onSelectEntry }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEntries, setFilteredEntries] = useState<any[]>([]);
  const [currentEntry, setCurrentEntry] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [embeddingPoints, setEmbeddingPoints] = useState<Point[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const entriesPerPage = 10;
  
  // Filter entries by search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEntries(entries);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results = entries.filter(entry => 
      entry.text.toLowerCase().includes(query) || 
      format(new Date(entry.date), 'MMMM d, yyyy').toLowerCase().includes(query)
    );
    
    setFilteredEntries(results);
  }, [searchQuery, entries]);
  
  // Set current entry when filtered entries change
  useEffect(() => {
    if (filteredEntries.length > 0 && !currentEntry) {
      handleSelectEntry(filteredEntries[0]);
    }
  }, [filteredEntries]);
  
  // Update pagination when filtered entries change
  useEffect(() => {
    if (currentPage > Math.ceil(filteredEntries.length / entriesPerPage) - 1) {
      setCurrentPage(0);
    }
  }, [filteredEntries]);

  // Generate emotional embeddings from current entry
  useEffect(() => {
    if (currentEntry) {
      generateEmbeddingsForEntry(currentEntry);
    } else {
      setEmbeddingPoints([]);
    }
  }, [currentEntry]);

  const handleSelectEntry = (entry: any) => {
    setCurrentEntry(entry);
    if (onSelectEntry) {
      onSelectEntry(entry);
    }
    generateEmbeddingsForEntry(entry);
  };
  
  const handleNextPage = () => {
    if ((currentPage + 1) * entriesPerPage < filteredEntries.length) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };
  
  // Calculate relationship between two embedding points
  const calculateRelationship = (point1: Point, point2: Point) => {
    if (!point1 || !point2) return null;
    
    // Check if the points have the same emotional group
    const sameEmotionalGroup = point1.emotionalTone === point2.emotionalTone;
    
    // Calculate spatial similarity based on position in 3D space
    const calculateDistance = (pos1: number[], pos2: number[]) => {
      const dx = pos1[0] - pos2[0];
      const dy = pos1[1] - pos2[1];
      const dz = pos1[2] - pos2[2];
      return Math.sqrt(dx*dx + dy*dy + dz*dz);
    };
    
    const maxDistance = 10; // Maximum possible distance
    const distance = calculateDistance(point1.position, point2.position);
    const spatialSimilarity = 1 - Math.min(distance / maxDistance, 1);
    
    // Calculate sentiment similarity
    const sentimentDifference = Math.abs(point1.sentiment - point2.sentiment);
    const sentimentSimilarity = 1 - sentimentDifference;
    
    // Find shared keywords
    const keywords1 = point1.keywords || [];
    const keywords2 = point2.keywords || [];
    const sharedKeywords = keywords1.filter(kw => keywords2.includes(kw));
    
    return {
      spatialSimilarity,
      sentimentSimilarity,
      sameEmotionalGroup,
      sharedKeywords
    };
  };
  
  // Generate embeddings for the current entry
  const generateEmbeddingsForEntry = async (entry: any) => {
    if (!entry || !entry.text) {
      setEmbeddingPoints([]);
      return;
    }
    
    try {
      // Try to use BERT for analysis
      const analysis = await analyzeTextWithBert(entry.text);
      if (analysis && analysis.keywords && analysis.keywords.length > 0) {
        // If BERT provides keywords, use them
        const points = analysis.keywords.map((keyword: any, index: number) => {
          // Generate positions for 3D visualization
          const x = Math.sin(index) * 5;
          const y = Math.cos(index * 0.5) * 5;
          const z = Math.sin(index * 0.3) * Math.cos(index * 0.7) * 5;
          
          return {
            id: `e-${keyword.word}-${index}`,
            word: keyword.word,
            position: [x, y, z] as [number, number, number],
            sentiment: keyword.sentiment || 0.5,
            emotionalTone: keyword.tone || 'Neutral',
            keywords: keyword.relatedConcepts || [],
            color: keyword.color || [0.8, 0.8, 0.2] as [number, number, number], // Brighter default color
            frequency: keyword.frequency || 1
          } as Point;
        });
        
        setEmbeddingPoints(points);
        return;
      }
    } catch (error) {
      console.error("Error generating embeddings with BERT:", error);
    }
    
    // Fallback: Generate embeddings from text directly
    const words = String(entry.text).split(/\s+/)
      .filter((word: string) => {
        const cleanWord = String(word).toLowerCase().replace(/[^\w]/g, '');
        // Exclude prepositions, helping verbs, conjunctions, pronouns, and filler words
        const excludedWords = ['the', 'a', 'an', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 
                              'in', 'out', 'with', 'about', 'against', 'before', 'after', 'during', 'he', 'she', 
                              'it', 'they', 'we', 'you', 'i', 'me', 'him', 'her', 'them', 'us', 'is', 'am', 'are',
                              'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
                              'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'can', 'could', 'uh', 'um',
                              'eh', 'oh', 'ah', 'hmm', 'like', 'just', 'very', 'really', 'so', 'then'];
        return cleanWord.length > 3 && !excludedWords.includes(cleanWord);
      });
    
    const uniqueWords = Array.from(new Set(words));
    const points: Point[] = [];
    
    // Limit to 50 words for performance
    const limitedWords = uniqueWords.slice(0, 50);
    
    // Create a mapping of word to frequency count
    const wordCounts: Record<string, number> = {};
    words.forEach((word: string) => {
      const cleanWord = String(word).replace(/[^\w]/g, '').toLowerCase();
      if (cleanWord.length > 3) {
        wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
      }
    });
    
    // Generate emotional tones based on word patterns
    const emotionalTones = ['Joy', 'Sadness', 'Anxiety', 'Contentment', 'Confusion', 'Anger', 'Fear', 'Surprise'];
    
    limitedWords.forEach((word, index) => {
      // Ensure word is a string before calling replace
      const wordStr = String(word);
      const cleanWord = wordStr.replace(/[^\w]/g, '');
      if (cleanWord.length <= 3) return;
      
      // Generate hash based on the word
      const hash = [...cleanWord].reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      // Generate consistent position
      const x = Math.sin(hash) * 5;
      const y = Math.cos(hash * 0.5) * 5;
      const z = Math.sin(hash * 0.3) * Math.cos(hash * 0.7) * 5;
      
      // Assign emotional tone based on hash
      const toneIndex = hash % emotionalTones.length;
      const emotionalTone = emotionalTones[toneIndex];
      
      // Generate sentiment based on emotional tone
      let sentiment = 0.5;
      switch(emotionalTone) {
        case 'Joy':
        case 'Contentment':
          sentiment = 0.6 + (hash % 30) / 100;
          break;
        case 'Sadness':
        case 'Fear':
        case 'Anxiety':
        case 'Anger':
          sentiment = 0.4 - (hash % 30) / 100;
          break;
        default:
          sentiment = 0.4 + (hash % 20) / 100;
      }
      
      // Create color based on emotional tone - using more vibrant colors for better visibility
      let color: [number, number, number];
      switch(emotionalTone) {
        case 'Joy':
          color = [1, 0.9, 0.2]; // Brighter Yellow
          break;
        case 'Sadness':
          color = [0.2, 0.6, 1]; // Brighter Blue
          break;
        case 'Anxiety':
          color = [1, 0.5, 0.1]; // Brighter Orange
          break;
        case 'Contentment':
          color = [0.2, 0.9, 0.4]; // Brighter Green
          break;
        case 'Confusion':
          color = [0.8, 0.4, 1]; // Brighter Purple
          break;
        case 'Anger':
          color = [1, 0.2, 0.2]; // Brighter Red
          break;
        case 'Fear':
          color = [0.9, 0.2, 0.9]; // Brighter Magenta
          break;
        case 'Surprise':
          color = [0.2, 1, 1]; // Brighter Cyan
          break;
        default:
          color = [0.8, 0.8, 0.8]; // Brighter Gray
      }
      
      points.push({
        id: `e-${cleanWord}-${index}`,
        word: cleanWord,
        position: [x, y, z],
        sentiment,
        emotionalTone,
        keywords: [],
        color,
        frequency: wordCounts[cleanWord.toLowerCase()] || 1
      } as Point);
    });
    
    setEmbeddingPoints(points);
  };
  
  const handlePointSelection = (point: Point | null) => {
    setSelectedPoint(point);
  };
  
  const startIndex = currentPage * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, filteredEntries.length);
  const currentEntries = filteredEntries.slice(startIndex, endIndex);
  
  return (
    <div className="flex h-full">
      {/* Entries List */}
      <div className="w-1/3 border-r h-full flex flex-col">
        <div className="p-4 border-b">
          <Input
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            prefix={<Search className="h-4 w-4 text-gray-400" />}
          />
        </div>
        
        <div className="flex-grow overflow-y-auto">
          {currentEntries.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No entries found</div>
          ) : (
            <>
              {currentEntries.map((entry) => (
                <div 
                  key={entry.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors
                    ${currentEntry && entry.id === currentEntry.id ? 'bg-gray-100' : ''}`}
                  onClick={() => handleSelectEntry(entry)}
                >
                  <div className="text-sm font-medium text-black">
                    {format(new Date(entry.date), 'MMMM d, yyyy')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(entry.date), 'h:mm a')}
                  </div>
                  <div className="mt-1 text-sm line-clamp-2 text-gray-600">
                    {entry.text}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        
        <div className="p-3 border-t flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrevPage}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="text-xs text-gray-500">
            {filteredEntries.length === 0 ? (
              "No entries"
            ) : (
              `${startIndex + 1}-${endIndex} of ${filteredEntries.length}`
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNextPage}
            disabled={(currentPage + 1) * entriesPerPage >= filteredEntries.length}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      
      {/* Entry Detail View */}
      <div className="w-2/3 h-full overflow-y-auto">
        {currentEntry ? (
          <div className="p-6">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <div className="text-lg font-medium text-black">
                  {format(new Date(currentEntry.date), 'MMMM d, yyyy')}
                </div>
                <div className="text-sm text-gray-500">
                  {format(new Date(currentEntry.date), 'h:mm a')}
                </div>
              </div>
              <Button
                onClick={() => {
                  // Export BERT analysis of this entry as PDF
                  try {
                    const { jsPDF } = require('jspdf');
                    const autoTable = require('jspdf-autotable').default;
                    
                    const doc = new jsPDF();
                    
                    // Title
                    doc.setFontSize(18);
                    doc.text("Journal Entry Analysis", 20, 20);
                    
                    // Entry date and time
                    doc.setFontSize(14);
                    doc.text("Entry Information", 20, 30);
                    
                    const entryDate = format(new Date(currentEntry.date), 'MMMM d, yyyy');
                    const entryTime = format(new Date(currentEntry.date), 'h:mm a');
                    
                    autoTable(doc, {
                      startY: 35,
                      head: [["Property", "Value"]],
                      body: [
                        ["Date", entryDate],
                        ["Time", entryTime],
                        ["Word Count", currentEntry.text.split(/\s+/).length.toString()],
                      ],
                    });
                    
                    // Entry content
                    const firstTableEndY = (doc as any).lastAutoTable?.finalY || 60;
                    doc.setFontSize(14);
                    doc.text("Journal Content", 20, firstTableEndY + 10);
                    doc.setFontSize(11);
                    doc.text(currentEntry.text.substring(0, 1000) + 
                      (currentEntry.text.length > 1000 ? "..." : ""), 
                      20, 
                      firstTableEndY + 20, 
                      { maxWidth: 170 }
                    );
                    
                    // Emotional analysis
                    let yPos = firstTableEndY + 80;
                    if (yPos > 250) {
                      doc.addPage();
                      yPos = 20;
                    }
                    
                    doc.setFontSize(14);
                    doc.text("Emotional Analysis", 20, yPos);
                    
                    if (embeddingPoints && embeddingPoints.length > 0) {
                      // Group by emotional tone
                      const emotionalGroups: Record<string, number> = {};
                      embeddingPoints.forEach(point => {
                        if (point.emotionalTone) {
                          emotionalGroups[point.emotionalTone] = (emotionalGroups[point.emotionalTone] || 0) + 1;
                        }
                      });
                      
                      const emotionalData = Object.entries(emotionalGroups)
                        .map(([tone, count]) => [tone, count.toString()]);
                      
                      autoTable(doc, {
                        startY: yPos + 5,
                        head: [["Emotion", "Frequency"]],
                        body: emotionalData,
                      });
                      
                      // Top keywords
                      const topWordsTableEndY = (doc as any).lastAutoTable?.finalY || (yPos + 40);
                      doc.setFontSize(14);
                      doc.text("Top Keywords", 20, topWordsTableEndY + 10);
                      
                      const topWords = embeddingPoints
                        .sort((a, b) => ((b.frequency || 1) - (a.frequency || 1)))
                        .slice(0, 10)
                        .map(point => [point.word, (point.frequency || 1).toString()]);
                      
                      autoTable(doc, {
                        startY: topWordsTableEndY + 15,
                        head: [["Word", "Frequency"]],
                        body: topWords,
                      });
                    }
                    
                    // Save the PDF
                    doc.save(`journal-entry-${entryDate.replace(/\s+/g, '-')}.pdf`);
                  } catch (error) {
                    console.error("Error exporting PDF:", error);
                    alert("Failed to export PDF. Please try again.");
                  }
                }}
                variant="outline"
                className="border-purple-200 text-purple-800 hover:bg-purple-50"
              >
                Share
              </Button>
            </div>
            
            <div className="p-5 bg-gray-50 rounded-lg mb-6">
              <p className="whitespace-pre-line">{currentEntry.text}</p>
            </div>
            
            {/* Tab Navigation for Analysis */}
            <div className="mb-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="embedding">Latent Emotional Analysis</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="keywords">Keywords</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-3">Journal Analysis Overview</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-lg p-3">
                        <h4 className="font-medium text-sm mb-2">Emotional Distribution</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {['Joy', 'Sadness', 'Anxiety', 'Contentment', 'Confusion', 'Anger', 'Fear', 'Surprise']
                            .map(emotion => {
                              const count = embeddingPoints.filter(p => p.emotionalTone === emotion).length;
                              if (count === 0) return null;
                              
                              return (
                                <div key={emotion} className="flex items-center">
                                  <div className={`w-3 h-3 rounded-full mr-2 ${
                                    emotion === "Joy" ? "bg-yellow-400" :
                                    emotion === "Sadness" ? "bg-blue-400" :
                                    emotion === "Anxiety" ? "bg-orange-400" :
                                    emotion === "Contentment" ? "bg-green-400" :
                                    emotion === "Confusion" ? "bg-purple-400" :
                                    emotion === "Anger" ? "bg-red-400" :
                                    emotion === "Fear" ? "bg-purple-700" :
                                    "bg-cyan-400"
                                  }`}></div>
                                  <span className="text-sm">{emotion}: {count}</span>
                                </div>
                              );
                            }).filter(Boolean)}
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-3">
                        <h4 className="font-medium text-sm mb-2">Top Words</h4>
                        <div className="flex flex-wrap gap-2">
                          {embeddingPoints
                            .sort((a, b) => ((b.frequency || 1) - (a.frequency || 1)))
                            .slice(0, 10)
                            .map(point => (
                              <div 
                                key={point.id} 
                                className="px-2 py-1 bg-gray-100 rounded-full text-xs cursor-pointer hover:bg-gray-200"
                                onClick={() => handlePointSelection(point)}
                                style={{
                                  backgroundColor: `rgba(${Math.round(point.color[0] * 255)}, ${Math.round(point.color[1] * 255)}, ${Math.round(point.color[2] * 255)}, 0.3)`,
                                }}
                              >
                                {point.word}{point.frequency && point.frequency > 1 ? ` (${point.frequency})` : ''}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="embedding">
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-3">Latent Emotional Analysis</h3>
                    
                    <div className="h-[300px] w-full bg-gray-50 rounded-lg overflow-hidden mb-4">
                      <DocumentEmbedding 
                        points={embeddingPoints} 
                        isInteractive={true} 
                        onPointClick={handlePointSelection}
                        selectedPoint={selectedPoint}
                        depressedJournalReference={false}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="timeline">
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-3">Emotional Timeline</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="h-[200px] flex items-end">
                        {embeddingPoints.slice(0, 20).map((point, index) => (
                          <div 
                            key={point.id}
                            className="flex-1 flex flex-col items-center justify-end cursor-pointer group"
                            onClick={() => handlePointSelection(point)}
                          >
                            <div className="text-xs opacity-0 group-hover:opacity-100 absolute mb-2 bg-white p-1 rounded shadow">
                              {point.word}
                            </div>
                            <div 
                              className="w-4 rounded-t transition-all duration-300 group-hover:opacity-80"
                              style={{
                                height: `${Math.max(30, point.sentiment * 150)}px`,
                                backgroundColor: `rgb(${Math.round(point.color[0] * 255)}, ${Math.round(point.color[1] * 255)}, ${Math.round(point.color[2] * 255)})`,
                              }}
                            ></div>
                            <div className="text-[8px] mt-1 text-gray-500">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="keywords">
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-3">Keywords Analysis</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {embeddingPoints
                        .sort((a, b) => ((b.frequency || 1) - (a.frequency || 1)))
                        .slice(0, 20)
                        .map(point => (
                          <div 
                            key={point.id}
                            className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                            onClick={() => handlePointSelection(point)}
                          >
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded-full mr-2" 
                                style={{
                                  backgroundColor: `rgb(${Math.round(point.color[0] * 255)}, ${Math.round(point.color[1] * 255)}, ${Math.round(point.color[2] * 255)})`,
                                }}
                              ></div>
                              <span>{point.word}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full mr-2">
                                {point.emotionalTone}
                              </span>
                              <span className="text-xs text-gray-500">
                                {point.frequency && point.frequency > 1 ? `${point.frequency}×` : ''}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Word Comparison */}
            <WordComparisonController
              points={embeddingPoints}
              selectedPoint={selectedPoint}
              sourceDescription="Words from this journal entry"
              calculateRelationship={calculateRelationship}
            />
            
            {/* Mental Health Suggestions based on current entry */}
            <MentalHealthSuggestions journalEntries={[currentEntry]} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select an entry to view details
          </div>
        )}
      </div>
    </div>
  );
};

export default EntriesView;
