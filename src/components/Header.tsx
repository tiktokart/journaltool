
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GitCompareArrows, Home, LayoutDashboard } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto max-w-7xl flex items-center justify-between h-16 px-4">
        <Link to="/" className="font-semibold text-xl">
          Document Analyzer
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center"
          >
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
          <Link 
            to="/dashboard" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center"
          >
            <LayoutDashboard className="h-4 w-4 mr-1" />
            Dashboard
          </Link>
          <Link 
            to="/comparison" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center"
          >
            <GitCompareArrows className="h-4 w-4 mr-1" />
            Word Comparison
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard">Analyze Document</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
