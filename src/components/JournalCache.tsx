
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Calendar, Trash2, FileText, Database } from "lucide-react";
import { format } from "date-fns";

interface JournalEntry {
  id: string;
  text: string;
  date: string;
}

interface JournalCacheProps {
  onSelectEntry: (text: string) => void;
}

export const JournalCache = ({ onSelectEntry }: JournalCacheProps) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    try {
      const storedEntries = localStorage.getItem('journalEntries');
      if (storedEntries) {
        const parsedEntries = JSON.parse(storedEntries);
        
        // Filter out entries older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const filteredEntries = parsedEntries.filter((entry: JournalEntry) => {
          const entryDate = new Date(entry.date);
          return entryDate >= thirtyDaysAgo;
        });
        
        setEntries(filteredEntries);
        
        // If we filtered out old entries, save the updated list
        if (filteredEntries.length !== parsedEntries.length) {
          localStorage.setItem('journalEntries', JSON.stringify(filteredEntries));
        }
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
      toast.error("Failed to load saved journal entries");
    }
  };

  const handleSelect = (entry: JournalEntry) => {
    onSelectEntry(entry.text);
    toast.info(`Selected journal entry from ${format(new Date(entry.date), 'MMM d, yyyy')}`);
  };

  const handleDelete = (id: string) => {
    try {
      const updatedEntries = entries.filter(entry => entry.id !== id);
      setEntries(updatedEntries);
      localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      toast.success("Journal entry deleted");
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      toast.error("Failed to delete journal entry");
    }
  };

  const handleClearAll = () => {
    try {
      setEntries([]);
      localStorage.removeItem('journalEntries');
      toast.success("All journal entries cleared");
    } catch (error) {
      console.error('Error clearing journal entries:', error);
      toast.error("Failed to clear journal entries");
    }
  };

  return (
    <Card className="border border-border shadow-md bg-white">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Database className="h-5 w-5 mr-2 text-primary" />
          Saved Journal Entries
        </CardTitle>
        <CardDescription>
          Your entries are stored locally for 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No saved journal entries yet</p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[250px] pr-4">
              <div className="space-y-2">
                {entries.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="p-3 rounded-md border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(entry.date), 'MMM d, yyyy - h:mm a')}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="line-clamp-2 text-sm">
                      {entry.text}
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-2 h-7 text-xs px-2 py-0"
                      onClick={() => handleSelect(entry)}
                    >
                      Use This Entry
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearAll}
              >
                Clear All Entries
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
