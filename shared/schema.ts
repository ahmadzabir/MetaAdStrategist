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

// Strategic Group Structure for Advanced Targeting
export interface TargetingGroup {
  id: string;
  name: string; // e.g., "Financial Qualification", "Life Stage Demographics"
  description: string; // Strategic explanation
  logic: "OR"; // Within group logic (always OR)
  categories: TargetingCategory[];
  color: string; // For Venn diagram visualization
}

export interface StrategicTargeting {
  groups: TargetingGroup[];
  groupLogic: "AND"; // Between groups (always AND for strategic targeting)
  totalAudienceSize?: number;
  specificity: "None" | "Low" | "Medium" | "High";
}

// Meta API Integration
export interface MetaReachEstimate {
  users: number;
  dailyBudgetMin?: number;
  dailyBudgetMax?: number;
  targeting_spec: MetaTargetingSpec;
}

export interface MetaTargetingSpec {
  geo_locations?: {
    countries?: string[];
    regions?: Array<{ key: string }>;
    cities?: Array<{ key: string; radius?: number; distance_unit?: "mile" | "kilometer" }>;
  };
  age_min?: number;
  age_max?: number;
  genders?: number[];
  flexible_spec?: Array<{
    interests?: Array<{ id: string; name?: string }>;
    behaviors?: Array<{ id: string; name?: string }>;
    demographics?: Array<{ id: string; name?: string }>;
    [key: string]: any;
  }>;
  custom_audiences?: Array<{ id: string }>;
  excluded_custom_audiences?: Array<{ id: string }>;
}

export interface MetaTargetingCategory {
  id: string;
  name: string;
  type: string;
  description?: string;
  audience_size?: number;
  path?: string[];
}

// Strategic Discovery Questions
export interface BusinessDiscovery {
  businessType?: string;
  productService?: string;
  decisionMaker?: string; // Who makes the buying decision?
  financialCapacity?: string; // What income level is needed?
  lifeStage?: string; // What life situation creates the need?
  painPoints?: string; // What frustrates them?
  behaviors?: string; // What do they do when NOT thinking about your product?
  currentSpending?: string; // What else do they spend money on?
}

// Conversation Context for AI
export interface ConversationContext {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    recommendations?: TargetingRecommendation[];
  }>;
  discovery: BusinessDiscovery;
  currentTargeting?: StrategicTargeting;
}

// Recommendation structure from AI
export interface TargetingRecommendation {
  id: string;
  name: string;
  type: "interests" | "behaviors" | "demographics";
  justification: string;
  category: string;
  response?: string; // AI conversational response
  justification: string;
  priority?: "high" | "medium" | "low";
  confidenceScore?: number;
  estimatedReach?: string;
  breadcrumbs?: string[];
  categoryType?: string;
  level?: number;
}

export interface AIRecommendationResponse {
  recommendations: TargetingRecommendation[];
}
