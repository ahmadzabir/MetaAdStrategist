import { useState } from "react";
import { ChevronRight, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HierarchicalTargetingCategory } from "@shared/schema";

interface TreeNodeProps {
  item: HierarchicalTargetingCategory;
  selectedCategories: string[];
  onCategorySelect: (categoryId: string, selected: boolean) => void;
  level?: number;
}

export default function TreeNode({ 
  item, 
  selectedCategories, 
  onCategorySelect, 
  level = 1 
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasChildren = item.children && item.children.length > 0;
  const isSelected = selectedCategories.includes(item.id);
  const isLeaf = !hasChildren;

  const parseSize = (sizeStr: string): string => {
    if (!sizeStr || sizeStr === "Unknown" || sizeStr === "") return "";
    if (sizeStr.includes("Size:")) {
      return sizeStr.replace("Size:", "").trim();
    }
    return sizeStr;
  };

  const displaySize = parseSize(item.size || "");

  const handleToggleExpand = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleSelect = () => {
    if (isLeaf) {
      onCategorySelect(item.id, !isSelected);
    }
  };

  const getIndentStyle = () => ({
    paddingLeft: `${(level - 1) * 20}px`
  });

  return (
    <div>
      {/* Current Node */}
      <div 
        className={cn(
          "flex items-center gap-2 py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors",
          isSelected && "bg-blue-50 dark:bg-blue-900/20",
          level === 1 && "font-medium",
          level === 2 && "text-sm",
          level >= 3 && "text-sm"
        )}
        style={getIndentStyle()}
        onClick={hasChildren ? handleToggleExpand : handleSelect}
        data-testid={`tree-node-${item.id}`}
      >
        {/* Expand/Collapse Icon or Checkbox */}
        <div className="flex h-5 w-5 items-center justify-center shrink-0">
          {hasChildren ? (
            // Parent node - show expand/collapse arrow
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={handleToggleExpand}
              data-testid={`expand-button-${item.id}`}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              )}
            </Button>
          ) : (
            // Leaf node - show checkbox
            <div 
              className={cn(
                "h-4 w-4 border-2 rounded flex items-center justify-center cursor-pointer",
                isSelected 
                  ? "bg-blue-600 border-blue-600" 
                  : "border-gray-300 hover:border-gray-400"
              )}
              onClick={handleSelect}
              data-testid={`checkbox-${item.id}`}
            >
              {isSelected && <Check className="h-3 w-3 text-white" />}
            </div>
          )}
        </div>

        {/* Category Name and Info */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span 
            className={cn(
              "truncate",
              level === 1 && "text-base font-semibold text-blue-900 dark:text-blue-100",
              level === 2 && "text-sm font-medium text-green-900 dark:text-green-100", 
              level === 3 && "text-sm text-purple-900 dark:text-purple-100",
              level >= 4 && "text-sm text-gray-900 dark:text-gray-100",
              isSelected && "text-blue-700 dark:text-blue-300"
            )}
          >
            {item.name}
          </span>

          {/* Level Badge */}
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs shrink-0",
              level === 1 && "border-blue-200 text-blue-700",
              level === 2 && "border-green-200 text-green-700",
              level === 3 && "border-purple-200 text-purple-700",
              level >= 4 && "border-gray-200 text-gray-700"
            )}
          >
            L{item.level}
          </Badge>

          {/* Size Badge */}
          {displaySize && (
            <Badge variant="secondary" className="text-xs shrink-0">
              {displaySize}
            </Badge>
          )}

          {/* Children Count for Parent Nodes */}
          {hasChildren && (
            <Badge variant="outline" className="text-xs shrink-0">
              {item.children?.length || 0} items
            </Badge>
          )}
        </div>
      </div>

      {/* Children - Only show when expanded */}
      {hasChildren && isExpanded && (
        <div>
          {item.children!.map((child) => (
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