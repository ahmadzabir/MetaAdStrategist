import { useState } from "react";
import { Target } from "lucide-react";
import { StructuredQuestionnaire } from "@/components/structured-questionnaire";
import { AIRecommendations } from "@/components/ai-recommendations";
import { AIChat } from "@/components/ai-chat";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { TargetingRecommendation } from "@shared/schema";

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
  const { toast } = useToast();

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
            <AIRecommendations
              recommendations={aiRecommendations}
              onStartChat={handleStartChat}
              onSelectCategory={handleSelectCategory}
              selectedCategories={selectedCategories}
            />
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
        {renderContent()}
      </div>
    </div>
  );
}