import { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Target,
  TrendingUp,
  Users,
  Sparkles,
  X
} from "lucide-react";

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategories: string[];
  recommendations: any[];
}

export function AIChatDrawer({ isOpen, onClose, selectedCategories, recommendations }: AIChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with context-aware message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const contextMessage: ChatMessage = {
        id: "init",
        type: "ai",
        content: selectedCategories.length > 0 
          ? `I can see you've selected ${selectedCategories.length} targeting categories. Let me help you optimize your audience strategy. What's your main campaign goal?`
          : "Hi! I'm your AI strategist. I can help you build the perfect audience by analyzing your selections in real-time. What are you trying to achieve with this campaign?",
        timestamp: new Date(),
        suggestions: [
          "Analyze my current selections",
          "Suggest broader reach categories", 
          "Find high-converting combinations",
          "Estimate campaign performance"
        ]
      };
      setMessages([contextMessage]);
    }
  }, [isOpen, selectedCategories.length, messages.length]);

  // Auto-update when selections change
  useEffect(() => {
    if (isOpen && selectedCategories.length > 0 && messages.length > 1) {
      const updateMessage: ChatMessage = {
        id: `update-${Date.now()}`,
        type: "ai",
        content: `I notice you've updated your selections to ${selectedCategories.length} categories. ${
          selectedCategories.length >= 3 
            ? "Great coverage! You might want to test removing one category to reduce audience overlap."
            : "Consider adding 1-2 more categories to broaden your reach potential."
        }`,
        timestamp: new Date(),
        suggestions: [
          "Check for audience overlap",
          "Suggest complementary categories",
          "Estimate reach impact"
        ]
      };
      setMessages(prev => [...prev, updateMessage]);
    }
  }, [selectedCategories.length, isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: generateContextualResponse(inputValue, selectedCategories, recommendations),
        timestamp: new Date(),
        suggestions: generateSuggestions(inputValue)
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateContextualResponse = (input: string, categories: string[], recs: any[]) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes("analyze") || lowerInput.includes("current")) {
      return `Based on your ${categories.length} selected categories, you're targeting a balanced audience. Your primary demographic focus looks strong, but I'd suggest testing one behavioral category to improve conversion rates.`;
    }
    
    if (lowerInput.includes("broad") || lowerInput.includes("reach")) {
      return "To broaden your reach, consider adding 'Shopping and Fashion' or 'Technology Early Adopters'. These categories have high overlap with your current selections but will expand your potential audience by ~40%.";
    }
    
    if (lowerInput.includes("performance") || lowerInput.includes("estimate")) {
      return `Based on your selections, I estimate: CPM: $2.80-$4.50, CTR: 2.1-3.8%, Audience Size: ~85M. Your combination should perform well, especially if you're running carousel or video ads.`;
    }
    
    return "I'm analyzing your targeting strategy. Your current selection creates a focused audience with good conversion potential. Would you like me to suggest specific optimizations or test variations?";
  };

  const generateSuggestions = (input: string) => {
    const suggestions = [
      "Show me audience overlap analysis",
      "Suggest A/B testing strategy", 
      "Find similar high-performing categories",
      "Estimate budget recommendations"
    ];
    return suggestions.slice(0, 3);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[400px] sm:w-[500px] p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-b">
            <SheetTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">AI Strategist</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                  Live audience optimization assistance
                </div>
              </div>
            </SheetTitle>
            
            {/* Live Context Stats */}
            <div className="flex gap-3 mt-4">
              <Badge variant="outline" className="text-xs">
                <Target className="h-3 w-3 mr-1" />
                {selectedCategories.length} Selected
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                ~85M Reach
              </Badge>
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Medium Competition
              </Badge>
            </div>
          </SheetHeader>

          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.type === 'ai' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-blue-500 text-white ml-12' 
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    
                    {message.suggestions && (
                      <div className="mt-3 space-y-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-auto py-1 px-2 w-full justify-start"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {message.type === 'user' && (
                    <div className="w-8 h-8 bg-gray-300 dark:bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t bg-gray-50 dark:bg-slate-800">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about your targeting strategy..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
                data-testid="chat-input"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="sm"
                data-testid="send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}