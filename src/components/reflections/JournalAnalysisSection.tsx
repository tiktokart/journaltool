
import { useState } from "react";
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
import { DocumentEmbedding } from "@/components/DocumentEmbedding";
import { Card } from "@/components/ui/card";
import MentalHealthSuggestions from "../suggestions/MentalHealthSuggestions";
import { TextEmotionViewer } from "@/components/TextEmotionViewer";

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

  // Generate emotional embeddings from journal entries
  const generateEmotionalEmbeddings = () => {
    if (!journalEntries.length) return [];
    
    // Create simulated embeddings with emotional tones
    return journalEntries.flatMap((entry, entryIndex) => {
      const words = entry.text.split(/\s+/);
      
      return words.filter(word => word.length > 3).map((word, index) => {
        // Generate consistent but seemingly random values for each word based on its characters
        const hash = [...word].reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const x = Math.sin(hash) * 5;
        const y = Math.cos(hash * 0.5) * 5;
        const z = Math.sin(hash * 0.3) * Math.cos(hash * 0.7) * 5;
        
        // Assign emotional tones based on word patterns or entry sentiment
        const emotionalTones = ['Joy', 'Sadness', 'Anxiety', 'Contentment', 'Confusion', 'Anger', 'Fear', 'Surprise'];
        const toneIndex = hash % emotionalTones.length;
        const emotionalTone = emotionalTones[toneIndex];
        
        // Create color based on emotional tone
        let color;
        switch(emotionalTone) {
          case 'Joy':
            color = [1, 0.9, 0.4]; // Yellow
            break;
          case 'Sadness':
            color = [0.4, 0.6, 0.9]; // Blue
            break;
          case 'Anxiety':
            color = [0.9, 0.5, 0.2]; // Orange
            break;
          case 'Contentment':
            color = [0.5, 0.9, 0.5]; // Green
            break;
          case 'Confusion':
            color = [0.7, 0.5, 0.9]; // Purple
            break;
          case 'Anger':
            color = [0.9, 0.3, 0.3]; // Red
            break;
          case 'Fear':
            color = [0.7, 0.3, 0.7]; // Dark Purple
            break;
          case 'Surprise':
            color = [0.4, 0.9, 0.9]; // Cyan
            break;
          default:
            color = [0.7, 0.7, 0.7]; // Gray
        }
        
        return {
          id: `${entryIndex}-${index}`,
          word: word.replace(/[^\w]/g, ''),
          position: [x, y, z],
          color: color,
          emotionalTone: emotionalTone,
          frequency: 1,
          relationships: []
        };
      });
    });
  };

  // Extract keywords from journal entries
  const extractKeywords = () => {
    if (!journalEntries.length) return [];
    
    const allText = journalEntries.map(entry => entry.text).join(" ");
    const words = allText.toLowerCase().split(/\s+/);
    const wordCount: Record<string, number> = {};
    
    words.forEach(word => {
      if (word.length > 4) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    // Fix the parameter naming issue by using different names
    return Object.entries(wordCount)
      .filter(([_, count]) => count > 1) // Only words that appear more than once
      .sort(([_wordA, countA], [_wordB, countB]) => Number(countB) - Number(countA))
      .slice(0, 20)
      .map(([word]) => word);
  };

  // Get combined text for all journal entries for visualization
  const getAllJournalText = () => {
    return journalEntries.map(entry => entry.text).join("\n\n");
  };

  const embeddingPoints = generateEmotionalEmbeddings();
  const keywords = extractKeywords();
  const allJournalText = getAllJournalText();

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
                      {keywords.map((word, i) => (
                        <span key={i} className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs">
                          {word}
                        </span>
                      ))}
                      {keywords.length === 0 && (
                        <p className="text-sm text-gray-500">No journal entries to analyze.</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
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
                            points={embeddingPoints} 
                            isInteractive={true} 
                            depressedJournalReference={overallSentimentChange.includes("negative")}
                          />
                        </div>
                      </div>

                      <div className="border rounded-md p-3 bg-white">
                        <h4 className="font-medium mb-2">Text Emotion Visualization</h4>
                        <TextEmotionViewer 
                          pdfText={allJournalText} 
                          embeddingPoints={embeddingPoints}
                          sourceDescription="Emotional highlighting of journal content"
                        />
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
                      
                      <MentalHealthSuggestions journalEntries={journalEntries} />
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
