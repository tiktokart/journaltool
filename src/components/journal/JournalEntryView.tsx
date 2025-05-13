
import React from 'react';
import { Button } from "../ui/button";
import { format } from 'date-fns';
import { ChevronUp, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../ui/collapsible";
import { ScrollArea } from "../ui/scroll-area";

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
  );
};

export default JournalEntryView;
