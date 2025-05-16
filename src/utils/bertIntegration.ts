import * as toxicity from '@tensorflow-models/toxicity';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import * as nsfwjs from 'nsfwjs';
import * as sentiment from 'sentiment';
import { SentimentAnalyzer, PorterStemmer } from 'natural';
import { KeywordAnalysis } from '../types/bertAnalysis';

// Loaders for models
let toxicityModel: toxicity.ToxicityModel | null = null;
let useModel: use.UniversalSentenceEncoder | null = null;
let nsfwModel: nsfwjs.NSFWJS | null = null;

// Confidence threshold for toxicity
const TOXICITY_THRESHOLD = 0.9;

// Load Toxicity model
export const loadToxicityModel = async () => {
  if (!toxicityModel) {
    toxicityModel = await toxicity.load(TOXICITY_THRESHOLD, ['identity_attack', 'toxicity', 'severe_toxicity', 'obscene', 'insult', 'threat']);
    console.log('Toxicity model loaded.');
  }
  return toxicityModel;
};

// Load Universal Sentence Encoder model
export const loadUseModel = async () => {
  if (!useModel) {
    useModel = await use.load();
    console.log('Universal Sentence Encoder model loaded.');
  }
  return useModel;
};

// Load NSFW model
export const loadNsfwModel = async () => {
  if (!nsfwModel) {
    nsfwModel = await nsfwjs.load();
    console.log('NSFW model loaded.');
  }
  return nsfwModel;
};

// Analyze text for toxicity
export const analyzeTextForToxicity = async (text: string) => {
  if (!toxicityModel) {
    await loadToxicityModel();
  }
  const predictions = await toxicityModel!.classify([text]);
  
  let results: { [key: string]: boolean } = {};
  predictions.forEach(prediction => {
    results[prediction.label] = prediction.results[0].match;
  });
  
  return results;
};

// Get sentence embeddings
export const getSentenceEmbeddings = async (sentences: string[]) => {
  if (!useModel) {
    await loadUseModel();
  }
  const embeddings = await useModel!.embed(sentences);
  return embeddings.arraySync();
};

// Analyze image for NSFW content
export const analyzeImageForNsfw = async (img: HTMLImageElement) => {
  if (!nsfwModel) {
    await loadNsfwModel();
  }
  const predictions = await nsfwModel!.classify(img);
  return predictions;
};

/**
 * Processes keywords to enhance their analysis data.
 * @param {KeywordAnalysis[]} keywords - Array of keyword analysis results.
 * @param {string} text - The text from which keywords were extracted.
 * @returns {Promise<KeywordAnalysis[]>} - Enhanced keyword analysis results.
 */
const processKeywords = async (keywords: KeywordAnalysis[], text: string): Promise<KeywordAnalysis[]> => {
  const sentimentAnalyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
  
  return keywords.map(keyword => {
    const sentimentScore = sentimentAnalyzer.getSentiment([keyword.word]);
    const snippet = extractSnippet(text, keyword.word);
    
    return {
      ...keyword,
      sentiment: sentimentScore,
      text: snippet
    };
  });
};

/**
 * Extracts a snippet of text around a keyword.
 * @param {string} text - The full text.
 * @param {string} keyword - The keyword to find the snippet for.
 * @returns {string} - A snippet of text containing the keyword.
 */
const extractSnippet = (text: string, keyword: string): string => {
  const index = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (index === -1) return '';

  const start = Math.max(0, index - 50);
  const end = Math.min(text.length, index + keyword.length + 50);
  return text.substring(start, end);
};

/**
 * Performs sentiment analysis on a given text.
 * @param {string} text - The text to analyze.
 * @returns {{ score: number, label: string }} - Sentiment score and label.
 */
const performSentimentAnalysis = (text: string): { score: number; label: string } => {
  const analyzer = new sentiment();
  const result = analyzer.analyze(text);
  
  let sentimentLabel = 'Neutral';
  if (result.score > 0) {
    sentimentLabel = 'Positive';
  } else if (result.score < 0) {
    sentimentLabel = 'Negative';
  }
  
  return { score: result.score, label: sentimentLabel };
};

