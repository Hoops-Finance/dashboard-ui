"use client";

import { useDataContext } from "@/contexts/DataContext";
import { motion } from "framer-motion";
import { BookOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { TopTokens } from "@/components/TopTokens";
import { TokenTable } from "@/components/TokenTable";

export default function TokensPage() {
  const { poolRiskData, pairs, tokens, loading } = useDataContext();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-background flex flex-col items-center justify-center gap-2">
        Loading tokens data...
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
        <motion.div
          className="space-y-0.5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Tokens</h1>
          <p className="text-sm text-muted-foreground">Track and analyze token performance</p>
        </motion.div>

        {/* Top Tokens metrics */}
        <TopTokens
          tokens={tokens}
          pairs={pairs}
          poolRiskData={poolRiskData}
        />

        {/* A "Read the docs" button similar to pools */}
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            className="h-9 gap-2"
            onClick={() => window.open('https://api.hoops.finance', '_blank')}
          >
            <BookOpen className="h-4 w-4" aria-hidden="true"/>
            Read the docs
          </Button>
        </div>

        {/* Tokens Table */}
        <TokenTable
          tokens={tokens}
          pairs={pairs}
          poolRiskData={poolRiskData}
        />
      </div>
    </div>
  );
}
