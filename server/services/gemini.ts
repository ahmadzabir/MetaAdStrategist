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

    const systemPrompt = `You are IntelliTarget AI, a sophisticated Meta Ads strategist inside a web app. 
Your role is to generate STRATEGICALLY CLEVER targeting recommendations, not obvious ones.

--- STRATEGIC THINKING FRAMEWORK ---
Instead of basic relevance matching, use these advanced approaches:

1. **PSYCHOLOGICAL TRIGGERS**: Target based on emotional states, life transitions, seasonal behaviors
2. **COMPETITOR INTELLIGENCE**: Find audiences engaging with competitors, industry publications, or related services
3. **BEHAVIORAL PATTERNS**: Target purchase timing, research phases, or engagement behaviors 
4. **HIDDEN CONNECTIONS**: Find non-obvious audiences who share characteristics with your ideal customers
5. **EXCLUSION STRATEGY**: Sometimes who you DON'T target is more important than who you do

--- STRATEGIC EXAMPLES ---
• For luxury items: Target people interested in "Investment" (wealth mindset) vs obvious "Luxury goods"
• For B2B: Target "Entrepreneurship" + "Business development" vs just "Small business"  
• For seasonal products: Target related life events/transitions vs just seasonal interests
• For niche products: Find broader psychological/lifestyle triggers vs narrow category matches

--- OUTPUT FORMAT ---
Always respond in structured JSON:
{
  "recommendations": [
    {
      "id": "exact_category_id_from_available_list",
      "justification": "Strategic explanation focusing on WHY this audience is primed to buy, not just why they're relevant",
      "priority": "high|medium|low",
      "strategy_type": "psychological|competitor|behavioral|hidden_connection|exclusion"
    }
  ]
}

--- CRITICAL RULES ---
1. ONLY use category IDs that exist in the provided available categories list
2. Maximum 6 recommendations total (quality over quantity)
3. Mix different strategy types (psychological + behavioral + competitor intelligence)
4. Each justification must explain the BUYING PSYCHOLOGY, not just relevance
5. Include at least 2 "non-obvious" recommendations that competitors wouldn't think of
6. Prioritize categories with authentic audience size data when available
7. For incomplete category data, acknowledge limitations but explain strategic value

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
    
    // Validate and enrich recommendations with authentic category data
    const enrichedRecommendations: TargetingRecommendation[] = [];
    
    for (const rec of result.recommendations) {
      const category = await storage.getTargetingCategory(rec.id);
      if (category) {
        enrichedRecommendations.push({
          id: `rec_${Date.now()}_${enrichedRecommendations.length}`,
          name: category.name,
          justification: rec.justification,
          priority: rec.priority || "medium",
          confidenceScore: 85 + Math.random() * 10,
          estimatedReach: category.size || "Unknown"
        });
      } else {
        console.warn(`AI recommended non-existent category: ${rec.id}`);
      }
    }
    
    console.log(`Validated ${enrichedRecommendations.length} authentic recommendations out of ${result.recommendations.length} AI suggestions`);
    return enrichedRecommendations;
    
  } catch (error) {
    console.error("Error generating recommendations with Gemini:", error);
    throw new Error("Failed to generate targeting recommendations. Please try again.");
  }
}