
import React from 'react';
import { SentimentOverview } from "@/components/SentimentOverview";
import { KeyPhrases } from "@/components/KeyPhrases";
import { SentimentTimeline } from "@/components/SentimentTimeline";
import { EmotionalClusterView } from "@/components/embedding/EmotionalClusterView";
import { WellbeingResources } from "@/components/WellbeingResources";
import { SentimentDistribution } from "@/components/SentimentDistribution";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Point } from "@/types/embedding";

// Overview Tab Content
export const OverviewTabContent = ({ data }: { data: any }) => {
  return (
    <div className="space-y-6">
      <SentimentOverview 
        data={data} 
        sourceDescription={data.sourceDescription}
      />
      
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <KeyPhrases 
            data={data.keyPhrases || []} 
            sourceDescription={data.sourceDescription}
          />
        </div>
        <div>
          <SentimentDistribution 
            distribution={data.distribution}
            totalWordCount={data.totalWordCount || 0}
          />
        </div>
      </div>
    </div>
  );
};

// Timeline Tab Content
export const TimelineTabContent = ({ data }: { data: any }) => {
  return (
    <div className="h-[400px]">
      <SentimentTimeline 
        data={data.timeline || []} 
        sourceDescription={data.sourceDescription}
      />
    </div>
  );
};

// Clustering Tab Content Interface
interface ClusteringTabContentProps {
  filteredPoints: Point[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleClearSearch: () => void;
  handleResetVisualization: () => void;
  selectedPoint: Point | null;
  selectedWord: string | null;
  handlePointClick: (point: Point | null) => void;
  clusterCount: number;
  connectedPoints: Point[];
  setConnectedPoints: (points: Point[]) => void;
}

// Clustering Tab Content
export const ClusteringTabContent = ({
  filteredPoints,
  searchTerm,
  setSearchTerm,
  handleClearSearch,
  handleResetVisualization,
  selectedPoint,
  selectedWord,
  handlePointClick,
  clusterCount,
  connectedPoints,
  setConnectedPoints
}: ClusteringTabContentProps) => {
  const { t } = useLanguage();
  
  return (
    <>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchKeywords")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
            {searchTerm.length > 0 && (
              <button
                className="absolute right-2 top-2.5"
                onClick={handleClearSearch}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={handleResetVisualization}
            size="sm"
          >
            {t("reset")}
          </Button>
        </div>
      </div>
      <div className="h-[400px]">
        <EmotionalClusterView
          points={filteredPoints}
          selectedPoint={selectedPoint}
          selectedWord={selectedWord}
          onPointClick={handlePointClick}
          clusterCount={clusterCount}
          connectedPoints={connectedPoints}
          setConnectedPoints={setConnectedPoints}
        />
      </div>
    </>
  );
};

// Suggestions Tab Content
export const SuggestionsTabContent = ({ data }: { data: any }) => {
  return (
    <WellbeingResources
      embeddingPoints={data.embeddingPoints || []}
      sourceDescription={data.sourceDescription || "Based on your document"}
    />
  );
};
