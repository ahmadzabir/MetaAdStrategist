import { useState } from "react";
import { ChevronDown, Target, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { HierarchicalTargetingCategory } from "@shared/schema";

interface TargetingDropdownSelectorProps {
  categories: HierarchicalTargetingCategory[];
  selectedCategories: string[];
  onCategorySelect: (categoryId: string, selected: boolean) => void;
}

interface FlatCategory {
  id: string;
  name: string;
  level: number;
  size: string;
  path: string[];
}

function flattenCategories(categories: HierarchicalTargetingCategory[], path: string[] = []): FlatCategory[] {
  const flattened: FlatCategory[] = [];
  
  categories.forEach(category => {
    const currentPath = [...path, category.name];
    flattened.push({
      id: category.id,
      name: category.name,
      level: category.level,
      size: category.size || "",
      path: currentPath
    });
    
    if (category.children && category.children.length > 0) {
      flattened.push(...flattenCategories(category.children, currentPath));
    }
  });
  
  return flattened;
}

export default function TargetingDropdownSelector({ 
  categories, 
  selectedCategories, 
  onCategorySelect 
}: TargetingDropdownSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const flatCategories = flattenCategories(categories);
  
  const filteredCategories = flatCategories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.path.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedCategoryNames = flatCategories
    .filter(cat => selectedCategories.includes(cat.id))
    .map(cat => cat.name);

  const parseSize = (sizeStr: string): string => {
    if (!sizeStr || sizeStr === "Unknown" || sizeStr === "") return "";
    if (sizeStr.includes("Size:")) {
      return sizeStr.replace("Size:", "").trim();
    }
    return sizeStr;
  };

  const handleCategoryToggle = (categoryId: string) => {
    const isSelected = selectedCategories.includes(categoryId);
    onCategorySelect(categoryId, !isSelected);
  };

  const clearAll = () => {
    selectedCategories.forEach(id => onCategorySelect(id, false));
  };

  return (
    <div className="space-y-2">
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
              onClick={clearAll}
              className="h-6 px-2 text-xs"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
            {selectedCategoryNames.map((name, index) => (
              <Badge 
                key={index}
                variant="secondary" 
                className="text-xs flex items-center gap-1"
              >
                {name}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-red-500" 
                  onClick={() => {
                    const category = flatCategories.find(cat => cat.name === name);
                    if (category) handleCategoryToggle(category.id);
                  }}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Dropdown selector */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between h-auto min-h-[40px] px-3 py-2"
            data-testid="targeting-dropdown-trigger"
          >
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {selectedCategories.length === 0 
                  ? "Select targeting categories..." 
                  : `${selectedCategories.length} categories selected`
                }
              </span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
          <div className="p-3 border-b">
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8"
              data-testid="category-search"
            />
          </div>
          
          <ScrollArea className="h-80">
            <div className="p-1">
              {filteredCategories.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  No categories found
                </div>
              ) : (
                filteredCategories.map((category) => {
                  const isSelected = selectedCategories.includes(category.id);
                  const displaySize = parseSize(category.size);
                  
                  return (
                    <div
                      key={category.id}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md",
                        isSelected && "bg-blue-50 dark:bg-blue-900/20"
                      )}
                      onClick={() => handleCategoryToggle(category.id)}
                      data-testid={`category-option-${category.id}`}
                    >
                      <div className="flex h-4 w-4 items-center justify-center">
                        {isSelected && <Check className="h-3 w-3 text-blue-600" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span 
                            className={cn(
                              "truncate",
                              category.level === 1 && "font-medium",
                              category.level > 1 && `ml-${(category.level - 1) * 2}`
                            )}
                            style={{ marginLeft: `${(category.level - 1) * 8}px` }}
                          >
                            {category.name}
                          </span>
                          <Badge variant="outline" className="text-xs shrink-0">
                            L{category.level}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-gray-500 truncate">
                          {category.path.slice(0, -1).join(" > ")}
                        </div>
                        
                        {displaySize && (
                          <div className="text-xs text-gray-400">
                            {displaySize}
                          </div>
                        )}
                      </div>
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