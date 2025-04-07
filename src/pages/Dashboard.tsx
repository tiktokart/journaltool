
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FileUploader } from "@/components/FileUploader";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentEmbedding } from "@/components/DocumentEmbedding";
import { SentimentOverview } from "@/components/SentimentOverview";
import { SentimentTimeline } from "@/components/SentimentTimeline";
import { EntitySentiment } from "@/components/EntitySentiment";
import { KeyPhrases } from "@/components/KeyPhrases";
import { Button } from "@/components/ui/button";
import { Point } from "@/types/embedding";
import { generateMockPoints } from "@/utils/embeddingUtils";

// Mock data for initial dashboard state
const initialData = {
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
    text: "Sample text content for timeline item " + (i + 1)
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
    }
  ]
};

const sampleText = `
Today was particularly challenging. My anxiety felt overwhelming from the moment I woke up. I struggled to get out of bed, feeling like a heavy weight was pressing down on my chest. During breakfast, I had trouble focusing on simple tasks. My mind kept racing with worries.

My therapist suggested trying deep breathing exercises when I feel overwhelmed. I tried the breathing technique during lunch when I started feeling anxious again. It helped a bit, but I still felt on edge for most of the afternoon.

By evening, I was exhausted from fighting my anxiety all day. I managed to do some light reading before bed, which was a small accomplishment. Tomorrow, I'll try to incorporate more grounding techniques my therapist suggested. Despite today's difficulties, I'm trying to remember that not every day will be this hard.
`;

const Dashboard = () => {
  const [hasUploadedFile, setHasUploadedFile] = useState(false);
  const [fileName, setFileName] = useState("");
  const [points, setPoints] = useState<Point[]>([]);
  
  const handleFilesAdded = (files: File[], extractedText?: string) => {
    if (files && files.length > 0) {
      setHasUploadedFile(true);
      setFileName(files[0].name);
      
      // Generate embedding points from the extracted text
      if (extractedText) {
        const newPoints = generateMockPoints(extractedText, initialData);
        setPoints(newPoints);
      }
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Analysis Dashboard</h1>
        
        {!hasUploadedFile ? (
          <div className="max-w-3xl mx-auto my-12">
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Document</CardTitle>
                <CardDescription>
                  Upload a journal entry, therapy notes, or any personal narrative to analyze emotional patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploader onFilesAdded={handleFilesAdded} />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-2/3">
                <Card className="shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle>Analysis Results: {fileName}</CardTitle>
                    <CardDescription>
                      Emotional and sentiment analysis of your document
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
                            overallSentiment: initialData.overallSentiment,
                            distribution: initialData.distribution,
                            fileName: fileName
                          }}
                          sourceDescription={fileName}
                        />
                      </TabsContent>
                      
                      <TabsContent value="timeline" className="mt-6">
                        <SentimentTimeline 
                          data={initialData.timeline}
                          sourceDescription={fileName}
                        />
                      </TabsContent>
                      
                      <TabsContent value="themes" className="mt-6">
                        <EntitySentiment 
                          data={initialData.entities}
                          sourceDescription={fileName}
                        />
                      </TabsContent>
                      
                      <TabsContent value="keyphrases" className="mt-6">
                        <KeyPhrases 
                          data={initialData.keyPhrases}
                          sourceDescription={fileName}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => setHasUploadedFile(false)}
                      variant="outline"
                    >
                      Upload Another Document
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="w-full md:w-1/3 min-h-[350px]">
                <Card className="shadow-md h-full">
                  <CardHeader className="pb-2">
                    <CardTitle>Document Map</CardTitle>
                    <CardDescription>
                      Semantic embedding visualization
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] relative">
                    <DocumentEmbedding 
                      points={points.length > 0 ? points : generateMockPoints(sampleText, initialData)}
                      isInteractive={true}
                      sourceDescription={fileName || "Sample Text"}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>
                  Based on our analysis of your document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      title: "Emotional Patterns",
                      description: "Your writing shows patterns of anxiety that might benefit from mindfulness techniques."
                    },
                    {
                      title: "Cognitive Framework",
                      description: "Consider journaling about positive experiences to balance negative thought patterns."
                    },
                    {
                      title: "Self-Care Strategies",
                      description: "The breathing techniques mentioned appear helpful - consider expanding these practices."
                    }
                  ].map((recommendation, index) => (
                    <Card key={index} className="bg-secondary/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{recommendation.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
