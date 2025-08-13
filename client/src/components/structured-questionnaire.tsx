import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, ArrowRight, Target } from "lucide-react";

interface QuestionnaireData {
  businessType: string;
  productService: string;
  targetAge: string;
  budget: string;
  goal: string;
}

interface StructuredQuestionnaireProps {
  onGenerate: (data: QuestionnaireData) => void;
  isLoading?: boolean;
}

export function StructuredQuestionnaire({ onGenerate, isLoading }: StructuredQuestionnaireProps) {
  const [answers, setAnswers] = useState<QuestionnaireData>({
    businessType: "",
    productService: "",
    targetAge: "",
    budget: "",
    goal: ""
  });

  const handleSubmit = () => {
    if (Object.values(answers).some(value => !value.trim())) {
      return;
    }
    onGenerate(answers);
  };

  const isComplete = Object.values(answers).every(value => value.trim());

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
      <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
            AI Strategy Builder
          </CardTitle>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Answer these quick questions to get personalized targeting recommendations
        </p>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* Business Type */}
        <div className="space-y-2">
          <Label htmlFor="businessType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            What type of business is this?
          </Label>
          <Select value={answers.businessType} onValueChange={(value) => setAnswers(prev => ({ ...prev, businessType: value }))}>
            <SelectTrigger data-testid="select-business-type">
              <SelectValue placeholder="Choose business type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ecommerce">E-commerce</SelectItem>
              <SelectItem value="saas">Software/SaaS</SelectItem>
              <SelectItem value="local">Local Business</SelectItem>
              <SelectItem value="fitness">Fitness/Health</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="food">Food/Restaurant</SelectItem>
              <SelectItem value="fashion">Fashion/Beauty</SelectItem>
              <SelectItem value="b2b">B2B Services</SelectItem>
              <SelectItem value="nonprofit">Non-profit</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Product/Service */}
        <div className="space-y-2">
          <Label htmlFor="productService" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            What do you sell? (1-3 words)
          </Label>
          <Input
            id="productService"
            data-testid="input-product-service"
            placeholder="e.g. yoga classes, running shoes, web design"
            value={answers.productService}
            onChange={(e) => setAnswers(prev => ({ ...prev, productService: e.target.value }))}
            maxLength={50}
            className="border-gray-300 dark:border-gray-600"
          />
        </div>

        {/* Target Age */}
        <div className="space-y-2">
          <Label htmlFor="targetAge" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Who is your ideal customer?
          </Label>
          <Select value={answers.targetAge} onValueChange={(value) => setAnswers(prev => ({ ...prev, targetAge: value }))}>
            <SelectTrigger data-testid="select-target-age">
              <SelectValue placeholder="Choose age group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="18-24">Young Adults (18-24)</SelectItem>
              <SelectItem value="25-34">Millennials (25-34)</SelectItem>
              <SelectItem value="35-44">Gen X (35-44)</SelectItem>
              <SelectItem value="45-54">Middle Age (45-54)</SelectItem>
              <SelectItem value="55+">Older Adults (55+)</SelectItem>
              <SelectItem value="all">All Ages</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <Label htmlFor="budget" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            What's your monthly ad budget?
          </Label>
          <Select value={answers.budget} onValueChange={(value) => setAnswers(prev => ({ ...prev, budget: value }))}>
            <SelectTrigger data-testid="select-budget">
              <SelectValue placeholder="Choose budget range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under-500">Under $500</SelectItem>
              <SelectItem value="500-1000">$500 - $1,000</SelectItem>
              <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
              <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
              <SelectItem value="over-10000">Over $10,000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Goal */}
        <div className="space-y-2">
          <Label htmlFor="goal" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            What's your main goal?
          </Label>
          <Select value={answers.goal} onValueChange={(value) => setAnswers(prev => ({ ...prev, goal: value }))}>
            <SelectTrigger data-testid="select-goal">
              <SelectValue placeholder="Choose campaign goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="awareness">Brand Awareness</SelectItem>
              <SelectItem value="traffic">Website Traffic</SelectItem>
              <SelectItem value="leads">Lead Generation</SelectItem>
              <SelectItem value="sales">Direct Sales</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleSubmit}
          disabled={!isComplete || isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3"
          data-testid="button-generate-strategy"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Generating Strategy...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Generate AI Strategy
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}