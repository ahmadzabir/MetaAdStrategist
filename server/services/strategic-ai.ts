import { GoogleGenAI } from "@google/genai";
import type { 
  BusinessDiscovery, 
  TargetingGroup, 
  StrategicTargeting, 
  TargetingRecommendation,
  ConversationContext 
} from "@shared/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

/**
 * Strategic AI Consultant Service
 * Acts as a Meta Ads targeting strategist that guides users through psychological profiling
 * and builds sophisticated AND/OR group targeting structures
 */

export class StrategicAiService {
  
  /**
   * Analyze business discovery responses and generate strategic targeting groups
   */
  async generateStrategicTargeting(discovery: BusinessDiscovery): Promise<StrategicTargeting> {
    const systemPrompt = `You are a world-class Meta Ads targeting strategist. Your expertise is creating sophisticated audience intersections using AND/OR logic that dramatically improve ROI.

CRITICAL PRINCIPLES:
1. Create simple, practical targeting groups for small business owners
2. Target based on customer demographics and behaviors that make sense
3. Create 2-3 strategic groups that work together (don't overcomplicate)
4. Each group should target a different aspect: demographics, interests, or behaviors

USER'S BUSINESS DISCOVERY:
- Business Type: ${discovery.businessType || "Not specified"}
- Product/Service: ${discovery.productService || "Not specified"}  
- Decision Maker: ${discovery.decisionMaker || "Not specified"}
- Financial Capacity: ${discovery.financialCapacity || "Not specified"}
- Life Stage: ${discovery.lifeStage || "Not specified"}
- Pain Points: ${discovery.painPoints || "Not specified"}
- Behaviors: ${discovery.behaviors || "Not specified"}
- Current Spending: ${discovery.currentSpending || "Not specified"}

TASK: Create 2-3 strategic targeting groups with REAL targeting categories. Each group should:
1. Have a clear strategic purpose
2. Use OR logic within the group  
3. Include 3-5 actual targeting categories per group

EXAMPLE STRUCTURE (Men's Bowties):
- Group A: "Professional Men" 
  Categories: [{"id": "6003020834540", "name": "Men age 25-54", "type": "demographics"}, {"id": "6004854404172", "name": "Business and industry", "type": "interests"}, {"id": "6003397057098", "name": "Engaged shoppers", "type": "behaviors"}]
- Group B: "Fashion & Events"
  Categories: [{"id": "6003195797498", "name": "Fashion", "type": "interests"}, {"id": "6003050399578", "name": "Weddings", "type": "interests"}, {"id": "6002839660179", "name": "Formal wear", "type": "interests"}]

IMPORTANT: Always include real targeting categories with proper IDs, names, and types (interests/behaviors/demographics).

Respond with JSON in this exact format:
{
  "groups": [
    {
      "id": "group_1",
      "name": "Strategic Group Name",
      "description": "Why this group matters strategically",
      "logic": "OR",
      "categories": [], 
      "color": "#hex_color"
    }
  ],
  "groupLogic": "AND",
  "specificity": "High",
  "strategy_explanation": "Overall strategic approach explanation"
}`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              groups: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    description: { type: "string" },
                    logic: { type: "string" },
                    categories: { 
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          type: { type: "string" }
                        }
                      }
                    },
                    color: { type: "string" }
                  },
                  required: ["id", "name", "description", "logic", "categories", "color"]
                }
              },
              groupLogic: { type: "string" },
              specificity: { type: "string" },
              strategy_explanation: { type: "string" }
            },
            required: ["groups", "groupLogic", "specificity", "strategy_explanation"]
          }
        },
        contents: "Generate strategic targeting groups based on the business discovery."
      });

      const result = JSON.parse(response.text || "{}");
      
      return {
        groups: result.groups || [],
        groupLogic: "AND",
        specificity: result.specificity || "Medium"
      };
    } catch (error) {
      console.error("Strategic AI Error:", error);
      throw new Error("Failed to generate strategic targeting");
    }
  }

  /**
   * Generate targeting recommendations based on conversation context
   */
  async generateConversationalRecommendations(
    context: ConversationContext,
    userMessage: string
  ): Promise<TargetingRecommendation[]> {
    const conversationHistory = context.messages
      .slice(-6) // Last 6 messages for context
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    const systemPrompt = `You are IntelliTarget AI, a Meta Ads targeting strategist consultant. You help users discover their ideal audience through strategic questioning and psychological profiling.

CONVERSATION CONTEXT:
${conversationHistory}

USER'S LATEST MESSAGE: "${userMessage}"

YOUR APPROACH:
1. Think about WHO the customer is as a person, not what they're buying
2. Ask probing questions about customer psychology, behaviors, and life situations
3. Generate targeting recommendations that target indirect behavioral indicators
4. Avoid obvious/surface-level targeting (e.g., don't target "fitness" for gym programs)
5. Focus on pain points, lifestyle patterns, and spending behaviors

EXAMPLE STRATEGIC THINKING:
- Gym program buyers → Target people interested in comfort food, Netflix, convenience (people who need fitness)
- SAT tutoring buyers → Target engaged parents with high income who invest in their children
- Business software buyers → Target people with business growth pain points and investment capacity

Respond with JSON containing:
1. A conversational response (ask 1-2 strategic questions or provide insights)
2. 3-8 targeting recommendations with psychological justifications

Format:
{
  "response": "Your conversational response with strategic questions",
  "recommendations": [
    {
      "id": "targeting_id",
      "name": "Targeting Category Name", 
      "type": "interests|behaviors|demographics",
      "justification": "Why this targets the right psychology",
      "category": "broader_category"
    }
  ]
}`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              response: { type: "string" },
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    type: { type: "string" },
                    justification: { type: "string" },
                    category: { type: "string" }
                  },
                  required: ["id", "name", "type", "justification", "category"]
                }
              }
            },
            required: ["response", "recommendations"]
          }
        },
        contents: "Generate response and targeting recommendations based on the conversation."
      });

      const result = JSON.parse(response.text || "{}");
      
      return result.recommendations || [];
    } catch (error) {
      console.error("Conversational AI Error:", error);
      throw new Error("Failed to generate conversational recommendations");
    }
  }

  /**
   * Generate strategic discovery questions based on current context
   */
  async generateDiscoveryQuestions(discovery: Partial<BusinessDiscovery>): Promise<string[]> {
    const systemPrompt = `You are a strategic consultant helping discover customer psychology for Meta Ads targeting.

CURRENT DISCOVERY STATE:
${JSON.stringify(discovery, null, 2)}

Generate 2-3 strategic follow-up questions that will help understand:
1. Customer psychology and behavioral patterns
2. Decision-making process and financial capacity  
3. Life situations that create the need
4. Indirect behavioral indicators

AVOID generic marketing questions. Focus on psychological profiling.

EXAMPLES OF GOOD QUESTIONS:
- "What does your ideal customer do on weekends when they're NOT thinking about your product?"
- "What other things do they spend money on that they might regret later?"
- "What life situation or frustration creates the need for your solution?"
- "Who actually makes the buying decision, and what's their financial situation?"

Respond with JSON: {"questions": ["question1", "question2", "question3"]}`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["questions"]
          }
        },
        contents: "Generate strategic discovery questions."
      });

      const result = JSON.parse(response.text || "{}");
      return result.questions || [];
    } catch (error) {
      console.error("Discovery Questions AI Error:", error);
      return [
        "What frustrates your ideal customer most in their daily life?",
        "What do they spend money on when they're stressed or tired?",
        "What life situation creates the need for your solution?"
      ];
    }
  }
}

// Singleton service instance
export const strategicAiService = new StrategicAiService();
export default strategicAiService;