
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { StarIcon, Map, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface LifePlanSectionProps {
  journalText?: string;
}

export const LifePlanSection = ({ journalText = "" }: LifePlanSectionProps) => {
  const { t } = useLanguage();

  const [lifePlan, setLifePlan] = useState({
    personalValues: localStorage.getItem("lifePlan_personalValues") || "",
    relationships: localStorage.getItem("lifePlan_relationships") || "",
    career: localStorage.getItem("lifePlan_career") || "",
    health: localStorage.getItem("lifePlan_health") || ""
  });
  
  const personalValuesPlaceholder = "Type your routines, objectives, and goals";
  const relationshipsPlaceholder = "Type your routines, objectives, and goals";
  const careerPlaceholder = "Type your routines, objectives, and goals";
  const healthPlaceholder = "Type your routines, objectives, and goals";
  
  // Save changes to localStorage when any field changes
  useEffect(() => {
    localStorage.setItem("lifePlan_personalValues", lifePlan.personalValues);
    localStorage.setItem("lifePlan_relationships", lifePlan.relationships);
    localStorage.setItem("lifePlan_career", lifePlan.career);
    localStorage.setItem("lifePlan_health", lifePlan.health);
  }, [lifePlan]);
  
  const handleChange = (field: keyof typeof lifePlan, value: string) => {
    setLifePlan(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  return (
    <Card className="border border-border shadow-md bg-yellow">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Map className="h-5 w-5 mr-2 text-orange" />
          What does your Perfect Life Look Like?
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Personal Values */}
        <div>
          <h3 className="text-sm font-bold flex items-center mb-2">
            <StarIcon className="h-4 w-4 mr-1.5" />
            Personal Values
          </h3>
          <Textarea 
            placeholder={personalValuesPlaceholder}
            value={lifePlan.personalValues}
            onChange={(e) => handleChange("personalValues", e.target.value)}
            className="min-h-[100px] bg-white/50"
          />
        </div>
        
        {/* Relationships */}
        <div>
          <h3 className="text-sm font-bold mb-2">Relationships</h3>
          <Textarea 
            placeholder={relationshipsPlaceholder}
            value={lifePlan.relationships}
            onChange={(e) => handleChange("relationships", e.target.value)}
            className="min-h-[100px] bg-white/50"
          />
        </div>
        
        {/* Career */}
        <div>
          <h3 className="text-sm font-bold mb-2">Career</h3>
          <Textarea 
            placeholder={careerPlaceholder}
            value={lifePlan.career}
            onChange={(e) => handleChange("career", e.target.value)}
            className="min-h-[100px] bg-white/50"
          />
        </div>
        
        {/* Health */}
        <div>
          <h3 className="text-sm font-bold mb-2">Health</h3>
          <Textarea 
            placeholder={healthPlaceholder}
            value={lifePlan.health}
            onChange={(e) => handleChange("health", e.target.value)}
            className="min-h-[100px] bg-white/50"
          />
        </div>
      </CardContent>
    </Card>
  );
};
