import type { TargetingRecommendation } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface RecommendationsPanelProps {
  recommendations: TargetingRecommendation[];
  analysisTime: Date | null;
  isAnalyzing: boolean;
}

export default function RecommendationsPanel({ 
  recommendations, 
  analysisTime, 
  isAnalyzing 
}: RecommendationsPanelProps) {
  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
            <i className="fas fa-lightbulb text-secondary"></i>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-text-primary">AI Recommendations</h3>
            <p className="text-text-secondary text-sm">Generating strategic targeting suggestions...</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-gray-200 rounded-full h-5 w-20"></div>
                    <div className="bg-gray-200 rounded h-4 w-24"></div>
                  </div>
                  <div className="bg-gray-200 rounded h-6 w-3/4 mb-2"></div>
                  <div className="bg-gray-200 rounded h-4 w-full mb-3"></div>
                  <div className="bg-gray-200 rounded h-4 w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
            <i className="fas fa-lightbulb text-secondary"></i>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-text-primary">AI Recommendations</h3>
            <p className="text-text-secondary text-sm">Strategic targeting suggestions will appear here</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-search text-gray-400 text-xl"></i>
          </div>
          <h4 className="text-lg font-medium text-text-primary mb-2">No recommendations yet</h4>
          <p className="text-text-secondary">
            Describe your product or service above to get AI-powered targeting recommendations.
          </p>
        </div>
      </div>
    );
  }

  const getPriorityConfig = (priority?: string) => {
    switch (priority) {
      case "high":
        return { label: "High Priority", className: "bg-primary/10 text-primary" };
      case "medium":
        return { label: "Medium Priority", className: "bg-accent/10 text-accent" };
      case "low":
        return { label: "Low Priority", className: "bg-secondary/10 text-secondary" };
      default:
        return { label: "Recommended", className: "bg-secondary/10 text-secondary" };
    }
  };

  const totalReach = recommendations
    .reduce((sum, rec) => {
      const size = rec.size?.replace(/[^0-9.]/g, '') || '0';
      const multiplier = rec.size?.includes('M') ? 1000000 : rec.size?.includes('K') ? 1000 : 1;
      return sum + (parseFloat(size) * multiplier);
    }, 0);

  const formatReach = (reach: number) => {
    if (reach >= 1000000) {
      return `${(reach / 1000000).toFixed(1)}M`;
    }
    if (reach >= 1000) {
      return `${(reach / 1000).toFixed(0)}K`;
    }
    return reach.toString();
  };

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
            <i className="fas fa-lightbulb text-secondary"></i>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-text-primary">AI Recommendations</h3>
            <p className="text-text-secondary text-sm">Strategic targeting suggestions based on your description</p>
          </div>
        </div>
        {analysisTime && (
          <div className="flex items-center space-x-2 text-sm text-text-secondary">
            <i className="fas fa-clock"></i>
            <span>Generated {Math.floor((Date.now() - analysisTime.getTime()) / 60000)} minutes ago</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {recommendations.map((recommendation, index) => {
          const priorityConfig = getPriorityConfig(recommendation.priority);
          
          return (
            <div 
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary/30 transition-all cursor-pointer hover:shadow-card-hover"
              data-testid={`card-recommendation-${index}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${priorityConfig.className}`}>
                      {priorityConfig.label}
                    </span>
                    <span className="text-xs text-text-secondary">
                      <i className="fas fa-users mr-1"></i>
                      <span data-testid={`text-reach-${index}`}>{recommendation.size}</span> potential reach
                    </span>
                  </div>
                  <h4 className="font-semibold text-text-primary mb-2" data-testid={`text-name-${index}`}>
                    {recommendation.name}
                  </h4>
                  <p className="text-text-secondary text-sm mb-3" data-testid={`text-justification-${index}`}>
                    {recommendation.justification}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-text-secondary">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {recommendation.categoryType || 'Interest'}
                    </span>
                    <span data-testid={`text-id-${index}`}>ID: {recommendation.id}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <button 
                    className="text-primary hover:bg-primary/5 p-2 rounded-lg transition-all"
                    data-testid={`button-add-${index}`}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                  <button 
                    className="text-text-secondary hover:bg-gray-100 p-2 rounded-lg transition-all"
                    data-testid={`button-info-${index}`}
                  >
                    <i className="fas fa-info-circle"></i>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-text-secondary">
            <span data-testid="text-options-count">
              <i className="fas fa-target mr-1"></i>
              {recommendations.length} targeting options
            </span>
            <span data-testid="text-total-reach">
              <i className="fas fa-users mr-1"></i>
              {formatReach(totalReach)} total potential reach
            </span>
            <span>
              <i className="fas fa-dollar-sign mr-1"></i>
              Est. CPM: $8-12
            </span>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="default"
              size="sm"
              className="bg-secondary text-white hover:bg-secondary/90"
              data-testid="button-export-strategy"
            >
              <i className="fas fa-download mr-2"></i>
              Export Strategy
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-primary text-primary hover:bg-primary/5"
              data-testid="button-launch-meta"
            >
              <i className="fas fa-external-link-alt mr-2"></i>
              Launch in Meta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
