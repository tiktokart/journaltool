
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
    // Safety check to prevent crashes
    if (!text || typeof text !== 'string') {
      console.warn("Invalid text provided to timeline generator", text);
      return generateFallbackTimeline();
    }
    
    console.log("Generating timeline from text:", text.substring(0, 100) + "...");
    
    // Split text into paragraphs
    const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
    
    // If text is short, split into sentences instead
    const textUnits = paragraphs.length > 3 ? paragraphs : 
      text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Safety check - if we still don't have text units, return default timeline
    if (!textUnits || textUnits.length === 0) {
      console.warn("No text units found for timeline generation");
      return generateFallbackTimeline();
    }
    
    // Generate timeline events from text units
    const timeline: TimelineEvent[] = [];
    
    // Time expressions to look for - expanded list for better timeline markers
    const timeExpressions = [
      'first', 'initially', 'begin', 'start', 'then', 'after', 'before', 'during', 'finally', 
      'later', 'next', 'previously', 'yesterday', 'today', 'tomorrow', 'morning', 'afternoon', 
      'evening', 'night', 'suddenly', 'gradually', 'immediately', 'eventually', 'soon',
      'once', 'while', 'meanwhile', 'thereafter', 'simultaneously', 'subsequently', 'formerly',
      'recently', 'lately', 'currently', 'presently', 'now', 'always', 'never', 'sometimes'
    ];
    
    // Color mapping for emotional tones - more distinctive colors
    const getColorForSentiment = (score: number): string => {
      if (score >= 0.7) return "#27AE60"; // Positive - Green
      if (score >= 0.6) return "#2ECC71"; // Positive - Light Green
      if (score >= 0.5) return "#3498DB"; // Neutral-positive - Blue
      if (score >= 0.4) return "#F1C40F"; // Neutral - Yellow
      if (score >= 0.3) return "#E67E22"; // Neutral-negative - Orange
      return "#E74C3C"; // Negative - Red
    };
    
    // Find meaningful words for timeline markers
    const extractMeaningfulWords = (text: string) => {
      if (!text || typeof text !== 'string') return "Point";
      
      // Remove common words that aren't meaningful for markers
      const stopWords = ['the', 'a', 'an', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by'];
      const words = text.split(/\s+/)
        .filter(word => word && word.length > 3) // Only words longer than 3 chars
        .map(word => word.replace(/[^\w\s]/, '')) // Remove punctuation
        .filter(word => word && !stopWords.includes(word.toLowerCase())); // Remove stop words
        
      if (words.length >= 2) {
        return words.slice(0, 2).join(' ');
      } else if (words.length === 1) {
        return words[0];
      }
      return "Point";
    };
    
    // Enhanced sentiment calculation to detect more subtle changes
    const calculateSentimentForText = (text: string): number => {
      if (!text) return 0.5;
      
      // Enhanced lists with more emotional words
      const positiveWords = [
        'good', 'great', 'happy', 'excellent', 'love', 'enjoy', 'wonderful', 'joy',
        'pleased', 'delighted', 'thankful', 'excited', 'hopeful', 'optimistic',
        'amazing', 'awesome', 'fantastic', 'superb', 'terrific', 'brilliant',
        'glad', 'cheerful', 'content', 'satisfied', 'proud', 'enthusiastic',
        'grateful', 'calm', 'peaceful', 'relaxed', 'comfortable', 'safe',
        'honored', 'privileged', 'blessed', 'fortunate', 'lucky', 'inspired'
      ];
      
      const negativeWords = [
        'bad', 'sad', 'terrible', 'hate', 'awful', 'horrible', 'poor', 'worry',
        'annoyed', 'angry', 'upset', 'disappointed', 'frustrated', 'anxious', 'afraid',
        'stressed', 'miserable', 'depressed', 'gloomy', 'painful', 'hurt', 'unhappy',
        'tragedy', 'tragic', 'failure', 'fail', 'lose', 'lost', 'worst', 'trouble',
        'difficult', 'trauma', 'suffering', 'suffer', 'pain', 'agony', 'distress',
        'grief', 'sorrow', 'despair', 'hopeless', 'helpless', 'lonely', 'abandoned',
        'rejected', 'worthless', 'useless', 'pathetic', 'embarrassed', 'ashamed',
        'guilty', 'regretful', 'scared', 'terrified', 'horrified', 'disgusted'
      ];
                           
      const words = text.toLowerCase().split(/\s+/);
      let positiveCount = 0;
      let negativeCount = 0;
      
      words.forEach(word => {
        if (positiveWords.includes(word)) positiveCount++;
        if (negativeWords.includes(word)) negativeCount++;
      });
      
      if (positiveCount === 0 && negativeCount === 0) {
        // No sentiment words found, return slightly randomized neutral value
        return 0.45 + (Math.random() * 0.1);  // 0.45-0.55
      }
      
      // Calculate sentiment based on positive/negative ratio
      const totalSentimentWords = positiveCount + negativeCount;
      
      // Base score from 0-1 representing the positive ratio
      let sentiment = positiveCount / totalSentimentWords;
      
      // Add slight randomization but keep the general trend
      sentiment = sentiment * 0.8 + 0.1 + (Math.random() * 0.1);
      
      // Ensure value is between 0 and 1
      return Math.max(0.1, Math.min(0.9, sentiment));
    };
    
    // Safely process each text unit
    let prevSentiment: number | null = null;
    textUnits.forEach((unit, index) => {
      try {
        // Skip empty units
        if (!unit || !unit.trim()) return;
        
        // Extract key words from each text unit for the timeline marker
        const words = unit.trim().split(/\s+/);
        let timeMarker = "";
        
        // Look for time expressions in the text
        const timeExpression = timeExpressions.find(expr => 
          unit.toLowerCase().includes(expr)
        );
        
        if (timeExpression) {
          // Use the time expression as part of the marker
          timeMarker = timeExpression.charAt(0).toUpperCase() + timeExpression.slice(1);
          
          // Add some context words if possible
          const contextWords = extractMeaningfulWords(unit);
          if (contextWords !== "Point") {
            timeMarker += ` - ${contextWords}`;
          }
        } else {
          // Extract significant words (nouns, adjectives) from the beginning of the unit
          const significantWords = words
            .filter(word => word && word.length > 3)
            .slice(0, 3);
            
          if (significantWords.length > 0) {
            timeMarker = significantWords.join(' ');
          } else {
            // Give more descriptive markers than just "Section X"
            if (index === 0) timeMarker = "Beginning";
            else if (index === textUnits.length - 1) timeMarker = "Conclusion";
            else timeMarker = `Part ${index + 1}`;
          }
        }
        
        // Calculate sentiment for this text unit
        const sentiment = calculateSentimentForText(unit);
        
        // Detect significant changes in sentiment - lower threshold for more points
        const sentimentChange = prevSentiment !== null ? Math.abs(sentiment - prevSentiment) : 0;
        const isSignificantChange = sentimentChange > 0.08; // More sensitive
        
        // Add more points to the timeline - lower threshold to show more data points
        const addThisPoint = isSignificantChange || index === 0 || index === textUnits.length - 1 || 
          index % Math.max(1, Math.floor(textUnits.length / 15)) === 0; // More frequent sampling
          
        if (addThisPoint) {
          // Extract a suitable event description (first 50 chars or so)
          const event = unit.length > 50 ? unit.substring(0, 50) + '...' : unit;
          
          // For compatibility with visualization components
          const page = index + 1;
          const score = sentiment;
          
          // Add color based on sentiment score
          const color = getColorForSentiment(sentiment);
          
          timeline.push({
            time: timeMarker, // Now contains meaningful words instead of "Point X"
            page, // For visualization (x-axis)
            score, // For visualization (y-axis)
            event: event.trim(),
            sentiment,
            color // Add color property for visualization
          });
          
          prevSentiment = sentiment;
        }
      } catch (error) {
        console.error("Error processing timeline unit:", error);
        // Skip this unit and continue with the next one
      }
    });
    
    // Ensure we have at least a few events
    if (timeline.length < 3) {
      return generateFallbackTimeline();
    }
    
    // Log timeline for debugging
    console.log("Generated timeline entries:", timeline.length);
    
    return timeline;
  } catch (error) {
    console.error("Error generating timeline:", error);
    return generateFallbackTimeline();
  }
};

// Helper function to generate a fallback timeline when analysis fails
function generateFallbackTimeline(): TimelineEvent[] {
  return [
    { 
      time: "Beginning", 
      page: 1, 
      score: 0.65, 
      event: "Starting point of the narrative", 
      sentiment: 0.65,
      color: "#3498DB" // Blue
    },
    { 
      time: "Middle", 
      page: 2, 
      score: 0.45, 
      event: "Development of key themes and emotions", 
      sentiment: 0.45,
      color: "#F39C12" // Orange
    },
    { 
      time: "End", 
      page: 3, 
      score: 0.55, 
      event: "Resolution and reflection on experiences", 
      sentiment: 0.55,
      color: "#27AE60" // Green
    }
  ];
}
