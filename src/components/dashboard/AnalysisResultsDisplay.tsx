
import { Button } from "@/components/ui/button";
import { TextEmotionViewer } from "@/components/TextEmotionViewer";
import AnalysisResults from "@/components/dashboard/AnalysisResults";
import { Point } from "@/types/embedding";

interface AnalysisResultsDisplayProps {
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
  visibleClusterCount: number;
  handlePointClick: (point: Point | null) => void;
  handleResetVisualization: () => void;
  handleClearSearch: () => void;
  onJournalEntryAdded?: () => void;
  onMonthlyReflectionAdded?: () => void;
  connectedPoints: Point[];
  setConnectedPoints: (points: Point[]) => void;
  onSaveToJournal: () => void;
}

const AnalysisResultsDisplay = ({
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
  visibleClusterCount,
  handlePointClick,
  handleResetVisualization,
  handleClearSearch,
  onJournalEntryAdded,
  onMonthlyReflectionAdded,
  connectedPoints,
  setConnectedPoints,
  onSaveToJournal
}: AnalysisResultsDisplayProps) => {
  if (!sentimentData) return null;
  
  return (
    <>
      <div className="mt-8">
        <TextEmotionViewer 
          pdfText={sentimentData.pdfText || pdfText}
          embeddingPoints={sentimentData.embeddingPoints}
          bertAnalysis={sentimentData.bertAnalysis}
        />
      </div>
      
      <div className="mt-8">
        <AnalysisResults
          sentimentData={sentimentData}
          pdfText={pdfText}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedPoint={selectedPoint}
          setSelectedPoint={setSelectedPoint}
          selectedWord={selectedWord}
          setSelectedWord={setSelectedWord}
          filteredPoints={filteredPoints}
          setFilteredPoints={setFilteredPoints}
          uniqueWords={uniqueWords}
          visibleClusterCount={visibleClusterCount}
          handlePointClick={handlePointClick}
          handleResetVisualization={handleResetVisualization}
          handleClearSearch={handleClearSearch}
          onJournalEntryAdded={onJournalEntryAdded}
          onMonthlyReflectionAdded={onMonthlyReflectionAdded}
          connectedPoints={connectedPoints}
          setConnectedPoints={setConnectedPoints}
        />
      </div>
      
      <div className="mt-8">
        <Button 
          onClick={onSaveToJournal}
          className="bg-green-600 hover:bg-green-700"
        >
          Save to Journal Entries
        </Button>
      </div>
    </>
  );
};

export default AnalysisResultsDisplay;
