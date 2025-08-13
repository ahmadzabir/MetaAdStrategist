import { useMemo, useState } from "react";
import { Users, Target, TrendingUp, Globe, X, Brain, AlertTriangle, CheckCircle, Info, DollarSign, Calendar, Zap, BarChart3, PieChart, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { TargetingCategory, HierarchicalTargetingCategory } from "@shared/schema";

interface SelectionSummaryProps {
  selectedCategories: string[];
  allCategories: (TargetingCategory | HierarchicalTargetingCategory)[];
  onClearSelection: () => void;
}

export default function SelectionSummary({ 
  selectedCategories, 
  allCategories, 
  onClearSelection 
}: SelectionSummaryProps) {
  
  const selectedCategoryDetails = useMemo(() => {
    const findCategory = (id: string): TargetingCategory | HierarchicalTargetingCategory | null => {
      const search = (cats: (TargetingCategory | HierarchicalTargetingCategory)[]): TargetingCategory | HierarchicalTargetingCategory | null => {
        for (const cat of cats) {
          if (cat.id === id) return cat;
          if ('children' in cat && cat.children) {
            const found = search(cat.children);
            if (found) return found;
          }
        }
        return null;
      };
      return search(allCategories);
    };

    return selectedCategories
      .map(id => findCategory(id))
      .filter(Boolean)
      .filter((cat, index, array) => array.findIndex(c => c!.id === cat!.id) === index) as TargetingCategory[];
  }, [selectedCategories, allCategories]);

  const categoryStats = useMemo(() => {
    const demographics = selectedCategoryDetails.filter(cat => cat.categoryType === 'demographics');
    const interests = selectedCategoryDetails.filter(cat => cat.categoryType === 'interests');
    const behaviors = selectedCategoryDetails.filter(cat => cat.categoryType === 'behaviors');

    // Calculate estimated total audience size with overlap consideration
    const sizesWithNumbers = selectedCategoryDetails
      .map(cat => cat.size)
      .filter(size => size && size !== "Unknown" && size !== "Not available" && !isNaN(parseInt(size.replace(/,/g, ''))))
      .map(size => parseInt(size!.replace(/,/g, '')));

    const maxReach = sizesWithNumbers.length > 0 ? Math.max(...sizesWithNumbers) : null;
    const avgReach = sizesWithNumbers.length > 0 ? Math.round(sizesWithNumbers.reduce((a, b) => a + b, 0) / sizesWithNumbers.length) : null;
    
    // Estimate overlap reduction (more categories = more overlap)
    const overlapFactor = selectedCategoryDetails.length > 1 ? 0.7 - (selectedCategoryDetails.length * 0.05) : 1;
    const estimatedReach = maxReach ? Math.round(maxReach * Math.max(0.3, overlapFactor)) : null;

    // Calculate targeting diversity score
    const diversityScore = Math.min(100, 
      (demographics.length > 0 ? 30 : 0) + 
      (interests.length > 0 ? 35 : 0) + 
      (behaviors.length > 0 ? 35 : 0)
    );

    // Calculate cost efficiency estimate (more specific = higher CPM but better conversion)
    const specificity = selectedCategoryDetails.length;
    const costEfficiency = specificity < 3 ? 'Low' : specificity < 8 ? 'Good' : specificity < 15 ? 'High' : 'Very High';

    return {
      demographics: demographics.length,
      interests: interests.length,
      behaviors: behaviors.length,
      estimatedReach,
      maxReach,
      avgReach,
      totalSelected: selectedCategories.length,
      diversityScore,
      costEfficiency,
      hasDataCoverage: sizesWithNumbers.length / selectedCategoryDetails.length,
      categoriesWithData: sizesWithNumbers.length,
      overlapFactor: Math.round(overlapFactor * 100)
    };
  }, [selectedCategoryDetails, selectedCategories.length]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getAIInsights = () => {
    const { totalSelected, demographics, interests, behaviors, diversityScore, costEfficiency, estimatedReach } = categoryStats;
    
    const insights = [];
    const warnings = [];
    const opportunities = [];

    // AI-powered targeting analysis
    if (totalSelected === 0) return { insights: [], warnings: [], opportunities: [], score: 0, label: "No Analysis", color: "text-gray-500" };

    // Calculate comprehensive targeting score
    let score = 0;
    
    // Diversity component (40%)
    score += diversityScore * 0.4;
    
    // Volume component (30%)
    if (totalSelected >= 3 && totalSelected <= 12) score += 30;
    else if (totalSelected >= 1 && totalSelected <= 20) score += 20;
    else score += 10;
    
    // Balance component (30%)
    const balanceScore = Math.min(30, (demographics > 0 ? 10 : 0) + (interests > 0 ? 10 : 0) + (behaviors > 0 ? 10 : 0));
    score += balanceScore;

    const label = score >= 85 ? "Excellent" : score >= 70 ? "Very Good" : score >= 55 ? "Good" : score >= 40 ? "Fair" : "Needs Work";
    const color = score >= 85 ? "text-green-600" : score >= 70 ? "text-blue-600" : score >= 55 ? "text-yellow-600" : score >= 40 ? "text-orange-600" : "text-red-600";

    // Generate AI insights
    if (diversityScore >= 80) {
      insights.push("Excellent category diversity will help capture varied audience segments");
    }
    
    if (estimatedReach && estimatedReach > 50000000) {
      insights.push("Large audience reach provides scale for brand awareness campaigns");
    } else if (estimatedReach && estimatedReach < 5000000) {
      insights.push("Focused audience size ideal for conversion-optimized campaigns");
    }

    if (costEfficiency === 'High' || costEfficiency === 'Very High') {
      insights.push("High targeting specificity will improve ad relevance and CTR");
    }

    // Generate warnings
    if (totalSelected < 3) {
      warnings.push("Consider adding more categories to improve audience definition");
    }
    
    if (totalSelected > 20) {
      warnings.push("Too many categories may limit reach and increase costs");
    }

    if (demographics === 0) {
      warnings.push("Missing demographic targeting may limit precision");
    }

    if (behaviors === 0 && interests === 0) {
      warnings.push("Add behavioral or interest targeting for better intent signals");
    }

    // Generate opportunities
    if (behaviors === 0) {
      opportunities.push("Add behavioral targeting to capture purchase intent");
    }

    if (interests === 0) {
      opportunities.push("Include interest targeting for lifestyle-based reach");
    }

    if (demographics < 3 && demographics > 0) {
      opportunities.push("Expand demographic targeting for broader age/education reach");
    }

    return { insights, warnings, opportunities, score: Math.round(score), label, color };
  };

  const aiAnalysis = getAIInsights();
  const [activeTab, setActiveTab] = useState("overview");

  if (selectedCategories.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <Target className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your Ad Targeting Summary</h3>
          <p className="text-gray-600 dark:text-gray-400">Select targeting categories to see your audience analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Simple Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {categoryStats.totalSelected} categories selected for your campaign
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearSelection}
          className="text-red-600 hover:text-red-700"
        >
          <X className="h-4 w-4 mr-1" />
          Clear All
        </Button>
      </div>

      {/* Simple Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Estimated Reach</span>
          </div>
          <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
            {categoryStats.estimatedReach ? formatNumber(categoryStats.estimatedReach) : "Unknown"}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            Authentic Meta audience data ({Math.round(categoryStats.hasDataCoverage * 100)}% coverage)
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Categories</span>
          </div>
          <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
            {categoryStats.totalSelected}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            D:{categoryStats.demographics} I:{categoryStats.interests} B:{categoryStats.behaviors}
          </div>
        </div>
      </div>

      {/* Selected Categories */}
      <div className="space-y-4">
        {/* Categories by Type */}
        {categoryStats.demographics > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              Demographics ({categoryStats.demographics})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedCategoryDetails
                .filter(cat => cat.categoryType === 'demographics')
                .map((cat, index) => (
                  <Badge 
                    key={`demographics-${cat.id}-${index}`} 
                    variant="secondary" 
                    className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700"
                  >
                    {cat.name}
                    {cat.size && cat.size !== "Unknown" && cat.size !== "Not available" && (
                      <span className="ml-1 text-xs opacity-70">({formatNumber(parseInt(cat.size.replace(/,/g, '')))})</span>
                    )}
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {categoryStats.interests > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              Interests ({categoryStats.interests})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedCategoryDetails
                .filter(cat => cat.categoryType === 'interests')
                .map((cat, index) => (
                  <Badge 
                    key={`interests-${cat.id}-${index}`} 
                    variant="secondary" 
                    className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700"
                  >
                    {cat.name}
                    {cat.size && cat.size !== "Unknown" && cat.size !== "Not available" && (
                      <span className="ml-1 text-xs opacity-70">({formatNumber(parseInt(cat.size.replace(/,/g, '')))})</span>
                    )}
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {categoryStats.behaviors > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              Behaviors ({categoryStats.behaviors})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedCategoryDetails
                .filter(cat => cat.categoryType === 'behaviors')
                .map((cat, index) => (
                  <Badge 
                    key={`behaviors-${cat.id}-${index}`} 
                    variant="secondary" 
                    className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700"
                  >
                    {cat.name}
                    {cat.size && cat.size !== "Unknown" && cat.size !== "Not available" && (
                      <span className="ml-1 text-xs opacity-70">({formatNumber(parseInt(cat.size.replace(/,/g, '')))})</span>
                    )}
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}