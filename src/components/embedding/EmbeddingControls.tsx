
import { Button } from '@/components/ui/button';
import { RotateCcw, Target } from 'lucide-react';
import { ZoomControls } from './ZoomControls';
import { useLanguage } from '@/contexts/LanguageContext';
import { Point } from '@/types/embedding';

interface EmbeddingControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onResetView: () => void;
  selectedPoint: Point | null;
  isCompareMode: boolean;
  toggleCompareMode: () => void;
}

export const EmbeddingControls = ({
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onResetView,
  selectedPoint,
  isCompareMode,
  toggleCompareMode
}: EmbeddingControlsProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
      <ZoomControls 
        onZoomIn={onZoomIn} 
        onZoomOut={onZoomOut}
        onResetZoom={onResetZoom}
      />
      
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 px-2 py-1 text-xs"
        onClick={onResetView}
      >
        <RotateCcw className="h-3 w-3" />
        {t("resetView")}
      </Button>
      
      {selectedPoint && (
        <button
          onClick={toggleCompareMode}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
            isCompareMode 
              ? "bg-orange-500 text-white" 
              : "bg-muted text-foreground"
          }`}
        >
          {isCompareMode ? t("selectingComparison") : t("compareWithAnotherWord")}
        </button>
      )}
    </div>
  );
};

export default EmbeddingControls;
