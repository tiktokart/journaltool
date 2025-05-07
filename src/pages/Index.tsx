import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Link } from "react-router-dom";
import { DocumentEmbedding } from "@/components/DocumentEmbedding";
import { generateMockPoints } from "@/utils/embeddingUtils";
import { WordComparisonController } from "@/components/WordComparisonController";
import { useState } from "react";
import { Point } from "@/types/embedding";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Index() {
  const { t } = useLanguage();
  const [demoPoints] = useState(() => generateMockPoints(true));
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  
  const handlePointClick = (point: Point | null) => {
    setSelectedPoint(point);
  };
  
  const calculateRelationship = (point1: Point, point2: Point) => {
    const distance = Math.sqrt(
      Math.pow(point1.position[0] - point2.position[0], 2) +
      Math.pow(point1.position[1] - point2.position[1], 2) +
      Math.pow(point1.position[2] - point2.position[2], 2)
    );
    
    const spatialSimilarity = Math.max(0, 1 - (distance / 40));
    
    const sentimentDiff = Math.abs(point1.sentiment - point2.sentiment);
    const sentimentSimilarity = 1 - sentimentDiff;
    
    const sameEmotionalGroup = 
      (point1.emotionalTone || "Neutral") === (point2.emotionalTone || "Neutral");
    
    const point1Keywords = point1.keywords || [];
    const point2Keywords = point2.keywords || [];
    const sharedKeywords = point1Keywords.filter(k => point2Keywords.includes(k));
    
    return {
      spatialSimilarity,
      sentimentSimilarity,
      sameEmotionalGroup,
      sharedKeywords
    };
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Hero Section */}
          <section className="text-center space-y-6 py-12">
            <h1 className="text-4xl md:text-6xl font-bold text-black">
              {t("heroTitle")}
            </h1>
            
            <p className="text-xl md:text-2xl text-black max-w-3xl mx-auto">
              {t("heroSubtitle")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link to="/dashboard">
                <Button size="lg" className="bg-orange hover:bg-orange/90 text-white px-8">
                  {t("getStarted")}
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-orange text-orange hover:bg-orange/10">
                {t("learnMore")}
              </Button>
            </div>
          </section>
          
          {/* Feature Section */}
          <section className="grid md:grid-cols-2 gap-8 py-12">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-black">{t("interactiveVisualization")}</h2>
              <p className="text-lg text-black">{t("interactiveDescription")}</p>
              <p className="text-md text-black">This is a generated text about a recount of someone having a panic attack.</p>
            </div>
            <Card className="overflow-hidden border border-lavender bg-lavender">
              <div className="h-[400px] w-full">
                <DocumentEmbedding 
                  points={demoPoints} 
                  isInteractive={true}
                  onPointClick={handlePointClick}
                  depressedJournalReference={true}
                />
              </div>
            </Card>
          </section>
          
          {/* Word Comparison Demo */}
          <section className="py-12">
            <h2 className="text-3xl font-bold mb-8 text-black">{t("wordComparisonTitle")}</h2>
            <WordComparisonController 
              points={demoPoints}
              selectedPoint={selectedPoint}
              calculateRelationship={calculateRelationship}
              sourceDescription={t("demoData")}
            />
          </section>
          
          {/* Benefits Cards */}
          <section className="py-12">
            <h2 className="text-3xl font-bold mb-8 text-center text-black">{t("benefitsTitle")}</h2>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <Card className="bg-lavender border-lavender">
                <CardHeader>
                  <CardTitle className="text-black">{t("benefit1Title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-black">{t("benefit1Description")}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-lavender border-lavender">
                <CardHeader>
                  <CardTitle className="text-black">{t("benefit2Title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-black">{t("benefit2Description")}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-lavender border-lavender">
                <CardHeader>
                  <CardTitle className="text-black">{t("benefit3Title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-black">{t("benefit3Description")}</p>
                </CardContent>
              </Card>
            </div>
          </section>
          
          {/* CTA Section */}
          <section className="bg-lavender rounded-2xl p-8 text-center space-y-6">
            <h2 className="text-3xl font-bold text-black">{t("ctaTitle")}</h2>
            <p className="text-xl text-black">{t("ctaDescription")}</p>
            
            <div className="mt-6">
              <Link to="/dashboard">
                <Button size="lg" className="bg-orange hover:bg-orange/90 text-white px-8">
                  {t("startAnalyzing")}
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
