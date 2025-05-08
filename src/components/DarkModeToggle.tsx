
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DarkModeToggleProps {
  className?: string;
}

const DarkModeToggle = ({ className }: DarkModeToggleProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleToggle = () => {
    setIsDarkMode(!isDarkMode);
    // Apply dark mode class to document for future implementation of actual dark mode
    if (!isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  };

  return (
    <div className={cn("relative flex items-center space-x-2", className)}>
      <Sun className="h-4 w-4 text-black" />
      <div className="relative">
        <Switch 
          checked={isDarkMode} 
          onCheckedChange={handleToggle}
          className="bg-gradient-to-r from-yellow to-orange data-[state=checked]:bg-[#1A1F2C]"
        />
        {isDarkMode && (
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
