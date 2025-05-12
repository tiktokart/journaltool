
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
import { ChevronDown, ChevronUp } from "lucide-react";
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
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isClustersOpen, setIsClustersOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
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
    <div className="animate-fade-in">
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
      
      <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen} className="w-full">
        <div className="bg-white p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Document Summary</h2>
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
      
      <Collapsible open={isComparisonOpen} onOpenChange={setIsComparisonOpen} className="w-full">
        <div className="mt-8 mb-4 bg-white rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Word Comparison</h2>
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
      
      <div className="mt-8 mb-4">
        <TextEmotionViewer 
          pdfText={pdfText}
          embeddingPoints={sentimentData.embeddingPoints}
          sourceDescription={sentimentData.sourceDescription}
          bertAnalysis={sentimentData.bertAnalysis}
        />
      </div>
      
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
  );
};

export default AnalysisResults;
