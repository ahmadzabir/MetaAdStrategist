import { useState } from "react";
import { ChevronRight, ChevronDown, Target, Users, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [isExpanded, setIsExpanded] = useState(level === 1); // Auto-expand top level categories
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
  const indent = (level - 1) * 20; // Indent based on level

  const handleToggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleRowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // For parent nodes: expand/collapse on click
    // For leaf nodes: select/deselect on click
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else {
      onCategorySelect(category.id, !isSelected);
    }
  };

  const handleCheckboxChange = (e: React.MouseEvent) => {
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
    <div className="select-none">
      {/* Node Row */}
      <div 
        className={cn(
          "group flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md cursor-pointer transition-all duration-200",
          isSelected && "bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500",
          level > 1 && "ml-4"
        )}
        style={{ paddingLeft: `${12 + indent}px` }}
        onClick={handleRowClick}
        data-testid={`tree-node-${category.id}`}
      >
        {/* Expand/Collapse Button */}
        <div className="flex-shrink-0">
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={handleToggleExpanded}
              data-testid={`expand-button-${category.id}`}
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-600 transition-transform duration-200" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-600 transition-transform duration-200" />
              )}
            </Button>
          ) : (
            <div className="w-6 h-6" />
          )}
        </div>
        
        {/* Selection Checkbox - Only show for leaf nodes */}
        {!hasChildren && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onCategorySelect(category.id, !!checked)}
            className="h-4 w-4"
            onClick={handleCheckboxChange}
            data-testid={`checkbox-${category.id}`}
          />
        )}
        
        {/* Spacer for parent nodes */}
        {hasChildren && <div className="w-4" />}
        
        {/* Category Icon */}
        <div className="flex-shrink-0">
          {getCategoryIcon()}
        </div>
        
        {/* Category Info */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className={cn(
            "font-medium truncate",
            level === 1 ? "text-base font-semibold" : "text-sm",
            isSelected && "text-blue-700 dark:text-blue-300"
          )}>
            {category.name}
          </span>
          
          {displaySize && (
            <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
              {displaySize}
            </Badge>
          )}
          
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs px-2 py-0 h-5",
              level === 1 ? "bg-blue-100 text-blue-800" :
              level === 2 ? "bg-green-100 text-green-800" :
              level === 3 ? "bg-orange-100 text-orange-800" :
              level === 4 ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
            )}
          >
            L{category.level}
          </Badge>
          
          {hasChildren && (
            <Badge variant="secondary" className="text-xs text-gray-500">
              {category.children!.length} items
            </Badge>
          )}
        </div>
      </div>
      
      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="space-y-1 mt-1">
          {category.children!.map((child, index) => (
            <TreeNode
              key={`${child.id}-${index}-${level}`}
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