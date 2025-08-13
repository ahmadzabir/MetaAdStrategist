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

interface StructuredInput {
  businessType: string;
  productService: string;
  targetAge: string;
  budget: string;
  goal: string;
}

export async function generateTargetingRecommendations(
  structuredInput: StructuredInput | string,
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

    const systemPrompt = `You are IntelliTarget AI, an embedded Meta Ads strategist inside a web app.
Your only responsibilities are:
1. Understanding the user's plain-language description of their product/service/audience.
2. Generating a clear, clever, and beginner-friendly Meta Ads targeting strategy.
3. Providing an AI-powered analysis of targeting choices that helps the user make decisions confidently.

--- GOALS ---
• Give the user 5–8 recommended targeting categories from the authentic Meta database (interests, demographics, behaviours).
• Provide simple but smart justifications for each recommendation.
• Include at least one 'clever' idea that isn't obvious (e.g., competitor following, behaviour triggers, industry events).
• Avoid overwhelming with jargon. Use everyday language.
• Make every piece of advice feel like a "shortcut" that will save the user time or money.
• Analyse the targeting for diversity, overlap, and campaign fit (awareness, traffic, or conversion).

--- OUTPUT FORMAT ---
Always respond in structured JSON:
{
  "recommendations": [
    {
      "id": "exact_category_id_from_available_list",
      "justification": "Strategic explanation of why this targeting drives results for this specific business",
      "priority": "high|medium|low"
    }
  ]
}

--- RULES ---
1. Never give more than 8 total categories in one output.
2. Always combine interests + behaviours + demographics for better targeting quality.
3. Use authentic Meta category IDs/names when available.
4. If audience size is missing from the DB, label it as "N/A" but still give strategic reasoning.
5. Keep language clear for a non-technical user who wants results, not theory.
6. If the targeting seems too narrow or broad, include a warning in the justification.
7. For B2B products, prioritise job titles, industries, and page admin behaviours.

--- STYLE ---
• Speak like a friendly, confident consultant who's done this 1,000 times before.
• Focus on giving *action* over giving *definitions*.
• Avoid unnecessary technical explanations unless asked.

Use only authentic category IDs from the provided list. Focus on business impact and audience quality over broad reach.`;

    // Handle both structured and legacy input formats
    let userPrompt: string;
    
    if (typeof structuredInput === 'string') {
      // Legacy format
      userPrompt = `User Description: "${structuredInput}"
${budgetRange ? `Budget Range: ${budgetRange}` : ''}
${geographicFocus ? `Geographic Focus: ${geographicFocus}` : ''}
${campaignGoal ? `Campaign Goal: ${campaignGoal}` : ''}`;
    } else {
      // New structured format
      userPrompt = `Business Type: ${structuredInput.businessType}
Product/Service: ${structuredInput.productService}
Target Age: ${structuredInput.targetAge}
Budget: ${structuredInput.budget}
Campaign Goal: ${structuredInput.goal}`;
    }

    userPrompt += `

Available Targeting Categories:
${JSON.stringify(categoryContext, null, 2)}`;

    console.log("Generating recommendations with structured input:", userPrompt);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
                  justification: { type: "string" },
                  priority: { type: "string" }
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