import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Brain, Target, Search, TreePine, List, Plus, X, TrendingUp } from "lucide-react";
import SimpleTree from "@/components/simple-tree";
import { useToast } from "@/hooks/use-toast";
import type { TargetingCategory, HierarchicalTargetingCategory, TargetingRecommendation } from "@shared/schema";

export default function Home() {
  const [campaignDescription, setCampaignDescription] = useState("");
  const [aiRecommendations, setAiRecommendations] = useState<TargetingRecommendation[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");
  const [searchQuery, setSearchQuery] = useState("");
  const [minAge, setMinAge] = useState<number>(18);
  const [maxAge, setMaxAge] = useState<number>(65);
  const [location, setLocation] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Array<{id: string, type: 'user' | 'ai', content: string, timestamp: Date}>>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch hierarchical categories
  const { data: hierarchicalCategories, isLoading: isLoadingHierarchical } = useQuery({
    queryKey: ["/api/targeting-categories/hierarchical"],
  });

  // Fetch flat categories
  const { data: flatCategories, isLoading: isLoadingFlat } = useQuery({
    queryKey: ["/api/targeting-categories/flat"],
  });

  // Generate AI recommendations
  const generateStrategyMutation = useMutation({
    mutationFn: async (input: { userInput: string }) => {
      const response = await fetch("/api/recommendations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error("Failed to generate recommendations");
      return response.json();
    },
    onSuccess: (data) => {
      setAiRecommendations(data.recommendations || []);
      // Add AI response to chat
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'ai',
        content: `I've analyzed your campaign and generated ${data.recommendations?.length || 0} targeting recommendations. Each suggestion includes specific reasoning for why this audience would be interested in your offering.`,
        timestamp: new Date()
      }]);
      toast({ title: "AI recommendations generated!", description: `Found ${data.recommendations?.length || 0} relevant targeting options.` });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to generate AI recommendations. Please try again.", variant: "destructive" });
    },
  });

  const handleSendMessage = () => {
    if (!campaignDescription.trim()) return;
    
    // Add user message to chat
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content: campaignDescription,
      timestamp: new Date()
    }]);

    // Generate AI recommendations
    generateStrategyMutation.mutate({ userInput: campaignDescription });
    setCampaignDescription("");
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleCategorySelect = (categoryId: string, selected: boolean) => {
    setSelectedCategories(prev => {
      if (selected) {
        return prev.includes(categoryId) ? prev : [...prev, categoryId];
      } else {
        return prev.filter(id => id !== categoryId);
      }
    });
  };

  // Filter categories based on search
  const filteredCategories = flatCategories?.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const isLoading = viewMode === "tree" ? isLoadingHierarchical : isLoadingFlat;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  IntelliTarget
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  AI-Powered Meta Ads Strategist • Advanced Campaign Builder
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 bg-gray-100 dark:bg-slate-700 px-3 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              AI-Powered Strategy
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Section 1: Let's Figure Out Your Next Big Campaign */}
          <div className="w-full">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">Let's Figure Out Your Next Big Campaign</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-normal">Chat with AI to discover your perfect targeting strategy</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* AI Chat Interface */}
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg border border-blue-200/50 dark:border-blue-700/50 p-4 min-h-[300px] max-h-[400px] overflow-y-auto">
                  <div className="space-y-4">
                    {/* Initial AI message */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 max-w-[80%]">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                          Hi! I'm your Meta Ads strategist. Tell me about your business, product, and goals. I'll help you discover the perfect audience targeting strategy through our conversation.
                        </p>
                      </div>
                    </div>
                    
                    {/* Chat messages */}
                    <div className="space-y-4">
                      {chatMessages.map((message) => (
                        <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}>
                          {message.type === 'ai' && (
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Brain className="h-4 w-4 text-white" />
                            </div>
                          )}
                          <div className={`rounded-lg p-3 max-w-[80%] ${
                            message.type === 'user' 
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' 
                              : 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <div className="text-xs opacity-60 mt-1">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          {message.type === 'user' && (
                            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm font-medium">U</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Chat input */}
                <div className="flex gap-2">
                  <textarea
                    placeholder="Describe your business, product, target customers, or ask questions about targeting..."
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:border-blue-500 focus:ring-blue-500/20 text-sm"
                    rows={2}
                    value={campaignDescription}
                    onChange={(e) => setCampaignDescription(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    data-testid="campaign-chat-input"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!campaignDescription.trim() || generateStrategyMutation.isPending}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 self-end"
                    data-testid="send-chat-message"
                  >
                    {generateStrategyMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      "Send"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 2: Advanced Targeting Options */}
          <div className="w-full">
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">Advanced Targeting Options</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-normal">Multiple ways to build your perfect audience</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Location & Demographics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-emerald-200/50 dark:border-emerald-700/50">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Age Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        placeholder="Min age" 
                        type="number" 
                        min="13" 
                        max="65" 
                        className="text-center" 
                        value={minAge}
                        onChange={(e) => setMinAge(Number(e.target.value))}
                      />
                      <Input 
                        placeholder="Max age" 
                        type="number" 
                        min="13" 
                        max="65" 
                        className="text-center"
                        value={maxAge}
                        onChange={(e) => setMaxAge(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Location</Label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country/region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                        <SelectItem value="worldwide">Worldwide</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* AI Recommended Targets */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">AI Recommended Targets</h4>
                  <div className="space-y-2">
                    {aiRecommendations.length > 0 ? (
                      aiRecommendations.map((rec) => (
                        <div key={rec.id} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-semibold text-gray-900 dark:text-white truncate">{rec.name}</h5>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-medium">
                                    Level {rec.level}
                                  </span>
                                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                                    {rec.estimatedReach}
                                  </span>
                                </div>
                              </div>
                              {rec.breadcrumbs && rec.breadcrumbs.length > 1 && (
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  <span className="text-gray-500 dark:text-gray-500">📍 </span>
                                  {rec.breadcrumbs.join(" › ")}
                                </div>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSelectCategory(rec.id)}
                              className={selectedCategories.includes(rec.id) ? "bg-emerald-100 border-emerald-300" : ""}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              {selectedCategories.includes(rec.id) ? "Added" : "Add"}
                            </Button>
                          </div>
                          {rec.justification && (
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                              <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1">Why this audience?</div>
                              <p className="text-sm text-emerald-800 dark:text-emerald-200">{rec.justification}</p>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Chat with AI above to get targeting recommendations</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Manual Exploration */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Manual Exploration</h4>
                  <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg border border-emerald-200/50 dark:border-emerald-700/50 p-4">
                    {/* View mode toggle */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 bg-white/60 dark:bg-slate-700/60 rounded-lg p-1 border">
                        <Button
                          variant={viewMode === "tree" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("tree")}
                          className={`h-7 px-2 text-xs ${viewMode === "tree" ? "bg-gray-500 text-white" : ""}`}
                          data-testid="tree-view-button"
                        >
                          <TreePine className="h-3 w-3 mr-1" />
                          Tree
                        </Button>
                        <Button
                          variant={viewMode === "list" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("list")}
                          className={`h-7 px-2 text-xs ${viewMode === "list" ? "bg-gray-500 text-white" : ""}`}
                          data-testid="list-view-button"
                        >
                          <List className="h-3 w-3 mr-1" />
                          List
                        </Button>
                      </div>
                      
                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search targeting categories..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 h-9 text-sm w-64"
                          data-testid="search-targeting"
                        />
                      </div>
                    </div>
                    
                    <ScrollArea className="h-[300px]">
                      {isLoading ? (
                        <div className="text-center py-8 text-gray-500">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto mb-3"></div>
                          <p>Loading targeting categories...</p>
                        </div>
                      ) : viewMode === "tree" && hierarchicalCategories ? (
                        <SimpleTree
                          categories={hierarchicalCategories}
                          onCategorySelect={handleCategorySelect}
                          selectedCategories={selectedCategories}
                        />
                      ) : (
                        <div className="space-y-2">
                          {filteredCategories.map((category) => (
                            <div key={category.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.includes(category.id)}
                                  onChange={(e) => handleCategorySelect(category.id, e.target.checked)}
                                  className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium truncate">{category.name}</p>
                                  <p className="text-xs text-gray-500">Level {category.level} • {category.categoryType}</p>
                                </div>
                              </div>
                              {category.size && category.size !== "Unknown" && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{category.size}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Section 3: Your Campaign */}
          <div className="w-full">
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">Your Campaign</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-normal">Review and optimize your targeting strategy</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Campaign Settings Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-purple-200/50 dark:border-purple-700/50">
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Age Range</div>
                    <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                      {minAge}-{maxAge} years
                    </div>
                  </div>
                  <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-purple-200/50 dark:border-purple-700/50">
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Location</div>
                    <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                      {location || "Not set"}
                    </div>
                  </div>
                  <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-purple-200/50 dark:border-purple-700/50">
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Targets Selected</div>
                    <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                      {selectedCategories.length}
                    </div>
                  </div>
                </div>

                {/* Live Analysis */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Live Analysis</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-purple-200/50 dark:border-purple-700/50">
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Estimated Reach</div>
                      <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                        {selectedCategories.length === 0 ? "0" : 
                         selectedCategories.length === 1 ? "50M-150M" :
                         selectedCategories.length === 2 ? "150M-300M" :
                         selectedCategories.length >= 3 ? "250M-500M" : "Unknown"}
                      </div>
                    </div>
                    <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-purple-200/50 dark:border-purple-700/50">
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Specificity</div>
                      <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                        {selectedCategories.length === 0 ? "None" :
                         selectedCategories.length === 1 ? "Low" :
                         selectedCategories.length === 2 ? "Medium" :
                         selectedCategories.length >= 3 ? "High" : "Unknown"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Selected Targeting Options</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {selectedCategories.length} selected
                      </Badge>
                      <Select defaultValue="AND">
                        <SelectTrigger className="w-20 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AND">AND</SelectItem>
                          <SelectItem value="OR">OR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <ScrollArea className="h-60">
                    {selectedCategories.length > 0 ? (
                      <div className="space-y-2">
                        {selectedCategories.map((categoryId) => {
                          // Look for category in all available sources
                          let category = flatCategories?.find(c => c.id === categoryId);
                          
                          // If not found in flat categories, check AI recommendations
                          if (!category) {
                            category = aiRecommendations.find(r => r.id === categoryId);
                          }
                          
                          return (
                            <div key={categoryId} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white text-sm">
                                  {category?.name || categoryId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Level {category?.level !== undefined ? category.level : "?"} • {category?.estimatedReach || "Unknown size"}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSelectCategory(categoryId)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No targeting categories selected yet</p>
                        <p className="text-xs text-gray-400 mt-1">Add categories from Section 2 above</p>
                      </div>
                    )}
                  </ScrollArea>
                </div>

                {/* Launch Campaign Button */}
                {selectedCategories.length > 0 && (
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-base font-medium">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Export Campaign Configuration
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}