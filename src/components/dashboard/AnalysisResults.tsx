
import { FileInfoDisplay } from "@/components/FileInfoDisplay";
import { ViewDetailedAnalysis } from "@/components/ViewDetailedAnalysis";
import { AnalysisTabs } from "@/components/AnalysisTabs";
import { EmotionalClustersControl } from "@/components/EmotionalClustersControl";
import { WordComparisonController } from "@/components/WordComparisonController";
import { TextEmotionViewer } from "@/components/TextEmotionViewer";
import { WellbeingResources } from "@/components/WellbeingResources";
import { PdfExport } from "@/components/PdfExport";
import { Point } from "@/types/embedding";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, BarChart2, BookOpen } from "lucide-react";
import { useState } from "react";

interface AnalysisResultsProps {
  sentimentData: any;
  pdfText: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedPoint: Point | null;
  setSelectedPoint: (point: Point | null) => void;
  selectedWord: string | null;
  setSelectedWord: (word: string | null) => void;
  filteredPoints: Point[];
  setFilteredPoints: (points: Point[]) => void;
  uniqueWords: string[];
  connectedPoints: Point[];
  setConnectedPoints: (points: Point[]) => void;
  visibleClusterCount: number;
  setVisibleClusterCount: (count: number) => void;
  handlePointClick: (point: Point | null) => void;
  handleResetVisualization: () => void;
  handleClearSearch: () => void;
  calculateRelationship: (point1: Point, point2: Point) => any;
  onJournalEntryAdded: () => void;
  onMonthlyReflectionAdded: () => void;
}

const AnalysisResults = ({
  sentimentData,
  pdfText,
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  selectedPoint,
  setSelectedPoint,
  selectedWord,
  setSelectedWord,
  filteredPoints,
  setFilteredPoints,
  uniqueWords,
  connectedPoints,
  setConnectedPoints,
  visibleClusterCount,
  setVisibleClusterCount,
  handlePointClick,
  handleResetVisualization,
  handleClearSearch,
  calculateRelationship,
  onJournalEntryAdded,
  onMonthlyReflectionAdded
}: AnalysisResultsProps) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isClustersOpen, setIsClustersOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(true);
  const [isLatentAnalysisOpen, setIsLatentAnalysisOpen] = useState(true);
  const [isPdfOpen, setIsPdfOpen] = useState(false);

  if (!sentimentData) {
    return null;
  }

  // Log BERT analysis data to verify it's available
  console.log("BERT data available in AnalysisResults:", 
    sentimentData.bertAnalysis ? 
    `Yes, with ${sentimentData.bertAnalysis.keywords?.length || 0} keywords` : 
    "No"
  );

  return (
    <div className="animate-fade-in flex flex-col items-center">
      {/* Main Content Area */}
      <div className="w-full max-w-4xl mx-auto">
        {/* File Information Section */}
        <Collapsible open={isInfoOpen} onOpenChange={setIsInfoOpen} className="w-full">
          <div className="bg-white p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">File Information</h2>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  {isInfoOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <FileInfoDisplay 
                fileName={sentimentData.fileName}
                fileSize={sentimentData.fileSize}
                wordCount={sentimentData.wordCount}
              />
            </CollapsibleContent>
          </div>
        </Collapsible>
        
        {/* Detailed Analysis Section */}
        <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen} className="w-full">
          <div className="bg-white p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-purple-600" />
                Detailed Analysis Data
              </h2>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  {isDetailsOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <ViewDetailedAnalysis 
                summary={sentimentData.summary} 
                text={sentimentData.text || sentimentData.pdfText}
                wordCount={sentimentData.wordCount}
                sourceDescription={sentimentData.sourceDescription}
              />
            </CollapsibleContent>
          </div>
        </Collapsible>
        
        {/* Analysis Tabs Section */}
        <div className="bg-white p-4 rounded-lg mb-4">
          <AnalysisTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sentimentData={sentimentData}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedPoint={selectedPoint}
            setSelectedPoint={setSelectedPoint}
            selectedWord={selectedWord}
            setSelectedWord={setSelectedWord}
            filteredPoints={filteredPoints}
            setFilteredPoints={setFilteredPoints}
            uniqueWords={uniqueWords}
            connectedPoints={connectedPoints}
            setConnectedPoints={setConnectedPoints}
            visibleClusterCount={visibleClusterCount}
            handlePointClick={handlePointClick}
            handleResetVisualization={handleResetVisualization}
            handleClearSearch={handleClearSearch}
            bertAnalysis={sentimentData.bertAnalysis}
          />
        </div>
        
        {/* Word Comparison Section */}
        <Collapsible open={isComparisonOpen} onOpenChange={setIsComparisonOpen} className="w-full">
          <div className="mt-8 mb-4 bg-white rounded-lg p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                Word Comparison
              </h2>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  {isComparisonOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <WordComparisonController 
                points={sentimentData.embeddingPoints}
                selectedPoint={selectedPoint}
                sourceDescription={sentimentData.sourceDescription}
                calculateRelationship={calculateRelationship}
              />
            </CollapsibleContent>
          </div>
        </Collapsible>
        
        {/* Latent Emotional Analysis Section */}
        <Collapsible open={isLatentAnalysisOpen} onOpenChange={setIsLatentAnalysisOpen} className="w-full">
          <div className="mt-8 mb-4 bg-white rounded-lg p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Latent Emotional Analysis</h2>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  {isLatentAnalysisOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <div className="h-[500px] relative bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                {/* 3D visualization will appear here */}
                {sentimentData.embeddingPoints && sentimentData.embeddingPoints.length > 0 ? (
                  <div className="h-full w-full">
                    {/* Pass necessary props to the DocumentEmbedding component */}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No embedding data available for visualization</p>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
        
        {/* Emotional Clusters Control */}
        <Collapsible open={isClustersOpen} onOpenChange={setIsClustersOpen} className="w-full">
          <div className="mt-8 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Emotional Clusters</h2>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  {isClustersOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <EmotionalClustersControl 
                visibleClusterCount={visibleClusterCount}
                setVisibleClusterCount={setVisibleClusterCount}
                activeTab={activeTab}
              />
            </CollapsibleContent>
          </div>
        </Collapsible>
        
        {/* Export Options Section */}
        <Collapsible open={isPdfOpen} onOpenChange={setIsPdfOpen} className="w-full">
          <div className="mt-8 bg-white p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Export Options</h2>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0">
                  {isPdfOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <PdfExport 
                sentimentData={sentimentData}
                onJournalEntryAdded={onJournalEntryAdded}
                onMonthlyReflectionAdded={onMonthlyReflectionAdded}
              />
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
    </div>
  );
};

export default AnalysisResults;
