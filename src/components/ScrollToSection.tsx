
import { useEffect, useRef } from 'react';

interface ScrollToSectionProps {
  isOpen: boolean;
  elementId: string;
  offset?: number;
}

export const ScrollToSection = ({ isOpen, elementId, offset = 80 }: ScrollToSectionProps) => {
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip on first render to avoid unwanted scrolling when component mounts
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (isOpen) {
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }, 100); // Small delay to ensure content is visible
    }
  }, [isOpen, elementId, offset]);

  return null;
};

export default ScrollToSection;
