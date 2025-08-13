import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { TargetingCategory } from "@shared/schema";

interface TreeNode extends TargetingCategory {
  children: TreeNode[];
  isExpanded: boolean;
}

export default function TargetingExplorer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["interests"]));

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["/api/targeting-categories"],
    queryFn: () => api.getTargetingCategories(),
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: ["/api/targeting-categories", { search: searchQuery }],
    queryFn: () => api.getTargetingCategories({ search: searchQuery }),
    enabled: searchQuery.length > 2,
  });

  const categoryTree = useMemo(() => {
    const categoriesToUse = searchQuery.length > 2 ? searchResults : categories;
    const nodeMap = new Map<string, TreeNode>();
    
    // Create nodes
    categoriesToUse.forEach(category => {
      nodeMap.set(category.id, {
        ...category,
        children: [],
        isExpanded: expandedNodes.has(category.id),
      });
    });

    // Build tree structure
    const rootNodes: TreeNode[] = [];
    categoriesToUse.forEach(category => {
      const node = nodeMap.get(category.id)!;
      if (!category.parentId) {
        rootNodes.push(node);
      } else {
        const parent = nodeMap.get(category.parentId);
        if (parent) {
          parent.children.push(node);
        }
      }
    });

    return rootNodes;
  }, [categories, searchResults, searchQuery, expandedNodes]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const getCategoryIcon = (categoryType: string) => {
    switch (categoryType) {
      case "interests":
        return "fas fa-heart text-accent";
      case "behaviors":
        return "fas fa-chart-line text-secondary";
      case "demographics":
        return "fas fa-users text-neutral";
      default:
        return "far fa-circle text-text-secondary";
    }
  };

  const getSubcategoryIcon = (name: string, level: number) => {
    if (level === 1) {
      if (name.toLowerCase().includes("fitness")) return "fas fa-dumbbell text-primary";
      if (name.toLowerCase().includes("shopping")) return "fas fa-shopping-bag text-accent";
      return "fas fa-chevron-right text-text-secondary";
    }
    return "far fa-circle text-text-secondary";
  };

  const renderNode = (node: TreeNode, level: number = 0) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = node.isExpanded;
    const marginLeft = `${level * 1.5}rem`;

    return (
      <div key={node.id} className="space-y-1">
        <div 
          className={`flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer ${
            node.name === "Yoga" ? "bg-primary/5 border-l-2 border-primary" : ""
          }`}
          style={{ marginLeft }}
          onClick={() => hasChildren && toggleNode(node.id)}
          data-testid={`item-category-${node.id}`}
        >
          <div className="flex items-center space-x-2">
            {hasChildren && (
              <i 
                className={`fas fa-chevron-right text-xs text-text-secondary transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
              ></i>
            )}
            {level === 0 ? (
              <i className={getCategoryIcon(node.categoryType)}></i>
            ) : (
              <i className={`${getSubcategoryIcon(node.name, level)} text-xs`}></i>
            )}
            <span 
              className={`text-sm ${level === 0 ? "font-medium" : ""} ${
                node.name === "Yoga" ? "text-primary font-medium" : ""
              }`}
              data-testid={`text-category-name-${node.id}`}
            >
              {node.name}
            </span>
          </div>
          <span 
            className={`text-xs ${node.name === "Yoga" ? "text-primary" : "text-text-secondary"}`}
            data-testid={`text-category-size-${node.id}`}
          >
            {node.size}
          </span>
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-card p-6 sticky top-8">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-neutral/10 rounded-lg flex items-center justify-center">
          <i className="fas fa-search text-neutral"></i>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Targeting Explorer</h3>
          <p className="text-text-secondary text-sm">Browse all available categories</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search targeting options..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-categories"
          />
          <i className="fas fa-search absolute left-3 top-3 text-text-secondary"></i>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((index) => (
                <div key={index} className="flex items-center justify-between p-2">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1" data-testid="tree-categories">
              {categoryTree.map(node => renderNode(node))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="text-xs text-text-secondary space-y-1">
            <div className="flex justify-between">
              <span>Total Categories:</span>
              <span data-testid="text-total-categories">{categories.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span>2 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
