
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ChevronUp, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../ui/collapsible";
import { ScrollArea } from "../ui/scroll-area";
import { TextEmotionViewer } from "../TextEmotionViewer";
import { SentimentTimeline } from "../SentimentTimeline";
import JournalSentimentChart from "../reflections/JournalSentimentChart";
import { KeyPhrases } from "../KeyPhrases";
import { generateTimeline } from "@/utils/timelineGeneration";
import { Slider } from "../ui/slider";

interface Entry {
  id: string;
  text: string;
  date: string;
}

interface ThemeCategory {
  name: string;
  words: string[];
  color: string;
}

interface EntryAnalysisViewProps {
  selectedEntry: Entry | null;
  isAnalyzing: boolean;
  bertAnalysis: any;
  documentStats: { wordCount: number; sentenceCount: number; paragraphCount: number };
  themeCategories: ThemeCategory[];
  isOverviewOpen: boolean;
  setIsOverviewOpen: (isOpen: boolean) => void;
  isDocTextAnalysisOpen: boolean;
  setIsDocTextAnalysisOpen: (isOpen: boolean) => void;
  isLatentEmotionalOpen: boolean;
  setIsLatentEmotionalOpen: (isOpen: boolean) => void;
  isTimelineOpen: boolean;
  setIsTimelineOpen: (isOpen: boolean) => void;
  isKeywordsOpen: boolean;
  setIsKeywordsOpen: (isOpen: boolean) => void;
}

