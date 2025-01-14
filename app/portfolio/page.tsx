"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

import { PageLayout } from "@/components/ui/PageLayout";
import { Card } from "@/components/ui/card";
import { TradingViewChart } from "@/components/TradingViewChart";
import { ChevronDown, ChevronUp, Bot, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useDataContext } from "@/contexts/DataContext";
import type {
  PoolRiskApiResponseObject,
  Pair,
  Token
} from "@/utils/types";

// ---------------------------------------------------------------------------
// Helpers & Mock Data
// ---------------------------------------------------------------------------

function formatUSD(value: number): string {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatTokenAmount(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  });
}

function getRiskColor(level: "Low" | "Medium" | "High") {
  switch (level) {
    case "Low":
      return "text-emerald-400";
    case "Medium":
      return "text-yellow-400";
    case "High":
      return "text-red-400";
    default:
      return "text-muted-foreground";
  }
}

/** Mock “prices” for a few known labels. */
function getMockPrice(label: string): number {
  const sym = label.toUpperCase();
  if (sym.includes("XLM")) return 0.12;
  if (sym.includes("USDC")) return 1.0;
  if (sym.includes("AQUA")) return 0.0005;
  if (sym.includes("DOGE")) return 0.09;
  if (sym.includes("LP(")) return 0.0;
  if (sym.includes("STRATEGY")) return 0.0;
  return 0.5; // fallback
}

const USER_METRICS = [
  { label: "Your Portfolio Value", value: "$6,500.00", change: "+2.1%" },
  { label: "24h PnL", value: "+$140.00", change: "+7.4%" },
  { label: "Your Strategies", value: "3", change: "+1" },
  { label: "Your Realized PnL", value: "$320.00", change: "+15.8%" }
];

const GLOBAL_METRICS = [
  { label: "Global TVL", value: "$12.7M", change: "+12.5%" },
  { label: "Global 24h Volume", value: "$1.2M", change: "-5.2%" },
  { label: "Active Strategies", value: "81", change: "+1" },
  { label: "Global Profit", value: "$234.5K", change: "+18.3%" }
];

// ---------------------------------------------------------------------------
// Strategy Creation & Data Structures
// ---------------------------------------------------------------------------

export interface CreationRule {
  type: "automated" | "manual";
  sortMetric?: "apr" | "lowRisk" | "tvl" | "volume";
  topN?: number;
  distributionMethod?: "static" | "dynamic";
  rebalancingMethod?: "manual" | "auto" | "timeBased" | "thresholdBased";
  rebalancingFrequency?: number; // in hours or days
  chosenPairs?: { pairId: string; distribution: number }[];
}

interface UserStrategy {
  id: string;
  name: string;
  baseToken: string; 
  tokens: { symbol: string }[];
  description: string;
  riskLevel: "Low" | "Medium" | "High";
  userBalance: number;
  pools: (PoolRiskApiResponseObject & { distribution?: number })[];
  creationRule: CreationRule;
}

interface BalanceItem {
  label: string;
  address: string;
  amount: number;
  locked: boolean;
  children?: BalanceItem[];
}

// ---------------------------------------------------------------------------
// Build Strategies & Balances (Mock)
// ---------------------------------------------------------------------------

