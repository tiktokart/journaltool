
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, ChevronRight, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface JournalEntry {
  id: string;
  text: string;
  date: string;
}

interface JournalCacheProps {
  onSelectEntry: (text: string) => void;
  refreshTrigger?: number;
}

export const JournalCache = ({ onSelectEntry, refreshTrigger = 0 }: JournalCacheProps) => {
  const { t } = useLanguage();
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  // Load journal entries whenever refreshTrigger changes
  useEffect(() => {
    loadJournalEntries();
  }, [refreshTrigger]);

  const loadJournalEntries = () => {
    try {
      const storedEntries = localStorage.getItem('journalEntries');
      if (storedEntries) {
        const entries = JSON.parse(storedEntries);
        // Sort entries by date (newest first)
        entries.sort((a: JournalEntry, b: JournalEntry) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setJournalEntries(entries);
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
      toast.error('Failed to load journal entries');
    }
  };

  const handleSelectEntry = (text: string) => {
    onSelectEntry(text);
    toast.info('Journal entry loaded for analysis');
  };

  const handleDeleteEntry = (id: string) => {
    try {
      const updatedEntries = journalEntries.filter(entry => entry.id !== id);
      setJournalEntries(updatedEntries);
      localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      toast.success('Journal entry deleted');
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      toast.error('Failed to delete journal entry');
    }
  };

  const handleDeleteAll = () => {
    try {
      setJournalEntries([]);
      localStorage.removeItem('journalEntries');
      toast.success('All journal entries cleared');
    } catch (error) {
      console.error('Error clearing journal entries:', error);
      toast.error('Failed to clear journal entries');
    }
  };

  return (
    <Card className="border border-border shadow-md bg-white">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2 text-orange" />
          <span className="font-bold">Saved Journal Entries</span>
          <span className="ml-2 text-sm bg-orange/20 text-orange px-2 py-0.5 rounded-full">
            {journalEntries.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {journalEntries.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No journal entries yet</p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[250px] pr-4">
              {journalEntries.map((entry) => (
                <div 
                  key={entry.id} 
                  className="p-3 mb-2 rounded-md border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-sm opacity-70">
                      {format(new Date(entry.date), 'MMM d, yyyy - h:mm a')}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-6 w-6 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteEntry(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm line-clamp-2 mb-2">
                    {entry.text}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-1 text-xs flex items-center text-orange hover:bg-orange/10"
                    onClick={() => handleSelectEntry(entry.text)}
                  >
                    <span>Load for Analysis</span>
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              ))}
            </ScrollArea>
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-orange text-white hover:bg-orange/90 border-orange"
                onClick={handleDeleteAll}
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
