import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Target, 
  Users, 
  Settings, 
  Download, 
  Plus, 
  X, 
  Search,
  TreePine,
  List,
  TrendingUp,
  Lightbulb,
  MessageCircle,
  Layers,
  ChevronRight,
  Grip,
  Trash2,
  FolderPlus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Strategic components
import { StrategicDiscovery } from "@/components/strategic-discovery";
import { StrategicResults } from "@/components/strategic-results";
import { VennDiagram } from "@/components/venn-diagram";
import { StrategicConversation } from "@/components/strategic-conversation";
import SimpleTree from "@/components/simple-tree";
import { SearchAutocomplete } from "@/components/search-autocomplete";

import type { 
  BusinessDiscovery, 
  StrategicTargeting, 
  TargetingRecommendation,
  HierarchicalTargetingCategory,
  TargetingCategory
} from "@shared/schema";

type AppMode = "guided" | "expert";
type DiscoveryPhase = "discovery" | "results" | "visualization" | "conversation" | "targeting" | "campaign";

export default function StrategicHome() {
  // App state
  const [appMode, setAppMode] = useState<AppMode>("guided");
  const [currentPhase, setCurrentPhase] = useState<DiscoveryPhase>("discovery");
  
  // Strategic targeting state
  const [businessDiscovery, setBusinessDiscovery] = useState<BusinessDiscovery>({});
  const [strategicTargeting, setStrategicTargeting] = useState<StrategicTargeting | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [audienceSize, setAudienceSize] = useState<number | null>(null);
  
  // Campaign settings
  const [location, setLocation] = useState("US");
  const [ageMin, setAgeMin] = useState<number>(18);
  const [ageMax, setAgeMax] = useState<number>(65);
  
  // Groups system for targeting
  const [targetingGroups, setTargetingGroups] = useState([
    { id: 'group-1', name: 'Group 1', categories: [] as string[] }
  ]);
  
  // Manual exploration state
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<HierarchicalTargetingCategory[]>([]);
  const [flatCategories, setFlatCategories] = useState<TargetingCategory[]>([]);

  // Load categories for expert mode when needed
  const loadExpertData = async () => {
    if (appMode !== "expert") return;
    
    try {
      console.log("Loading expert data...");
      
      // Load hierarchical categories
      const hierarchicalResponse = await fetch('/api/targeting-categories/hierarchical');
      const hierarchicalData = await hierarchicalResponse.json();
      console.log("Hierarchical response:", hierarchicalData);
      
      if (hierarchicalData.success && hierarchicalData.categories) {
        console.log(`Setting ${hierarchicalData.categories.length} hierarchical categories`);
        setCategories(hierarchicalData.categories);
      } else {
        console.error("Failed to load hierarchical categories:", hierarchicalData);
      }

      // Load flat categories
      const flatResponse = await fetch('/api/targeting-categories');
      const flatData = await flatResponse.json();
      console.log("Flat response:", flatData);
      
      if (flatData.success && flatData.categories) {
        console.log(`Setting ${flatData.categories.length} flat categories`);
        setFlatCategories(flatData.categories);
      } else {
        console.error("Failed to load flat categories:", flatData);
      }
    } catch (error) {
      console.error("Error loading expert data:", error);
    }
  };

  // Load data when switching to expert mode
  useEffect(() => {
    if (appMode === "expert") {
      loadExpertData();
    }
  }, [appMode]);

  // Update audience size when selections change
  useEffect(() => {
    // Calculate audience size
    if (selectedCategories.length === 0) {
      setAudienceSize(0);
      return;
    }
    
    // Simple calculation based on selected categories
    const baseSize = 2500000;
    const modifier = Math.pow(0.8, selectedCategories.length - 1);
    const newSize = Math.floor(baseSize * modifier);
    setAudienceSize(newSize);
  }, [selectedCategories, strategicTargeting]);
  
  const { toast } = useToast();

  // Handle strategic discovery completion
  const handleDiscoveryComplete = async (discovery: BusinessDiscovery) => {
    setBusinessDiscovery(discovery);
    
    try {
      // Generate strategic targeting from discovery
      const response = await fetch("/api/strategic/generate-targeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discovery })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Failed to generate strategic targeting");
      }
      
      setStrategicTargeting(data.strategicTargeting);
      setCurrentPhase("results");
      
      toast({
        title: "Strategic Targeting Generated!",
        description: `Created ${data.strategicTargeting.groups.length} strategic groups for precise audience targeting.`
      });
    } catch (error) {
      console.error("Error generating strategic targeting:", error);
      toast({
        title: "Generation Error",
        description: "Failed to generate strategic targeting. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle recommendation selection from conversation
  const handleRecommendationSelect = (recommendation: TargetingRecommendation) => {
    if (!selectedCategories.includes(recommendation.id)) {
      setSelectedCategories(prev => [...prev, recommendation.id]);
      
      // Add to flat categories for display
      const newCategory: TargetingCategory = {
        id: recommendation.id,
        name: recommendation.name,
        parentId: null,
        level: 1,
        size: null,
        categoryType: recommendation.type,
        createdAt: new Date()
      };
      
      setFlatCategories(prev => [...prev, newCategory]);
      
      toast({
        title: "Target Added",
        description: `${recommendation.name} added to your campaign targeting.`
      });
    }
  };

  // Handle category selection from manual exploration
  const handleCategorySelect = (categoryId: string, selected: boolean) => {
    if (selected) {
      // Check if category is already in any group to prevent duplicates
      const isAlreadyInGroup = targetingGroups.some(group => 
        group.categories.includes(categoryId)
      );
      
      if (!isAlreadyInGroup) {
        // Add to first group by default
        setTargetingGroups(prev => prev.map(group => 
          group.id === 'group-1' 
            ? { ...group, categories: [...group.categories, categoryId] }
            : group
        ));
        setSelectedCategories(prev => [...prev, categoryId]);
      }
    } else {
      // Remove from all groups
      setTargetingGroups(prev => prev.map(group => ({
        ...group,
        categories: group.categories.filter(id => id !== categoryId)
      })));
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  const addNewGroup = () => {
    const newId = `group-${Date.now()}`;
    const newGroupName = `Group ${targetingGroups.length + 1}`;
    
    setTargetingGroups(prev => [...prev, {
      id: newId,
      name: newGroupName,
      categories: []
    }]);
    
    toast({
      title: "Group Added",
      description: `${newGroupName} created successfully. You can now drag targets into this group.`
    });
  };

  const removeGroup = (groupId: string) => {
    if (targetingGroups.length <= 1) return; // Keep at least one group
    
    const groupToRemove = targetingGroups.find(g => g.id === groupId);
    if (groupToRemove) {
      // Remove categories from selected list
      setSelectedCategories(prev => 
        prev.filter(id => !groupToRemove.categories.includes(id))
      );
    }
    
    setTargetingGroups(prev => prev.filter(group => group.id !== groupId));
  };

  const moveTargetToGroup = (categoryId: string, fromGroupId: string, toGroupId: string) => {
    setTargetingGroups(prev => prev.map(group => {
      if (group.id === fromGroupId) {
        return { ...group, categories: group.categories.filter(id => id !== categoryId) };
      } else if (group.id === toGroupId) {
        return { ...group, categories: [...group.categories, categoryId] };
      }
      return group;
    }));
  };

  const getCategoryDetails = (categoryId: string) => {
    return flatCategories.find(cat => cat.id === categoryId);
  };

  const getBreadcrumbs = (categoryId: string): string[] => {
    const category = flatCategories.find(cat => cat.id === categoryId);
    if (!category) return [];
    
    const breadcrumbs: string[] = [];
    let current = category;
    
    while (current) {
      breadcrumbs.unshift(current.name);
      if (!current.parentId) break;
      
      const parent = flatCategories.find(cat => cat.id === current.parentId);
      if (!parent) break;
      current = parent;
    }
    
    return breadcrumbs;
  };

  // Remove selected category
  const handleRemoveCategory = (categoryId: string) => {
    setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    setFlatCategories(prev => prev.filter(cat => cat.id !== categoryId));
  };

  // Calculate audience size based on selections
  const calculateAudienceSize = (): number => {
    if (selectedCategories.length === 0) return 0;
    
    // Simple calculation based on selected categories
    const baseSize = 2500000;
    const modifier = Math.pow(0.8, selectedCategories.length - 1);
    return Math.floor(baseSize * modifier);
  };

  // Get campaign specificity
  const getCampaignSpecificity = () => {
    if (selectedCategories.length === 0) return "None";
    if (selectedCategories.length <= 2) return "Low";
    if (selectedCategories.length <= 5) return "Medium";
    return "High";
  };

  // Handle proceeding to visualization
  const handleProceedToVisualization = () => {
    if (!strategicTargeting || selectedCategories.length === 0) return;
    
    setCurrentPhase("visualization");
    
    toast({
      title: "Moving to Visualization",
      description: "View your final audience intersection and campaign implementation guide."
    });
  };

  // Export campaign configuration
  const handleExportCampaign = () => {
    if (!strategicTargeting || selectedCategories.length === 0) return;

    // Get selected category details
    const selectedCategoryDetails = strategicTargeting.groups
      .flatMap(group => group.categories)
      .filter(category => selectedCategories.includes(category.id));

    const campaignConfig = {
      name: `IntelliTarget Campaign - ${new Date().toLocaleDateString()}`,
      businessDiscovery,
      strategicTargeting,
      selectedCategories: selectedCategoryDetails.map(cat => ({
        id: cat.id,
        name: cat.name,
        type: cat.categoryType,
        size: cat.size
      })),
      metaTargeting: {
        age_min: 18,
        age_max: 65,
        geo_locations: { countries: ["US"] },
        flexible_spec: [{
          interests: selectedCategoryDetails
            .filter(cat => cat.categoryType === 'interests')
            .map(cat => ({ id: cat.id, name: cat.name })),
          behaviors: selectedCategoryDetails
            .filter(cat => cat.categoryType === 'behaviors')
            .map(cat => ({ id: cat.id, name: cat.name })),
          demographics: selectedCategoryDetails
            .filter(cat => cat.categoryType === 'demographics')
            .map(cat => ({ id: cat.id, name: cat.name }))
        }]
      },
      audienceSize: calculateAudienceSize(),
      specificity: getCampaignSpecificity(),
      created: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(campaignConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intellitarget-campaign-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Campaign Exported",
      description: "Your strategic targeting configuration has been downloaded."
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950">
      {/* Header */}
      <div className="border-b border-blue-200 dark:border-blue-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  IntelliTarget
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI-Powered Strategic Meta Ads Targeting
                </p>
              </div>
            </div>
            
            {/* Mode toggle */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="mode-toggle" className="text-sm font-medium">Mode:</Label>
                <Select value={appMode} onValueChange={(value: AppMode) => setAppMode(value)}>
                  <SelectTrigger className="w-40" data-testid="select-app-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guided">Guided Strategy</SelectItem>
                    <SelectItem value="expert">Expert Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {currentPhase !== "discovery" && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentPhase("discovery")}
                  data-testid="button-restart"
                  className="flex items-center gap-2"
                >
                  <Brain className="h-4 w-4" />
                  Start Over
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {appMode === "guided" ? (
          // GUIDED MODE: Strategic Discovery Flow
          <div className="space-y-8">
            {currentPhase === "discovery" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    Let's Build Your Strategic Targeting
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Instead of guessing at targeting options, let's understand your customer psychology 
                    and create sophisticated audience intersections that actually convert.
                  </p>
                </div>
                
                <StrategicDiscovery
                  onDiscoveryComplete={handleDiscoveryComplete}
                  initialDiscovery={businessDiscovery}
                />
              </div>
            )}

            {currentPhase === "results" && strategicTargeting && (
              <div className="space-y-8">
                <StrategicResults
                  strategicTargeting={strategicTargeting}
                  onCategorySelect={handleCategorySelect}
                  onStartConversation={() => setCurrentPhase("conversation")}
                  onExportCampaign={handleExportCampaign}
                  onProceedToVisualization={handleProceedToVisualization}
                  selectedCategories={selectedCategories}
                />
                
                {/* Venn Diagram */}
                {selectedCategories.length > 0 && (
                  <div className="mt-8">
                    <Card className="border-0 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-xl text-center">Audience Intersection Visualization</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <VennDiagram
                          selectedCategories={selectedCategories}
                          audienceSize={audienceSize ?? undefined}
                          onCategoryToggle={handleCategorySelect}
                          strategicTargeting={strategicTargeting}
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {currentPhase === "visualization" && strategicTargeting && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    Audience Intersection Visualization
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
                    Your final campaign visualization. This shows how your selected targeting categories intersect 
                    and provides implementation guidance for Meta Ads Manager.
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span>{selectedCategories.length} Categories Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span>{calculateAudienceSize().toLocaleString()} Est. Reach</span>
                    </div>
                  </div>
                </div>

                {/* Venn Diagram Visualization */}
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
                      <Layers className="h-5 w-5" />
                      Strategic Audience Intersection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VennDiagram
                      selectedCategories={selectedCategories}
                      audienceSize={audienceSize ?? undefined}
                      onCategoryToggle={handleCategorySelect}
                      strategicTargeting={strategicTargeting}
                    />
                  </CardContent>
                </Card>

                {/* Implementation Guide */}
                <Card className="border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Meta Ads Implementation Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="mb-4">
                        <strong>How to implement this targeting in Meta Ads Manager:</strong>
                      </p>
                      <ol className="list-decimal list-inside space-y-2 ml-4">
                        <li>Create a new campaign in Meta Ads Manager</li>
                        <li>In the Ad Set level, navigate to "Audience" section</li>
                        <li>Set Demographics: Age, Gender, Location as needed</li>
                        <li>Add Detailed Targeting categories from your selection below</li>
                        <li>Use AND logic between different category types (automatic in Meta)</li>
                        <li>Review your estimated daily reach and adjust if needed</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>

                {/* Final Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => setCurrentPhase("results")}
                    variant="outline"
                    size="lg"
                    className="min-w-[200px]"
                  >
                    Back to Playground
                  </Button>
                  
                  <Button
                    onClick={handleExportCampaign}
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white min-w-[200px]"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Export Final Configuration
                  </Button>
                  
                  <Button 
                    onClick={() => setCurrentPhase("conversation")}
                    variant="outline"
                    size="lg"
                    className="border-purple-200 text-purple-700 hover:bg-purple-50 min-w-[200px]"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Refine with AI Chat
                  </Button>
                </div>
              </div>
            )}

            {currentPhase === "conversation" && strategicTargeting && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Strategic Conversation */}
                <div className="space-y-6">
                  <StrategicConversation
                    discovery={businessDiscovery}
                    onRecommendationSelect={handleRecommendationSelect}
                    selectedCategories={selectedCategories}
                  />
                  
                  <Button
                    onClick={() => setCurrentPhase("targeting")}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
                    data-testid="button-continue-to-targeting"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Continue to Strategic Targeting
                  </Button>
                </div>

                {/* Right: Strategic Overview */}
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Strategic Overview</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Using AND logic between strategic groups to create precise audience intersections.
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <span>{calculateAudienceSize().toLocaleString()} estimated reach</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span>{getCampaignSpecificity()} specificity</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick campaign summary */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-gray-600" />
                        Campaign Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                          <Select value={location} onValueChange={setLocation}>
                            <SelectTrigger data-testid="select-location">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="US">United States</SelectItem>
                              <SelectItem value="CA">Canada</SelectItem>
                              <SelectItem value="UK">United Kingdom</SelectItem>
                              <SelectItem value="AU">Australia</SelectItem>
                              <SelectItem value="worldwide">Worldwide</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Age Range</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={ageMin}
                              onChange={(e) => setAgeMin(Number(e.target.value))}
                              min={13}
                              max={65}
                              className="w-20"
                              data-testid="input-age-min"
                            />
                            <span className="text-gray-500">to</span>
                            <Input
                              type="number"
                              value={ageMax}
                              onChange={(e) => setAgeMax(Number(e.target.value))}
                              min={13}
                              max={65}
                              className="w-20"
                              data-testid="input-age-max"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {calculateAudienceSize().toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Estimated Reach</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {currentPhase === "targeting" && (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    Strategic Targeting & Manual Exploration
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your strategic groups are ready. Explore additional targeting options or refine your campaign.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Strategic Groups */}
                  <div className="lg:col-span-2">
                    {strategicTargeting && (
                      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border shadow-lg">
                        <h3 className="font-bold text-lg mb-4">Strategic Groups Overview</h3>
                        <div className="space-y-4">
                          {strategicTargeting.groups.map((group) => (
                            <div key={group.id} className="p-4 border rounded-lg">
                              <h4 className="font-semibold">{group.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{group.description}</p>
                              <div className="mt-2">
                                <Badge variant="outline">{group.categories.length} categories</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {calculateAudienceSize().toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Estimated Reach</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Campaign Summary */}
                  <div>
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-purple-600" />
                          Your Campaign
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Selected targets */}
                        <div>
                          <h4 className="font-medium mb-3">Selected Targets ({selectedCategories.length})</h4>
                          <ScrollArea className="h-40">
                            <div className="space-y-2">
                              {flatCategories.filter(cat => selectedCategories.includes(cat.id)).map((category) => (
                                <div
                                  key={category.id}
                                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                >
                                  <span className="text-sm truncate flex-1">{category.name}</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRemoveCategory(category.id)}
                                    data-testid={`button-remove-${category.id}`}
                                    className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                        
                        {/* Campaign metrics */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Estimated Reach:</span>
                            <span className="font-bold text-green-600">
                              {calculateAudienceSize().toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Specificity:</span>
                            <Badge className={
                              getCampaignSpecificity() === "High" ? "bg-red-100 text-red-800 border-red-200" :
                              getCampaignSpecificity() === "Medium" ? "bg-orange-100 text-orange-800 border-orange-200" :
                              getCampaignSpecificity() === "Low" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                              "bg-gray-100 text-gray-800 border-gray-200"
                            }>
                              {getCampaignSpecificity()}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Export button */}
                        {selectedCategories.length > 0 && (
                          <Button
                            onClick={handleExportCampaign}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                            data-testid="button-export-campaign"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export Campaign
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // EXPERT MODE: Direct Manual Exploration
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Expert Manual Targeting
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Direct access to all targeting categories with advanced controls.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Manual exploration */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-blue-600" />
                      Manual Exploration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Smart Search with Autocomplete */}
                    <div className="space-y-4 mb-6">
                      <SearchAutocomplete
                        categories={flatCategories}
                        onSelect={(category) => {
                          try {
                            handleCategorySelect(category.id, true);
                            toast({
                              title: "Target Added",
                              description: `${category.name} added to your campaign targeting.`
                            });
                          } catch (error) {
                            console.error('Error selecting category:', error);
                          }
                        }}
                        placeholder="Search targeting categories... (e.g., fashion, fitness, parents)"
                        className="w-full"
                      />
                      
                      {/* View Mode Toggle */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Browse all categories or search above
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={viewMode === "tree" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewMode("tree")}
                            data-testid="button-tree-view"
                          >
                            <TreePine className="h-4 w-4" />
                            <span className="ml-1 hidden sm:inline">Tree</span>
                          </Button>
                          <Button
                            variant={viewMode === "list" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewMode("list")}
                            data-testid="button-list-view"
                          >
                            <List className="h-4 w-4" />
                            <span className="ml-1 hidden sm:inline">List</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Category browser */}
                    <div className="min-h-[400px]">
                      {viewMode === "tree" ? (
                        <SimpleTree
                          categories={categories}
                          selectedCategories={selectedCategories}
                          onCategorySelect={handleCategorySelect}
                          searchQuery={searchQuery}
                        />
                      ) : (
                        <div className="space-y-2">
                          {flatCategories
                            .filter(cat => !searchQuery || cat.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((category) => {
                              // Build breadcrumbs for list view
                              const getBreadcrumbs = (cat: typeof category): string[] => {
                                const breadcrumbs: string[] = [];
                                let current = cat;
                                
                                while (current) {
                                  breadcrumbs.unshift(current.name);
                                  if (!current.parentId) break;
                                  
                                  const parent = flatCategories.find(c => c.id === current.parentId);
                                  if (!parent) break;
                                  current = parent;
                                }
                                
                                return breadcrumbs;
                              };

                              return (
                                <div
                                  key={category.id}
                                  className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-900 dark:text-gray-100">
                                        {category.name}
                                      </span>
                                      <Badge variant="outline" className="text-xs shrink-0">
                                        {category.categoryType}
                                      </Badge>
                                    </div>
                                    
                                    {/* Show breadcrumbs for deeper levels, especially when searching */}
                                    {(category.level > 1 || searchQuery) && (
                                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {getBreadcrumbs(category).slice(0, -1).map((breadcrumb, idx, arr) => (
                                          <span key={idx} className="flex items-center gap-1">
                                            <span className="truncate max-w-[100px]">{breadcrumb}</span>
                                            {idx < arr.length - 1 && (
                                              <ChevronRight className="h-3 w-3 text-gray-400" />
                                            )}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {category.size && category.size !== 'Unknown' && category.size !== 'Not available' && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {category.size} people
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant={selectedCategories.includes(category.id) ? "secondary" : "outline"}
                                    onClick={() => handleCategorySelect(category.id, !selectedCategories.includes(category.id))}
                                    data-testid={`button-category-${category.id}`}
                                    className="shrink-0 ml-3"
                                  >
                                    {selectedCategories.includes(category.id) ? "Added" : "Add"}
                                  </Button>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Campaign summary with groups */}
              <div>
                <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Target className="h-5 w-5 text-purple-600" />
                      Campaign Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Campaign settings */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="expert-location" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Location</Label>
                        <Select value={location} onValueChange={setLocation}>
                          <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600" data-testid="select-expert-location">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="UK">United Kingdom</SelectItem>
                            <SelectItem value="AU">Australia</SelectItem>
                            <SelectItem value="worldwide">Worldwide</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Age Range</Label>
                        <div className="flex items-center gap-3 mt-2">
                          <Input
                            type="number"
                            value={ageMin}
                            onChange={(e) => setAgeMin(Number(e.target.value))}
                            className="w-20 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            min="18"
                            max="65"
                            data-testid="input-age-min"
                          />
                          <span className="text-gray-500 font-medium">to</span>
                          <Input
                            type="number"
                            value={ageMax}
                            onChange={(e) => setAgeMax(Number(e.target.value))}
                            className="w-20 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                            min="18"
                            max="65"
                            data-testid="input-age-max"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Targeting Groups */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Targeting Groups ({targetingGroups.reduce((acc, group) => acc + group.categories.length, 0)} targets)
                        </Label>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={addNewGroup}
                          className="h-8 px-3 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300"
                          data-testid="button-add-group"
                        >
                          <FolderPlus className="h-4 w-4 mr-1" />
                          Add Group
                        </Button>
                      </div>
                      
                      <ScrollArea className="max-h-80 overflow-y-auto">
                        <div className="space-y-3">
                          {targetingGroups.map((group) => (
                            <div
                              key={group.id}
                              className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/50 shadow-sm"
                            >
                              {/* Group Header */}
                              <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 rounded-t-lg">
                                <div className="flex items-center gap-2">
                                  <Grip className="h-4 w-4 text-gray-400" />
                                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                    {group.name}
                                  </span>
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
                                    {group.categories.length} targets
                                  </Badge>
                                </div>
                                {targetingGroups.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeGroup(group.id)}
                                    className="h-6 w-6 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                                    data-testid={`button-remove-group-${group.id}`}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>

                              {/* Group Content */}
                              <div className="p-3">
                                {group.categories.length === 0 ? (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-2">
                                    No targets in this group
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {group.categories.map((categoryId, index) => {
                                      const category = getCategoryDetails(categoryId);
                                      const breadcrumbs = getBreadcrumbs(categoryId);
                                      
                                      if (!category) return null;
                                      
                                      const getCategoryTypeColor = (type: string) => {
                                        switch (type) {
                                          case 'demographics':
                                            return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600';
                                          case 'interests':
                                            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600';
                                          case 'behaviors':
                                            return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-600';
                                          default:
                                            return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
                                        }
                                      };

                                      return (
                                        <div
                                          key={`${group.id}-${categoryId}-${index}`}
                                          className="group flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-all"
                                        >
                                          <div className="flex-1 min-w-0">
                                            {/* Category name */}
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                                {category.name}
                                              </span>
                                              <Badge 
                                                variant="outline" 
                                                className={`text-xs ${getCategoryTypeColor(category.categoryType)}`}
                                              >
                                                {category.categoryType}
                                              </Badge>
                                            </div>
                                            
                                            {/* Breadcrumbs */}
                                            {breadcrumbs.length > 1 && (
                                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                {breadcrumbs.slice(0, -1).map((breadcrumb, idx, arr) => (
                                                  <span key={idx} className="flex items-center gap-1">
                                                    <span className="truncate max-w-[80px]">{breadcrumb}</span>
                                                    {idx < arr.length - 1 && (
                                                      <ChevronRight className="h-3 w-3" />
                                                    )}
                                                  </span>
                                                ))}
                                              </div>
                                            )}
                                            
                                            {/* Audience size */}
                                            {category.size && category.size !== 'Unknown' && category.size !== 'Not available' && (
                                              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                                {category.size} people
                                              </p>
                                            )}
                                          </div>
                                          
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCategorySelect(categoryId, false)}
                                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                                            data-testid={`button-remove-${categoryId}`}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Audience estimate */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 -mx-6 px-6 -mb-6 pb-6 rounded-b-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Estimated Reach:</span>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          {audienceSize ? audienceSize.toLocaleString() : "2,500,000"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Specificity:</span>
                        <Badge 
                          variant="outline" 
                          className={
                            selectedCategories.length > 3 
                              ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-600" 
                              : selectedCategories.length > 1 
                              ? "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-600" 
                              : "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600"
                          }
                        >
                          {selectedCategories.length > 3 ? "High" : selectedCategories.length > 1 ? "Medium" : "Low"}
                        </Badge>
                      </div>
                    </div>

                    {/* Export button */}
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all"
                      size="lg"
                      data-testid="button-export-campaign"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Export Campaign
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}