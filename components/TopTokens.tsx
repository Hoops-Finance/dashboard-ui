"use client";

import { useMemo } from "react";
import { TokenCard } from "@/components/TopTokenCard";
import type { Token, Pair, PoolRiskApiResponseObject } from "@/utils/types";
import { STABLECOIN_IDS } from "@/utils/utilities";
import { DollarIcon, LightningIcon, WaterIcon } from "@/components/ui/icons";

interface TopTokensProps {
  tokens: Token[];
  pairs: Pair[];
  poolRiskData: PoolRiskApiResponseObject[];
}

// We'll derive volume per token from poolRiskData and pairs:
function getTokenVolumeMap(
  tokens: Token[],
  pairs: Pair[],
  poolRiskData: PoolRiskApiResponseObject[],
): Map<string, number> {
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
  const volumeMap = useMemo(
    () => getTokenVolumeMap(tokens, pairs, poolRiskData),
    [tokens, pairs, poolRiskData],
  );
  const tvlMap = useMemo(() => getTokenTVLMap(pairs), [pairs]);
  const stablecoins = useMemo(() => tokens.filter((t) => STABLECOIN_IDS.has(t.id)), [tokens]);

  const topByVolume = useMemo(() => {
    const arr = tokens
      .filter((t) => volumeMap.has(t.id))
      .map((t) => ({ token: t, volume: volumeMap.get(t.id) ?? 0 }));
    arr.sort((a, b) => b.volume - a.volume);
    return arr.slice(0, 5);
  }, [tokens, volumeMap]);

  const topByLiquidity = useMemo(() => {
    const arr = tokens
      .filter((t) => tvlMap.has(t.id))
      .map((t) => ({ token: t, tvl: tvlMap.get(t.id) ?? 0 }));
    arr.sort((a, b) => b.tvl - a.tvl);
    return arr.slice(0, 5);
  }, [tokens, tvlMap]);

  const topStables = useMemo(() => {
    const arr = stablecoins.map((s) => ({ token: s, tvl: tvlMap.get(s.id) ?? 0 }));
    arr.sort((a, b) => b.tvl - a.tvl);
    return arr.slice(0, 5);
  }, [stablecoins, tvlMap]);

  return (
    <div className="topTokensOverview" role="region" aria-label="Top Tokens Overview">
      <TokenCard
        icon={<LightningIcon />}
        title="Top Volume"
        delay={0.1}
        data={topByVolume.map((item) => ({ token: item.token, value: item.volume }))}
      />

      <TokenCard
        icon={<WaterIcon />}
        title="Top Liquidity"
        delay={0.2}
        data={topByLiquidity.map((item) => ({ token: item.token, value: item.tvl }))}
      />

      <TokenCard
        icon={<DollarIcon />}
        title="Top Stablecoins"
        delay={0.3}
        data={topStables.map((item) => ({ token: item.token, value: item.tvl }))}
      />
    </div>
  );
}
