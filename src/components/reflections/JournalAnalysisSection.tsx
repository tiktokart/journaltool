
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
import { DocumentEmbedding } from "@/components/DocumentEmbedding";
import { Card } from "@/components/ui/card";

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
            className="flex w-full items-center justify-between p-4 bg-purple-100 hover:bg-purple-200"
          >
            <div className="flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-purple-600" />
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
              
              {/* Emotional Analysis Accordion */}
              <Accordion type="single" collapsible className="mt-6">
                <AccordionItem value="emotional-analysis">
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
                
                <AccordionItem value="timeline">
                  <AccordionTrigger className="text-purple-700 hover:text-purple-800">
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
                  <AccordionTrigger className="text-purple-700 hover:text-purple-800">
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
                        <span key={i} className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs">
                          {word}
                        </span>
                      ))}
                      {journalEntries.length === 0 && (
                        <p className="text-sm text-gray-500">No journal entries to analyze.</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Latent Emotional Analysis Accordion */}
                <AccordionItem value="latent-emotional-analysis">
                  <AccordionTrigger className="text-purple-700 hover:text-purple-800">
                    Latent Emotional Analysis
                  </AccordionTrigger>
                  <AccordionContent className="p-2">
                    <div className="space-y-4">
                      <div className="border rounded-md p-3 bg-white">
                        <h4 className="font-medium mb-2">3D Visualization</h4>
                        <div className="h-[300px] w-full bg-gray-50 rounded-lg overflow-hidden">
                          <DocumentEmbedding 
                            points={[]} 
                            isInteractive={true} 
                            depressedJournalReference={overallSentimentChange.includes("negative")}
                          />
                        </div>
                      </div>
                      
                      <Card className="p-3">
                        <h4 className="font-medium mb-2">Emotional Insights</h4>
                        <p className="text-sm mb-2">
                          This visualization represents the latent emotional patterns in your journal entries. 
                          Similar emotions are clustered together in 3D space.
                        </p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Emotions are represented as colored points</li>
                          <li>Closer points indicate similar emotional states</li>
                          <li>Colors represent different emotional categories</li>
                        </ul>
                      </Card>
                      
                      <Card className="p-3">
                        <h4 className="font-medium mb-2">Primary Emotional Clusters</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {["Joy", "Sadness", "Anxiety", "Contentment"].map(emotion => (
                            <div key={emotion} className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-2 ${
                                emotion === "Joy" ? "bg-yellow-400" :
                                emotion === "Sadness" ? "bg-blue-400" :
                                emotion === "Anxiety" ? "bg-red-400" :
                                "bg-green-400"
                              }`}></div>
                              <span className="text-sm">{emotion}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
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
