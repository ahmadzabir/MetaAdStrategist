import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Target, Brain, DollarSign, Users, Lightbulb, Sparkles } from 'lucide-react';
import { BusinessDiscovery } from '@shared/schema';

interface StrategicDiscoveryProps {
  onDiscoveryComplete: (discovery: BusinessDiscovery) => Promise<void>;
  initialDiscovery?: Partial<BusinessDiscovery>;
}

export function StrategicDiscovery({ onDiscoveryComplete, initialDiscovery = {} }: StrategicDiscoveryProps) {
  const [discovery, setDiscovery] = useState<BusinessDiscovery>(initialDiscovery as BusinessDiscovery);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingText, setLoadingText] = useState("");

  const handleInputChange = (key: keyof BusinessDiscovery, value: string) => {
    setDiscovery(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleGenerateTargeting = async () => {
    setIsGenerating(true);
    
    // Show loading sequence with progress
    const loadingSteps = [
      "Analyzing your customer psychology...",
      "Identifying behavioral patterns...", 
      "Creating strategic targeting groups...",
      "Optimizing audience intersections..."
    ];
    
    for (let i = 0; i < loadingSteps.length; i++) {
      setLoadingStep(i);
      setLoadingText(loadingSteps[i]);
      await new Promise(resolve => setTimeout(resolve, 750)); // 3 seconds total
    }
    
    try {
      await onDiscoveryComplete(discovery);
    } catch (error) {
      console.error("Error generating targeting:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const isFormComplete = () => {
    const requiredFields: (keyof BusinessDiscovery)[] = [
      'businessType', 'decisionMaker', 'lifeStage', 'financialCapacity',
      'currentSpending', 'painPoints', 'behaviors'
    ];
    return requiredFields.every(field => discovery[field]?.trim());
  };

  // Show loading state during generation
  if (isGenerating) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center">
                <div className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white animate-pulse">
                  <Sparkles className="h-8 w-8" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Strategic Analysis
                </h3>
                
                <Progress value={((loadingStep + 1) / 4) * 100} className="h-2" />
                
                <p className="text-gray-600 dark:text-gray-400 animate-pulse">
                  {loadingText}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <Target className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Strategic Customer Discovery
            </CardTitle>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400">
            Help us understand your customers to create powerful targeting strategies
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Business Basics */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Business Basics</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessType" className="text-sm font-medium">What do you sell?</Label>
                <Input
                  id="businessType"
                  data-testid="input-businessType"
                  value={discovery.businessType || ""}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                  placeholder="e.g., Men's bowties, Kids toys, Online courses"
                  className="border-gray-300 dark:border-gray-600"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="decisionMaker" className="text-sm font-medium">Who buys your product?</Label>
                <Input
                  id="decisionMaker"
                  data-testid="input-decisionMaker"
                  value={discovery.decisionMaker || ""}
                  onChange={(e) => handleInputChange('decisionMaker', e.target.value)}
                  placeholder="e.g., Men 25-45, Parents, Business owners"
                  className="border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Customer Psychology */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Customer Psychology</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lifeStage" className="text-sm font-medium">When do they need your product?</Label>
                <Input
                  id="lifeStage"
                  data-testid="input-lifeStage"
                  value={discovery.lifeStage || ""}
                  onChange={(e) => handleInputChange('lifeStage', e.target.value)}
                  placeholder="e.g., Special occasions, work events, daily use"
                  className="border-gray-300 dark:border-gray-600"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="painPoints" className="text-sm font-medium">What problem does your product solve?</Label>
                <Input
                  id="painPoints"
                  data-testid="input-painPoints"
                  value={discovery.painPoints || ""}
                  onChange={(e) => handleInputChange('painPoints', e.target.value)}
                  placeholder="e.g., Looking professional, Finding good gifts"
                  className="border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Financial Profile */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Financial Profile</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="financialCapacity" className="text-sm font-medium">How much can they afford to spend?</Label>
                <Input
                  id="financialCapacity"
                  data-testid="input-financialCapacity"
                  value={discovery.financialCapacity || ""}
                  onChange={(e) => handleInputChange('financialCapacity', e.target.value)}
                  placeholder="e.g., $50-100, $200+, Budget-conscious"
                  className="border-gray-300 dark:border-gray-600"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currentSpending" className="text-sm font-medium">What else do they buy similar to yours?</Label>
                <Input
                  id="currentSpending"
                  data-testid="input-currentSpending"
                  value={discovery.currentSpending || ""}
                  onChange={(e) => handleInputChange('currentSpending', e.target.value)}
                  placeholder="e.g., Fashion accessories, Professional clothing"
                  className="border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Behavioral Patterns */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Behavioral Patterns</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="behaviors" className="text-sm font-medium">Where do they spend their free time?</Label>
              <Textarea
                id="behaviors"
                data-testid="textarea-behaviors"
                value={discovery.behaviors || ""}
                onChange={(e) => handleInputChange('behaviors', e.target.value)}
                placeholder="e.g., Social media, Shopping online, Work events, Family time"
                rows={3}
                className="border-gray-300 dark:border-gray-600 resize-none"
              />
            </div>
          </div>

          {/* Strategic Tip */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">Strategic Tip:</p>
                <p>The more specific your answers, the better our AI can create targeted audiences. Think about what makes your customers unique beyond just demographics.</p>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleGenerateTargeting}
              disabled={!isFormComplete() || isGenerating}
              data-testid="button-generate-targeting"
              size="lg"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Generate Strategic Targeting
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}