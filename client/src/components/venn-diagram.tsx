import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Zap } from "lucide-react";
import type { StrategicTargeting, TargetingGroup } from "@shared/schema";

interface VennDiagramProps {
  selectedCategories: string[];
  audienceSize?: number;
  onCategoryToggle: (categoryId: string, selected: boolean) => void;
  strategicTargeting?: StrategicTargeting;
  className?: string;
}

interface VennCircle {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  radius: number;
}

export function VennDiagram({ selectedCategories, audienceSize, onCategoryToggle, strategicTargeting, className = "" }: VennDiagramProps) {
  // Get actual strategic groups with selected categories
  const activeGroups = useMemo(() => {
    if (!strategicTargeting) {
      return [
        { id: "demographics", name: "Demographics", color: "#3B82F6", categories: [], selectedCount: 0 },
        { id: "interests", name: "Interests", color: "#8B5CF6", categories: [], selectedCount: 0 },
        { id: "behaviors", name: "Behaviors", color: "#10B981", categories: [], selectedCount: 0 }
      ];
    }

    return strategicTargeting.groups.map((group, index) => {
      const selectedInGroup = group.categories.filter(cat => selectedCategories.includes(cat.id));
      const colors = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];
      
      return {
        id: group.id,
        name: group.name,
        color: colors[index % colors.length],
        categories: selectedInGroup,
        selectedCount: selectedInGroup.length
      };
    }).filter(group => group.selectedCount > 0); // Only show groups with selections
  }, [strategicTargeting, selectedCategories]);

  const circles = useMemo(() => {
    const svgSize = 320;
    const centerX = svgSize / 2;
    const centerY = svgSize / 2;
    const baseRadius = 75;
    
    if (activeGroups.length === 0) return [];
    
    if (activeGroups.length === 1) {
      return [{
        id: activeGroups[0].id,
        name: activeGroups[0].name,
        color: activeGroups[0].color,
        x: centerX,
        y: centerY,
        radius: baseRadius,
        selectedCount: activeGroups[0].selectedCount
      }];
    }
    
    if (activeGroups.length === 2) {
      const offset = 35;
      return [
        {
          id: activeGroups[0].id,
          name: activeGroups[0].name,
          color: activeGroups[0].color,
          x: centerX - offset,
          y: centerY,
          radius: baseRadius,
          selectedCount: activeGroups[0].selectedCount
        },
        {
          id: activeGroups[1].id,
          name: activeGroups[1].name,
          color: activeGroups[1].color,
          x: centerX + offset,
          y: centerY,
          radius: baseRadius,
          selectedCount: activeGroups[1].selectedCount
        }
      ];
    }
    
    // For 3+ circles, use triangular positioning with proper overlap
    const angleStep = (2 * Math.PI) / Math.min(activeGroups.length, 3);
    const centerDistance = 45; // Distance from center for proper intersection
    
    return activeGroups.slice(0, 3).map((group, index) => {
      const angle = angleStep * index - Math.PI / 2; // Start from top
      const x = centerX + Math.cos(angle) * centerDistance;
      const y = centerY + Math.sin(angle) * centerDistance;
      
      return {
        id: group.id,
        name: group.name,
        color: group.color,
        x,
        y,
        radius: baseRadius,
        selectedCount: group.selectedCount
      };
    });
  }, [activeGroups]);

  const estimatedAudience = audienceSize || selectedCategories.length * 5000000; // Mock calculation
  
  const getSpecificityColor = (specificity: string) => {
    switch (specificity) {
      case "High": return "text-red-600 bg-red-50 border-red-200";
      case "Medium": return "text-orange-600 bg-orange-50 border-orange-200";
      case "Low": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <Card className={`border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Target className="h-5 w-5 text-blue-600" />
          Strategic Audience Intersection
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          AND logic between groups creates precise targeting
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Venn Diagram Visualization */}
        <div className="flex justify-center">
          <div className="relative">
            <svg
              width="320"
              height="320"
              viewBox="0 0 320 320"
              className="overflow-visible bg-gradient-to-br from-blue-50/20 to-purple-50/20 rounded-lg"
            >
              {/* Background grid for reference */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Draw circles with better visual hierarchy */}
              {circles.map((circle, index) => (
                <g key={circle.id}>
                  {/* Circle shadow */}
                  <circle
                    cx={circle.x + 2}
                    cy={circle.y + 2}
                    r={circle.radius}
                    fill="rgba(0,0,0,0.1)"
                    opacity="0.3"
                  />
                  
                  {/* Main circle */}
                  <circle
                    cx={circle.x}
                    cy={circle.y}
                    r={circle.radius}
                    fill={circle.color}
                    fillOpacity={0.25}
                    stroke={circle.color}
                    strokeWidth={3}
                    className="transition-all duration-300 hover:fill-opacity-40 hover:stroke-width-4"
                  />
                  
                  {/* Category count in circle */}
                  <text
                    x={circle.x}
                    y={circle.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-sm font-bold"
                    fill={circle.color}
                  >
                    {circle.selectedCount}
                  </text>
                  
                  {/* Group label with background */}
                  <g>
                    <rect
                      x={circle.x - 35}
                      y={circle.y - circle.radius - 25}
                      width="70"
                      height="16"
                      rx="8"
                      fill="white"
                      stroke={circle.color}
                      strokeWidth="1.5"
                      opacity="0.95"
                    />
                    <text
                      x={circle.x}
                      y={circle.y - circle.radius - 16}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs font-semibold"
                      fill={circle.color}
                    >
                      {circle.name.length > 12 ? `${circle.name.slice(0, 12)}...` : circle.name}
                    </text>
                  </g>
                </g>
              ))}
              
              {/* Enhanced intersection indicators */}
              {circles.length === 2 && (
                <g>
                  {/* Intersection highlight */}
                  <ellipse
                    cx={160}
                    cy={160}
                    rx={25}
                    ry={20}
                    fill="rgba(59, 130, 246, 0.6)"
                    stroke="rgba(59, 130, 246, 0.8)"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                  <text
                    x={160}
                    y={165}
                    textAnchor="middle"
                    className="text-xs font-bold fill-white drop-shadow-sm"
                  >
                    AND
                  </text>
                </g>
              )}
              
              {circles.length >= 3 && (
                <g>
                  {/* Three-way intersection */}
                  <circle
                    cx={160}
                    cy={160}
                    r={25}
                    fill="rgba(59, 130, 246, 0.7)"
                    stroke="rgba(59, 130, 246, 0.9)"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                  <text
                    x={160}
                    y={155}
                    textAnchor="middle"
                    className="text-xs font-bold fill-white drop-shadow-sm"
                  >
                    AND
                  </text>
                  <text
                    x={160}
                    y={167}
                    textAnchor="middle"
                    className="text-xs font-medium fill-white drop-shadow-sm"
                  >
                    ALL
                  </text>
                </g>
              )}
            </svg>
            
            {/* Enhanced intersection label */}
            {circles.length > 1 && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6">
                <Badge variant="secondary" className="text-xs font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-300 shadow-sm">
                  🎯 Strategic Intersection
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Group details */}
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            Strategic Groups ({circles.length})
          </h4>
          
          <div className="grid gap-3">
            {activeGroups.map((group, index) => (
              <div
                key={group.id}
                className="p-4 rounded-lg border-2 bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 hover:shadow-lg transition-all duration-200"
                style={{ borderColor: group.color }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: group.color }}
                      />
                      <span className="font-bold text-gray-900 dark:text-gray-100">
                        {group.name}
                      </span>
                      <Badge 
                        variant="secondary" 
                        className="text-xs font-semibold"
                        style={{ 
                          backgroundColor: `${group.color}20`,
                          color: group.color,
                          borderColor: `${group.color}40`
                        }}
                      >
                        {group.selectedCount} selected
                      </Badge>
                    </div>
                    <div className="space-y-1.5">
                      {group.categories.map(cat => (
                        <div key={cat.id} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: group.color }} />
                          <span className="font-medium text-gray-800 dark:text-gray-200">{cat.name}</span>
                          {cat.size && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600">
                              {cat.size}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Audience metrics */}
        <div className="grid grid-cols-2 gap-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
          <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-5 w-5 text-green-600" />
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Estimated Reach
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {audienceSize ? audienceSize.toLocaleString() : 
                selectedCategories.length > 0 ? (selectedCategories.length * 2500000).toLocaleString() : "0"}
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">people</p>
          </div>
          
          <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Specificity
              </span>
            </div>
            <Badge className="text-xs font-medium text-blue-600 bg-blue-50 border-blue-200">
              High Specificity
            </Badge>
          </div>
        </div>

        {/* Strategy explanation */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Strategic Approach
          </h5>
          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
            This targeting forces Meta to find users who match <strong>ALL {circles.length} groups simultaneously</strong> using AND logic. 
            Within each group, categories use OR logic for flexibility. This creates highly qualified audiences 
            with multiple behavioral and demographic indicators.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}