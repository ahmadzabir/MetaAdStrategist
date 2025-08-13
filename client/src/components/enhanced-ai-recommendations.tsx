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

const getTypeLabel = (type?: string) => {
  switch (type) {
    case "primary": return { label: "Primary ICP", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200", icon: Target };
    case "secondary": return { label: "Secondary ICP", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200", icon: Users };
    case "wildcard": return { label: "Wildcard ICP", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200", icon: Sparkles };
    default: return { label: "Standard ICP", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200", icon: Target };
  }
};

export function EnhancedAIRecommendations({ 
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

  return (
    <div className="space-y-6">
      {/* Guided Mode Header */}
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-blue-200 dark:border-blue-800 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">Guided Mode</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  AI-powered campaign planning with live optimization
                </p>
              </div>
            </CardTitle>
            <Button
              onClick={onStartChat}
              className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white shadow-lg"
              data-testid="button-start-chat"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat with AI Strategist
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* AI Recommendations */}
      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const isExpanded = expandedItems.has(rec.id);
          const isSelected = selectedCategories.includes(rec.id);
          const typeInfo = getTypeLabel(rec.type);
          const IconComponent = typeInfo.icon;
          
          return (
            <Card
              key={rec.id}
              className={`transition-all duration-200 hover:shadow-lg border-2 ${
                isSelected 
                  ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg' 
                  : 'border-gray-200 dark:border-slate-700 hover:border-blue-300'
              }`}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header with Type and Confidence */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={`${typeInfo.color} font-medium flex items-center gap-1`}>
                        <IconComponent className="h-3 w-3" />
                        {typeInfo.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      {rec.confidenceScore && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Confidence:</span>
                          <div className="flex items-center gap-1">
                            <Progress value={rec.confidenceScore} className="w-12 h-2" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {rec.confidenceScore}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => handleQuickApply(rec.id)}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={isSelected ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                      data-testid={`quick-apply-${rec.id}`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Applied
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          Quick Apply
                        </>
                      )}
                    </Button>
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

                  {/* Main Content */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {rec.name}
                    </h3>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <Users className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                        <div className="text-xs text-gray-600 dark:text-gray-400">Reach</div>
                        <div className="font-semibold text-sm">{rec.estimatedReach || rec.size}</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <DollarSign className="h-4 w-4 mx-auto mb-1 text-green-600" />
                        <div className="text-xs text-gray-600 dark:text-gray-400">Est. CPM</div>
                        <div className="font-semibold text-sm">{rec.cpmEstimate || "--"}</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <TrendingUp className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                        <div className="text-xs text-gray-600 dark:text-gray-400">Est. CTR</div>
                        <div className="font-semibold text-sm">{rec.ctrEstimate || "--"}</div>
                      </div>
                    </div>

                    {/* Why Points */}
                    {rec.whyPoints && rec.whyPoints.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          Why This Works:
                        </h4>
                        <ul className="space-y-1">
                          {rec.whyPoints.map((point, i) => (
                            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                              <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Next Steps */}
                    {rec.nextSteps && rec.nextSteps.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-blue-500" />
                          Next Steps:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {rec.nextSteps.map((step, i) => (
                            <Badge key={i} variant="outline" className="text-xs cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30">
                              {step}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {recommendations.length === 0 && (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto">
              <Brain className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">No AI Recommendations Yet</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Complete the questionnaire to get personalized targeting suggestions
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}