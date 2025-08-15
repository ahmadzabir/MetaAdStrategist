import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-factory";
import { generateRecommendationSchema } from "@shared/schema";
import { generateTargetingRecommendations } from "./services/gemini";
import { FirebaseStorage } from "./services/firebase";
import { flattenMetaData, validateMetaData, type MetaTargetingItem } from "./utils/data-processor";
import { strategicAiService } from "./services/strategic-ai";
import { getMetaApiService } from "./services/meta-api";
import type { BusinessDiscovery, ConversationContext, MetaTargetingSpec } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Generate AI recommendations
  app.post("/api/recommendations/generate", async (req, res) => {
    try {
      const validatedData = generateRecommendationSchema.parse(req.body);
      
      // Handle both structured and legacy input
      let recommendations;
      if (validatedData.businessType && validatedData.productService) {
        // New structured format
        recommendations = await generateTargetingRecommendations({
          businessType: validatedData.businessType,
          productService: validatedData.productService,
          targetAge: validatedData.targetAge || "",
          budget: validatedData.budget || "",
          goal: validatedData.goal || ""
        });
      } else if (validatedData.userInput) {
        // Legacy format
        recommendations = await generateTargetingRecommendations(
          validatedData.userInput,
          validatedData.budgetRange,
          validatedData.geographicFocus,
          validatedData.campaignGoal
        );
      } else {
        throw new Error("Please provide either structured questionnaire data or a user description");
      }

      // Save the recommendation to storage
      const savedRecommendation = await storage.createRecommendation({
        userInput: validatedData.userInput || `${validatedData.businessType}: ${validatedData.productService}`,
        budgetRange: validatedData.budgetRange || validatedData.budget,
        geographicFocus: validatedData.geographicFocus,
        campaignGoal: validatedData.campaignGoal || validatedData.goal,
        recommendations: recommendations,
      });

      res.json({
        id: savedRecommendation.id,
        recommendations,
        createdAt: savedRecommendation.createdAt,
      });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      
      // Handle validation errors specifically
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Please provide a description of your product or target audience"
        });
      }
      
      res.status(500).json({ 
        message: "Failed to generate AI strategy. Please try again."
      });
    }
  });

  // Get targeting categories
  app.get("/api/targeting-categories", async (req, res) => {
    try {
      const { parent, search } = req.query;
      
      let categories;
      if (search && typeof search === 'string') {
        categories = await storage.searchTargetingCategories(search);
      } else if (parent !== undefined) {
        const parentId = parent === 'null' || parent === '' ? null : String(parent);
        categories = await storage.getTargetingCategoriesByParent(parentId);
      } else {
        categories = await storage.getAllTargetingCategories();
      }

      res.json({
        success: true,
        categories: categories,
        count: categories.length
      });
    } catch (error) {
      console.error("Error fetching targeting categories:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch targeting categories" 
      });
    }
  });

  // Get hierarchical targeting categories for tree display
  app.get("/api/targeting-categories/hierarchical", async (req, res) => {
    try {
      let hierarchicalCategories;
      if (storage instanceof FirebaseStorage) {
        hierarchicalCategories = await storage.getHierarchicalTargetingCategories();
      } else {
        // Use buildHierarchy method for HardcodedStorage
        hierarchicalCategories = (storage as any).buildHierarchy();
      }

      res.json({
        success: true,
        categories: hierarchicalCategories,
        count: hierarchicalCategories.length
      });
    } catch (error) {
      console.error("Error in hierarchical route:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch hierarchical targeting categories" 
      });
    }
  });

  // Get specific targeting category
  app.get("/api/targeting-categories/:id", async (req, res) => {
    try {
      const category = await storage.getTargetingCategory(req.params.id);
      
      if (!category) {
        return res.status(404).json({ message: "Targeting category not found" });
      }

      res.json(category);
    } catch (error) {
      console.error("Error fetching targeting category:", error);
      res.status(500).json({ message: "Failed to fetch targeting category" });
    }
  });

  // Get recommendation history
  app.get("/api/recommendations", async (req, res) => {
    try {
      const recommendations = await storage.getRecommendationsByUser();
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Process and upload Meta targeting data to Firebase
  app.post("/api/targeting-categories/upload-meta-data", async (req, res) => {
    try {
      const rawData = req.body;
      
      if (!validateMetaData(rawData)) {
        return res.status(400).json({ message: "Invalid Meta targeting data format" });
      }

      const flattened = flattenMetaData(rawData as MetaTargetingItem[]);
      const firebaseStorage = new FirebaseStorage();
      
      // Upload to Firebase
      await firebaseStorage.bulkInsertTargetingCategories(flattened);
      
      res.json({ 
        message: `Successfully processed and uploaded ${flattened.length} targeting categories to Firebase`,
        count: flattened.length,
        categories: flattened.slice(0, 5) // Show first 5 as preview
      });
    } catch (error) {
      console.error("Error processing Meta data:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to process Meta targeting data" 
      });
    }
  });

  // Legacy bulk upload endpoint for simple arrays
  app.post("/api/targeting-categories/bulk-upload", async (req, res) => {
    try {
      const { categories } = req.body;
      
      if (!categories || !Array.isArray(categories)) {
        return res.status(400).json({ message: "Please provide categories as an array" });
      }

      const firebaseStorage = new FirebaseStorage();
      await firebaseStorage.bulkInsertTargetingCategories(categories);
      
      res.json({ 
        message: `Successfully uploaded ${categories.length} targeting categories to Firebase`,
        count: categories.length 
      });
    } catch (error) {
      console.error("Error bulk uploading to Firebase:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to upload categories to Firebase" 
      });
    }
  });

  // Switch to Firebase storage
  app.post("/api/storage/switch-to-firebase", async (req, res) => {
    try {
      // This would switch the storage implementation to Firebase
      res.json({ message: "Firebase storage integration ready" });
    } catch (error) {
      console.error("Error switching to Firebase:", error);
      res.status(500).json({ message: "Failed to switch to Firebase storage" });
    }
  });

  // Strategic AI Targeting Routes

  // Generate strategic targeting groups from business discovery
  app.post("/api/strategic/generate-targeting", async (req, res) => {
    try {
      const { discovery }: { discovery: BusinessDiscovery } = req.body;
      
      if (!discovery) {
        return res.status(400).json({ message: "Business discovery data required" });
      }

      const strategicTargeting = await strategicAiService.generateStrategicTargeting(discovery);
      
      res.json({
        success: true,
        strategicTargeting,
        message: "Strategic targeting groups generated successfully"
      });
    } catch (error) {
      console.error("Error generating strategic targeting:", error);
      res.status(500).json({ 
        message: "Failed to generate strategic targeting. Please try again." 
      });
    }
  });

  // Generate conversational recommendations
  app.post("/api/strategic/conversation", async (req, res) => {
    try {
      const { context, userMessage }: { context: ConversationContext; userMessage: string } = req.body;
      
      if (!context || !userMessage) {
        return res.status(400).json({ message: "Conversation context and user message required" });
      }

      const recommendations = await strategicAiService.generateConversationalRecommendations(context, userMessage);
      
      res.json({
        success: true,
        recommendations,
        message: "Conversational recommendations generated"
      });
    } catch (error) {
      console.error("Error generating conversational recommendations:", error);
      res.status(500).json({ 
        message: "Failed to generate recommendations. Please try again." 
      });
    }
  });

  // Generate strategic discovery questions
  app.post("/api/strategic/discovery-questions", async (req, res) => {
    try {
      const { discovery }: { discovery: Partial<BusinessDiscovery> } = req.body;
      
      const questions = await strategicAiService.generateDiscoveryQuestions(discovery || {});
      
      res.json({
        success: true,
        questions,
        message: "Discovery questions generated"
      });
    } catch (error) {
      console.error("Error generating discovery questions:", error);
      res.status(500).json({ 
        message: "Failed to generate discovery questions. Please try again." 
      });
    }
  });

  // Meta API Integration Routes

  // Get real-time audience reach estimate
  app.post("/api/meta/reach-estimate", async (req, res) => {
    try {
      const { targetingSpec }: { targetingSpec: MetaTargetingSpec } = req.body;
      
      const metaApi = getMetaApiService();
      if (!metaApi) {
        return res.status(400).json({ 
          message: "Meta API not configured. Please provide API credentials." 
        });
      }

      const reachEstimate = await metaApi.getReachEstimate(targetingSpec);
      
      res.json({
        success: true,
        reachEstimate,
        message: "Reach estimate retrieved successfully"
      });
    } catch (error) {
      console.error("Error getting reach estimate:", error);
      res.status(500).json({ 
        message: "Failed to get audience reach estimate. Please check your Meta API credentials." 
      });
    }
  });

  // Enhanced Meta targeting search with hierarchical breadcrumbs
  app.get("/api/meta/search-targeting", async (req, res) => {
    try {
      const { q, type, class: categoryClass, limit } = req.query;
      
      const metaApi = getMetaApiService();
      if (!metaApi) {
        // Fallback to local storage if Meta API not configured
        const categories = await storage.searchTargetingCategories(q as string || "");
        return res.json({
          success: true,
          categories: categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            type: cat.categoryType,
            description: `Level ${cat.level} ${cat.categoryType}`,
            audience_size: cat.size ? parseInt(cat.size.replace(/[^\d]/g, '')) || null : null,
            path: getBreadcrumbPath(cat, categories),
            level: cat.level,
            parentId: cat.parentId
          })),
          total: categories.length,
          source: "local"
        });
      }

      const categories = await metaApi.searchTargeting(
        q as string || "",
        type as any || "adTargetingCategory",
        categoryClass as string,
        parseInt(limit as string) || 25
      );
      
      // Enhance categories with breadcrumb paths
      const enhancedCategories = categories.map(cat => ({
        ...cat,
        breadcrumbs: cat.path || [],
        level: cat.path ? cat.path.length : 1,
        audience_size_display: cat.audience_size ? 
          formatAudienceSize(cat.audience_size) : null
      }));
      
      res.json({
        success: true,
        categories: enhancedCategories,
        total: categories.length,
        source: "meta_api"
      });
    } catch (error) {
      console.error("Error searching Meta targeting:", error);
      // Fallback to local search on error
      try {
        const searchQuery = req.query.q as string || "";
        const categories = await storage.searchTargetingCategories(searchQuery);
        res.json({
          success: true,
          categories: categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            type: cat.categoryType,
            description: `Level ${cat.level} ${cat.categoryType}`,
            audience_size: cat.size ? parseInt(cat.size.replace(/[^\d]/g, '')) || null : null,
            path: getBreadcrumbPath(cat, categories),
            level: cat.level,
            parentId: cat.parentId
          })),
          total: categories.length,
          source: "local_fallback"
        });
      } catch (fallbackError) {
        res.status(500).json({ 
          message: "Failed to search targeting categories." 
        });
      }
    }
  });

  // Search Meta locations
  app.get("/api/meta/search-locations", async (req, res) => {
    try {
      const { q, location_types, limit } = req.query;
      
      const metaApi = getMetaApiService();
      if (!metaApi) {
        return res.status(400).json({ 
          message: "Meta API not configured. Please provide API credentials." 
        });
      }

      const locationTypes = location_types ? JSON.parse(location_types as string) : ['country', 'region', 'city'];
      const locations = await metaApi.searchLocations(
        q as string || "",
        locationTypes,
        parseInt(limit as string) || 25
      );
      
      res.json({
        success: true,
        locations,
        total: locations.length
      });
    } catch (error) {
      console.error("Error searching Meta locations:", error);
      res.status(500).json({ 
        message: "Failed to search locations. Please check your Meta API credentials." 
      });
    }
  });

  // Configure Meta API credentials
  app.post("/api/meta/configure", async (req, res) => {
    try {
      const { accessToken, adAccountId } = req.body;
      
      if (!accessToken || !adAccountId) {
        return res.status(400).json({ 
          message: "Access token and ad account ID are required" 
        });
      }

      // Initialize Meta API service with user credentials
      const metaApi = require("./services/meta-api").initializeMetaApi(accessToken, adAccountId);
      
      // Test the connection by getting account info
      await metaApi.searchTargeting("test", "adTargetingCategory", undefined, 1);
      
      res.json({
        success: true,
        message: "Meta API configured successfully"
      });
    } catch (error) {
      console.error("Error configuring Meta API:", error);
      res.status(400).json({ 
        message: "Failed to configure Meta API. Please check your credentials." 
      });
    }
  });

  // Helper functions for enhanced search
  
  /**
   * Get breadcrumb path for a targeting category
   */
  function getBreadcrumbPath(category: any, allCategories: any[]): string[] {
    const path: string[] = [];
    let current = category;
    
    while (current) {
      path.unshift(current.name);
      if (!current.parentId) break;
      
      current = allCategories.find(cat => cat.id === current.parentId);
      if (!current) break;
    }
    
    return path;
  }
  
  /**
   * Format audience size for display
   */
  function formatAudienceSize(size: number): string {
    if (size >= 1000000000) {
      return `${(size / 1000000000).toFixed(1)}B`;
    } else if (size >= 1000000) {
      return `${(size / 1000000).toFixed(1)}M`;
    } else if (size >= 1000) {
      return `${(size / 1000).toFixed(1)}K`;
    }
    return size.toString();
  }

  const httpServer = createServer(app);
  return httpServer;
}
