
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { v4 as uuidv4 } from 'uuid';
import { Edit, Trash2 } from "lucide-react";

interface PlanEntry {
  id: string;
  text: string;
  date: string;
  category: 'daily' | 'weekly' | 'monthly';
}

interface LifePlanSectionProps {
  journalText: string;
}

export const LifePlanSection = ({ journalText }: LifePlanSectionProps) => {
  const [planEntries, setPlanEntries] = useState<PlanEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<PlanEntry | null>(null);
  const [editText, setEditText] = useState("");
  
  // Load saved plan entries from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('lifePlanEntries');
    if (savedEntries) {
      try {
        setPlanEntries(JSON.parse(savedEntries));
      } catch (error) {
        console.error('Error parsing saved life plan entries:', error);
      }
    }
  }, []);
  
  // Save entries to localStorage when they change
  useEffect(() => {
    localStorage.setItem('lifePlanEntries', JSON.stringify(planEntries));
  }, [planEntries]);
  
  const addToPlan = (category: 'daily' | 'weekly' | 'monthly') => {
    if (!journalText.trim()) {
      toast.error("Please enter some text in the journal first");
      return;
    }
    
    const newEntry: PlanEntry = {
      id: uuidv4(),
      text: journalText,
      date: new Date().toISOString(),
      category
    };
    
    setPlanEntries(prev => [...prev, newEntry]);
    toast.success(`Added to ${category} plan`);
  };
  
  const deleteEntry = (id: string) => {
    setPlanEntries(prev => prev.filter(entry => entry.id !== id));
    toast.success("Entry deleted");
  };
  
  const startEditing = (entry: PlanEntry) => {
    setEditingEntry(entry);
    setEditText(entry.text);
  };
  
  const saveEdit = () => {
    if (!editingEntry) return;
    
    setPlanEntries(prev => prev.map(entry => 
      entry.id === editingEntry.id 
        ? { ...entry, text: editText } 
        : entry
    ));
    
    setEditingEntry(null);
    setEditText("");
    toast.success("Entry updated");
  };
  
  const cancelEdit = () => {
    setEditingEntry(null);
    setEditText("");
  };
  
  const getEntriesByCategory = (category: 'daily' | 'weekly' | 'monthly') => {
    return planEntries.filter(entry => entry.category === category);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="border shadow-md bg-card my-8">
      <CardHeader>
        <CardTitle className="text-xl text-yellow">What does your perfect life look like?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="daily">
              <AccordionTrigger className="text-primary font-medium">
                Daily Life
              </AccordionTrigger>
              <AccordionContent>
                {getEntriesByCategory('daily').length === 0 ? (
                  <p className="text-muted-foreground italic py-2">No entries yet. Add your daily life goals.</p>
                ) : (
                  <div className="space-y-3">
                    {getEntriesByCategory('daily').map(entry => (
                      <div key={entry.id} className="p-3 bg-muted/30 rounded-lg">
                        {editingEntry?.id === entry.id ? (
                          <div className="space-y-2">
                            <Textarea 
                              value={editText} 
                              onChange={(e) => setEditText(e.target.value)} 
                              className="min-h-[100px]"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={saveEdit}>Save</Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="whitespace-pre-wrap">{entry.text}</p>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-muted">
                              <span className="text-xs text-muted-foreground">
                                {formatDate(entry.date)}
                              </span>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => startEditing(entry)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => deleteEntry(entry.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="weekly">
              <AccordionTrigger className="text-primary font-medium">
                Week Life
              </AccordionTrigger>
              <AccordionContent>
                {getEntriesByCategory('weekly').length === 0 ? (
                  <p className="text-muted-foreground italic py-2">No entries yet. Add your weekly life goals.</p>
                ) : (
                  <div className="space-y-3">
                    {getEntriesByCategory('weekly').map(entry => (
                      <div key={entry.id} className="p-3 bg-muted/30 rounded-lg">
                        {editingEntry?.id === entry.id ? (
                          <div className="space-y-2">
                            <Textarea 
                              value={editText} 
                              onChange={(e) => setEditText(e.target.value)} 
                              className="min-h-[100px]"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={saveEdit}>Save</Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="whitespace-pre-wrap">{entry.text}</p>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-muted">
                              <span className="text-xs text-muted-foreground">
                                {formatDate(entry.date)}
                              </span>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => startEditing(entry)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => deleteEntry(entry.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="monthly">
              <AccordionTrigger className="text-primary font-medium">
                Monthly Life
              </AccordionTrigger>
              <AccordionContent>
                {getEntriesByCategory('monthly').length === 0 ? (
                  <p className="text-muted-foreground italic py-2">No entries yet. Add your monthly life goals.</p>
                ) : (
                  <div className="space-y-3">
                    {getEntriesByCategory('monthly').map(entry => (
                      <div key={entry.id} className="p-3 bg-muted/30 rounded-lg">
                        {editingEntry?.id === entry.id ? (
                          <div className="space-y-2">
                            <Textarea 
                              value={editText} 
                              onChange={(e) => setEditText(e.target.value)} 
                              className="min-h-[100px]"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={saveEdit}>Save</Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="whitespace-pre-wrap">{entry.text}</p>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-muted">
                              <span className="text-xs text-muted-foreground">
                                {formatDate(entry.date)}
                              </span>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => startEditing(entry)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => deleteEntry(entry.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
};
