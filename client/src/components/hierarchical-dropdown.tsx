import { useState } from "react";
import { ChevronDown, ChevronRight, ArrowLeft, Target, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { HierarchicalTargetingCategory } from "@shared/schema";

interface HierarchicalDropdownProps {
  categories: HierarchicalTargetingCategory[];
  selectedCategories: string[];
  onCategorySelect: (categoryId: string, selected: boolean) => void;
}

interface BreadcrumbItem {
  id: string;
  name: string;
  level: number;
}

export default function HierarchicalDropdown({ 
  categories, 
  selectedCategories, 
  onCategorySelect 
}: HierarchicalDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState<BreadcrumbItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Get current level categories based on navigation path
  const getCurrentLevelCategories = (): HierarchicalTargetingCategory[] => {
    if (currentPath.length === 0) {
      // Return top level categories (Demographics, Interests, Behaviors)
      return categories;
    }

    // Navigate through the path to find current level
    let current = categories;
    for (const pathItem of currentPath) {
      const found = current.find(cat => cat.id === pathItem.id);
      if (found && found.children) {
        current = found.children;
      } else {
        return [];
      }
    }
    return current;
  };

  const currentCategories = getCurrentLevelCategories();
  
  // Filter categories by search when searching
  const filteredCategories = searchQuery 
    ? currentCategories.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentCategories;

  const handleCategoryClick = (category: HierarchicalTargetingCategory) => {
    const hasChildren = category.children && category.children.length > 0;
    
    if (hasChildren) {
      // Navigate deeper
      setCurrentPath(prev => [...prev, {
        id: category.id,
        name: category.name,
        level: category.level
      }]);
      setSearchQuery(""); // Clear search when navigating
    } else {
      // This is a selectable leaf category
      const isSelected = selectedCategories.includes(category.id);
      onCategorySelect(category.id, !isSelected);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    // Navigate back to specific level
    setCurrentPath(prev => prev.slice(0, index));
    setSearchQuery("");
  };

  const goBack = () => {
    setCurrentPath(prev => prev.slice(0, -1));
    setSearchQuery("");
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

      {/* Hierarchical Dropdown */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between h-auto min-h-[40px] px-3 py-2"
            data-testid="hierarchical-dropdown-trigger"
          >
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {selectedCategories.length === 0 
                  ? "Browse targeting categories..." 
                  : `${selectedCategories.length} categories selected`
                }
              </span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
          {/* Header with navigation */}
          <div className="p-3 border-b bg-gray-50 dark:bg-gray-800">
            {/* Breadcrumb navigation */}
            <div className="flex items-center gap-1 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBreadcrumbClick(0)}
                className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
                disabled={currentPath.length === 0}
              >
                Categories
              </Button>
              {currentPath.map((item, index) => (
                <div key={item.id} className="flex items-center gap-1">
                  <ChevronRight className="h-3 w-3 text-gray-400" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBreadcrumbClick(index + 1)}
                    className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
                    disabled={index === currentPath.length - 1}
                  >
                    {item.name}
                  </Button>
                </div>
              ))}
            </div>

            {/* Back button */}
            {currentPath.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                className="h-7 px-2 text-xs mb-2"
              >
                <ArrowLeft className="h-3 w-3 mr-1" />
                Back
              </Button>
            )}

            {/* Search */}
            <Input
              placeholder={`Search in ${currentPath.length > 0 ? currentPath[currentPath.length - 1].name : 'all categories'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8"
              data-testid="category-search"
            />
          </div>
          
          {/* Categories list */}
          <ScrollArea className="h-80">
            <div className="p-1">
              {filteredCategories.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  {searchQuery ? "No categories found" : "No categories available"}
                </div>
              ) : (
                filteredCategories.map((category) => {
                  const hasChildren = category.children && category.children.length > 0;
                  const isSelected = selectedCategories.includes(category.id);
                  const displaySize = parseSize(category.size || "");
                  
                  return (
                    <div
                      key={category.id}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors",
                        isSelected && "bg-blue-50 dark:bg-blue-900/20"
                      )}
                      onClick={() => handleCategoryClick(category)}
                      data-testid={`category-option-${category.id}`}
                    >
                      {/* Icon */}
                      <div className="flex h-5 w-5 items-center justify-center shrink-0">
                        {hasChildren ? (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        ) : isSelected ? (
                          <Check className="h-4 w-4 text-blue-600" />
                        ) : (
                          <div className="h-4 w-4 border border-gray-300 rounded" />
                        )}
                      </div>
                      
                      {/* Category info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-medium truncate",
                            hasChildren ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
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
                        
                        {hasChildren && (
                          <div className="text-xs text-gray-500 mt-1">
                            Click to explore subcategories
                          </div>
                        )}
                      </div>

                      {/* Indicator */}
                      {hasChildren && (
                        <Badge variant="outline" className="text-xs">
                          {category.children?.length || 0} items
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