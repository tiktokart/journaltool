
import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface BubbleData {
  id: string;
  text: string;
  date: string;
  size: number;
  x: number;
  y: number;
  color: string;
  speedX: number;
  speedY: number;
}

interface FloatingBubblesProps {
  entries: Array<{
    id: string;
    text: string;
    date: string;
  }>;
  onBubblePop: (id: string) => void;
}

const FloatingBubbles: React.FC<FloatingBubblesProps> = ({ entries, onBubblePop }) => {
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  // Create bubbles from entries data
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      setContainerDimensions({ width: containerRect.width, height: containerRect.height });

      // Create bubbles data from entries
      const newBubbles = entries.map(entry => {
        const wordCount = entry.text.split(/\s+/).filter(Boolean).length;
        // Size is based on word count (min 40px, max 120px)
        const size = Math.min(Math.max(40, wordCount / 5), 120);

        // Random position within container bounds
        const x = Math.random() * (containerRect.width - size);
        const y = Math.random() * (containerRect.height - size);

        // Generate a pastel color with some transparency
        const hue = Math.random() * 360;
        const color = `hsla(${hue}, 70%, 80%, 0.7)`;

        // Random gentle speed
        const speedX = (Math.random() - 0.5) * 0.5;
        const speedY = (Math.random() - 0.5) * 0.5;

        return {
          id: entry.id,
          text: entry.text,
          date: entry.date,
          size,
          x,
          y,
          color,
          speedX,
          speedY
        };
      });

      setBubbles(newBubbles);
    }
  }, [entries]);

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        setContainerDimensions({ 
          width: containerRect.width, 
          height: containerRect.height 
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Animate bubbles
  useEffect(() => {
    if (!containerDimensions.width || !containerDimensions.height) return;

    const animateBubbles = () => {
      setBubbles(prevBubbles => 
        prevBubbles.map(bubble => {
          let newX = bubble.x + bubble.speedX;
          let newY = bubble.y + bubble.speedY;
          let newSpeedX = bubble.speedX;
          let newSpeedY = bubble.speedY;

          // Bounce off walls
          if (newX <= 0 || newX >= containerDimensions.width - bubble.size) {
            newSpeedX = -newSpeedX;
            newX = Math.max(0, Math.min(newX, containerDimensions.width - bubble.size));
          }
          if (newY <= 0 || newY >= containerDimensions.height - bubble.size) {
            newSpeedY = -newSpeedY;
            newY = Math.max(0, Math.min(newY, containerDimensions.height - bubble.size));
          }

          return {
            ...bubble,
            x: newX,
            y: newY,
            speedX: newSpeedX,
            speedY: newSpeedY
          };
        })
      );

      animationRef.current = requestAnimationFrame(animateBubbles);
    };

    animationRef.current = requestAnimationFrame(animateBubbles);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [containerDimensions]);

  // Handle bubble click/pop
  const handleBubblePop = (id: string) => {
    // Play pop sound effect
    const popSound = new Audio('/pop.mp3');
    popSound.volume = 0.3;
    popSound.play().catch(err => console.log('Audio play failed:', err));
    
    toast.success("Journal entry resolved");
    onBubblePop(id);
    
    // Remove the bubble with a popping animation
    setBubbles(prevBubbles => prevBubbles.filter(bubble => bubble.id !== id));
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full overflow-hidden bg-gradient-to-b from-purple-50 to-white rounded-lg"
    >
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute flex items-center justify-center rounded-full cursor-pointer select-none"
          style={{
            left: bubble.x,
            top: bubble.y,
            width: bubble.size,
            height: bubble.size,
            backgroundColor: bubble.color,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            backdropFilter: "blur(2px)",
            border: "1px solid rgba(255,255,255,0.5)"
          }}
          onClick={() => handleBubblePop(bubble.id)}
        >
          <div className="absolute inset-0 rounded-full opacity-20 overflow-hidden">
            <div
              className="absolute top-1/4 left-1/4 w-1/5 h-1/5 rounded-full bg-white opacity-70"
            />
            <div
              className="absolute top-1/3 left-1/3 w-1/12 h-1/12 rounded-full bg-white opacity-90"
            />
          </div>
          <p className="text-xs text-center p-1 max-w-full truncate text-purple-900 font-medium">
            {bubble.text.length > 20 ? bubble.text.substring(0, 20) + '...' : bubble.text}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingBubbles;
