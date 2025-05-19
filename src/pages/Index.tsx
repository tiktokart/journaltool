import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Flower, Target, Book, BarChart, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import VectorDecorations from "@/components/VectorDecorations";
import { useLanguage } from "@/contexts/LanguageContext";
export default function Index() {
  const {
    t
  } = useLanguage();
  useEffect(() => {
    // Check if the user has visited before
    const hasVisited = localStorage.getItem('hasVisitedOnboarding');

    // If they have, we could automatically redirect to the dashboard
    // Uncomment this to enable auto-redirect after first visit
    /*
    if (hasVisited) {
      window.location.href = '/dashboard';
    }
    */

    // Mark that the user has visited the onboarding page
    localStorage.setItem('hasVisitedOnboarding', 'true');
  }, []);
  return <div className="min-h-screen bg-green">
      <Header />
      <div className="container mx-auto px-4 py-8 pb-16">
        <VectorDecorations type="home" className="absolute inset-0 pointer-events-none" />
        
        <div className="text-center max-w-3xl mx-auto mb-12 relative z-10">
          <h1 className="text-5xl font-bold mb-6 text-black">Welcome to Your Journal Analysis</h1>
          <p className="text-xl mb-8 text-black">
            Track your thoughts, analyze your emotions, and gain insights into your mental well-being.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white">
              <Link to="/dashboard" className="flex items-center gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Feature highlights with icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative z-10">
          
          
          <Card className="border-0 shadow-md bg-white rounded-xl overflow-hidden journal-card">
            
          </Card>
          
          
        </div>

        {/* How It Works Section */}
        <div className="mb-12 relative z-10">
          <h2 className="text-3xl font-bold mb-8 text-center text-black">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">Write Daily</h3>
              <p className="text-gray-700">
                Take a few minutes each day to record your thoughts, feelings, and experiences.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">Get Analyzed</h3>
              <p className="text-gray-700">
                Our AI analyzes your entries to identify emotional patterns and key insights.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-black">Gain Insight</h3>
              <p className="text-gray-700">
                Discover patterns, track your emotional growth, and gain valuable self-awareness.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        
      </div>
    </div>;
}