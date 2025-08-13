import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateRecommendationSchema, type GenerateRecommendationRequest, type TargetingRecommendation } from "@shared/schema";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface AIStrategyGeneratorProps {
  onRecommendationsGenerated: (recommendations: TargetingRecommendation[]) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

export default function AIStrategyGenerator({ 
  onRecommendationsGenerated, 
  isAnalyzing, 
  setIsAnalyzing 
}: AIStrategyGeneratorProps) {
  const { toast } = useToast();
  
  const form = useForm<GenerateRecommendationRequest>({
    resolver: zodResolver(generateRecommendationSchema),
    defaultValues: {
      userInput: "",
      budgetRange: "",
      geographicFocus: "",
      campaignGoal: "",
    },
  });

  const generateMutation = useMutation({
    mutationFn: api.generateRecommendations,
    onMutate: () => {
      setIsAnalyzing(true);
    },
    onSuccess: (data) => {
      onRecommendationsGenerated(data.recommendations);
      toast({
        title: "Recommendations Generated",
        description: `Generated ${data.recommendations.length} strategic targeting recommendations.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate recommendations",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsAnalyzing(false);
    },
  });

  const onSubmit = (data: GenerateRecommendationRequest) => {
    generateMutation.mutate(data);
  };

  const loadExample = () => {
    form.setValue("userInput", "I'm selling high-end, sustainable yoga mats for experienced practitioners who live in urban areas.");
    form.setValue("budgetRange", "$500 - $2,000");
    form.setValue("geographicFocus", "United States");
    form.setValue("campaignGoal", "Conversions");
  };

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <i className="fas fa-brain text-primary"></i>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-text-primary">AI Strategy Generator</h3>
          <p className="text-text-secondary text-sm">
            Describe your offering and let AI find the perfect targeting strategy
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="userInput"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-text-primary">
                  Product/Service Description
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Example: I'm selling high-end, sustainable yoga mats for experienced practitioners who live in urban areas..."
                    className="resize-none"
                    rows={4}
                    data-testid="input-user-description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="budgetRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-text-primary">
                    Budget Range
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-budget-range">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="$500 - $2,000">$500 - $2,000</SelectItem>
                      <SelectItem value="$2,000 - $5,000">$2,000 - $5,000</SelectItem>
                      <SelectItem value="$5,000 - $10,000">$5,000 - $10,000</SelectItem>
                      <SelectItem value="$10,000+">$10,000+</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="geographicFocus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-text-primary">
                    Geographic Focus
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-geographic-focus">
                        <SelectValue placeholder="Select geographic focus" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="Global">Global</SelectItem>
                      <SelectItem value="Europe">Europe</SelectItem>
                      <SelectItem value="Custom Regions">Custom Regions</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="campaignGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-text-primary">
                    Campaign Goal
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-campaign-goal">
                        <SelectValue placeholder="Select campaign goal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Conversions">Conversions</SelectItem>
                      <SelectItem value="Traffic">Traffic</SelectItem>
                      <SelectItem value="Brand Awareness">Brand Awareness</SelectItem>
                      <SelectItem value="Lead Generation">Lead Generation</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex space-x-3">
            <Button 
              type="submit" 
              disabled={isAnalyzing}
              className="bg-primary text-white hover:bg-primary-dark font-medium"
              data-testid="button-generate-strategy"
            >
              {isAnalyzing ? (
                <>
                  <i className="fas fa-spinner animate-spin mr-2"></i>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-magic mr-2"></i>
                  <span>Generate AI Strategy</span>
                </>
              )}
            </Button>
            
            <Button 
              type="button"
              variant="outline"
              onClick={loadExample}
              data-testid="button-load-example"
            >
              <i className="fas fa-history mr-2"></i>
              Load Example
            </Button>
          </div>
        </form>
      </Form>

      {/* Loading Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-elevated p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-brain text-primary text-2xl animate-pulse"></i>
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              AI is analyzing your request...
            </h3>
            <p className="text-text-secondary mb-6">This usually takes 10-15 seconds</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
