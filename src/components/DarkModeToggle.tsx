
import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DarkModeToggleProps {
  className?: string;
}

const DarkModeToggle = ({ className }: DarkModeToggleProps) => {
  const [isGrayMode, setIsGrayMode] = useState(false);

  // Check for saved preference on component mount
  useEffect(() => {
    const savedGrayMode = localStorage.getItem('grayMode') === 'true';
    setIsGrayMode(savedGrayMode);
    if (savedGrayMode) {
      document.documentElement.classList.add('gray-mode');
    } else {
      document.documentElement.classList.remove('gray-mode');
    }
  }, []);

  const handleToggle = () => {
    const newGrayModeState = !isGrayMode;
    setIsGrayMode(newGrayModeState);
    
    // Save preference to localStorage
    localStorage.setItem('grayMode', newGrayModeState.toString());
    
    // Apply gray mode class to document
    if (newGrayModeState) {
      document.documentElement.classList.add('gray-mode');
    } else {
      document.documentElement.classList.remove('gray-mode');
    }
  };

  return (
    <div className={cn("relative flex items-center space-x-2", className)}>
      <Sun className="h-4 w-4 text-black" />
      <div className="relative">
        <Switch 
          checked={isGrayMode} 
          onCheckedChange={handleToggle}
          className="bg-gradient-to-r from-yellow to-orange data-[state=checked]:bg-[#C8C8C9]"
        />
        {isGrayMode && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="wave wave1"></div>
            <div className="wave wave2"></div>
            <div className="wave wave3"></div>
          </div>
        )}
      </div>
      <Moon className="h-4 w-4 text-black" />
    </div>
  );
};

export default DarkModeToggle;
