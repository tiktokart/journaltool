
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Search, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

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
  }, [entries, searchQuery, selectedDate]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDate(undefined);
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
      
      {/* Entries List */}
      <div className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-3">
          {filteredEntries.length > 0 ? (
            filteredEntries.map(entry => (
              <EntryCard 
                key={entry.id} 
                entry={entry}
                onClick={() => onSelectEntry && onSelectEntry(entry)}
              />
            ))
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600">No entries found that match your criteria</p>
            </div>
          )}
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
