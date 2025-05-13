
import React from 'react';
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ArrowRight, Info } from "lucide-react";

interface ActionPlan {
  title: string;
  steps: string[];
  category: string;
  triggerWords: string[];
  expanded?: boolean;
}

interface ActionPlansProps {
  actionPlans: ActionPlan[];
  expandedPlans: Record<string, boolean>;
  togglePlanExpansion: (title: string) => void;
}

const ActionPlans: React.FC<ActionPlansProps> = ({
  actionPlans,
  expandedPlans,
  togglePlanExpansion
}) => {
  const getEmotionBadgeStyles = (emotion: string) => {
    switch(emotion) {
      case "Joy":
      case "Joyful":
        return "bg-amber-100 text-amber-800"; // Amber for joy
      case "Sadness":
      case "Sad":
        return "bg-blue-100 text-blue-800";
      case "Anxiety":
      case "Fear":
        return "bg-amber-100 text-amber-800";
      case "Contentment":
      case "Calm":
        return "bg-green-100 text-green-800";
      case "Confusion":
        return "bg-purple-100 text-purple-800";
      case "Anger":
        return "bg-red-100 text-red-800";
      case "Overwhelm":
        return "bg-orange-100 text-orange-800";
      case "Sleep":
        return "bg-indigo-100 text-indigo-800";
      case "Loneliness":
        return "bg-teal-100 text-teal-800";
      case "Neutral":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (actionPlans.length === 0) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium mb-1">Consider adding more details</h4>
          <p className="text-sm">Your entry could benefit from more specific examples or situations.</p>
        </div>
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium mb-1">Reflect on your emotions</h4>
          <p className="text-sm">Try exploring why you felt the way you did during these events.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-4">
      <h3 className="font-medium mb-3">Action plans for your wellbeing:</h3>
      {actionPlans.map((plan, index) => (
        <div 
          key={index} 
          className="border rounded-lg overflow-hidden"
          style={{
            borderColor: plan.category === "Joy" ? "#FFC107" : // Amber color
                        plan.category === "Sadness" ? "#BFDBFE" :
                        plan.category === "Anxiety" ? "#FDE68A" :
                        plan.category === "Anger" ? "#FCA5A5" :
                        plan.category === "Contentment" ? "#A7F3D0" :
                        plan.category === "Overwhelm" ? "#FDBA74" :
                        plan.category === "Sleep" ? "#C7D2FE" :
                        plan.category === "Loneliness" ? "#99F6E4" : "#E5E7EB"
          }}
        >
          <div 
            className="p-4"
            style={{
              backgroundColor: plan.category === "Joy" ? "#FFFBEB" :
                            plan.category === "Sadness" ? "#EFF6FF" :
                            plan.category === "Anxiety" ? "#FFFBEB" :
                            plan.category === "Anger" ? "#FEF2F2" :
                            plan.category === "Contentment" ? "#ECFDF5" :
                            plan.category === "Overwhelm" ? "#FFF7ED" :
                            plan.category === "Sleep" ? "#EEF2FF" :
                            plan.category === "Loneliness" ? "#F0FDFA" : "#F9FAFB"
            }}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-medium text-lg">{plan.title}</h3>
              <Badge className={getEmotionBadgeStyles(plan.category)}>
                {plan.category}
              </Badge>
            </div>
            
            {/* Display trigger words if any */}
            {plan.triggerWords.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Triggered by:</p>
                <div className="flex flex-wrap gap-1">
                  {plan.triggerWords.slice(0, 3).map((word, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Action plan steps with expand/collapse */}
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto flex items-center gap-1 mb-2 hover:bg-transparent"
                onClick={() => togglePlanExpansion(plan.title)}
              >
                <ArrowRight className={`h-4 w-4 transition-transform ${expandedPlans[plan.title] ? 'rotate-90' : ''}`} />
                <span className="text-sm">
                  {expandedPlans[plan.title] ? "Hide action plan" : "Show action plan"}
                </span>
              </Button>
              
              {expandedPlans[plan.title] && (
                <div className="pl-5 border-l-2 border-gray-200 mt-3 space-y-2 animate-fadeIn">
                  <ol className="list-decimal list-outside space-y-2 text-sm ml-4">
                    {plan.steps.map((step, stepIdx) => (
                      <li key={stepIdx} className="text-gray-700">{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActionPlans;
