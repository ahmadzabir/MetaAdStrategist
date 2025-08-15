import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Bot, User, Target, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ConversationContext, TargetingRecommendation, BusinessDiscovery } from "@shared/schema";

interface StrategicConversationProps {
  discovery: BusinessDiscovery;
  onRecommendationSelect: (recommendation: TargetingRecommendation) => void;
  selectedCategories: string[];
}

export function StrategicConversation({ 
  discovery, 
  onRecommendationSelect, 
  selectedCategories 
}: StrategicConversationProps) {
  const [messages, setMessages] = useState<ConversationContext['messages']>([
    {
      role: "assistant",
      content: `Hi! I'm your Meta Ads strategist. I see you're working on ${discovery.productService || "your business"}. Let's dive deeper into your customer psychology to find the perfect targeting strategy. What specific challenges do your customers face that your solution solves?`,
      timestamp: new Date(),
      recommendations: []
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [context, setContext] = useState<ConversationContext>({
    messages,
    discovery,
    currentTargeting: undefined
  });
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setContext(prev => ({ ...prev, messages, discovery }));
  }, [messages, discovery]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isGenerating) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsGenerating(true);

    // Add user message
    const newUserMessage = {
      role: "user" as const,
      content: userMessage,
      timestamp: new Date(),
      recommendations: []
    };

    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Get AI response with recommendations
      const response = await fetch("/api/strategic/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: { ...context, messages: [...messages, newUserMessage] },
          userMessage
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to generate response");
      }

      // Add AI response
      const aiMessage = {
        role: "assistant" as const,
        content: data.recommendations?.[0]?.response || "I understand. Let me provide some strategic insights and targeting recommendations.",
        timestamp: new Date(),
        recommendations: data.recommendations || []
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("Error in conversation:", error);
      toast({
        title: "Conversation Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });

      // Add error message
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I apologize, but I'm having trouble generating recommendations right now. Please try rephrasing your question or check your connection.",
        timestamp: new Date(),
        recommendations: []
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="h-[600px] flex flex-col border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950/20">
      <CardHeader className="pb-4 border-b border-blue-200 dark:border-blue-800">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          Strategic Discovery Chat
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Explore customer psychology with your AI strategist
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[80%] ${message.role === "user" ? "order-2" : ""}`}>
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  
                  <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}>
                    <span>{formatTimestamp(message.timestamp)}</span>
                  </div>

                  {/* Targeting recommendations */}
                  {message.recommendations && message.recommendations.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Strategic Recommendations:
                      </p>
                      <div className="space-y-2">
                        {message.recommendations.map((rec, recIndex) => (
                          <div
                            key={recIndex}
                            className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-lg"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Target className="h-3 w-3 text-green-600" />
                                  <span className="font-medium text-sm text-green-900 dark:text-green-100">
                                    {rec.name}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {rec.type}
                                  </Badge>
                                </div>
                                <p className="text-xs text-green-800 dark:text-green-200 leading-relaxed">
                                  {rec.justification}
                                </p>
                              </div>
                              
                              <Button
                                size="sm"
                                variant={selectedCategories.includes(rec.id) ? "secondary" : "outline"}
                                onClick={() => onRecommendationSelect(rec)}
                                disabled={selectedCategories.includes(rec.id)}
                                data-testid={`button-add-recommendation-${recIndex}`}
                                className="flex-shrink-0 h-8 px-3 text-xs"
                              >
                                {selectedCategories.includes(rec.id) ? (
                                  "Added"
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <Plus className="h-3 w-3" />
                                    Add
                                  </div>
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center order-1">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isGenerating && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-xs text-gray-500">Strategist is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about customer psychology, targeting strategies, or campaign ideas..."
              disabled={isGenerating}
              data-testid="input-chat-message"
              className="flex-1 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            />
            <Button
              type="submit"
              disabled={!inputMessage.trim() || isGenerating}
              data-testid="button-send-message"
              className="px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Ask about customer behavior, targeting strategies, or creative ideas
          </p>
        </div>
      </CardContent>
    </Card>
  );
}