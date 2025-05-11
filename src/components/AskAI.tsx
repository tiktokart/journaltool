
import { useState } from "react";
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
  const [questions, setQuestions] = useState<Question[]>([
    { id: "q1", text: "What brings me the most joy?", answer: "Based on your journal entries, you seem to find the most joy in creative activities, particularly writing and reading. You've mentioned feeling fulfilled when expressing your thoughts." },
    { id: "q2", text: "How can I improve my relationships?", answer: "Your entries suggest communication challenges. Consider practicing active listening and setting aside dedicated time for important conversations." }
  ]);
  const [loading, setLoading] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>("q1");
  
  const suggestedQuestions = [
    "What patterns do you notice in my journal?",
    "What are my coping mechanisms?",
    "How do I demonstrate love and care?",
    "What am I most grateful for?",
    "How can I improve my well-being?"
  ];
  
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
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add answer to question
      setQuestions(prev => 
        prev.map(q => 
          q.id === newQuestion.id 
            ? { ...q, answer: "This is a simulated answer based on your journal entries. In a real implementation, this would analyze your journal content and provide meaningful insights." }
            : q
        )
      );
    } catch (error) {
      toast.error("Failed to analyze your question");
      console.error(error);
    } finally {
      setLoading(false);
    }
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
      
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-500 mb-2">Suggested Questions</h4>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((q, i) => (
            <Button 
              key={i} 
              variant="outline" 
              size="sm" 
              className="text-xs text-gray-700 bg-green-50 border-green-100 hover:bg-green-100"
              onClick={() => handleAskQuestion(q)}
            >
              {q}
            </Button>
          ))}
        </div>
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
      </div>
    </div>
  );
};

export default AskAI;
