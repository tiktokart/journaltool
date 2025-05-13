
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Point } from "@/types/embedding";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAnalysisData } from "@/hooks/useAnalysisData";
import { TabRenderer } from "./analysis/TabRenderer";

interface AnalysisTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sentimentData: any;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedPoint: Point | null;
  setSelectedPoint: (point: Point | null) => void;
  selectedWord: string | null;
  setSelectedWord: (word: string | null) => void;
  filteredPoints: Point[];
  setFilteredPoints: (points: Point[]) => void;
  uniqueWords: string[];
  visibleClusterCount?: number;
  handlePointClick: (point: Point | null) => void;
  handleResetVisualization: () => void;
  handleClearSearch: () => void;
  bertAnalysis?: any;
  connectedPoints: Point[];
  setConnectedPoints: (points: Point[]) => void;
}

export const AnalysisTabs = ({
  activeTab,
  setActiveTab,
  sentimentData,
  searchTerm,
  setSearchTerm,
  selectedPoint,
  setSelectedPoint,
  selectedWord,
  setSelectedWord,
  filteredPoints,
  setFilteredPoints,
  uniqueWords,
  visibleClusterCount = 8,
  handlePointClick,
  handleResetVisualization,
  handleClearSearch,
  bertAnalysis,
  connectedPoints,
  setConnectedPoints
}: AnalysisTabsProps) => {
  const { t } = useLanguage();
  
  const { normalizedData, clusterCount } = useAnalysisData(
    sentimentData,
    searchTerm,
    setFilteredPoints,
    setSelectedWord,
    setSelectedPoint
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
        <TabsTrigger value="timeline">{t("timeline")}</TabsTrigger>
        <TabsTrigger value="clustering">{t("emotionalClusters")}</TabsTrigger>
        <TabsTrigger value="suggestions">{t("suggestions")}</TabsTrigger>
      </TabsList>
      
      <div className="mt-4">
        <TabRenderer
          activeTab={activeTab}
          sentimentData={normalizedData}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedPoint={selectedPoint}
          setSelectedPoint={setSelectedPoint}
          selectedWord={selectedWord}
          setSelectedWord={setSelectedWord}
          filteredPoints={filteredPoints}
          setFilteredPoints={setFilteredPoints}
          clusterCount={clusterCount}
          handlePointClick={handlePointClick}
          handleResetVisualization={handleResetVisualization}
          handleClearSearch={handleClearSearch}
          connectedPoints={connectedPoints}
          setConnectedPoints={setConnectedPoints}
        />
      </div>
    </Tabs>
  );
};
