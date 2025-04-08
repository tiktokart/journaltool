
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md p-6 border border-border rounded-lg shadow-md bg-card">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-lg text-muted-foreground mb-4">
          Sorry, the page you're looking for doesn't exist or an error occurred.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Path: {location.pathname}
        </p>
        <Button asChild size="lg" className="w-full">
          <Link to="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
