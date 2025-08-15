import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Target, Users, Eye, MessageCircle, Grip, FolderPlus, Trash2, Plus, RefreshCw, Lightbulb, Brain, ArrowRight, Sparkles, X } from 'lucide-react';
import { StrategicTargeting, TargetingGroup, StrategicTargetingCategory, BusinessDiscovery } from '@shared/schema';
import { MetaTargetingSearch } from './meta-targeting-search';
import { useToast } from '@/hooks/use-toast';

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
  onProceedToVisualization?: () => void;
  businessDiscovery: BusinessDiscovery;
  onUpdateTargeting?: (newTargeting: StrategicTargeting) => void;
}

interface InteractiveGroup {
  id: string;
  name: string;
  description: string;
  reasoning: string;
  categories: StrategicTargetingCategory[];
  color: string;
  isExpanded: boolean;
}

export function StrategicResults({ 
  strategicTargeting, 
  onCategorySelect, 
  onStartConversation,
  onExportCampaign,
  selectedCategories,
  onProceedToVisualization,
  businessDiscovery,
  onUpdateTargeting
}: StrategicResultsProps) {
  const { toast } = useToast();
  
  // Convert strategic targeting to interactive groups
  const [interactiveGroups, setInteractiveGroups] = useState<InteractiveGroup[]>(() => {
    const colors = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];
    
    return strategicTargeting.groups.map((group, index) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      reasoning: `AI selected this group because it helps identify ${group.name.toLowerCase()} who are most likely to purchase your product.`,
      categories: group.categories,
      color: colors[index % colors.length],
      isExpanded: true
    }));
  });
  
  const [aiRecommendation, setAiRecommendation] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Generate initial AI recommendation
  useEffect(() => {
    const generateInitialRecommendation = () => {
      const product = businessDiscovery.productService || "your product";
      const targetCustomer = businessDiscovery.decisionMaker || "potential customers";
      
      setAiRecommendation(
        `Based on your ${product} targeting, I recommend finding ${targetCustomer} who match ALL these groups simultaneously. ` +
        `Group 1 identifies their ${interactiveGroups[0]?.name.toLowerCase() || 'financial capacity'}, ` +
        `while Group 2 targets their ${interactiveGroups[1]?.name.toLowerCase() || 'behavioral patterns'}. ` +
        `The intersection will be your highest-value prospects.`
      );
    };

    if (businessDiscovery && interactiveGroups.length > 0) {
      generateInitialRecommendation();
    }
  }, [businessDiscovery, interactiveGroups]);

  // Interactive functions
  const addNewGroup = () => {
    const colors = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];
    const newId = `group-${Date.now()}`;
    
    const newGroup: InteractiveGroup = {
      id: newId,
      name: `Group ${interactiveGroups.length + 1}`,
      description: "Custom targeting group",
      reasoning: "Add targeting categories that complement your existing strategy.",
      categories: [],
      color: colors[interactiveGroups.length % colors.length],
      isExpanded: true
    };
    
    setInteractiveGroups(prev => [...prev, newGroup]);
  };

  const removeGroup = (groupId: string) => {
    if (interactiveGroups.length > 1) {
      setInteractiveGroups(prev => prev.filter(group => group.id !== groupId));
    }
  };

  const toggleGroupExpanded = (groupId: string) => {
    setInteractiveGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, isExpanded: !group.isExpanded } : group
    ));
  };

  const updateGroupName = (groupId: string, newName: string) => {
    setInteractiveGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, name: newName } : group
    ));
  };

  const addCategoryToGroup = (groupId: string, category: any) => {
    const strategicCategory: StrategicTargetingCategory = {
      id: category.id,
      name: category.name,
      type: category.type || 'interests',
      justification: `Added to enhance ${interactiveGroups.find(g => g.id === groupId)?.name} targeting`,
      category: category.type || 'interests',
      breadcrumbs: category.breadcrumbs || category.path || [],
      size: category.audience_size_display
    };

    setInteractiveGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        const exists = group.categories.some(cat => cat.id === category.id);
        if (!exists) {
          return { ...group, categories: [...group.categories, strategicCategory] };
        }
      }
      return group;
    }));

    // Also add to global selected categories
    onCategorySelect(category.id, true);
  };

  const removeCategoryFromGroup = (groupId: string, categoryId: string) => {
    setInteractiveGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, categories: group.categories.filter(cat => cat.id !== categoryId) }
        : group
    ));
    
    // Also remove from global selected categories
    onCategorySelect(categoryId, false);
  };

  const analyzeWithAI = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis - in real implementation, call your AI service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const totalCategories = interactiveGroups.reduce((sum, group) => sum + group.categories.length, 0);
      const groupCount = interactiveGroups.length;
      
      let newRecommendation = "";
      
      if (totalCategories === 0) {
        newRecommendation = "Add some targeting categories to your groups so I can analyze your strategy!";
      } else if (groupCount === 1) {
        newRecommendation = "Consider adding a second group to create audience intersections. This will help you find more qualified prospects.";
      } else if (totalCategories < 4) {
        newRecommendation = "Good start! Consider adding 2-3 more targeting categories to each group for better precision.";
      } else {
        newRecommendation = `Excellent strategy! Your ${groupCount} groups with ${totalCategories} categories will create highly qualified audience intersections. The overlap should give you premium prospects who match multiple behavioral and demographic indicators.`;
      }
      
      setAiRecommendation(newRecommendation);
      
      toast({
        title: "AI Analysis Complete",
        description: "Updated recommendations based on your current targeting setup."
      });
      
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Failed to analyze targeting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTotalCategories = () => {
    return interactiveGroups.reduce((sum, group) => sum + group.categories.length, 0);
  };

  const calculateEstimatedReach = () => {
    const totalCats = getTotalCategories();
    if (totalCats === 0) return 0;
    
    // Simulate audience intersection calculation
    const baseReach = totalCats * 2000000; // 2M per category
    const intersectionFactor = Math.pow(0.7, interactiveGroups.length - 1); // Diminishing returns
    return Math.floor(baseReach * intersectionFactor);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* AI Strategy Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Strategic Recommendation
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Interactive targeting workspace - modify and refine your strategy
                </p>
              </div>
            </div>
            
            <Button
              onClick={analyzeWithAI}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              data-testid="button-analyze-ai"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze with AI
                </>
              )}
            </Button>
          </div>
          
          {/* AI Recommendation Box */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">AI Strategist Says:</h4>
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                  {aiRecommendation}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Interactive Targeting Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Groups Workspace */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Targeting Groups ({interactiveGroups.length})
            </h3>
            <Button
              onClick={addNewGroup}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              data-testid="button-add-group"
            >
              <Plus className="h-4 w-4" />
              Add Group
            </Button>
          </div>

          {interactiveGroups.map((group, index) => (
            <Card 
              key={group.id}
              className="border-2 transition-all hover:shadow-lg"
              style={{ borderColor: group.color }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: group.color }}
                    />
                    <Input
                      value={group.name}
                      onChange={(e) => updateGroupName(group.id, e.target.value)}
                      className="font-semibold border-0 bg-transparent text-lg px-0 h-auto focus-visible:ring-0"
                      data-testid={`input-group-name-${group.id}`}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary"
                      style={{ 
                        backgroundColor: `${group.color}20`,
                        color: group.color,
                        borderColor: `${group.color}40`
                      }}
                    >
                      {group.categories.length} targets
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleGroupExpanded(group.id)}
                      data-testid={`button-toggle-${group.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {interactiveGroups.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGroup(group.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        data-testid={`button-remove-${group.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {group.reasoning}
                </p>
              </CardHeader>

              {group.isExpanded && (
                <CardContent className="pt-0">
                  {/* Add new targeting search */}
                  <div className="mb-4">
                    <MetaTargetingSearch
                      onSelect={(category) => addCategoryToGroup(group.id, category)}
                      placeholder={`Add targeting to ${group.name}...`}
                      className="w-full"
                      targetingType="adTargetingCategory"
                    />
                  </div>
                  
                  {/* Current categories in group */}
                  <div className="space-y-2">
                    {group.categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Grip className="h-4 w-4 text-gray-400 cursor-move" />
                          <div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {category.name}
                            </span>
                            {category.breadcrumbs && category.breadcrumbs.length > 1 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {category.breadcrumbs.join(" → ")}
                              </div>
                            )}
                            {category.size && (
                              <Badge variant="outline" className="text-xs mt-1 bg-green-50 text-green-700 border-green-200">
                                {category.size}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCategoryFromGroup(group.id, category.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-remove-category-${category.id}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    {group.categories.length === 0 && (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Search and add targeting categories above</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Strategy Summary */}
        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Campaign Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {calculateEstimatedReach().toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Estimated Reach</div>
                <div className="text-xs text-gray-500 mt-1">
                  Intersection of {interactiveGroups.length} groups
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Categories:</span>
                  <span className="font-medium">{getTotalCategories()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Groups:</span>
                  <span className="font-medium">{interactiveGroups.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Strategy:</span>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    Intersection Targeting
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Button
                  onClick={onProceedToVisualization}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                  disabled={getTotalCategories() === 0}
                  data-testid="button-visualize"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Visualize Audience
                </Button>
                
                <Button
                  onClick={onStartConversation}
                  variant="outline"
                  className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                  data-testid="button-chat-ai"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat with AI
                </Button>
                
                <Button
                  onClick={onExportCampaign}
                  variant="outline"
                  className="w-full"
                  disabled={getTotalCategories() === 0}
                  data-testid="button-export"
                >
                  Export Configuration
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                💡 Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-orange-700 dark:text-orange-300 space-y-2">
              <p>• Add 2-4 categories per group for optimal targeting</p>
              <p>• Use different group types (demographics + interests)</p>
              <p>• Click "Analyze with AI" after making changes</p>
              <p>• Intersection targeting finds premium prospects</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
          
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