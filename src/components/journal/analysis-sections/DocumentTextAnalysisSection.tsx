
import React from 'react';
import { ChevronUp, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../../ui/collapsible";

interface DocumentTextAnalysisSectionProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  documentStats: { wordCount: number; sentenceCount: number; paragraphCount: number };
  entryText: string;
}

const DocumentTextAnalysisSection: React.FC<DocumentTextAnalysisSectionProps> = ({
  isOpen,
  setIsOpen,
  documentStats,
  entryText
}) => {
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4 border rounded-lg overflow-hidden">
      <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
        <h3 className="text-lg font-medium font-pacifico">Document Text Analysis</h3>
        {isOpen ? (
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
              <p className="text-gray-700">{entryText.substring(0, 200)}...</p>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default DocumentTextAnalysisSection;
