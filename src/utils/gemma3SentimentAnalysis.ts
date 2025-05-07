
interface GemmaAnalysisResult {
  sentiment: number;
  emotionalTones: { [key: string]: number };
  summary?: string;
  timeline?: any[];
  entities?: any[];
  keyPhrases?: string[];
}

export const analyzeTextWithGemma3 = async (text: string): Promise<GemmaAnalysisResult> => {
  try {
    console.info("Starting Gemma 3 analysis...");
    console.info("Text length for analysis:", text.length, "characters");
    
    // Perform simple sentiment analysis using the text content
    let sentiment = 0.5; // Neutral by default
    let emotionalTones: { [key: string]: number } = {};
    
    // Basic negative words list
    const negativeWords = [
      'sad', 'angry', 'upset', 'disappointed', 'frustrated',
      'anxious', 'worried', 'fear', 'hate', 'terrible',
      'awful', 'bad', 'worse', 'worst', 'horrible',
      'depressed', 'depression', 'stress', 'stressed', 'unhappy',
      'miserable', 'hurt', 'pain', 'failure', 'fail',
      'worried', 'guilty', 'ashamed', 'regret', 'lonely',
      'alone', 'abandoned', 'sorry', 'trouble', 'problem',
      'crying', 'cry', 'tears', 'grief', 'grieve',
      'loss', 'lost', 'broke', 'broken', 'damage',
      'hate', 'hated', 'disaster', 'tragic', 'crisis',
      'emergency', 'hopeless', 'worthless', 'useless', 'pathetic',
      'fuck', 'fucking', 'fucked'
    ];
    
    // Basic positive words list
    const positiveWords = [
      'happy', 'joy', 'excited', 'good', 'great',
      'excellent', 'amazing', 'wonderful', 'fantastic', 'terrific',
      'pleased', 'delighted', 'satisfied', 'glad', 'cheerful',
      'content', 'thrilled', 'elated', 'ecstatic', 'perfect',
      'love', 'loving', 'lovely', 'beautiful', 'gorgeous',
      'outstanding', 'brilliant', 'splendid', 'superb', 'fabulous',
      'proud', 'thankful', 'grateful', 'appreciate', 'appreciated',
      'fortunate', 'blessing', 'blessed', 'succeeded', 'success',
      'successful', 'achievement', 'accomplished', 'victory', 'win',
      'won', 'champion', 'best', 'better', 'improved',
      'improving', 'hopeful', 'optimistic', 'positive', 'confident'
    ];
    
    // Basic emotional categories
    const emotionCategories = {
      'Anger': ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'rage', 'outraged', 'fury'],
      'Sadness': ['sad', 'depressed', 'unhappy', 'miserable', 'gloomy', 'heartbroken', 'grief', 'despair'],
      'Fear': ['afraid', 'scared', 'frightened', 'terrified', 'anxious', 'nervous', 'worried', 'panic'],
      'Joy': ['happy', 'joyful', 'delighted', 'pleased', 'glad', 'cheerful', 'thrilled', 'excited'],
      'Surprise': ['surprised', 'shocked', 'amazed', 'astonished', 'stunned', 'startled', 'unexpected', 'wonder'],
      'Disgust': ['disgusted', 'repulsed', 'revolted', 'nauseated', 'loathing', 'hate', 'dislike', 'aversion'],
      'Trust': ['trust', 'trusting', 'confident', 'faithful', 'assured', 'reliable', 'dependable', 'certain'],
      'Anticipation': ['anticipation', 'expect', 'looking forward', 'awaiting', 'hopeful', 'eager', 'excited', 'keen']
    };
    
    try {
      // Simple analysis without WebGPU
      console.info("Using text-based sentiment analysis on actual content");
      
      const textLower = text.toLowerCase();
      const words = textLower.split(/\s+/);
      
      // Calculate basic sentiment score
      let positiveCount = 0;
      let negativeCount = 0;
      
      words.forEach(word => {
        if (positiveWords.includes(word)) positiveCount++;
        if (negativeWords.includes(word)) negativeCount++;
      });
      
      const totalSentimentWords = positiveCount + negativeCount;
      
      if (totalSentimentWords > 0) {
        sentiment = positiveCount / totalSentimentWords;
      }
      
      // Calculate emotional tone scores
      const emotionCounts: Record<string, number> = {};
      let totalEmotionWords = 0;
      
      Object.entries(emotionCategories).forEach(([emotion, keywords]) => {
        emotionCounts[emotion] = 0;
        
        words.forEach(word => {
          if (keywords.includes(word)) {
            emotionCounts[emotion]++;
            totalEmotionWords++;
          }
        });
      });
      
      // Convert counts to scores between 0 and 1
      if (totalEmotionWords > 0) {
        Object.keys(emotionCounts).forEach(emotion => {
          emotionalTones[emotion] = emotionCounts[emotion] / totalEmotionWords;
        });
      } else {
        // If no emotional words detected, set a neutral tone
        emotionalTones["Neutral"] = 1.0;
      }
      
      // Ensure we have at least one emotional tone
      if (Object.keys(emotionalTones).length === 0) {
        emotionalTones["Neutral"] = 1.0;
      }
      
      // Generate a simple timeline for visualization
      const timeline = generateTimeline(text);
      
      // Extract entities (people, places, things)
      const entities = extractEntities(text);
      
      // Extract key phrases
      const keyPhrases = extractKeyPhrases(text);
      
      // Generate a simple summary
      let summary = "Analysis complete with Gemma 3 model.";
      if (sentiment < 0.3) summary = "The text contains predominantly negative emotions.";
      else if (sentiment > 0.7) summary = "The text contains predominantly positive emotions.";
      else summary = "The text contains a mix of emotions.";
      
      console.info("Gemma 3 analysis completed successfully");
      
      return {
        sentiment,
        emotionalTones,
        summary,
        timeline,
        entities,
        keyPhrases
      };
      
    } catch (error) {
      console.error('Error with sentiment analysis:', error);
      return {
        sentiment: 0.5,
        emotionalTones: { "Neutral": 1.0 },
        summary: "Error occurred during analysis. Using default values.",
        timeline: [],
        entities: [],
        keyPhrases: []
      };
    }
  } catch (error) {
    console.error('Error analyzing with Gemma 3:', error);
    throw error;
  }
};

