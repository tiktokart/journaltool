
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

  // Make sure sentimentData is properly formatted for the tabs
  const prepareData = () => {
    if (!sentimentData) return sentimentData;
    
    // Check if we need to process BERT analysis data
    if (sentimentData.bertAnalysis) {
      // Update any Joy theme colors for better legibility
      const processedData = {...sentimentData};
      
      if (processedData.bertAnalysis.keywords) {
        processedData.bertAnalysis.keywords = processedData.bertAnalysis.keywords.map((kw: any) => {
          // If this is a "Joy" related keyword, update its color for better legibility
          if (kw.tone && kw.tone.toLowerCase().includes('joy')) {
            return {...kw, color: '#FFC107'}; // More visible amber color for Joy
          }
          return kw;
        });
      }
      
      return processedData;
    }
    
    return sentimentData;
  };

  const processedData = prepareData();

  switch (activeTab) {
    case "overview":
      return <OverviewTabContent data={processedData} />;
      
    case "timeline":
      return <TimelineTabContent data={processedData} />;
      
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
      return <SuggestionsTabContent data={processedData} />;
      
    default:
      return <div>{t("selectTab")}</div>;
  }
};
