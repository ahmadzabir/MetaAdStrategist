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
      <div className="text-center py-12">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-2xl border border-blue-200 dark:border-blue-800">
          <Brain className="h-16 w-16 mx-auto text-blue-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Targeting Analysis</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-1">Select targeting categories to unlock intelligent insights</p>
          <p className="text-sm text-gray-500 mt-2">Our AI will analyze your selection for optimal campaign performance</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Score & Quick Actions Header */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-emerald-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Targeting Analysis</h3>
              <div className="flex items-center gap-3 mt-1">
                <div className={`text-lg font-semibold ${aiAnalysis.color}`}>
                  {aiAnalysis.score}% {aiAnalysis.label}
                </div>
                <Badge variant="outline" className="bg-white dark:bg-gray-800">
                  {categoryStats.totalSelected} categories
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Enhanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 p-5 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Estimated Reach</span>
          </div>
          <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
            {categoryStats.estimatedReach ? formatNumber(categoryStats.estimatedReach) : "Calculating..."}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {Math.round(categoryStats.hasDataCoverage * 100)}% authentic Meta data
          </div>
          {categoryStats.overlapFactor < 80 && (
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              {categoryStats.overlapFactor}% overlap considered
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Diversity Score</span>
          </div>
          <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
            {categoryStats.diversityScore}%
          </div>
          <Progress value={categoryStats.diversityScore} className="mt-2 h-2" />
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            D:{categoryStats.demographics} I:{categoryStats.interests} B:{categoryStats.behaviors}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-5 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Cost Efficiency</span>
          </div>
          <div className="text-lg font-bold text-purple-800 dark:text-purple-200">
            {categoryStats.costEfficiency}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-2">
            {categoryStats.totalSelected < 8 ? 'Lower CPM, broader reach' : 'Higher CPM, better targeting'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 p-5 rounded-xl border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Campaign Fit</span>
          </div>
          <div className="text-lg font-bold text-orange-800 dark:text-orange-200">
            {categoryStats.estimatedReach && categoryStats.estimatedReach > 20000000 ? 'Awareness' : 
             categoryStats.estimatedReach && categoryStats.estimatedReach > 5000000 ? 'Consideration' : 'Conversion'}
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-400 mt-2">
            Based on audience size & specificity
          </div>
        </div>
      </div>

      {/* AI Insights Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Optimize
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Audience Breakdown */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Audience Breakdown</h4>
            <div className="space-y-4">
              {categoryStats.estimatedReach && (
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="font-semibold text-blue-700 dark:text-blue-300">Max Reach</div>
                    <div className="text-lg font-bold">{formatNumber(categoryStats.maxReach || 0)}</div>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <div className="font-semibold text-emerald-700 dark:text-emerald-300">Estimated</div>
                    <div className="text-lg font-bold">{formatNumber(categoryStats.estimatedReach)}</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="font-semibold text-purple-700 dark:text-purple-300">Average</div>
                    <div className="text-lg font-bold">{formatNumber(categoryStats.avgReach || 0)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {/* AI Insights */}
          <div className="space-y-3">
            {aiAnalysis.insights.length > 0 && (
              <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  <strong>AI Insights:</strong>
                  <ul className="mt-2 space-y-1">
                    {aiAnalysis.insights.map((insight, i) => (
                      <li key={i} className="text-sm">• {insight}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {aiAnalysis.warnings.length > 0 && (
              <Alert className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  <strong>Recommendations:</strong>
                  <ul className="mt-2 space-y-1">
                    {aiAnalysis.warnings.map((warning, i) => (
                      <li key={i} className="text-sm">• {warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {aiAnalysis.opportunities.length > 0 && (
              <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <strong>Growth Opportunities:</strong>
                  <ul className="mt-2 space-y-1">
                    {aiAnalysis.opportunities.map((opportunity, i) => (
                      <li key={i} className="text-sm">• {opportunity}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Selected Categories</h4>

            {/* Categories by Type */}
            {categoryStats.demographics > 0 && (
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  Demographics ({categoryStats.demographics})
                </h5>
                <div className="flex flex-wrap gap-2">
                  {selectedCategoryDetails
                    .filter(cat => cat.categoryType === 'demographics')
                    .map((cat, index) => (
                      <Badge 
                        key={`demographics-${cat.id}-${index}`} 
                        variant="secondary" 
                        className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 animate-in fade-in slide-in-from-left-2 duration-300 hover:scale-105 transition-transform cursor-pointer"
                        style={{ animationDelay: `${index * 50}ms` }}
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
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  Interests ({categoryStats.interests})
                </h5>
                <div className="flex flex-wrap gap-2">
                  {selectedCategoryDetails
                    .filter(cat => cat.categoryType === 'interests')
                    .map((cat, index) => (
                      <Badge 
                        key={`interests-${cat.id}-${index}`} 
                        variant="secondary" 
                        className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700 animate-in fade-in slide-in-from-left-2 duration-300 hover:scale-105 transition-transform cursor-pointer"
                        style={{ animationDelay: `${index * 50}ms` }}
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
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  Behaviors ({categoryStats.behaviors})
                </h5>
                <div className="flex flex-wrap gap-2">
                  {selectedCategoryDetails
                    .filter(cat => cat.categoryType === 'behaviors')
                    .map((cat, index) => (
                      <Badge 
                        key={`behaviors-${cat.id}-${index}`} 
                        variant="secondary" 
                        className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700 animate-in fade-in slide-in-from-left-2 duration-300 hover:scale-105 transition-transform cursor-pointer"
                        style={{ animationDelay: `${index * 50}ms` }}
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
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          {/* Campaign Optimization Suggestions */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              Campaign Optimization
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h5 className="font-medium text-gray-800 dark:text-gray-200">Recommended Budget Allocation</h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Awareness Phase</span>
                    <span className="font-medium">{categoryStats.estimatedReach && categoryStats.estimatedReach > 20000000 ? '60%' : '30%'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Consideration Phase</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Conversion Phase</span>
                    <span className="font-medium">{categoryStats.totalSelected > 10 ? '40%' : '20%'}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h5 className="font-medium text-gray-800 dark:text-gray-200">Optimal Campaign Duration</h5>
                <div className="text-2xl font-bold text-purple-600">
                  {categoryStats.estimatedReach && categoryStats.estimatedReach > 50000000 ? '2-3 weeks' : 
                   categoryStats.estimatedReach && categoryStats.estimatedReach > 10000000 ? '3-4 weeks' : '4-6 weeks'}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Based on audience size and targeting complexity
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}