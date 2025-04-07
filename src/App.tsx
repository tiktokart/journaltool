
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Comparison from "./pages/Comparison";
import NotFound from "./pages/NotFound";
import { Toaster } from "./components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/comparison" element={<Comparison />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      <SonnerToaster position="top-center" />
    </Router>
  );
}

export default App;
