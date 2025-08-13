import { useState } from "react";
import { Search, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import TreeNode from "./tree-node";
import type { HierarchicalTargetingCategory } from "@shared/schema";

interface HierarchicalTreeExplorerProps {
  categories: HierarchicalTargetingCategory[];
  selectedCategories: string[];
  onCategorySelect: (categoryId: string, selected: boolean) => void;
}

export default function HierarchicalTreeExplorer({ 
  categories, 
  selectedCategories, 
  onCategorySelect 
}: HierarchicalTreeExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Get only top-level categories (Demographics, Interests, Behaviors)
  const topLevelCategories = categories.filter(cat => cat.level === 1);

  // Filter by search if query exists
  const filteredCategories = searchQuery 
    ? filterCategoriesBySearch(topLevelCategories, searchQuery)
    : topLevelCategories;

  const getSelectedCategoryNames = () => {
    const findCategoryName = (categories: HierarchicalTargetingCategory[], id: string): string | null => {
      for (const cat of categories) {
        if (cat.id === id) return cat.name;
        if (cat.children) {
          const found = findCategoryName(cat.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    return selectedCategories.map(id => findCategoryName(categories, id)).filter(Boolean);
  };

  const selectedNames = getSelectedCategoryNames();

  const clearAllSelections = () => {
    selectedCategories.forEach(id => onCategorySelect(id, false));
  };

  return (
    <div className="space-y-4">
      {/* Selected categories display */}
      {selectedCategories.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Selected ({selectedCategories.length})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllSelections}
              className="h-6 px-2 text-xs"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
            {selectedNames.map((name, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {name}
              </Badge>
            ))}
          </div>
        </div>
      )}

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

      {/* Hierarchical Tree */}
      <ScrollArea className="h-[500px] border rounded-md">
        <div className="p-2">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-500" data-testid="empty-tree">
              <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>
                {searchQuery 
                  ? `No categories found for "${searchQuery}"` 
                  : "No targeting categories found"
                }
              </p>
            </div>
          ) : (
            <div data-testid="hierarchical-tree">
              {filteredCategories.map((category) => (
                <TreeNode
                  key={category.id}
                  item={category}
                  selectedCategories={selectedCategories}
                  onCategorySelect={onCategorySelect}
                  level={1}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// Helper function to filter categories by search query
function filterCategoriesBySearch(
  categories: HierarchicalTargetingCategory[], 
  query: string
): HierarchicalTargetingCategory[] {
  const searchLower = query.toLowerCase();
  
  const filterRecursive = (items: HierarchicalTargetingCategory[]): HierarchicalTargetingCategory[] => {
    return items.reduce((acc, item) => {
      const nameMatch = item.name.toLowerCase().includes(searchLower);
      const filteredChildren = item.children ? filterRecursive(item.children) : [];
      
      if (nameMatch || filteredChildren.length > 0) {
        acc.push({
          ...item,
          children: filteredChildren
        });
      }
      
      return acc;
    }, [] as HierarchicalTargetingCategory[]);
  };
  
  return filterRecursive(categories);
}