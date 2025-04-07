
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SentimentOverview } from "@/components/SentimentOverview";
import { SentimentTimeline } from "@/components/SentimentTimeline";
import { EntitySentiment } from "@/components/EntitySentiment";
import { KeyPhrases } from "@/components/KeyPhrases";
import { DocumentEmbedding } from "@/components/DocumentEmbedding";
import { Point } from "@/types/embedding";
import { generateMockPoints } from "@/utils/embeddingUtils";
import { FileUploader } from "@/components/FileUploader";

const exampleJournalData = {
  overallSentiment: {
    score: 0.35,
    label: "Negative"
  },
  distribution: {
    positive: 20,
    neutral: 35,
    negative: 45
  },
  timeline: Array.from({ length: 10 }, (_, i) => ({
    page: i + 1,
    score: 0.2 + (i * 0.05),
    text: [
      "Today was particularly challenging. My anxiety felt overwhelming from the moment I woke up.",
      "I struggled to get out of bed, feeling like a heavy weight was pressing down on my chest.",
      "During breakfast, I had trouble focusing on simple tasks. My mind kept racing with worries.",
      "My therapist suggested trying deep breathing exercises when I feel overwhelmed.",
      "I tried the breathing technique during lunch when I started feeling anxious again.",
      "It helped a bit, but I still felt on edge for most of the afternoon.",
      "By evening, I was exhausted from fighting my anxiety all day.",
      "I managed to do some light reading before bed, which was a small accomplishment.",
      "Tomorrow, I'll try to incorporate more grounding techniques my therapist suggested.",
      "Despite today's difficulties, I'm trying to remember that not every day will be this hard."
    ][i]
  })),
  entities: [
    {
      name: "Anxiety",
      sentiment: 0.15,
      mentions: 8,
      contexts: ["My anxiety felt overwhelming", "fighting my anxiety all day"]
    },
    {
      name: "Therapist",
      sentiment: 0.65,
      mentions: 3,
      contexts: ["My therapist suggested", "techniques my therapist suggested"]
    },
    {
      name: "Breathing",
      sentiment: 0.55,
      mentions: 2,
      contexts: ["deep breathing exercises", "the breathing technique"]
    },
    {
      name: "Sleep",
      sentiment: 0.3,
      mentions: 2,
      contexts: ["struggled to get out of bed", "reading before bed"]
    }
  ],
  keyPhrases: [
    {
      phrase: "anxiety",
      relevance: 0.95,
      sentiment: 0.15,
      occurrences: 3
    },
    {
      phrase: "overwhelming",
      relevance: 0.85,
      sentiment: 0.10,
      occurrences: 2
    },
    {
      phrase: "deep breathing",
      relevance: 0.80,
      sentiment: 0.60,
      occurrences: 2
    },
    {
      phrase: "therapist",
      relevance: 0.75,
      sentiment: 0.65,
      occurrences: 2
    },
    {
      phrase: "grounding techniques",
      relevance: 0.70,
      sentiment: 0.65,
      occurrences: 1
    },
    {
      phrase: "struggled",
      relevance: 0.65,
      sentiment: 0.25,
      occurrences: 1
    }
  ],
  sourceDescription: "Example Journal Entry"
};

const exampleJournalText = `
Today was particularly challenging. My anxiety felt overwhelming from the moment I woke up. I struggled to get out of bed, feeling like a heavy weight was pressing down on my chest. During breakfast, I had trouble focusing on simple tasks. My mind kept racing with worries.

My therapist suggested trying deep breathing exercises when I feel overwhelmed. I tried the breathing technique during lunch when I started feeling anxious again. It helped a bit, but I still felt on edge for most of the afternoon.

By evening, I was exhausted from fighting my anxiety all day. I managed to do some light reading before bed, which was a small accomplishment. Tomorrow, I'll try to incorporate more grounding techniques my therapist suggested. Despite today's difficulties, I'm trying to remember that not every day will be this hard.
`;

const Home = () => {
  const [points] = useState<Point[]>(() => generateMockPoints(exampleJournalText, exampleJournalData, false));

  const handleFilesAdded = (files: File[], extractedText?: string) => {
    console.log('Files added:', files);
    console.log('Extracted text:', extractedText);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-12">
          <div className="space-y-6 mb-10">
            <h1 className="text-4xl font-bold tracking-tight">Emotional Intelligence for Mental Health</h1>
            <p className="text-lg text-muted-foreground">
              Analyze your journal entries, therapy notes, and personal narratives 
              to gain deeper insights into your emotional patterns and mental health journey.
            </p>
          </div>
          
          <div className="rounded-lg overflow-hidden shadow-xl border min-h-[450px] border-border relative">
            <DocumentEmbedding 
              points={points}
              isInteractive={false}
              sourceDescription="Example Journal Visualization"
            />
          </div>
        </div>
        
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold tracking-tight">See How It Works</h2>
          
          <div className="mt-8 mb-12">
            <h2 className="text-2xl font-semibold tracking-tight mb-6">Upload Your Journal</h2>
            <p className="text-muted-foreground mb-6">
              Upload your personal journal, therapy notes, or any text document to gain insights into your emotional patterns.
            </p>
            <FileUploader onFilesAdded={handleFilesAdded} />
          </div>
          
          <Card className="shadow-md border-border">
            <CardHeader>
              <CardTitle>Journal Entry Analysis Example</CardTitle>
              <CardDescription>
                See how our AI analyzes emotional patterns and mental health indicators in journal entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="overflow-x-auto w-full justify-start">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="themes">Themes</TabsTrigger>
                  <TabsTrigger value="keyphrases">Key Words</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-6">
                  <SentimentOverview 
                    data={{
                      overallSentiment: exampleJournalData.overallSentiment,
                      distribution: exampleJournalData.distribution,
                      fileName: "Journal Entry Example"
                    }}
                    sourceDescription={exampleJournalData.sourceDescription}
                  />
                </TabsContent>
                
                <TabsContent value="timeline" className="mt-6">
                  <SentimentTimeline 
                    data={exampleJournalData.timeline}
                    sourceDescription={exampleJournalData.sourceDescription}
                  />
                </TabsContent>
                
                <TabsContent value="themes" className="mt-6">
                  <EntitySentiment 
                    data={exampleJournalData.entities}
                    sourceDescription={exampleJournalData.sourceDescription}
                  />
                </TabsContent>
                
                <TabsContent value="keyphrases" className="mt-6">
                  <KeyPhrases 
                    data={exampleJournalData.keyPhrases}
                    sourceDescription={exampleJournalData.sourceDescription}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <div className="w-full h-[350px]">
                <DocumentEmbedding 
                  points={points}
                  isInteractive={false}
                  sourceDescription="Example Journal Visualization"
                />
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
