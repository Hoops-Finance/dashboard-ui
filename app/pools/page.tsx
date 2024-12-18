"use client";

import { useDataContext } from "@/contexts/DataContext";
import { motion } from "framer-motion";
import { PoolsTable } from "@/components/PoolsTable";
import { TopPools } from "@/components/TopPools";
import { STABLECOIN_IDS } from "@/utils/utilities";

export default function PoolsPage() {
  const { poolRiskData, period, loading, pairs, tokens } = useDataContext();

  if (loading) {
    return (
      <section className="relative">
        <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
          Loading pools data...
        </div>
      </section>
    );
  }

  return (
    <section className="relative">
      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
        <motion.div 
          className="space-y-0.5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Explorer</h1>
          <p className="text-muted-foreground">Find the most profitable LPs across protocols</p>
        </motion.div>

        <TopPools
          data={poolRiskData}
          pairs={pairs}
          tokens={tokens}
          stablecoinIds={STABLECOIN_IDS}
          period={period}
        />

        <motion.div 
          className="pools-motion"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <PoolsTable
            data={poolRiskData}
            pairs={pairs}
            tokens={tokens}
          />
        </motion.div>
      </div>
    </section>
  );
}
