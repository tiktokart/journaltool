
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Calendar } from './ui/calendar';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ChevronDown, ChevronUp, Search, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface Entry {
  id: string;
  text: string;
  date: string;
  [key: string]: any; // Allow for additional properties
}

interface EntriesViewProps {
  entries: Entry[];
  onSelectEntry?: (entry: Entry) => void;
}

const EntriesView: React.FC<EntriesViewProps> = ({ entries, onSelectEntry }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [weeklyEntries, setWeeklyEntries] = useState<{[key: string]: Entry[]}>({});
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));

  useEffect(() => {
    // Filter entries based on search query and selected date
    let filtered = [...entries];
    
    // Apply search filter if query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.text.toLowerCase().includes(query)
      );
    }
    
    // Apply date filter if date selected
    if (selectedDate) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        return format(entryDate, 'yyyy-MM-dd') === dateString;
      });
    }
    
    // Sort entries by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredEntries(filtered);

    // Organize entries by day of the week
    const weekStart = startOfWeek(currentWeekStart);
    const weekEnd = endOfWeek(currentWeekStart);
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    const entriesByDay: {[key: string]: Entry[]} = {};
    daysOfWeek.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      entriesByDay[dateStr] = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return format(entryDate, 'yyyy-MM-dd') === dateStr;
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
    
    setWeeklyEntries(entriesByDay);
  }, [entries, searchQuery, selectedDate, currentWeekStart]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDate(undefined);
  };

  const handleEntryClick = (entry: Entry) => {
    setSelectedEntry(entry);
    if (onSelectEntry) {
      onSelectEntry(entry);
    }
  };

  const handlePreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const handleNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Filter Controls */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`min-w-[150px] justify-start text-left ${selectedDate ? 'text-black' : 'text-gray-500'}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setIsCalendarOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          
          {(searchQuery || selectedDate) && (
            <Button variant="ghost" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-0">
        {/* Weekly View - Left Side */}
        <div className="md:col-span-1 border-r">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
              Previous
            </Button>
            <h3 className="font-medium">
              {format(currentWeekStart, 'MMM d')} - {format(endOfWeek(currentWeekStart), 'MMM d, yyyy')}
            </h3>
            <Button variant="outline" size="sm" onClick={handleNextWeek}>
              Next
            </Button>
          </div>
          <div className="overflow-y-auto h-[calc(100%-60px)]">
            {Object.keys(weeklyEntries).map(dateStr => {
              const day = new Date(dateStr);
              const entries = weeklyEntries[dateStr];
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
                          onClick={() => handleEntryClick(entry)}
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
        
        {/* Entry and Analysis - Right Side */}
        <div className="md:col-span-2">
          <Tabs defaultValue="entry" className="h-full flex flex-col">
            <div className="border-b">
              <TabsList className="p-3">
                <TabsTrigger value="entry">Journal Entry</TabsTrigger>
                <TabsTrigger value="analysis">Entry Analysis</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="entry" className="flex-grow overflow-y-auto p-4">
              {selectedEntry ? (
                <div>
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-1">
                      {format(new Date(selectedEntry.date), 'MMMM d, yyyy - h:mm a')}
                    </h2>
                    <div className="w-16 h-1 bg-purple-400"></div>
                  </div>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{selectedEntry.text}</p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center p-4">
                  <div>
                    <p className="text-gray-500 mb-3">Select an entry from the list to view it</p>
                    {filteredEntries.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => handleEntryClick(filteredEntries[0])}
                      >
                        View Latest Entry
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="analysis" className="flex-grow overflow-y-auto p-4">
              {selectedEntry ? (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Entry Analysis</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium">Sentiment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500" 
                            style={{ width: `${Math.random() * 100}%` }}
                          ></div>
                        </div>
                        <p className="mt-2 text-sm">
                          This entry has a {Math.random() > 0.5 ? 'positive' : 'negative'} sentiment overall.
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium">Key Topics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span 
                              key={i}
                              className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                            >
                              Topic {i + 1}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">Select an entry to see its analysis</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

const EntryCard: React.FC<{
  entry: Entry;
  onClick?: () => void;
}> = ({ entry, onClick }) => {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  const formattedDate = format(new Date(entry.date), 'MMM d, yyyy - h:mm a');
  const previewText = entry.text.length > 120 && !expanded 
    ? `${entry.text.substring(0, 120)}...` 
    : entry.text;
  
  return (
    <Card 
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex justify-between items-center">
          <span className="text-gray-700">{formattedDate}</span>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0"
            onClick={toggleExpanded}
          >
            {expanded ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <p className="text-sm">
          {previewText}
        </p>
      </CardContent>
    </Card>
  );
};

export default EntriesView;
