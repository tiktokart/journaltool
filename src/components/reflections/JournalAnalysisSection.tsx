
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, BarChart2 } from "lucide-react";
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
import MentalHealthSuggestions from "../suggestions/MentalHealthSuggestions";
import { analyzeTextWithBert } from "@/utils/bertIntegration";
import { TextEmotionViewer } from "@/components/TextEmotionViewer";
import { ScrollToSection } from "@/components/ScrollToSection";
import { KeyPhrases } from "@/components/KeyPhrases";

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
  const [bertAnalysis, setBertAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  // Extract keywords from journal entries
  const extractKeywords = () => {
    if (!journalEntries.length) return [];
    
    if (bertAnalysis?.keywords) {
      return bertAnalysis.keywords.map((kw: any) => kw.word);
    }
    
    const allText = journalEntries.map(entry => entry.text).join(" ");
    const words = allText.toLowerCase().split(/\s+/);
    const wordCount: Record<string, number> = {};
    
    words.forEach(word => {
      if (word.length > 4) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    return Object.entries(wordCount)
      .filter(([_, count]) => count > 1) // Only words that appear more than once
      .sort(([_a, countA], [_b, countB]) => Number(countB) - Number(countA))
      .slice(0, 20)
      .map(([word]) => word);
  };

  // Run BERT analysis on journal entries
  useEffect(() => {
    const runAnalysis = async () => {
      if (!journalEntries.length) return;
      
      setIsAnalyzing(true);
      try {
        const combinedText = journalEntries.map(entry => entry.text).join(" ");
        console.log("Running BERT analysis on journal entries...");
        const analysis = await analyzeTextWithBert(combinedText);
        console.log("Journal BERT analysis complete with", analysis.keywords?.length || 0, "keywords");
        setBertAnalysis(analysis);
      } catch (error) {
        console.error("Error running BERT analysis on journal entries:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };
    
    runAnalysis();
  }, [journalEntries, refreshTrigger]);

  const combinedJournalText = journalEntries.map(entry => entry.text).join(" ");

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
            className="flex w-full items-center justify-between p-4 bg-purple-100 hover:bg-purple-200"
          >
            <div className="flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-purple-600" />
              <span className="font-semibold">Monthly Journal Summary</span>
            </div>
            <ChevronRight className={`h-5 w-5 transition-transform ${isAnalysisOpen ? 'rotate-90' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="p-4 bg-white max-h-[80vh] overflow-y-auto">
          {journalEntries.length < 2 ? (
            <div className="text-center py-4 text-black">
              <p>Need at least two journal entries to analyze trends.</p>
            </div>
          ) : (
            <>
              {/* Add scroll helpers for accordion sections */}
              <ScrollToSection isOpen={activeAccordion === 'text-analysis'} elementId="text-analysis-section" />
              <ScrollToSection isOpen={activeAccordion === 'emotional-analysis'} elementId="emotional-analysis" />
              <ScrollToSection isOpen={activeAccordion === 'timeline'} elementId="timeline" />
              <ScrollToSection isOpen={activeAccordion === 'keywords'} elementId="keywords" />
              
              {/* Document Text Visualization - Moved to the top */}
              <div className="mb-6" id="text-analysis-section">
                <TextEmotionViewer 
                  pdfText={combinedJournalText}
                  sourceDescription="Journal Entries Text Analysis"
                  bertAnalysis={bertAnalysis}
                />
              </div>

              <JournalSentimentSummary 
                overallSentimentChange={overallSentimentChange} 
                averageSentiment={averageSentiment} 
                journalEntryCount={journalEntries.length}
                getSentimentColor={getSentimentColor}
              />

              <div className="h-[200px] w-full my-6">
                <JournalSentimentChart
                  timelineData={timelineData}
                />
              </div>
              
              {/* Add Keywords section using KeyPhrases component */}
              <div className="mt-6">
                <KeyPhrases 
                  data={bertAnalysis?.keywords || []} 
                  sourceDescription="Journal entries key themes" 
                />
              </div>
              
              {/* Emotional Analysis Accordion */}
              <Accordion 
                type="single" 
                collapsible 
                className="mt-6"
                onValueChange={(value) => {
                  setActiveAccordion(value);
                }}
              >
                <AccordionItem value="emotional-analysis" id="emotional-analysis">
                  <AccordionTrigger className="text-purple-700 hover:text-purple-800">
                    Emotional Analysis
                  </AccordionTrigger>
                  <AccordionContent className="p-2">
                    <div className="space-y-4">
                      <div className="border rounded-md p-3 bg-purple-50">
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
              </Accordion>
              
              <MentalHealthSuggestions 
                journalEntries={journalEntries} 
                bertAnalysis={bertAnalysis}
              />
            </>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default JournalAnalysisSection;
