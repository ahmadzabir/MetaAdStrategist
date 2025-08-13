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
        className={`flex items-center gap-2 py-2 px-2 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
          isSelected 
            ? 'bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/30 dark:to-blue-900/30 border-l-4 border-emerald-400 shadow-sm' 
            : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-800 dark:hover:to-blue-900/20 hover:shadow-sm'
        }`}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={handleToggle}
      >
        {/* Expand/Collapse Icon */}
        <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          {hasChildren && (
            <div className={`text-gray-600 dark:text-gray-400 transition-transform duration-200 hover:text-emerald-600 ${
              expanded ? 'rotate-0' : 'rotate-0'
            }`}>
              {expanded ? 
                <ChevronDown size={14} className="animate-in spin-in-180 duration-200" /> : 
                <ChevronRight size={14} className="animate-in spin-in-90 duration-200" />
              }
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
          <div className="relative">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onCategorySelect(category.id, !!checked)}
              onClick={handleSelect}
              className={`w-4 h-4 transition-all duration-200 ${
                isSelected 
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' 
                  : 'hover:border-emerald-400 hover:shadow-sm border-gray-300'
              }`}
            />
          </div>
        )}

        {/* Category name */}
        <span className={`text-sm flex-1 transition-colors duration-200 ${
          level === 1 ? 'font-semibold text-gray-900 dark:text-white' : 
          level === 2 ? 'font-medium text-gray-800 dark:text-gray-200' :
          'text-gray-700 dark:text-gray-300'
        } ${
          isSelected ? 'text-emerald-700 dark:text-emerald-300 font-medium' : 
          hasChildren ? 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400' : ''
        }`}>
          {category.name}
        </span>

        {/* Level badge */}
        <Badge 
          variant="outline" 
          className={`text-xs h-5 transition-all duration-200 ${
            level === 1 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300' :
            level === 2 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300' :
            level === 3 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300' :
            'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300'
          }`}
        >
          L{level}
        </Badge>

        {/* Children count */}
        {hasChildren && (
          <Badge variant="secondary" className="text-xs h-5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {category.children!.length}
          </Badge>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="animate-in slide-in-from-top-2 duration-300 ease-out">
          <div className="border-l-2 border-gray-200 dark:border-gray-700 ml-2 pl-2">
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
        </div>
      )}
    </div>
  );
}

export default function SimpleTree({ categories, selectedCategories, onCategorySelect }: SimpleTreeProps) {
  console.log(`SimpleTree received ${categories.length} categories`);
  
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-sm">
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id} className="animate-in fade-in duration-300">
            <TreeItem
              category={category}
              level={1}
              selectedCategories={selectedCategories}
              onCategorySelect={onCategorySelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
}