
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, BarChart2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Collapsible, 
  CollapsibleTrigger, 
  CollapsibleContent 
} from "@/components/ui/collapsible";
import JournalSentimentChart from "./JournalSentimentChart";
import JournalSentimentSummary from "./JournalSentimentSummary";
import { CircleDecoration, BubbleDecoration } from "../VectorDecorations";

interface JournalAnalysisSectionProps {
  journalEntries: any[];
  timelineData: any[];
  overallSentimentChange: string;
  averageSentiment: number;
  getSentimentColor: (sentiment: number) => string;
  refreshTrigger?: number;
}

const JournalAnalysisSection = ({
  journalEntries,
  timelineData,
  overallSentimentChange,
  averageSentiment,
  getSentimentColor,
  refreshTrigger = 0
}: JournalAnalysisSectionProps) => {
  const { t } = useLanguage();
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  return (
    <div className="mt-6 relative">
      {/* Decorative elements */}
      <CircleDecoration className="w-20 h-20 top-0 right-0 opacity-20" />
      <BubbleDecoration className="bottom-0 left-0" />
      
      <Collapsible
        open={isAnalysisOpen}
        onOpenChange={setIsAnalysisOpen}
        className="border border-border rounded-xl overflow-hidden relative"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="flex w-full items-center justify-between p-4 rounded-t-xl"
          >
            <div className="flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-lime" />
              <span className="font-semibold">Journal Analysis Summary</span>
            </div>
            <ChevronRight className={`h-5 w-5 transition-transform ${isAnalysisOpen ? 'rotate-90' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4 bg-muted/20 rounded-b-xl">
          {journalEntries.length < 2 ? (
            <div className="text-center py-4 text-black">
              <p>Need at least two journal entries to analyze trends.</p>
            </div>
          ) : (
            <>
              <JournalSentimentSummary 
                overallSentimentChange={overallSentimentChange} 
                averageSentiment={averageSentiment} 
                journalEntryCount={journalEntries.length}
                getSentimentColor={getSentimentColor}
              />

              <div className="h-[200px] w-full">
                <JournalSentimentChart
                  timelineData={timelineData}
                />
              </div>
            </>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default JournalAnalysisSection;
