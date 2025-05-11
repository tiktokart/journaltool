
import React from 'react';

interface VectorProps {
  className?: string;
}

export const CircleDecoration: React.FC<VectorProps> = ({ className }) => {
  return (
    <div className={`vector-decoration vector-circle ${className}`}></div>
  );
};

export const WaveDecoration: React.FC<VectorProps> = ({ className }) => {
  return (
    <div className={`vector-decoration vector-wave ${className}`}></div>
  );
};

export const TriangleDecoration: React.FC<VectorProps> = ({ className }) => {
  return (
    <svg 
      className={`vector-decoration ${className}`} 
      width="120" 
      height="120" 
      viewBox="0 0 120 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M60 10L110 100H10L60 10Z" 
        fill="url(#triangle-gradient)" 
        fillOpacity="0.15"
      />
      <defs>
        <linearGradient 
          id="triangle-gradient" 
          x1="60" 
          y1="10" 
          x2="60" 
          y2="100" 
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8BC34A" />
          <stop offset="1" stopColor="#4CAF50" stopOpacity="0.5" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const LeafDecoration: React.FC<VectorProps> = ({ className }) => {
  return (
    <svg 
      className={`vector-decoration ${className}`}
      width="100" 
      height="100" 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M80 20C65 20 20 35 20 80C20 80 35 65 80 65C80 65 95 50 80 20Z" 
        fill="url(#leaf-gradient)" 
        fillOpacity="0.2"
      />
      <defs>
        <linearGradient 
          id="leaf-gradient" 
          x1="20" 
          y1="80" 
          x2="80" 
          y2="20" 
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4CAF50" />
          <stop offset="1" stopColor="#8BC34A" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const BubbleDecoration: React.FC<VectorProps> = ({ className }) => {
  return (
    <div className="vector-decoration" style={{ pointerEvents: 'none' }}>
      <div className={`relative ${className}`}>
        <div className="absolute rounded-full bg-lime-100 opacity-20 w-6 h-6"></div>
        <div className="absolute rounded-full bg-lime-200 opacity-15 w-4 h-4 -top-8 left-6"></div>
        <div className="absolute rounded-full bg-green-100 opacity-20 w-8 h-8 top-2 left-10"></div>
        <div className="absolute rounded-full bg-green-200 opacity-15 w-5 h-5 top-6 left-4"></div>
      </div>
    </div>
  );
};

export const ArrowButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { direction?: 'right' | 'left' | 'up' | 'down' }> = ({ 
  children, 
  direction = 'right',
  className,
  ...props 
}) => {
  const getArrow = () => {
    switch (direction) {
      case 'left':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 5M5 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'up':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'down':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  return (
    <button className={`arrow-button ${className || ''}`} {...props}>
      {children}
      {getArrow()}
    </button>
  );
};
