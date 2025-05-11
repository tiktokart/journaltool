
import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays, getDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JournalEntry {
  id: string;
  text: string;
  date: string;
}

interface MonthlyCalendarProps {
  onSelectDate: (date: Date) => void;
  journalEntries: JournalEntry[];
}

const MonthlyCalendar = ({ onSelectDate, journalEntries }: MonthlyCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Format journal entry dates for easy comparison
  const formattedEntryDates = journalEntries.map(entry => {
    const entryDate = new Date(entry.date);
    return format(entryDate, 'yyyy-MM-dd');
  });
  
  // Statistics for the month
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalWords: 0,
    averageSentiment: 0,
  });
  
  // Calculate month statistics whenever month or entries change
  useEffect(() => {
    const entriesThisMonth = journalEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return isSameMonth(entryDate, currentMonth);
    });
    
    const wordCount = entriesThisMonth.reduce((count, entry) => {
      return count + entry.text.split(/\s+/).filter(Boolean).length;
    }, 0);
    
    setStats({
      totalEntries: entriesThisMonth.length,
      totalWords: wordCount,
      averageSentiment: 0.35, // Placeholder - would be calculated from actual sentiment data
    });
  }, [currentMonth, journalEntries]);
  
  const previousMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };
  
  const nextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };
  
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onSelectDate(date);
  };
  
  // Get days in the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate day to start the calendar (to show previous month days)
  const startWeekday = getDay(monthStart); // 0 = Sunday, 1 = Monday, etc.
  
  // Get days from previous month to fill the start of the calendar
  const prevMonthDays = [];
  for (let i = startWeekday - 1; i >= 0; i--) {
    prevMonthDays.push(addDays(monthStart, -i - 1));
  }
  
  // Get days for next month to fill the end of the calendar
  const nextMonthDays = [];
  const endWeekday = getDay(monthEnd);
  for (let i = 1; i < 7 - endWeekday; i++) {
    nextMonthDays.push(addDays(monthEnd, i));
  }
  
  const today = new Date();
  
  return (
    <div className="flex flex-col bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 bg-green-50 border-b border-green-100">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-black">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={previousMonth} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-7 mb-1 text-center text-sm font-medium text-gray-500">
          <div>S</div>
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {/* Previous month days */}
          {prevMonthDays.map(day => (
            <div 
              key={`prev-${day.toISOString()}`}
              className="calendar-day text-gray-400"
              onClick={() => handleDateClick(day)}
            >
              {format(day, 'd')}
            </div>
          ))}
          
          {/* Current month days */}
          {daysInMonth.map(day => {
            const dateString = format(day, 'yyyy-MM-dd');
            const hasEntry = formattedEntryDates.includes(dateString);
            const isToday = isSameDay(day, today);
            
            return (
              <div 
                key={dateString}
                className={`calendar-day ${hasEntry ? 'has-entry' : ''} ${isToday ? 'today' : ''} ${isSameDay(day, selectedDate) ? 'bg-green-200' : ''}`}
                onClick={() => handleDateClick(day)}
              >
                {format(day, 'd')}
              </div>
            );
          })}
          
          {/* Next month days */}
          {nextMonthDays.map(day => (
            <div 
              key={`next-${day.toISOString()}`}
              className="calendar-day text-gray-400"
              onClick={() => handleDateClick(day)}
            >
              {format(day, 'd')}
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-500">Entries</div>
            <div className="text-xl font-semibold text-black">{stats.totalEntries}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Words</div>
            <div className="text-xl font-semibold text-black">{stats.totalWords}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Sentiment</div>
            <div className="text-xl font-semibold" style={{ color: getSentimentColor(stats.averageSentiment) }}>
              {getSentimentLabel(stats.averageSentiment)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions for sentiment
const getSentimentColor = (sentiment: number) => {
  if (sentiment > 0.5) return '#27AE60'; // Positive
  if (sentiment < 0) return '#E74C3C'; // Negative
  return '#3498DB'; // Neutral
};

const getSentimentLabel = (sentiment: number) => {
  if (sentiment > 0.5) return 'Positive';
  if (sentiment < 0) return 'Negative';
  return 'Neutral';
};

export default MonthlyCalendar;
