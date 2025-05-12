
import { useEffect, useRef } from 'react';

export interface ScrollToSectionProps {
  isOpen: boolean;
  elementId: string;
}

export const ScrollToSection = ({ isOpen, elementId }: ScrollToSectionProps) => {
  const hasScrolled = useRef(false);

  useEffect(() => {
    if (isOpen && !hasScrolled.current) {
      const element = document.getElementById(elementId);
      if (element) {
        setTimeout(() => {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
          hasScrolled.current = true;
        }, 100);
      }
    } else if (!isOpen) {
      hasScrolled.current = false;
    }
  }, [isOpen, elementId]);

  return null;
};

