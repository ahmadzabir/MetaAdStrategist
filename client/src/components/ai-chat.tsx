import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Send, 
  Bot, 
  User, 
  ArrowLeft,
  MessageCircle
} from "lucide-react";

interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface AIChatProps {
  onBack: () => void;
  initialContext?: string;
}

export function AIChat({ onBack, initialContext }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content: `Hi! I'm your AI targeting strategist. I've analyzed your campaign setup${initialContext ? ' and generated some recommendations' : ''}. How can I help you refine your targeting strategy?

I can help you with:
• Understanding your target audience better
• Explaining why certain categories work well
• Suggesting budget allocation strategies
• Optimizing for different campaign goals
• Identifying competitor targeting opportunities

What would you like to know?`,
      role: "assistant",
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      role: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(inputMessage),
        role: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes("budget") || lowerInput.includes("cost")) {
      return "Great question about budget! For your campaign type, I'd recommend starting with 70% of your budget on your highest-priority targeting categories and 30% for testing new audiences. This gives you stable performance while exploring growth opportunities.";
    }
    
    if (lowerInput.includes("audience") || lowerInput.includes("targeting")) {
      return "When it comes to audience targeting, I always recommend the 'layered approach': Start with 2-3 demographic categories, add 2-3 interest categories, and include 1-2 behavioral triggers. This creates a well-rounded audience that's specific enough to convert but broad enough to scale.";
    }
    
    if (lowerInput.includes("competitor")) {
      return "Competitor targeting is a powerful strategy! Look for audiences who follow your direct competitors or industry leaders. You can also target people who have engaged with competitor content recently. Just make sure your ad creative clearly differentiates your value proposition.";
    }
    
    if (lowerInput.includes("optimize") || lowerInput.includes("improve")) {
      return "For optimization, I recommend the 'test and scale' method: Run your top 3 targeting combinations for 3-5 days, identify the winner, then gradually increase budget by 20-30% every 2 days. Also, check your frequency - if it's above 3, you need broader targeting.";
    }
    
    return "That's a great question! Based on successful campaigns I've analyzed, the key is to balance specificity with reach. Think about your customer's journey - what are they doing online before they're ready to buy? That's where you'll find your best targeting opportunities. Would you like me to be more specific about any particular aspect?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900"
              data-testid="button-back-to-recommendations"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                AI Targeting Strategist
              </CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Online
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 border-2 border-purple-200">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-xs">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <div
                    className={`text-xs mt-1 opacity-70 ${
                      message.role === "user" ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8 border-2 border-blue-200">
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 border-2 border-purple-200">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-xs">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about targeting strategies, budget optimization, audience insights..."
              className="flex-1"
              disabled={isLoading}
              data-testid="input-chat-message"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Ask specific questions about your targeting strategy for personalized advice
          </p>
        </div>
      </CardContent>
    </Card>
  );
}