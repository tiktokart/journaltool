
import React from "react";

interface VectorDecorationsProps {
  type?: "home" | "dashboard";
  className?: string;
}

const VectorDecorations: React.FC<VectorDecorationsProps> = ({ 
  type = "dashboard", 
  className = "" 
}) => {
  if (type === "home") {
    return (
      <div className={`${className} relative w-full h-full overflow-hidden`}>
        {/* Top left decoration */}
        <div className="vector-circle absolute top-10 left-10 w-64 h-64 bg-green-100 opacity-40" />
        
        {/* Top right wave */}
        <div className="vector-wave absolute top-0 right-0 w-96 h-64">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path 
              fill="#F2FCE2" 
              d="M48.2,-59.2C62.6,-51.4,74.9,-36.8,77.5,-20.8C80.1,-4.7,73,12.8,63.7,27.8C54.4,42.9,43,55.5,28.7,63.1C14.5,70.7,-2.5,73.2,-19.2,69.5C-35.9,65.9,-52.3,56.1,-62.9,41.3C-73.5,26.6,-78.3,6.9,-74.5,-10.8C-70.6,-28.6,-58.2,-44.3,-43.2,-52C-28.3,-59.7,-10.9,-59.4,4.7,-65.1C20.2,-70.8,38.7,-82.5,48.2,-59.2Z" 
              transform="translate(100 100)" 
            />
          </svg>
        </div>
        
        {/* Bottom left shape */}
        <div className="vector-shape absolute bottom-10 left-20">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="60" fill="#e8f7d9" />
            <circle cx="60" cy="60" r="45" stroke="#4CAF50" strokeWidth="2" fill="none" />
            <circle cx="60" cy="60" r="30" fill="#F2FCE2" />
          </svg>
        </div>
        
        {/* Bottom right decoration */}
        <div className="vector-wave absolute bottom-0 right-20">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-64 h-64">
            <path 
              fill="#4CAF5050" 
              d="M34.6,-47.5C47.3,-35.7,61.8,-28.2,65.4,-17.2C69,-6.2,61.8,8.3,54,21.3C46.1,34.3,37.7,45.8,26.4,51.9C15.1,57.9,0.9,58.6,-12.9,56.1C-26.8,53.7,-40.4,48.1,-49.4,37.9C-58.3,27.6,-62.6,12.7,-63,-2.7C-63.5,-18.2,-60.1,-34.3,-50.4,-46.4C-40.7,-58.5,-24.8,-66.7,-9.9,-65.9C5,-65,17.9,-55.3,34.6,-47.5Z" 
              transform="translate(100 100)" 
            />
          </svg>
        </div>
      </div>
    );
  }
  
  // Dashboard decorations
  return (
    <div className={`${className} relative w-full h-full overflow-hidden`}>
      {/* Top right decoration */}
      <div className="vector-shape absolute top-5 right-5">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="40" fill="#F2FCE230" />
          <circle cx="40" cy="40" r="25" fill="#4CAF5020" />
        </svg>
      </div>
      
      {/* Bottom left wave */}
      <div className="vector-wave absolute -bottom-20 -left-20">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-80 h-80 opacity-30">
          <path 
            fill="#4CAF50" 
            d="M48.2,-59.2C62.6,-51.4,74.9,-36.8,77.5,-20.8C80.1,-4.7,73,12.8,63.7,27.8C54.4,42.9,43,55.5,28.7,63.1C14.5,70.7,-2.5,73.2,-19.2,69.5C-35.9,65.9,-52.3,56.1,-62.9,41.3C-73.5,26.6,-78.3,6.9,-74.5,-10.8C-70.6,-28.6,-58.2,-44.3,-43.2,-52C-28.3,-59.7,-10.9,-59.4,4.7,-65.1C20.2,-70.8,38.7,-82.5,48.2,-59.2Z" 
            transform="translate(100 100)" 
          />
        </svg>
      </div>
      
      {/* Small decorations */}
      <div className="vector-circle absolute top-1/4 left-10 w-16 h-16 bg-green-100 opacity-30 rounded-full"></div>
      <div className="vector-circle absolute bottom-1/3 right-1/4 w-24 h-24 bg-green-50 opacity-40 rounded-full"></div>
    </div>
  );
};

export default VectorDecorations;
