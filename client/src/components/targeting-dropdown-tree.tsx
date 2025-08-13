import { useState } from "react";
import { ChevronRight, ChevronDown, Target, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HierarchicalTargetingCategory } from "@shared/schema";

interface TargetingDropdownTreeProps {
  categories: HierarchicalTargetingCategory[];
  selectedCategories: string[];
  onCategorySelect: (categoryId: string, selected: boolean) => void;
}

interface TreeNodeProps {
  category: HierarchicalTargetingCategory;
  selectedCategories: string[];
  onCategorySelect: (categoryId: string, selected: boolean) => void;
  level: number;
}

function TreeNode({ category, selectedCategories, onCategorySelect, level }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level === 1); // Auto-expand only top level
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedCategories.includes(category.id);
  
  // Parse size for display
  const parseSize = (sizeStr: string): string => {
    if (!sizeStr || sizeStr === "Unknown" || sizeStr === "") return "";
    if (sizeStr.includes("Size:")) {
      return sizeStr.replace("Size:", "").trim();
    }
    return sizeStr;
  };

  const displaySize = parseSize(category.size || "");
  const indent = level * 16;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCategorySelect(category.id, !isSelected);
  };

  return (
    <div>
      {/* Node */}
      <div 
        className={cn(
          "flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors group border-l-2",
          isSelected ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500" : "border-transparent",
          level > 1 && "ml-4"
        )}
        style={{ paddingLeft: `${12 + indent}px` }}
        onClick={handleSelect}
        data-testid={`tree-node-${category.id}`}
      >
        {/* Expand/collapse button */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 shrink-0",
            !hasChildren && "invisible"
          )}
          onClick={handleToggle}
          data-testid={`expand-button-${category.id}`}
          title={hasChildren ? (isExpanded ? "Collapse" : "Expand") : ""}
        >
          {hasChildren && (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )
          )}
        </Button>
        
        {/* Category icon */}
        <div className="flex-shrink-0">
          {level === 1 ? (
            <Target className="h-4 w-4 text-blue-600" />
          ) : (
            <Users className={cn(
              "h-3 w-3",
              level === 2 ? "text-green-600" :
              level === 3 ? "text-orange-600" :
              level === 4 ? "text-purple-600" : "text-gray-600"
            )} />
          )}
        </div>
        
        {/* Category name and info */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className={cn(
            "font-medium truncate",
            level === 1 ? "text-base" : "text-sm",
            isSelected && "text-blue-700 dark:text-blue-300"
          )}>
            {category.name}
          </span>
          
          {displaySize && (
            <Badge variant="secondary" className="text-xs shrink-0">
              {displaySize}
            </Badge>
          )}
          
          <Badge variant="outline" className="text-xs shrink-0">
            L{category.level}
          </Badge>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <Check className="h-4 w-4 text-blue-600 shrink-0" />
        )}
      </div>
      
      {/* Children - Only show when expanded */}
      {hasChildren && isExpanded && (
        <div className="ml-2 border-l border-gray-200 dark:border-gray-700">
          {category.children!.map((child) => (
            <TreeNode
              key={child.id}
              category={child}
              selectedCategories={selectedCategories}
              onCategorySelect={onCategorySelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TargetingDropdownTree({ 
  categories, 
  selectedCategories, 
  onCategorySelect 
}: TargetingDropdownTreeProps) {
  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500" data-testid="empty-tree">
        <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No targeting categories found</p>
      </div>
    );
  }

  return (
    <div className="space-y-1" data-testid="targeting-dropdown-tree">
      {categories.map((category) => (
        <TreeNode
          key={category.id}
          category={category}
          selectedCategories={selectedCategories}
          onCategorySelect={onCategorySelect}
          level={1}
        />
      ))}
    </div>
  );
}