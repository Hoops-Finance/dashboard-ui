"use client";

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pair, PoolRiskApiResponseObject, Token } from "@/utils/newTypes";
import { useDataContext } from "@/contexts/DataContext";

function FlameIcon() {
  return (
    <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 4l-1 2H6l5 8h3l5-8h-6l1-2z"/><path d="M13 12l-2 4h6"/></svg>
  );
}

function DiamondIcon() {
  return (
    <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20v-8m-6 8v-4m12 4V8"/>
    </svg>
  );
}

function CoinsIcon() {
  return (
    <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M12 1v22m-7-7h14"/></svg>
  );
}

interface TopPoolsProps {
  data: PoolRiskApiResponseObject[];
  pairs: Pair[];
  tokens: Token[];
  stablecoinIds: Set<string>;
  period: string;
}

function parseAPR(aprString: string): number {
  if (!aprString) return 0;
  const n = parseFloat(aprString.replace(/[^0-9.-]+/g, ''));
  return isNaN(n) ? 0 : n;
}

function parseVolume(volumeString: string): number {
  const n = parseFloat(volumeString.replace(/[^0-9.-]+/g, ''));
  return isNaN(n) ? 0 : n;
}

export function TopPools({ data, pairs, tokens, stablecoinIds, period }: TopPoolsProps) {
  const { buildPoolRoute } = useDataContext();

  function getTokensForPair(pair: Pair) {
    const t0 = tokens.find(t=>t.id===pair.token0);
    const t1 = tokens.find(t=>t.id===pair.token1);
    return {t0, t1};
  }

  function getPairLabel(pool: PoolRiskApiResponseObject) {
    const p = pairs.find(pr=>pr.id===pool.pairId);
    if (!p) return pool.market;
    const {t0,t1}=getTokensForPair(p);
    if(!t0||!t1) return pool.market;
    const t0Label = t0.name.split(':')[0];
    const t1Label = t1.name.split(':')[0];
    return `${t0Label}/${t1Label}`;
  }

  function handleViewDetails(pool: PoolRiskApiResponseObject) {
    const route = buildPoolRoute(pool);
    window.location.href = route;
  }

  const topByAPR = useMemo(()=>{
    const withApr = data.slice().sort((a,b)=>parseAPR(b.apr)-parseAPR(a.apr));
    return withApr.slice(0,5);
  },[data]);

  const topByVolume = useMemo(()=>{
    const withVol = data.slice().sort((a,b)=>parseVolume(b.volume)-parseVolume(a.volume));
    return withVol.slice(0,5);
  },[data]);

  const stablecoinPools = useMemo(()=>{
    const pairMap = new Map(pairs.map(p=>[p.id,p]));
    function isStablecoinPool(id:string){
      const pp=pairMap.get(id);
      if(!pp)return false;
      return stablecoinIds.has(pp.token0) && stablecoinIds.has(pp.token1);
    }
    const stables = data.filter(pool=>isStablecoinPool(pool.pairId));
    stables.sort((a,b)=>parseAPR(b.apr)-parseAPR(a.apr));
    return stables.slice(0,5);
  },[data,pairs,stablecoinIds]);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <motion.div
        initial={{ opacity:0,y:20}}
        animate={{opacity:1,y:0}}
        transition={{duration:0.3,delay:0.1}}
        whileHover={{scale:1.02}}
        className="transform-gpu"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex-center-g-2">
              <FlameIcon/>
              Best APR Pairs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topByAPR.map((item,i)=>{
              const rank=i+1;
              const pairLabel=getPairLabel(item);
              const aprVal=parseAPR(item.apr);
              return(
                <motion.div
                  key={item.pairId}
                  className="flex items-center justify-between group cursor-pointer"
                  whileHover={{x:4}}
                  onClick={()=>handleViewDetails(item)}
                >
                  <div className="flex-center-g-2">
                    <span className="text-muted-foreground">#{rank}</span>
                    <span className="text-foreground font-medium group-hover:text-primary transition-colors duration-200">
                      {pairLabel}
                    </span>
                  </div>
                  <span className={aprVal>=0?'text-green-500':'text-red-500'}>
                    {aprVal.toFixed(2)}%
                  </span>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{opacity:0,y:20}}
        animate={{opacity:1,y:0}}
        transition={{duration:0.3,delay:0.2}}
        whileHover={{scale:1.02}}
        className="transform-gpu"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex-center-g-2">
              <DiamondIcon/>
              Highest Volume Pairs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topByVolume.map((item,i)=>{
              const rank=i+1;
              const pairLabel=getPairLabel(item);
              const volVal=parseVolume(item.volume);
              return(
                <motion.div
                  key={item.pairId}
                  className="flex items-center justify-between group cursor-pointer"
                  whileHover={{x:4}}
                  onClick={()=>handleViewDetails(item)}
                >
                  <div className="flex-center-g-2">
                    <span className="text-muted-foreground">#{rank}</span>
                    <span className="text-foreground font-medium group-hover:text-primary transition-colors duration-200">
                      {pairLabel}
                    </span>
                  </div>
                  <span className="text-foreground">${volVal.toLocaleString()}</span>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{opacity:0,y:20}}
        animate={{opacity:1,y:0}}
        transition={{duration:0.3,delay:0.3}}
        whileHover={{scale:1.02}}
        className="transform-gpu"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex-center-g-2">
              <CoinsIcon/>
              Best Stable Coin Pools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stablecoinPools.map((item,i)=>{
              const rank=i+1;
              const pairLabel=getPairLabel(item);
              const aprVal=parseAPR(item.apr);
              return(
                <motion.div
                  key={item.pairId}
                  className="flex items-center justify-between group cursor-pointer"
                  whileHover={{x:4}}
                  onClick={()=>handleViewDetails(item)}
                >
                  <div className="flex-center-g-2">
                    <span className="text-muted-foreground">#{rank}</span>
                    <span className="text-foreground font-medium group-hover:text-primary transition-colors duration-200">
                      {pairLabel}
                    </span>
                  </div>
                  <span className={aprVal>=0?'text-green-500':'text-red-500'}>
                    {aprVal.toFixed(2)}%
                  </span>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
