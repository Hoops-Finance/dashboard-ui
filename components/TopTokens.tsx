"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Token, Pair, PoolRiskApiResponseObject } from "@/utils/types";
import { STABLECOIN_IDS } from "@/utils/utilities";

function LightningIcon() {
  return (
    <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function WaterIcon() {
  return (
    <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 2C12 2 5 9.5 5 14c0 3.314 2.686 6 6 6s6-2.686 6-6c0-4.5-7-12-7-12z" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
      <path d="M12 1v22m-7-7h14" />
    </svg>
  );
}

interface TopTokensProps {
  tokens: Token[];
  pairs: Pair[];
  poolRiskData: PoolRiskApiResponseObject[];
}

// We'll derive volume per token from poolRiskData and pairs:
function getTokenVolumeMap(tokens: Token[], pairs: Pair[], poolRiskData: PoolRiskApiResponseObject[]): Map<string, number> {
  const pairMap = new Map<string, Pair>(pairs.map((p) => [p.id, p]));
  const volMap = new Map<string, number>();
  for (const pd of poolRiskData) {
    const vol = parseFloat(pd.volume);
    const p = pairMap.get(pd.pairId);
    if (!p) continue;
    volMap.set(p.token0, (volMap.get(p.token0) ?? 0) + vol);
    volMap.set(p.token1, (volMap.get(p.token1) ?? 0) + vol);
  }
  return volMap;
}

function getTokenTVLMap(pairs: Pair[]): Map<string, number> {
  const tvlMap = new Map<string, number>();
  for (const p of pairs) {
    if (!p.tvl) continue;
    tvlMap.set(p.token0, (tvlMap.get(p.token0) ?? 0) + p.tvl);
    tvlMap.set(p.token1, (tvlMap.get(p.token1) ?? 0) + p.tvl);
  }
  return tvlMap;
}

export function TopTokens({ tokens, pairs, poolRiskData }: TopTokensProps) {
  const volumeMap = useMemo(() => getTokenVolumeMap(tokens, pairs, poolRiskData), [tokens, pairs, poolRiskData]);
  const tvlMap = useMemo(() => getTokenTVLMap(pairs), [pairs]);

  const stablecoins = useMemo(() => {
    return tokens.filter((t) => STABLECOIN_IDS.has(t.id));
  }, [tokens]);

  const topByVolume = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const arr = tokens.filter((t) => volumeMap.has(t.id)).map((t) => ({ token: t, volume: volumeMap.get(t.id)! }));
    arr.sort((a, b) => b.volume - a.volume);
    return arr.slice(0, 5);
  }, [tokens, volumeMap]);

  const topByLiquidity = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const arr = tokens.filter((t) => tvlMap.has(t.id)).map((t) => ({ token: t, tvl: tvlMap.get(t.id)! }));
    arr.sort((a, b) => b.tvl - a.tvl);
    return arr.slice(0, 5);
  }, [tokens, tvlMap]);

  const topStables = useMemo(() => {
    const arr = stablecoins.map((s) => ({ token: s, tvl: tvlMap.get(s.id) ?? 0 }));
    arr.sort((a, b) => b.tvl - a.tvl);
    return arr.slice(0, 5);
  }, [stablecoins, tvlMap]);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} whileHover={{ scale: 1.02 }} className="transform-gpu">
        <Card>
          <CardHeader>
            <CardTitle className="flex-center-g-2">
              <LightningIcon />
              Top Tokens by Volume
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topByVolume.map((item, i) => {
              const rank = i + 1;
              const symbolName = item.token.name.split(":")[0];
              return (
                <div key={item.token.id} className="flex items-center justify-between">
                  <div className="flex-center-g-2">
                    <span className="text-muted-foreground">#{rank}</span>
                    <span className="text-foreground font-medium">
                      {symbolName} ({item.token.symbol})
                    </span>
                  </div>
                  <span className="text-foreground">${item.volume.toLocaleString()}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }} whileHover={{ scale: 1.02 }} className="transform-gpu">
        <Card>
          <CardHeader>
            <CardTitle className="flex-center-g-2">
              <WaterIcon />
              Top Tokens by Liquidity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topByLiquidity.map((item, i) => {
              const rank = i + 1;
              const symbolName = item.token.name.split(":")[0];
              return (
                <div key={item.token.id} className="flex items-center justify-between">
                  <div className="flex-center-g-2">
                    <span className="text-muted-foreground">#{rank}</span>
                    <span className="text-foreground font-medium">
                      {symbolName} ({item.token.symbol})
                    </span>
                  </div>
                  <span className="text-foreground">${item.tvl.toLocaleString()}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }} whileHover={{ scale: 1.02 }} className="transform-gpu">
        <Card>
          <CardHeader>
            <CardTitle className="flex-center-g-2">
              <DollarIcon />
              Top Stablecoins
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topStables.map((item, i) => {
              const rank = i + 1;
              const symbolName = item.token.name.split(":")[0];
              return (
                <div key={item.token.id} className="flex items-center justify-between">
                  <div className="flex-center-g-2">
                    <span className="text-muted-foreground">#{rank}</span>
                    <span className="text-foreground font-medium">
                      {symbolName} ({item.token.symbol})
                    </span>
                  </div>
                  <span className="text-foreground">${item.tvl.toLocaleString()}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
