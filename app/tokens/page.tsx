"use client";

import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/ui/PageLayout.tsx";
import { TokenTable } from "@/components/TokenTable";
import { TopTokens } from "@/components/TopTokens";
import { motion } from "framer-motion";
import { useDataContext } from "@/contexts/DataContext";

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
    <PageLayout>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="space-y-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Tokens</h1>
          <p className="text-muted-foreground">Track and analyze token performance</p>
        </motion.div>

        {/* Top Tokens metrics */}
        <TopTokens tokens={tokens} pairs={pairs} poolRiskData={poolRiskData} />

        {/* A "Read the docs" button similar to pools */}
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            className="h-9 gap-2"
            onClick={() => window.open("https://api.hoops.finance", "_blank")}
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Read the docs
          </Button>
        </div>

        {/* Tokens Table */}
        <TokenTable tokens={tokens} pairs={pairs} poolRiskData={poolRiskData} />
      </motion.div>
    </PageLayout>
  );
}
