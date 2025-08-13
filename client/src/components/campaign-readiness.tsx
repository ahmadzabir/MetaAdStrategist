import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  DollarSign, 
  Eye, 
  Target, 
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Download
} from "lucide-react";

interface CampaignReadinessProps {
  selectedCategories: string[];
  recommendations: any[];
}

export function CampaignReadiness({ selectedCategories, recommendations }: CampaignReadinessProps) {
  // Calculate readiness score based on selections and recommendations
  const calculateReadinessScore = () => {
    let score = 0;
    if (selectedCategories.length >= 2) score += 30;
    if (selectedCategories.length >= 4) score += 20;
    if (recommendations.length > 0) score += 25;
    if (selectedCategories.some(cat => recommendations.find(rec => rec.id === cat))) score += 25;
    return Math.min(score, 100);
  };

  const readinessScore = calculateReadinessScore();
  
  // Estimate total audience size
  const totalAudienceSize = selectedCategories.length > 0 ? "45M-120M" : "Select categories to estimate";
  
  // Estimate CPM range based on selected categories
  const estimatedCPM = selectedCategories.length > 0 ? "$2.80-$5.40" : "--";
  
  // Estimate CTR range
  const estimatedCTR = selectedCategories.length > 0 ? "2.1-4.3%" : "--";
  
  // Suggest ad formats based on targeting profile
  const suggestedFormats = selectedCategories.length > 0 
    ? ["Carousel", "Video", "Collection"]
    : ["Select targeting to see suggestions"];

  const getReadinessColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getReadinessIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    return <AlertCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-blue-200 dark:border-blue-800 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">Campaign Readiness</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-normal">
              Live campaign metrics and optimization suggestions
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Readiness Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getReadinessIcon(readinessScore)}
              <span className={`font-semibold ${getReadinessColor(readinessScore)}`}>
                Campaign Readiness: {readinessScore}%
              </span>
            </div>
            <Badge variant={readinessScore >= 80 ? "default" : readinessScore >= 60 ? "secondary" : "destructive"}>
              {readinessScore >= 80 ? "Ready to Launch" : readinessScore >= 60 ? "Needs Optimization" : "Incomplete Setup"}
            </Badge>
          </div>
          <Progress value={readinessScore} className="h-2" />
        </div>

        <Separator />

        {/* Campaign Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Users className="h-4 w-4" />
              <span>Audience Size</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {totalAudienceSize}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <DollarSign className="h-4 w-4" />
              <span>Estimated CPM</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {estimatedCPM}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <TrendingUp className="h-4 w-4" />
              <span>Estimated CTR</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {estimatedCTR}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <BarChart3 className="h-4 w-4" />
              <span>Categories Selected</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedCategories.length}
            </div>
          </div>
        </div>

        <Separator />

        {/* Suggested Ad Formats */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Eye className="h-4 w-4" />
            <span>Suggested Ad Formats</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedFormats.map((format, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {format}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button 
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            disabled={readinessScore < 60}
            data-testid="save-targeting-set"
          >
            <Download className="h-4 w-4 mr-2" />
            Save Targeting Set
          </Button>
          
          {readinessScore < 80 && (
            <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
              Add more targeting categories or follow AI recommendations to improve readiness score
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}