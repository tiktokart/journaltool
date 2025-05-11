
import { FileInfoDisplay } from "@/components/FileInfoDisplay";
import { ViewDetailedAnalysis } from "@/components/ViewDetailedAnalysis";
import { AnalysisTabs } from "@/components/AnalysisTabs";
import { EmotionalClustersControl } from "@/components/EmotionalClustersControl";
import { WordComparisonController } from "@/components/WordComparisonController";
import { TextEmotionViewer } from "@/components/TextEmotionViewer";
import { WellbeingResources } from "@/components/WellbeingResources";
import { PdfExport } from "@/components/PdfExport";
import { Point } from "@/types/embedding";

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
      <div className="bg-white p-4 rounded-lg mb-4">
        <FileInfoDisplay 
          fileName={sentimentData.fileName}
          fileSize={sentimentData.fileSize}
          wordCount={sentimentData.wordCount}
        />
      </div>
      
      <div className="bg-white p-4 rounded-lg mb-4">
        <ViewDetailedAnalysis 
          summary={sentimentData.summary} 
          text={sentimentData.text || sentimentData.pdfText}
          wordCount={sentimentData.wordCount}
          sourceDescription={sentimentData.sourceDescription}
        />
      </div>
      
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
      
      <div className="mt-8 mb-4">
        <EmotionalClustersControl 
          visibleClusterCount={visibleClusterCount}
          setVisibleClusterCount={setVisibleClusterCount}
          activeTab={activeTab}
        />
      </div>
      
      <div className="mt-8 mb-4 bg-white rounded-lg p-4">
        <WordComparisonController 
          points={sentimentData.embeddingPoints}
          selectedPoint={selectedPoint}
          sourceDescription={sentimentData.sourceDescription}
          calculateRelationship={calculateRelationship}
        />
      </div>
      
      <div className="mt-8 mb-4 bg-white rounded-lg p-4">
        <TextEmotionViewer 
          pdfText={pdfText}
          embeddingPoints={sentimentData.embeddingPoints}
          sourceDescription={sentimentData.sourceDescription}
          bertAnalysis={sentimentData.bertAnalysis}
        />
      </div>
      
      <div className="mt-8 mb-4 bg-white rounded-lg p-4">
        <WellbeingResources 
          embeddingPoints={sentimentData.embeddingPoints}
          sourceDescription={sentimentData.sourceDescription}
        />
      </div>
      
      <div className="mt-8 bg-white p-4 rounded-lg">
        <PdfExport 
          sentimentData={sentimentData}
          onJournalEntryAdded={onJournalEntryAdded}
          onMonthlyReflectionAdded={onMonthlyReflectionAdded}
        />
      </div>
    </div>
  );
};

export default AnalysisResults;
