
import React from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { Point } from "@/types/embedding";
import {
  OverviewTabContent,
  TimelineTabContent,
  ClusteringTabContent,
  SuggestionsTabContent
} from "./TabContents";

interface TabRendererProps {
  activeTab: string;
  sentimentData: any;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedPoint: Point | null;
  setSelectedPoint: (point: Point | null) => void;
  selectedWord: string | null;
  setSelectedWord: (word: string | null) => void;
  filteredPoints: Point[];
  setFilteredPoints: (points: Point[]) => void;
  clusterCount: number;
  handlePointClick: (point: Point | null) => void;
  handleResetVisualization: () => void;
  handleClearSearch: () => void;
  connectedPoints: Point[];
  setConnectedPoints: (points: Point[]) => void;
}

export const TabRenderer = ({
  activeTab,
  sentimentData,
  searchTerm,
  setSearchTerm,
  selectedPoint,
  selectedWord,
  filteredPoints,
  clusterCount,
  handlePointClick,
  handleResetVisualization,
  handleClearSearch,
  connectedPoints,
  setConnectedPoints
}: TabRendererProps) => {
  const { t } = useLanguage();

  switch (activeTab) {
    case "overview":
      return <OverviewTabContent data={sentimentData} />;
      
    case "timeline":
      return <TimelineTabContent data={sentimentData} />;
      
    case "clustering":
      return (
        <ClusteringTabContent
          filteredPoints={filteredPoints}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleClearSearch={handleClearSearch}
          handleResetVisualization={handleResetVisualization}
          selectedPoint={selectedPoint}
          selectedWord={selectedWord}
          handlePointClick={handlePointClick}
          clusterCount={clusterCount}
          connectedPoints={connectedPoints}
          setConnectedPoints={setConnectedPoints}
        />
      );
      
    case "suggestions":
      return <SuggestionsTabContent data={sentimentData} />;
      
    default:
      return <div>{t("selectTab")}</div>;
  }
};
