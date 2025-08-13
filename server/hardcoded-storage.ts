import { TARGETING_CATEGORIES, CATEGORY_STATS } from '../shared/targeting-categories';
import type { TargetingCategory as HardcodedTargetingCategory } from '../shared/targeting-categories';
import type { 
  User, 
  InsertUser, 
  TargetingCategory,
  InsertTargetingCategory,
  Recommendation, 
  InsertRecommendation 
} from '@shared/schema';
import type { IStorage } from './storage';

/**
 * HARDCODED STORAGE IMPLEMENTATION
 * Uses the complete authentic Meta targeting categories dataset
 */
export class HardcodedStorage implements IStorage {
  private categories: HardcodedTargetingCategory[] = TARGETING_CATEGORIES;
  private users: User[] = [];
  private recommendations: Recommendation[] = [];

  // User methods (minimal implementation for auth)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async createUser(data: InsertUser): Promise<User> {
    const user: User = {
      id: `user_${Date.now()}`,
      username: data.username,
      password: data.password
    };
    this.users.push(user);
    return user;
  }

  // Targeting category methods - convert hardcoded to schema format
  private convertToSchemaFormat(hardcodedCategory: HardcodedTargetingCategory): TargetingCategory {
    return {
      id: hardcodedCategory.id,
      name: hardcodedCategory.name,
      parentId: hardcodedCategory.parentId,
      level: hardcodedCategory.level,
      size: hardcodedCategory.size,
      categoryType: hardcodedCategory.categoryType,
      createdAt: new Date()
    };
  }

  async getTargetingCategory(id: string): Promise<TargetingCategory | undefined> {
    const category = this.categories.find(cat => cat.id === id);
    return category ? this.convertToSchemaFormat(category) : undefined;
  }

  async getTargetingCategoriesByParent(parentId: string | null): Promise<TargetingCategory[]> {
    return this.categories
      .filter(cat => cat.parentId === parentId)
      .map(cat => this.convertToSchemaFormat(cat));
  }

  async searchTargetingCategories(query: string): Promise<TargetingCategory[]> {
    const searchTerm = query.toLowerCase();
    return this.categories
      .filter(cat => 
        cat.name.toLowerCase().includes(searchTerm) ||
        cat.categoryType.toLowerCase().includes(searchTerm)
      )
      .map(cat => this.convertToSchemaFormat(cat));
  }

  async getAllTargetingCategories(): Promise<TargetingCategory[]> {
    console.log(`📊 Returning ${this.categories.length} hardcoded targeting categories`);
    return this.categories.map(cat => this.convertToSchemaFormat(cat));
  }

  async listTargetingCategories(): Promise<TargetingCategory[]> {
    return this.getAllTargetingCategories();
  }

  async createTargetingCategory(data: InsertTargetingCategory): Promise<TargetingCategory> {
    throw new Error('Cannot create categories in hardcoded storage. Data is read-only.');
  }

  // Recommendation methods
  async createRecommendation(data: InsertRecommendation): Promise<Recommendation> {
    const recommendation: Recommendation = {
      id: `rec_${Date.now()}`,
      ...data,
      budgetRange: data.budgetRange ?? null,
      geographicFocus: data.geographicFocus ?? null,
      campaignGoal: data.campaignGoal ?? null,
      createdAt: new Date()
    };
    this.recommendations.push(recommendation);
    return recommendation;
  }

  async getRecommendationsByUser(userId?: string): Promise<Recommendation[]> {
    if (userId) {
      return this.recommendations.filter(r => r.userInput === userId); // Using userInput as identifier
    }
    return this.recommendations.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  // Utility methods for hardcoded data
  getStatistics() {
    return CATEGORY_STATS;
  }

  getCategoriesByType(type: 'interests' | 'behaviors' | 'demographics'): HardcodedTargetingCategory[] {
    return this.categories.filter(cat => cat.categoryType === type);
  }

  getCategoriesByLevel(level: number): HardcodedTargetingCategory[] {
    return this.categories.filter(cat => cat.level === level);
  }

  searchCategories(query: string): HardcodedTargetingCategory[] {
    const searchTerm = query.toLowerCase();
    return this.categories.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm) ||
      cat.categoryType.toLowerCase().includes(searchTerm)
    );
  }

  buildHierarchy(): any[] {
    console.log(`Building hierarchy from ${this.categories.length} categories`);
    
    const categoryMap = new Map<string, any>();
    const rootCategories: any[] = [];
    const processedIds = new Set<string>();

    // Create category objects with children arrays
    this.categories.forEach(cat => {
      if (!processedIds.has(cat.id)) {
        categoryMap.set(cat.id, {
          ...cat,
          children: []
        });
        processedIds.add(cat.id);
      }
    });

    // Build parent-child relationships with cycle prevention
    this.categories.forEach(cat => {
      if (!categoryMap.has(cat.id)) return;
      
      const categoryWithChildren = categoryMap.get(cat.id)!;
      
      if (cat.parentId && categoryMap.has(cat.parentId) && cat.parentId !== cat.id) {
        const parent = categoryMap.get(cat.parentId)!;
        
        // Check for circular reference
        let currentParent = parent;
        let isCircular = false;
        const visitedIds = new Set([cat.id]);
        
        while (currentParent && currentParent.parentId && visitedIds.size < 10) {
          if (visitedIds.has(currentParent.id)) {
            isCircular = true;
            break;
          }
          visitedIds.add(currentParent.id);
          currentParent = categoryMap.get(currentParent.parentId) || null;
        }
        
        if (!isCircular) {
          // Avoid duplicate children
          const isDuplicate = parent.children.some((child: any) => child.id === categoryWithChildren.id);
          if (!isDuplicate) {
            parent.children.push(categoryWithChildren);
          }
        } else {
          console.warn(`Circular reference prevented for ${cat.id} -> ${cat.parentId}`);
          rootCategories.push(categoryWithChildren);
        }
      } else if (!cat.parentId || cat.parentId === cat.id) {
        // Only add level 1 categories as roots
        if (cat.level === 1) {
          rootCategories.push(categoryWithChildren);
        } else {
          console.warn(`Orphaned category (level ${cat.level}): ${cat.name} (${cat.id})`);
        }
      }
    });

    // Sort root categories by level then name
    rootCategories.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.name.localeCompare(b.name);
    });

    // Sort children recursively
    const sortChildren = (category: any) => {
      if (category.children && category.children.length > 0) {
        category.children.sort((a: any, b: any) => {
          if (a.level !== b.level) return a.level - b.level;
          return a.name.localeCompare(b.name);
        });
        category.children.forEach(sortChildren);
      }
    };

    rootCategories.forEach(sortChildren);

    console.log(`Built hierarchy with ${rootCategories.length} root categories`);
    rootCategories.forEach(root => {
      console.log(`  - ${root.name} (Level ${root.level}, ${root.children.length} children)`);
    });

    return rootCategories;
  }
}