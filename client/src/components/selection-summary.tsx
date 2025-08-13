import { useMemo } from "react";
import { Users, Target, TrendingUp, Globe, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

    return selectedCategories.map(id => findCategory(id)).filter(Boolean) as TargetingCategory[];
  }, [selectedCategories, allCategories]);

  const categoryStats = useMemo(() => {
    const demographics = selectedCategoryDetails.filter(cat => cat.categoryType === 'demographics');
    const interests = selectedCategoryDetails.filter(cat => cat.categoryType === 'interests');
    const behaviors = selectedCategoryDetails.filter(cat => cat.categoryType === 'behaviors');

    // Calculate estimated total audience size
    const sizesWithNumbers = selectedCategoryDetails
      .map(cat => cat.size)
      .filter(size => size && size !== "Unknown" && !isNaN(parseInt(size.replace(/,/g, ''))))
      .map(size => parseInt(size!.replace(/,/g, '')));

    const estimatedReach = sizesWithNumbers.length > 0 
      ? Math.max(...sizesWithNumbers) // Use largest audience as estimate (they overlap)
      : null;

    return {
      demographics: demographics.length,
      interests: interests.length,
      behaviors: behaviors.length,
      estimatedReach,
      totalSelected: selectedCategories.length
    };
  }, [selectedCategoryDetails, selectedCategories.length]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTargetingScore = (): { score: number; label: string; color: string } => {
    const total = categoryStats.totalSelected;
    if (total >= 8) return { score: 95, label: "Excellent", color: "text-green-600" };
    if (total >= 5) return { score: 85, label: "Very Good", color: "text-blue-600" };
    if (total >= 3) return { score: 70, label: "Good", color: "text-yellow-600" };
    if (total >= 1) return { score: 50, label: "Basic", color: "text-orange-600" };
    return { score: 0, label: "None", color: "text-gray-600" };
  };

  const targetingScore = getTargetingScore();

  if (selectedCategories.length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-600 dark:text-gray-400">No targeting categories selected</p>
        <p className="text-sm text-gray-500 mt-1">Select categories from the explorer to see your audience summary</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Audience Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Estimated Reach</span>
          </div>
          <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
            {categoryStats.estimatedReach ? formatNumber(categoryStats.estimatedReach) : "Unknown"}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
            People who may see your ads
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Categories</span>
          </div>
          <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
            {categoryStats.totalSelected}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Targeting criteria selected
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Targeting Score</span>
          </div>
          <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
            {targetingScore.score}%
          </div>
          <div className={`text-xs mt-1 font-medium ${targetingScore.color}`}>
            {targetingScore.label} targeting
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Coverage</span>
          </div>
          <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
            {categoryStats.demographics + categoryStats.interests + categoryStats.behaviors}
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
            D:{categoryStats.demographics} I:{categoryStats.interests} B:{categoryStats.behaviors}
          </div>
        </div>
      </div>

      <Separator />

      {/* Selected Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Selected Categories</h3>
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
                .map(cat => (
                  <Badge key={cat.id} variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700">
                    {cat.name}
                    {cat.size && cat.size !== "Unknown" && (
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
                .map(cat => (
                  <Badge key={cat.id} variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700">
                    {cat.name}
                    {cat.size && cat.size !== "Unknown" && (
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
                .map(cat => (
                  <Badge key={cat.id} variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700">
                    {cat.name}
                    {cat.size && cat.size !== "Unknown" && (
                      <span className="ml-1 text-xs opacity-70">({formatNumber(parseInt(cat.size.replace(/,/g, '')))})</span>
                    )}
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Strategic Insights */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Strategic Insights</h4>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          {categoryStats.totalSelected < 3 && (
            <p className="text-amber-700 dark:text-amber-300">• Consider adding more targeting categories for better audience definition</p>
          )}
          {categoryStats.totalSelected > 15 && (
            <p className="text-orange-700 dark:text-orange-300">• You may want to reduce categories to avoid overly narrow targeting</p>
          )}
          {categoryStats.demographics === 0 && (
            <p className="text-blue-700 dark:text-blue-300">• Add demographic targeting for better audience precision</p>
          )}
          {categoryStats.interests === 0 && (
            <p className="text-blue-700 dark:text-blue-300">• Include interest targeting to reach users based on their preferences</p>
          )}
          {categoryStats.behaviors === 0 && (
            <p className="text-blue-700 dark:text-blue-300">• Consider behavioral targeting for purchase intent signals</p>
          )}
          {categoryStats.totalSelected >= 3 && categoryStats.demographics > 0 && categoryStats.interests > 0 && (
            <p className="text-green-700 dark:text-green-300">• Great mix of targeting categories for comprehensive audience reach</p>
          )}
        </div>
      </div>
    </div>
  );
}