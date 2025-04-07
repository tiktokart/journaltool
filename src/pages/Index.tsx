
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DocumentEmbedding } from "@/components/DocumentEmbedding";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow flex items-center">
        <div className="container mx-auto max-w-7xl px-4 py-10 md:py-16">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl md:text-5xl font-bold text-center mb-6 text-foreground">
              Journal Analysis
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl text-center mb-8">
              Visualize emotional patterns in your journal through interactive latent emotional analysis
            </p>
            
            {/* 3D Visualization Container */}
            <div className="w-full max-w-6xl aspect-[16/9] mb-8 bg-card border border-border rounded-xl overflow-hidden shadow-lg">
              <DocumentEmbedding isInteractive={true} />
            </div>
            
            <Button asChild size="lg" className="rounded-md mt-4">
              <Link to="/dashboard" className="flex items-center gap-2">
                Analyze Documents <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
