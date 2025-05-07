
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";

export default function Index() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Redirect to dashboard on load
    navigate("/dashboard");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Redirecting to Dashboard...</h1>
        <p className="mt-4">Please wait while we redirect you to the dashboard.</p>
      </div>
    </div>
  );
}
