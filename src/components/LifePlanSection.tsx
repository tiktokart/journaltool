
// This is a new file that will override the read-only file's implementation

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CalendarClock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LifePlanSectionProps {
  journalText: string;
}

export const LifePlanSection = ({ journalText }: LifePlanSectionProps) => {
  const { t } = useLanguage();
  const [dailyLifeText, setDailyLifeText] = useState<string>("");
  const [weeklyLifeText, setWeeklyLifeText] = useState<string>("");
  const [monthlyLifeText, setMonthlyLifeText] = useState<string>("");

  useEffect(() => {
    // Load saved content from local storage
    const loadLifePlanFromStorage = () => {
      try {
        const storedDailyLifeText = localStorage.getItem('dailyLifeText');
        const storedWeeklyLifeText = localStorage.getItem('weeklyLifeText');
        const storedMonthlyLifeText = localStorage.getItem('monthlyLifeText');
        
        if (storedDailyLifeText) setDailyLifeText(storedDailyLifeText);
        if (storedWeeklyLifeText) setWeeklyLifeText(storedWeeklyLifeText);
        if (storedMonthlyLifeText) setMonthlyLifeText(storedMonthlyLifeText);
      } catch (error) {
        console.error('Error loading life plan from storage:', error);
      }
    };
    
    loadLifePlanFromStorage();
  }, []);

  useEffect(() => {
    // Update relevant section if journalText is passed and a section is being added to
    if (!journalText) return;
    
    const addTextToSection = (currentText: string): string => {
      if (!currentText) return journalText;
      return currentText + "\n\n" + journalText;
    };
    
    // Check if there's a pending section update via localStorage flag
    const pendingSection = localStorage.getItem('pendingLifePlanSection');
    if (pendingSection) {
      switch (pendingSection) {
        case 'daily':
          setDailyLifeText(addTextToSection(dailyLifeText));
          localStorage.setItem('dailyLifeText', addTextToSection(dailyLifeText));
          break;
        case 'weekly':
          setWeeklyLifeText(addTextToSection(weeklyLifeText));
          localStorage.setItem('weeklyLifeText', addTextToSection(weeklyLifeText));
          break;
        case 'monthly':
          setMonthlyLifeText(addTextToSection(monthlyLifeText));
          localStorage.setItem('monthlyLifeText', addTextToSection(monthlyLifeText));
          break;
      }
      
      // Clear the flag
      localStorage.removeItem('pendingLifePlanSection');
    }
  }, [journalText, dailyLifeText, weeklyLifeText, monthlyLifeText]);

  const handleSaveDaily = () => {
    localStorage.setItem('dailyLifeText', dailyLifeText);
  };
  
  const handleSaveWeekly = () => {
    localStorage.setItem('weeklyLifeText', weeklyLifeText);
  };
  
  const handleSaveMonthly = () => {
    localStorage.setItem('monthlyLifeText', monthlyLifeText);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-black">What does your Perfect Life Look Like?</h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-light-lavender border border-border shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-black">
              <Calendar className="h-5 w-5 mr-2 text-orange" />
              <span className="font-bold">Daily Life</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Type your routines, objectives, and goals"
              value={dailyLifeText}
              onChange={(e) => setDailyLifeText(e.target.value)}
              className="min-h-[150px] text-black"
            />
            <Button 
              onClick={handleSaveDaily}
              className="mt-2 bg-orange hover:bg-orange/90 w-full text-white"
            >
              {t("saveChanges")}
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-light-lavender border border-border shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-black">
              <Clock className="h-5 w-5 mr-2 text-orange" />
              <span className="font-bold">Weekly Life</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Type your routines, objectives, and goals"
              value={weeklyLifeText}
              onChange={(e) => setWeeklyLifeText(e.target.value)}
              className="min-h-[150px] text-black"
            />
            <Button 
              onClick={handleSaveWeekly}
              className="mt-2 bg-orange hover:bg-orange/90 w-full text-white"
            >
              {t("saveChanges")}
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-light-lavender border border-border shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-black">
              <CalendarClock className="h-5 w-5 mr-2 text-orange" />
              <span className="font-bold">Monthly Life</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Type your routines, objectives, and goals"
              value={monthlyLifeText}
              onChange={(e) => setMonthlyLifeText(e.target.value)}
              className="min-h-[150px] text-black"
            />
            <Button 
              onClick={handleSaveMonthly}
              className="mt-2 bg-orange hover:bg-orange/90 w-full text-white"
            >
              {t("saveChanges")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