function buildUserStrategies(poolRiskData: PoolRiskApiResponseObject[]): UserStrategy[] {
  const sorted = [...poolRiskData].sort(
    (a, b) => parseFloat(b.apr) - parseFloat(a.apr)
  );
  const top3 = sorted.slice(0, 3);
  const next2 = sorted.slice(3, 5);
  const next4 = sorted.slice(5, 9);

  return [
    {
      id: "HIGH_APR",
      name: "High APR Pools",
      baseToken: "USDC",
      tokens: [{ symbol: "🚀" }],
      description: "Auto picks top 3 by APR evenly.",
      riskLevel: "High",
      userBalance: 1000,
      pools: top3.map((p) => ({ ...p, distribution: 100 / top3.length })),
      creationRule: {
        type: "automated",
        sortMetric: "apr",
        topN: 3,
        distributionMethod: "static",
        rebalancingMethod: "manual"
      }
    },
    {
      id: "LOW_RISK",
      name: "Low Risk Saver",
      baseToken: "XLM",
      tokens: [{ symbol: "🔒" }],
      description: "Focus on stable, lower-vol pools (2 pools).",
      riskLevel: "Low",
      userBalance: 600,
      pools: next2.map((p) => ({ ...p, distribution: 100 / next2.length })),
      creationRule: {
        type: "automated",
        sortMetric: "lowRisk",
        topN: 2,
        distributionMethod: "dynamic",
        rebalancingMethod: "timeBased",
        rebalancingFrequency: 24 // every 24 hours, for example
      }
    },
    {
      id: "MANUAL_MIX",
      name: "Manual Mix",
      baseToken: "USDC",
      tokens: [{ symbol: "🛠" }],
      description: "Manually curated 4 mid-tier pools (25% each).",
      riskLevel: "Medium",
      userBalance: 800,
      pools: next4.map((p) => ({
        ...p,
        distribution: 100 / next4.length
      })),
      creationRule: {
        type: "manual",
        chosenPairs: next4.map((p) => ({
          pairId: p.pairId,
          distribution: 100 / next4.length
        }))
      }
    }
  ];
}

