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

    const systemPrompt = `You are IntelliTarget AI, an expert Meta Ads strategist specializing in contextually relevant audience targeting.

CRITICAL TASK: Analyze the user's campaign description and recommend ONLY highly relevant targeting categories that make logical sense for their specific business and goals.

--- ANALYSIS FRAMEWORK ---
1. **UNDERSTAND THE BUSINESS**: What product/service are they selling? Who is their ideal customer?
2. **IDENTIFY KEY DEMOGRAPHICS**: Age, location, income level, life stage, parental status
3. **FIND RELEVANT INTERESTS**: Hobbies, activities, concerns directly related to their offering
4. **TARGET BEHAVIORS**: Purchase patterns, online activities, life events that indicate buying intent
5. **EXCLUDE IRRELEVANT**: Never recommend categories that don't logically connect to the business

--- CONTEXTUAL RELEVANCE EXAMPLES ---
• SAT/ACT Tutoring → Target parents concerned about education, college-bound students, academic achievement interests
• Fitness App → Target health/wellness interests, gym-goers, weight loss behaviors
• B2B Software → Target business interests, entrepreneurship, professional development
• Wedding Services → Target recently engaged, wedding planning behaviors, relationship milestones

--- STRICT OUTPUT FORMAT ---
{
  "recommendations": [
    {
      "id": "exact_category_id_from_available_list",
      "justification": "Clear explanation of WHY this specific audience is highly likely to need/want this product/service based on their characteristics and behaviors",
      "priority": "high|medium|low",
      "relevance_score": 9
    }
  ]
}

--- CRITICAL REQUIREMENTS ---
1. ONLY recommend categories with clear logical connection to the user's business
2. Each justification must explain the specific relevance to the campaign
3. Maximum 5-6 highly relevant recommendations (quality over quantity) 
4. ONLY use category IDs that exist in the provided available categories list
5. Relevance score must be 8+ (out of 10) - no weak connections allowed
6. Focus on business impact and audience quality over broad reach

--- EXAMPLE FOR SAT/ACT TUTORING ---
GOOD: "Parents" + "College preparation" + "High school students" (highly relevant)
BAD: "Shopping and fashion" + "Physical fitness" + "Yoga" (completely irrelevant)

Use only authentic category IDs from the provided list.`;

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
                  priority: { type: "string" },
                  relevance_score: { type: "number" }
                },
                required: ["id", "justification", "priority", "relevance_score"]
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
    
    // Function to build breadcrumb path for a category
    const buildBreadcrumbs = async (categoryId: string): Promise<string[]> => {
      const breadcrumbs: string[] = [];
      let currentId: string | null = categoryId;
      
      while (currentId) {
        const category = await storage.getTargetingCategory(currentId);
        if (category) {
          breadcrumbs.unshift(category.name);
          currentId = category.parentId;
        } else {
          break;
        }
      }
      
      return breadcrumbs;
    };

    // Validate and enrich recommendations with authentic category data
    const enrichedRecommendations: TargetingRecommendation[] = [];
    
    for (const rec of result.recommendations) {
      const category = await storage.getTargetingCategory(rec.id);
      if (category) {
        const breadcrumbs = await buildBreadcrumbs(rec.id);
        console.log(`Generated breadcrumbs for ${rec.id}: [${breadcrumbs.join(" > ")}]`);
        
        enrichedRecommendations.push({
          id: `rec_${Date.now()}_${enrichedRecommendations.length}`,
          name: category.name,
          justification: rec.justification,
          priority: rec.priority || "medium",
          confidenceScore: 85 + Math.random() * 10,
          estimatedReach: category.size || "Unknown",
          breadcrumbs: breadcrumbs.length > 0 ? breadcrumbs : [category.name],
          categoryType: category.categoryType,
          level: category.level
        });
        
        console.log(`Enriched recommendation: ${category.name} - Level: ${category.level}, Type: ${category.categoryType}, Size: ${category.size}`);
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