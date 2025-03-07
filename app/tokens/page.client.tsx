"use client";

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { PageLayout } from "@/components/ui/PageLayout";
import { Button } from "@/components/ui/button";
import { TopTokens } from "@/components/TopTokens";
import { TokenTable } from "@/components/TokenTable";
import type { Market, Pair, PoolRiskApiResponseObject, Token } from "@/utils/types";

interface TokensPageClientProps {
  tokens: Token[];
  pairs: Pair[];
  poolRiskData: PoolRiskApiResponseObject[];
  markets: Market[];
}

export default function TokensPageClient(props: TokensPageClientProps) {
  const { tokens, pairs, poolRiskData } = props;

  if (tokens.length === 0 || pairs.length === 0) {
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
        <TopTokens tokens={tokens} pairs={pairs} poolRiskData={poolRiskData} />
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
        <motion.div
          className="tokens-motion"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <TokenTable tokens={tokens} pairs={pairs} poolRiskData={poolRiskData} />
        </motion.div>
      </motion.div>
    </PageLayout>
  );
}
