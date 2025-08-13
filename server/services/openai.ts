import OpenAI from "openai";
import { type TargetingRecommendation, type AIRecommendationResponse } from "@shared/schema";
import { storage } from "../storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

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

    const prompt = `You are an expert Meta Ads strategist. Based on the user's description below, recommend the most effective targeting categories from the available Meta targeting options.

User Description: "${userInput}"
${budgetRange ? `Budget Range: ${budgetRange}` : ''}
${geographicFocus ? `Geographic Focus: ${geographicFocus}` : ''}
${campaignGoal ? `Campaign Goal: ${campaignGoal}` : ''}

Available Targeting Categories:
${JSON.stringify(categoryContext, null, 2)}

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

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert Meta Ads strategist who provides data-driven targeting recommendations. Always respond with valid JSON in the specified format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}') as AIRecommendationResponse;
    
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
    console.error("Error generating recommendations:", error);
    throw new Error("Failed to generate targeting recommendations. Please try again.");
  }
}
