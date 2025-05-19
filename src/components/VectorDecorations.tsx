
import React from "react";

export interface VectorDecorationsProps {
  className?: string;
  type?: "default" | "home" | "dashboard";
}

const VectorDecorations: React.FC<VectorDecorationsProps> = ({ 
  className = "", 
  type = "default" 
}) => {
  return (
    <div className={`vector-decorations absolute inset-0 z-0 pointer-events-none overflow-hidden ${className}`}>
      {type === "home" && (
        <>
          {/* Background shapes */}
          <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-purple-100 opacity-40"></div>
          <div className="absolute top-40 right-20 w-16 h-16 rounded-full bg-green-100 opacity-40"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-20 rounded-full bg-blue-100 opacity-30"></div>
          <div className="absolute bottom-40 right-1/3 w-28 h-28 rounded-full bg-yellow-100 opacity-30"></div>
          
          {/* Illustrations */}
          <img 
            src="/illustrations/couple-hearts.png" 
            alt="" 
            className="absolute top-20 right-[5%] w-64 h-auto transform -rotate-6 opacity-90 animate-float"
            style={{animationDelay: '0.5s'}}
          />
          
          <img 
            src="/illustrations/couple-hugging.png" 
            alt="" 
            className="absolute bottom-40 left-[8%] w-56 h-auto transform rotate-3 opacity-90 animate-float"
            style={{animationDelay: '0s'}}
          />
          
          <img 
            src="/illustrations/music-notes.png" 
            alt="" 
            className="absolute top-1/3 left-[15%] w-20 h-auto transform rotate-12 opacity-80 animate-float"
            style={{animationDelay: '1.5s'}}
          />
          
          <img 
            src="/illustrations/journal.png" 
            alt="" 
            className="absolute bottom-20 right-[12%] w-40 h-auto transform -rotate-6 opacity-90 animate-float"
            style={{animationDelay: '1s'}}
          />
          
          <img 
            src="/illustrations/plant.png" 
            alt="" 
            className="absolute top-[60%] right-[20%] w-28 h-auto opacity-90 animate-float"
            style={{animationDelay: '2s'}}
          />
        </>
      )}
      
      {type === "default" && (
        <>
          <div className="absolute top-20 right-10 w-20 h-20 rounded-full bg-green-100 opacity-30"></div>
          <div className="absolute bottom-10 left-20 w-32 h-16 rounded-full bg-purple-100 opacity-30"></div>
        </>
      )}
      
      {type === "dashboard" && (
        <>
          <div className="absolute top-5 right-5 w-32 h-32 rounded-full bg-blue-100 opacity-20"></div>
          <div className="absolute bottom-20 left-10 w-24 h-24 rounded-full bg-green-100 opacity-20"></div>
          <div className="absolute top-40 left-1/3 w-20 h-20 rounded-full bg-yellow-100 opacity-20"></div>
        </>
      )}
    </div>
  );
};

export default VectorDecorations;
