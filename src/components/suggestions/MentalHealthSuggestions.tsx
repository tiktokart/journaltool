
import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { extractEmotionalKeywords } from "@/utils/bertIntegration";

interface MentalHealthSuggestionsProps {
  journalEntries: any[];
}

interface ResourceDatabase {
  name: string;
  description: string;
  topics: string[];
  url: string;
}

const MentalHealthSuggestions: React.FC<MentalHealthSuggestionsProps> = ({ journalEntries }) => {
  const [suggestions, setSuggestions] = useState<ResourceDatabase[]>([]);

  // Define resource databases - these are real databases for mental health research
  const databases: ResourceDatabase[] = [
    {
      name: "PsycINFO",
      description: "Database of peer-reviewed literature in behavioral sciences and mental health",
      topics: ["psychology", "mental health", "therapy", "counseling", "anxiety", "depression", "research", "cognitive", "behavioral", "emotional", "stress"],
      url: "https://www.apa.org/pubs/databases/psycinfo"
    },
    {
      name: "PsycARTICLES",
      description: "Full-text articles from journals published by APA and allied organizations",
      topics: ["clinical psychology", "psychiatry", "behavioral science", "research", "mental disorders", "therapy", "psychological", "cognitive", "emotional health"],
      url: "https://www.apa.org/pubs/databases/psycarticles"
    },
    {
      name: "SAMHSA Data",
      description: "Substance Abuse and Mental Health Services Administration resources",
      topics: ["substance abuse", "addiction", "recovery", "treatment", "alcohol", "drugs", "mental health", "prevention", "intervention", "support", "crisis"],
      url: "https://www.samhsa.gov/data"
    },
    {
      name: "NIMH Resources",
      description: "National Institute of Mental Health research and resources",
      topics: ["mental disorders", "research", "clinical trials", "depression", "anxiety", "bipolar", "schizophrenia", "suicide", "trauma", "stress", "prevention"],
      url: "https://www.nimh.nih.gov/health"
    },
    {
      name: "CDC Data and Statistics",
      description: "Centers for Disease Control mental health statistics",
      topics: ["statistics", "public health", "epidemiology", "trends", "prevalence", "risk factors", "prevention", "community", "population health", "health behaviors"],
      url: "https://www.cdc.gov/mentalhealth/data_publications"
    },
    {
      name: "Psychology (ProQuest)",
      description: "Abstracts and citations for behavioral sciences literature",
      topics: ["psychology", "cognitive science", "behavioral research", "academic", "scholarly", "neuropsychology", "social psychology", "development", "personality"],
      url: "https://about.proquest.com/en/products-services/psycinfo-set-c"
    },
    {
      name: "Psychology & Behavioral Sciences Collection",
      description: "EBSCO database covering emotional and behavioral characteristics",
      topics: ["emotional health", "behavioral science", "psychiatry", "neuroscience", "relationships", "cognition", "perception", "development", "social behavior"],
      url: "https://www.ebsco.com/products/research-databases/psychology-and-behavioral-sciences-collection"
    },
    {
      name: "APA Resources",
      description: "American Psychological Association mental health resources",
      topics: ["stress", "coping", "wellbeing", "psychological health", "self-care", "resilience", "therapy", "counseling", "professional practice", "guidelines"],
      url: "https://www.apa.org/topics/mental-health"
    },
    {
      name: "PubMed",
      description: "Citations for biomedical literature from MEDLINE and life science journals",
      topics: ["medical", "clinical psychology", "psychiatry", "treatment", "medication", "neurology", "biology", "physiology", "diagnosis", "comorbidity"],
      url: "https://pubmed.ncbi.nlm.nih.gov/"
    },
    {
      name: "BetterHelp",
      description: "Online therapy and counseling resources",
      topics: ["therapy", "counseling", "mental health support", "online therapy", "self-help", "anxiety", "depression", "stress", "relationships", "grief"],
      url: "https://www.betterhelp.com/"
    }
  ];

  useEffect(() => {
    if (journalEntries.length === 0) return;

    // Combine all journal text for more comprehensive analysis
    const allJournalText = journalEntries.map(entry => entry.text).join(" ");
    
    // Extract emotional keywords from journal text
    const emotionAnalysis = extractEmotionalKeywords(allJournalText);
    
    // Check if emotionAnalysis is available and has the expected properties
    const emotionalKeywords = emotionAnalysis?.keywords?.map(k => k.word) || [];
    const emotionCounts = emotionAnalysis?.emotionCounts || {};
    console.log("Emotional keywords for resource matching:", emotionalKeywords);
    
    // Find common words and themes in journal entries
    const words = allJournalText.toLowerCase().split(/\s+/);
    const wordFrequency: Record<string, number> = {};
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length > 3) {
        wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
      }
    });
    
    // Get top words
    const topWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(entry => entry[0]);
      
    console.log("Top words for resource matching:", topWords);
    
    // Calculate relevance score for each resource
    const scoredResources = databases.map(database => {
      let relevanceScore = 0;
      
      // Check how many emotional keywords match this database's topics
      emotionalKeywords.forEach(keyword => {
        if (database.topics.some(topic => topic.includes(keyword) || keyword.includes(topic))) {
          relevanceScore += 2; // Emotional keywords are weighted more heavily
        }
      });
      
      // Check how many top words match this database's topics
      topWords.forEach(word => {
        if (database.topics.some(topic => topic.includes(word) || word.includes(topic))) {
          relevanceScore += 1;
        }
      });
      
      // Boost certain resources based on emotional content
      if (emotionCounts.negative > emotionCounts.positive && 
          database.topics.some(t => ["depression", "anxiety", "stress", "trauma"].includes(t))) {
        relevanceScore += 2;
      }
      
      if (emotionCounts.positive > emotionCounts.negative && 
          database.topics.some(t => ["wellbeing", "resilience", "growth", "self-care"].includes(t))) {
        relevanceScore += 2;
      }
      
      return {
        resource: database,
        score: relevanceScore
      };
    });
    
    // Sort by relevance score and take the top 2-4 resources
    const sortedResources = scoredResources
      .sort((a, b) => b.score - a.score)
      .filter(item => item.score > 0)
      .map(item => item.resource);
    
    // Get 2-4 suggestions
    const numberOfSuggestions = Math.min(Math.max(2, sortedResources.length), 4);
    setSuggestions(sortedResources.slice(0, numberOfSuggestions));
    
    console.log("Selected resources:", sortedResources.slice(0, numberOfSuggestions).map(r => r.name).join(", "));
  }, [journalEntries]);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="p-3">
      <h4 className="font-medium mb-2">Resource Suggestions</h4>
      <p className="text-sm mb-3">Based on your journal entries, these resources may be helpful:</p>
      
      <div className="space-y-2">
        {suggestions.map((resource, index) => (
          <div key={index} className="bg-green-50 p-2 rounded-md">
            <div className="flex justify-between items-start">
              <div>
                <h5 className="text-sm font-medium">{resource.name}</h5>
                <p className="text-xs text-gray-600">{resource.description}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 text-green-700"
                onClick={() => window.open(resource.url, '_blank')}
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Visit</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MentalHealthSuggestions;
