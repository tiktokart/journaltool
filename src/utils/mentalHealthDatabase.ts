
export interface MentalHealthPlan {
  title: string;
  steps: string[];
  triggerWords: string[];
}

export interface MentalHealthDatabase {
  emotions: Record<string, MentalHealthPlan>;
}

export const mentalHealthDatabase: MentalHealthDatabase = {
  emotions: {
    "Joy": {
      title: "Cultivate Positive Emotions",
      steps: [
        "Practice gratitude daily by listing three things you appreciate",
        "Share your positive experiences with trusted friends or family",
        "Engage in activities that bring you authentic joy",
        "Create a physical environment that uplifts your mood",
        "Celebrate small achievements and milestones"
      ],
      triggerWords: ["happy", "joy", "excite", "pleasure", "content", "delight", "cheer"]
    },
    "Sadness": {
      title: "Managing Difficult Emotions",
      steps: [
        "Practice deep breathing exercises (4-7-8 technique)",
        "Try a short mindfulness meditation focused on acceptance",
        "Express your feelings through journaling or creative outlets",
        "Establish a gentle movement routine, even if just a short walk",
        "Create a self-care kit with items that engage your senses"
      ],
      triggerWords: ["sad", "unhappy", "depress", "miserable", "down", "blue", "grief", "sorrow", "melancholy"]
    },
    "Anxiety": {
      title: "Managing Anxiety and Worry",
      steps: [
        "Use grounding techniques like the 5-4-3-2-1 sensory exercise",
        "Practice progressive muscle relaxation to release physical tension",
        "Challenge anxious thoughts by writing evidence for and against them",
        "Create a worry period: set aside 15-30 minutes to focus on worries",
        "Develop a regular meditation practice focused on present awareness"
      ],
      triggerWords: ["anxious", "worry", "stress", "tense", "nervous", "fear", "overwhelm", "panic", "dread", "apprehension"]
    },
    "Anger": {
      title: "Healthy Expression of Anger",
      steps: [
        "Identify your personal anger triggers and early warning signs",
        "Practice time-outs: step away from triggering situations briefly",
        "Release physical tension through exercise or safe physical outlets",
        "Use 'I statements' when expressing feelings ('I feel frustrated when...')",
        "Try anger reduction techniques like deep breathing or counting to ten"
      ],
      triggerWords: ["angry", "mad", "frustrat", "irritat", "annoy", "rage", "resent", "hostile", "bitter", "fury"]
    },
    "Overwhelm": {
      title: "Managing Feelings of Overwhelm",
      steps: [
        "Break large tasks into smaller, manageable steps",
        "Practice prioritization using urgent/important matrix",
        "Implement time-blocking in your schedule",
        "Take short breaks throughout the day to reset",
        "Practice saying 'no' to new commitments when needed"
      ],
      triggerWords: ["overwhelm", "too much", "burden", "swamp", "drown", "flood", "crush", "pressure"]
    },
    "Sleep": {
      title: "Improving Sleep Quality",
      steps: [
        "Create a consistent sleep schedule, even on weekends",
        "Develop a calming bedtime routine (reading, gentle stretching)",
        "Make your bedroom comfortable, dark, quiet and cool",
        "Limit screen time 1-2 hours before bed",
        "Avoid caffeine and alcohol close to bedtime"
      ],
      triggerWords: ["sleep", "insomnia", "tired", "fatigue", "exhausted", "rest", "dream", "night", "bed"]
    },
    "Loneliness": {
      title: "Addressing Feelings of Loneliness",
      steps: [
        "Reach out to one friend or family member for a conversation",
        "Join a group activity aligned with your interests",
        "Consider volunteer opportunities to connect with others",
        "Use technology mindfully to foster genuine connections",
        "Develop a nurturing relationship with yourself through self-compassion"
      ],
      triggerWords: ["lonely", "alone", "isolat", "disconnect", "abandoned", "rejected", "solitary"]
    },
    "General": {
      title: "Daily Wellness Practices",
      steps: [
        "Start a morning routine that includes 10 minutes of movement",
        "Prioritize 7-9 hours of quality sleep each night",
        "Take short breaks every hour during focused work",
        "Stay hydrated by drinking water throughout the day",
        "Spend time outdoors to connect with nature daily"
      ],
      triggerWords: []
    }
  }
};