function buildHierarchicalBalances(
  strategies: UserStrategy[],
  pairs: Pair[],
  tokens: Token[]
): BalanceItem[] {
  const xlmAddress = tokens.find((t) => t.symbol === "XLM")?.id || "native";
  const usdcAddress = tokens.find((t) => t.symbol === "USDC")?.id || "???";

  const xlm: BalanceItem = {
    label: "XLM",
    address: xlmAddress,
    amount: 120,
    locked: false
  };
  const usdc: BalanceItem = {
    label: "USDC",
    address: usdcAddress,
    amount: 500,
    locked: false
  };

  const stratNodes: BalanceItem[] = strategies.map((s) => {
    const stratNode: BalanceItem = {
      label: `Strategy: ${s.name} (${s.baseToken})`,
      address: `strategy-${s.id}`,
      amount: s.userBalance,
      locked: true,
      children: []
    };

    stratNode.children = s.pools.map((p) => {
      const lockedAmount = (s.userBalance * (p.distribution || 0)) / 100;
      const lpNode: BalanceItem = {
        label: `LP(${p.market})`,
        address: p.pairId,
        amount: lockedAmount,
        locked: true,
        children: []
      };
      const matchedPair = pairs.find((pp) => pp.id === p.pairId);
      if (matchedPair) {
        const half = lockedAmount / 2;
        const t0Addr = matchedPair.token0;
        const t1Addr = matchedPair.token1;

        const t0Symbol = tokens.find((tt) => tt.id === t0Addr)?.symbol || "T0";
        const t1Symbol = tokens.find((tt) => tt.id === t1Addr)?.symbol || "T1";

        lpNode.children = [
          {
            label: `underlying ${t0Symbol}`,
            address: t0Addr,
            amount: half,
            locked: true
          },
          {
            label: `underlying ${t1Symbol}`,
            address: t1Addr,
            amount: half,
            locked: true
          }
        ];
      }
      return lpNode;
    });

    return stratNode;
  });

  return [xlm, usdc, ...stratNodes];
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function PortfolioPage() {
  const { poolRiskData, pairs, tokens } = useDataContext();

  const userStrats = useMemo(() => buildUserStrategies(poolRiskData), [poolRiskData]);
  const userBalances = useMemo(
    () => buildHierarchicalBalances(userStrats, pairs, tokens),
    [userStrats, pairs, tokens]
  );

  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);
  const [analyzeId, setAnalyzeId] = useState<string | null>(null);
  const [depositId, setDepositId] = useState<string | null>(null);
  const [withdrawId, setWithdrawId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <PageLayout>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 1) Global + User Metrics */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-foreground">
            Global Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {GLOBAL_METRICS.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="p-4 bg-card border-border hover:shadow-md transition-all duration-300">
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                  <div className="text-2xl font-bold text-foreground mt-1">
                    {metric.value}
                  </div>
                  <motion.div
                    className={`text-sm mt-1 ${
                      metric.change.startsWith("+")
                        ? "text-emerald-400"
                        : metric.change.startsWith("-")
                        ? "text-red-400"
                        : "text-muted-foreground"
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                  >
                    {metric.change}
                  </motion.div>
                </Card>
              </motion.div>
            ))}
          </div>

          <h2 className="text-lg font-semibold mb-2 text-foreground">
            Your Account Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {USER_METRICS.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="p-4 bg-card border-border hover:shadow-md transition-all duration-300">
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                  <div className="text-2xl font-bold text-foreground mt-1">
                    {metric.value}
                  </div>
                  <motion.div
                    className={`text-sm mt-1 ${
                      metric.change.startsWith("+")
                        ? "text-emerald-400"
                        : metric.change.startsWith("-")
                        ? "text-red-400"
                        : "text-muted-foreground"
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                  >
                    {metric.change}
                  </motion.div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 2) Chart + Strategies */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="p-4 bg-card border-border hover:shadow-md transition-all duration-300">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Performance Chart
                </h2>
                <p className="text-sm text-muted-foreground">
                  Overall portfolio value over time
                </p>
              </div>
              <TradingViewChart />
            </Card>
          </motion.div>

          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="p-4 bg-card border-border hover:shadow-md transition-all duration-300 h-full flex flex-col">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Your Strategies
                </h2>
                <p className="text-sm text-muted-foreground">
                  Manage your active strategies
                </p>
              </div>
              <div className="flex-1 overflow-auto space-y-4">
                <AnimatePresence>
                  {userStrats.map((strat) => (
                    <StrategyCard
                      key={strat.id}
                      strat={strat}
                      expandedId={expandedStrategy}
                      setExpandedId={setExpandedStrategy}
                      onAnalyze={() => setAnalyzeId(strat.id)}
                      onDeposit={() => setDepositId(strat.id)}
                      onWithdraw={() => setWithdrawId(strat.id)}
                    />
                  ))}
                </AnimatePresence>

                {/* Create strategy button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreate(true)}
                  className="cursor-pointer"
                >
                  <Card className="p-8 border-dashed border-2 hover:border-primary/50 hover:bg-muted/50 transition-all duration-300 flex flex-col items-center justify-center gap-3 group">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-background transition-colors duration-300">
                      <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                    </div>
                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                      Create Strategy
                    </p>
                  </Card>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </section>

        {/* 3) Balances Table */}
        <section>
          <h2 className="text-lg font-semibold mb-2 text-foreground">
            Your Balances
          </h2>
          <Card className="p-4 bg-card border-border hover:shadow-md transition-all duration-300">
            <BalanceTable data={userBalances} />
          </Card>
        </section>
      </motion.div>

      {/* Modals */}
      <AnalyzeStrategyModal
        open={!!analyzeId}
        onClose={() => setAnalyzeId(null)}
        strategyId={analyzeId}
        strategies={userStrats}
      />
      <DepositModal
        open={!!depositId}
        onClose={() => setDepositId(null)}
        strategyId={depositId}
        strategies={userStrats}
      />
      <WithdrawModal
        open={!!withdrawId}
        onClose={() => setWithdrawId(null)}
        strategyId={withdrawId}
        strategies={userStrats}
      />
      <CreateStrategyModal open={showCreate} onClose={() => setShowCreate(false)} />
    </PageLayout>
  );
}

// ---------------------------------------------------------------------------
// StrategyCard
// ---------------------------------------------------------------------------
function StrategyCard({
  strat,
  expandedId,
  setExpandedId,
  onAnalyze,
  onDeposit,
  onWithdraw
}: {
  strat: UserStrategy;
  expandedId: string | null;
  setExpandedId: (x: string | null) => void;
  onAnalyze: () => void;
  onDeposit: () => void;
  onWithdraw: () => void;
}) {
  const expanded = expandedId === strat.id;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card
        className={cn(
          "transition-all duration-200 hover:bg-muted/50 cursor-pointer",
          expanded && "bg-muted/50"
        )}
        onClick={() => setExpandedId(expanded ? null : strat.id)}
      >
        <div className="p-4">
          <div className="card-content-base">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {strat.tokens.map((tk, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full bg-background flex items-center justify-center ring-2 ring-muted"
                  >
                    {tk.symbol}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{strat.name}</h3>
                  <Bot className="h-4 w-4 text-primary" aria-label="Automated" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Strategy #{strat.id}
                </p>
              </div>
            </div>
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          {expanded && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <p className="text-sm text-muted-foreground">
                Base token: {strat.baseToken}
              </p>
              <p className="text-sm text-muted-foreground">{strat.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risk Level</span>
                  <span className={getRiskColor(strat.riskLevel)}>
                    {strat.riskLevel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance</span>
                  <span className="font-medium">{formatUSD(strat.userBalance)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Pool Distribution</h4>
                {strat.pools.map((p, idx) => {
                  const allocated = (strat.userBalance * (p.distribution || 0)) / 100;
                  return (
                    <div key={idx} className="bg-background rounded-lg p-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground">{p.market}</span>
                        <span className="text-emerald-400">{p.apr}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {p.protocol} • score: {p.riskScore}
                      </div>
                      <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${(p.distribution || 0).toFixed(2)}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {(p.distribution || 0).toFixed(2)}% allocation
                      </div>
                      <div className="mt-1 text-sm flex justify-between border-t pt-1">
                        <span className="text-foreground font-medium">
                          Allocated
                        </span>
                        <span className="font-medium text-foreground">
                          {formatUSD(allocated)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onAnalyze();
                }}
              >
                Analyze Strategy
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeposit();
                  }}
                >
                  Deposit
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onWithdraw();
                  }}
                >
                  Withdraw
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Balance Table
// ---------------------------------------------------------------------------
function BalanceTable({ data }: { data: BalanceItem[] }) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b border-border text-muted-foreground text-left">
          <th className="py-2 px-2">Asset</th>
          <th className="py-2 px-2">Address</th>
          <th className="py-2 px-2">Amount</th>
          <th className="py-2 px-2">Value (USD)</th>
          <th className="py-2 px-2">Locked?</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, i) => (
          <BalanceRow key={i} item={item} level={0} />
        ))}
      </tbody>
    </table>
  );
}

function BalanceRow({ item, level }: { item: BalanceItem; level: number }) {
  const rowPadding = 16 * level;
  const price = getMockPrice(item.label);
  const valueUSD = price * item.amount;

  return (
    <>
      <tr className="border-b border-border last:border-b-0">
        <td className="py-2 px-2" style={{ paddingLeft: rowPadding }}>
          {item.label}
        </td>
        <td className="py-2 px-2 text-xs text-muted-foreground">{item.address}</td>
        <td className="py-2 px-2">{formatTokenAmount(item.amount)}</td>
        <td className="py-2 px-2">
          {valueUSD > 0 ? formatUSD(valueUSD) : "-"}
        </td>
        <td className="py-2 px-2">{item.locked ? "Yes" : "No"}</td>
      </tr>
      {item.children?.map((child, idx) => (
        <BalanceRow key={idx} item={child} level={level + 1} />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Modals
// ---------------------------------------------------------------------------
interface ModalProps {
  open: boolean;
  onClose: () => void;
}
interface StrategyModalProps extends ModalProps {
  strategyId: string | null;
  strategies?: UserStrategy[];
}

function ModalBase({
  open,
  onClose,
  children
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-card p-6 rounded-md shadow-xl max-w-2xl w-full m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/** Analyze Strategy */
function AnalyzeStrategyModal({
  open,
  onClose,
  strategyId,
  strategies = []
}: StrategyModalProps) {
  if (!open || !strategyId) return null;
  const s = strategies.find((st) => st.id === strategyId);
  if (!s) return null;

  return (
    <ModalBase open={open} onClose={onClose}>
      <h2 className="text-lg font-bold text-foreground mb-2">Analyze Strategy</h2>
      <p className="text-sm text-muted-foreground mb-2">
        {s.name} (Base: {s.baseToken}) — {s.description}
      </p>
      <p className="text-sm text-muted-foreground mb-1">
        <strong>Creation Rule:</strong>{" "}
        {s.creationRule.type === "automated" ? (
          <>
            Automated, sorted by <strong>{s.creationRule.sortMetric}</strong>, top{" "}
            <strong>{s.creationRule.topN}</strong> pools <br />
            Distribution: <strong>{s.creationRule.distributionMethod}</strong> <br />
            Rebalancing: <strong>{s.creationRule.rebalancingMethod}</strong>
            {s.creationRule.rebalancingMethod === "timeBased" && s.creationRule.rebalancingFrequency && (
              <>
                , every {s.creationRule.rebalancingFrequency} hours
              </>
            )}
          </>
        ) : (
          <>Manual selection of pairs</>
        )}
      </p>

      {s.creationRule.type === "manual" &&
        s.creationRule.chosenPairs?.map((cp, i) => (
          <div key={i} className="flex justify-between text-sm text-muted-foreground">
            <span>pairId: {cp.pairId}</span>
            <span className="text-emerald-400">
              {cp.distribution.toFixed(2)}%
            </span>
          </div>
        ))}

      <h4 className="text-sm font-medium mb-2 mt-4">Pools Distribution</h4>
      <div className="space-y-2 text-sm mb-4">
        {s.pools.map((p, i) => (
          <div key={i} className="flex justify-between">
            <span className="text-muted-foreground">{p.market}</span>
            <span className="text-emerald-400">
              {(p.distribution || 0).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
      <Button variant="default" onClick={onClose}>
        Close
      </Button>
    </ModalBase>
  );
}

/** Deposit */
function DepositModal({
  open,
  onClose,
  strategyId,
  strategies = []
}: StrategyModalProps) {
  if (!open || !strategyId) return null;
  const s = strategies.find((st) => st.id === strategyId);
  if (!s) return null;

  const handleConfirm = () => {
    console.log("[Mock deposit] =>", s.id);
    onClose();
  };

  return (
    <ModalBase open={open} onClose={onClose}>
      <h2 className="text-lg font-bold text-foreground mb-2">Deposit</h2>
      <p className="text-sm text-muted-foreground mb-2">
        Strategy: {s.name} (Base: {s.baseToken})
      </p>
      <input
        type="number"
        placeholder={`Amount of ${s.baseToken}`}
        className="w-full mb-4 p-2 border border-border rounded bg-background text-foreground"
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="default" onClick={handleConfirm}>
          Confirm
        </Button>
      </div>
    </ModalBase>
  );
}

/** Withdraw */
function WithdrawModal({
  open,
  onClose,
  strategyId,
  strategies = []
}: StrategyModalProps) {
  if (!open || !strategyId) return null;
  const s = strategies.find((st) => st.id === strategyId);
  if (!s) return null;

  const handleConfirm = () => {
    console.log("[Mock withdraw] =>", s.id);
    onClose();
  };

  return (
    <ModalBase open={open} onClose={onClose}>
      <h2 className="text-lg font-bold text-foreground mb-2">Withdraw</h2>
      <p className="text-sm text-muted-foreground mb-2">
        Strategy: {s.name} (Base: {s.baseToken})
      </p>
      <input
        type="number"
        placeholder={`Amount of ${s.baseToken}`}
        className="w-full mb-4 p-2 border border-border rounded bg-background text-foreground"
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="default" onClick={handleConfirm}>
          Confirm
        </Button>
      </div>
    </ModalBase>
  );
}

/** 
 *  Create Strategy with:
 *   - user-defined Strategy Name
 *   - distributionMethod, rebalancingMethod for Automated
 *   - time-based rebalancing frequency if needed
 *   - manual multi-slider approach with auto-redistribution
 *   - highlight total distribution if not exactly 100
 */
function CreateStrategyModal({ open, onClose }: ModalProps) {
  const { pairs } = useDataContext();
  const [strategyName, setStrategyName] = useState("");
  const [strategyType, setStrategyType] = useState<"automated" | "manual">("automated");
  const [sortMetric, setSortMetric] = useState<"apr" | "lowRisk" | "tvl" | "volume">("apr");
  const [topN, setTopN] = useState(5);
  const [distributionMethod, setDistributionMethod] = useState<"static" | "dynamic">("static");
  const [rebalancingMethod, setRebalancingMethod] = useState<"manual" | "auto" | "timeBased" | "thresholdBased">("manual");
  const [rebalancingFrequency, setRebalancingFrequency] = useState<number>(24);

  const [baseToken, setBaseToken] = useState("USDC");

  // For manual approach
  const [manualPairs, setManualPairs] = useState<{ pairId: string; dist: number }[]>([]);
  const [selectedPair, setSelectedPair] = useState<string>("");

  if (!open) return null;

  const limitedPairs = pairs.slice(0, 20);

  // Add or remove pairs
  const handleAddPair = () => {
    if (!selectedPair) return;
    if (manualPairs.some((mp) => mp.pairId === selectedPair)) return;
    setManualPairs((prev) => [...prev, { pairId: selectedPair, dist: 0 }]);
    setSelectedPair("");
  };
  const handleRemovePair = (pid: string) => {
    setManualPairs((prev) => prev.filter((mp) => mp.pairId !== pid));
  };

  /**
   * Update distribution by auto-redistributing the difference among other pairs.
   */
  const handleDistChange = (pid: string, newDist: number) => {
    const oldDist = manualPairs.find((m) => m.pairId === pid)?.dist || 0;
    const diff = newDist - oldDist;
    // if lowering or only 1 pool, set directly (with clamp 0..100)
    if (diff < 0 || manualPairs.length < 2) {
      let testSum = 0;
      manualPairs.forEach((mp) => {
        if (mp.pairId === pid) testSum += newDist;
        else testSum += mp.dist;
      });
      if (testSum < 0) return;
      if (testSum > 100) return;
      setManualPairs((prev) =>
        prev.map((mp) => (mp.pairId === pid ? { ...mp, dist: newDist } : mp))
      );
      return;
    }

    // raising one slider => distribute among others
    const others = manualPairs.filter((m) => m.pairId !== pid);
    let sumOfOthers = 0;
    others.forEach((o) => (sumOfOthers += o.dist));
    if (sumOfOthers < diff) {
      // we can't raise that high
      newDist = oldDist + sumOfOthers; // max possible
    }

    // recalc diff with updated newDist
    const newDiff = newDist - oldDist;
    const deltaPer = newDiff / others.length;

    const newState = manualPairs.map((mp) => {
      if (mp.pairId === pid) {
        return { ...mp, dist: newDist };
      } else {
        let newVal = mp.dist - deltaPer;
        if (newVal < 0) newVal = 0;
        return { ...mp, dist: newVal };
      }
    });

    // final check sum
    let checkSum = 0;
    newState.forEach((ns) => (checkSum += ns.dist));
    if (checkSum > 100.0001) return;

    setManualPairs(newState);
  };

  const totalDist = manualPairs.reduce((acc, mp) => acc + mp.dist, 0);
  const isDistValid = Math.abs(totalDist - 100) < 0.001;

  const handleSubmit = () => {
    if (!strategyName.trim()) {
      alert("Please enter a strategy name.");
      return;
    }

    if (strategyType === "manual") {
      if (!isDistValid) {
        alert("Distribution must sum exactly to 100%!");
        return;
      }
      console.log("[Mock] Creating manual strategy with name:", strategyName, "pairs:", manualPairs);
    } else {
      // automated
      console.log("[Mock] Creating automated strategy with name:", strategyName, {
        sortMetric,
        topN,
        distributionMethod,
        rebalancingMethod,
        rebalancingFrequency
      });
    }
    onClose();
  };

  return (
    <ModalBase open={open} onClose={onClose}>
      <h2 className="text-lg font-bold text-foreground mb-2">Create Strategy</h2>
      <p className="text-sm text-muted-foreground mb-4">
        We’ve added multiple improvements: name field, better slider logic, rebalancing frequency, etc.
      </p>

      {/* 1) Strategy Name */}
      <label className="block text-sm font-medium text-foreground mb-1">
        Strategy Name
      </label>
      <input
        type="text"
        value={strategyName}
        onChange={(e) => setStrategyName(e.target.value)}
        placeholder="e.g. My New Strat"
        className="w-full p-2 border border-border rounded bg-background text-foreground mb-4"
      />

      {/* Strategy Type */}
      <label className="block text-sm font-medium text-foreground mb-1">Strategy Type</label>
      <select
        value={strategyType}
        onChange={(e) => setStrategyType(e.target.value as any)}
        className="w-full p-2 border border-border rounded bg-background text-foreground mb-4"
      >
        <option value="automated">Automated</option>
        <option value="manual">Manual</option>
      </select>

      {/* Base Token */}
      <label className="block text-sm font-medium text-foreground mb-1">Base Token</label>
      <select
        value={baseToken}
        onChange={(e) => setBaseToken(e.target.value)}
        className="w-full p-2 border border-border rounded bg-background text-foreground mb-4"
      >
        <option value="USDC">USDC</option>
        <option value="XLM">XLM</option>
      </select>

      {/* Automated logic */}
      {strategyType === "automated" ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Sort Metric
            </label>
            <select
              value={sortMetric}
              onChange={(e) => setSortMetric(e.target.value as any)}
              className="w-full p-2 border border-border rounded bg-background text-foreground"
            >
              <option value="apr">Highest APR</option>
              <option value="lowRisk">Lowest Risk Score</option>
              <option value="tvl">Highest TVL</option>
              <option value="volume">Highest Volume</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              How many pools?
            </label>
            <input
              type="number"
              className="w-full p-2 border border-border rounded bg-background text-foreground"
              min={1}
              max={20}
              value={topN}
              onChange={(e) => setTopN(parseInt(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Distribution Method
            </label>
            <select
              value={distributionMethod}
              onChange={(e) => setDistributionMethod(e.target.value as any)}
              className="w-full p-2 border border-border rounded bg-background text-foreground"
            >
              <option value="static">Static</option>
              <option value="dynamic">Dynamic</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Rebalancing Method
            </label>
            <select
              value={rebalancingMethod}
              onChange={(e) => setRebalancingMethod(e.target.value as any)}
              className="w-full p-2 border border-border rounded bg-background text-foreground"
            >
              <option value="manual">Manual</option>
              <option value="auto">Auto</option>
              <option value="timeBased">Time-based</option>
              <option value="thresholdBased">Threshold-based</option>
            </select>
          </div>

          {rebalancingMethod === "timeBased" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Rebalance Frequency (hours)
              </label>
              <input
                type="number"
                className="w-full p-2 border border-border rounded bg-background text-foreground"
                min={1}
                value={rebalancingFrequency}
                onChange={(e) => setRebalancingFrequency(parseInt(e.target.value))}
              />
            </div>
          )}
        </div>
      ) : (
        // Manual: multi-slider approach
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Add pairs & use sliders to ensure the total = 100%.
          </p>

          <div className="flex items-center gap-2">
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="flex-1 p-2 border border-border rounded bg-background text-foreground"
            >
              <option value="">Select a pair</option>
              {limitedPairs.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.token0Details?.symbol}/{pr.token1Details?.symbol} ({pr.protocol})
                </option>
              ))}
            </select>
            <Button variant="default" onClick={handleAddPair}>
              Add Pair
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-auto border p-2 rounded">
            <AnimatePresence>
              {manualPairs.map((mp) => {
                const pr = limitedPairs.find((x) => x.id === mp.pairId);
                if (!pr) return null;
                return (
                  <motion.div
                    key={mp.pairId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-foreground">
                        {pr.token0Details?.symbol}/{pr.token1Details?.symbol} ({pr.protocol})
                        &nbsp;
                        <span className="text-xs text-muted-foreground">{pr.id}</span>
                      </p>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={mp.dist}
                        className="w-full"
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          handleDistChange(mp.pairId, val);
                        }}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0%</span>
                        <span>{mp.dist.toFixed(2)}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemovePair(mp.pairId)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          {/* highlight if sum != 100 */}
          <p className={cn("text-sm mt-1", !isDistValid && "text-red-400")}>
            Total: {totalDist.toFixed(2)}%
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="default" onClick={handleSubmit}>
          Create
        </Button>
      </div>
    </ModalBase>
  );
}
