import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import aiLogo from '@/assets/ai-logo.png';

type Message = { role: 'user' | 'assistant'; content: string };

const SUGGESTED_PROMPTS = [
  "What's the programme schedule for Annual Day?",
  "Tell me about MES Campus School",
  "What activities are planned for the celebration?",
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/annual-day-chat`;

export const AIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [visiblePrompts, setVisiblePrompts] = useState(SUGGESTED_PROMPTS);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const removeSuggestion = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setVisiblePrompts(prev => prev.filter((_, i) => i !== index));
  };

  const streamChat = useCallback(async (userMessages: Message[], onDelta: (text: string) => void, onDone: () => void) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages }),
    });

    if (!resp.ok || !resp.body) {
      const error = await resp.json().catch(() => ({ error: "Failed to connect" }));
      throw new Error(error.error || "Failed to start stream");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    onDone();
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    let assistantSoFar = "";
    const upsertAssistant = (nextChunk: string) => {
      assistantSoFar += nextChunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat(
        [...messages, userMsg],
        (chunk) => upsertAssistant(chunk),
        () => setIsLoading(false)
      );
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.' 
      }]);
      setIsLoading(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setIsOpen(true);
    sendMessage(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50"
          >
            {/* Suggested Prompts */}
            {showSuggestions && visiblePrompts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-20 right-0 w-72 space-y-2"
              >
                {visiblePrompts.map((prompt, index) => (
                  <motion.div
                    key={prompt}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                  >
                    <button
                      onClick={() => handlePromptClick(prompt)}
                      className="w-full text-left glass-card rounded-lg p-3 text-sm text-foreground hover:border-primary/50 border border-border/50 transition-all pr-8"
                    >
                      {prompt}
                    </button>
                    <button
                      onClick={(e) => removeSuggestion(index, e)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="w-16 h-16 rounded-full bg-primary shadow-lg flex items-center justify-center animate-glow overflow-hidden"
              style={{ boxShadow: '0 0 30px hsla(42, 78%, 60%, 0.4)' }}
            >
              <img src={aiLogo} alt="AI" className="w-20 h-20 object-cover scale-125" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-96 bg-card border-l border-border z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between bg-card/80 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                    <img src={aiLogo} alt="AI" className="w-10 h-10 object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-primary text-sm">ANNUAL DAY ASSISTANT</p>
                    <a 
                      href="https://cyberdoom.rf.gd" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-foreground hover:text-primary transition-colors flex items-center gap-1 text-xs"
                    >
                      CyberDoom Agentic Ver.2
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <p className="text-xs text-muted-foreground">By vasudevr</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                      <img src={aiLogo} alt="AI" className="w-20 h-20 object-cover" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Annual Day AI Assistant</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Ask me anything about MES Campus School's Annual Day celebration!
                    </p>
                    <div className="space-y-2">
                      {visiblePrompts.map((prompt, index) => (
                        <button
                          key={prompt}
                          onClick={() => sendMessage(prompt)}
                          className="w-full text-left glass-card rounded-lg p-3 text-sm text-foreground hover:border-primary/50 border border-border/50 transition-all"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'glass-card border border-border/50 rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="glass-card border border-border/50 rounded-2xl rounded-bl-md px-4 py-3">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t border-border bg-card/80 backdrop-blur">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask about Annual Day..."
                    className="flex-1 bg-muted border-border"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isLoading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
