
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  text: string;
  answer?: string;
}

interface AskAIProps {
  journalText?: string;
  className?: string;
}

const AskAI = ({ journalText = "", className = "" }: AskAIProps) => {
  const [question, setQuestion] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  
  // Fetch monthly data from localStorage
  useEffect(() => {
    try {
      // Get journal entries
      const storedEntries = localStorage.getItem('journalEntries');
      if (storedEntries) {
        const entries = JSON.parse(storedEntries);
        setMonthlyData(entries);
      }
      
      // Get monthly reflections
      const storedReflections = localStorage.getItem('monthlyReflections');
      if (storedReflections) {
        const reflections = JSON.parse(storedReflections);
        // Combine with monthly data
        setMonthlyData(prevData => [...prevData, ...reflections]);
      }
    } catch (error) {
      console.error('Error loading monthly data:', error);
    }
  }, []);
  
  const handleAskQuestion = async (text: string) => {
    if (!text.trim()) {
      toast.error("Please enter a question");
      return;
    }
    
    const newQuestion = {
      id: `q${Date.now()}`,
      text
    };
    
    setQuestions(prev => [...prev, newQuestion]);
    setActiveQuestionId(newQuestion.id);
    setQuestion("");
    
    setLoading(true);
    
    try {
      // Generate answer based on monthly data
      const answer = generateAnswer(text, monthlyData);
      
      // Add answer to question after a slight delay to simulate AI processing
      setTimeout(() => {
        setQuestions(prev => 
          prev.map(q => 
            q.id === newQuestion.id 
              ? { ...q, answer }
              : q
          )
        );
        setLoading(false);
      }, 1500);
    } catch (error) {
      toast.error("Failed to analyze your question");
      console.error(error);
      setLoading(false);
    }
  };
  
  // Function to generate answers based on monthly data
  const generateAnswer = (question: string, data: any[]): string => {
    if (data.length === 0) {
      return "I don't have enough journal data to answer your question yet. Try writing a few entries first.";
    }
    
    // Simple keyword matching to generate relevant answers
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes("feel") || questionLower.includes("emotion")) {
      return "Based on your journal entries, you've expressed a range of emotions throughout the month. There seems to be a pattern of reflection and introspection in your writing.";
    }
    
    if (questionLower.includes("pattern") || questionLower.includes("trend")) {
      return "Looking at your journal entries, I notice you frequently write about personal growth and self-improvement. Consider exploring how these themes have evolved over time.";
    }
    
    if (questionLower.includes("improve") || questionLower.includes("better")) {
      return "Your entries suggest you're most productive in the mornings. Consider setting aside dedicated reflection time then to maximize your journaling practice.";
    }
    
    if (questionLower.includes("goal") || questionLower.includes("achievement")) {
      return "Your monthly goals focus on personal development and learning. Based on your journal entries, you're making steady progress in these areas.";
    }
    
    if (questionLower.includes("insight") || questionLower.includes("learn")) {
      return "A key insight from your journals is your ability to find positive aspects even in challenging situations. This resilience is a recurring theme in your writing.";
    }
    
    // Default answer if no keywords match
    return "Based on your journal entries, I can see patterns of reflection and growth. Keep writing consistently to develop deeper insights about yourself over time.";
  };
  
  return (
    <div className={`ask-ai-section p-5 ${className}`}>
      <h3 className="text-xl font-semibold mb-4 text-black">Ask Journal AI</h3>
      
      <div className="flex items-center space-x-2 mb-6">
        <Input 
          placeholder="Ask anything about your journal entries..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="border-green-200"
        />
        <Button 
          className="bg-green-600 hover:bg-green-700" 
          onClick={() => handleAskQuestion(question)}
          disabled={loading || !question.trim()}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {questions.map(q => (
          <div key={q.id} className={activeQuestionId === q.id ? "opacity-100" : "opacity-60"}>
            <div 
              className="ask-ai-question cursor-pointer" 
              onClick={() => setActiveQuestionId(q.id)}
            >
              {q.text}
            </div>
            {q.answer && activeQuestionId === q.id && (
              <div className="ask-ai-answer">
                {q.answer}
              </div>
            )}
          </div>
        ))}
        {questions.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            Ask a question about your journal entries to get insights
          </div>
        )}
      </div>
    </div>
  );
};

export default AskAI;
