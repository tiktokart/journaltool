
import React from 'react';
import { ChevronUp, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../../ui/collapsible";
import { SentimentTimeline } from "../../SentimentTimeline";
import JournalSentimentChart from "../../reflections/JournalSentimentChart";
import { TimelineEntry } from "../../../types/bertAnalysis";

interface TimelineSectionProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  timelineData: any[];
  selectedEntry: { id: string; text: string; date: string } | null;
  bertAnalysis: any;
}

const TimelineSection: React.FC<TimelineSectionProps> = ({
  isOpen,
  setIsOpen,
  timelineData,
  selectedEntry,
  bertAnalysis
}) => {
  // Function to extract timeline points from the entry text
  const extractTimelinePoints = (): TimelineEntry[] => {
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
      textSnippet: s.text,
      index: i,
      page: i + 1
    }));
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4 border rounded-lg overflow-hidden">
      <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
        <h3 className="text-lg font-medium font-pacifico">Timeline</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 bg-white">
        {/* Use our enhanced JournalSentimentChart if we have timeline data */}
        {timelineData && timelineData.length > 0 ? (
          <div className="h-[300px]">
            <JournalSentimentChart 
              timelineData={timelineData.map(item => ({
                date: item.time || `Point ${item.page || item.index || 1}`,
                sentiment: item.sentiment || item.score || 0.5,
                textSnippet: item.event || item.textSnippet || ''
              }))}
            />
          </div>
        ) : (
          <div className="h-[250px]">
            <SentimentTimeline 
              data={extractTimelinePoints()}
              sourceDescription="Emotional flow through journal entry"
            />
          </div>
        )}
        <div className="text-xs text-muted-foreground mt-3 text-center">
          Hover over points to see text excerpts and sentiment scores
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default TimelineSection;
