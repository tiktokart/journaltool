
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Home, MousePointer, SplitSquareVertical } from "lucide-react";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MutableRefObject } from "react";

export interface ZoomControlsProps {
  cameraRef: MutableRefObject<THREE.PerspectiveCamera | null>;
  controlsRef: MutableRefObject<OrbitControls | null>;
  isCompareMode?: boolean;
  onToggleCompare?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
}

export const ZoomControls = ({ 
  cameraRef,
  controlsRef,
  isCompareMode = false,
  onToggleCompare,
  onZoomIn: externalZoomIn, 
  onZoomOut: externalZoomOut, 
  onResetZoom: externalResetZoom
}: ZoomControlsProps) => {
  
  const handleZoomIn = () => {
    if (externalZoomIn) {
      externalZoomIn();
    } else if (cameraRef.current) {
      // Default zoom in behavior
      const camera = cameraRef.current;
      const targetZ = Math.max(camera.position.z - 2, 1);
      camera.position.z = targetZ;
    }
  };

  const handleZoomOut = () => {
    if (externalZoomOut) {
      externalZoomOut();
    } else if (cameraRef.current) {
      // Default zoom out behavior
      const camera = cameraRef.current;
      const targetZ = Math.min(camera.position.z + 2, 30);
      camera.position.z = targetZ;
    }
  };

  const handleResetZoom = () => {
    if (externalResetZoom) {
      externalResetZoom();
    } else if (cameraRef.current && controlsRef.current) {
      // Default reset behavior
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      camera.position.set(0, 0, 15);
      controls.target.set(0, 0, 0);
      controls.update();
    }
  };

  return (
    <div className="absolute bottom-4 left-4 flex flex-col space-y-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom In</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom Out</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={handleResetZoom}>
              <Home className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reset View</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {onToggleCompare && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={isCompareMode ? "secondary" : "outline"} 
                size="icon" 
                onClick={onToggleCompare}
                className={isCompareMode ? "border-primary" : ""}
              >
                <SplitSquareVertical className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Compare Mode</TooltipContent>
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
            <p>Hold middle mouse button and move to pan in any direction</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ZoomControls;
