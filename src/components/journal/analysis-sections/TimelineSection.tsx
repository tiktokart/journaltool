import React, { useState, useCallback } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Timeline } from '@/components/visualization/Timeline';
import { TimelineEntry } from '../../../types/bertAnalysis';

interface TimelineSectionProps {
  selectedEntry: {
    id: string;
    text: string;
    date: string;
    [key: string]: any;
  } | null;
  bertAnalysis: any;
  timelinePoints: TimelineEntry[];
  setTimelinePoints: React.Dispatch<React.SetStateAction<TimelineEntry[]>>;
}

// Update the component to use the correct TimelineEntry type from bertAnalysis.ts
const TimelineSection: React.FC<TimelineSectionProps> = ({ 
  selectedEntry, 
  bertAnalysis,
  timelinePoints,
  setTimelinePoints
}) => {
  const [selectedTimelinePoint, setSelectedTimelinePoint] = useState<TimelineEntry | null>(null);

  const handleTimelineSelect = useCallback((point: TimelineEntry) => {
    setSelectedTimelinePoint(point);
  }, []);
  
  return (
    <Card className="shadow-md">
      <CardContent className="p-4">
        <h4 className="text-lg font-semibold mb-2">Timeline</h4>
        <ScrollArea className="h-[300px] mb-4">
          {timelinePoints.length > 0 ? (
            <Timeline
              data={timelinePoints}
              onSelect={handleTimelineSelect}
            />
          ) : (
            <p className="text-gray-500">No timeline events available.</p>
          )}
        </ScrollArea>

        {selectedTimelinePoint && (
          <div className="mt-4">
            <h5 className="text-md font-semibold">Selected Event</h5>
            <Badge variant="secondary">{selectedTimelinePoint.event}</Badge>
            <p className="text-sm mt-1">{selectedTimelinePoint.textSnippet}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimelineSection;
