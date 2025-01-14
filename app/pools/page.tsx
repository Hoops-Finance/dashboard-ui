"use client";

import { useDataContext } from "@/contexts/DataContext";
import { motion } from "framer-motion";

import { PageLayout } from "@/components/ui/PageLayout.tsx";
import { PoolsTable } from "@/components/PoolsTable";
import { TopPools } from "@/components/TopPools";
import { STABLECOIN_IDS } from "@/utils/utilities";
import { Button } from "@/components/ui/button.tsx";
import { BookOpen } from "lucide-react";

export default function PoolsPage() {
  const { poolRiskData, period, loading, pairs, tokens } = useDataContext();

  if (loading) {
    return (
      <section className="relative">
        <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">Loading pools data...</div>
      </section>
    );
  }

  return (
    <PageLayout>
      <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <motion.div className="space-y-1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <h1 className="text-2xl font-bold text-foreground">Explorer</h1>
          <p className="text-muted-foreground">Find the most profitable LPs across protocols</p>
        </motion.div>

        <TopPools data={poolRiskData} pairs={pairs} tokens={tokens} stablecoinIds={STABLECOIN_IDS} period={period} />

        <div className="flex items-center justify-end">
          <Button variant="outline" className="h-9 gap-2" onClick={() => window.open("https://api.hoops.finance", "_blank")}>
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Read the docs
          </Button>
        </div>

        <motion.div className="pools-motion" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.4 }}>
          <PoolsTable data={poolRiskData} pairs={pairs} tokens={tokens} />
        </motion.div>
      </motion.div>
    </PageLayout>
  );
}
