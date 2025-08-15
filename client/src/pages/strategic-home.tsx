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
  Layers
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
  const [campaignLogic, setCampaignLogic] = useState<"AND" | "OR">("AND");
  
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
    const newSize = calculateAudienceSize();
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
      setSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  // Remove selected category
  const handleRemoveCategory = (categoryId: string) => {
    setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    setFlatCategories(prev => prev.filter(cat => cat.id !== categoryId));
  };

  // Calculate audience size based on selections
  const calculateAudienceSize = () => {
    if (selectedCategories.length === 0) return 0;
    
    // Get selected category details for more accurate sizing
    const selectedCategoryDetails = selectedCategories.map(catId => {
      // Find category in strategic targeting groups
      if (strategicTargeting) {
        for (const group of strategicTargeting.groups) {
          const found = group.categories.find(cat => cat.id === catId);
          if (found) return found;
        }
      }
      return { id: catId, name: `Category ${catId}`, size: "2.5M" };
    });

    // Calculate based on actual audience sizes if available
    let totalAudience = 0;
    for (const cat of selectedCategoryDetails) {
      if (cat.size) {
        const sizeStr = cat.size.toString();
        const numericSize = parseFloat(sizeStr.replace(/[KMB,]/g, ''));
        const multiplier = sizeStr.includes('K') ? 1000 : sizeStr.includes('M') ? 1000000 : sizeStr.includes('B') ? 1000000000 : 1;
        totalAudience += numericSize * multiplier;
      } else {
        totalAudience += 2500000; // Default 2.5M if no size
      }
    }

    // Apply intersection reduction (AND logic reduces audience)
    const intersectionReduction = Math.pow(0.6, selectedCategories.length - 1);
    return Math.round(totalAudience * intersectionReduction);
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
              
              {/* Campaign summary */}
              <div>
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      Campaign Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Campaign settings */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="expert-location" className="text-sm font-medium">Location</Label>
                        <Select value={location} onValueChange={setLocation}>
                          <SelectTrigger data-testid="select-expert-location">
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
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            value={ageMin}
                            onChange={(e) => setAgeMin(Number(e.target.value))}
                            min={13}
                            max={65}
                            className="w-20"
                            data-testid="input-expert-age-min"
                          />
                          <span className="text-gray-500">to</span>
                          <Input
                            type="number"
                            value={ageMax}
                            onChange={(e) => setAgeMax(Number(e.target.value))}
                            min={13}
                            max={65}
                            className="w-20"
                            data-testid="input-expert-age-max"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Targeting Logic</Label>
                        <Select value={campaignLogic} onValueChange={(value: "AND" | "OR") => setCampaignLogic(value)}>
                          <SelectTrigger data-testid="select-campaign-logic">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AND">AND (Narrow)</SelectItem>
                            <SelectItem value="OR">OR (Broad)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
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
                                data-testid={`button-expert-remove-${category.id}`}
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
                        data-testid="button-expert-export"
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
    </div>
  );
}