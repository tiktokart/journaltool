
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { FileText, BarChart2, TrendingUp, PieChart } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="lg:w-1/2 space-y-6 animate-fade-in">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-heading leading-tight">
                  Analyze Document Sentiment with Powerful Visualizations
                </h1>
                <p className="text-lg text-gray-600 max-w-xl">
                  Upload your PDF documents and get instant sentiment analysis with 
                  beautiful, interactive visualizations to understand the emotional 
                  tone of your content.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Button asChild size="lg" className="rounded-full">
                    <Link to="/dashboard">Try It Now</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full">
                    <a href="#features">Learn More</a>
                  </Button>
                </div>
              </div>
              <div className="lg:w-1/2 animate-scale-in">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl"></div>
                  <Card className="glass-panel rounded-3xl overflow-hidden border-0 shadow-2xl relative">
                    <CardContent className="p-0">
                      <img 
                        src="/placeholder.svg" 
                        alt="Sentiment Analysis Dashboard" 
                        className="w-full h-auto object-cover"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold gradient-heading mb-4">
                Powerful Sentiment Analysis Features
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our sentiment analysis tool provides deep insights into the emotional content of your documents
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <FileText className="h-10 w-10 text-primary" />,
                  title: "PDF Processing",
                  description: "Upload any PDF document and extract text for sentiment analysis"
                },
                {
                  icon: <BarChart2 className="h-10 w-10 text-secondary" />,
                  title: "Visual Analytics",
                  description: "Interactive charts and graphs to visualize sentiment patterns"
                },
                {
                  icon: <TrendingUp className="h-10 w-10 text-accent" />,
                  title: "Trend Analysis",
                  description: "Track sentiment changes throughout your document"
                },
                {
                  icon: <PieChart className="h-10 w-10 text-sentiment-neutral" />,
                  title: "Sentiment Breakdown",
                  description: "Detailed positive, neutral, and negative sentiment distribution"
                }
              ].map((feature, index) => (
                <Card key={index} className="card-gradient border-0">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="mb-4 p-3 bg-background rounded-full">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-10 md:p-16 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Analyze Your Documents?
              </h2>
              <p className="text-lg max-w-2xl mx-auto mb-8">
                Get started with our powerful sentiment analysis tool today and gain valuable insights
                from your documents.
              </p>
              <Button asChild size="lg" variant="secondary" className="rounded-full bg-white text-primary hover:bg-white/90">
                <Link to="/dashboard">Start Analyzing Now</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
