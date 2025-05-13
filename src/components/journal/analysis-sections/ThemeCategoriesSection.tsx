
import React from 'react';
import { ChevronUp, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../../ui/collapsible";

interface ThemeCategory {
  name: string;
  words: string[];
  color: string;
}

interface ThemeCategoriesSectionProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  themeCategories: ThemeCategory[];
  isAnalyzing: boolean;
}

const ThemeCategoriesSection: React.FC<ThemeCategoriesSectionProps> = ({
  isOpen,
  setIsOpen,
  themeCategories,
  isAnalyzing
}) => {
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4 border rounded-lg overflow-hidden">
      <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
        <h3 className="text-lg font-medium font-pacifico">Theme Categories</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 bg-white">
        {themeCategories.length > 0 ? (
          <div className="space-y-4">
            {themeCategories.map((theme, index) => (
              <div key={index} className="border rounded-lg p-3" style={{ borderColor: theme.color }}>
                <h4 className="font-medium mb-2 flex items-center">
                  <span 
                    className="inline-block w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: theme.color }}
                  ></span>
                  {theme.name}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {theme.words.map((word, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-1 rounded-full text-xs"
                      style={{ 
                        backgroundColor: `${theme.color}22`,
                        color: theme.color,
                        border: `1px solid ${theme.color}`
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            {isAnalyzing ? (
              <p>Analyzing themes...</p>
            ) : (
              <p>No theme categories extracted</p>
            )}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ThemeCategoriesSection;
