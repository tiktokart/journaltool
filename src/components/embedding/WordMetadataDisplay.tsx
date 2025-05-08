
import { CircleDot, Filter, RotateCcw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WordMetadataDisplayProps {
  wordCount?: number;
  displayPointsLength: number;
  filterApplied: boolean;
  selectedEmotionalGroup: string | null;
  resetEmotionalGroupFilter: () => void;
  sourceDescription?: string;
}

export const WordMetadataDisplay = ({
  wordCount,
  displayPointsLength,
  filterApplied,
  selectedEmotionalGroup,
  resetEmotionalGroupFilter,
  sourceDescription
}: WordMetadataDisplayProps) => {
  return (
    <>
      <div className="absolute top-3 right-4 z-10 text-sm font-normal flex items-center text-muted-foreground bg-card/80 backdrop-blur-sm px-2 py-1 rounded-md">
        <CircleDot className="h-4 w-4 mr-2" />
        <span>
          {wordCount ? 
            `Showing Words: ${wordCount}` : 
            `Showing Words: ${displayPointsLength}`
          }
        </span>
      </div>
      
      {filterApplied && (
        <div className="absolute top-3 left-4 z-10 flex items-center text-sm font-normal bg-card/80 backdrop-blur-sm px-2 py-1 rounded-md">
          <Filter className="h-4 w-4 mr-2 text-primary" />
          <span>Filtered: {selectedEmotionalGroup}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 ml-2"
            onClick={resetEmotionalGroupFilter}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      {sourceDescription && (
        <div className="absolute bottom-4 right-4 z-10 flex items-center text-xs bg-card/80 backdrop-blur-sm px-2 py-1 rounded-md text-muted-foreground">
          <Info className="h-3.5 w-3.5 mr-1" />
          {sourceDescription}
        </div>
      )}
    </>
  );
};

export default WordMetadataDisplay;
