
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
import { SentimentTimeline } from "@/components/SentimentTimeline";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SentimentDistribution } from "@/components/SentimentDistribution";
import { WellbeingResources } from "@/components/WellbeingResources";
import { Point } from "@/types/embedding";

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
  const [formattedTimelineData, setFormattedTimelineData] = useState<any[]>([]);
  const [processedTimelineData, setProcessedTimelineData] = useState<any[]>([]);
  const [embeddingPoints, setEmbeddingPoints] = useState<Point[]>([]);
  const [keyPhrases, setKeyPhrases] = useState<any[]>([]);
  const [wordCounts, setWordCounts] = useState({
    positive: 0,
    neutral: 0,
    negative: 0,
    total: 0
  });

  // Transform timeline data for SentimentTimeline and JournalSentimentChart components
  useEffect(() => {
    if (timelineData && timelineData.length > 0) {
      // Format for SentimentTimeline
      const formattedForTimeline = timelineData.map((item, index) => ({
        page: index + 1,
        score: item.sentiment,
        time: item.date,
        event: item.date,
        textSnippet: journalEntries[index]?.text?.substring(0, 40) || item.date
      }));
      setFormattedTimelineData(formattedForTimeline);
      
      // Add text snippets to timeline data for JournalSentimentChart
      const processedForChart = timelineData.map((item, index) => {
        // Extract text snippet if possible
        let textSnippet = "";
        if (journalEntries[index]?.text) {
          const text = journalEntries[index].text;
          textSnippet = text.substring(0, Math.min(50, text.length));
        }
        return {
          ...item,
          textSnippet
        };
      });
      setProcessedTimelineData(processedForChart);
    }
  }, [timelineData, journalEntries]);

  // Run BERT analysis on journal entries and extract embedding points
  useEffect(() => {
    const runAnalysis = async () => {
      if (!journalEntries.length) return;
      
      setIsAnalyzing(true);
      try {
        const combinedText = journalEntries.map(entry => entry.text).join(" ");
        
        // Count words for sentiment distribution
        const words = combinedText.split(/\s+/).filter(word => word.trim().length > 0);
        setWordCounts(prevCounts => ({...prevCounts, total: words.length}));
        
        // Get BERT analysis
        const analysis = await analyzeTextWithBert(combinedText);
        
        // Clean up any Theme suffix from emotion labels
        if (analysis && analysis.keywords) {
          analysis.keywords = analysis.keywords.map((kw: any) => ({
            ...kw,
            tone: kw.tone?.replace(/\s*Theme\s*$/i, '') || kw.tone,
            word: kw.text || kw.word,
            phrase: kw.text || kw.word,
            score: kw.sentiment || 0.5,
            count: 1
          }));
        }
        
        // Create embedding points based on keywords for wellbeing resources
        if (analysis && analysis.keywords) {
          const points: Point[] = analysis.keywords.map((keyword: any, index: number) => ({
            id: `journal-keyword-${index}`,
            word: keyword.text || keyword.word || "",
            emotionalTone: keyword.tone || "Neutral",
            sentiment: keyword.sentiment || 0.5,
            color: keyword.color
          }));
          setEmbeddingPoints(points);
          
          // Set key phrases data
          const keyphrases = analysis.keywords.map((keyword: any) => ({
            phrase: keyword.text || keyword.word || "",
            score: keyword.sentiment || 0.5,
            count: 1
          }));
          setKeyPhrases(keyphrases);
        }
        
        // Count positive/negative/neutral words
        const positiveWords = analysis?.keywords?.filter((k: any) => k.sentiment > 0.6) || [];
        const negativeWords = analysis?.keywords?.filter((k: any) => k.sentiment < 0.4) || [];
        const neutralWords = analysis?.keywords?.filter((k: any) => k.sentiment >= 0.4 && k.sentiment <= 0.6) || [];
        
        setWordCounts({
          positive: positiveWords.length,
          neutral: neutralWords.length,
          negative: negativeWords.length,
          total: words.length
        });
        
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
  const totalWordCount = combinedJournalText ? combinedJournalText.split(/\s+/).filter(word => word.trim().length > 0).length : 0;

  // Calculate percentages for distribution
  const getDistributionPercentages = () => {
    if (!bertAnalysis) {
      // Calculate based on average sentiment when BERT analysis is not available
      return {
        positive: Math.round(averageSentiment * 100),
        neutral: Math.round((1 - Math.abs(averageSentiment - 0.5) * 2) * 50),
        negative: Math.round((1 - averageSentiment) * 100)
      };
    }
    
    const totalKeywords = wordCounts.positive + wordCounts.neutral + wordCounts.negative;
    
    if (totalKeywords === 0) {
      return { positive: 33, neutral: 34, negative: 33 };
    }
    
    return {
      positive: Math.round((wordCounts.positive / totalKeywords) * 100),
      neutral: Math.round((wordCounts.neutral / totalKeywords) * 100),
      negative: Math.round((wordCounts.negative / totalKeywords) * 100)
    };
  };

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
        <CollapsibleContent>
          {/* Wrap all content in ScrollArea for better scrolling */}
          <ScrollArea className="max-h-[80vh] overflow-y-auto p-4">
            {journalEntries.length < 2 ? (
              <div className="text-center py-4 text-black">
                <p>Need at least two journal entries to analyze trends.</p>
              </div>
            ) : (
              <>
                {/* Add scroll helpers for accordion sections */}
                <ScrollToSection isOpen={activeAccordion === 'text-analysis'} elementId="text-analysis-section" />
                <ScrollToSection isOpen={activeAccordion === 'timeline'} elementId="timeline" />
                <ScrollToSection isOpen={activeAccordion === 'keywords'} elementId="keywords" />
                
                <JournalSentimentSummary 
                  overallSentimentChange={overallSentimentChange} 
                  averageSentiment={averageSentiment} 
                  journalEntryCount={journalEntries.length}
                  getSentimentColor={getSentimentColor}
                />

                {/* Document Text Visualization */}
                <div className="my-6" id="text-analysis-section">
                  <TextEmotionViewer 
                    pdfText={combinedJournalText}
                    sourceDescription="Text Analysis"
                    bertAnalysis={bertAnalysis}
                  />
                </div>

                {/* Add Sentiment Distribution */}
                <div className="my-6">
                  <SentimentDistribution
                    distribution={getDistributionPercentages()}
                    totalWordCount={totalWordCount}
                  />
                </div>
                
                {/* Timeline Visualization with actual text snippets */}
                <div className="my-6" id="timeline">
                  <SentimentTimeline
                    data={formattedTimelineData}
                    sourceDescription="Emotional flow over time"
                  />
                </div>
                
                {/* Add Keywords section using KeyPhrases component */}
                <div className="mt-6" id="keywords">
                  <KeyPhrases 
                    data={keyPhrases.length > 0 ? keyPhrases : (bertAnalysis?.keywords || [])} 
                  />
                </div>
                
                {/* Wellbeing Resources Section */}
                <div className="my-6">
                  <WellbeingResources
                    embeddingPoints={embeddingPoints}
                    sourceDescription="Based on your journal entries"
                  />
                </div>
                
                {/* Mental Health Suggestions - Single instance only to avoid redundancy */}
                <MentalHealthSuggestions 
                  journalEntries={journalEntries} 
                  bertAnalysis={bertAnalysis}
                />
              </>
            )}
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default JournalAnalysisSection;
