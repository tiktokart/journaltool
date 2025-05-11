
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, BarChart2, PieChart, LineChart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { 
  Collapsible, 
  CollapsibleTrigger, 
  CollapsibleContent 
} from "@/components/ui/collapsible";
import JournalSentimentChart from "./JournalSentimentChart";
import JournalSentimentSummary from "./JournalSentimentSummary";

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
    <div className="mt-6">
      <Collapsible
        open={isAnalysisOpen}
        onOpenChange={setIsAnalysisOpen}
        className="border border-border rounded-xl shadow-sm overflow-hidden"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="flex w-full items-center justify-between p-4 bg-green-50 hover:bg-green-100"
          >
            <div className="flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-green-600" />
              <span className="font-semibold">Monthly Journal Summary</span>
            </div>
            <ChevronRight className={`h-5 w-5 transition-transform ${isAnalysisOpen ? 'rotate-90' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4 bg-white">
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
              
              {/* Add Emotional Analysis Accordion below */}
              <Accordion type="single" collapsible className="mt-6">
                <AccordionItem value="emotional-analysis">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    Emotional Analysis
                  </AccordionTrigger>
                  <AccordionContent className="p-2">
                    <div className="space-y-4">
                      <div className="border rounded-md p-3 bg-green-50">
                        <h4 className="font-medium mb-2">Overview</h4>
                        <p className="text-sm">
                          Your overall emotional state this month has been {overallSentimentChange.includes("positive") ? "positive" : 
                          overallSentimentChange.includes("negative") ? "negative" : "neutral"} with {" "}
                          {timelineData.length} recorded emotional data points.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="timeline">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    Timeline
                  </AccordionTrigger>
                  <AccordionContent className="p-2">
                    <div className="h-[200px] w-full">
                      <JournalSentimentChart
                        timelineData={timelineData}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="keywords">
                  <AccordionTrigger className="text-green-700 hover:text-green-800">
                    Keywords
                  </AccordionTrigger>
                  <AccordionContent className="p-2">
                    <div className="flex flex-wrap gap-2">
                      {journalEntries.length > 0 && Array.from(new Set(
                        journalEntries
                          .flatMap(entry => entry.text.split(/\s+/))
                          .filter(word => word.length > 4)
                          .slice(0, 20)
                      )).map((word, i) => (
                        <span key={i} className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                          {word}
                        </span>
                      ))}
                      {journalEntries.length === 0 && (
                        <p className="text-sm text-gray-500">No journal entries to analyze.</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default JournalAnalysisSection;
