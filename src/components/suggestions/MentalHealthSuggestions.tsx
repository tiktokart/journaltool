
import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowRight } from "lucide-react";
import { extractEmotionalKeywords } from "@/utils/bertIntegration";

interface MentalHealthSuggestionsProps {
  journalEntries: any[];
}

interface ResourceDatabase {
  name: string;
  description: string;
  topics: string[];
  url: string;
  advice?: string;
  actionPlan?: string[];
}

const MentalHealthSuggestions: React.FC<MentalHealthSuggestionsProps> = ({ journalEntries }) => {
  const [suggestions, setSuggestions] = useState<ResourceDatabase[]>([]);
  const [matchedWords, setMatchedWords] = useState<{[key: string]: string[]}>({}); 

  // Define resource databases - these are real databases for mental health research
  const databases: ResourceDatabase[] = [
    {
      name: "PsycINFO",
      description: "Database of peer-reviewed literature in behavioral sciences and mental health",
      topics: ["psychology", "mental health", "therapy", "counseling", "anxiety", "depression", "research", "cognitive", "behavioral", "emotional", "stress"],
      url: "https://www.apa.org/pubs/databases/psycinfo",
      advice: "Consider exploring cognitive-behavioral techniques to address recurring thought patterns",
      actionPlan: [
        "Identify and write down negative thought patterns",
        "Practice challenging these thoughts with rational alternatives",
        "Schedule 5-minute mindfulness breaks throughout your day",
        "Create a journal specifically for tracking thought patterns and their triggers",
        "Review your progress weekly and adjust your approach as needed"
      ]
    },
    {
      name: "PsycARTICLES",
      description: "Full-text articles from journals published by APA and allied organizations",
      topics: ["clinical psychology", "psychiatry", "behavioral science", "research", "mental disorders", "therapy", "psychological", "cognitive", "emotional health"],
      url: "https://www.apa.org/pubs/databases/psycarticles",
      advice: "Based on your entries, developing emotional awareness techniques may be beneficial",
      actionPlan: [
        "Practice naming your emotions specifically when journaling",
        "Set aside 10 minutes daily for emotional check-ins",
        "Explore the physical sensations associated with different emotions",
        "Consider creating an emotion wheel reference for your journal",
        "Practice self-compassion when difficult emotions arise"
      ]
    },
    {
      name: "SAMHSA Data",
      description: "Substance Abuse and Mental Health Services Administration resources",
      topics: ["substance abuse", "addiction", "recovery", "treatment", "alcohol", "drugs", "mental health", "prevention", "intervention", "support", "crisis"],
      url: "https://www.samhsa.gov/data",
      advice: "Creating strong support systems can help maintain resilience during challenging times",
      actionPlan: [
        "Identify 3-5 people you can reach out to when feeling overwhelmed",
        "Research local support groups relevant to your specific challenges",
        "Schedule regular check-ins with trusted friends or family",
        "Create healthy boundaries in relationships that may increase stress",
        "Practice asking for help with small things to build comfort with support"
      ]
    },
    {
      name: "NIMH Resources",
      description: "National Institute of Mental Health research and resources",
      topics: ["mental disorders", "research", "clinical trials", "depression", "anxiety", "bipolar", "schizophrenia", "suicide", "trauma", "stress", "prevention"],
      url: "https://www.nimh.nih.gov/health",
      advice: "Establishing a consistent routine can help stabilize mood and reduce anxiety",
      actionPlan: [
        "Create a simple morning ritual to start each day intentionally",
        "Set regular sleep and wake times, even on weekends",
        "Schedule meals at consistent times to stabilize energy levels",
        "Integrate short mindfulness practices before transitions in your day",
        "Develop an evening wind-down routine to improve sleep quality"
      ]
    },
    {
      name: "CDC Data and Statistics",
      description: "Centers for Disease Control mental health statistics",
      topics: ["statistics", "public health", "epidemiology", "trends", "prevalence", "risk factors", "prevention", "community", "population health", "health behaviors"],
      url: "https://www.cdc.gov/mentalhealth/data_publications",
      advice: "Physical activity is strongly linked to improved mental well-being",
      actionPlan: [
        "Start with just 5-10 minutes of movement daily and gradually increase",
        "Find activities you genuinely enjoy rather than focusing on exercise as a chore",
        "Consider walking meetings or phone calls to incorporate movement naturally",
        "Use stretching or movement as a break when feeling mentally stuck",
        "Track how different types of movement affect your mood and energy"
      ]
    },
    {
      name: "Psychology (ProQuest)",
      description: "Abstracts and citations for behavioral sciences literature",
      topics: ["psychology", "cognitive science", "behavioral research", "academic", "scholarly", "neuropsychology", "social psychology", "development", "personality"],
      url: "https://about.proquest.com/en/products-services/psycinfo-set-c",
      advice: "Developing a growth mindset can help with challenges identified in your entries",
      actionPlan: [
        "Practice reframing setbacks as learning opportunities",
        "Add \"yet\" to statements about things you can't do",
        "Set small, achievable goals to build confidence through progress",
        "Celebrate effort and strategy rather than just outcomes",
        "Seek feedback and view it as valuable information rather than criticism"
      ]
    },
    {
      name: "Psychology & Behavioral Sciences Collection",
      description: "EBSCO database covering emotional and behavioral characteristics",
      topics: ["emotional health", "behavioral science", "psychiatry", "neuroscience", "relationships", "cognition", "perception", "development", "social behavior"],
      url: "https://www.ebsco.com/products/research-databases/psychology-and-behavioral-sciences-collection",
      advice: "Working on interpersonal boundaries may help address recurring themes in your journal",
      actionPlan: [
        "Practice saying no to requests that drain your energy",
        "Identify your core values to guide boundary decisions",
        "Use \"I\" statements when communicating boundaries (\"I need...\" rather than \"You should...\")",
        "Start with small boundary-setting exercises in low-risk situations",
        "Reflect on how enforcing boundaries affects your emotional well-being"
      ]
    },
    {
      name: "APA Resources",
      description: "American Psychological Association mental health resources",
      topics: ["stress", "coping", "wellbeing", "psychological health", "self-care", "resilience", "therapy", "counseling", "professional practice", "guidelines"],
      url: "https://www.apa.org/topics/mental-health",
      advice: "Developing personalized stress management techniques can help with recurring challenges",
      actionPlan: [
        "Identify your unique stress signals (physical, emotional, cognitive)",
        "Create a list of 5-minute stress reset activities that work for you",
        "Develop a \"stress first aid kit\" with sensory items (sounds, scents, textures)",
        "Practice time-blocking to prevent overwhelm with complex tasks",
        "Implement a weekly review to identify stress patterns and effective responses"
      ]
    },
    {
      name: "PubMed",
      description: "Citations for biomedical literature from MEDLINE and life science journals",
      topics: ["medical", "clinical psychology", "psychiatry", "treatment", "medication", "neurology", "biology", "physiology", "diagnosis", "comorbidity"],
      url: "https://pubmed.ncbi.nlm.nih.gov/",
      advice: "Mind-body connection practices may help with symptoms mentioned in your entries",
      actionPlan: [
        "Practice a 2-minute body scan meditation at key points throughout your day",
        "Notice connections between physical sensations and emotional states",
        "Experiment with different breathing techniques for various situations",
        "Try progressive muscle relaxation before potentially stressful situations",
        "Keep a joint log of physical symptoms and emotional experiences"
      ]
    },
    {
      name: "BetterHelp",
      description: "Online therapy and counseling resources",
      topics: ["therapy", "counseling", "mental health support", "online therapy", "self-help", "anxiety", "depression", "stress", "relationships", "grief"],
      url: "https://www.betterhelp.com/",
      advice: "Regular self-reflection practices can complement professional support",
      actionPlan: [
        "Set aside 5-15 minutes daily for focused journaling",
        "Create specific journaling prompts based on current challenges",
        "Try different reflection formats (lists, free writing, diagrams)",
        "Review your journal monthly to identify patterns and progress",
        "Consider sharing insights from your reflections with a trusted support person"
      ]
    }
  ];

  useEffect(() => {
    if (journalEntries.length === 0) return;

    // Combine all journal text for comprehensive analysis
    const allJournalText = journalEntries.map(entry => entry.text).join(" ");
    
    // Extract emotional keywords from journal text
    const emotionAnalysis = extractEmotionalKeywords(allJournalText);
    
    // Check if emotionAnalysis is available and has expected properties
    const emotionalKeywords = emotionAnalysis?.keywords?.map(k => k.word.toLowerCase()) || [];
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
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(entry => entry[0]);
      
    console.log("Top words for resource matching:", topWords);
    
    // Calculate relevance score for each resource and track matched words
    const matchedWordsMap: {[key: string]: string[]} = {};
    const scoredResources = databases.map(database => {
      let relevanceScore = 0;
      const matchedWordsForThisDatabase: string[] = [];
      
      // Check how many emotional keywords match this database's topics
      emotionalKeywords.forEach(keyword => {
        database.topics.forEach(topic => {
          if (topic.includes(keyword) || keyword.includes(topic)) {
            relevanceScore += 2; // Emotional keywords weighted more heavily
            matchedWordsForThisDatabase.push(keyword);
          }
        });
      });
      
      // Check how many top words match this database's topics
      topWords.forEach(word => {
        database.topics.forEach(topic => {
          if (topic.includes(word) || word.includes(topic)) {
            relevanceScore += 1;
            matchedWordsForThisDatabase.push(word);
          }
        });
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
      
      // Store unique matched words for this database
      if (matchedWordsForThisDatabase.length > 0) {
        matchedWordsMap[database.name] = [...new Set(matchedWordsForThisDatabase)];
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
    const selectedSuggestions = sortedResources.slice(0, numberOfSuggestions);
    
    setSuggestions(selectedSuggestions);
    setMatchedWords(matchedWordsMap);
    
    console.log("Selected resources:", selectedSuggestions.map(r => r.name).join(", "));
    console.log("Matched words:", matchedWordsMap);
  }, [journalEntries]);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="p-3">
      <h4 className="font-medium mb-2">Resource Suggestions</h4>
      <p className="text-sm mb-3">Based on your journal entries, these resources may be helpful:</p>
      
      <div className="space-y-3">
        {suggestions.map((resource, index) => (
          <div key={index} className="bg-green-50 p-3 rounded-md">
            <div className="mb-2">
              <h5 className="text-sm font-medium">{resource.name}</h5>
              <p className="text-xs text-gray-600 mt-1">{resource.advice || resource.description}</p>
              
              {matchedWords[resource.name] && matchedWords[resource.name].length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Matched words: {matchedWords[resource.name].slice(0, 3).join(", ")}</p>
                </div>
              )}
            </div>
            
            {resource.actionPlan && (
              <div className="mt-3">
                <p className="text-xs font-medium text-green-800 mb-1">Action Plan:</p>
                <ul className="text-xs space-y-1">
                  {resource.actionPlan.slice(0, 3).map((step, i) => (
                    <li key={i} className="flex items-start">
                      <ArrowRight className="h-3 w-3 mr-1 mt-0.5 text-green-600" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
                {resource.actionPlan.length > 3 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-xs text-green-700 mt-1 h-auto p-1"
                    onClick={() => window.open(resource.url, '_blank')}
                  >
                    <span className="mr-1">See full plan</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MentalHealthSuggestions;
