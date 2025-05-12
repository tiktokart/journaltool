import { faker } from '@faker-js/faker';

export function processTextForVisualization(text: string, name: string): any {
  const words = text.split(/\s+/);
  const wordCount: Record<string, number> = {};

  words.forEach(word => {
    if (word.length > 3) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });

  const uniqueWords = Object.keys(wordCount).sort((a, b) => wordCount[b] - wordCount[a]);

  const embeddingPoints = uniqueWords.map((word, index) => {
    const sentiment = Math.random();
    const weight = word.length;
    const x = Math.random() * 10;
    const y = Math.random() * 10;
    const z = Math.random() * 10;

    return {
      id: `point-${index}`,
      word,
      sentiment,
      weight,
      position: [x, y, z],
      color: [Math.random(), Math.random(), Math.random()],
      tone: faker.helpers.arrayElement(['Joy', 'Sadness', 'Anger', 'Fear', 'Surprise']),
      frequency: wordCount[word],
      relationships: []
    };
  });

  // Simulate relationships between points
  embeddingPoints.forEach(point => {
    const relatedPoints = faker.helpers.arrayElements(embeddingPoints, faker.number.int({ min: 0, max: 3 }));
    relatedPoints.forEach(relatedPoint => {
      if (relatedPoint !== point) {
        point.relationships.push({
          id: relatedPoint.id,
          strength: Math.random()
        });
      }
    });
  });

  const keywordAnalysis = extractKeywords(text).map(keyword => {
    const sentiment = Math.random(); // Simplified for example
    const weight = keyword.length;
    // Convert color from string to [number, number, number] format
    const colorValues = getColorForSentiment(sentiment);
    
    return {
      sentiment,
      weight,
      color: [colorValues[0]/255, colorValues[1]/255, colorValues[2]/255], // Convert to normalized RGB array
      word: keyword,
      tone: getSentimentTone(sentiment),
      relatedConcepts: [],
      frequency: 1,
      pos: 'n' // Adding the missing 'pos' property
    };
  });

  return {
    name,
    text,
    embeddingPoints,
    keywordAnalysis,
    wordCount: uniqueWords.length
  };
}

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/);
  const wordCount: Record<string, number> = {};

  words.forEach(word => {
    if (word.length > 4) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });

  return Object.entries(wordCount)
    .filter(([_, count]) => count > 1)
    .sort(([_a, countA], [_b, countB]) => countB - countA)
    .slice(0, 10)
    .map(([word]) => word);
}

function getColorForSentiment(sentiment: number): [number, number, number] {
  if (sentiment < 0.3) {
    return [66, 133, 244]; // Blue for negative
  } else if (sentiment < 0.6) {
    return [210, 210, 210]; // Grey for neutral
  } else {
    return [255, 215, 0]; // Gold for positive
  }
}

function getSentimentTone(sentiment: number): string {
  if (sentiment < 0.3) {
    return 'Sadness';
  } else if (sentiment < 0.6) {
    return 'Neutral';
  } else {
    return 'Joy';
  }
}
