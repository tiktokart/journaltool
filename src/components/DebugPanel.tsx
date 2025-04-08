
import { useState } from "react";
import { 
  Bug, 
  Code, 
  Terminal, 
  Settings, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Copy 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface DebugPanelProps {
  appState: any;
  consoleMessages?: {level: string; message: string; timestamp: string}[];
  isVisible?: boolean;
  onClose?: () => void;
  onToggleVisibility?: () => void;
}

export const DebugPanel = ({ 
  appState, 
  consoleMessages = [], 
  isVisible = true, 
  onClose,
  onToggleVisibility 
}: DebugPanelProps) => {
  const [activeTab, setActiveTab] = useState("state");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);
  
  const handleCopyState = () => {
    navigator.clipboard.writeText(JSON.stringify(appState, null, 2));
    toast.success("Application state copied to clipboard");
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-0 right-0 w-full md:w-[600px] z-50 transition-all duration-300 transform">
      <Card className="border-t border-l border-r rounded-b-none rounded-t-lg shadow-lg bg-card/95 backdrop-blur-sm">
        <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center">
            <Bug className="w-5 h-5 mr-2 text-red-500" />
            <CardTitle className="text-sm font-semibold">Debug Panel</CardTitle>
            <Badge variant="outline" className="ml-2 text-xs">
              Development Mode
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={onClose || onToggleVisibility}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
          <CollapsibleContent>
            <CardContent className="p-3 max-h-[400px] overflow-y-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="state" className="flex-1">
                    <Code className="w-4 h-4 mr-2" />
                    App State
                  </TabsTrigger>
                  <TabsTrigger value="console" className="flex-1">
                    <Terminal className="w-4 h-4 mr-2" />
                    Console
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex-1">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="state" className="mt-3">
                  <div className="rounded bg-black/70 p-3 text-xs font-mono text-green-400 overflow-x-auto whitespace-pre">
                    {JSON.stringify(appState, null, 2)}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2" 
                    onClick={handleCopyState}
                  >
                    <Copy className="h-3 w-3 mr-2" />
                    Copy State
                  </Button>
                </TabsContent>
                
                <TabsContent value="console" className="mt-3">
                  <div className="flex justify-end mb-2">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="timestamps" 
                        checked={showTimestamps}
                        onCheckedChange={setShowTimestamps}
                      />
                      <Label htmlFor="timestamps" className="text-xs">Show Timestamps</Label>
                    </div>
                  </div>
                  
                  <div className="rounded bg-black/70 p-2 h-60 overflow-y-auto">
                    {consoleMessages.length === 0 ? (
                      <div className="text-xs text-gray-400 italic p-2">No console messages</div>
                    ) : (
                      consoleMessages.map((msg, idx) => (
                        <div key={idx} className="border-b border-gray-800 last:border-0 py-1">
                          <div className="flex">
                            {showTimestamps && (
                              <span className="text-xs text-gray-400 mr-2">{msg.timestamp}</span>
                            )}
                            <span className={`text-xs ${
                              msg.level === 'error' ? 'text-red-400' : 
                              msg.level === 'warn' ? 'text-yellow-400' : 
                              msg.level === 'info' ? 'text-blue-400' : 
                              'text-green-400'
                            }`}>
                              {msg.message}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="mt-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mock-data" className="text-sm">Use Mock Data</Label>
                      <Switch id="mock-data" defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <Label htmlFor="debug-mode" className="text-sm">Debug Mode</Label>
                      <Switch id="debug-mode" defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <Label htmlFor="performance-monitoring" className="text-sm">Performance Monitoring</Label>
                      <Switch id="performance-monitoring" />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};
