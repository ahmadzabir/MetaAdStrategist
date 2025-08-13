import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  MessageCircle, 
  ChevronRight, 
  Target, 
  Users, 
  TrendingUp, 
  CheckCircle,
  Plus,
  Zap,
  DollarSign,
  BarChart3,
  Eye,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface RecommendationItem {
  id: string;
  name: string;
  justification?: string;
  priority?: "high" | "medium" | "low";
  breadcrumbs?: string[];
  estimatedReach?: string;
  size?: string;
  confidenceScore?: number;
  whyPoints?: string[];
  nextSteps?: string[];
  cpmEstimate?: string;
  ctrEstimate?: string;
  type?: "primary" | "secondary" | "wildcard";
}

interface AIRecommendationsProps {
  recommendations: RecommendationItem[];
  onStartChat: () => void;
  onSelectCategory: (categoryId: string) => void;
  selectedCategories: string[];
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case "primary": return { label: "Primary ICP", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200" };
    case "secondary": return { label: "Secondary ICP", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200" };
    case "wildcard": return { label: "Wildcard ICP", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200" };
    default: return { label: "Standard ICP", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200" };
  }
};

export function AIRecommendations({ 
  recommendations, 
  onStartChat, 
  onSelectCategory,
  selectedCategories 
}: AIRecommendationsProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleQuickApply = (categoryId: string) => {
    onSelectCategory(categoryId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-200";
    }
  };

  if (recommendations.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="text-center py-12">
          <Brain className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No recommendations yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Complete the questionnaire to get AI-powered targeting recommendations
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-emerald-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-emerald-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  AI Targeting Recommendations
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {recommendations.length} strategic targeting categories identified
                </p>
              </div>
            </div>
            <Button
              onClick={onStartChat}
              className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white"
              data-testid="button-start-chat"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Start Chat
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const isExpanded = expandedItems.has(rec.id);
          const isSelected = selectedCategories.includes(rec.id);
          
          return (
            <Card
              key={rec.id}
              className={`transition-all duration-200 hover:shadow-md ${
                isSelected ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Priority and Name */}
                    <div className="flex items-center gap-3">
                      <Badge className={`text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                        {rec.priority} priority
                      </Badge>
                      <span className="text-sm text-gray-500">#{index + 1}</span>
                    </div>

                    {/* Breadcrumbs */}
                    {rec.breadcrumbs && rec.breadcrumbs.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        {rec.breadcrumbs.map((crumb, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <span className="hover:text-blue-600 cursor-default">{crumb}</span>
                            {i < rec.breadcrumbs.length - 1 && (
                              <ChevronRight className="h-3 w-3 text-gray-400" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Target Name */}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      {rec.name}
                      {rec.estimatedReach && (
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {rec.estimatedReach}
                        </Badge>
                      )}
                    </h3>

                    {/* Justification Preview */}
                    {rec.justification && (
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {isExpanded ? rec.justification : `${rec.justification.slice(0, 120)}${rec.justification.length > 120 ? '...' : ''}`}
                      </p>
                    )}

                    {/* Expand/Collapse */}
                    {rec.justification && rec.justification.length > 120 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(rec.id)}
                        className="text-blue-600 hover:text-blue-700 p-0 h-auto font-normal"
                      >
                        {isExpanded ? 'Show less' : 'Read more'}
                      </Button>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="flex flex-col items-center gap-2">
                    <Button
                      onClick={() => onSelectCategory(rec.id)}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={isSelected ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                      data-testid={`button-select-${rec.id}`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Selected
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </>
                      )}
                    </Button>
                    
                    {rec.priority === "high" && (
                      <Badge className="text-xs bg-red-500 text-white">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Recommended
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card className="bg-gray-50 dark:bg-gray-800/50">
        <CardContent className="p-6">
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Ready to refine your strategy?
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              These recommendations are based on successful campaigns similar to yours. Start a chat to get personalized advice.
            </p>
            <Button
              onClick={onStartChat}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white"
              data-testid="button-start-chat-bottom"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat with AI Strategist
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}