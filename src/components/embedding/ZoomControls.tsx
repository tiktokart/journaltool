
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Home, MousePointer, Search } from "lucide-react";
import { Point } from "@/types/embedding";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom?: () => void;
  onSearchSelect?: (point: Point) => void;
  points?: Point[];
}

export const ZoomControls = ({ 
  onZoomIn, 
  onZoomOut, 
  onResetZoom,
  onSearchSelect,
  points = []
}: ZoomControlsProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Point[]>([]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = points.filter(point => 
      point.word.toLowerCase().includes(value.toLowerCase()) ||
      (point.keywords && point.keywords.some(keyword => 
        keyword.toLowerCase().includes(value.toLowerCase())
      )) ||
      (point.emotionalTone && point.emotionalTone.toLowerCase().includes(value.toLowerCase()))
    );
    
    setSearchResults(results);
  };
  
  const handleSearchSelect = (point: Point) => {
    if (onSearchSelect) {
      onSearchSelect(point);
      setOpen(false);
    }
  };

  return (
    <div className="absolute bottom-4 left-4 flex flex-col space-y-2">
      {points && points.length > 0 && onSearchSelect && (
        <div className="mb-2 w-[200px]">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div className="relative w-full">
                <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search words..." 
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-7 h-8 text-xs bg-background/80 backdrop-blur-sm"
                  onClick={() => {
                    setOpen(true);
                    if (searchValue.trim()) {
                      handleSearchChange(searchValue);
                    }
                  }}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[200px]" align="start">
              <Command>
                <CommandInput 
                  placeholder="Search..." 
                  value={searchValue}
                  onValueChange={handleSearchChange}
                  className="h-8 text-xs"
                />
                <CommandList className="max-h-[200px]">
                  <CommandEmpty>No results found</CommandEmpty>
                  <CommandGroup>
                    {searchResults.map((point) => (
                      <CommandItem
                        key={point.id}
                        onSelect={() => handleSearchSelect(point)}
                        value={point.word}
                        className="flex items-center gap-2 text-xs py-1"
                      >
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0" 
                          style={{ 
                            backgroundColor: `rgb(${point.color[0] * 255}, ${point.color[1] * 255}, ${point.color[2] * 255})` 
                          }} 
                        />
                        <span>{point.word}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={onZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom In</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={onZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Zoom Out</TooltipContent>
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
            <TooltipContent>Reset View</TooltipContent>
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
            <p>Hold middle mouse button and move to pan left/right</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
