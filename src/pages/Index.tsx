
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DocumentEmbedding } from "@/components/DocumentEmbedding";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow">
        {/* Main Section with 3D Visualization */}
        <section className="py-10 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col items-center">
              <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-900">
                Document Embedding Projector
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl text-center mb-12">
                Upload your PDF documents and visualize semantic relationships through interactive 3D word embeddings
              </p>
              
              {/* 3D Visualization Container */}
              <div className="w-full max-w-6xl aspect-[16/10] mb-10 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                <DocumentEmbedding />
              </div>
              
              <div className="flex gap-4 mt-4">
                <Button asChild size="lg" className="rounded-md">
                  <Link to="/dashboard" className="flex items-center gap-2">
                    Analyze Documents <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Simple Features Section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Document Analysis</h3>
                <p className="text-gray-600">
                  Upload PDFs and extract semantic meaning from your documents
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 8v4l3 3"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-time Processing</h3>
                <p className="text-gray-600">
                  Fast and efficient analysis with interactive results
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"></path>
                    <line x1="2" y1="20" x2="2" y2="20"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Data Visualization</h3>
                <p className="text-gray-600">
                  Explore relationships between concepts with 3D visualization
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
