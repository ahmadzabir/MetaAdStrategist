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

    const systemPrompt = `You are an expert Meta Ads strategist. Based on the user's description, recommend the most effective targeting categories from the available Meta targeting options.

Analyze the user's input and recommend 3-5 targeting categories that would be most effective. Think strategically about:
1. Direct relevance to the product/service
2. Audience intent and purchasing behavior
3. Budget efficiency and reach
4. Combining broad interests with specific behaviors

Return your response as a JSON object with this exact format:
{
  "recommendations": [
    {
      "id": "category_id_from_available_options",
      "justification": "Clear explanation of why this targeting option is strategically valuable for this campaign"
    }
  ]
}

Prioritize the recommendations by effectiveness, with the most important first.`;

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