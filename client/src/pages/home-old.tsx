import { useState } from "react";
import Header from "@/components/header";
import AIStrategyGenerator from "@/components/ai-strategy-generator";
import RecommendationsPanel from "@/components/recommendations-panel";
import TargetingExplorer from "@/components/targeting-explorer";
import type { TargetingRecommendation } from "@shared/schema";

export default function Home() {
  const [recommendations, setRecommendations] = useState<TargetingRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisTime, setAnalysisTime] = useState<Date | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleRecommendationsGenerated = (newRecommendations: TargetingRecommendation[]) => {
    setRecommendations(newRecommendations);
    setAnalysisTime(new Date());
  };

  const handleCategorySelect = (categoryId: string, selected: boolean) => {
    setSelectedCategories(prev => 
      selected 
        ? [...prev, categoryId]
        : prev.filter(id => id !== categoryId)
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-text-primary mb-3">
            Transform Your Meta Ads Strategy
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl">
            Describe your product or target audience in natural language, and our AI will recommend 
            the most effective Meta targeting options from our comprehensive database.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <AIStrategyGenerator 
              onRecommendationsGenerated={handleRecommendationsGenerated}
              isAnalyzing={isAnalyzing}
              setIsAnalyzing={setIsAnalyzing}
            />
            
            <RecommendationsPanel 
              recommendations={recommendations}
              analysisTime={analysisTime}
              isAnalyzing={isAnalyzing}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <TargetingExplorer 
              selectedCategories={selectedCategories}
              onCategorySelect={handleCategorySelect}
            />
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="mt-8 bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Quick Actions</h3>
              <p className="text-text-secondary text-sm">Common workflows and shortcuts</p>
            </div>
            <div className="flex space-x-3">
              <button 
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                data-testid="button-view-history"
              >
                <i className="fas fa-history text-text-secondary"></i>
                <span className="text-sm">View History</span>
              </button>
              <button 
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                data-testid="button-saved-strategies"
              >
                <i className="fas fa-bookmark text-text-secondary"></i>
                <span className="text-sm">Saved Strategies</span>
              </button>
              <button 
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                data-testid="button-export-data"
              >
                <i className="fas fa-file-export text-text-secondary"></i>
                <span className="text-sm">Export Data</span>
              </button>
              <button 
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all"
                data-testid="button-new-strategy"
              >
                <i className="fas fa-plus"></i>
                <span className="text-sm">New Strategy</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
