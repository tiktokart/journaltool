
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ChevronUp, ChevronDown, BookOpen, FileText, Activity } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../ui/collapsible";
import { ScrollArea } from "../ui/scroll-area";
import { WellbeingResources } from "@/components/WellbeingResources";
import { Point } from "@/types/embedding";

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
  const [embeddingPoints, setEmbeddingPoints] = useState<Point[]>([]);
  
  // Generate embedding points from BERT analysis for WellbeingResources
  useEffect(() => {
    if (selectedEntry && bertAnalysis?.keywords) {
      // Filter to only use keywords from this specific entry
      const entryKeywords = bertAnalysis.keywords.filter((keyword: any) => keyword.text || keyword.word);
      
      const points: Point[] = entryKeywords.map((keyword: any, index: number) => ({
        id: `entry-keyword-${index}`,
        word: keyword.word || keyword.text || "",
        emotionalTone: keyword.tone || "Neutral",
        sentiment: keyword.sentiment || 0.5,
        color: keyword.color || "#9b87f5"
      }));
      setEmbeddingPoints(points);
    }
  }, [bertAnalysis, selectedEntry]);

  // Extract nouns/objects (subjects) and verbs/actions (emotions) from BERT analysis
  const extractSubjectsAndActions = () => {
    if (!bertAnalysis?.keywords) return { subjects: [], actions: [] };
    
    const subjects: any[] = [];
    const actions: any[] = [];
    
    bertAnalysis.keywords.forEach((keyword: any) => {
      // Check if keyword has POS (part of speech) information
      if (keyword.pos) {
        // Nouns, proper nouns, and noun phrases are subjects
        if (keyword.pos.includes('NOUN') || keyword.pos.includes('PROPN') || keyword.pos.includes('NN')) {
          subjects.push(keyword);
        }
        // Verbs and action words are actions
        else if (keyword.pos.includes('VERB') || keyword.pos.includes('VB')) {
          actions.push(keyword);
        }
      } else {
        // If no POS data, use tone to categorize
        if (keyword.tone && keyword.tone.toLowerCase().includes('action')) {
          actions.push(keyword);
        } else {
          subjects.push(keyword);
        }
      }
    });
    
    return { subjects, actions };
  };
  
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="text-lg font-medium mb-3">Content Overview</h3>
                <div>
                  <p className="mb-4">Document Statistics</p>
                  <p className="text-gray-700 mb-1">
                    This document contains {documentStats.wordCount || 0} words, 
                    {documentStats.sentenceCount || 0} sentences, and 
                    approximately {documentStats.paragraphCount || 0} paragraphs.
                  </p>
                </div>
                
                <div className="mt-6">
                  <p className="mb-4">Document Structure</p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold">{documentStats.wordCount || 0}</p>
                      <p className="text-sm text-gray-600">Words</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-purple-600">{documentStats.sentenceCount || 0}</p>
                      <p className="text-sm text-gray-600">Sentences</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-blue-600">
                        {documentStats.paragraphCount || 0}
                      </p>
                      <p className="text-sm text-gray-600">Paragraphs</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="text-lg font-medium mb-3">Content Analysis</h3>
                
                {/* Main Subjects - Nouns, Objects, Concepts */}
                <div className="mb-5">
                  <h4 className="text-md font-medium mb-2">Main Subjects</h4>
                  <div className="flex flex-wrap gap-2">
                    {subjects && subjects.length > 0 ? subjects.slice(0, 7).map((subject: any, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm"
                      >
                        {subject.word || subject.text}
                      </span>
                    )) : (
                      <p className="text-gray-500">No main subjects detected</p>
                    )}
                  </div>
                </div>
                
                {/* Emotional Analysis - Actions, Verbs */}
                <div>
                  <h4 className="text-md font-medium mb-2">Emotional Analysis</h4>
                  <div className="flex flex-wrap gap-2">
                    {actions && actions.length > 0 ? actions.slice(0, 5).map((action: any, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-sm text-white"
                        style={{ 
                          backgroundColor: action.color || 
                            (action.sentiment && action.sentiment > 0.5 ? '#68D391' : '#FC8181')
                        }}
                      >
                        {action.word || action.text}
                      </span>
                    )) : (
                      <p className="text-gray-500">No emotional keywords detected</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      {/* Suggestions Section using WellbeingResources specific to this entry */}
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
            Based on this specific journal entry, here are some suggestions that might be helpful:
          </p>
          
          {embeddingPoints && embeddingPoints.length > 0 ? (
            <WellbeingResources
              embeddingPoints={embeddingPoints}
              sourceDescription="Based on your journal entry"
            />
          ) : (
            <div className="flex flex-col space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium mb-1">Consider adding more details</h4>
                <p className="text-sm">Your entry could benefit from more specific examples or situations.</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium mb-1">Reflect on your emotions</h4>
                <p className="text-sm">Try exploring why you felt the way you did during these events.</p>
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default JournalEntryView;
