import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send, User, Loader2, MessageSquare } from "lucide-react";
import { api } from "@/api/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface InvestigationChatProps {
  incidentId: string;
}

export function InvestigationChat({ incidentId }: InvestigationChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello, I am your AI Investigation Assistant. How can I help you analyze this incident?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput("");
    
    const newMessages = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // We only send the conversation history (excluding the first greeting if we want, but it's fine to send)
      const apiMessages = newMessages.map((m) => ({ role: m.role, content: m.content }));

      const response = await api.post("/investigations/chat", {
        incidentId,
        messages: apiMessages,
      });

      setMessages((prev) => [...prev, { role: "assistant", content: response.data.data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message to AI assistant");
      setMessages(prev => [...prev, { role: "assistant", content: "I encountered an error trying to process your request. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-[600px] border-primary/20 shadow-sm">
      <CardHeader className="py-3 px-4 border-b bg-muted/20">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          AI Investigation Assistant
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
          >
            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground border border-border"}`}>
              {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
            </div>
            <div className={`rounded-lg px-4 py-2 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/50 border border-border"}`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-muted text-foreground border border-border">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="rounded-lg px-4 py-3 text-sm bg-muted/50 border border-border flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-muted-foreground">Analyzing incident context...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      
      <CardFooter className="p-3 border-t bg-muted/10 flex-col items-start">
        <div className="w-full flex flex-wrap gap-2 mb-3">
          {["Explain this attack.", "Why is it Critical?", "What should we do first?", "What systems are affected?", "Generate an Incident Report."].map((prompt, i) => (
            <Badge 
              key={i}
              variant="outline" 
              className="cursor-pointer hover:bg-primary/10 text-xs font-normal"
              onClick={() => {
                if (!isLoading) {
                  setInput(prompt);
                }
              }}
            >
              {prompt}
            </Badge>
          ))}
        </div>
        <div className="flex w-full gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this incident... (e.g. 'Why is this critical?')"
            className="min-h-[40px] max-h-[120px] resize-none"
            disabled={isLoading}
          />
          <Button 
            size="icon" 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            className="h-10 w-10 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
