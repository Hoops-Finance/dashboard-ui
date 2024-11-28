'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowUp, Copy, RotateCcw, ThumbsUp, ThumbsDown, ArrowRight, Vault, ArrowLeft } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useTheme } from "@/components/ThemeContext"

const poolData = [
  { name: 'ETH/XLM', apy: 10.3 },
  { name: 'WBTC/ETH', apy: 9.1 },
  { name: 'USDC/ETH', apy: 8.2 },
  { name: 'DAI/USDT', apy: 7.5 },
  { name: 'USDC/USDT', apy: 6.8 },
]

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
}

export default function Home() {
  const { theme } = useTheme()
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [askedQuestion, setAskedQuestion] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [conversation, setConversation] = useState<Array<{role: 'user' | 'ai', content: string}>>([])
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const router = useRouter()

  const examplePrompts = [
    "Show me the best performing pools",
    "Analyze my portfolio risk",
    "Generate a daily report"
  ]

  const handleSubmit = () => {
    if (query.trim() === '') return;
    
    if (conversation.length > 0) {
      setShowAuthPrompt(true)
      return
    }
    
    setConversation(prev => [...prev, {role: 'user', content: query}]);
    
    if (query.toLowerCase().includes("best performing pools")) {
      setAskedQuestion(query);
      const aiResponse = `
        Based on current data, here are the top performing liquidity pools:

        1. ETH/XLM: 10.3% APY
        2. WBTC/ETH: 9.1% APY
        3. USDC/ETH: 8.2% APY
        4. DAI/USDT: 7.5% APY
        5. USDC/USDT: 6.8% APY

        The ETH/XLM pool is currently offering the highest APY at 10.3%. This could be due to increased trading activity or incentives provided by the protocol. However, remember that higher APY often comes with higher risk. 

        Here's a visualization of the current APYs:
      `;
      setResponse(aiResponse);
      setConversation(prev => [...prev, {role: 'ai', content: aiResponse}]);
    }
    setQuery('');
  }

  const handleReset = () => {
    setConversation([])
    setQuery('')
    setResponse(null)
    setAskedQuestion(null)
  }

  useEffect(() => {
    if (response && inputRef.current) {
      inputRef.current.focus()
    }
  }, [response])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pt-[72px]">
      <main className="flex-1 flex flex-col items-center justify-start p-8 max-w-4xl mx-auto w-full">
        {conversation.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mb-6"
          >
            <Button
              variant="ghost"
              onClick={handleReset}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </motion.div>
        )}

        <AnimatePresence>
          {conversation.length === 0 && (
            <motion.div
              className="text-center mb-12 pt-12"
              {...fadeInUp}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Vault className="h-4 w-4" />
                <span>$12.7M Total Value Locked</span>
              </motion.div>
              
              <motion.h1
                className="text-6xl font-bold mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Optimize Your <span className="text-primary">DeFi Strategy</span>
              </motion.h1>
              <motion.p
                className="text-xl text-muted-foreground mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                Unlock the power of data-driven insights for your DeFi investments
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {conversation.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex gap-4 mb-6 w-full"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={message.role === 'user' ? "/user-avatar.png" : "/ai-avatar.png"} />
              <AvatarFallback>{message.role === 'user' ? 'U' : 'AI'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className={`rounded-lg p-4 ${message.role === 'user' ? 'bg-muted' : 'bg-card'}`}>
                <p className="whitespace-pre-wrap text-lg">{message.content}</p>
                {message.role === 'ai' && index === conversation.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <ResponsiveContainer width="100%" height={300} className="mt-6">
                      <LineChart data={poolData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border opacity-20" />
                        <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground" />
                        <YAxis stroke="currentColor" className="text-muted-foreground" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: theme === 'dark' ? '#1F1F1F' : '#FFFFFF',
                            borderColor: theme === 'dark' ? '#2D2D2D' : '#E5E5E5',
                            color: theme === 'dark' ? '#E5E5E5' : '#1A1A1A'
                          }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="apy" 
                          stroke="currentColor" 
                          className="text-primary" 
                          strokeWidth={2} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Note: APYs are subject to change. Always do your own research before investing.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <Card className="bg-card border-border hover:border-primary/20 transition-all duration-300">
                        <CardHeader>
                          <CardTitle className="text-foreground/90 text-xl">Explore ETH/XLM Pool</CardTitle>
                          <CardDescription className="text-primary text-lg font-medium">
                            Highest APY at 10.3%
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-foreground/80 leading-relaxed">
                            Dive deeper into the ETH/XLM liquidity pool and understand its performance factors.
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                            View Details <ArrowRight className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>

                      <Card className="bg-card border-border hover:border-primary/20 transition-all duration-300">
                        <CardHeader>
                          <CardTitle className="text-foreground/90 text-xl">Follow-up Questions</CardTitle>
                          <CardDescription className="text-primary text-lg font-medium">
                            Explore more about liquidity pools
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {[
                              "What are the risks associated with high APY pools?",
                              "How often do APY rates change?",
                              "What factors influence APY in liquidity pools?"
                            ].map((question, i) => (
                              <li key={i} className="flex items-start gap-2 text-foreground/80">
                                <span className="text-primary">•</span>
                                <span className="leading-relaxed">{question}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            variant="outline" 
                            className="w-full border-primary/20 hover:bg-primary/10 text-foreground gap-2"
                          >
                            Ask a Question <ArrowRight className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  </motion.div>
                )}
              </div>
              {message.role === 'ai' && (
                <motion.div 
                  className="flex gap-2 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-400 hover:text-yellow-500 transition-colors duration-300">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-400 hover:text-yellow-500 transition-colors duration-300">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-400 hover:text-yellow-500 transition-colors duration-300">
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-400 hover:text-yellow-500 transition-colors duration-300">
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {conversation.length === 0 && (
            <motion.div
              className="w-full space-y-6"
              {...fadeInUp}
            >
              <div className="relative max-w-2xl mx-auto w-full">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask about pools, risks, or optimizations..."
                  className="w-full pl-12 pr-12 py-6 text-lg bg-background border-border rounded-xl 
                    focus:ring-2 focus:ring-primary focus:border-transparent 
                    placeholder:text-muted-foreground text-foreground transition-all duration-300"
                />
                <Button 
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg 
                    bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-300"
                  onClick={handleSubmit}
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {examplePrompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    className={`text-sm px-4 py-2 rounded-full border 
                      ${theme === 'dark' 
                        ? 'border-gray-700 text-gray-400 hover:border-yellow-400 hover:text-yellow-400' 
                        : 'border-gray-200 text-gray-500 hover:border-[#0D0D0D] hover:text-[#0D0D0D]'
                      } 
                      transition-all duration-300`}
                    onClick={() => setQuery(prompt)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {prompt} →
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {conversation.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="sticky bottom-0 w-full bg-background p-4 border-t border-border"
          >
            <div className="max-w-4xl mx-auto relative">
              <Input
                ref={inputRef}
                className="w-full pl-12 pr-12 py-6 text-lg bg-background border-border rounded-xl 
                  focus:ring-2 focus:ring-primary focus:border-transparent 
                  placeholder:text-muted-foreground transition-all duration-300"
                placeholder="Ask a follow-up question..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button 
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg 
                  bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-300"
                onClick={handleSubmit}
              >
                <ArrowUp className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="border-t border-border p-4">
        <nav className="flex justify-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors duration-300">Pricing</a>
          <a href="#" className="hover:text-primary transition-colors duration-300">Enterprise</a>
          <a href="#" className="hover:text-primary transition-colors duration-300">FAQ</a>
          <a href="#" className="hover:text-primary transition-colors duration-300">Legal</a>
          <a href="#" className="hover:text-primary transition-colors duration-300">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors duration-300">Explore</a>
          <a href="#" className="hover:text-primary transition-colors duration-300">Save ↗</a>
        </nav>
      </footer>

      <Dialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
        <DialogContent className="sm:max-w-[425px] bg-card border-primary">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Continue the conversation</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Sign up or log in to ask follow-up questions and get personalized insights.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => router.push("/signup")}
            >
              Sign Up
            </Button>
            <Button 
              className="w-full bg-card hover:bg-muted text-primary border border-primary"
              onClick={() => router.push("/login")}
            >
              Log In
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link 
                href="/login" 
                className="text-primary hover:text-primary/90 font-medium"
                onClick={() => setShowAuthPrompt(false)}
              >
                Sign in here
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showAuthPrompt && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" aria-hidden="true" />
      )}
    </div>
  )
}

