
import React from 'react';

interface VectorDecorationsProps {
  className?: string;
}

const VectorDecorations: React.FC<VectorDecorationsProps> = ({ className = '' }) => {
  return (
    <div className={`${className} select-none`}>
      {/* Top-left decoration */}
      <svg
        width="180"
        height="180"
        viewBox="0 0 180 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-purple-200"
      >
        <circle cx="90" cy="90" r="90" fill="currentColor" fillOpacity="0.2" />
        <path
          d="M150 90C150 123.137 123.137 150 90 150C56.8629 150 30 123.137 30 90C30 56.8629 56.8629 30 90 30C123.137 30 150 56.8629 150 90Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
      </svg>

      {/* Top-right decoration */}
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-10 right-10 text-purple-300"
      >
        <path
          d="M32 64C49.6731 64 64 49.6731 64 32C64 14.3269 49.6731 0 32 0C14.3269 0 0 14.3269 0 32C0 49.6731 14.3269 64 32 64Z"
          fill="currentColor"
          fillOpacity="0.2"
        />
        <path
          d="M56 32C56 45.2548 45.2548 56 32 56C18.7452 56 8 45.2548 8 32C8 18.7452 18.7452 8 32 8C45.2548 8 56 18.7452 56 32Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>

      {/* Middle wave decoration */}
      <svg
        width="100%"
        height="48"
        viewBox="0 0 1440 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-1/3 -translate-y-1/2"
        preserveAspectRatio="none"
      >
        <path
          d="M0 48H1440V0C1200 32 960 16 720 8C480 0 240 16 0 0V48Z"
          fill="url(#paint0_linear)"
          fillOpacity="0.1"
        />
        <defs>
          <linearGradient
            id="paint0_linear"
            x1="720"
            y1="0"
            x2="720"
            y2="48"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#9b87f5" />
            <stop offset="1" stopColor="#9b87f5" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Bottom-right decoration */}
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 text-purple-200"
      >
        <path
          d="M120 60C120 93.1371 93.1371 120 60 120C26.8629 120 0 93.1371 0 60C0 26.8629 26.8629 0 60 0C93.1371 0 120 26.8629 120 60Z"
          fill="currentColor"
          fillOpacity="0.2"
        />
        <path
          d="M96 60C96 80.9868 78.9868 98 58 98C37.0132 98 20 80.9868 20 60C20 39.0132 37.0132 22 58 22C78.9868 22 96 39.0132 96 60Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>

      {/* Scattered dots decoration */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-purple-300 opacity-20"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* BetterHelp-inspired illustrations */}
      <div className="absolute bottom-10 left-10 opacity-20">
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M60 110C87.6142 110 110 87.6142 110 60C110 32.3858 87.6142 10 60 10C32.3858 10 10 32.3858 10 60C10 87.6142 32.3858 110 60 110Z"
            fill="#9b87f5"
            fillOpacity="0.2"
          />
          <path
            d="M45 45C45 40.5817 48.5817 37 53 37H67C71.4183 37 75 40.5817 75 45V75C75 79.4183 71.4183 83 67 83H53C48.5817 83 45 79.4183 45 75V45Z"
            stroke="#9b87f5"
            strokeWidth="2"
          />
          <path
            d="M50 50H70M50 60H65M50 70H60"
            stroke="#9b87f5"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};

export default VectorDecorations;
