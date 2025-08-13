import { apiRequest } from "@/lib/queryClient";
import type { 
  GenerateRecommendationRequest, 
  TargetingCategory, 
  TargetingRecommendation,
  Recommendation 
} from "@shared/schema";

export interface GenerateRecommendationResponse {
  id: string;
  recommendations: TargetingRecommendation[];
  createdAt: Date;
}

export const api = {
  // Generate AI recommendations
  generateRecommendations: async (data: GenerateRecommendationRequest): Promise<GenerateRecommendationResponse> => {
    const response = await apiRequest("POST", "/api/recommendations/generate", data);
    return response.json();
  },

  // Get targeting categories
  getTargetingCategories: async (params?: { parent?: string | null; search?: string }): Promise<TargetingCategory[]> => {
    const searchParams = new URLSearchParams();
    if (params?.parent !== undefined) {
      searchParams.set('parent', params.parent || 'null');
    }
    if (params?.search) {
      searchParams.set('search', params.search);
    }
    
    const url = `/api/targeting-categories${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await apiRequest("GET", url);
    return response.json();
  },

  // Get specific targeting category
  getTargetingCategory: async (id: string): Promise<TargetingCategory> => {
    const response = await apiRequest("GET", `/api/targeting-categories/${id}`);
    return response.json();
  },

  // Get recommendation history
  getRecommendations: async (): Promise<Recommendation[]> => {
    const response = await apiRequest("GET", "/api/recommendations");
    return response.json();
  },
};
