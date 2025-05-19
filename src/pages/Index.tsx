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
          <h1 className="text-5xl font-bold mb-6 text-black">Your Journal Story</h1>
          
          {/* Image gallery - centered between h1 and p */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            <div className="w-40 h-40 overflow-hidden rounded-lg">
              <img src="/lovable-uploads/af10efad-b724-4a9c-adb3-1924d07e6b29.png" alt="People embracing with hearts" className="w-full h-full object-cover" />
            </div>
            <div className="w-40 h-40 overflow-hidden rounded-lg">
              <img src="/lovable-uploads/b5c157ca-c51a-4eca-9961-a7259b60bc50.png" alt="Couple hugging" className="w-full h-full object-cover" />
            </div>
            <div className="w-32 h-32 overflow-hidden rounded-lg">
              <img src="/lovable-uploads/d52c9b65-6f4d-440b-9f60-52da468666ac.png" alt="Music notes" className="w-full h-full object-cover" />
            </div>
            <div className="w-40 h-40 overflow-hidden rounded-lg">
              <img src="/lovable-uploads/c7a9eec9-9a1e-4654-8742-633493c4eb55.png" alt="Journal writing" className="w-full h-full object-cover" />
            </div>
            <div className="w-32 h-32 overflow-hidden rounded-lg">
              <img src="/lovable-uploads/32442de0-d754-4206-8cf2-b5802b63b564.png" alt="Plant in pot" className="w-full h-full object-cover" />
            </div>
          </div>
          
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white">
              <Link to="/dashboard">
                Get Started
              </Link>
            </Button>
          </div>
        </div>

        {/* Feature highlights with icons */}
        

        {/* How It Works Section */}
        <div className="mb-12 relative z-10">
          
          
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