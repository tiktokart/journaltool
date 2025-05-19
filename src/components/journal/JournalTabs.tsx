
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import JournalEntryView from './JournalEntryView';
import EntryAnalysisView from './EntryAnalysisView';

interface JournalTabsProps {
  selectedEntry: {
    id: string;
    text: string;
    date: string;
    [key: string]: any;
  } | null;
  documentStats: { wordCount: number; sentenceCount: number; paragraphCount: number };
  mainSubjects: string[];
  bertAnalysis: any;
  isAnalyzing: boolean;
  isDetailedAnalysisOpen: boolean;
  setIsDetailedAnalysisOpen: (isOpen: boolean) => void;
  isSuggestionsOpen: boolean;
  setIsSuggestionsOpen: (isOpen: boolean) => void;
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
  themeCategories: {name: string, words: string[], color: string}[];
}

const JournalTabs: React.FC<JournalTabsProps> = ({
  selectedEntry,
  documentStats,
  mainSubjects,
  bertAnalysis,
  isAnalyzing,
  isDetailedAnalysisOpen,
  setIsDetailedAnalysisOpen,
  isSuggestionsOpen,
  setIsSuggestionsOpen,
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
  themeCategories
}) => {
  return (
    <Tabs defaultValue="entry" className="h-full flex flex-col">
      <div className="border-b">
        <TabsList className="p-3 flex justify-center items-center w-full">
          <TabsTrigger value="entry">Journal Entry</TabsTrigger>
          <TabsTrigger value="analysis">Entry Analysis</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="entry" className="flex-grow overflow-hidden p-0">
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
      
      <TabsContent value="analysis" className="flex-grow overflow-auto">
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
  );
};

export default JournalTabs;
