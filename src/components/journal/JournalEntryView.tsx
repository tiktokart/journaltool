
import React from 'react';
import { format } from 'date-fns';
import { ChevronUp, ChevronDown, BookOpen, FileText, Activity, Heart, AlertTriangle, Info } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../ui/collapsible";
import { ScrollArea } from "../ui/scroll-area";
import { useEmotionalAnalysis } from '@/hooks/useEmotionalAnalysis';
import ContentOverview from './ContentOverview';
import EmotionCategories from './EmotionCategories';
import ActionPlans from './ActionPlans';

interface Entry {
  id: string;
  text: string;
  date: string;
  [key: string]: any;
}

interface JournalEntryViewProps {
  selectedEntry: Entry | null;
  documentStats: { wordCount: number; sentenceCount: number; paragraphCount: number };
  mainSubjects: string[];
  bertAnalysis: any;
  isDetailedAnalysisOpen: boolean;
  setIsDetailedAnalysisOpen: (isOpen: boolean) => void;
  isSuggestionsOpen: boolean;
  setIsSuggestionsOpen: (isOpen: boolean) => void;
}

const JournalEntryView: React.FC<JournalEntryViewProps> = ({
  selectedEntry,
  documentStats,
  mainSubjects,
  bertAnalysis,
  isDetailedAnalysisOpen,
  setIsDetailedAnalysisOpen,
  isSuggestionsOpen,
  setIsSuggestionsOpen
}) => {
  // Use the emotional analysis hook
  const {
    embeddingPoints,
    emotionTones,
    emotionCategories,
    actionPlans,
    expandedPlans,
    togglePlanExpansion,
    extractSubjectsAndActions
  } = useEmotionalAnalysis(selectedEntry, bertAnalysis);
  
  const { subjects, actions } = extractSubjectsAndActions();

  if (!selectedEntry) {
    return (
      <div className="h-full flex items-center justify-center text-center p-4">
        <div>
          <p className="text-gray-500 mb-3">Select an entry from the list to view it</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-1 font-pacifico flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-purple-500" />
          Journal Entry
        </h2>
        <p className="text-gray-600">
          {format(new Date(selectedEntry.date), 'MMMM d, yyyy - h:mm a')}
        </p>
        <div className="w-16 h-1 bg-purple-400 mt-1"></div>
      </div>
      
      <Collapsible defaultOpen={true} className="mb-4">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-purple-50 rounded-lg font-medium">
          <span className="font-pacifico flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Entry Content
          </span>
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
          <h3 className="text-lg font-medium font-pacifico flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-500" />
            Detailed Analyzed Data
          </h3>
          {isDetailedAnalysisOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4 bg-white">
          <ScrollArea className="h-[500px]">
            <ContentOverview 
              documentStats={documentStats}
              subjects={subjects}
              actions={actions}
            />
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      {/* Suggestions Section */}
      <Collapsible open={isSuggestionsOpen} onOpenChange={setIsSuggestionsOpen} className="mb-4 border rounded-lg overflow-hidden">
        <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
          <h3 className="text-lg font-medium flex items-center">
            <Heart className="h-5 w-5 mr-2 text-rose-500" />
            Suggestions
          </h3>
          {isSuggestionsOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          {/* Use ScrollArea to ensure all content is scrollable */}
          <ScrollArea className="max-h-[500px]">
            <div className="p-4 bg-white">
              <p className="text-gray-700 mb-4">
                Based on the text analysis, here are some suggestions that might help.
              </p>

              {/* Detected emotions section with new styling */}
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500 mt-0.5 flex-shrink-0" />
                <EmotionCategories 
                  emotionCategories={emotionCategories} 
                  emotionTones={emotionTones} 
                />
              </div>
              
              {/* Action Plans */}
              <ActionPlans 
                actionPlans={actionPlans}
                expandedPlans={expandedPlans}
                togglePlanExpansion={togglePlanExpansion}
              />
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default JournalEntryView;
