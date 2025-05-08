
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarClock, Trash2, FileText, Save } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { v4 as uuidv4 } from 'uuid';

interface MonthlyReflection {
  id: string;
  text: string;
  date: string;
}

interface MonthlyReflectionsProps {
  journalText?: string;
}

export const MonthlyReflections = ({ journalText }: MonthlyReflectionsProps) => {
  const { t } = useLanguage();
  const [reflections, setReflections] = useState<MonthlyReflection[]>([]);
  const currentMonth = format(new Date(), 'MMMM yyyy');

  useEffect(() => {
    loadReflections();
  }, []);

  useEffect(() => {
    // If new journalText is passed, add it to reflections
    if (journalText && journalText.trim().length > 0) {
      addReflection(journalText);
    }
  }, [journalText]);

  const loadReflections = () => {
    try {
      const storedReflections = localStorage.getItem('monthlyReflections');
      if (storedReflections) {
        setReflections(JSON.parse(storedReflections));
      }
    } catch (error) {
      console.error('Error loading monthly reflections:', error);
      toast.error("Failed to load monthly reflections");
    }
  };

  const addReflection = (text: string) => {
    try {
      const newReflection = {
        id: uuidv4(),
        text: text,
        date: new Date().toISOString()
      };
      
      const updatedReflections = [newReflection, ...reflections];
      setReflections(updatedReflections);
      localStorage.setItem('monthlyReflections', JSON.stringify(updatedReflections));
      toast.success("Added to monthly reflections");
    } catch (error) {
      console.error('Error saving monthly reflection:', error);
      toast.error("Failed to save monthly reflection");
    }
  };

  const handleDelete = (id: string) => {
    try {
      const updatedReflections = reflections.filter(reflection => reflection.id !== id);
      setReflections(updatedReflections);
      localStorage.setItem('monthlyReflections', JSON.stringify(updatedReflections));
      toast.success("Reflection deleted");
    } catch (error) {
      console.error('Error deleting reflection:', error);
      toast.error("Failed to delete reflection");
    }
  };

  const handleClearAll = () => {
    try {
      setReflections([]);
      localStorage.removeItem('monthlyReflections');
      toast.success("All reflections cleared");
    } catch (error) {
      console.error('Error clearing reflections:', error);
      toast.error("Failed to clear reflections");
    }
  };

  return (
    <Card className="bg-white border border-border shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-black">
          <CalendarClock className="h-5 w-5 mr-2 text-orange" />
          <span className="font-bold">Monthly Reflections</span>
          <span className="ml-2 text-sm bg-orange/20 text-orange px-2 py-0.5 rounded-full">
            {currentMonth}
          </span>
        </CardTitle>
        <CardDescription className="text-black">
          Your personal growth journey over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reflections.length === 0 ? (
          <div className="text-center py-8 text-black">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No monthly reflections yet</p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[250px] pr-4">
              <div className="space-y-2">
                {reflections.map((reflection) => (
                  <div 
                    key={reflection.id} 
                    className="p-3 rounded-md border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center text-sm text-black">
                        <CalendarClock className="h-3 w-3 mr-1" />
                        {format(new Date(reflection.date), 'MMM d, yyyy - h:mm a')}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(reflection.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-black whitespace-pre-wrap">
                      {reflection.text}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-orange text-white hover:bg-orange/90 border-orange"
                onClick={handleClearAll}
              >
                Clear All Reflections
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
