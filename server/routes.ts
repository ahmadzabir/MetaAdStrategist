import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-factory";
import { generateRecommendationSchema } from "@shared/schema";
import { generateTargetingRecommendations } from "./services/gemini";
import { FirebaseStorage } from "./services/firebase";
import { flattenMetaData, validateMetaData, type MetaTargetingItem } from "./utils/data-processor";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Generate AI recommendations
  app.post("/api/recommendations/generate", async (req, res) => {
    try {
      const validatedData = generateRecommendationSchema.parse(req.body);
      
      const recommendations = await generateTargetingRecommendations(
        validatedData.userInput,
        validatedData.budgetRange,
        validatedData.geographicFocus,
        validatedData.campaignGoal
      );

      // Save the recommendation to storage
      const savedRecommendation = await storage.createRecommendation({
        userInput: validatedData.userInput,
        budgetRange: validatedData.budgetRange,
        geographicFocus: validatedData.geographicFocus,
        campaignGoal: validatedData.campaignGoal,
        recommendations: recommendations,
      });

      res.json({
        id: savedRecommendation.id,
        recommendations,
        createdAt: savedRecommendation.createdAt,
      });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate recommendations" 
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

      res.json(categories);
    } catch (error) {
      console.error("Error fetching targeting categories:", error);
      res.status(500).json({ message: "Failed to fetch targeting categories" });
    }
  });

  // Get hierarchical targeting categories for tree display
  app.get("/api/targeting-categories/hierarchical", async (req, res) => {
    try {
      if (storage instanceof FirebaseStorage) {
        const hierarchicalCategories = await storage.getHierarchicalTargetingCategories();
        res.json(hierarchicalCategories);
      } else {
        // Fallback for non-Firebase storage
        const categories = await storage.getAllTargetingCategories();
        res.json(categories);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hierarchical targeting categories" });
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

  const httpServer = createServer(app);
  return httpServer;
}
