
import { Point } from "@/types/embedding";
import MentalHealthSuggestions from "../suggestions/MentalHealthSuggestions";
import { WellbeingResources } from "../WellbeingResources";

interface AnalysisDisplayProps {
  analyzedEntry: string | null;
  bertAnalysis: any;
  embeddingPoints: Point[];
  isAnalyzing: boolean;
}

export const AnalysisDisplay = ({ 
  analyzedEntry, 
  bertAnalysis, 
  embeddingPoints,
  isAnalyzing 
}: AnalysisDisplayProps) => {
  if (!analyzedEntry) {
    return null;
  }

  return (
    <div className="space-y-6">
      <MentalHealthSuggestions 
        journalEntries={[{ text: analyzedEntry }]} 
        bertAnalysis={bertAnalysis}
      />
      
      <WellbeingResources
        embeddingPoints={embeddingPoints}
        sourceDescription="Based on your journal entry"
      />
    </div>
  );
};
