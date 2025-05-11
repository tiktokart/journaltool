
import React, { useState } from "react";
import { format, isSameMonth, parseISO } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeleteEntryConfirm } from "@/components/DeleteEntryConfirm";

const EntriesView = ({ entries, onSelectEntry }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Group entries by month
  const groupedEntries = entries.reduce((groups, entry) => {
    const date = parseISO(entry.date);
    const month = format(date, "MMMM yyyy");
    
    if (!groups[month]) {
      groups[month] = [];
    }
    
    groups[month].push(entry);
    return groups;
  }, {});
  
  // Filter entries based on search term
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = searchTerm === "" || 
      entry.text.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (activeTab === "all") {
      return matchesSearch;
    } else {
      const currentDate = new Date();
      const entryDate = parseISO(entry.date);
      const isCurrentMonth = isSameMonth(entryDate, currentDate);
      
      return matchesSearch && isCurrentMonth;
    }
  });
  
  const handleDeleteClick = (entry) => {
    setEntryToDelete(entry);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    // This would call a delete function passed in props
    console.log("Delete entry:", entryToDelete.id);
    setIsDeleteDialogOpen(false);
    setEntryToDelete(null);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-center gap-3">
        <h1 className="text-xl font-bold text-purple-900">Journal Entries</h1>
        
        <div className="flex items-center w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-auto">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 border-b">
          <TabsList className="bg-transparent justify-start mb-0 pb-0">
            <TabsTrigger value="all" className="data-[state=active]:bg-purple-100">All Entries</TabsTrigger>
            <TabsTrigger value="current" className="data-[state=active]:bg-purple-100">This Month</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="flex-1 m-0">
          <ScrollArea className="h-full p-4">
            {Object.entries(groupedEntries).map(([month, monthEntries]) => (
              <div key={month} className="mb-8 last:mb-0">
                <h3 className="text-lg font-medium mb-3 text-purple-700">{month}</h3>
                {monthEntries.filter(entry => {
                  return searchTerm === "" || entry.text.toLowerCase().includes(searchTerm.toLowerCase());
                }).map(entry => (
                  <Card key={entry.id} className="mb-3 overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="p-3 bg-purple-50 flex flex-row items-center justify-between">
                      <div className="font-medium">{format(parseISO(entry.date), "MMMM d, yyyy - h:mm a")}</div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                          onClick={() => handleDeleteClick(entry)}
                        >
                          <span className="sr-only">Delete</span>
                          ×
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent 
                      className="p-3 cursor-pointer"
                      onClick={() => onSelectEntry(entry)}
                    >
                      <p className="line-clamp-3 text-sm">{entry.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
            
            {filteredEntries.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground">
                <p>No journal entries found</p>
                {searchTerm && (
                  <Button 
                    variant="link" 
                    onClick={() => setSearchTerm("")}
                  >
                    Clear search
                  </Button>
                )}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="current" className="flex-1 m-0">
          <ScrollArea className="h-full p-4">
            {filteredEntries.length > 0 ? (
              filteredEntries.map(entry => (
                <Card key={entry.id} className="mb-3 overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="p-3 bg-purple-50 flex flex-row items-center justify-between">
                    <div className="font-medium">{format(parseISO(entry.date), "MMMM d, yyyy - h:mm a")}</div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                        onClick={() => handleDeleteClick(entry)}
                      >
                        <span className="sr-only">Delete</span>
                        ×
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent 
                    className="p-3 cursor-pointer"
                    onClick={() => onSelectEntry(entry)}
                  >
                    <p className="line-clamp-3 text-sm">{entry.text}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground">
                <p>No journal entries found for this month</p>
                {searchTerm && (
                  <Button 
                    variant="link" 
                    onClick={() => setSearchTerm("")}
                  >
                    Clear search
                  </Button>
                )}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <DeleteEntryConfirm
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default EntriesView;