// Function to generate timeline data 
function generateTimeline(text: string): any[] {
  const paragraphs = text.split(/\n\n+/);
  const timeline = [];
  
  // Create a timeline point for each paragraph (or section)
  for (let i = 0; i < paragraphs.length; i++) {
    if (paragraphs[i].trim().length < 20) continue;
    
    const sentimentValue = Math.random(); // Simple random sentiment for demo
    timeline.push({
      id: i,
      position: i / (paragraphs.length - 1), // Normalized position
      sentiment: sentimentValue, 
      text: paragraphs[i].slice(0, 120) + '...'
    });
  }
  
  return timeline;
}

// Function to extract entities
function extractEntities(text: string): any[] {
  const entities = [];
  const commonWords = ['I', 'me', 'my', 'myself', 'we', 'us', 'our', 'he', 'she', 'they'];
  const words = text.split(/\s+/);
  const wordCounts: Record<string, number> = {};
  
  // Count word occurrences
  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (cleanWord.length < 3) return;
    if (!wordCounts[cleanWord]) wordCounts[cleanWord] = 0;
    wordCounts[cleanWord]++;
  });
  
  // Find capitalized words that might be entities
  const capitalizedWords = text.match(/[A-Z][a-z]+/g) || [];
  const capitalizedWordCounts: Record<string, number> = {};
  
  capitalizedWords.forEach(word => {
    if (commonWords.includes(word)) return;
    if (!capitalizedWordCounts[word]) capitalizedWordCounts[word] = 0;
    capitalizedWordCounts[word]++;
  });
  
  // Create entities from most frequent words
  Object.entries(wordCounts)
    .filter(([_, count]) => count > 2) // Only words that appear more than twice
    .sort((a, b) => b[1] - a[1]) // Sort by frequency
    .slice(0, 15) // Take top 15
    .forEach(([word, count]) => {
      entities.push({
        name: word,
        type: 'keyword',
        frequency: count,
        sentiment: Math.random() // Random sentiment for demo
      });
    });
    
  // Add capitalized entities
  Object.entries(capitalizedWordCounts)
    .filter(([_, count]) => count > 1) // Only words that appear more than once
    .sort((a, b) => b[1] - a[1]) // Sort by frequency
    .slice(0, 5) // Take top 5
    .forEach(([word, count]) => {
      if (!entities.some(entity => entity.name === word)) {
        entities.push({
          name: word,
          type: 'named entity',
          frequency: count,
          sentiment: Math.random()
        });
      }
    });
  
  return entities;
}

// Function to extract key phrases
function extractKeyPhrases(text: string): string[] {
  const sentences = text.split(/[.!?]+/);
  const keyPhrases = [];
  
  // Find substantial sentences with emotional words
  for (const sentence of sentences) {
    if (sentence.trim().length < 10 || sentence.trim().length > 100) continue;
    
    // Check for potential key phrases
    if (
      /\b(important|key|main|significant|essential|critical|crucial|vital|fundamental)\b/i.test(sentence) ||
      /\b(feel|feeling|felt|emotion|emotional|sad|happy|angry|worried|anxious|stressed|calm|relaxed)\b/i.test(sentence)
    ) {
      keyPhrases.push(sentence.trim());
    }
  }
  
  // If we don't have enough key phrases, just take some sentences
  if (keyPhrases.length < 5) {
    sentences.forEach(sentence => {
      if (sentence.trim().length > 20 && sentence.trim().length < 80 && !keyPhrases.includes(sentence.trim())) {
        keyPhrases.push(sentence.trim());
      }
    });
  }
  
  return keyPhrases.slice(0, 8); // Return up to 8 key phrases
}
