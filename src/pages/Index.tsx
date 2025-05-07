
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Flower } from "lucide-react";

export default function Index() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-yellow">
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center max-w-3xl px-4">
          <h1 className="text-5xl font-bold mb-6 text-black">Welcome to Your Life Planner</h1>
          <p className="text-xl mb-8 text-black">
            Plan your perfect life, analyze your thoughts, and track your emotional well-being.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-purple hover:bg-purple-dark text-black">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
