import { useState } from "react";
import { Brain, Target, Search, TreePine, List, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import TargetingTree from "@/components/targeting-tree";
import type { TargetingCategory, HierarchicalTargetingCategory, TargetingRecommendation } from "@shared/schema";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<TargetingRecommendation[]>([]);
  const { toast } = useToast();

  // Get hierarchical categories for tree view
  const { data: hierarchicalCategories = [], isLoading: isLoadingHierarchical } = useQuery<HierarchicalTargetingCategory[]>({
    queryKey: ['/api/targeting-categories/hierarchical'],
    enabled: viewMode === "tree",
  });

  // Get flat categories for search/list view
  const { data: flatCategories = [], isLoading: isLoadingFlat } = useQuery<TargetingCategory[]>({
    queryKey: ['/api/targeting-categories'],
    enabled: searchQuery.length > 0 || viewMode === "list",
  });

  // AI Strategy Generation Mutation
  const generateStrategyMutation = useMutation({
    mutationFn: async (input: string) => {
      const response = await apiRequest("POST", "/api/recommendations/generate", {
        userInput: input,
        budgetRange: "moderate",
        geographicFocus: "global",
        campaignGoal: "awareness"
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAiRecommendations(data.recommendations || []);
      toast({
        title: "AI Strategy Generated",
        description: `Found ${data.recommendations?.length || 0} targeting recommendations`,
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI strategy. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCategorySelect = (categoryId: string, selected: boolean) => {
    setSelectedCategories(prev => 
      selected 
        ? [...prev, categoryId]
        : prev.filter(id => id !== categoryId)
    );
  };

  const handleGenerateStrategy = () => {
    if (!userInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please describe your product or target audience",
        variant: "destructive",
      });
      return;
    }
    generateStrategyMutation.mutate(userInput);
  };

  // Filter categories based on search
  const filteredCategories = flatCategories?.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const isLoading = viewMode === "tree" ? isLoadingHierarchical : isLoadingFlat;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                IntelliTarget
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-Powered Meta Ads Strategist
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* AI Strategy Generation */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  AI Strategy Generator
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Describe your product or target audience and get AI-powered targeting recommendations
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Describe your product, service, or target audience in detail. For example: 'Premium fitness equipment for home gym enthusiasts aged 25-45 with disposable income who are health-conscious and tech-savvy'"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  rows={4}
                  className="resize-none"
                  data-testid="ai-input"
                />
                
                <Button
                  onClick={handleGenerateStrategy}
                  disabled={generateStrategyMutation.isPending || !userInput.trim()}
                  className="w-full"
                  data-testid="generate-strategy"
                >
                  {generateStrategyMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Strategy...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate AI Strategy
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            {aiRecommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">AI Recommendations</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {aiRecommendations.length} targeting categories recommended
                  </p>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {aiRecommendations.map((rec, index) => (
                        <div
                          key={rec.id || index}
                          className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm">{rec.name || rec.id}</h4>
                            {rec.priority && (
                              <Badge 
                                variant={rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {rec.priority}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                            {rec.justification}
                          </p>
                          {rec.size && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Audience Size: {rec.size}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Targeting Explorer */}
          <div>
            <Card className="h-fit">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Targeting Explorer
                  </CardTitle>
                  
                  {/* View mode toggle */}
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <Button
                      variant={viewMode === "tree" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("tree")}
                      className="h-8 px-3"
                      data-testid="tree-view-button"
                    >
                      <TreePine className="h-3 w-3 mr-1" />
                      Tree
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="h-8 px-3"
                      data-testid="list-view-button"
                    >
                      <List className="h-3 w-3 mr-1" />
                      List
                    </Button>
                  </div>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search targeting categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="search-targeting"
                  />
                </div>

                {/* Selected categories count */}
                {selectedCategories.length > 0 && (
                  <div className="text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                    {selectedCategories.length} categories selected
                  </div>
                )}
              </CardHeader>

              <CardContent className="p-0">
                <ScrollArea className="h-[600px] p-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : searchQuery ? (
                    // Search results view
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-600 mb-3">
                        Search Results ({filteredCategories.length})
                      </h3>
                      {filteredCategories.map((category) => (
                        <div
                          key={category.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                            selectedCategories.includes(category.id)
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleCategorySelect(category.id, !selectedCategories.includes(category.id))}
                          data-testid={`category-${category.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{category.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">
                                Level {category.level} • {category.categoryType}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {category.size && category.size !== "Unknown" && (
                                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                  {category.size}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {filteredCategories.length === 0 && (
                        <div className="text-center py-8 text-gray-500" data-testid="no-search-results">
                          <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No categories found for "{searchQuery}"</p>
                          <p className="text-sm mt-1">Try adjusting your search terms</p>
                        </div>
                      )}
                    </div>
                  ) : viewMode === "tree" ? (
                    // Tree view
                    <TargetingTree
                      categories={hierarchicalCategories}
                      selectedCategories={selectedCategories}
                      onCategorySelect={handleCategorySelect}
                    />
                  ) : (
                    // List view (all categories flat)
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-600 mb-3">
                        All Categories ({flatCategories.length})
                      </h3>
                      {flatCategories.map((category) => (
                        <div
                          key={category.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                            selectedCategories.includes(category.id)
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleCategorySelect(category.id, !selectedCategories.includes(category.id))}
                          data-testid={`category-${category.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{category.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">
                                Level {category.level} • {category.categoryType}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {category.size && category.size !== "Unknown" && (
                                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                  {category.size}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}