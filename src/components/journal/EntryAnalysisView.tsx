
import React, { useEffect, useState } from 'react';
import { ScrollArea } from "../ui/scroll-area";
import { generateTimeline } from "@/utils/timelineGeneration";

// Import our new section components
import OverviewSection from './analysis-sections/OverviewSection';
import DocumentTextAnalysisSection from './analysis-sections/DocumentTextAnalysisSection';
import LatentEmotionalAnalysisSection from './analysis-sections/LatentEmotionalAnalysisSection';
import TimelineSection from './analysis-sections/TimelineSection';
import ThemeCategoriesSection from './analysis-sections/ThemeCategoriesSection';
import FullTextSection from './analysis-sections/FullTextSection';

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
  const [sentimentDistribution, setSentimentDistribution] = useState({
    positive: 33,
    neutral: 34,
    negative: 33
  });
  
  // Process BERT analysis data when available
  useEffect(() => {
    if (bertAnalysis) {
      // Process sentiment score
      if (bertAnalysis.sentiment) {
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
      
      // Process distribution data
      if (bertAnalysis.distribution) {
        setSentimentDistribution(bertAnalysis.distribution);
      } else if (bertAnalysis.keywords && bertAnalysis.keywords.length > 0) {
        // Calculate distribution from keywords if direct distribution is not available
        let positive = 0;
        let negative = 0;
        let neutral = 0;
        
        bertAnalysis.keywords.forEach((keyword: any) => {
          const sentiment = keyword.sentiment || 0.5;
          if (sentiment > 0.6) positive++;
          else if (sentiment < 0.4) negative++;
          else neutral++;
        });
        
        const total = positive + negative + neutral || 1;
        setSentimentDistribution({
          positive: Math.round((positive / total) * 100),
          neutral: Math.round((neutral / total) * 100),
          negative: Math.round((negative / total) * 100)
        });
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
        <OverviewSection 
          isOpen={isOverviewOpen}
          setIsOpen={setIsOverviewOpen}
          sentimentLabel={sentimentLabel}
          sentimentScore={sentimentScore}
          sentimentDistribution={sentimentDistribution}
          documentStats={documentStats}
        />

        {/* 2. Document Text Analysis */}
        <DocumentTextAnalysisSection
          isOpen={isDocTextAnalysisOpen}
          setIsOpen={setIsDocTextAnalysisOpen}
          documentStats={documentStats}
          entryText={selectedEntry.text}
        />

        {/* 3. Latent Emotional Analysis */}
        <LatentEmotionalAnalysisSection
          isOpen={isLatentEmotionalOpen}
          setIsOpen={setIsLatentEmotionalOpen}
          bertAnalysis={bertAnalysis}
          entryText={selectedEntry.text}
          isAnalyzing={isAnalyzing}
        />

        {/* 4. Timeline */}
        <TimelineSection
          isOpen={isTimelineOpen}
          setIsOpen={setIsTimelineOpen}
          timelineData={timelineData}
          selectedEntry={selectedEntry}
          bertAnalysis={bertAnalysis}
          extractTimelinePoints={extractTimelinePoints}
        />

        {/* 5. Theme Categories */}
        <ThemeCategoriesSection
          isOpen={isKeywordsOpen}
          setIsOpen={setIsKeywordsOpen}
          themeCategories={themeCategories}
          isAnalyzing={isAnalyzing}
        />

        {/* Full Text Section */}
        <FullTextSection entryText={selectedEntry.text} />
      </div>
    </ScrollArea>
  );
};

export default EntryAnalysisView;
