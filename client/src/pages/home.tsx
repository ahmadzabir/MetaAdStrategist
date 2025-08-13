import { useState } from "react";
import { Target, Search, TreePine, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StructuredQuestionnaire } from "@/components/structured-questionnaire";
import { AIRecommendations } from "@/components/ai-recommendations";
import { AIChat } from "@/components/ai-chat";
import SimpleTree from "@/components/simple-tree";
import SelectionSummary from "@/components/selection-summary";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { TargetingRecommendation, TargetingCategory, HierarchicalTargetingCategory } from "@shared/schema";

interface RecommendationWithBreadcrumbs extends TargetingRecommendation {
  breadcrumbs: string[];
  estimatedReach?: string;
}

interface QuestionnaireData {
  businessType: string;
  productService: string;
  targetAge: string;
  budget: string;
  goal: string;
}

type AppMode = "questionnaire" | "recommendations" | "chat";

export default function Home() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<RecommendationWithBreadcrumbs[]>([]);
  const [appMode, setAppMode] = useState<AppMode>("questionnaire");
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");
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

  // Generate breadcrumbs for a category
  const generateBreadcrumbs = async (categoryId: string): Promise<string[]> => {
    try {
      // Get all categories to build the hierarchy
      const response = await apiRequest("GET", "/api/targeting-categories");
      const allCategories = await response.json();
      
      const categoryMap = new Map(allCategories.map((cat: any) => [cat.id, cat]));
      const breadcrumbs: string[] = [];
      
      let currentCategory = categoryMap.get(categoryId);
      while (currentCategory) {
        breadcrumbs.unshift(currentCategory.name);
        currentCategory = currentCategory.parentId ? categoryMap.get(currentCategory.parentId) : null;
      }
      
      return breadcrumbs.length > 0 ? breadcrumbs : ["Unknown Category"];
    } catch {
      return ["Unknown Category"];
    }
  };

  // AI Strategy Generation Mutation
  const generateStrategyMutation = useMutation({
    mutationFn: async (data: QuestionnaireData) => {
      const response = await apiRequest("POST", "/api/recommendations/generate", {
        businessType: data.businessType,
        productService: data.productService,
        targetAge: data.targetAge,
        budget: data.budget,
        goal: data.goal
      });
      return response.json();
    },
    onSuccess: async (data) => {
      const recommendations = data.recommendations || [];
      
      // Generate breadcrumbs for each recommendation
      const recommendationsWithBreadcrumbs = await Promise.all(
        recommendations.map(async (rec: TargetingRecommendation) => ({
          ...rec,
          name: rec.name || rec.id,
          breadcrumbs: await generateBreadcrumbs(rec.id),
          estimatedReach: rec.size || "Unknown"
        }))
      );
      
      setAiRecommendations(recommendationsWithBreadcrumbs);
      setAppMode("recommendations");
      toast({
        title: "AI Strategy Generated",
        description: `Found ${recommendations.length} targeting recommendations`,
      });
    },
    onError: (error: any) => {
      console.error("AI Generation Error:", error);
      const errorMessage = error?.response?.data?.message || "Failed to generate AI strategy. Please try again.";
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleQuestionnaireSubmit = (data: QuestionnaireData) => {
    setQuestionnaireData(data);
    generateStrategyMutation.mutate(data);
  };

  const handleStartChat = () => {
    setAppMode("chat");
  };

  const handleBackToRecommendations = () => {
    setAppMode("recommendations");
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

  // Render different modes
  const renderContent = () => {
    switch (appMode) {
      case "questionnaire":
        return (
          <div className="py-12">
            <StructuredQuestionnaire 
              onGenerate={handleQuestionnaireSubmit}
              isLoading={generateStrategyMutation.isPending}
            />
          </div>
        );
      
      case "recommendations":
        return (
          <div className="py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <AIRecommendations
                  recommendations={aiRecommendations}
                  onStartChat={handleStartChat}
                  onSelectCategory={handleSelectCategory}
                  selectedCategories={selectedCategories}
                />
              </div>
              <div className="lg:col-span-1">
                {/* Selection Summary */}
                <SelectionSummary
                  selectedCategories={selectedCategories}
                  onClearAll={() => setSelectedCategories([])}
                />
              </div>
            </div>
          </div>
        );
      
      case "chat":
        return (
          <div className="py-8">
            <AIChat
              onBack={handleBackToRecommendations}
              initialContext={questionnaireData ? `${questionnaireData.businessType}: ${questionnaireData.productService}` : undefined}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Modern Header with Gradient */}
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
                  AI-Powered Meta Ads Strategist • Smart Questionnaire-Based Targeting
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {appMode === "questionnaire" || appMode === "chat" ? (
          renderContent()
        ) : (
          <div className="py-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* AI Recommendations */}
              <div className="lg:col-span-2">
                <AIRecommendations
                  recommendations={aiRecommendations}
                  onStartChat={handleStartChat}
                  onSelectCategory={handleSelectCategory}
                  selectedCategories={selectedCategories}
                />
              </div>

              {/* Targeting Explorer */}
              <div className="lg:col-span-3">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-800 shadow-xl h-fit">
                  <CardHeader className="space-y-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">Targeting Explorer</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                            Browse 650+ authentic Meta targeting categories
                          </div>
                        </div>
                      </CardTitle>
                      
                      {/* View mode toggle */}
                      <div className="flex items-center gap-1 bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm rounded-xl p-1 border border-gray-200 dark:border-slate-600">
                        <Button
                          variant={viewMode === "tree" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("tree")}
                          className={`h-9 px-4 rounded-lg transition-all ${
                            viewMode === "tree" 
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md" 
                              : "hover:bg-gray-100 dark:hover:bg-slate-600"
                          }`}
                          data-testid="tree-view-button"
                        >
                          <TreePine className="h-4 w-4 mr-2" />
                          Tree View
                        </Button>
                        <Button
                          variant={viewMode === "list" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("list")}
                          className={`h-9 px-4 rounded-lg transition-all ${
                            viewMode === "list" 
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md" 
                              : "hover:bg-gray-100 dark:hover:bg-slate-600"
                          }`}
                          data-testid="list-view-button"
                        >
                          <List className="h-4 w-4 mr-2" />
                          List View
                        </Button>
                      </div>
                    </div>
                    
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Search targeting categories, interests, demographics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 border-gray-300 dark:border-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm"
                        data-testid="search-targeting"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {/* Selected categories count */}
                    {selectedCategories.length > 0 && (
                      <div className="flex items-center gap-2 text-sm bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-4 py-3 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="font-medium text-blue-700 dark:text-blue-300">
                          {selectedCategories.length} categories selected
                        </span>
                        <button
                          onClick={() => setSelectedCategories([])}
                          className="ml-auto text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-xs underline"
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="p-0">
                    <ScrollArea className="h-[700px] p-6">
                      {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-3 border-emerald-300 border-t-emerald-600 mb-4"></div>
                          <p className="text-gray-600 dark:text-gray-400">Loading targeting categories...</p>
                        </div>
                      ) : searchQuery ? (
                        // Search results view
                        <div className="space-y-3">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Search Results
                            </h3>
                            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                              {filteredCategories.length} found
                            </span>
                          </div>
                          {filteredCategories.map((category) => (
                            <div
                              key={category.id}
                              className={`group p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-lg ${
                                selectedCategories.includes(category.id)
                                  ? 'border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 shadow-md'
                                  : 'border-gray-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-600 bg-white/50 dark:bg-slate-800/50'
                              }`}
                              onClick={() => handleCategorySelect(category.id, !selectedCategories.includes(category.id))}
                              data-testid={`category-${category.id}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(category.id)}
                                    onChange={() => {}}
                                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                  />
                                  <div className="flex-1">
                                    <h4 className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                                      {category.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      Level {category.level} • {category.categoryType}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {category.size && category.size !== "Unknown" && (
                                    <span className="text-xs text-gray-600 bg-gray-100 dark:bg-slate-700 dark:text-gray-300 px-3 py-1 rounded-full">
                                      {category.size}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {filteredCategories.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="no-search-results">
                              <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                                <Search className="h-8 w-8 text-gray-400" />
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 font-medium">No categories found</p>
                              <p className="text-sm text-gray-500 mt-1">Try searching for "{searchQuery.split(' ')[0]}" or browse the tree view</p>
                            </div>
                          )}
                        </div>
                      ) : viewMode === "tree" ? (
                        // Hierarchical tree explorer view
                        <div className="space-y-2">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Hierarchical Categories
                            </h3>
                            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                              {hierarchicalCategories.length} sections
                            </span>
                          </div>
                          <SimpleTree
                            categories={hierarchicalCategories}
                            selectedCategories={selectedCategories}
                            onCategorySelect={handleCategorySelect}
                          />
                        </div>
                      ) : (
                        // List view (all categories flat)
                        <div className="space-y-3">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              All Categories
                            </h3>
                            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                              {flatCategories.length} total
                            </span>
                          </div>
                          {flatCategories.map((category) => (
                            <div
                              key={category.id}
                              className={`group p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-lg ${
                                selectedCategories.includes(category.id)
                                  ? 'border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 shadow-md'
                                  : 'border-gray-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-600 bg-white/50 dark:bg-slate-800/50'
                              }`}
                              onClick={() => handleCategorySelect(category.id, !selectedCategories.includes(category.id))}
                              data-testid={`category-${category.id}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(category.id)}
                                    onChange={() => {}}
                                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                  />
                                  <div className="flex-1">
                                    <h4 className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                                      {category.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      Level {category.level} • {category.categoryType}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {category.size && category.size !== "Unknown" && (
                                    <span className="text-xs text-gray-600 bg-gray-100 dark:bg-slate-700 dark:text-gray-300 px-3 py-1 rounded-full">
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
        )}
      </div>
    </div>
  );
}