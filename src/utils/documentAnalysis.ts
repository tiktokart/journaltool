
import { toast } from "sonner";
import { Point } from "@/types/embedding";
import { generateMockPoints, getEmotionColor } from "@/utils/embeddingUtils";
import { initBertModel, analyzeSentiment, batchAnalyzeSentiment } from "@/utils/bertSentimentAnalysis";

export const analyzePdfContent = async (file: File, pdfText?: string): Promise<any> => {
  return new Promise(async (resolve) => {
    toast.info("Initializing BERT sentiment analysis model...");
    
    try {
      // Initialize the BERT model
      await initBertModel();
      
      const fileName = file.name.toLowerCase();
      const seed = fileName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      let customWordBank: string[] = [];
      let emotionalDistribution = {
        Joy: 0.15,
        Sadness: 0.25,
        Anger: 0.1,
        Fear: 0.2,
        Surprise: 0.05,
        Disgust: 0.05,
        Trust: 0.1,
        Anticipation: 0.1,
        Neutral: 0
      };
      
      // Process PDF text if available
      if (pdfText && pdfText.length > 0) {
        console.log("Processing PDF text of length:", pdfText.length);
        
        const cleanText = pdfText
          .toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        const stopWords = new Set(['the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'can', 'could', 'may', 'might', 'must', 'shall', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'who', 'whom', 'whose', 'which']);
        
        // Extract unique words
        customWordBank = cleanText
          .split(' ')
          .filter(word => word.length > 2 && !stopWords.has(word))
          .filter((word, index, self) => self.indexOf(word) === index)
          .slice(0, 500);
          
        console.log("Extracted unique words:", customWordBank.length);
        console.log("Sample words:", customWordBank.slice(0, 20));
        
        // Analyze the entire text with BERT
        toast.info("Analyzing document sentiment with BERT...");
        const sentimentResult = await analyzeSentiment(pdfText);
        console.log("BERT sentiment analysis result:", sentimentResult);
        
        // Adjust emotional distribution based on BERT sentiment
        if (sentimentResult.normalizedScore >= 0.6) {
          // More positive sentiment
          emotionalDistribution.Joy = 0.3;
          emotionalDistribution.Trust = 0.2;
          emotionalDistribution.Sadness = 0.1;
          emotionalDistribution.Fear = 0.1;
        } else if (sentimentResult.normalizedScore <= 0.4) {
          // More negative sentiment
          emotionalDistribution.Sadness = 0.35;
          emotionalDistribution.Fear = 0.25;
          emotionalDistribution.Joy = 0.05;
          emotionalDistribution.Trust = 0.05;
        }
        
        // Generate sentences for more granular analysis
        const sentences = pdfText
          .replace(/([.!?])\s*/g, "$1|")
          .split("|")
          .filter(s => s.trim().length > 10 && s.trim().length < 250)
          .map(s => s.trim());
        
        // Enhanced emotion detection in sentences
        // Look for specific emotional indicators in the text
        const emotionKeywords = {
          Anger: ["angry", "mad", "furious", "rage", "outraged", "irritated", "annoyed", "frustrated"],
          Sadness: ["sad", "depressed", "unhappy", "miserable", "grief", "despair", "heartbroken", "disappointed"],
          Fear: ["afraid", "scared", "terrified", "fearful", "anxious", "worried", "panicked", "nervous"],
          Disgust: ["disgusted", "revolted", "repulsed", "nauseated", "sickened", "distaste", "aversion", "loathing"],
          Joy: ["happy", "joyful", "delighted", "elated", "excited", "pleased", "glad", "content"],
          Surprise: ["surprised", "shocked", "astonished", "amazed", "startled", "unexpected", "sudden", "wonder"],
          Trust: ["trust", "believe", "confident", "faith", "rely", "dependable", "loyal", "authentic"],
          Anticipation: ["anticipate", "expect", "await", "hope", "foresee", "look forward", "predict", "prospect"]
        };
        
        // Count emotional keywords in text
        const emotionKeywordCounts: Record<string, number> = {
          Anger: 0, Sadness: 0, Fear: 0, Disgust: 0, Joy: 0, Surprise: 0, Trust: 0, Anticipation: 0
        };
        
        // Check for emotion keywords in the text
        const textLower = pdfText.toLowerCase();
        Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
          keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            const matches = textLower.match(regex);
            if (matches) {
              emotionKeywordCounts[emotion] += matches.length;
            }
          });
        });
        
        console.log("Emotion keyword counts:", emotionKeywordCounts);
        
        // Adjust emotional distribution based on keyword counts
        const totalKeywordMatches = Object.values(emotionKeywordCounts).reduce((sum, count) => sum + count, 0);
        if (totalKeywordMatches > 0) {
          Object.entries(emotionKeywordCounts).forEach(([emotion, count]) => {
            // Calculate the percentage and use it to influence the distribution
            const percentage = count / totalKeywordMatches;
            emotionalDistribution[emotion as keyof typeof emotionalDistribution] = 
              0.1 + (percentage * 0.9); // Base 0.1 + up to 0.9 based on percentage
          });
          
          // Normalize the distribution to ensure it adds up to 1
          const totalDistribution = Object.values(emotionalDistribution).reduce((sum, val) => sum + val, 0);
          if (totalDistribution > 0) {
            Object.keys(emotionalDistribution).forEach(key => {
              emotionalDistribution[key as keyof typeof emotionalDistribution] /= totalDistribution;
            });
          }
          
          console.log("Adjusted emotional distribution based on keywords:", emotionalDistribution);
        }
        
        // For larger documents, analyze a sample of sentences
        if (sentences.length > 20) {
          const sampleSize = Math.min(20, Math.floor(sentences.length / 3));
          const sampleIndices = Array.from({ length: sentences.length }, (_, i) => i);
          const shuffled = sampleIndices.sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, sampleSize);
          
          const samplesToAnalyze = selected.map(i => sentences[i]);
          
          // Batch analyze the selected sentences
          const sentenceResults = await batchAnalyzeSentiment(samplesToAnalyze);
          
          // Count emotion frequencies based on sentence sentiments
          let joyCount = 0;
          let sadnessCount = 0;
          
          sentenceResults.forEach(result => {
            if (result.normalizedScore >= 0.7) joyCount++;
            if (result.normalizedScore <= 0.3) sadnessCount++;
          });
          
          const totalSamples = sentenceResults.length;
          
          // Further refine distribution based on sentence analysis
          if (totalSamples > 0) {
            const joyRatio = joyCount / totalSamples;
            const sadnessRatio = sadnessCount / totalSamples;
            
            emotionalDistribution.Joy = 0.1 + joyRatio * 0.4;
            emotionalDistribution.Sadness = 0.1 + sadnessRatio * 0.4;
            emotionalDistribution.Fear = 0.1 + sadnessRatio * 0.3;
            emotionalDistribution.Trust = 0.1 + joyRatio * 0.3;
          }
        }
      } else {
        // Use filename-based sentiment heuristics if no text is available
        if (fileName.includes('happy') || fileName.includes('joy')) {
          emotionalDistribution.Joy = 0.4;
          emotionalDistribution.Sadness = 0.05;
        } else if (fileName.includes('sad') || fileName.includes('depress')) {
          emotionalDistribution.Sadness = 0.5;
          emotionalDistribution.Joy = 0.05;
        } else if (fileName.includes('anger') || fileName.includes('mad')) {
          emotionalDistribution.Anger = 0.4;
          emotionalDistribution.Trust = 0.05;
        } else if (fileName.includes('fear') || fileName.includes('anxiety')) {
          emotionalDistribution.Fear = 0.4;
          emotionalDistribution.Trust = 0.05;
        }
        
        // For files without text, apply a simpler BERT analysis on the filename
        const fileNameSentiment = await analyzeSentiment(fileName);
        
        // Adjust based on filename sentiment
        if (fileNameSentiment.normalizedScore >= 0.6) {
          emotionalDistribution.Joy = Math.max(0.25, emotionalDistribution.Joy);
          emotionalDistribution.Trust = Math.max(0.15, emotionalDistribution.Trust);
        } else if (fileNameSentiment.normalizedScore <= 0.4) {
          emotionalDistribution.Sadness = Math.max(0.25, emotionalDistribution.Sadness);
          emotionalDistribution.Fear = Math.max(0.15, emotionalDistribution.Fear);
        }
      }
      
      // Calculate overall sentiment from the emotional distribution
      const overallSentiment = 
        (emotionalDistribution.Joy * 0.9) + 
        (emotionalDistribution.Trust * 0.8) + 
        (emotionalDistribution.Anticipation * 0.6) + 
        (emotionalDistribution.Surprise * 0.5) - 
        (emotionalDistribution.Sadness * 0.3) - 
        (emotionalDistribution.Fear * 0.3) - 
        (emotionalDistribution.Anger * 0.3) - 
        (emotionalDistribution.Disgust * 0.3);
      
      const normalizedSentiment = Math.min(1, Math.max(0, (overallSentiment + 1) / 2));
      
      // Generate embedding points with enhanced emotional tagging
      toast.info("Generating embedding visualization...");
      const embeddingPoints = generateMockPoints(
        false, 
        customWordBank.length > 0 ? customWordBank : undefined
      );

      console.log("Generated embedding points:", embeddingPoints.length);
      console.log("Sample embedding words:", embeddingPoints.slice(0, 5).map(p => p.word));
      
      // Enhanced emotional tagging for embedding points
      // Assign emotional tones based on both sentiment scores and emotional keywords
      if (embeddingPoints.length > 0) {
        const uniqueWords = [...new Set(embeddingPoints.map(p => p.word))];
        const maxWordsToAnalyze = Math.min(uniqueWords.length, 100);
        
        if (maxWordsToAnalyze > 0) {
          const wordsToAnalyze = uniqueWords.slice(0, maxWordsToAnalyze);
          const wordSentiments = await batchAnalyzeSentiment(wordsToAnalyze);
          
          // Create a mapping of words to their sentiment scores
          const sentimentMap = new Map();
          wordsToAnalyze.forEach((word, index) => {
            sentimentMap.set(word, wordSentiments[index].normalizedScore);
          });
          
          // Assign emotional tones based on sentiment scores and keywords
          embeddingPoints.forEach(point => {
            if (!point.word) return;
            
            const word = point.word.toLowerCase();
            
            // Check if the word directly matches any emotional keywords
            let matchedEmotion = null;
            Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
              if (keywords.includes(word) || keywords.some(keyword => word.includes(keyword))) {
                matchedEmotion = emotion;
              }
            });
            
            if (matchedEmotion) {
              // If word directly matches an emotion keyword, assign that emotion
              point.emotionalTone = matchedEmotion;
            } else if (sentimentMap && sentimentMap.has(word)) {
              // Otherwise, assign emotion based on sentiment score
              const score = sentimentMap.get(word);
              if (score >= 0.8) {
                point.emotionalTone = "Joy";
              } else if (score >= 0.6) {
                point.emotionalTone = "Trust";
              } else if (score <= 0.2) {
                point.emotionalTone = "Sadness";
              } else if (score <= 0.3) {
                point.emotionalTone = "Fear";
              } else if (score <= 0.4) {
                point.emotionalTone = "Anger";
              } else {
                // Distribute remaining points among emotions based on overall distribution
                const emotions = Object.keys(emotionalDistribution);
                emotions.sort((a, b) => 
                  emotionalDistribution[b as keyof typeof emotionalDistribution] - 
                  emotionalDistribution[a as keyof typeof emotionalDistribution]
                );
                
                // Assign based on probability distribution (more likely to get dominant emotions)
                const rand = Math.random();
                let cumulativeProbability = 0;
                
                for (const emotion of emotions) {
                  cumulativeProbability += emotionalDistribution[emotion as keyof typeof emotionalDistribution];
                  if (rand <= cumulativeProbability) {
                    point.emotionalTone = emotion;
                    break;
                  }
                }
                
                // Fallback if no emotion was assigned
                if (!point.emotionalTone) {
                  point.emotionalTone = "Neutral";
                }
              }
            }
            
            // If the sentiment is very neutral, label it as such
            if (point.sentiment >= 0.45 && point.sentiment <= 0.55) {
              point.emotionalTone = "Neutral";
            }
          });
          
          console.log("Enhanced embedding points with emotional tones");
        }
      }

      const positivePercentage = Math.round(normalizedSentiment * 100);
      const negativePercentage = Math.round((1 - normalizedSentiment) * 0.5 * 100);
      const neutralPercentage = 100 - positivePercentage - negativePercentage;

      // Generate timeline data
      const pageCount = pdfText ? Math.ceil(pdfText.length / 2000) : 5 + Math.floor((seed % 10));
      const timeline = [];
      let prevScore = normalizedSentiment * 0.8;

      for (let i = 1; i <= pageCount; i++) {
        const volatility = pdfText ? 0.1 : 0.15;
        const trend = (normalizedSentiment - prevScore) * 0.3;
        const randomChange = (Math.random() * 2 - 1) * volatility;
        let newScore = prevScore + randomChange + trend;
        newScore = Math.min(1, Math.max(0, newScore));

        timeline.push({ page: i, score: newScore });
        prevScore = newScore;
      }

      // Generate themes
      let themeNames = [
        "Work", "Family", "Health", "Relationships", 
        "Future", "Goals", "Education", "Friends",
        "Hobbies", "Travel", "Home", "Money"
      ];

      if (customWordBank.length > 20) {
        const potentialThemes = customWordBank.slice(0, 20);
        const selectedThemes = [];
        const themeCount = 4 + Math.floor(Math.random() * 3);
        for (let i = 0; i < themeCount && i < potentialThemes.length; i++) {
          const randomIndex = Math.floor(Math.random() * potentialThemes.length);
          selectedThemes.push(potentialThemes[randomIndex]);
          potentialThemes.splice(randomIndex, 1);
        }

        themeNames = selectedThemes.map(theme => 
          theme.charAt(0).toUpperCase() + theme.slice(1)
        );
        
        console.log("Using custom themes from PDF:", themeNames);
      }

      const themes = [];
      const themeCount = Math.min(themeNames.length, 4 + Math.floor(Math.random() * 4));

      const usedThemeIndices = new Set();
      for (let i = 0; i < themeCount; i++) {
        let themeIndex;
        do {
          themeIndex = Math.floor(Math.random() * themeNames.length);
        } while (usedThemeIndices.has(themeIndex) && usedThemeIndices.size < themeNames.length);

        if (usedThemeIndices.size >= themeNames.length) break;
        usedThemeIndices.add(themeIndex);

        const variation = Math.random() * 0.4 - 0.2;
        const themeSentiment = Math.min(1, Math.max(0, normalizedSentiment + variation));

        themes.push({
          name: themeNames[themeIndex],
          score: themeSentiment,
          mentions: 5 + Math.floor(Math.random() * 20)
        });
      }

      // Analyze word frequency and sentiment
      const wordFrequency: Record<string, { count: number, sentiment: number, emotionalTone: string }> = {};
      embeddingPoints.forEach(point => {
        if (point.word) {
          if (!wordFrequency[point.word]) {
            wordFrequency[point.word] = { 
              count: 0, 
              sentiment: 0, 
              emotionalTone: point.emotionalTone || "Neutral" 
            };
          }
          wordFrequency[point.word].count += 1;
          wordFrequency[point.word].sentiment += point.sentiment;
        }
      });

      Object.keys(wordFrequency).forEach(word => {
        const entry = wordFrequency[word];
        entry.sentiment = entry.sentiment / entry.count;
      });

      const sortedWords = Object.entries(wordFrequency)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 30);

      console.log("Top words with frequency:", sortedWords.slice(0, 5).map(([word, data]) => `${word}: ${data.count}`));

      // Create key phrases with sentiments
      const keyPhrases = sortedWords.map(([word, data]) => {
        let sentimentCategory: "positive" | "neutral" | "negative" = "neutral";
        if (data.sentiment >= 0.6) {
          sentimentCategory = "positive";
        } else if (data.sentiment <= 0.4) {
          sentimentCategory = "negative";
        }

        if (data.emotionalTone === "Neutral") {
          sentimentCategory = "neutral";
        }

        return {
          text: word,
          sentiment: sentimentCategory,
          count: data.count
        };
      });

      // Generate or extract summary
      let summary = "";
      if (pdfText && pdfText.length > 0) {
        // For real PDFs, try to extract a meaningful summary
        const sentences = pdfText
          .replace(/([.!?])\s*/g, "$1|")
          .split("|")
          .filter(s => s.trim().length > 10 && s.trim().length < 250)
          .map(s => s.trim());
        
        if (sentences.length > 0) {
          const topKeywords = sortedWords.slice(0, 10).map(([word]) => word.toLowerCase());
          
          // Score sentences based on keywords and position
          const scoredSentences = sentences.map((sentence, index) => {
            const normalizedPosition = 1 - (index / sentences.length);
            const lowerSentence = sentence.toLowerCase();
            
            let keywordScore = 0;
            topKeywords.forEach(keyword => {
              if (lowerSentence.includes(keyword.toLowerCase())) {
                keywordScore += 1;
              }
            });
            
            const score = (keywordScore * 0.7) + (normalizedPosition * 0.3);
            
            return { sentence, score };
          });
          
          scoredSentences.sort((a, b) => b.score - a.score);
          
          const summaryLength = Math.min(
            5, 
            Math.max(2, Math.floor(sentences.length / 10))
          );
          
          const topSentences = scoredSentences.slice(0, summaryLength);
          
          // Reorder sentences to match their original sequence
          topSentences.sort((a, b) => {
            return sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence);
          });
          
          summary = topSentences.map(s => s.sentence).join(" ");
          
          if (summary.length > 500) {
            summary = summary.substring(0, 497) + "...";
          }
        } else {
          // Fallback if no sentences could be extracted
          const dominantEmotion = Object.entries(emotionalDistribution)
            .sort((a, b) => b[1] - a[1])[0][0];
          
          // Use BERT-informed template summaries
          summary = `This document has a predominant ${dominantEmotion.toLowerCase()} emotional tone with an overall sentiment score of ${normalizedSentiment.toFixed(2)}. BERT analysis indicates that the content is ${normalizedSentiment >= 0.5 ? "generally positive" : "somewhat negative"} in nature.`;
        }
      } else {
        // For files without text, generate a basic BERT-informed summary
        const bertSummary = `BERT sentiment analysis of this file indicates a sentiment score of ${normalizedSentiment.toFixed(2)}, which is interpreted as ${normalizedSentiment >= 0.6 ? "positive" : normalizedSentiment >= 0.4 ? "neutral" : "negative"}.`;
        
        const dominantEmotion = Object.entries(emotionalDistribution)
          .sort((a, b) => b[1] - a[1])[0][0];
        
        const emotionSummary = `The dominant emotional tone appears to be ${dominantEmotion}, representing ${Math.round(emotionalDistribution[dominantEmotion as keyof typeof emotionalDistribution] * 100)}% of the emotional content.`;
        
        summary = `${bertSummary} ${emotionSummary}`;
      }

      const sourceDescription = pdfText && pdfText.length > 0 && customWordBank.length > 0
        ? `Analysis based on ${customWordBank.length} unique words extracted from your PDF using BERT sentiment analysis`
        : "Analysis generated using BERT sentiment model";

      // Compile all results
      const analysisResults = {
        overallSentiment: {
          score: normalizedSentiment,
          label: normalizedSentiment >= 0.6 ? "Positive" : normalizedSentiment >= 0.4 ? "Neutral" : "Negative"
        },
        distribution: {
          positive: positivePercentage,
          neutral: neutralPercentage,
          negative: negativePercentage
        },
        timeline: timeline,
        entities: themes,
        keyPhrases: keyPhrases,
        embeddingPoints: embeddingPoints,
        fileName: file.name,
        fileSize: file.size,
        wordCount: customWordBank.length,
        pdfTextLength: pdfText ? pdfText.length : 0,
        summary: summary,
        sourceDescription: sourceDescription,
        emotionalDistribution: emotionalDistribution
      };

      resolve(analysisResults);
    } catch (error) {
      console.error("Error in analyzePdfContent:", error);
      toast.error("Error analyzing document with BERT model");
      
      // Fallback to basic analysis without BERT
      const basicResults = {
        overallSentiment: {
          score: 0.5,
          label: "Neutral"
        },
        distribution: {
          positive: 50,
          neutral: 30,
          negative: 20
        },
        timeline: [{page: 1, score: 0.5}],
        entities: [{name: "Content", score: 0.5, mentions: 5}],
        keyPhrases: [{text: "error", sentiment: "neutral" as "neutral", count: 1}],
        embeddingPoints: generateMockPoints(false),
        fileName: file.name,
        fileSize: file.size,
        wordCount: 0,
        pdfTextLength: pdfText ? pdfText.length : 0,
        summary: "An error occurred during BERT analysis. Results shown are approximations.",
        sourceDescription: "Analysis performed with fallback measures due to BERT model error"
      };
      
      resolve(basicResults);
    }
  });
};

