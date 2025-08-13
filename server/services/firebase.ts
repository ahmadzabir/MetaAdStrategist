import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, collection, addDoc, getDocs, query, where, doc, getDoc } from "firebase/firestore";
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

  // Bulk insert targeting categories from JSON data
  async bulkInsertTargetingCategories(categories: any[]): Promise<void> {
    try {
      const batch = [];
      for (const category of categories) {
        const docRef = doc(this.db, "targeting_categories", category.id);
        batch.push(
          addDoc(collection(this.db, "targeting_categories"), {
            id: category.id,
            name: category.name,
            parentId: category.parent_id || null,
            level: category.level || 0,
            size: category.size || "Unknown",
            categoryType: category.category_type || "interests",
            createdAt: new Date(),
          })
        );
      }
      
      await Promise.all(batch);
      console.log(`Bulk inserted ${categories.length} targeting categories`);
    } catch (error) {
      console.error("Error bulk inserting targeting categories:", error);
      throw error;
    }
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