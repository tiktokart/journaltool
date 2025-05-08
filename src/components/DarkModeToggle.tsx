
import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DarkModeToggleProps {
  className?: string;
}

const DarkModeToggle = ({ className }: DarkModeToggleProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for saved preference on component mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, []);

  const handleToggle = () => {
    const newDarkModeState = !isDarkMode;
    setIsDarkMode(newDarkModeState);
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', newDarkModeState.toString());
    
    // Apply dark mode class to document
    if (newDarkModeState) {
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
