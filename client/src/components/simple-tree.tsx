import { useState } from "react";
import { ChevronRight, ChevronDown, Target, Folder, Tag } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { HierarchicalTargetingCategory } from "@shared/schema";

interface SimpleTreeProps {
  categories: HierarchicalTargetingCategory[];
  selectedCategories: string[];
  onCategorySelect: (categoryId: string, selected: boolean) => void;
}

function TreeItem({ 
  category, 
  level, 
  selectedCategories, 
  onCategorySelect 
}: { 
  category: HierarchicalTargetingCategory;
  level: number;
  selectedCategories: string[];
  onCategorySelect: (categoryId: string, selected: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedCategories.includes(category.id);
  const paddingLeft = level * 20;

  const handleToggle = () => {
    console.log(`Toggling ${category.name} - hasChildren: ${hasChildren}, current expanded: ${expanded}`);
    if (hasChildren) {
      setExpanded(!expanded);
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCategorySelect(category.id, !isSelected);
  };

  return (
    <div>
      {/* Main row */}
      <div 
        className="flex items-center gap-2 py-2 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={handleToggle}
      >
        {/* Expand/Collapse Icon */}
        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          {hasChildren && (
            <div className="text-gray-600 dark:text-gray-400">
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
          )}
        </div>

        {/* Category Icon */}
        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          {level === 1 ? (
            <Target size={14} className="text-blue-600" />
          ) : hasChildren ? (
            <Folder size={14} className="text-orange-500" />
          ) : (
            <Tag size={14} className="text-gray-500" />
          )}
        </div>

        {/* Checkbox for selectable items */}
        {!hasChildren && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onCategorySelect(category.id, !!checked)}
            onClick={handleSelect}
            className="w-4 h-4"
          />
        )}

        {/* Category name */}
        <span className={`text-sm flex-1 ${level === 1 ? 'font-semibold' : ''} ${isSelected ? 'text-blue-600' : ''}`}>
          {category.name}
        </span>

        {/* Level badge */}
        <Badge variant="outline" className="text-xs h-5">
          L{level}
        </Badge>

        {/* Children count */}
        {hasChildren && (
          <span className="text-xs text-gray-500">
            ({category.children!.length})
          </span>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {category.children!.map((child) => (
            <TreeItem
              key={child.id}
              category={child}
              level={level + 1}
              selectedCategories={selectedCategories}
              onCategorySelect={onCategorySelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SimpleTree({ categories, selectedCategories, onCategorySelect }: SimpleTreeProps) {
  console.log(`SimpleTree received ${categories.length} categories`);
  
  return (
    <div className="border rounded p-2 bg-white dark:bg-gray-900">
      <div className="space-y-1">
        {categories.map((category) => (
          <TreeItem
            key={category.id}
            category={category}
            level={1}
            selectedCategories={selectedCategories}
            onCategorySelect={onCategorySelect}
          />
        ))}
      </div>
    </div>
  );
}