/**
 * Generates a timeline of sentiment analysis for a given text.
 * @param {string} text - The text to analyze.
 * @returns {any[]} - Timeline data with sentiment scores.
 */
const generateSentimentTimeline = (text: string): any[] => {
  const sentences = text.split(/[.!?]/).filter(sentence => sentence.trim() !== '');
  const timeline = sentences.map((sentence, index) => {
    const { score, label } = performSentimentAnalysis(sentence);
    return {
      time: `Sentence ${index + 1}`,
      sentiment: score,
      textSnippet: sentence.substring(0, 50) + '...'
    };
  });
  return timeline;
};

/**
 * Groups emotions based on sentiment scores.
 * @param {KeywordAnalysis[]} keywords - Array of keyword analysis results.
 * @returns {{ [key: string]: KeywordAnalysis[] }} - Grouped emotions.
 */
const groupEmotions = (keywords: KeywordAnalysis[]): { [key: string]: KeywordAnalysis[] } => {
  const emotionGroups: { [key: string]: KeywordAnalysis[] } = {};
  
  keywords.forEach(keyword => {
    const tone = keyword.tone || 'Neutral';
    if (emotionGroups[tone]) {
      emotionGroups[tone].push(keyword);
    } else {
      emotionGroups[tone] = [keyword];
    }
  });
  
  return emotionGroups;
};

/**
 * Calculates the emotional spectrum based on sentiment scores.
 * @param {KeywordAnalysis[]} keywords - Array of keyword analysis results.
 * @returns {{ [key: string]: number }} - Emotional spectrum data.
 */
const calculateEmotionalSpectrum = (keywords: KeywordAnalysis[]): { [key: string]: number } => {
  const emotionalSpectrum: { [key: string]: number } = {
    Positive: 0,
    Negative: 0,
    Neutral: 0
  };
  
  keywords.forEach(keyword => {
    if (keyword.sentiment > 0) {
      emotionalSpectrum.Positive += keyword.sentiment;
    } else if (keyword.sentiment < 0) {
      emotionalSpectrum.Negative -= keyword.sentiment;
    } else {
      emotionalSpectrum.Neutral += 1;
    }
  });
  
  return emotionalSpectrum;
};

/**
 * Analyze text with BERT model
 * @param text Input text to analyze
 * @returns BERT analysis results
 */
export const analyzeTextWithBert = async (text: string) => {
  const natural = require('natural');
  const tokenizer = new natural.WordTokenizer();
  const tokenizedText = tokenizer.tokenize(text);

  // Basic Sentiment Analysis
  const analyzer = new sentiment();
  const sentimentAnalysis = analyzer.analyze(text);

  // Keyword Extraction
  const TfIdf = natural.TfIdf;
  const tfidf = new TfIdf();
  tfidf.addDocument(text);

  const keywords: KeywordAnalysis[] = [];
  tfidf.listTerms(0 /* document index */).slice(0, 10).forEach(function(item: any) {
    keywords.push({
      word: item.term,
      sentiment: 0,
      frequency: item.tf,
    });
  });

  // Process Keywords
  const processedKeywords = await processKeywords(keywords, text);

  // Timeline Generation
  const timeline = generateSentimentTimeline(text);

  // Emotion Grouping
  const emotionGroups = groupEmotions(processedKeywords);

  // Emotional Spectrum Calculation
  const emotionalSpectrum = calculateEmotionalSpectrum(processedKeywords);

  // Overall Sentiment Calculation
  let overallSentiment = 0;
  processedKeywords.forEach(keyword => {
    overallSentiment += keyword.sentiment;
  });

  // Determine Sentiment Label
  let sentimentLabel = 'Neutral';
  if (overallSentiment > 0) {
    sentimentLabel = 'Positive';
  } else if (overallSentiment < 0) {
    sentimentLabel = 'Negative';
  }
  
  // Return properly formatted object with score and label
  return {
    keywords: processedKeywords,
    timeline,
    emotionGroups,
    emotionalSpectrum,
    overallSentiment: {
      score: overallSentiment,
      label: sentimentLabel
    }
  };
};
