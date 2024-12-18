"use client";

import React from "react";
import { useDataContext } from "@/contexts/DataContext";
import { motion } from "framer-motion";
import { BookOpen } from 'lucide-react';
import { PoolsTable } from "@/components/PoolsTable";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TopPools } from "@/components/TopPools";

const STABLECOIN_IDS = new Set<string>([
  "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75", 
  "CDIKURWHYS4FFTR5KOQK6MBFZA2K3E26WGBQI6PXBYWZ4XIOPJHDFJKP",
  "CDTKPWPLOURQA2SGTKTUQOWRCBZEORB4BWBOMJ3D3ZTQQSGE5F6JBQLV", 
  "CBN3NCJSMOQTC6SPEYK3A44NU4VS3IPKTARJLI3Y77OH27EWBY36TP7U"
]);

export default function PoolsPage() {
  const { poolRiskData, period, setPeriod, loading, pairs, tokens } = useDataContext();

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
          <div className="flex items-center justify-between mb-4">
            <Select 
              value={period}
              onValueChange={(v) => { setPeriod(v as typeof period); }}
              aria-label="Select time period"
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {['24h','7d','14d','30d','90d','180d','360d'].map(p => (
                  <SelectItem key={p} value={p}>
                    {p.toUpperCase()} Period
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              className="h-9 gap-2"
              onClick={() => window.open('https://api.hoops.finance', '_blank')}
            >
              <BookOpen className="h-4 w-4" />
              Read the docs
            </Button>
          </div>

          <PoolsTable
            data={poolRiskData}
            pairs={pairs}
            tokens={tokens}
            period={period}
            showSearch={false} 
            showPagination={true} 
            showPeriodLabel={true}
          />
        </motion.div>
      </div>
    </section>
  );
}
