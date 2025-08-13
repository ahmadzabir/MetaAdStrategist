import { useState } from "react";
import { ChevronRight, ChevronDown, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { HierarchicalTargetingCategory } from "@shared/schema";

interface TargetingTreeProps {
  categories: HierarchicalTargetingCategory[];
  selectedCategories: string[];
  onCategorySelect: (categoryId: string, selected: boolean) => void;
  level?: number;
}

interface TreeNodeProps {
  category: HierarchicalTargetingCategory;
  selectedCategories: string[];
  onCategorySelect: (categoryId: string, selected: boolean) => void;
  level: number;
}

function TreeNode({ category, selectedCategories, onCategorySelect, level }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels
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
  const indent = level * 20;

  return (
    <div className="select-none">
      <div 
        className={cn(
          "flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md cursor-pointer transition-colors",
          isSelected && "bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500"
        )}
        style={{ paddingLeft: `${12 + indent}px` }}
        data-testid={`tree-node-${category.id}`}
      >
        {/* Expand/collapse button */}
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            data-testid={`expand-button-${category.id}`}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}
        
        {!hasChildren && <div className="w-6" />}
        
        {/* Checkbox for selection */}
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onCategorySelect(category.id, !!checked)}
          className="h-4 w-4"
          data-testid={`checkbox-${category.id}`}
        />
        
        {/* Category icon based on level */}
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
        
        {/* Category info */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className={cn(
            "font-medium truncate",
            level === 1 ? "text-base" : "text-sm"
          )}>
            {category.name}
          </span>
          
          {displaySize && (
            <Badge variant="secondary" className="text-xs">
              {displaySize}
            </Badge>
          )}
          
          <Badge variant="outline" className="text-xs">
            L{category.level}
          </Badge>
        </div>
      </div>
      
      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-2">
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

export default function TargetingTree({ 
  categories, 
  selectedCategories, 
  onCategorySelect, 
  level = 1 
}: TargetingTreeProps) {
  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500" data-testid="empty-tree">
        <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No targeting categories found</p>
      </div>
    );
  }

  return (
    <div className="space-y-1" data-testid="targeting-tree">
      {categories.map((category) => (
        <TreeNode
          key={category.id}
          category={category}
          selectedCategories={selectedCategories}
          onCategorySelect={onCategorySelect}
          level={level}
        />
      ))}
    </div>
  );
}