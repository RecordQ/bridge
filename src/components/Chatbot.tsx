// src/components/Chatbot.tsx
"use client";

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Bot, Send, X, LoaderCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { askQuestion, type AskQuestionInput } from '@/ai/flows/ai-chatbot';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from './ui/avatar';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(msg => ({ role: msg.role, content: msg.content }));
      const response = await askQuestion({ question: input, chatHistory });
      const assistantMessage: Message = { role: 'assistant', content: response.answer };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error asking question:", error);
      const errorMessage: Message = { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again later." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={() => setIsOpen(!isOpen)} size="icon" className="rounded-full h-16 w-16 bg-primary hover:bg-primary/90 shadow-lg">
          {isOpen ? <X className="h-8 w-8" /> : <Bot className="h-8 w-8" />}
          <span className="sr-only">Toggle Chat</span>
        </Button>
      </div>

      <div
        className={cn(
          "fixed bottom-24 right-4 z-50 w-full max-w-sm transition-all duration-300 ease-in-out",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        <Card className="flex flex-col h-[60vh] shadow-2xl bg-card/80 backdrop-blur-lg border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              AI Assistant
            </CardTitle>
          </CardHeader>
          <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground p-4">
                  Ask me anything about our products!
                </div>
              )}
              {messages.map((message, index) => (
                <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8">
                       <AvatarFallback className='bg-primary text-primary-foreground'><Bot size={20} /></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("rounded-lg px-4 py-2 max-w-[80%] break-words", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-3 justify-start">
                    <Avatar className="h-8 w-8">
                       <AvatarFallback className='bg-primary text-primary-foreground'><Bot size={20} /></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-4 py-2 bg-muted flex items-center">
                        <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <CardFooter>
            <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
