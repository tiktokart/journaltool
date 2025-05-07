
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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
          <div className="space-y-4">
            <h3 className="text-orange font-medium text-lg">Daily Life</h3>
            {getEntriesByCategory('daily').length === 0 ? (
              <p className="text-orange italic py-2">No entries yet. Add your daily life goals.</p>
            ) : (
              <ul className="space-y-3 list-disc pl-6">
                {getEntriesByCategory('daily').map(entry => (
                  <li key={entry.id} className="pl-2">
                    {editingEntry?.id === entry.id ? (
                      <div className="space-y-2">
                        <Textarea 
                          value={editText} 
                          onChange={(e) => setEditText(e.target.value)} 
                          className="min-h-[100px] text-black bg-white"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEdit} className="text-yellow">Save</Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit} className="text-orange border-orange">Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="whitespace-pre-wrap text-orange">{entry.text}</p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-muted">
                          <span className="text-xs text-orange">
                            {formatDate(entry.date)}
                          </span>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => startEditing(entry)}
                              className="text-orange"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => deleteEntry(entry.id)}
                              className="text-orange"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-orange font-medium text-lg">Week Life</h3>
            {getEntriesByCategory('weekly').length === 0 ? (
              <p className="text-orange italic py-2">No entries yet. Add your weekly life goals.</p>
            ) : (
              <ul className="space-y-3 list-disc pl-6">
                {getEntriesByCategory('weekly').map(entry => (
                  <li key={entry.id} className="pl-2">
                    {editingEntry?.id === entry.id ? (
                      <div className="space-y-2">
                        <Textarea 
                          value={editText} 
                          onChange={(e) => setEditText(e.target.value)} 
                          className="min-h-[100px] text-black bg-white"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEdit} className="text-yellow">Save</Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit} className="text-orange border-orange">Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="whitespace-pre-wrap text-orange">{entry.text}</p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-muted">
                          <span className="text-xs text-orange">
                            {formatDate(entry.date)}
                          </span>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => startEditing(entry)}
                              className="text-orange"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => deleteEntry(entry.id)}
                              className="text-orange"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-orange font-medium text-lg">Monthly Life</h3>
            {getEntriesByCategory('monthly').length === 0 ? (
              <p className="text-orange italic py-2">No entries yet. Add your monthly life goals.</p>
            ) : (
              <ul className="space-y-3 list-disc pl-6">
                {getEntriesByCategory('monthly').map(entry => (
                  <li key={entry.id} className="pl-2">
                    {editingEntry?.id === entry.id ? (
                      <div className="space-y-2">
                        <Textarea 
                          value={editText} 
                          onChange={(e) => setEditText(e.target.value)} 
                          className="min-h-[100px] text-black bg-white"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEdit} className="text-yellow">Save</Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit} className="text-orange border-orange">Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="whitespace-pre-wrap text-orange">{entry.text}</p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-muted">
                          <span className="text-xs text-orange">
                            {formatDate(entry.date)}
                          </span>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => startEditing(entry)}
                              className="text-orange"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => deleteEntry(entry.id)}
                              className="text-orange"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
