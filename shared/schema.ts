import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const targetingCategories = pgTable("targeting_categories", {
  id: text("id").primaryKey(), // e.g., "interests-fitness_and_wellness-yoga"
  name: text("name").notNull(), // e.g., "Yoga"
  parentId: text("parent_id"), // e.g., "interests-fitness_and_wellness"
  level: integer("level").notNull(), // hierarchy depth
  size: text("size"), // audience size from Meta, e.g., "2.3M"
  categoryType: text("category_type").notNull(), // "interests", "behaviors", "demographics"
  createdAt: timestamp("created_at").defaultNow(),
});

export const recommendations = pgTable("recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userInput: text("user_input").notNull(),
  budgetRange: text("budget_range"),
  geographicFocus: text("geographic_focus"),
  campaignGoal: text("campaign_goal"),
  recommendations: jsonb("recommendations").notNull(), // JSON array of recommendation objects
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTargetingCategorySchema = createInsertSchema(targetingCategories);

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
  createdAt: true,
});

export const generateRecommendationSchema = z.object({
  userInput: z.string().min(3, "Please provide a description of your product or audience").optional(),
  businessType: z.string().optional(),
  productService: z.string().optional(),
  targetAge: z.string().optional(),
  budget: z.string().optional(),
  goal: z.string().optional(),
  budgetRange: z.string().optional(),
  geographicFocus: z.string().optional(),
  campaignGoal: z.string().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTargetingCategory = z.infer<typeof insertTargetingCategorySchema>;
export type TargetingCategory = typeof targetingCategories.$inferSelect;

export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;

export type GenerateRecommendationRequest = z.infer<typeof generateRecommendationSchema>;

// Extended type for hierarchical display with children
export type HierarchicalTargetingCategory = TargetingCategory & {
  children?: HierarchicalTargetingCategory[];
};

// Recommendation structure from AI
export interface TargetingRecommendation {
  id: string;
  name: string;
  justification: string;
  priority?: "high" | "medium" | "low";
  confidenceScore?: number;
  estimatedReach?: string;
}

export interface AIRecommendationResponse {
  recommendations: TargetingRecommendation[];
}
