
import React from 'react';
import { ScrollArea } from "../ui/scroll-area";
import OverviewSection from './analysis-sections/OverviewSection';
import DocumentTextAnalysisSection from './analysis-sections/DocumentTextAnalysisSection';
import LatentEmotionalAnalysisSection from './analysis-sections/LatentEmotionalAnalysisSection';
import TimelineSection from './analysis-sections/TimelineSection';
import ThemeCategoriesSection from './analysis-sections/ThemeCategoriesSection';
import FullTextSection from './analysis-sections/FullTextSection';

interface EntryAnalysisViewProps {
  selectedEntry: { id: string; text: string; date: string } | null;
  isAnalyzing: boolean;
  bertAnalysis: any;
  documentStats: { wordCount: number; sentenceCount: number; paragraphCount: number };
  themeCategories: {name: string, words: string[], color: string}[];
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
  timelineData?: any[];
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
  setIsKeywordsOpen,
  timelineData = []
}) => {
  if (!selectedEntry) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Select an entry to view analysis</p>
      </div>
    );
  }

  // Get sentiment label and score from bertAnalysis
  const sentimentLabel = bertAnalysis?.sentiment?.label || 
                        bertAnalysis?.overallSentiment?.label || 
                        (bertAnalysis?.sentiment?.score > 0.6 ? 'Positive' : 
                         bertAnalysis?.sentiment?.score < 0.4 ? 'Negative' : 'Neutral');
  
  const sentimentScore = bertAnalysis?.sentiment?.score || 
                        bertAnalysis?.overallSentiment?.score || 0.5;
  
  // Get sentiment distribution from bertAnalysis
  const sentimentDistribution = bertAnalysis?.distribution || {
    positive: Math.round(sentimentScore * 100),
    negative: Math.round((1 - sentimentScore) * 0.7 * 100),
    neutral: 100 - Math.round(sentimentScore * 100) - Math.round((1 - sentimentScore) * 0.7 * 100)
  };

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-6">Entry Analysis</h2>
        
        <OverviewSection 
          isOpen={isOverviewOpen}
          setIsOpen={setIsOverviewOpen}
          sentimentLabel={sentimentLabel}
          sentimentScore={sentimentScore}
          sentimentDistribution={sentimentDistribution}
          documentStats={documentStats}
        />

        <DocumentTextAnalysisSection 
          isOpen={isDocTextAnalysisOpen}
          setIsOpen={setIsDocTextAnalysisOpen}
          documentStats={documentStats}
          entryText={selectedEntry.text}
        />

        <LatentEmotionalAnalysisSection 
          isOpen={isLatentEmotionalOpen}
          setIsOpen={setIsLatentEmotionalOpen}
          bertAnalysis={bertAnalysis}
          entryText={selectedEntry.text}
          isAnalyzing={isAnalyzing}
        />

        <TimelineSection 
          isOpen={isTimelineOpen}
          setIsOpen={setIsTimelineOpen}
          selectedEntry={selectedEntry}
          bertAnalysis={bertAnalysis}
          timelineData={timelineData}
        />

        <ThemeCategoriesSection 
          isOpen={isKeywordsOpen}
          setIsOpen={setIsKeywordsOpen}
          themeCategories={themeCategories}
          isAnalyzing={isAnalyzing}
        />
        
        <FullTextSection entryText={selectedEntry.text} />
      </div>
    </ScrollArea>
  );
};

export default EntryAnalysisView;