const EntryAnalysisView: React.FC<EntryAnalysisViewProps> = ({
  selectedEntry,
  isAnalyzing,
  bertAnalysis,
  documentStats,
  themeCategories,
  isOverviewOpen,
  setIsOverviewOpen,
  isDocTextAnalysisOpen,
  setIsDocTextAnalysisOpen,
  isLatentEmotionalOpen,
  setIsLatentEmotionalOpen,
  isTimelineOpen,
  setIsTimelineOpen,
  isKeywordsOpen,
  setIsKeywordsOpen
}) => {
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [sentimentScore, setSentimentScore] = useState(0.5);
  const [sentimentLabel, setSentimentLabel] = useState("Neutral");
  
  // Process BERT analysis data when available
  useEffect(() => {
    if (bertAnalysis?.sentiment) {
      // Ensure score is between 0-1
      const score = Math.max(0, Math.min(1, bertAnalysis.sentiment.score || 0.5));
      setSentimentScore(score);
      
      // Set sentiment label based on score or use the one provided
      if (bertAnalysis.sentiment.label) {
        setSentimentLabel(bertAnalysis.sentiment.label);
      } else {
        if (score >= 0.7) setSentimentLabel("Very Positive");
        else if (score >= 0.55) setSentimentLabel("Positive");
        else if (score >= 0.45) setSentimentLabel("Neutral");
        else if (score >= 0.3) setSentimentLabel("Negative");
        else setSentimentLabel("Very Negative");
      }
    }
  }, [bertAnalysis]);
  
  // Generate timeline data from the entry text
  useEffect(() => {
    const fetchTimelineData = async () => {
      if (selectedEntry?.text) {
        try {
          // Generate timeline points from the entry text
          const timelinePoints = await generateTimeline(selectedEntry.text);
          setTimelineData(timelinePoints);
        } catch (error) {
          console.error("Error generating timeline:", error);
          // Fallback to simple timeline based on sentiment
          if (bertAnalysis?.sentiment?.score) {
            const score = bertAnalysis.sentiment.score;
            // Create a simple 3-point timeline with slight variations
            setTimelineData([
              { 
                page: 1, 
                score: Math.max(0.1, Math.min(0.9, score - 0.05)), 
                time: "Beginning",
                event: selectedEntry.text.substring(0, 50) + "..." 
              },
              { 
                page: 2, 
                score: Math.max(0.1, Math.min(0.9, score)), 
                time: "Middle",
                event: selectedEntry.text.substring(
                  Math.floor(selectedEntry.text.length / 2), 
                  Math.floor(selectedEntry.text.length / 2) + 50
                ) + "..."
              },
              { 
                page: 3, 
                score: Math.max(0.1, Math.min(0.9, score + 0.05)), 
                time: "End",
                event: selectedEntry.text.substring(
                  Math.max(0, selectedEntry.text.length - 50)
                ) + "..."
              }
            ]);
          }
        }
      }
    };
    
    fetchTimelineData();
  }, [selectedEntry, bertAnalysis]);

  if (!selectedEntry) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Select an entry to see its analysis</p>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mb-4"></div>
        <p className="ml-3 text-gray-600">Analyzing with BERT...</p>
      </div>
    );
  }

  // Extract key paragraphs or sentences for timeline points
  const extractTimelinePoints = () => {
    if (!selectedEntry?.text) return [];
    
    // Split text into paragraphs or sentences
    const paragraphs = selectedEntry.text.split('\n').filter(p => p.trim().length > 0);
    
    if (paragraphs.length <= 2) {
      // If few paragraphs, split into sentences
      const sentences = selectedEntry.text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      // Take first, middle and last sentence
      return [
        {
          page: 1,
          score: bertAnalysis?.sentiment?.score ? Math.max(0.1, Math.min(0.9, bertAnalysis.sentiment.score - 0.05)) : 0.5,
          time: "Start",
          textSnippet: sentences[0]?.trim()
        },
        {
          page: 2,
          score: bertAnalysis?.sentiment?.score || 0.5,
          time: "Middle",
          textSnippet: sentences[Math.floor(sentences.length / 2)]?.trim()
        },
        {
          page: 3,
          score: bertAnalysis?.sentiment?.score ? Math.max(0.1, Math.min(0.9, bertAnalysis.sentiment.score + 0.05)) : 0.5,
          time: "End",
          textSnippet: sentences[sentences.length - 1]?.trim()
        }
      ];
    }
    
    // Use paragraphs for longer entries
    return [
      {
        page: 1,
        score: bertAnalysis?.sentiment?.score ? Math.max(0.1, Math.min(0.9, bertAnalysis.sentiment.score - 0.05)) : 0.5,
        time: "Beginning",
        textSnippet: paragraphs[0]?.substring(0, 50) + "..."
      },
      {
        page: Math.floor(paragraphs.length / 2),
        score: bertAnalysis?.sentiment?.score || 0.5,
        time: "Middle",
        textSnippet: paragraphs[Math.floor(paragraphs.length / 2)]?.substring(0, 50) + "..."
      },
      {
        page: paragraphs.length,
        score: bertAnalysis?.sentiment?.score ? Math.max(0.1, Math.min(0.9, bertAnalysis.sentiment.score + 0.05)) : 0.5,
        time: "End",
        textSnippet: paragraphs[paragraphs.length - 1]?.substring(0, 50) + "..."
      }
    ];
  };

  return (
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
                  {sentimentLabel}
                </p>
                <p className="text-gray-700">
                  Score: {Math.round(sentimentScore * 100)}%
                </p>
                <div className="mt-4">
                  <Slider
                    value={[sentimentScore * 100]}
                    max={100}
                    step={1}
                    disabled={true}
                    className="cursor-default"
                  />
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

        {/* 4. Timeline */}
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
            {/* Use our enhanced JournalSentimentChart if we have timeline data */}
            {timelineData && timelineData.length > 0 ? (
              <div className="h-[300px]">
                <JournalSentimentChart 
                  timelineData={timelineData.map(item => ({
                    date: item.time || `Point ${item.page || item.index || 1}`,
                    sentiment: item.sentiment || item.score || 0.5,
                    textSnippet: item.event || item.textSnippet || ''
                  }))}
                />
              </div>
            ) : (
              <div className="h-[250px]">
                <SentimentTimeline 
                  data={extractTimelinePoints()}
                  sourceDescription="Emotional flow through journal entry"
                />
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-3 text-center">
              Hover over points to see text excerpts and sentiment scores
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* 5. Theme Categories */}
        <Collapsible open={isKeywordsOpen} onOpenChange={setIsKeywordsOpen} className="mb-4 border rounded-lg overflow-hidden">
          <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
            <h3 className="text-lg font-medium font-pacifico">Theme Categories</h3>
            {isKeywordsOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 bg-white">
            {themeCategories.length > 0 ? (
              <div className="space-y-4">
                {themeCategories.map((theme, index) => (
                  <div key={index} className="border rounded-lg p-3" style={{ borderColor: theme.color }}>
                    <h4 className="font-medium mb-2 flex items-center">
                      <span 
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: theme.color }}
                      ></span>
                      {theme.name}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {theme.words.map((word, i) => (
                        <span 
                          key={i} 
                          className="px-2 py-1 rounded-full text-xs"
                          style={{ 
                            backgroundColor: `${theme.color}22`,
                            color: theme.color,
                            border: `1px solid ${theme.color}`
                          }}
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                {isAnalyzing ? (
                  <p>Analyzing themes...</p>
                ) : (
                  <p>No theme categories extracted</p>
                )}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Full Text Section */}
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-3 font-pacifico">Full Text</h3>
          <div className="p-4 bg-gray-50 rounded-lg border">
            <pre className="whitespace-pre-wrap text-sm font-georgia">{selectedEntry.text}</pre>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default EntryAnalysisView;
