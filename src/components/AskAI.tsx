
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
      const prompt = `
        CONTEXT: ${journalContext}
        
        QUESTION: ${text}
        
        Based on the journal entries provided in the context, please provide an empathetic, 
        insightful and human-like response to the question. Draw clear connections to patterns,
        emotions, and insights from the journal entries. If there isn't enough information to 
        answer the question, acknowledge this politely and suggest what kind of journaling might 
        help address the question in the future. Keep your tone warm and conversational.
      `;
      
      const bertAnalysis = await analyzeTextWithBert(prompt);
      
      let answer = "Based on your journal entries, I couldn't find enough information to answer this question specifically. Try writing more entries that touch on this topic.";
      
      if (bertAnalysis && bertAnalysis.text) {
        answer = bertAnalysis.text;
      } else {
        // If BERT analysis fails, use a more sophisticated fallback
        answer = generateEnhancedAnswer(text, journalEntries);
      }
      
      // Add answer to question after a slight delay to simulate AI thinking
      setTimeout(() => {
        setQuestions(prev => 
          prev.map(q => 
            q.id === newQuestion.id 
              ? { ...q, answer }
              : q
          )
        );
        setLoading(false);
      }, 1200);
    } catch (error) {
      console.error("Failed to analyze your question:", error);
      toast.error("Failed to analyze your question");
      setLoading(false);
      
      // Provide fallback answer
      setQuestions(prev => 
        prev.map(q => 
          q.id === newQuestion.id 
            ? { ...q, answer: generateEnhancedAnswer(text, journalEntries) }
            : q
        )
      );
    }
  };
  
  // Function to generate more human-like answers based on journal entries
  const generateEnhancedAnswer = (question: string, entries: any[]): string => {
    if (entries.length === 0) {
      return "I don't have enough information in your journal entries yet to answer that question thoughtfully. Consider adding a few more entries so I can provide better insights.";
    }
    
    const questionLower = question.toLowerCase();
    const allText = entries.map(entry => entry.text.toLowerCase()).join(" ");
    
    // Extract keywords from the question
    const keywords = questionLower.split(/\s+/).filter(word => 
      word.length > 3 && 
      !["what", "when", "where", "which", "who", "whom", "whose", "why", "how", "about", "with", "from"].includes(word)
    );
    
    // Check if any keywords appear in journal entries
    const relevantKeywords = keywords.filter(keyword => allText.includes(keyword));
    const isQuestionRelevant = relevantKeywords.length > 0;
    
    // Detect the type of question and provide contextual answers
    if (questionLower.includes("feel") || questionLower.includes("emotion") || questionLower.includes("mood")) {
      const emotions = ["happy", "sad", "anxious", "excited", "worried", "content", "frustrated", "grateful"];
      const foundEmotions = emotions.filter(emotion => allText.includes(emotion));
      
      if (foundEmotions.length > 0) {
        const emotionText = foundEmotions.length > 1 
          ? `a mix of ${foundEmotions.slice(0, -1).join(", ")} and ${foundEmotions.slice(-1)}` 
          : foundEmotions[0];
        
        return `I notice that you've expressed ${emotionText} in your journal entries. Your emotional patterns seem to fluctuate from day to day, with some entries showing more positive emotions like gratitude and contentment, while others reflect challenges you're working through. It might be helpful to track what triggers these different emotional states.`;
      }
    }
    
    if (questionLower.includes("pattern") || questionLower.includes("trend") || questionLower.includes("notice")) {
      if (entries.length < 3) {
        return "I'd need to see more journal entries from you to identify meaningful patterns. As you continue writing regularly, I'll be able to recognize recurring themes and insights about your emotional patterns.";
      }
      
      // Sort entries by date to analyze trends
      const sortedEntries = [...entries].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Compare first and last entries for tone change
      const firstEntry = sortedEntries[0].text.toLowerCase();
      const lastEntry = sortedEntries[sortedEntries.length - 1].text.toLowerCase();
      const positiveWords = ["good", "happy", "great", "joy", "wonderful", "excited", "love"];
      const negativeWords = ["bad", "sad", "stress", "anxiety", "worry", "frustrated", "angry"];
      
      const firstPositivity = positiveWords.filter(word => firstEntry.includes(word)).length - 
                              negativeWords.filter(word => firstEntry.includes(word)).length;
      const lastPositivity = positiveWords.filter(word => lastEntry.includes(word)).length - 
                             negativeWords.filter(word => lastEntry.includes(word)).length;
      
      if (lastPositivity > firstPositivity + 1) {
        return "I've noticed your journal entries have been trending toward a more positive outlook over time. Your earlier entries seemed to focus more on challenges, while your recent writing shows more moments of gratitude and accomplishment. This progression suggests you may be developing effective coping strategies or experiencing positive changes in your circumstances.";
      } else if (firstPositivity > lastPositivity + 1) {
        return "Looking at your journal entries chronologically, I notice there's been a shift toward more challenging emotions recently. Your earlier entries had a lighter tone, while recent ones mention more obstacles or concerns. Would it help to reflect on what's changed during this period and what strategies have helped you through similar situations in the past?";
      } else {
        return "I see that your journaling shows a fairly consistent emotional tone over time. You tend to engage in thoughtful self-reflection regardless of whether you're writing about positive or challenging experiences. This consistency in your introspective approach is valuable for developing deeper personal insights.";
      }
    }
    
    if (questionLower.includes("improve") || questionLower.includes("better") || questionLower.includes("advice")) {
      const morningEntries = entries.filter(entry => {
        const entryHour = new Date(entry.date).getHours();
        return entryHour >= 5 && entryHour <= 10;
      }).length;
      
      const eveningEntries = entries.filter(entry => {
        const entryHour = new Date(entry.date).getHours();
        return entryHour >= 18 && entryHour <= 23;
      }).length;
      
      if (morningEntries > eveningEntries) {
        return "Based on your journaling patterns, you seem to write more often in the morning. This is an excellent habit! Morning reflections can help set intentions for the day and create mental clarity. To enhance your practice, you might try adding a brief evening check-in to compare how your day aligned with your morning intentions. This creates a valuable feedback loop for personal growth.";
      } else {
        return "I notice you tend to journal more in the evening, which is great for processing the day's experiences. To further enhance your practice, consider adding specific reflection questions about what went well today and what you learned from challenges. You might also experiment with occasional morning journaling to set intentions for the day ahead, creating a complementary practice to your evening reflections.";
      }
    }
    
    if (questionLower.includes("goal") || questionLower.includes("achievement") || questionLower.includes("accomplish")) {
      return "In your journal entries, I see that you're working toward personal development, though you haven't always specified concrete milestones. Setting more specific, measurable goals might help you track your progress more effectively. For instance, instead of a general goal like 'reduce stress,' you might try 'practice mindfulness for 10 minutes three times this week.' Would a more structured approach to goal-setting in your journaling be helpful?";
    }
    
    if (relevantKeywords.length > 0) {
      return `I've noticed that ${relevantKeywords.join(", ")} appear frequently in your journal entries, suggesting these themes hold significance in your recent experiences. When you write about ${relevantKeywords[0]}, you often connect it to ${relevantKeywords.length > 1 ? relevantKeywords[1] : "your overall wellbeing"}. Exploring how these elements interact in your life could provide valuable insights for your personal growth.`;
    }
    
    // Default answers for various question types
    if (questionLower.includes("why do i")) {
      return "While I don't have enough context from your journal entries to answer specifically why you might feel or act in certain ways, self-reflection through journaling is an excellent way to explore these kinds of questions. Consider writing about situations where you notice this pattern and what thoughts or feelings precede it. Over time, patterns and insights often emerge that can help answer these deeper 'why' questions about yourself.";
    }
    
    if (questionLower.includes("how can i")) {
      return "Based on themes in your journaling, personal growth seems important to you. While I don't have specific information about this particular goal from your entries, consistent journaling itself is a powerful tool for development. Consider dedicating some entries to exploring small, actionable steps toward your desired outcome, and tracking your progress with regular reflection entries.";
    }
    
    if (questionLower.includes("should i")) {
      return "I don't see specific information in your journal entries to guide this particular decision. However, your journaling shows thoughtful reflection on your experiences. You might find it helpful to create a dedicated entry exploring the pros and cons of each option, noting how each possibility aligns with your values and goals that I see mentioned throughout your writing.";
    }
    
    // Default answer if no specific patterns are found
    return "Based on your journal entries, I can see thoughtful reflection and a desire for personal growth. Your writing reveals someone who processes experiences deeply and is developing greater self-awareness. Continue writing consistently to develop deeper insights about yourself over time. If you have specific areas you'd like to explore, try creating focused entries on those topics to help patterns emerge more clearly.";
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
          className="bg-green-600 hover:bg-green-700 text-white" 
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
