
interface TimelineEvent {
  time: string;
  event: string;
  sentiment?: number;
  page?: number;
  score?: number;
  color?: string;
}

/**
 * Generates a timeline from the document text
 * @param text The document text to analyze
 * @returns Array of timeline events extracted from the text
 */
export const generateTimeline = async (text: string): Promise<TimelineEvent[]> => {
  try {
    console.log("Generating timeline from text:", text.substring(0, 100) + "...");
    
    // Split text into paragraphs
    const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
    
    // If text is short, split into sentences instead
    const textUnits = paragraphs.length > 3 ? paragraphs : 
      text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Generate timeline events from text units
    const timeline: TimelineEvent[] = [];
    
    // Time expressions to look for
    const timeExpressions = [
      'first', 'initially', 'then', 'after', 'before', 'during', 'finally', 
      'later', 'next', 'previously', 'subsequently', 'yesterday', 'today', 
      'tomorrow', 'morning', 'afternoon', 'evening', 'night'
    ];
    
    // Color mapping for emotional tones - more distinctive colors
    const getColorForSentiment = (score: number): string => {
      if (score >= 0.7) return "#27AE60"; // Positive - Green
      if (score >= 0.6) return "#3498DB"; // Neutral-positive - Blue
      if (score >= 0.4) return "#F39C12"; // Neutral - Orange
      if (score >= 0.3) return "#E67E22"; // Neutral-negative - Dark Orange
      return "#E74C3C"; // Negative - Red
    };
    
    textUnits.forEach((unit, index) => {
      // Look for time expressions in the text
      const hasTimeExpression = timeExpressions.some(expr => 
        unit.toLowerCase().includes(expr)
      );
      
      // Only add to timeline if it has a time expression or it's a key paragraph
      if (hasTimeExpression || index === 0 || index === textUnits.length - 1 || index % 3 === 0) {
        // Extract a suitable event description (first 50 chars or so)
        const event = unit.length > 50 ? unit.substring(0, 50) + '...' : unit;
        
        // Generate random sentiment between 0.3 and 0.8
        const sentiment = 0.3 + (Math.random() * 0.5);
        
        // For compatibility with visualization components
        const page = index + 1;
        const score = sentiment;
        
        // Add color based on sentiment score
        const color = getColorForSentiment(sentiment);
        
        timeline.push({
          time: `Point ${index + 1}`, // For text display
          page, // For visualization (x-axis)
          score, // For visualization (y-axis)
          event: event.trim(),
          sentiment,
          color // Add color property for visualization
        });
      }
    });
    
    // Ensure we have at least a few events
    if (timeline.length < 3) {
      return [
        { 
          time: "Beginning", 
          page: 1, 
          score: 0.65, 
          event: "Starting point of the narrative", 
          sentiment: 0.65,
          color: getColorForSentiment(0.65)
        },
        { 
          time: "Middle", 
          page: 2, 
          score: 0.45, 
          event: "Development of key themes and emotions", 
          sentiment: 0.45,
          color: getColorForSentiment(0.45)
        },
        { 
          time: "End", 
          page: 3, 
          score: 0.55, 
          event: "Resolution and reflection on experiences", 
          sentiment: 0.55,
          color: getColorForSentiment(0.55)
        }
      ];
    }
    
    return timeline;
  } catch (error) {
    console.error("Error generating timeline:", error);
    return [
      { 
        time: "Error", 
        page: 1, 
        score: 0.5, 
        event: "Timeline could not be generated",
        color: "#808080" // Gray color for error state
      }
    ];
  }
};
