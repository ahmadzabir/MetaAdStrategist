import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Target, TreePine, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TargetingTree from "./targeting-tree";
import type { TargetingCategory, HierarchicalTargetingCategory } from "@shared/schema";

interface TargetingExplorerProps {
  selectedCategories: string[];
  onCategorySelect: (categoryId: string, selected: boolean) => void;
}

export default function TargetingExplorer({ selectedCategories, onCategorySelect }: TargetingExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");

  // Get hierarchical categories for tree view
  const { data: hierarchicalCategories = [], isLoading: isLoadingHierarchical } = useQuery<HierarchicalTargetingCategory[]>({
    queryKey: ['/api/targeting-categories/hierarchical'],
    enabled: viewMode === "tree",
  });

  // Get flat categories for search/list view
  const { data: flatCategories = [], isLoading: isLoadingFlat } = useQuery<TargetingCategory[]>({
    queryKey: ['/api/targeting-categories'],
    enabled: searchQuery.length > 0 || viewMode === "list",
  });

  // Filter categories based on search
  const filteredCategories = flatCategories?.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const isLoading = viewMode === "tree" ? isLoadingHierarchical : isLoadingFlat;

  return (
    <Card className="h-full">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Targeting Explorer
          </CardTitle>
          
          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={viewMode === "tree" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("tree")}
              className="h-8 px-3"
              data-testid="tree-view-button"
            >
              <TreePine className="h-3 w-3 mr-1" />
              Tree
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 px-3"
              data-testid="list-view-button"
            >
              <List className="h-3 w-3 mr-1" />
              List
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search targeting categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="search-targeting"
          />
        </div>

        {/* Selected categories count */}
        {selectedCategories.length > 0 && (
          <div className="text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
            {selectedCategories.length} categories selected
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[500px] p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : searchQuery ? (
            // Search results view
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600 mb-3">
                Search Results ({filteredCategories.length})
              </h3>
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedCategories.includes(category.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onCategorySelect(category.id, !selectedCategories.includes(category.id))}
                  data-testid={`category-${category.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{category.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Level {category.level} • {category.categoryType}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {category.size && category.size !== "Unknown" && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {category.size}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredCategories.length === 0 && (
                <div className="text-center py-8 text-gray-500" data-testid="no-search-results">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No categories found for "{searchQuery}"</p>
                  <p className="text-sm mt-1">Try adjusting your search terms</p>
                </div>
              )}
            </div>
          ) : viewMode === "tree" ? (
            // Tree view
            <TargetingTree
              categories={hierarchicalCategories}
              selectedCategories={selectedCategories}
              onCategorySelect={onCategorySelect}
            />
          ) : (
            // List view (all categories flat)
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600 mb-3">
                All Categories ({flatCategories.length})
              </h3>
              {flatCategories.map((category) => (
                <div
                  key={category.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedCategories.includes(category.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onCategorySelect(category.id, !selectedCategories.includes(category.id))}
                  data-testid={`category-${category.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{category.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Level {category.level} • {category.categoryType}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {category.size && category.size !== "Unknown" && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {category.size}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}