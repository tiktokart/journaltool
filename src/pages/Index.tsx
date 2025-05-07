
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Index() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-foreground">
      <div className="text-center max-w-3xl px-4">
        <h1 className="text-5xl font-bold gradient-heading mb-6">Welcome to Your Life Planner</h1>
        <p className="text-xl mb-8">
          Plan your perfect life, analyze your thoughts, and track your emotional well-being.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-yellow hover:bg-yellow-dark text-black">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
