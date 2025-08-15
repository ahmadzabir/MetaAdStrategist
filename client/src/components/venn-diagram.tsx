import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Zap, UserCheck, ArrowDown, ArrowDownLeft, ArrowDownRight } from "lucide-react";
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
          Your Target Audience
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Finding people who match multiple characteristics for precise targeting
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Enhanced Venn Diagram with User Icons */}
        <div className="flex justify-center">
          <div className="relative">
            <svg
              width="380"
              height="320"
              viewBox="0 0 380 320"
              className="overflow-visible bg-gradient-to-br from-blue-50/20 to-purple-50/20 rounded-lg"
            >
              <defs>
                {/* User icon definition for reuse */}
                <g id="userIcon">
                  <circle cx="0" cy="-2" r="2" fill="currentColor" />
                  <path d="M -2.5 2 Q -2.5 0 0 0 Q 2.5 0 2.5 2 L 2.5 4 Q 2.5 5 1.5 5 L -1.5 5 Q -2.5 5 -2.5 4 Z" fill="currentColor" />
                </g>
                {/* Arrow definitions */}
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
                </marker>
              </defs>
              
              {/* Draw circles with user icons and smart positioning */}
              {circles.map((circle, index) => {
                // Calculate title position to avoid overlaps
                let titleY = circle.y - circle.radius - 30;
                let titleX = circle.x;
                
                // Adjust title positioning for overlapping circles
                if (circles.length === 2) {
                  if (index === 0) {
                    titleX = circle.x - 20;
                    titleY = circle.y - circle.radius - 35;
                  } else {
                    titleX = circle.x + 20;
                    titleY = circle.y - circle.radius - 35;
                  }
                } else if (circles.length >= 3) {
                  if (index === 0) {
                    titleY = circle.y - circle.radius - 40;
                  } else if (index === 1) {
                    titleX = circle.x + 30;
                    titleY = circle.y - circle.radius - 25;
                  } else if (index === 2) {
                    titleX = circle.x - 30;
                    titleY = circle.y - circle.radius - 25;
                  }
                }

                return (
                  <g key={circle.id}>
                    {/* Circle shadow */}
                    <circle
                      cx={circle.x + 3}
                      cy={circle.y + 3}
                      r={circle.radius}
                      fill="rgba(0,0,0,0.1)"
                      opacity="0.2"
                    />
                    
                    {/* Main circle */}
                    <circle
                      cx={circle.x}
                      cy={circle.y}
                      r={circle.radius}
                      fill={circle.color}
                      fillOpacity={0.2}
                      stroke={circle.color}
                      strokeWidth={3}
                      className="transition-all duration-300 hover:fill-opacity-35"
                    />
                    
                    {/* User icons scattered throughout the circle */}
                    {Array.from({ length: Math.min(8, Math.max(3, circle.selectedCount)) }, (_, i) => {
                      const angle = (i / Math.max(3, circle.selectedCount)) * 2 * Math.PI;
                      const distance = Math.random() * (circle.radius - 20) + 10;
                      const userX = circle.x + Math.cos(angle) * distance;
                      const userY = circle.y + Math.sin(angle) * distance;
                      
                      return (
                        <use
                          key={i}
                          href="#userIcon"
                          x={userX}
                          y={userY}
                          color={circle.color}
                          opacity="0.7"
                          className="transition-opacity hover:opacity-100"
                        />
                      );
                    })}
                    
                    {/* Smart title positioning with adaptive background */}
                    <g>
                      {/* Measure text width for adaptive background */}
                      <rect
                        x={titleX - Math.min(circle.name.length * 4 + 8, 80)}
                        y={titleY - 12}
                        width={Math.min(circle.name.length * 8 + 16, 160)}
                        height={24}
                        rx="12"
                        fill="white"
                        stroke={circle.color}
                        strokeWidth="2"
                        opacity="0.95"
                        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                      />
                      <text
                        x={titleX}
                        y={titleY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-sm font-bold"
                        fill={circle.color}
                      >
                        {circle.name.length > 15 ? 
                          `${circle.name.slice(0, 15)}...` : 
                          circle.name
                        }
                      </text>
                    </g>
                  </g>
                );
              })}
              
              {/* Enhanced intersection area with user icons */}
              {circles.length === 2 && (
                <g>
                  {/* Intersection area with special user icons */}
                  <ellipse
                    cx={190}
                    cy={160}
                    rx={30}
                    ry={25}
                    fill="rgba(16, 185, 129, 0.3)"
                    stroke="rgba(16, 185, 129, 0.8)"
                    strokeWidth="3"
                    strokeDasharray="5,3"
                    className="animate-pulse"
                  />
                  
                  {/* Special targeted users in intersection */}
                  {Array.from({ length: 4 }, (_, i) => {
                    const angle = (i / 4) * 2 * Math.PI;
                    const distance = 15;
                    const userX = 190 + Math.cos(angle) * distance;
                    const userY = 160 + Math.sin(angle) * distance;
                    
                    return (
                      <use
                        key={`target-${i}`}
                        href="#userIcon"
                        x={userX}
                        y={userY}
                        color="#10B981"
                        className="drop-shadow-sm"
                      />
                    );
                  })}
                  
                  {/* Arrows pointing to intersection */}
                  <line
                    x1={190}
                    y1={100}
                    x2={190}
                    y2={130}
                    stroke="#3B82F6"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                </g>
              )}
              
              {circles.length >= 3 && (
                <g>
                  {/* Three-way intersection */}
                  <circle
                    cx={190}
                    cy={160}
                    r={28}
                    fill="rgba(16, 185, 129, 0.3)"
                    stroke="rgba(16, 185, 129, 0.8)"
                    strokeWidth="3"
                    strokeDasharray="5,3"
                    className="animate-pulse"
                  />
                  
                  {/* Premium targeted users in center */}
                  {Array.from({ length: 6 }, (_, i) => {
                    const angle = (i / 6) * 2 * Math.PI;
                    const distance = 15;
                    const userX = 190 + Math.cos(angle) * distance;
                    const userY = 160 + Math.sin(angle) * distance;
                    
                    return (
                      <use
                        key={`premium-${i}`}
                        href="#userIcon"
                        x={userX}
                        y={userY}
                        color="#10B981"
                        className="drop-shadow-sm"
                      />
                    );
                  })}
                  
                  {/* Multiple arrows pointing to center */}
                  <line
                    x1={190}
                    y1={90}
                    x2={190}
                    y2={125}
                    stroke="#3B82F6"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  <line
                    x1={150}
                    y1={120}
                    x2={170}
                    y2={140}
                    stroke="#3B82F6"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  <line
                    x1={230}
                    y1={120}
                    x2={210}
                    y2={140}
                    stroke="#3B82F6"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                </g>
              )}
            </svg>
            
            {/* Enhanced targeting explanation */}
            {circles.length > 1 && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 rounded-full shadow-sm">
                  <UserCheck className="h-4 w-4 text-green-700" />
                  <span className="text-sm font-bold text-green-800">Your Perfect Audience</span>
                </div>
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

        {/* User-friendly explanation */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800">
          <h5 className="font-medium text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            How This Works
          </h5>
          <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
            Each circle represents people with different characteristics. The intersection (where circles overlap) 
            shows your ideal customers - people who have <strong>multiple qualities you're looking for</strong>. 
            These are the most qualified prospects for your campaign.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}