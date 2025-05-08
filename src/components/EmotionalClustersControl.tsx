
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
    <Card className="border border-border shadow-md bg-white">
      <CardHeader className="bg-white rounded-t-lg">
        <CardTitle className="flex items-center text-xl text-orange">
          <Brain className="h-5 w-5 mr-2 text-orange" />
          Emotional Clusters
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-white">
        <div className="mb-6">
          <p className="text-sm text-black mb-2">
            {t("emotionalClustersDescription")}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-black">4</span>
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
            <span className="text-sm font-medium text-black">12</span>
            <span className="bg-white border border-orange text-orange px-2 py-1 rounded-md text-sm font-medium ml-2">
              {visibleClusterCount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
