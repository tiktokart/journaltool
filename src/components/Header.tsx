
import { Link } from "react-router-dom";
import { Menu, X, Globe, Flower } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import DarkModeToggle from "./DarkModeToggle";

// Supported languages with their display names
const LANGUAGES = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  zh: "中文",
};

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    console.log(`Language changed to: ${lang}`);
  };

  return (
    <header className="border-b border-border bg-yellow backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Flower className="h-6 w-6 text-purple animate-bounce" />
            <span className="font-bold text-xl text-black">Journal Analysis</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex items-center space-x-8">
              <Link to="/" className="text-black hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/dashboard" className="text-black hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <DarkModeToggle />
            </nav>
            
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-black hover:text-foreground transition-colors">
                <Globe className="h-5 w-5 mr-1" />
                <span className="text-sm">{LANGUAGES[language as keyof typeof LANGUAGES]}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border border-border">
                {Object.entries(LANGUAGES).map(([code, name]) => (
                  <DropdownMenuItem 
                    key={code}
                    onClick={() => handleLanguageChange(code)}
                    className={language === code ? "bg-accent/50" : ""}
                  >
                    {name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-black" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-black hover:text-foreground transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/dashboard" 
                className="text-black hover:text-foreground transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              
              {/* Dark Mode Toggle in Mobile Menu */}
              <div className="py-2">
                <DarkModeToggle />
              </div>
              
              {/* Mobile Language Selector */}
              <div className="border-t border-border pt-4 mt-2">
                <p className="text-sm text-black mb-2">
                  {t("selectLanguage")}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(LANGUAGES).map(([code, name]) => (
                    <button
                      key={code}
                      onClick={() => {
                        handleLanguageChange(code);
                        setIsMenuOpen(false);
                      }}
                      className={`py-2 px-3 text-sm rounded-md transition-colors ${
                        language === code 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-accent/50"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
