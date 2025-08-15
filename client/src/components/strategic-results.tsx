import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Target, Users, Eye, CheckCircle, Circle, MessageCircle } from 'lucide-react';
import { StrategicTargeting, TargetingGroup } from '@shared/schema';

interface StrategicResultsProps {
  strategicTargeting: StrategicTargeting;
  onCategorySelect: (categoryId: string, selected: boolean) => void;
  onStartConversation: () => void;
  onExportCampaign: () => void;
  selectedCategories: string[];
}

export function StrategicResults({ 
  strategicTargeting, 
  onCategorySelect, 
  onStartConversation,
  onExportCampaign,
  selectedCategories 
}: StrategicResultsProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

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
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{strategicTargeting.groups.length} Strategic Groups</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{getTotalSelectedCount()} Categories Selected</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Strategic Logic Explanation */}
      <Card className="border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">How Strategic Groups Work</h4>
              <div className="space-y-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>How AND/OR Logic Works:</strong>
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Within each group:</strong> OR logic (select any/all categories you want)
                      <br/>
                      <span className="text-blue-700 dark:text-blue-300 text-xs">Example: Age 25-34 OR Age 35-44</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Between groups:</strong> AND logic (must match ALL selected groups)
                      <br/>
                      <span className="text-blue-700 dark:text-blue-300 text-xs">Example: (Demographics) AND (Interests) AND (Behaviors)</span>
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
            <Card key={group.id} className="border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleGroupExpanded(group.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        {group.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {group.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs">
                      {selectedCount}/{group.categories.length} selected
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
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
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <strong>Strategic Logic:</strong> {group.logic}
                    </p>
                    
                    <div className="grid gap-3">
                      {group.categories.map((category) => {
                        const isSelected = selectedCategories.includes(category.id);
                        
                        return (
                          <div 
                            key={category.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => 
                                  onCategorySelect(category.id, checked as boolean)
                                }
                                data-testid={`checkbox-${category.id}`}
                              />
                              <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">
                                  {category.name}
                                </p>
                                <div className="space-y-2 mt-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {category.categoryType}
                                    </Badge>
                                    {category.size && (
                                      <Badge variant="secondary" className="text-xs">
                                        {category.size} audience
                                      </Badge>
                                    )}
                                  </div>
                                  {category.id && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      ID: {category.id}
                                    </p>
                                  )}
                                  {category.parentId && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      Parent: {category.parentId}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              {isSelected ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-400" />
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

      {/* Action Buttons */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950/50 dark:to-blue-950/50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={onStartConversation}
              variant="outline"
              size="lg"
              className="flex items-center gap-2 min-w-[200px]"
              data-testid="button-start-conversation"
            >
              <MessageCircle className="h-5 w-5" />
              Chat with AI Strategist
            </Button>
            
            <Button
              onClick={onExportCampaign}
              disabled={getTotalSelectedCount() === 0}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white min-w-[200px]"
              data-testid="button-export-campaign"
            >
              Export to Meta Ads ({getTotalSelectedCount()} targets)
            </Button>
          </div>
          
          {getTotalSelectedCount() === 0 && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
              Select targeting categories to export your campaign
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}