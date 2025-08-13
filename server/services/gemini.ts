import * as fs from "fs";
import { GoogleGenAI, Modality } from "@google/genai";
import { type TargetingRecommendation, type AIRecommendationResponse } from "@shared/schema";
import { storage } from "../storage";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateTargetingRecommendations(
  userInput: string,
  budgetRange?: string,
  geographicFocus?: string,
  campaignGoal?: string
): Promise<TargetingRecommendation[]> {
  try {
    // Get all available targeting categories to provide context
    const categories = await storage.getAllTargetingCategories();
    
    // Create a simplified list for the AI to reference
    const categoryContext = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      size: cat.size,
      type: cat.categoryType,
      level: cat.level
    }));

    const systemPrompt = `You are an expert Meta Ads strategist with deep knowledge of audience targeting and campaign optimization. Analyze the user's business description and recommend the most strategic targeting categories.

STRATEGIC ANALYSIS FRAMEWORK:
1. CUSTOMER PERSONA IDENTIFICATION: Determine who would buy this product/service
2. INTENT SIGNALS: Find categories that indicate purchase intent or strong relevance
3. FUNNEL OPTIMIZATION: Balance broad reach with specific targeting
4. CAMPAIGN EFFICIENCY: Consider budget optimization and competition levels

TARGETING STRATEGY:
- Demographics: Age, income, education, life events, relationship status, work
- Interests: Hobbies, entertainment preferences, lifestyle choices, brands
- Behaviors: Purchase patterns, device usage, travel, digital activities

RESPONSE REQUIREMENTS:
- Recommend 5-8 categories for optimal performance
- Mix broad and specific targeting
- Include strong justifications based on business relevance
- Prioritize by strategic value (high intent = high priority)

Return as JSON with this exact format:
{
  "recommendations": [
    {
      "id": "exact_category_id_from_available_list",
      "justification": "Strategic explanation of why this targeting drives results for this specific business",
      "priority": "high|medium|low"
    }
  ]
}

Use only authentic category IDs from the provided list. Focus on business impact and audience quality over broad reach.`;

    const userPrompt = `User Description: "${userInput}"
${budgetRange ? `Budget Range: ${budgetRange}` : ''}
${geographicFocus ? `Geographic Focus: ${geographicFocus}` : ''}
${campaignGoal ? `Campaign Goal: ${campaignGoal}` : ''}

Available Targeting Categories:
${JSON.stringify(categoryContext, null, 2)}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  justification: { type: "string" }
                },
                required: ["id", "justification"]
              }
            }
          },
          required: ["recommendations"]
        }
      },
      contents: userPrompt,
    });

    const rawJson = response.text;

    if (!rawJson) {
      throw new Error("Empty response from Gemini model");
    }

    const result: AIRecommendationResponse = JSON.parse(rawJson);
    
    // Enrich recommendations with category data
    const enrichedRecommendations: TargetingRecommendation[] = [];
    
    for (const rec of result.recommendations) {
      const category = await storage.getTargetingCategory(rec.id);
      if (category) {
        enrichedRecommendations.push({
          ...rec,
          name: category.name,
          size: category.size || "Unknown",
          categoryType: category.categoryType,
          priority: enrichedRecommendations.length === 0 ? "high" : 
                   enrichedRecommendations.length <= 1 ? "medium" : "low"
        });
      }
    }

    return enrichedRecommendations;
    
  } catch (error) {
    console.error("Error generating recommendations with Gemini:", error);
    throw new Error("Failed to generate targeting recommendations. Please try again.");
  }
}