"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bot, Send, User } from 'lucide-react'
import { cn } from "@/lib/utils"

interface Message {
  role: "assistant" | "user"
  content: string
}

const initialMessages: Message[] = [
  {
    role: "assistant",
    content: "Hello! I'm Hoops AI, your personal DeFi strategy assistant. I can help you analyze strategies, understand market conditions, and optimize your yield farming. What would you like to know?"
  }
]

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessages = [
      ...messages,
      { role: "user", content: input },
      { 
        role: "assistant", 
        content: `I'm analyzing your request about ${input}.\n\nBased on current market conditions and your portfolio data, here are my insights:\n\n1. Market Overview\n   • Current market sentiment is bullish\n   • Overall DeFi TVL has increased by 15% this week\n   • Your selected pools are performing above market average\n\n2. Strategy Analysis\n   • Universal Savings: Low risk, stable 12.45% APR\n   • Ecosystem Value: Medium risk, potential for 28.67% APR\n   • New Projects: High risk, opportunities for 45.88% APR\n\n3. Recommendations\n   • Consider rebalancing towards stable pairs given market volatility\n   • Monitor gas fees for optimal entry points\n   • Set up automated stop-loss at -5% to protect gains\n\nWould you like me to provide more specific details about any of these aspects?`
      }
    ]
    setMessages(newMessages)
    setInput("")
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message, i) => (
          <Card
            key={i}
            className={cn(
              "p-6 max-w-[85%] shadow-sm",
              message.role === "assistant" 
                ? "ml-0 bg-card border-border" 
                : "ml-auto bg-primary/10 border-primary/20"
            )}
          >
            <div className="flex items-start gap-4">
              {message.role === "assistant" ? (
                <Bot className="h-6 w-6 mt-1 text-primary" />
              ) : (
                <User className="h-6 w-6 mt-1 text-primary" />
              )}
              <div className="space-y-2">
                <div className="font-medium text-foreground">
                  {message.role === "assistant" ? "Hoops AI" : "You"}
                </div>
                <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="border-t border-border p-6">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <Input
            placeholder="Ask about strategies, market conditions, or optimization..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" className="h-10 w-10">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

