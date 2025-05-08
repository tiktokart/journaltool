
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CalendarClock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface MonthlyReflectionsProps {
  journalText?: string;
}

export const MonthlyReflections = ({ journalText }: MonthlyReflectionsProps) => {
  const { t } = useLanguage();
  const [reflectionText, setReflectionText] = useState<string>("");

  useEffect(() => {
    // Load saved reflections from local storage
    const loadReflectionsFromStorage = () => {
      try {
        const storedReflectionText = localStorage.getItem('monthlyReflectionText');
        if (storedReflectionText) setReflectionText(storedReflectionText);
      } catch (error) {
        console.error('Error loading monthly reflections from storage:', error);
      }
    };
    
    loadReflectionsFromStorage();
  }, []);

  useEffect(() => {
    // If new journalText is passed, add it to reflections
    if (journalText && journalText.trim().length > 0) {
      const currentDate = new Date().toLocaleDateString();
      const newEntry = `--- ${currentDate} ---\n${journalText}\n\n`;
      
      setReflectionText(prev => {
        const updatedText = newEntry + prev;
        // Save to localStorage
        localStorage.setItem('monthlyReflectionText', updatedText);
        return updatedText;
      });
      
      toast.success("Added to monthly reflections");
    }
  }, [journalText]);

  const handleSaveReflections = () => {
    localStorage.setItem('monthlyReflectionText', reflectionText);
    toast.success("Monthly reflections saved");
  };

  return (
    <Card className="bg-white border border-border shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-black">
          <CalendarClock className="h-5 w-5 mr-2 text-orange" />
          <span className="font-bold">Monthly Reflections</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea 
          placeholder="Your monthly reflections will appear here as you add journal entries..."
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          className="min-h-[150px] text-black"
        />
        <Button 
          onClick={handleSaveReflections}
          className="mt-2 bg-orange hover:bg-orange/90 w-full text-white"
        >
          {t("saveChanges")}
        </Button>
      </CardContent>
    </Card>
  );
};
