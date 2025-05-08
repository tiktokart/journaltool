
interface TimelineEvent {
  time: string;
  event: string;
  sentiment?: number;
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
    
    textUnits.forEach((unit, index) => {
      // Look for time expressions in the text
      const hasTimeExpression = timeExpressions.some(expr => 
        unit.toLowerCase().includes(expr)
      );
      
      // Only add to timeline if it has a time expression or it's a key paragraph
      if (hasTimeExpression || index === 0 || index === textUnits.length - 1 || index % 3 === 0) {
        // Extract a suitable event description (first 50 chars or so)
        const event = unit.length > 50 ? unit.substring(0, 50) + '...' : unit;
        
        // Generate a time label
        let timeLabel = '';
        if (index === 0) timeLabel = 'Beginning';
        else if (index === textUnits.length - 1) timeLabel = 'End';
        else timeLabel = `Middle (${index}/${textUnits.length})`;
        
        // For demo purposes, we'll add the event to the timeline
        timeline.push({
          time: timeLabel,
          event: event.trim(),
          sentiment: 0.3 + (Math.random() * 0.5) // Random sentiment between 0.3 and 0.8
        });
      }
    });
    
    // Ensure we have at least a few events
    if (timeline.length < 3) {
      return [
        { time: "Beginning", event: "Starting point of the narrative", sentiment: 0.65 },
        { time: "Middle", event: "Development of key themes and emotions", sentiment: 0.45 },
        { time: "End", event: "Resolution and reflection on experiences", sentiment: 0.55 }
      ];
    }
    
    return timeline;
  } catch (error) {
    console.error("Error generating timeline:", error);
    return [
      { time: "Error", event: "Timeline could not be generated" }
    ];
  }
};
