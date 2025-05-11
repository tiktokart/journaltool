
import { useState, useEffect } from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { Search, ChevronDown, ChevronUp, Share, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

interface JournalEntry {
  id: string;
  text: string;
  date: string;
}

interface EntriesViewProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
}

const EntriesView = ({ entries, onSelectEntry }: EntriesViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [activeTab, setActiveTab] = useState("analysis");

  // Group entries by week
  const [weeks, setWeeks] = useState<{
    weekStart: Date;
    weekEnd: Date;
    entries: JournalEntry[];
    isExpanded: boolean;
  }[]>([]);

  useEffect(() => {
    // Filter entries based on search term
    const filtered = entries.filter(entry => 
      entry.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      format(new Date(entry.date), "MMMM d, yyyy").toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEntries(filtered);

    // Group entries by week
    const entriesByWeek = groupEntriesByWeek(entries);
    setWeeks(entriesByWeek);
  }, [entries, searchTerm]);

  const groupEntriesByWeek = (journalEntries: JournalEntry[]) => {
    const weekGroups: {[key: string]: JournalEntry[]} = {};
    
    journalEntries.forEach(entry => {
      const entryDate = new Date(entry.date);
      const weekStart = startOfWeek(entryDate);
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      
      if (!weekGroups[weekKey]) {
        weekGroups[weekKey] = [];
      }
      
      weekGroups[weekKey].push(entry);
    });
    
    return Object.keys(weekGroups).map(weekKey => {
      const weekStart = new Date(weekKey);
      const weekEnd = endOfWeek(weekStart);
      return {
        weekStart,
        weekEnd,
        entries: weekGroups[weekKey].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
        isExpanded: false
      };
    }).sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());
  };

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    onSelectEntry(entry);
  };

  const toggleWeekExpand = (index: number) => {
    setWeeks(weeks => weeks.map((week, i) => 
      i === index ? { ...week, isExpanded: !week.isExpanded } : week
    ));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-green-200"
            prefix={<Search className="h-4 w-4 text-gray-400" />}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Entries Sidebar */}
        <div className="w-1/3 border-r border-gray-200 overflow-y-auto p-2">
          {weeks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No journal entries found
            </div>
          ) : (
            <div className="space-y-4">
              {weeks.map((week, index) => (
                <div key={`week-${week.weekStart}`} className="border border-gray-100 rounded-lg overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-3 bg-green-50 cursor-pointer"
                    onClick={() => toggleWeekExpand(index)}
                  >
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-green-600" />
                      <span className="text-sm font-medium">
                        {format(week.weekStart, 'MMM d')} - {format(week.weekEnd, 'MMM d, yyyy')}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      {week.isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {week.isExpanded && (
                    <div className="py-1">
                      {week.entries.map(entry => (
                        <div 
                          key={entry.id}
                          className={`p-3 cursor-pointer hover:bg-gray-50 ${
                            selectedEntry?.id === entry.id ? 'bg-green-50' : ''
                          }`}
                          onClick={() => handleEntryClick(entry)}
                        >
                          <div className="text-xs text-gray-500 mb-1">
                            {format(new Date(entry.date), 'EEEE, MMMM d, yyyy')}
                          </div>
                          <div className="text-sm line-clamp-2">
                            {entry.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Entry View */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {selectedEntry ? (
            <div className="h-full">
              <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">
                    {format(new Date(selectedEntry.date), 'MMMM d, yyyy')}
                  </h2>
                  <div className="text-xs text-gray-500">
                    {getWordCount(selectedEntry.text)} words
                  </div>
                </div>
                <Button variant="outline" size="sm" className="bg-white">
                  <Share className="h-4 w-4 mr-1" /> Share
                </Button>
              </div>
              
              <Tabs defaultValue="analysis" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-4 pt-4 bg-white border-b border-gray-200">
                  <TabsList className="bg-gray-100">
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    <TabsTrigger value="entry">Entry</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="analysis" className="p-4 mt-0">
                  <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                    <div className="p-4">
                      <h3 className="text-lg font-medium mb-4">Entry Analysis</h3>
                      
                      <div className="bg-white border border-gray-100 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Key Emotions</h4>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-green-50 text-green-800 text-xs rounded-full">Joy</span>
                          <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs rounded-full">Curiosity</span>
                          <span className="px-3 py-1 bg-yellow-50 text-yellow-800 text-xs rounded-full">Anticipation</span>
                        </div>
                      </div>
                      
                      <div className="bg-white border border-gray-100 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Key Topics</h4>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-gray-50 text-gray-800 text-xs rounded-full">Work</span>
                          <span className="px-3 py-1 bg-gray-50 text-gray-800 text-xs rounded-full">Relationships</span>
                          <span className="px-3 py-1 bg-gray-50 text-gray-800 text-xs rounded-full">Personal Growth</span>
                        </div>
                      </div>
                      
                      <div className="bg-white border border-gray-100 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Sentiment Analysis</h4>
                        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full" style={{ width: "65%" }}></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span>Negative</span>
                          <span>Neutral</span>
                          <span>Positive</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
                
                <TabsContent value="entry" className="p-4 mt-0">
                  <Card className="border-0 shadow-sm rounded-xl">
                    <div className="p-4">
                      <div className="prose max-w-none">
                        <p>{selectedEntry.text}</p>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select an entry to view its details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to count words
const getWordCount = (text: string) => {
  return text.split(/\s+/).filter(Boolean).length;
};

export default EntriesView;
