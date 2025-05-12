
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export const HappinessInfographic = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Data from the Berkeley Greater Good Science Center 
  // (based on Lyubomirsky, S., Sheldon, K. M., & Schkade, D. (2005))
  const data = [
    { name: 'Genetics', value: 50, color: '#F97316' }, // Orange
    { name: 'Intentional Activity', value: 40, color: '#FEC84B' }, // Yellow
    { name: 'Life Circumstances', value: 10, color: '#60A5FA' }, // Blue
  ];

  // Suggestions based on the happiness research
  const suggestions = [
    // Intentional Activity suggestions (80%)
    { 
      category: 'Intentional Activity', 
      text: "Practice gratitude daily by writing down three things you're thankful for.",
      type: 'intentional'
    },
    { 
      category: 'Intentional Activity', 
      text: "Engage in acts of kindness. Research shows helping others boosts your own happiness.",
      type: 'intentional'
    },
    { 
      category: 'Intentional Activity', 
      text: "Exercise regularly for at least 30 minutes, 3-4 times per week to increase endorphins.",
      type: 'intentional'
    },
    { 
      category: 'Intentional Activity', 
      text: "Practice mindfulness meditation for 10 minutes daily to enhance present-moment awareness.",
      type: 'intentional'
    },
    { 
      category: 'Intentional Activity', 
      text: "Nurture your social connections. Spend quality time with friends and family weekly.",
      type: 'intentional' 
    },
    { 
      category: 'Intentional Activity', 
      text: "Set meaningful goals aligned with your personal values and track your progress.",
      type: 'intentional'
    },
    { 
      category: 'Intentional Activity', 
      text: "Find work that engages your strengths and provides a sense of purpose.",
      type: 'intentional'
    },
    { 
      category: 'Intentional Activity', 
      text: "Practice optimism by visualizing positive future scenarios and outcomes.",
      type: 'intentional'
    },
    
    // Life Circumstances suggestions (20%)
    { 
      category: 'Life Circumstances', 
      text: "Consider whether your living environment supports your wellbeing and values.",
      type: 'circumstance'
    },
    { 
      category: 'Life Circumstances', 
      text: "If possible, reduce your commute time to increase available personal time.",
      type: 'circumstance'
    },
    
    // Genetics suggestion (one suggestion)
    { 
      category: 'Genetics', 
      text: "Consider a DNA test to understand your genetic predispositions for certain mood tendencies.",
      type: 'genetics'
    }
  ];

  // Get some random suggestions based on our 80/20/1 ratio
  const getRandomSuggestions = (count = 3) => {
    const intentionalCount = Math.floor(count * 0.8);
    const circumstancesCount = count - intentionalCount - 1;
    
    const intentionalSuggestions = suggestions
      .filter(s => s.type === 'intentional')
      .sort(() => 0.5 - Math.random())
      .slice(0, intentionalCount);
      
    const circumstancesSuggestions = suggestions
      .filter(s => s.type === 'circumstance')
      .sort(() => 0.5 - Math.random())
      .slice(0, circumstancesCount);
      
    const geneticsSuggestion = suggestions.find(s => s.type === 'genetics');
    
    return [...intentionalSuggestions, ...circumstancesSuggestions, geneticsSuggestion];
  };
  
  const randomSuggestions = getRandomSuggestions();

  return (
    <Card className="w-full overflow-hidden border border-purple-100 mb-6">
      <div 
        className="p-4 bg-white border-b border-purple-100 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-xl font-semibold text-purple-900">The Science of Happiness</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="p-4 bg-white">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-lg font-medium text-purple-800 mb-3">What Determines Happiness?</h3>
              <p className="text-gray-700 mb-4">
                Research from the Greater Good Science Center at UC Berkeley shows that your happiness is determined by:
              </p>
              
              <div className="mb-4 bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-2" style={{backgroundColor: '#F97316'}}></div>
                    <span className="font-medium">50% Genetics</span> - Your natural "set point" for happiness
                  </li>
                  <li className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-2" style={{backgroundColor: '#FEC84B'}}></div>
                    <span className="font-medium">40% Intentional Activities</span> - What you choose to do
                  </li>
                  <li className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-2" style={{backgroundColor: '#60A5FA'}}></div>
                    <span className="font-medium">10% Life Circumstances</span> - Your situation and environment
                  </li>
                </ul>
              </div>
              
              <h3 className="text-lg font-medium text-purple-800 mb-2">What This Means For You</h3>
              <p className="text-gray-700 mb-3">
                While genetics play a significant role, a full <span className="font-medium">40%</span> of your happiness 
                is under your direct control through the choices you make daily.
              </p>
              <p className="text-gray-700">
                Focus on intentional activities that bring you joy and meaning, rather than changing external circumstances, 
                which have surprisingly little impact on long-term happiness.
              </p>
            </div>
            
            <div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg mt-4">
                <h4 className="font-medium text-purple-800 mb-2">Happiness Suggestions</h4>
                <ul className="space-y-2 text-sm">
                  {randomSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-3 h-3 mt-1 rounded-full mr-2" 
                        style={{
                          backgroundColor: suggestion.type === 'intentional' ? '#FEC84B' : 
                                         suggestion.type === 'circumstance' ? '#60A5FA' : '#F97316'
                        }}></div>
                      <span>{suggestion.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>Source: Lyubomirsky, S., Sheldon, K. M., & Schkade, D. (2005). Pursuing happiness: The architecture of sustainable change. 
            Review of General Psychology, 9, 111-131.</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default HappinessInfographic;
