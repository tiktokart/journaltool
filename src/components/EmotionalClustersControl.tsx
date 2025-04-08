
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Brain } from "lucide-react";
import { toast } from "sonner";

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
  return (
    <Card className="border border-border shadow-md bg-card">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Brain className="h-5 w-5 mr-2 text-primary" />
          Emotional Clusters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">
            Adjust the number of emotional clusters visible in the visualization:
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
                  toast.info(`Visualization updated to show ${value[0]} emotional clusters`);
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
