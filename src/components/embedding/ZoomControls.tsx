
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Home, MousePointer } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom?: () => void;
}

export const ZoomControls = ({ 
  onZoomIn, 
  onZoomOut, 
  onResetZoom
}: ZoomControlsProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="absolute bottom-4 left-4 flex flex-col space-y-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={onZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("zoomIn")}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={onZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("zoomOut")}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {onResetZoom && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={onResetZoom}>
                <Home className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("resetView")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-secondary/50 backdrop-blur-sm border border-border rounded-md p-2 flex items-center justify-center">
              <MousePointer className="h-4 w-4 text-foreground/80" />
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-[200px]">
            <p>{t("holdMiddleMouseButton")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
