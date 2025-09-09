'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import GlitchText from '@/components/GlitchText';
import { answerRuleQuestion, AnswerRuleQuestionOutput } from '@/ai/flows/answer-rule-question';
import { useToast } from '@/hooks/use-toast';
import { StatCard } from '@/components/StatCard';

type Message = {
  role: 'user' | 'bot';
  content: string;
  creature?: AnswerRuleQuestionOutput['creature']
};

export default function RulesChatbotPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: "I am the Chronicler. Ask me about the rules of this reality... I'll tell you what you need to know. Try asking 'What are the rules for grappling?' or 'Tell me about the Aboleth'.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await answerRuleQuestion({ question: input });
      const botMessage: Message = { role: 'bot', content: result.answer, creature: result.creature };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error contacting the Chronicler',
        description: 'The machine spirit is unresponsive. Please try again later.',
        variant: 'destructive',
      });
       const botMessage: Message = { role: 'bot', content: 'The connection is weak... I cannot answer right now.' };
       setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // This is a bit of a hack to scroll to bottom. A better solution might be needed.
    setTimeout(() => {
        const scrollable = document.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollable) {
            scrollable.scrollTop = scrollable.scrollHeight;
        }
    }, 100);
  }, [messages]);


  return (
    <div className="p-4 sm:p-6 md:p-8 h-[calc(100vh-4rem)] flex flex-col">
      <header className="flex-shrink-0 mb-6">
        <h1 className="text-4xl font-headline font-bold">Rules Assistant</h1>
        <p className="text-muted-foreground">Whisper your questions to the machine spirit.</p>
      </header>

      <div className="flex-grow min-h-0 bg-card/20 backdrop-blur-sm rounded-lg border border-border flex flex-col">
        <ScrollArea className="flex-grow p-4">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div key={index} className={cn('flex items-start gap-4', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                {message.role === 'bot' && (
                  <Avatar className="border-2 border-accent">
                    <AvatarFallback className="bg-transparent text-accent flicker">
                      <Bot />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={cn('max-w-2xl rounded-lg p-3 text-sm', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                  {message.role === 'bot' ? <GlitchText text="Chronicler:" className="text-sm mb-2" /> : <p className="font-bold mb-1">You:</p>}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                   {message.creature && (
                      <StatCard monster={message.creature as any} showSendToCompendium={true} className="mt-4"/>
                   )}
                </div>
                 {message.role === 'user' && (
                  <Avatar className="border-2 border-primary">
                    <AvatarFallback className="bg-transparent text-primary">
                      <User />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && (
                <div className="flex items-start gap-4 justify-start">
                    <Avatar className="border-2 border-accent">
                        <AvatarFallback className="bg-transparent text-accent flicker">
                        <Bot />
                        </AvatarFallback>
                    </Avatar>
                    <div className="max-w-md rounded-lg p-3 bg-secondary">
                        <p className="animate-pulse text-muted-foreground">Chronicler is thinking...</p>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border bg-background/80 rounded-b-lg">
          <div className="flex items-center gap-2">
            <Textarea
              placeholder="Type your question..."
              className="flex-grow resize-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button onClick={handleSend} disabled={isLoading} className="bleeding-btn">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
