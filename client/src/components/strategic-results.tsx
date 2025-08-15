import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Target, Users, Eye, CheckCircle, Circle, MessageCircle, Grip, FolderPlus, Trash2 } from 'lucide-react';
import { StrategicTargeting, TargetingGroup, StrategicTargetingCategory } from '@shared/schema';

interface DragDropGroup {
  id: string;
  name: string;
  categories: string[];
}

interface StrategicResultsProps {
  strategicTargeting: StrategicTargeting;
  onCategorySelect: (categoryId: string, selected: boolean) => void;
  onStartConversation: () => void;
  onExportCampaign: () => void;
  selectedCategories: string[];
  onGroupToggle?: (groupId: string, enabled: boolean) => void;
  onLogicChange?: (groupId: string, logic: 'AND' | 'OR') => void;
  onProceedToVisualization?: () => void;
  enabledGroups?: string[];
  groupLogic?: Record<string, 'AND' | 'OR'>;
}

export function StrategicResults({ 
  strategicTargeting, 
  onCategorySelect, 
  onStartConversation,
  onExportCampaign,
  selectedCategories,
  onGroupToggle,
  onLogicChange,
  onProceedToVisualization,
  enabledGroups = strategicTargeting.groups.map(g => g.id),
  groupLogic = {}
}: StrategicResultsProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  
  // Drag and drop groups state
  const [dragDropGroups, setDragDropGroups] = useState<DragDropGroup[]>([
    { id: 'group-1', name: 'Group 1', categories: [] }
  ]);

  const toggleGroupExpanded = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const getSelectedCount = (group: TargetingGroup) => {
    return group.categories.filter(cat => selectedCategories.includes(cat.id)).length;
  };

  const getTotalSelectedCount = () => {
    return selectedCategories.length;
  };

  // Drag and drop functions
  const addNewDragDropGroup = () => {
    const newId = `group-${Date.now()}`;
    const newGroupName = `Group ${dragDropGroups.length + 1}`;
    
    setDragDropGroups(prev => [...prev, {
      id: newId,
      name: newGroupName,
      categories: []
    }]);
  };

  const removeDragDropGroup = (groupId: string) => {
    if (dragDropGroups.length > 1) {
      setDragDropGroups(prev => prev.filter(group => group.id !== groupId));
    }
  };

  const moveTargetToGroup = (categoryId: string, fromGroupId: string, toGroupId: string) => {
    setDragDropGroups(prev => prev.map(group => {
      if (group.id === fromGroupId) {
        return { ...group, categories: group.categories.filter(id => id !== categoryId) };
      }
      if (group.id === toGroupId && !group.categories.includes(categoryId)) {
        return { ...group, categories: [...group.categories, categoryId] };
      }
      return group;
    }));
  };

  const handleCategoryDragStart = (e: React.DragEvent, categoryId: string, fromGroupId?: string) => {
    e.dataTransfer.setData('text/plain', categoryId);
    e.dataTransfer.setData('application/json', fromGroupId || 'source');
  };

  const getCategoryFromId = (categoryId: string) => {
    for (const group of strategicTargeting.groups) {
      const category = group.categories.find(cat => cat.id === categoryId);
      if (category) return category;
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <Target className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Strategic Targeting Results
            </CardTitle>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm font-medium text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span>{strategicTargeting.groups.length} Strategic Groups</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-600" />
              <span>{getTotalSelectedCount()} Categories Selected</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Strategic Logic Explanation */}
      <Card className="border border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-700">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">How Strategic Groups Work</h4>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                  How AND/OR Logic Works:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="text-blue-900 dark:text-blue-100">
                      <strong>Within each group:</strong> OR logic (select any/all categories you want)
                      <br/>
                      <span className="text-blue-800 dark:text-blue-200 text-xs font-medium">Example: Age 25-34 OR Age 35-44</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="text-blue-900 dark:text-blue-100">
                      <strong>Between groups:</strong> AND logic (must match ALL selected groups)
                      <br/>
                      <span className="text-blue-800 dark:text-blue-200 text-xs font-medium">Example: (Demographics) AND (Interests) AND (Behaviors)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Groups */}
      <div className="space-y-4">
        {strategicTargeting.groups.map((group) => {
          const isExpanded = expandedGroups.has(group.id);
          const selectedCount = getSelectedCount(group);
          
          return (
            <Card key={group.id} className="border border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/30">
              <CardHeader 
                className="cursor-pointer bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-800 dark:to-blue-950/20"
                onClick={() => toggleGroupExpanded(group.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: group.color }}
                    />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {group.name}
                      </h3>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {group.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs font-semibold bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700">
                      {selectedCount}/{group.categories.length} selected
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      {isExpanded ? 'Collapse' : 'View Categories'}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <Separator className="mb-4" />
                  
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                      <strong>Strategic Logic:</strong> {group.logic}
                    </p>
                    
                    <div className="grid gap-3">
                      {group.categories.map((category) => {
                        const isSelected = selectedCategories.includes(category.id);
                        
                        return (
                          <div 
                            key={category.id}
                            className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-950/20 dark:hover:to-indigo-950/20 transition-all cursor-grab active:cursor-grabbing bg-white dark:bg-gray-800/50"
                            draggable
                            onDragStart={(e) => handleCategoryDragStart(e, category.id)}
                          >
                            <div className="flex items-center gap-3">
                              <Grip className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => 
                                  onCategorySelect(category.id, checked as boolean)
                                }
                                data-testid={`checkbox-${category.id}`}
                              />
                              <div>
                                <p className="font-bold text-gray-900 dark:text-gray-100 text-base">
                                  {category.name}
                                </p>
                                <div className="space-y-2 mt-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs font-semibold bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-200 dark:border-indigo-600">
                                      {category.categoryType}
                                    </Badge>
                                    {category.size && (
                                      <Badge variant="secondary" className="text-xs font-semibold bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-600">
                                        {category.size} audience
                                      </Badge>
                                    )}
                                  </div>
                                  {category.breadcrumbs && category.breadcrumbs.length > 0 && (
                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                      Path: {category.breadcrumbs.join(" > ")}
                                    </p>
                                  )}
                                  {category.level && (
                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                      Level: L{category.level}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              {isSelected ? (
                                <CheckCircle className="h-6 w-6 text-green-600" />
                              ) : (
                                <Circle className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Strategic Audience Intersection - Drag & Drop Groups */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
        <CardHeader className="bg-gradient-to-r from-purple-100/50 to-pink-100/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Strategic Audience Intersection
              <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-600">
                Drag & Drop
              </Badge>
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={addNewDragDropGroup}
              className="h-8 px-3 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 dark:border-purple-700 dark:text-purple-300 font-medium"
            >
              <FolderPlus className="h-4 w-4 mr-1" />
              Add Group
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between text-sm font-semibold text-gray-800 dark:text-gray-200">
            <span>Targeting Groups ({dragDropGroups.reduce((acc, group) => acc + group.categories.length, 0)} targets)</span>
            <span className="text-purple-700 dark:text-purple-300">Drag categories from above into groups below</span>
          </div>
          
          <ScrollArea className="max-h-80 overflow-y-auto">
            <div className="space-y-3">
              {dragDropGroups.map((group) => (
                <div
                  key={group.id}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800/50 dark:to-purple-950/20 shadow-sm hover:shadow-md transition-all min-h-[120px]"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('ring-2', 'ring-purple-300', 'bg-purple-50');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('ring-2', 'ring-purple-300', 'bg-purple-50');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('ring-2', 'ring-purple-300', 'bg-purple-50');
                    
                    const categoryId = e.dataTransfer.getData('text/plain');
                    const fromGroupId = e.dataTransfer.getData('application/json');
                    
                    if (categoryId && fromGroupId !== group.id) {
                      moveTargetToGroup(categoryId, fromGroupId, group.id);
                      if (!selectedCategories.includes(categoryId)) {
                        onCategorySelect(categoryId, true);
                      }
                    }
                  }}
                >
                  {/* Group Header */}
                  <div className="flex items-center justify-between p-3 border-b border-purple-100 dark:border-purple-800 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-t-lg">
                    <div className="flex items-center gap-2">
                      <Grip className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                        {group.name}
                      </span>
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-600 font-medium">
                        {group.categories.length} targets
                      </Badge>
                    </div>
                    {dragDropGroups.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDragDropGroup(group.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {/* Group Content */}
                  <div className="p-3 space-y-2 min-h-[60px]">
                    {group.categories.length === 0 ? (
                      <div className="flex items-center justify-center h-12 text-sm text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg">
                        Drag targeting categories here
                      </div>
                    ) : (
                      group.categories.map((categoryId) => {
                        const category = getCategoryFromId(categoryId);
                        if (!category) return null;
                        
                        return (
                          <div
                            key={categoryId}
                            className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-100/50 to-pink-100/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded border border-purple-200 dark:border-purple-700 cursor-grab active:cursor-grabbing"
                            draggable
                            onDragStart={(e) => handleCategoryDragStart(e, categoryId, group.id)}
                          >
                            <div className="flex items-center gap-2">
                              <Grip className="h-3 w-3 text-gray-400" />
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{category.name}</span>
                              <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-200 dark:border-indigo-600">
                                {category.categoryType}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                moveTargetToGroup(categoryId, group.id, '');
                                onCategorySelect(categoryId, false);
                              }}
                              className="h-4 w-4 p-0 text-red-500 hover:text-red-600"
                            >
                              ×
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950/50 dark:to-blue-950/50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={onStartConversation}
              variant="outline"
              size="lg"
              className="flex items-center gap-2 min-w-[200px] border-blue-300 text-blue-800 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/20 font-semibold"
              data-testid="button-start-conversation"
            >
              <MessageCircle className="h-5 w-5" />
              Chat with AI Strategist
            </Button>
            
            <Button
              onClick={onProceedToVisualization}
              disabled={getTotalSelectedCount() === 0}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white min-w-[200px] font-bold shadow-lg"
              data-testid="button-proceed-visualization"
            >
              <Eye className="h-5 w-5 mr-2" />
              Proceed to Audience Visualization
            </Button>
          </div>
          
          {getTotalSelectedCount() === 0 && (
            <p className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mt-3">
              Select targeting categories to activate visualization features
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}