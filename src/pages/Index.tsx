
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Flower, Target, Book, BarChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import VectorDecorations from "@/components/VectorDecorations";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Index() {
  const { t } = useLanguage();
  
  useEffect(() => {
    // Check if the user has visited before
    const hasVisited = localStorage.getItem('hasVisitedOnboarding');
    
    // Mark that the user has visited the onboarding page
    localStorage.setItem('hasVisitedOnboarding', 'true');
  }, []);

  return (
    <div className="min-h-screen bg-green">
      <Header />
      <div className="container mx-auto px-4 py-8 pb-16">
        <VectorDecorations type="home" className="absolute inset-0 pointer-events-none" />
        
        <div className="text-center max-w-3xl mx-auto mb-12 relative z-10">
          <h1 className="text-5xl font-bold mb-6 text-black">Welcome to Your Journal Analysis</h1>
          <p className="text-xl mb-8 text-black">
            Track your thoughts, analyze your emotions, and gain insights into your mental well-being.
          </p>
        </div>

        {/* Feature highlights with icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative z-10">
          <Card className="border-0 shadow-md bg-white rounded-xl overflow-hidden journal-card">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <Target className="h-5 w-5 text-green-600 icon-dance" />
                </div>
                <h3 className="text-xl font-semibold text-black">Track Your Journey</h3>
              </div>
              <p className="text-black">
                Record your daily thoughts and feelings to build a meaningful record of your personal growth.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-white rounded-xl overflow-hidden journal-card">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <Book className="h-5 w-5 text-green-600 icon-dance" />
                </div>
                <h3 className="text-xl font-semibold text-black">Emotional Insights</h3>
              </div>
              <p className="text-black">
                Gain deep understanding of your emotional patterns and identify what truly matters to you.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-white rounded-xl overflow-hidden journal-card">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <BarChart className="h-5 w-5 text-green-600 icon-dance" />
                </div>
                <h3 className="text-xl font-semibold text-black">AI Analysis</h3>
              </div>
              <p className="text-black">
                Our advanced AI analyzes your journal entries to reveal patterns and provide personalized insights.
              </p>
            </CardContent>
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
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-2xl mx-auto relative z-10 journal-card mb-16">
          <h2 className="text-2xl font-bold mb-4 text-black">Ready to Begin Your Journey?</h2>
          <p className="text-gray-700 mb-6">
            Start recording your thoughts today and unlock powerful insights about yourself.
          </p>
        </div>
      </div>
    </div>
  );
}
