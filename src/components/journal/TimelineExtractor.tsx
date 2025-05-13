
import React from 'react';

interface TimelineExtractorProps {
  selectedEntry: {
    id: string;
    text: string;
    date: string;
    [key: string]: any;
  } | null;
  bertAnalysis: any;
  onExtract: (points: any[]) => void;
}

const TimelineExtractor: React.FC<TimelineExtractorProps> = ({ selectedEntry, bertAnalysis, onExtract }) => {
  
  const extractTimelinePoints = () => {
    if (!selectedEntry || !bertAnalysis) {
      return [];
    }
    
    // Extract sentences for timeline
    const sentences = selectedEntry.text
      .split(/(?<=[.!?])\s+/)
      .filter((s: string) => s.trim().length > 5)
      .map((s: string, i: number) => ({ 
        text: s.trim(), 
        index: i,
        sentiment: 0.5 // Default sentiment
      }));
    
    // If we have keywords with sentiments, use them to assign sentence sentiments
    if (bertAnalysis.keywords && bertAnalysis.keywords.length > 0) {
      bertAnalysis.keywords.forEach((keyword: any) => {
        if (keyword.sentiment !== undefined && keyword.word) {
          // Find sentences containing this keyword
          sentences.forEach((sentence: any) => {
            if (sentence.text.toLowerCase().includes(keyword.word.toLowerCase())) {
              // Blend the sentiments (weighted average favoring any existing value)
              sentence.sentiment = sentence.sentiment !== 0.5
                ? (sentence.sentiment * 0.7) + (keyword.sentiment * 0.3)
                : keyword.sentiment;
            }
          });
        }
      });
    }
    
    // Format for timeline visualization
    return sentences.map((s: any, i: number) => ({
      time: `${i + 1}`,
      sentiment: s.sentiment,
      score: s.sentiment,
      event: s.text.length > 70 ? s.text.substring(0, 70) + '...' : s.text,
      textSnippet: s.text
    }));
  };

  // Call the extractor function and pass the results to the parent component
  React.useEffect(() => {
    const timelinePoints = extractTimelinePoints();
    onExtract(timelinePoints);
  }, [selectedEntry, bertAnalysis]);

  return null; // This is a logic component, not a UI component
};

export default TimelineExtractor;
