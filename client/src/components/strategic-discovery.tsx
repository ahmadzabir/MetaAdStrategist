import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Brain, Target, Users, DollarSign, Heart, Lightbulb } from "lucide-react";
import type { BusinessDiscovery } from "@shared/schema";

interface StrategicDiscoveryProps {
  onDiscoveryComplete: (discovery: BusinessDiscovery) => void;
  initialDiscovery?: BusinessDiscovery;
}

export function StrategicDiscovery({ onDiscoveryComplete, initialDiscovery = {} }: StrategicDiscoveryProps) {
  const [discovery, setDiscovery] = useState<BusinessDiscovery>(initialDiscovery);
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const discoverySteps = [
    {
      id: "business",
      title: "Your Business",
      icon: Target,
      questions: [
        {
          key: "businessType" as keyof BusinessDiscovery,
          label: "What type of business do you run?",
          placeholder: "e.g., E-commerce, SaaS, Local Service, Consulting",
          type: "input"
        },
        {
          key: "productService" as keyof BusinessDiscovery,
          label: "What product or service are you selling?",
          placeholder: "e.g., SAT tutoring, fitness app, accounting software",
          type: "input"
        }
      ]
    },
    {
      id: "customer",
      title: "Customer Psychology",
      icon: Brain,
      questions: [
        {
          key: "decisionMaker" as keyof BusinessDiscovery,
          label: "Who buys your product?",
          placeholder: "e.g., Men, Parents, Business owners, Women 25-45",
          type: "input"
        },
        {
          key: "lifeStage" as keyof BusinessDiscovery,
          label: "When do they need your product?",
          placeholder: "e.g., Special occasions, work events, daily use, holidays",
          type: "input"
        }
      ]
    },
    {
      id: "financial",
      title: "Financial Profile",
      icon: DollarSign,
      questions: [
        {
          key: "financialCapacity" as keyof BusinessDiscovery,
          label: "How much can they afford to spend?",
          placeholder: "e.g., $50-100, $200+, Budget-conscious, Premium buyers",
          type: "input"
        },
        {
          key: "currentSpending" as keyof BusinessDiscovery,
          label: "What else do they buy similar to your product?",
          placeholder: "e.g., Fashion accessories, Professional clothing, Gifts",
          type: "input"
        }
      ]
    },
    {
      id: "behavior",
      title: "Behavioral Patterns",
      icon: Users,
      questions: [
        {
          key: "painPoints" as keyof BusinessDiscovery,
          label: "What problem does your product solve for them?",
          placeholder: "e.g., Looking professional, Finding good gifts, Standing out",
          type: "input"
        },
        {
          key: "behaviors" as keyof BusinessDiscovery,
          label: "Where do they spend their free time?",
          placeholder: "e.g., Social media, Shopping online, Work events, Family time",
          type: "input"
        }
      ]
    }
  ];

  const handleInputChange = (key: keyof BusinessDiscovery, value: string) => {
    setDiscovery(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < discoverySteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGenerateTargeting();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerateTargeting = async () => {
    setIsGenerating(true);
    try {
      onDiscoveryComplete(discovery);
    } catch (error) {
      console.error("Error generating targeting:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const isStepComplete = (stepIndex: number) => {
    const step = discoverySteps[stepIndex];
    return step.questions.every(q => discovery[q.key]?.trim());
  };

  const canProceed = isStepComplete(currentStep);
  const currentStepData = discoverySteps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <StepIcon className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {currentStepData.title}
            </CardTitle>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {discoverySteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded-full transition-all duration-300 ${
                  index <= currentStep
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Step {currentStep + 1} of {discoverySteps.length}: Help us understand your customers
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStepData.questions.map((question, index) => (
            <div key={question.key} className="space-y-3">
              <Label htmlFor={question.key} className="text-base font-medium text-gray-700 dark:text-gray-300">
                {question.label}
              </Label>
              
              {question.type === "input" ? (
                <Input
                  id={question.key}
                  data-testid={`input-${question.key}`}
                  value={discovery[question.key] || ""}
                  onChange={(e) => handleInputChange(question.key, e.target.value)}
                  placeholder={question.placeholder}
                  className="text-base py-3 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              ) : (
                <Textarea
                  id={question.key}
                  data-testid={`textarea-${question.key}`}
                  value={discovery[question.key] || ""}
                  onChange={(e) => handleInputChange(question.key, e.target.value)}
                  placeholder={question.placeholder}
                  rows={3}
                  className="text-base py-3 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 resize-none"
                />
              )}
            </div>
          ))}

          {/* Strategic tips for current step */}
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">Strategic Tip:</p>
                {currentStep === 0 && (
                  <p>Be specific about what you sell. For example: "Men's bowties" instead of just "accessories".</p>
                )}
                {currentStep === 1 && (
                  <p>Think about who actually buys your product and when they need it most.</p>
                )}
                {currentStep === 2 && (
                  <p>Understanding your customer's budget helps us target the right income levels.</p>
                )}
                {currentStep === 3 && (
                  <p>Where your customers spend time helps us find them with better targeting.</p>
                )}
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              data-testid="button-previous"
              className="px-6"
            >
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!canProceed || isGenerating}
              data-testid={currentStep === discoverySteps.length - 1 ? "button-generate-targeting" : "button-next"}
              className="px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </div>
              ) : currentStep === discoverySteps.length - 1 ? (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Generate Strategic Targeting
                </div>
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}