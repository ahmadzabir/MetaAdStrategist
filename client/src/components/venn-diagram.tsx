import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Zap } from "lucide-react";
import type { StrategicTargeting, TargetingGroup } from "@shared/schema";

interface VennDiagramProps {
  selectedCategories: string[];
  audienceSize?: number;
  onCategoryToggle: (categoryId: string, selected: boolean) => void;
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

export function VennDiagram({ selectedCategories, audienceSize, onCategoryToggle, className = "" }: VennDiagramProps) {
  // Mock visualization data for now
  const mockGroups = [
    { id: "demographics", name: "Demographics", color: "#3B82F6" },
    { id: "interests", name: "Interests", color: "#8B5CF6" },
    { id: "behaviors", name: "Behaviors", color: "#10B981" }
  ];

  const circles = useMemo(() => {
    const groups = mockGroups.slice(0, 3);
    const svgSize = 300;
    const centerX = svgSize / 2;
    const centerY = svgSize / 2;
    const radius = 80;
    
    // Calculate positions for up to 3 circles
    const positions = [
      { x: centerX - 40, y: centerY - 30 }, // Left
      { x: centerX + 40, y: centerY - 30 }, // Right  
      { x: centerX, y: centerY + 40 }, // Bottom
    ];

    return groups.map((group, index) => ({
      id: group.id,
      name: group.name,
      color: group.color,
      x: positions[index]?.x || centerX,
      y: positions[index]?.y || centerY,
      radius
    }));
  }, []);

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
              width="300"
              height="300"
              viewBox="0 0 300 300"
              className="overflow-visible"
            >
              {/* Draw circles */}
              {circles.map((circle, index) => (
                <g key={circle.id}>
                  {/* Circle */}
                  <circle
                    cx={circle.x}
                    cy={circle.y}
                    r={circle.radius}
                    fill={circle.color}
                    fillOpacity={0.3}
                    stroke={circle.color}
                    strokeWidth={2}
                    className="transition-all duration-300 hover:fillOpacity-0.5"
                  />
                  
                  {/* Group label */}
                  <text
                    x={circle.x}
                    y={circle.y - circle.radius - 10}
                    textAnchor="middle"
                    className="text-xs font-medium fill-gray-700 dark:fill-gray-300"
                  >
                    {circle.name.length > 15 ? `${circle.name.slice(0, 15)}...` : circle.name}
                  </text>
                </g>
              ))}
              
              {/* Intersection indicator */}
              {circles.length > 1 && (
                <g>
                  <circle
                    cx={150}
                    cy={150}
                    r={20}
                    fill="rgba(59, 130, 246, 0.8)"
                    className="animate-pulse"
                  />
                  <text
                    x={150}
                    y={155}
                    textAnchor="middle"
                    className="text-xs font-bold fill-white"
                  >
                    AND
                  </text>
                </g>
              )}
            </svg>
            
            {/* Central intersection label */}
            {circles.length > 1 && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6">
                <Badge variant="secondary" className="text-xs font-medium bg-blue-100 text-blue-800 border-blue-200">
                  Target Intersection
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Group details */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-600" />
            Strategic Groups ({strategicTargeting.groups.length})
          </h4>
          
          <div className="space-y-2">
            {strategicTargeting.groups.map((group, index) => (
              <div
                key={group.id}
                className="p-3 rounded-lg border bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                style={{ borderColor: group.color || `hsl(${(index * 90) % 360}, 70%, 60%)` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: group.color || `hsl(${(index * 90) % 360}, 70%, 60%)` }}
                      />
                      <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {group.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {group.categories.length} categories
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {group.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audience metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Estimated Reach
              </span>
            </div>
            <p className="text-lg font-bold text-green-600">
              {audienceSize ? audienceSize.toLocaleString() : "Calculating..."}
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Specificity
              </span>
            </div>
            <Badge className={`text-sm font-medium ${getSpecificityColor(strategicTargeting.specificity)}`}>
              {strategicTargeting.specificity}
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
            This targeting forces Meta to find users who match <strong>ALL {strategicTargeting.groups.length} groups simultaneously</strong> using AND logic. 
            Within each group, categories use OR logic for flexibility. This creates highly qualified audiences 
            with multiple behavioral and demographic indicators.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}