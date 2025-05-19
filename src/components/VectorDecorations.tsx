
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
    <div className={`vector-decorations absolute inset-0 z-0 pointer-events-none ${className}`}>
      {type === "home" && (
        <>
          {/* Background decorations */}
          <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-purple-100 opacity-40"></div>
          <div className="absolute top-40 right-20 w-16 h-16 rounded-full bg-green-100 opacity-40"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-20 rounded-full bg-blue-100 opacity-30"></div>
          <div className="absolute bottom-40 right-1/3 w-28 h-28 rounded-full bg-yellow-100 opacity-30"></div>
          
          {/* Illustration Images - Use inline images from Unsplash as fallback */}
          <div className="absolute top-20 right-10 md:right-20 w-44 h-44 md:w-64 md:h-64">
            <img src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&h=400" alt="Nature illustration" className="w-full h-full object-contain" />
          </div>
          
          <div className="absolute bottom-20 right-5 md:right-40 w-48 h-48 md:w-72 md:h-72">
            <img src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=400&h=400" alt="Journal illustration" className="w-full h-full object-contain" />
          </div>
          
          <div className="absolute right-1/3 top-1/2 transform -translate-y-1/2 w-20 h-20 md:w-32 md:h-32">
            <img src="https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&w=400&h=400" alt="Lifestyle illustration" className="w-full h-full object-contain" />
          </div>
          
          <div className="absolute left-10 md:left-40 top-1/2 transform -translate-y-1/3 w-40 h-40 md:w-56 md:h-56">
            <img src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&h=400" alt="Nature illustration" className="w-full h-full object-contain" />
          </div>
          
          <div className="absolute left-1/4 bottom-10 md:bottom-20 w-24 h-24 md:w-32 md:h-32">
            <img src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=400&h=400" alt="Journal illustration" className="w-full h-full object-contain" />
          </div>
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
