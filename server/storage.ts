import { 
  type User, 
  type InsertUser, 
  type TargetingCategory, 
  type InsertTargetingCategory,
  type Recommendation,
  type InsertRecommendation
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Targeting categories
  getTargetingCategory(id: string): Promise<TargetingCategory | undefined>;
  getTargetingCategoriesByParent(parentId: string | null): Promise<TargetingCategory[]>;
  searchTargetingCategories(query: string): Promise<TargetingCategory[]>;
  getAllTargetingCategories(): Promise<TargetingCategory[]>;
  createTargetingCategory(category: InsertTargetingCategory): Promise<TargetingCategory>;
  
  // Recommendations
  createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation>;
  getRecommendationsByUser(userId?: string): Promise<Recommendation[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private targetingCategories: Map<string, TargetingCategory>;
  private recommendations: Map<string, Recommendation>;

  constructor() {
    this.users = new Map();
    this.targetingCategories = new Map();
    this.recommendations = new Map();
    
    // Initialize with sample targeting data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleCategories: TargetingCategory[] = [
      // Top level categories
      {
        id: "interests",
        name: "Interests",
        parentId: null,
        level: 0,
        size: "2.8B",
        categoryType: "interests",
        createdAt: new Date(),
      },
      {
        id: "behaviors",
        name: "Behaviors",
        parentId: null,
        level: 0,
        size: "2.1B",
        categoryType: "behaviors",
        createdAt: new Date(),
      },
      {
        id: "demographics",
        name: "Demographics",
        parentId: null,
        level: 0,
        size: "2.9B",
        categoryType: "demographics",
        createdAt: new Date(),
      },
      
      // Interests subcategories
      {
        id: "interests-fitness_and_wellness",
        name: "Fitness and wellness",
        parentId: "interests",
        level: 1,
        size: "156M",
        categoryType: "interests",
        createdAt: new Date(),
      },
      {
        id: "interests-shopping_and_fashion",
        name: "Shopping and fashion",
        parentId: "interests",
        level: 1,
        size: "890M",
        categoryType: "interests",
        createdAt: new Date(),
      },
      
      // Fitness subcategories
      {
        id: "interests-fitness_and_wellness-yoga",
        name: "Yoga",
        parentId: "interests-fitness_and_wellness",
        level: 2,
        size: "2.3M",
        categoryType: "interests",
        createdAt: new Date(),
      },
      {
        id: "interests-fitness_and_wellness-physical_fitness",
        name: "Physical fitness",
        parentId: "interests-fitness_and_wellness",
        level: 2,
        size: "45M",
        categoryType: "interests",
        createdAt: new Date(),
      },
      {
        id: "interests-fitness_and_wellness-weight_training",
        name: "Weight training",
        parentId: "interests-fitness_and_wellness",
        level: 2,
        size: "12M",
        categoryType: "interests",
        createdAt: new Date(),
      },
      
      // Shopping subcategories
      {
        id: "interests-shopping_and_fashion-luxury_goods_retail",
        name: "Luxury goods retail",
        parentId: "interests-shopping_and_fashion",
        level: 2,
        size: "890K",
        categoryType: "interests",
        createdAt: new Date(),
      },
      {
        id: "interests-shopping_and_fashion-clothing_apparel",
        name: "Clothing (apparel)",
        parentId: "interests-shopping_and_fashion",
        level: 2,
        size: "450M",
        categoryType: "interests",
        createdAt: new Date(),
      },
      
      // Behaviors
      {
        id: "behaviors-purchase_behavior",
        name: "Purchase behavior",
        parentId: "behaviors",
        level: 1,
        size: "1.8B",
        categoryType: "behaviors",
        createdAt: new Date(),
      },
      {
        id: "behaviors-purchase_behavior-engaged_shoppers",
        name: "Engaged Shoppers",
        parentId: "behaviors-purchase_behavior",
        level: 2,
        size: "1.8M",
        categoryType: "behaviors",
        createdAt: new Date(),
      },
    ];

    sampleCategories.forEach(category => {
      this.targetingCategories.set(category.id, category);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTargetingCategory(id: string): Promise<TargetingCategory | undefined> {
    return this.targetingCategories.get(id);
  }

  async getTargetingCategoriesByParent(parentId: string | null): Promise<TargetingCategory[]> {
    return Array.from(this.targetingCategories.values()).filter(
      category => category.parentId === parentId
    );
  }

  async searchTargetingCategories(query: string): Promise<TargetingCategory[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.targetingCategories.values()).filter(
      category => category.name.toLowerCase().includes(lowerQuery)
    );
  }

  async getAllTargetingCategories(): Promise<TargetingCategory[]> {
    return Array.from(this.targetingCategories.values());
  }

  async createTargetingCategory(category: InsertTargetingCategory): Promise<TargetingCategory> {
    const newCategory: TargetingCategory = {
      ...category,
      size: category.size ?? null,
      parentId: category.parentId ?? null,
      createdAt: new Date(),
    };
    this.targetingCategories.set(category.id, newCategory);
    return newCategory;
  }

  async createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation> {
    const id = randomUUID();
    const newRec: Recommendation = {
      ...recommendation,
      budgetRange: recommendation.budgetRange ?? null,
      geographicFocus: recommendation.geographicFocus ?? null,
      campaignGoal: recommendation.campaignGoal ?? null,
      id,
      createdAt: new Date(),
    };
    this.recommendations.set(id, newRec);
    return newRec;
  }

  async getRecommendationsByUser(userId?: string): Promise<Recommendation[]> {
    // For now, return all recommendations since we don't have user association
    return Array.from(this.recommendations.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }
}

export const storage = new MemStorage();
