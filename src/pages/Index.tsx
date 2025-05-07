
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BarChart2, FileText, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-grow">
        <section className="py-12 md:py-20 px-4">
          <div className="container mx-auto max-w-5xl text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              A digital tool to understand your dreams and emotions
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Upload your journal entries and discover the emotional patterns hidden within your thoughts.
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="px-8">
                Start Your Analysis
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-12 bg-muted/50 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Mental Health in the United States</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                    Adult Prevalence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold inline-block text-muted-foreground">
                        21.0% of adults experienced mental illness
                      </span>
                      <span className="text-xs font-semibold inline-block text-primary">
                        52.9M Americans
                      </span>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary/20">
                      <div style={{ width: "21%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"></div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold inline-block text-muted-foreground">
                        5.6% of adults experienced serious mental illness
                      </span>
                      <span className="text-xs font-semibold inline-block text-primary">
                        14.2M Americans
                      </span>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary/20">
                      <div style={{ width: "5.6%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                    Youth Prevalence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold inline-block text-muted-foreground">
                        16.4% of youth experienced depression
                      </span>
                      <span className="text-xs font-semibold inline-block text-primary">
                        3.9M youths
                      </span>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary/20">
                      <div style={{ width: "16.4%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"></div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold inline-block text-muted-foreground">
                        15.1% had severe major depressive episodes
                      </span>
                      <span className="text-xs font-semibold inline-block text-primary">
                        2.7M youths
                      </span>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary/20">
                      <div style={{ width: "15.1%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                    Access to Care
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold inline-block text-muted-foreground">
                        28.2% of adults with mental illness are not treated
                      </span>
                      <span className="text-xs font-semibold inline-block text-primary">
                        14.9M Americans
                      </span>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary/20">
                      <div style={{ width: "28.2%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"></div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold inline-block text-muted-foreground">
                        60% of youth with depression do not receive treatment
                      </span>
                      <span className="text-xs font-semibold inline-block text-primary">
                        2.4M youths
                      </span>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary/20">
                      <div style={{ width: "60%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <p className="text-sm text-center mt-4 text-muted-foreground">Source: Mental Health America's State and County Dashboard</p>
          </div>
        </section>
        
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload Your Journal</h3>
                <p className="text-muted-foreground">
                  Upload your text journals, write directly, or use voice-to-text to capture your thoughts.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Analyze Emotions</h3>
                <p className="text-muted-foreground">
                  Our advanced AI models detect emotional patterns and sentiment within your writing.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Gain Insights</h3>
                <p className="text-muted-foreground">
                  Visualize your emotional landscape and discover patterns in your thoughts and feelings.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
