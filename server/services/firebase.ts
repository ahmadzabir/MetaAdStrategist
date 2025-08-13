import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, collection, addDoc, getDocs, query, where, doc, getDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { 
  type TargetingCategory, 
  type InsertTargetingCategory,
  type Recommendation,
  type InsertRecommendation 
} from "@shared/schema";

// Firebase configuration - these will be environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

let app: FirebaseApp;
let db: Firestore;

// Initialize Firebase
export function initializeFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } else {
    app = getApps()[0];
    db = getFirestore(app);
  }
  return { app, db };
}

// Firebase Storage Implementation
export class FirebaseStorage {
  private db: Firestore;

  constructor() {
    const { db: database } = initializeFirebase();
    this.db = database;
  }

  // Targeting Categories
  async getTargetingCategory(id: string): Promise<TargetingCategory | undefined> {
    try {
      const docRef = doc(this.db, "targeting_categories", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          parentId: data.parentId || null,
          level: data.level,
          size: data.size,
          categoryType: data.categoryType,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as TargetingCategory;
      }
      return undefined;
    } catch (error) {
      console.error("Error getting targeting category:", error);
      return undefined;
    }
  }

  async getTargetingCategoriesByParent(parentId: string | null): Promise<TargetingCategory[]> {
    try {
      const q = query(
        collection(this.db, "targeting_categories"),
        where("parentId", "==", parentId)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          parentId: data.parentId || null,
          level: data.level,
          size: data.size,
          categoryType: data.categoryType,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as TargetingCategory;
      });
    } catch (error) {
      console.error("Error getting targeting categories by parent:", error);
      return [];
    }
  }

  async searchTargetingCategories(searchQuery: string): Promise<TargetingCategory[]> {
    try {
      // Firestore doesn't support full-text search natively, so we'll get all and filter
      const querySnapshot = await getDocs(collection(this.db, "targeting_categories"));
      const lowerQuery = searchQuery.toLowerCase();
      
      return querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            parentId: data.parentId || null,
            level: data.level,
            size: data.size,
            categoryType: data.categoryType,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as TargetingCategory;
        })
        .filter(category => category.name.toLowerCase().includes(lowerQuery));
    } catch (error) {
      console.error("Error searching targeting categories:", error);
      return [];
    }
  }

  async getAllTargetingCategories(): Promise<TargetingCategory[]> {
    try {
      const querySnapshot = await getDocs(collection(this.db, "targeting_categories"));
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          parentId: data.parentId || null,
          level: data.level,
          size: data.size,
          categoryType: data.categoryType,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as TargetingCategory;
      });
    } catch (error) {
      console.error("Error getting all targeting categories:", error);
      return [];
    }
  }

  async listTargetingCategories(): Promise<TargetingCategory[]> {
    return this.getAllTargetingCategories();
  }

  async getHierarchicalTargetingCategories(): Promise<TargetingCategory[]> {
    try {
      const allCategories = await this.getAllTargetingCategories();
      console.log(`Building hierarchy from ${allCategories.length} categories`);
      
      // Build a map for quick lookups
      const categoryMap = new Map<string, TargetingCategory & { children?: TargetingCategory[] }>();
      allCategories.forEach(cat => {
        categoryMap.set(cat.id, { ...cat, children: [] });
      });

      // Build the hierarchy
      const rootCategories: TargetingCategory[] = [];
      
      allCategories.forEach(category => {
        const categoryWithChildren = categoryMap.get(category.id)!;
        
        if (category.parentId && categoryMap.has(category.parentId)) {
          const parent = categoryMap.get(category.parentId)!;
          if (!parent.children) parent.children = [];
          parent.children.push(categoryWithChildren);
        } else if (!category.parentId) {
          // This is a root category
          rootCategories.push(categoryWithChildren);
        }
      });

      // Sort categories by level and name
      const sortCategories = (categories: any[]) => {
        categories.sort((a, b) => {
          if (a.level !== b.level) return a.level - b.level;
          return a.name.localeCompare(b.name);
        });
        categories.forEach(cat => {
          if (cat.children && cat.children.length > 0) {
            sortCategories(cat.children);
          }
        });
      };

      sortCategories(rootCategories);
      
      console.log(`Built hierarchy with ${rootCategories.length} root categories`);
      rootCategories.forEach(cat => {
        console.log(`  - ${cat.name} (Level ${cat.level}, ${cat.children?.length || 0} children)`);
      });

      return rootCategories;
    } catch (error) {
      console.error('Error building hierarchical categories:', error);
      throw new Error('Failed to build hierarchical categories');
    }
  }

  async createTargetingCategory(category: InsertTargetingCategory): Promise<TargetingCategory> {
    try {
      const docRef = await addDoc(collection(this.db, "targeting_categories"), {
        ...category,
        createdAt: new Date(),
      });

      return {
        ...category,
        id: docRef.id,
        createdAt: new Date(),
      } as TargetingCategory;
    } catch (error) {
      console.error("Error creating targeting category:", error);
      throw error;
    }
  }

  // Clear all targeting categories
  async clearAllTargetingCategories(): Promise<void> {
    try {
      const querySnapshot = await getDocs(collection(this.db, "targeting_categories"));
      const batch = writeBatch(this.db);
      
      querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log(`Cleared ${querySnapshot.docs.length} targeting categories`);
    } catch (error) {
      console.error("Error clearing targeting categories:", error);
      throw error;
    }
  }

  // Batch upload targeting categories (improved version)
  async batchUploadTargetingCategories(categories: any[]): Promise<void> {
    try {
      console.log(`Starting batch upload of ${categories.length} categories...`);
      
      // Process in batches of 500 (Firestore limit)
      const batchSize = 500;
      for (let i = 0; i < categories.length; i += batchSize) {
        const batch = writeBatch(this.db);
        const batchCategories = categories.slice(i, i + batchSize);
        
        batchCategories.forEach((category) => {
          // Use the original ID as the document ID
          const docRef = doc(this.db, "targeting_categories", category.id);
          batch.set(docRef, {
            name: category.name,
            parentId: category.parentId || null,
            level: category.level || 0,
            size: category.size || "Unknown",
            categoryType: category.categoryType || "interests",
            createdAt: new Date(),
          });
        });
        
        await batch.commit();
        console.log(`Uploaded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(categories.length / batchSize)}`);
      }
      
      console.log(`Successfully uploaded ${categories.length} targeting categories`);
    } catch (error) {
      console.error("Error batch uploading targeting categories:", error);
      throw error;
    }
  }

  // Bulk insert targeting categories from JSON data (legacy method)
  async bulkInsertTargetingCategories(categories: any[]): Promise<void> {
    await this.batchUploadTargetingCategories(categories);
  }

  // Recommendations
  async createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation> {
    try {
      const docRef = await addDoc(collection(this.db, "recommendations"), {
        ...recommendation,
        createdAt: new Date(),
      });

      return {
        ...recommendation,
        id: docRef.id,
        createdAt: new Date(),
      } as Recommendation;
    } catch (error) {
      console.error("Error creating recommendation:", error);
      throw error;
    }
  }

  async getRecommendationsByUser(userId?: string): Promise<Recommendation[]> {
    try {
      const querySnapshot = await getDocs(collection(this.db, "recommendations"));
      
      return querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userInput: data.userInput,
            budgetRange: data.budgetRange,
            geographicFocus: data.geographicFocus,
            campaignGoal: data.campaignGoal,
            recommendations: data.recommendations,
            createdAt: data.createdAt?.toDate() || new Date(),
          } as Recommendation;
        })
        .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    } catch (error) {
      console.error("Error getting recommendations:", error);
      return [];
    }
  }

  // User methods (placeholder - implement if needed)
  async getUser(id: string): Promise<any> {
    throw new Error("User methods not implemented for Firebase yet");
  }

  async getUserByUsername(username: string): Promise<any> {
    throw new Error("User methods not implemented for Firebase yet");
  }

  async createUser(user: any): Promise<any> {
    throw new Error("User methods not implemented for Firebase yet");
  }
}