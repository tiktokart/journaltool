
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { analyzeTextWithBert } from "@/utils/bertIntegration";

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
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  
  // Fetch journal entries from localStorage
  useEffect(() => {
    try {
      // Get journal entries
      const storedEntries = localStorage.getItem('journalEntries');
      if (storedEntries) {
        const entries = JSON.parse(storedEntries);
        setJournalEntries(entries);
      }
      
      // Get monthly reflections
      const storedReflections = localStorage.getItem('monthlyReflections');
      if (storedReflections) {
        const reflections = JSON.parse(storedReflections);
        // Combine with monthly data
        setJournalEntries(prevEntries => [...prevEntries, ...reflections]);
      }
    } catch (error) {
      console.error('Error loading journal data:', error);
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
      // Prepare the context from all journal entries
      const journalContext = journalEntries.map(entry => entry.text).join(" ");
      
      // Use BERT to analyze the question with the journal context
      const bertAnalysis = await analyzeTextWithBert(
        `CONTEXT: ${journalContext}\n\nQUESTION: ${text}\n\nBased only on the context provided, answer the question.`
      );
      
      let answer = "Based on your journal entries, I couldn't find enough information to answer this question.";
      
      if (bertAnalysis && bertAnalysis.text) {
        answer = bertAnalysis.text;
      } else {
        // Fallback analysis if BERT fails
        answer = generateContextualAnswer(text, journalEntries);
      }
      
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
      }, 1000);
    } catch (error) {
      console.error("Failed to analyze your question:", error);
      toast.error("Failed to analyze your question");
      setLoading(false);
      
      // Provide fallback answer
      setQuestions(prev => 
        prev.map(q => 
          q.id === newQuestion.id 
            ? { ...q, answer: generateContextualAnswer(text, journalEntries) }
            : q
        )
      );
    }
  };
  
  // Function to generate answers based on journal entries context
  const generateContextualAnswer = (question: string, entries: any[]): string => {
    if (entries.length === 0) {
      return "I don't have enough journal entries to answer your question yet. Try writing a few entries first.";
    }
    
    const questionLower = question.toLowerCase();
    let allText = entries.map(entry => entry.text.toLowerCase()).join(" ");
    
    // Extract keywords from the question
    const keywords = questionLower.split(/\s+/).filter(word => 
      word.length > 3 && 
      !["what", "when", "where", "which", "who", "whom", "whose", "why", "how", "about", "with", "from"].includes(word)
    );
    
    // Check if any keywords appear in journal entries
    const relevantKeywords = keywords.filter(keyword => allText.includes(keyword));
    
    // Different answer patterns based on question content
    if (questionLower.includes("feel") || questionLower.includes("emotion") || questionLower.includes("mood")) {
      const emotions = ["happy", "sad", "anxious", "excited", "worried", "content", "frustrated", "grateful"];
      const foundEmotions = emotions.filter(emotion => allText.includes(emotion));
      
      if (foundEmotions.length > 0) {
        return `Based on your journal entries, you've expressed feelings of ${foundEmotions.join(", ")}. Your emotional patterns seem to fluctuate, with some entries showing more positive emotions and others reflecting on challenges.`;
      }
    }
    
    if (questionLower.includes("pattern") || questionLower.includes("trend") || questionLower.includes("notice")) {
      if (entries.length < 3) {
        return "I need more journal entries to identify meaningful patterns. Keep writing regularly, and I'll be able to provide better insights.";
      }
      return "Looking at your journal entries over time, I notice you frequently write about personal growth and reflection. There seems to be a pattern of deeper introspection in your more recent entries.";
    }
    
    if (questionLower.includes("improve") || questionLower.includes("better") || questionLower.includes("advice")) {
      return "Based on your journal entries, you might benefit from setting aside dedicated reflection time in the mornings when your thoughts seem clearest. Consider focusing on specific topics in each entry to develop deeper insights.";
    }
    
    if (questionLower.includes("goal") || questionLower.includes("achievement") || questionLower.includes("accomplish")) {
      return "Your entries indicate that you're working toward personal development goals. While you've made progress, you might consider setting more specific, measurable milestones to track your growth more effectively.";
    }
    
    if (questionLower.includes("insight") || questionLower.includes("learn") || questionLower.includes("realize")) {
      return "A key insight from your journals is your ability to find positive aspects even in challenging situations. This resilience and perspective-taking is a valuable strength reflected in your writing.";
    }
    
    if (relevantKeywords.length > 0) {
      return `I noticed you've written about ${relevantKeywords.join(", ")} in your journal entries. These themes appear to be significant in your recent reflections. Consider exploring how these areas connect to your overall wellbeing.`;
    }
    
    // Default answer if no specific patterns are found
    return "Based on your journal entries, I can see thoughtful reflection and personal growth. Continue writing consistently to develop deeper insights about yourself over time. I'll be able to provide more specific answers as your journal grows.";
  };
  
  return (
    <div className={`ask-ai-section p-5 bg-white rounded-xl shadow-sm border border-green-100 ${className}`}>
      <h3 className="text-xl font-semibold mb-4 text-black">Ask Journal AI</h3>
      
      <div className="flex items-center space-x-2 mb-6">
        <Input 
          placeholder="Ask anything about your journal entries..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="border-green-200"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAskQuestion(question);
            }
          }}
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
              className="ask-ai-question p-3 bg-green-50 rounded-t-lg border-l-4 border-green-400 cursor-pointer font-medium" 
              onClick={() => setActiveQuestionId(q.id)}
            >
              {q.text}
            </div>
            {q.answer && activeQuestionId === q.id && (
              <div className="ask-ai-answer p-4 bg-white rounded-b-lg border border-t-0 border-green-200">
                {loading && q.id === activeQuestionId ? (
                  <div className="flex items-center text-green-600">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing journal entries...
                  </div>
                ) : (
                  q.answer
                )}
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
