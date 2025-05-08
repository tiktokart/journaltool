
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const PerfectLifePlan = () => {
  const [dailyPlan, setDailyPlan] = useState<string>("");
  const [weeklyPlan, setWeeklyPlan] = useState<string>("");
  const [monthlyPlan, setMonthlyPlan] = useState<string>("");

  // Load perfect life plans from local storage on component mount
  useEffect(() => {
    try {
      const storedDailyPlan = localStorage.getItem('perfectLifeDailyPlan');
      const storedWeeklyPlan = localStorage.getItem('perfectLifeWeeklyPlan');
      const storedMonthlyPlan = localStorage.getItem('perfectLifeMonthlyPlan');
      
      if (storedDailyPlan) setDailyPlan(storedDailyPlan);
      if (storedWeeklyPlan) setWeeklyPlan(storedWeeklyPlan);
      if (storedMonthlyPlan) setMonthlyPlan(storedMonthlyPlan);
    } catch (error) {
      console.error('Error loading perfect life plans from storage:', error);
    }
  }, []);

  // Save perfect life plans to local storage
  const handleSavePlans = () => {
    try {
      localStorage.setItem('perfectLifeDailyPlan', dailyPlan);
      localStorage.setItem('perfectLifeWeeklyPlan', weeklyPlan);
      localStorage.setItem('perfectLifeMonthlyPlan', monthlyPlan);
      toast.success("Perfect Life Plans saved successfully");
    } catch (error) {
      console.error('Error saving perfect life plans to storage:', error);
      toast.error("Failed to save Perfect Life Plans");
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-black">What does your Perfect Life Look Like?</h2>
      <Card className="bg-white border border-border shadow-md">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="daily-plan" className="text-black font-medium">Daily</Label>
            <Textarea 
              id="daily-plan"
              placeholder="Enter your Goals, Objectives, and Tasks"
              className="min-h-[80px] text-black"
              value={dailyPlan}
              onChange={(e) => setDailyPlan(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weekly-plan" className="text-black font-medium">Weekly</Label>
            <Textarea 
              id="weekly-plan"
              placeholder="Enter your Goals, Objectives, and Tasks"
              className="min-h-[80px] text-black"
              value={weeklyPlan}
              onChange={(e) => setWeeklyPlan(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="monthly-plan" className="text-black font-medium">Monthly</Label>
            <Textarea 
              id="monthly-plan"
              placeholder="Enter your Goals, Objectives, and Tasks"
              className="min-h-[80px] text-black"
              value={monthlyPlan}
              onChange={(e) => setMonthlyPlan(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={handleSavePlans}
            className="mt-2 bg-orange hover:bg-orange/90 w-full text-white"
          >
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerfectLifePlan;
