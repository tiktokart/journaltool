
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">Journal Analysis</span>
          </div>
          
          <div className="flex space-x-6">
            <Link to="/" className="text-gray-400 hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/dashboard" className="text-gray-400 hover:text-primary transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Journal Analysis. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
