
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Home, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Point } from "@/types/embedding";
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
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<Point[]>([]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }
    
    if (points.length > 0) {
      const results = points.filter(point => 
        point.word.toLowerCase().includes(value.toLowerCase()) ||
        (point.keywords && point.keywords.some(keyword => 
          keyword.toLowerCase().includes(value.toLowerCase())
        )) ||
        (point.emotionalTone && point.emotionalTone.toLowerCase().includes(value.toLowerCase()))
      );
      
      setSearchResults(results);
    }
  };

  const handleSearchSelect = (point: Point) => {
    if (onSearchSelect) {
      onSearchSelect(point);
    }
    setOpen(false);
  };

  return (
    <div className="absolute top-4 right-4 flex flex-col space-y-2">
      {points.length > 0 && onSearchSelect && (
        <div className="mb-2 w-52">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full flex justify-between items-center">
                <span className="truncate mr-2">Search words</span>
                <Search className="h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-52" align="end">
              <Command>
                <CommandInput 
                  placeholder="Search words or emotions..." 
                  value={searchValue}
                  onValueChange={handleSearchChange}
                />
                <CommandList>
                  <CommandEmpty>No results found</CommandEmpty>
                  <CommandGroup>
                    {searchResults.map((point) => (
                      <CommandItem
                        key={point.id}
                        onSelect={() => handleSearchSelect(point)}
                        value={point.word}
                        className="flex items-center gap-2"
                      >
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ 
                            backgroundColor: `rgb(${point.color[0] * 255}, ${point.color[1] * 255}, ${point.color[2] * 255})` 
                          }} 
                        />
                        <span>{point.word}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {point.emotionalTone}
                        </span>
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
    </div>
  );
};
