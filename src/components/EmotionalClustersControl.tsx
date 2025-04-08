
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Brain } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface EmotionalClustersControlProps {
  visibleClusterCount: number;
  setVisibleClusterCount: (count: number) => void;
  activeTab: string;
}

export const EmotionalClustersControl = ({ 
  visibleClusterCount, 
  setVisibleClusterCount,
  activeTab
}: EmotionalClustersControlProps) => {
  const { t } = useLanguage();
  
  return (
    <Card className="border border-border shadow-md bg-card">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Brain className="h-5 w-5 mr-2 text-primary" />
          {t("emotionalClusters")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">
            {t("emotionalClustersDescription")}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">4</span>
            <Slider 
              value={[visibleClusterCount]} 
              min={4}
              max={12}
              step={1}
              onValueChange={(value) => {
                setVisibleClusterCount(value[0]);
                if (activeTab === "embedding") {
                  toast.info(t("visualizationUpdated").replace("{count}", value[0].toString()));
                }
              }}
              className="flex-1"
            />
            <span className="text-sm font-medium">12</span>
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-medium ml-2">
              {visibleClusterCount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
