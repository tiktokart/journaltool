
import React from "react";

export interface VectorDecorationsProps {
  className?: string;
  type?: string;
}

const VectorDecorations: React.FC<VectorDecorationsProps> = ({ 
  className = "", 
  type = "default" 
}) => {
  return (
    <div className={`vector-decorations absolute inset-0 z-0 pointer-events-none ${className}`}>
      {type === "home" && (
        <>
          <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-purple-100 opacity-40"></div>
          <div className="absolute top-40 right-20 w-16 h-16 rounded-full bg-green-100 opacity-40"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-20 rounded-full bg-blue-100 opacity-30"></div>
          <div className="absolute bottom-40 right-1/3 w-28 h-28 rounded-full bg-yellow-100 opacity-30"></div>
        </>
      )}
      
      {type === "default" && (
        <>
          <div className="absolute top-20 right-10 w-20 h-20 rounded-full bg-green-100 opacity-30"></div>
          <div className="absolute bottom-10 left-20 w-32 h-16 rounded-full bg-purple-100 opacity-30"></div>
        </>
      )}
    </div>
  );
};

export default VectorDecorations;
