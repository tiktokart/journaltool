
import React from 'react';
import { Button } from "../ui/button";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Calendar } from "lucide-react";

interface Entry {
  id: string;
  text: string;
  date: string;
  [key: string]: any;
}

interface WeeklyEntriesListProps {
  weeklyEntries: { [key: string]: Entry[] };
  currentWeekStart: Date;
  selectedEntry: Entry | null;
  onEntryClick: (entry: Entry) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

const WeeklyEntriesList: React.FC<WeeklyEntriesListProps> = ({
  weeklyEntries,
  currentWeekStart,
  selectedEntry,
  onEntryClick,
  onPreviousWeek,
  onNextWeek
}) => {
  // Generate days of the week to ensure we always display all days
  const daysOfWeek = eachDayOfInterval({
    start: startOfWeek(currentWeekStart),
    end: endOfWeek(currentWeekStart)
  });
  
  // Format date string for lookup
  const formatDateForLookup = (date: Date) => format(date, 'yyyy-MM-dd');
  
  return (
    <div className="md:col-span-1 border-r">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <Button variant="outline" size="sm" onClick={onPreviousWeek}>
          Previous
        </Button>
        <h3 className="font-medium flex items-center">
          <Calendar className="h-4 w-4 mr-1 text-purple-500" />
          {format(currentWeekStart, 'MMM d')} - {format(endOfWeek(currentWeekStart), 'MMM d, yyyy')}
        </h3>
        <Button variant="outline" size="sm" onClick={onNextWeek}>
          Next
        </Button>
      </div>
      <div className="overflow-y-auto h-[calc(100%-60px)]">
        {daysOfWeek.map(day => {
          const dateStr = formatDateForLookup(day);
          const entries = weeklyEntries[dateStr] || [];
          
          return (
            <div key={dateStr} className="border-b">
              <div className="p-3 bg-gray-50 font-medium">
                {format(day, 'EEEE, MMM d')}
                {entries.length > 0 && (
                  <span className="ml-2 text-sm bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                    {entries.length}
                  </span>
                )}
              </div>
              {entries.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No entries
                </div>
              ) : (
                <div>
                  {entries.map(entry => (
                    <div 
                      key={entry.id}
                      className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${selectedEntry?.id === entry.id ? 'bg-purple-50' : ''}`}
                      onClick={() => onEntryClick(entry)}
                    >
                      <div className="text-xs text-gray-500">
                        {format(new Date(entry.date), 'h:mm a')}
                      </div>
                      <div className="mt-1">
                        <p className="text-sm line-clamp-2">{entry.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyEntriesList;
