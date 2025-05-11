
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

  // Define our resource databases
  const databases: ResourceDatabase[] = [
    {
      name: "PsycINFO",
      description: "Database of peer-reviewed literature in behavioral sciences and mental health",
      topics: ["psychology", "mental health", "therapy", "counseling", "anxiety", "depression"],
      url: "https://www.apa.org/pubs/databases/psycinfo"
    },
    {
      name: "PsycARTICLES",
      description: "Full-text articles from journals published by APA and allied organizations",
      topics: ["clinical psychology", "psychiatry", "behavioral science", "research"],
      url: "https://www.apa.org/pubs/databases/psycarticles"
    },
    {
      name: "SAMHSA Data",
      description: "Substance Abuse and Mental Health Services Administration resources",
      topics: ["substance abuse", "addiction", "recovery", "treatment", "alcohol", "drugs"],
      url: "https://www.samhsa.gov/data"
    },
    {
      name: "NIMH Resources",
      description: "National Institute of Mental Health research and resources",
      topics: ["mental disorders", "research", "clinical trials", "depression", "anxiety", "bipolar", "schizophrenia"],
      url: "https://www.nimh.nih.gov/health"
    },
    {
      name: "CDC Data and Statistics",
      description: "Centers for Disease Control mental health statistics",
      topics: ["statistics", "public health", "epidemiology", "trends", "prevalence"],
      url: "https://www.cdc.gov/mentalhealth/data_publications"
    },
    {
      name: "Psychology (ProQuest)",
      description: "Abstracts and citations for behavioral sciences literature",
      topics: ["psychology", "cognitive science", "behavioral research", "academic", "scholarly"],
      url: "https://about.proquest.com/en/products-services/psycinfo-set-c"
    },
    {
      name: "Psychology & Behavioral Sciences Collection",
      description: "EBSCO database covering emotional and behavioral characteristics",
      topics: ["emotional health", "behavioral science", "psychiatry", "neuroscience"],
      url: "https://www.ebsco.com/products/research-databases/psychology-and-behavioral-sciences-collection"
    },
    {
      name: "APA Resources",
      description: "American Psychological Association mental health resources",
      topics: ["stress", "coping", "wellbeing", "psychological health", "self-care"],
      url: "https://www.apa.org/topics/mental-health"
    },
    {
      name: "PubMed",
      description: "Citations for biomedical literature from MEDLINE and life science journals",
      topics: ["medical", "clinical psychology", "psychiatry", "treatment", "medication", "neurology"],
      url: "https://pubmed.ncbi.nlm.nih.gov/"
    },
    {
      name: "BetterHelp",
      description: "Online therapy and counseling resources",
      topics: ["therapy", "counseling", "mental health support", "online therapy", "self-help"],
      url: "https://www.betterhelp.com/"
    }
  ];

  useEffect(() => {
    if (journalEntries.length === 0) return;

    // Combine all journal text
    const allJournalText = journalEntries.map(entry => entry.text).join(" ");
    
    // Extract emotional keywords from journal text
    const emotionAnalysis = extractEmotionalKeywords(allJournalText);
    
    // Check if emotionAnalysis is available and has the expected properties
    const emotionalKeywords = emotionAnalysis?.keywords?.map(k => k.word) || [];
    const emotionCounts = emotionAnalysis?.emotionCounts || {};
    
    // Find common words and themes in journal entries
    const words = allJournalText.toLowerCase().split(/\s+/);
    const wordFrequency: Record<string, number> = {};
    
    words.forEach(word => {
      if (word.length > 3) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });
    
    // Get top words
    const topWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(entry => entry[0]);
    
    // Match resources based on keywords
    const matchedResources = databases.filter(database => {
      return database.topics.some(topic => 
        topWords.some(word => topic.includes(word)) || 
        emotionalKeywords.some(keyword => topic.includes(keyword))
      );
    });
    
    // Get 2-4 suggestions
    const numberOfSuggestions = Math.min(Math.max(2, matchedResources.length), 4);
    setSuggestions(matchedResources.slice(0, numberOfSuggestions));
    
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
