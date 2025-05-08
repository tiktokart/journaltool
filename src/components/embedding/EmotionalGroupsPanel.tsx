
import { useState } from 'react';
import { ChevronDown, ChevronUp, Target, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { getUnifiedEmotionColor } from './PointUtils';

interface EmotionalGroupsPanelProps {
  emotionalGroups: string[];
  selectedEmotionalGroup: string | null;
  onSelectEmotionalGroup: (group: string) => void;
  onResetFilter: () => void;
  isHomepage?: boolean;
}

export const EmotionalGroupsPanel = ({
  emotionalGroups,
  selectedEmotionalGroup,
  onSelectEmotionalGroup,
  onResetFilter,
  isHomepage = false
}: EmotionalGroupsPanelProps) => {
  const { t } = useLanguage();
  const [isEmotionalGroupsOpen, setIsEmotionalGroupsOpen] = useState<boolean>(true);

  const handleGroupSelect = (group: string) => {
    onSelectEmotionalGroup(group);
    toast.info(`${t("showingOnlyEmotionalGroup")} "${group}" ${t("emotionalGroup")}`);
  };

  const handleResetFilter = () => {
    onResetFilter();
    toast.info(t("showingAllEmotionalGroups"));
  };

  return (
    <div className="absolute top-16 right-4 z-10 bg-card/80 backdrop-blur-sm p-2 rounded-lg shadow-md border border-border">
      <Collapsible 
        open={isEmotionalGroupsOpen} 
        onOpenChange={setIsEmotionalGroupsOpen}
        className="w-full max-w-[200px]"
      >
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold flex items-center">
            <Target className="h-3 w-3 mr-1.5 text-orange" />
            {t("jumpToEmotionalGroups")}
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {isEmotionalGroupsOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent className="mt-1 space-y-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">{t("filterByEmotion")}</span>
            {selectedEmotionalGroup && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleResetFilter}
                className="h-6 py-0 px-1 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                {t("reset")}
              </Button>
            )}
          </div>
          
          {emotionalGroups.map(group => (
            <Button
              key={group}
              size="sm"
              variant={selectedEmotionalGroup === group ? "default" : "outline"}
              className="h-7 text-xs justify-start px-2 w-full"
              onClick={() => handleGroupSelect(group)}
            >
              <div 
                className="w-3 h-3 rounded-full mr-1.5" 
                style={{ backgroundColor: getUnifiedEmotionColor(group, isHomepage) }}
              />
              {group}
            </Button>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default EmotionalGroupsPanel;
