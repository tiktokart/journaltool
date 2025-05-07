
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Entry {
  id: string;
  text: string;
  date: string;
}

interface LifePlanEntries {
  daily: Entry[];
  weekly: Entry[];
  monthly: Entry[];
}

interface LifePlanSectionProps {
  journalText?: string;
}

export function LifePlanSection({ journalText = "" }: LifePlanSectionProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly">("daily");
  const [entries, setEntries] = useState<LifePlanEntries>({
    daily: [],
    weekly: [],
    monthly: []
  });
  const [newEntryText, setNewEntryText] = useState("");
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // Load entries from localStorage on component mount
  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem("lifePlanEntries");
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      }
    } catch (error) {
      console.error("Error loading life plan entries:", error);
      toast.error("Failed to load life plan entries");
    }
  }, []);

  // Pre-populate with journal text when editing
  useEffect(() => {
    if (journalText && !newEntryText) {
      setNewEntryText(journalText);
    }
  }, [journalText]);

  const saveEntries = (updatedEntries: LifePlanEntries) => {
    try {
      localStorage.setItem("lifePlanEntries", JSON.stringify(updatedEntries));
      setEntries(updatedEntries);
    } catch (error) {
      console.error("Error saving life plan entries:", error);
      toast.error("Failed to save entry");
    }
  };

  const handleAddEntry = () => {
    if (!newEntryText.trim()) {
      toast.error("Please enter some text for your life plan");
      return;
    }

    try {
      const newEntry = {
        id: Date.now().toString(),
        text: newEntryText,
        date: new Date().toISOString()
      };

      const updatedEntries = { ...entries };
      updatedEntries[activeTab] = [newEntry, ...updatedEntries[activeTab]];
      
      saveEntries(updatedEntries);
      setNewEntryText("");
      toast.success(`Added to your ${activeTab} life plan`);
    } catch (error) {
      console.error("Error adding entry:", error);
      toast.error("Failed to add entry");
    }
  };

  const handleDeleteEntry = (id: string) => {
    try {
      const updatedEntries = { ...entries };
      updatedEntries[activeTab] = updatedEntries[activeTab].filter(entry => entry.id !== id);
      
      saveEntries(updatedEntries);
      toast.success("Entry removed");
      
      if (editingEntryId === id) {
        setEditingEntryId(null);
        setNewEntryText("");
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Failed to delete entry");
    }
  };

  const handleEditEntry = (entry: Entry) => {
    setEditingEntryId(entry.id);
    setNewEntryText(entry.text);
  };

  const handleUpdateEntry = () => {
    if (!editingEntryId || !newEntryText.trim()) return;

    try {
      const updatedEntries = { ...entries };
      updatedEntries[activeTab] = updatedEntries[activeTab].map(entry => 
        entry.id === editingEntryId
          ? { ...entry, text: newEntryText, date: new Date().toISOString() }
          : entry
      );
      
      saveEntries(updatedEntries);
      setEditingEntryId(null);
      setNewEntryText("");
      toast.success("Entry updated");
    } catch (error) {
      console.error("Error updating entry:", error);
      toast.error("Failed to update entry");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <Card className="border border-border shadow-md bg-light-lavender">
      <CardHeader>
        <CardTitle className="text-black">{t("What does your Perfect Life Look Like?")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            placeholder={t("Describe aspects of your ideal life...")}
            className="min-h-[100px] bg-white/50 border-lavender text-black"
            value={newEntryText}
            onChange={(e) => setNewEntryText(e.target.value)}
          />
          
          <div className="flex justify-end gap-2">
            {editingEntryId ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingEntryId(null);
                    setNewEntryText("");
                  }}
                >
                  {t("Cancel")}
                </Button>
                <Button 
                  className="bg-orange hover:bg-orange/90 text-white"
                  onClick={handleUpdateEntry}
                >
                  {t("Update")}
                </Button>
              </>
            ) : (
              <Button 
                className="bg-orange hover:bg-orange/90 text-white"
                onClick={handleAddEntry}
              >
                {t("Save")}
              </Button>
            )}
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "daily" | "weekly" | "monthly")}>
            <TabsList className="w-full bg-lavender">
              <TabsTrigger value="daily" className="flex-1">{t("Daily")}</TabsTrigger>
              <TabsTrigger value="weekly" className="flex-1">{t("Weekly")}</TabsTrigger>
              <TabsTrigger value="monthly" className="flex-1">{t("Monthly")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="daily" className="mt-4">
              <h3 className="text-lg font-bold mb-2 text-black">Daily Life</h3>
              <ScrollArea className="h-[150px] rounded border border-lavender bg-white/30 p-4">
                {entries.daily.length === 0 ? (
                  <p className="text-muted-foreground text-center text-black py-4">{t("No entries yet")}</p>
                ) : (
                  <div className="space-y-3">
                    {entries.daily.map((entry) => (
                      <div key={entry.id} className="border-b border-lavender pb-2 text-black">
                        <p className="mb-1">{entry.text}</p>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{formatDate(entry.date)}</span>
                          <div className="space-x-2">
                            <button 
                              className="hover:text-primary" 
                              onClick={() => handleEditEntry(entry)}
                            >
                              {t("Edit")}
                            </button>
                            <button 
                              className="hover:text-destructive" 
                              onClick={() => handleDeleteEntry(entry.id)}
                            >
                              {t("Delete")}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="weekly" className="mt-4">
              <h3 className="text-lg font-bold mb-2 text-black">Weekly Life</h3>
              <ScrollArea className="h-[150px] rounded border border-lavender bg-white/30 p-4">
                {entries.weekly.length === 0 ? (
                  <p className="text-muted-foreground text-center text-black py-4">{t("No entries yet")}</p>
                ) : (
                  <div className="space-y-3">
                    {entries.weekly.map((entry) => (
                      <div key={entry.id} className="border-b border-lavender pb-2 text-black">
                        <p className="mb-1">{entry.text}</p>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{formatDate(entry.date)}</span>
                          <div className="space-x-2">
                            <button 
                              className="hover:text-primary" 
                              onClick={() => handleEditEntry(entry)}
                            >
                              {t("Edit")}
                            </button>
                            <button 
                              className="hover:text-destructive" 
                              onClick={() => handleDeleteEntry(entry.id)}
                            >
                              {t("Delete")}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="monthly" className="mt-4">
              <h3 className="text-lg font-bold mb-2 text-black">Monthly Life</h3>
              <ScrollArea className="h-[150px] rounded border border-lavender bg-white/30 p-4">
                {entries.monthly.length === 0 ? (
                  <p className="text-muted-foreground text-center text-black py-4">{t("No entries yet")}</p>
                ) : (
                  <div className="space-y-3">
                    {entries.monthly.map((entry) => (
                      <div key={entry.id} className="border-b border-lavender pb-2 text-black">
                        <p className="mb-1">{entry.text}</p>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{formatDate(entry.date)}</span>
                          <div className="space-x-2">
                            <button 
                              className="hover:text-primary" 
                              onClick={() => handleEditEntry(entry)}
                            >
                              {t("Edit")}
                            </button>
                            <button 
                              className="hover:text-destructive" 
                              onClick={() => handleDeleteEntry(entry.id)}
                            >
                              {t("Delete")}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
