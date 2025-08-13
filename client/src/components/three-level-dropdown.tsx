import { useState } from "react";
import { ChevronDown, Target, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { HierarchicalTargetingCategory } from "@shared/schema";

interface ThreeLevelDropdownProps {
  categories: HierarchicalTargetingCategory[];
  selectedCategories: string[];
  onCategorySelect: (categoryId: string, selected: boolean) => void;
}

export default function ThreeLevelDropdown({ 
  categories, 
  selectedCategories, 
  onCategorySelect 
}: ThreeLevelDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLevel1, setSelectedLevel1] = useState<string | null>(null);
  const [selectedLevel2, setSelectedLevel2] = useState<string | null>(null);

  // Get the three main categories (Demographics, Interests, Behaviors)
  const level1Categories = categories.filter(cat => cat.level === 1);
  
  // Get level 2 categories for selected level 1
  const level2Categories = selectedLevel1 
    ? categories.find(cat => cat.id === selectedLevel1)?.children || []
    : [];
    
  // Get level 3 categories for selected level 2
  const level3Categories = selectedLevel2 
    ? level2Categories.find(cat => cat.id === selectedLevel2)?.children || []
    : [];

  // Get level 4 categories for selected level 3
  const getCurrentLevelCategories = () => {
    if (!selectedLevel1) return level1Categories;
    if (!selectedLevel2) return level2Categories;
    return level3Categories;
  };

  const currentCategories = getCurrentLevelCategories();

  const handleCategoryClick = (category: HierarchicalTargetingCategory) => {
    const hasChildren = category.children && category.children.length > 0;
    
    if (category.level === 1) {
      setSelectedLevel1(category.id);
      setSelectedLevel2(null);
    } else if (category.level === 2) {
      setSelectedLevel2(category.id);
    } else {
      // Level 3+ categories - check if selectable
      if (!hasChildren) {
        // This is a leaf category, select it
        const isSelected = selectedCategories.includes(category.id);
        onCategorySelect(category.id, !isSelected);
      }
    }
  };

  const resetToLevel = (level: number) => {
    if (level <= 1) {
      setSelectedLevel1(null);
      setSelectedLevel2(null);
    } else if (level <= 2) {
      setSelectedLevel2(null);
    }
  };

  const parseSize = (sizeStr: string): string => {
    if (!sizeStr || sizeStr === "Unknown" || sizeStr === "") return "";
    if (sizeStr.includes("Size:")) {
      return sizeStr.replace("Size:", "").trim();
    }
    return sizeStr;
  };

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
  const selectedLevel1Name = selectedLevel1 ? level1Categories.find(c => c.id === selectedLevel1)?.name : null;
  const selectedLevel2Name = selectedLevel2 ? level2Categories.find(c => c.id === selectedLevel2)?.name : null;

  return (
    <div className="space-y-3">
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
              onClick={() => selectedCategories.forEach(id => onCategorySelect(id, false))}
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

      {/* Three Level Dropdown */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between h-auto min-h-[40px] px-3 py-2"
            data-testid="three-level-dropdown-trigger"
          >
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {!selectedLevel1 
                  ? "Select targeting categories..." 
                  : selectedLevel1Name + (selectedLevel2Name ? ` > ${selectedLevel2Name}` : "")
                }
              </span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
          {/* Header with breadcrumb */}
          <div className="p-3 border-b bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-2 text-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetToLevel(0)}
                className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
                disabled={!selectedLevel1}
              >
                Categories
              </Button>
              
              {selectedLevel1Name && (
                <>
                  <span className="text-gray-400">&gt;</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetToLevel(1)}
                    className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
                    disabled={!selectedLevel2}
                  >
                    {selectedLevel1Name}
                  </Button>
                </>
              )}
              
              {selectedLevel2Name && (
                <>
                  <span className="text-gray-400">&gt;</span>
                  <span className="text-xs font-medium">{selectedLevel2Name}</span>
                </>
              )}
            </div>
          </div>
          
          {/* Categories list */}
          <ScrollArea className="h-80">
            <div className="p-1">
              {currentCategories.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  No categories available
                </div>
              ) : (
                currentCategories.map((category) => {
                  const hasChildren = category.children && category.children.length > 0;
                  const isSelected = selectedCategories.includes(category.id);
                  const displaySize = parseSize(category.size || "");
                  const isSelectable = !hasChildren;
                  
                  return (
                    <div
                      key={category.id}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors",
                        isSelected && "bg-blue-50 dark:bg-blue-900/20"
                      )}
                      onClick={() => handleCategoryClick(category)}
                      data-testid={`category-option-${category.id}`}
                    >
                      {/* Selection checkbox or arrow */}
                      <div className="flex h-5 w-5 items-center justify-center shrink-0">
                        {isSelectable ? (
                          isSelected ? (
                            <Check className="h-4 w-4 text-blue-600" />
                          ) : (
                            <div className="h-4 w-4 border border-gray-300 rounded" />
                          )
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500 rotate-270" />
                        )}
                      </div>
                      
                      {/* Category info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-medium truncate",
                            category.level === 1 ? "text-lg text-blue-900 dark:text-blue-100" :
                            category.level === 2 ? "text-base text-green-900 dark:text-green-100" :
                            "text-sm text-gray-900 dark:text-gray-100"
                          )}>
                            {category.name}
                          </span>
                          
                          <Badge variant="outline" className="text-xs shrink-0">
                            L{category.level}
                          </Badge>
                          
                          {displaySize && (
                            <Badge variant="secondary" className="text-xs shrink-0">
                              {displaySize}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-500 mt-1">
                          {hasChildren ? (
                            `Click to explore ${category.children?.length || 0} subcategories`
                          ) : (
                            "Click to select this targeting category"
                          )}
                        </div>
                      </div>

                      {/* Item count for expandable categories */}
                      {hasChildren && (
                        <Badge variant="outline" className="text-xs">
                          {category.children?.length || 0}
                        </Badge>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}