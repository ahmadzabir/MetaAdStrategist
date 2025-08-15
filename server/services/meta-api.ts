import type { MetaReachEstimate, MetaTargetingSpec, MetaTargetingCategory } from "@shared/schema";

/**
 * Meta Marketing API Service
 * Integrates with Meta's Marketing API for real-time targeting data and audience estimates
 */

const META_API_VERSION = "v23.0";
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

interface MetaApiConfig {
  accessToken: string;
  adAccountId: string;
}

export class MetaApiService {
  private config: MetaApiConfig;

  constructor(accessToken: string, adAccountId: string) {
    this.config = {
      accessToken,
      adAccountId: adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`
    };
  }

  /**
   * Get real-time audience reach estimate for targeting specs
   * Critical for Venn diagram visualization and live audience sizing
   */
  async getReachEstimate(targetingSpec: MetaTargetingSpec): Promise<MetaReachEstimate> {
    const url = `${META_BASE_URL}/${this.config.adAccountId}/reachestimate`;
    
    const params = new URLSearchParams({
      targeting_spec: JSON.stringify(targetingSpec),
      optimize_for: 'IMPRESSIONS',
      access_token: this.config.accessToken
    });

    try {
      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Meta API Error: ${error.error?.message || 'Failed to get reach estimate'}`);
      }

      const data = await response.json();
      
      return {
        users: data.data?.users || 0,
        dailyBudgetMin: data.data?.bid_estimations?.[0]?.min_daily_budget,
        dailyBudgetMax: data.data?.bid_estimations?.[0]?.max_daily_budget,
        targeting_spec: targetingSpec
      };
    } catch (error) {
      console.error('Meta Reach Estimate API Error:', error);
      throw error;
    }
  }

  /**
   * Search targeting categories with autocomplete
   * Replaces static category data with live Meta data
   */
  async searchTargeting(
    query: string, 
    type: 'interests' | 'behaviors' | 'demographics' | 'adTargetingCategory' = 'adTargetingCategory',
    categoryClass?: string,
    limit: number = 25
  ): Promise<MetaTargetingCategory[]> {
    const url = `${META_BASE_URL}/search`;
    
    const params = new URLSearchParams({
      type,
      q: query,
      limit: limit.toString(),
      access_token: this.config.accessToken
    });

    if (categoryClass) {
      params.append('class', categoryClass);
    }

    try {
      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Meta API Error: ${error.error?.message || 'Failed to search targeting'}`);
      }

      const data = await response.json();
      
      return data.data?.map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type || type,
        description: item.description,
        audience_size: item.audience_size_lower_bound || item.audience_size,
        path: item.path
      })) || [];
    } catch (error) {
      console.error('Meta Targeting Search API Error:', error);
      throw error;
    }
  }

  /**
   * Get geographic location data for targeting
   */
  async searchLocations(
    query: string,
    locationTypes: string[] = ['country', 'region', 'city'],
    limit: number = 25
  ): Promise<any[]> {
    const url = `${META_BASE_URL}/search`;
    
    const params = new URLSearchParams({
      type: 'adgeolocation',
      location_types: JSON.stringify(locationTypes),
      q: query,
      limit: limit.toString(),
      access_token: this.config.accessToken
    });

    try {
      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Meta API Error: ${error.error?.message || 'Failed to search locations'}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Meta Location Search API Error:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about specific targeting categories
   */
  async getTargetingDetails(targetingIds: string[]): Promise<MetaTargetingCategory[]> {
    if (targetingIds.length === 0) return [];

    const url = `${META_BASE_URL}/search`;
    
    const params = new URLSearchParams({
      type: 'adTargetingCategory',
      targeting_list: JSON.stringify(targetingIds),
      access_token: this.config.accessToken
    });

    try {
      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Meta API Error: ${error.error?.message || 'Failed to get targeting details'}`);
      }

      const data = await response.json();
      
      return data.data?.map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        description: item.description,
        audience_size: item.audience_size_lower_bound || item.audience_size,
        path: item.path
      })) || [];
    } catch (error) {
      console.error('Meta Targeting Details API Error:', error);
      throw error;
    }
  }

  /**
   * Convert our strategic targeting groups to Meta's flexible_spec format
   */
  buildMetaTargetingSpec(
    strategicTargeting: import("@shared/schema").StrategicTargeting,
    geoLocations?: MetaTargetingSpec['geo_locations'],
    ageMin?: number,
    ageMax?: number,
    genders?: number[]
  ): MetaTargetingSpec {
    const spec: MetaTargetingSpec = {};

    // Add basic targeting
    if (geoLocations) spec.geo_locations = geoLocations;
    if (ageMin) spec.age_min = ageMin;
    if (ageMax) spec.age_max = ageMax;
    if (genders) spec.genders = genders;

    // Convert strategic groups to flexible_spec
    if (strategicTargeting.groups.length > 0) {
      spec.flexible_spec = strategicTargeting.groups.map(group => {
        const flexSpec: any = {};
        
        // Group categories by type
        const interests = group.categories.filter(c => c.categoryType === 'interests');
        const behaviors = group.categories.filter(c => c.categoryType === 'behaviors');
        const demographics = group.categories.filter(c => c.categoryType === 'demographics');

        if (interests.length > 0) {
          flexSpec.interests = interests.map(c => ({ id: c.id, name: c.name }));
        }
        if (behaviors.length > 0) {
          flexSpec.behaviors = behaviors.map(c => ({ id: c.id, name: c.name }));
        }
        if (demographics.length > 0) {
          flexSpec.demographics = demographics.map(c => ({ id: c.id, name: c.name }));
        }

        return flexSpec;
      });
    }

    return spec;
  }
}

// Singleton service instance (will be configured with user's API credentials)
let metaApiService: MetaApiService | null = null;

export function initializeMetaApi(accessToken: string, adAccountId: string): MetaApiService {
  metaApiService = new MetaApiService(accessToken, adAccountId);
  return metaApiService;
}

export function getMetaApiService(): MetaApiService | null {
  return metaApiService;
}

// Default export for backwards compatibility
export default MetaApiService;