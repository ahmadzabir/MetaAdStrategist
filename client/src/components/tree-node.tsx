import { useState } from "react";
import { ChevronRight, ChevronDown, Target, Users, Folder } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HierarchicalTargetingCategory } from "@shared/schema";

interface TreeNodeProps {
  item: HierarchicalTargetingCategory;
  selectedCategories: string[];
  onCategorySelect: (categoryId: string, selected: boolean) => void;
  level: number;
}

export default function TreeNode({ 
  item: category, 
  selectedCategories, 
  onCategorySelect, 
  level 
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedCategories.includes(category.id);
  
  // Parse size for display
  const parseSize = (sizeStr: string | null): string => {
    if (!sizeStr || sizeStr === "Unknown" || sizeStr === "") return "";
    if (sizeStr.includes("Size:")) {
      return sizeStr.replace("Size:", "").trim();
    }
    return sizeStr;
  };

  const displaySize = parseSize(category.size);
  const indent = (level - 1) * 16;

  const handleClick = () => {
    console.log(`TreeNode clicked: ${category.name}, hasChildren: ${hasChildren}, children count: ${category.children?.length || 0}, current expanded: ${isExpanded}`);
    
    if (hasChildren) {
      // Parent nodes: expand/collapse
      setIsExpanded(!isExpanded);
      console.log(`Setting expanded to: ${!isExpanded}`);
    } else {
      // Leaf nodes: select/deselect
      onCategorySelect(category.id, !isSelected);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCategorySelect(category.id, !isSelected);
  };

  const getCategoryIcon = () => {
    if (level === 1) {
      return <Target className="h-4 w-4 text-blue-600" />;
    } else if (hasChildren) {
      return <Folder className="h-3 w-3 text-amber-600" />;
    } else {
      return (
        <Users className={cn(
          "h-3 w-3",
          level === 2 ? "text-green-600" :
          level === 3 ? "text-orange-600" :
          level === 4 ? "text-purple-600" : "text-gray-600"
        )} />
      );
    }
  };

  return (
    <div>
      {/* Current Node */}
      <div 
        className={cn(
          "group flex items-center gap-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer transition-all duration-150",
          isSelected && "bg-blue-50 dark:bg-blue-900/20",
          hasChildren && "font-medium"
        )}
        style={{ marginLeft: `${indent}px` }}
        onClick={handleClick}
        data-testid={`tree-node-${category.id}`}
      >
        {/* Expand/Collapse Arrow */}
        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
          {hasChildren ? (
            <div className="w-5 h-5 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              )}
            </div>
          ) : (
            <div className="w-5 h-5" />
          )}
        </div>
        
        {/* Selection Checkbox - Only for leaf nodes */}
        {!hasChildren && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onCategorySelect(category.id, !!checked)}
            className="h-3.5 w-3.5"
            onClick={handleCheckboxClick}
            data-testid={`checkbox-${category.id}`}
          />
        )}
        
        {/* Category Icon */}
        <div className="flex-shrink-0">
          {getCategoryIcon()}
        </div>
        
        {/* Category Name and Info */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className={cn(
            "truncate text-sm",
            level === 1 && "font-semibold text-gray-900 dark:text-white",
            level === 2 && "font-medium text-gray-800 dark:text-gray-200", 
            level >= 3 && "text-gray-700 dark:text-gray-300",
            isSelected && "text-blue-600 dark:text-blue-400",
            hasChildren && "select-none"
          )}>
            {category.name}
          </span>
          
          {displaySize && (
            <Badge variant="secondary" className="text-xs h-4">
              {displaySize}
            </Badge>
          )}
          
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs h-4 px-1.5",
              level === 1 ? "border-blue-300 text-blue-700" :
              level === 2 ? "border-green-300 text-green-700" :
              level === 3 ? "border-orange-300 text-orange-700" :
              "border-gray-300 text-gray-600"
            )}
          >
            L{level}
          </Badge>
          
          {hasChildren && (
            <span className="text-xs text-gray-500 ml-1">
              ({category.children!.length})
            </span>
          )}
        </div>
      </div>
      
      {/* Children - Only show when expanded */}
      {hasChildren && isExpanded && (
        <div className="space-y-0.5">
          {category.children!.map((child, index) => (
            <TreeNode
              key={child.id}
              item={child}
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