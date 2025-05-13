
import React from 'react';
import { ChevronUp, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../../ui/collapsible";
import { TextEmotionViewer } from "../../TextEmotionViewer";

interface LatentEmotionalAnalysisSectionProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  bertAnalysis: any;
  entryText: string;
  isAnalyzing: boolean;
}

const LatentEmotionalAnalysisSection: React.FC<LatentEmotionalAnalysisSectionProps> = ({
  isOpen,
  setIsOpen,
  bertAnalysis,
  entryText,
  isAnalyzing
}) => {
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4 border rounded-lg overflow-hidden">
      <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
        <h3 className="text-lg font-medium font-pacifico">Latent Emotional Analysis</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 bg-white">
        <div className="bg-gray-50 rounded-lg p-5">
          {bertAnalysis ? (
            <TextEmotionViewer 
              pdfText={entryText}
              bertAnalysis={bertAnalysis}
            />
          ) : (
            <p className="text-center text-gray-500 py-4">
              {isAnalyzing ? "Analyzing emotions..." : "No emotional analysis available"}
            </p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default LatentEmotionalAnalysisSection;