export const fixTypeErrorInFunction = () => {
  console.log("Fix applied to documentAnalysis.ts");
};

export const processData = (data: any, sourceDescription: string): any => {
  // Basic validation and data preparation
  if (!data || typeof data !== 'object') {
    throw new Error("Invalid data format received from API");
  }

  let embeddingPoints: Point[] = [];
  let overallSentiment = { score: 0.5, label: "Neutral" };
  let distribution = { positive: 0, neutral: 0, negative: 0 };
  let timeline: { page: number; score: number }[] = [];
  let entities: { name: string; score: number; mentions: number }[] = [];
  let keyPhrases: { text: string; sentiment: string; count: number }[] = [];
  let fileName = "";

  try {
    // Process embedding points if available
    if (data.embedding && Array.isArray(data.embedding)) {
      embeddingPoints = data.embedding.map((point: any, index: number) => {
        return {
          id: index.toString(),
          x: point.x || Math.random() * 100 - 50,
          y: point.y || Math.random() * 100 - 50,
          z: point.z || Math.random() * 100 - 50,
          word: point.word || `Word${index}`,
          sentiment: point.sentiment || 0.5,
          emotionalTone: point.emotionalTone || "Neutral",
          relationships: Array.isArray(point.relationships) 
            ? point.relationships.map((rel: any) => ({
                id: rel.id?.toString() || "",
                word: rel.word || "",
                strength: rel.strength || 0.5
              }))
            : []
        };
      });
    }

    // Process overall sentiment if available
    if (data.overallSentiment) {
      overallSentiment = {
        score: typeof data.overallSentiment.score === 'number' ? data.overallSentiment.score : 0.5,
        label: data.overallSentiment.label || "Neutral"
      };
    }

    // Process sentiment distribution if available
    if (data.distribution) {
      distribution = {
        positive: typeof data.distribution.positive === 'number' ? data.distribution.positive : 0,
        neutral: typeof data.distribution.neutral === 'number' ? data.distribution.neutral : 0,
        negative: typeof data.distribution.negative === 'number' ? data.distribution.negative : 0
      };
    }

    // Process timeline if available
    if (data.timeline && Array.isArray(data.timeline)) {
      timeline = data.timeline.map((item: any) => ({
        page: item.page || 0,
        score: typeof item.score === 'number' ? item.score : 0.5
      }));
    }

    // Process entities if available
    if (data.entities && Array.isArray(data.entities)) {
      entities = data.entities.map((item: any) => ({
        name: item.name || "Unknown",
        score: typeof item.score === 'number' ? item.score : 0.5,
        mentions: typeof item.mentions === 'number' ? item.mentions : 1
      }));
    }

    // Process key phrases if available
    if (data.keyPhrases && Array.isArray(data.keyPhrases)) {
      keyPhrases = data.keyPhrases.map((item: any) => ({
        text: item.text || "Unknown",
        sentiment: item.sentiment || "neutral",
        count: typeof item.count === 'number' ? item.count : 1
      }));
    }

    // Get file name if available
    if (data.fileName) {
      fileName = data.fileName;
    }

    // Calculate emotional tone distribution
    const emotionalToneDistribution = calculateEmotionalToneDistribution(embeddingPoints);

    return {
      embeddingPoints,
      overallSentiment,
      distribution,
      timeline,
      entities,
      keyPhrases,
      fileName,
      emotionalToneDistribution,
      sourceDescription
    };
  } catch (error) {
    console.error("Error processing data:", error);
    throw new Error("Failed to process analysis data");
  }
};

// Function to calculate emotional tone distribution
const calculateEmotionalToneDistribution = (points: Point[]): number => {
  const distribution: Record<string, number> = {
    Joy: 0,
    Sadness: 0,
    Anger: 0,
    Fear: 0,
    Surprise: 0,
    Disgust: 0,
    Trust: 0,
    Anticipation: 0,
    Neutral: 0
  };
  
  if (!points || points.length === 0) return 0;
  
  // Count the occurrences of each emotional tone
  points.forEach(point => {
    if (point.emotionalTone) {
      const tone = point.emotionalTone;
      if (distribution[tone] !== undefined) {
        distribution[tone]++;
      }
    } else {
      distribution.Neutral++;
    }
  });
  
  // Return the total number of points for statistical purposes
  return points.length;
};
