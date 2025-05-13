
import { useEffect, useState } from "react";

interface AnalysisDataProcessorProps {
  sentimentData: any;
  pdfText: string;
  children: (processedData: any, parsedScore: number, sentimentLabel: string, distribution: any) => React.ReactNode;
}

const AnalysisDataProcessor = ({ 
  sentimentData, 
  pdfText, 
  children 
}: AnalysisDataProcessorProps) => {
  const [processedData, setProcessedData] = useState<any>(null);
  const [parsedScore, setParsedScore] = useState(0.5);
  const [sentimentLabel, setSentimentLabel] = useState("Neutral");

  // Process data for visualization
  useEffect(() => {
    if (!sentimentData) return;
    
    try {
      // Validate overall sentiment
      let score = sentimentData?.overallSentiment?.score;
      if (score !== undefined && !isNaN(score)) {
        setParsedScore(Math.max(0, Math.min(1, score))); // Clamp between 0-1
      } else if (sentimentData?.bertAnalysis?.overallSentiment) {
        // Fallback to BERT analysis overall sentiment
        score = sentimentData.bertAnalysis.overallSentiment;
        setParsedScore(Math.max(0, Math.min(1, score)));
      }
      
      // Set sentiment label
      const label = sentimentData?.overallSentiment?.label || '';
      if (label) {
        setSentimentLabel(label);
      } else {
        // Generate label based on score
        if (parsedScore >= 0.7) setSentimentLabel("Very Positive");
        else if (parsedScore >= 0.55) setSentimentLabel("Positive");
        else if (parsedScore >= 0.45) setSentimentLabel("Neutral");
        else if (parsedScore >= 0.3) setSentimentLabel("Negative");
        else setSentimentLabel("Very Negative");
      }
      
      // Extract text snippets for timeline data
      const processTimeline = (timeline: any[]) => {
        if (!timeline || !Array.isArray(timeline)) return timeline;
        
        return timeline.map((item, index) => {
          // Try to extract text snippets from the document
          let textSnippet = item.event || "";
          if (pdfText) {
            const wordCount = 20;
            const position = Math.floor((index / timeline.length) * pdfText.length);
            const startPos = Math.max(0, pdfText.indexOf(' ', position - 100) + 1);
            const endPos = pdfText.indexOf('.', startPos + 10) + 1 || startPos + wordCount;
            textSnippet = pdfText.substring(startPos, endPos).trim();
          }
          
          return {
            ...item,
            textSnippet
          };
        });
      };
      
      // Process data for visualization
      setProcessedData({
        ...sentimentData,
        timeline: processTimeline(sentimentData.timeline)
      });
    } catch (error) {
      console.error("Error processing data:", error);
    }
  }, [sentimentData, pdfText, parsedScore]);

  // Ensure we have properly structured distribution data
  const ensureDistribution = () => {
    // First check BERT analysis for distribution data
    if (sentimentData.bertAnalysis) {
      // Try to use BERT-specific distribution if available
      const bertDistribution = sentimentData.bertAnalysis.distribution || {
        positive: sentimentData.bertAnalysis.positiveWordCount || 0,
        neutral: sentimentData.bertAnalysis.neutralWordCount || 0,
        negative: sentimentData.bertAnalysis.negativeWordCount || 0
      };
      
      // Calculate percentages if needed
      const sum = bertDistribution.positive + bertDistribution.neutral + bertDistribution.negative;
      if (sum > 0) {
        return {
          positive: Math.round((bertDistribution.positive / sum) * 100),
          neutral: Math.round((bertDistribution.neutral / sum) * 100),
          negative: Math.round((bertDistribution.negative / sum) * 100)
        };
      }
    }
    
    // Fallback to sentimentData distribution
    if (sentimentData.distribution) {
      return sentimentData.distribution;
    }
    
    // Generate a basic distribution based on overall sentiment
    const overallSentiment = sentimentData.overallSentiment?.score || 
                           sentimentData.overallSentiment || 0.5;
                           
    return {
      positive: Math.round(overallSentiment * 100),
      negative: Math.round((1 - overallSentiment) * 0.7 * 100),
      neutral: 100 - Math.round(overallSentiment * 100) - Math.round((1 - overallSentiment) * 0.7 * 100)
    };
  };

  const distribution = ensureDistribution();

  // Return children with processed data
  return <>{children(processedData, parsedScore, sentimentLabel, distribution)}</>;
};

export default AnalysisDataProcessor;
