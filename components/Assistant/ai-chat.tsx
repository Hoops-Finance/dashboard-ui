"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, Send, User, Copy, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "assistant" | "user";
  content: string;
}

interface FormProps {
  onSubmit: (e: FormEvent) => void;
  input: string;
  setInput: (value: string) => void;
  isTyping: boolean;
}

const initialMessages: Message[] = [
  {
    role: "assistant",
    content:
      "Hello! I'm Hoops AI, your personal DeFi strategy assistant. I can help you analyze strategies, understand market conditions, and optimize your yield farming. What would you like to know?",
  },
];

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = {
        role: "assistant" as const,
        content:
          "I'm analyzing your request about " +
          input +
          ". This is a demo response - in the real application, this would be processed by our AI model.",
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const Form: React.FC<FormProps> = ({ onSubmit, input, setInput, isTyping }) => (
    <form onSubmit={onSubmit} className="flex gap-3">
      <Input
        placeholder="Ask about strategies, market conditions, or optimization..."
        value={input}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setInput(e.target.value);
        }}
        className="flex-1 transition-all duration-300 focus:ring-2 focus:ring-primary text-base py-6"
        disabled={isTyping}
      />
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          type="submit"
          size="icon"
          className="h-12 w-12 bg-primary hover:bg-primary/90 transition-colors duration-300"
          disabled={isTyping || !input.trim()}
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </motion.div>
    </form>
  );

  return (
    <div className="flex-1 flex flex-col">
      <motion.div
        className="flex-1 overflow-auto p-4 space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="popLayout">
          {messages.map((message, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.4,
                delay: i * 0.1,
                type: "spring",
                stiffness: 100,
              }}
              layout
              onHoverStart={() => {
                setHoveredMessage(i);
              }}
              onHoverEnd={() => {
                setHoveredMessage(null);
              }}
            >
              <Card
                className={cn(
                  "p-6 max-w-[85%] transition-all duration-300",
                  message.role === "assistant"
                    ? "ml-0 bg-muted/50 hover:bg-muted/70"
                    : "ml-auto bg-primary text-primary-foreground hover:bg-primary/90",
                  hoveredMessage === i && "shadow-lg",
                )}
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                    }}
                    className={cn(
                      "rounded-full p-2",
                      message.role === "assistant" ? "bg-primary/10" : "bg-primary-foreground/10",
                    )}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </motion.div>
                  <div className="space-y-2 flex-1">
                    <div className="text-sm font-medium">
                      {message.role === "assistant" ? "Hoops AI" : "You"}
                    </div>
                    <div className="text-base leading-relaxed tracking-wide whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                </div>
                {message.role === "assistant" && (
                  <motion.div
                    className="flex gap-2 mt-4 justify-end"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredMessage === i ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {[
                      { icon: Copy, label: "Copy response" },
                      { icon: RotateCcw, label: "Regenerate response" },
                      { icon: ThumbsUp, label: "Helpful" },
                      { icon: ThumbsDown, label: "Not helpful" },
                    ].map((action, idx) => (
                      <motion.div key={idx} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors duration-300"
                          aria-label={action.label}
                        >
                          <action.icon className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="ml-0 max-w-[85%]"
            >
              <Card className="p-6 bg-muted/50">
                <div className="flex-center-g-4">
                  <div className="rounded-full p-2 bg-primary/10">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="border-t p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Form onSubmit={handleSubmit} input={input} setInput={setInput} isTyping={isTyping} />
      </motion.div>
    </div>
  );
}
