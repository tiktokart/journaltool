
import React, { useState, useCallback } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  timelineData?: any[];
}

const TimelineSection: React.FC<TimelineSectionProps> = ({ 
  selectedEntry, 
  bertAnalysis,
  timelinePoints,
  setTimelinePoints,
  isOpen,
  setIsOpen,
  timelineData
}) => {
  const [selectedTimelinePoint, setSelectedTimelinePoint] = useState<TimelineEntry | null>(null);

  const handleTimelineSelect = useCallback((point: TimelineEntry) => {
    setSelectedTimelinePoint(point);
  }, []);
  
  // Use timeline data if provided, otherwise use timelinePoints
  const displayData = timelineData || timelinePoints;
  
  return (
    <Card className="shadow-md">
      <CardContent className="p-4">
        <h4 className="text-lg font-semibold mb-2">Timeline</h4>
        <ScrollArea className="h-[300px] mb-4">
          {displayData.length > 0 ? (
            <div className="timeline-container">
              {/* Placeholder for timeline visualization - we'll implement a simple version */}
              <div className="timeline-events">
                {displayData.map((point, index) => (
                  <div 
                    key={index} 
                    className="timeline-event p-2 mb-2 border rounded cursor-pointer hover:bg-gray-50"
                    onClick={() => handleTimelineSelect(point)}
                  >
                    <div className="font-medium">{point.time}</div>
                    <div className="text-sm text-gray-600">{point.event}</div>
                  </div>
                ))}
              </div>
            </div>
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
