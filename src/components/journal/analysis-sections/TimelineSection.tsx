
import React from 'react';
import { ChevronUp, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../../ui/collapsible";
import { SentimentTimeline } from "../../SentimentTimeline";
import JournalSentimentChart from "../../reflections/JournalSentimentChart";

interface TimelineSectionProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  timelineData: any[];
  selectedEntry: { id: string; text: string; date: string } | null;
  bertAnalysis: any;
  extractTimelinePoints: () => any[];
}

const TimelineSection: React.FC<TimelineSectionProps> = ({
  isOpen,
  setIsOpen,
  timelineData,
  selectedEntry,
  bertAnalysis,
  extractTimelinePoints
}) => {
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
