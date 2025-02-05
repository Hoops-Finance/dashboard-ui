"use client";
import { useState, useMemo, ChangeEvent } from "react";
import { Token, Pair, PoolRiskApiResponseObject } from "@/utils/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { STABLECOIN_IDS } from "@/utils/utilities";

type TokenFilter = "all" | "stablecoins" | "hot";

interface TokenTableProps {
  tokens: Token[];
  pairs: Pair[];
  poolRiskData: PoolRiskApiResponseObject[];
}

export function TokenTable({ tokens, pairs, poolRiskData }: TokenTableProps) {
  const [selectedTab, setSelectedTab] = useState<TokenFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Determine "hot" tokens: top by volume and top by number of pairs
  const realTokenRegex = useMemo(() => /^[^:]+:G[A-Z0-9]{55}$/, []);

  const filteredRealTokens = useMemo(() => {
    return tokens.filter((token) => realTokenRegex.test(token.name) || token.symbol.toUpperCase() === "XLM");
  }, [tokens, realTokenRegex]);

  const pairMap = useMemo(() => {
    const m = new Map<string, Pair>();
    for (const p of pairs) m.set(p.id, p);
    return m;
  }, [pairs]);

  // Compute volume per token:
  const volumeMap = useMemo(() => {
    const volMap = new Map<string, number>();
    for (const pd of poolRiskData) {
      const vol = parseFloat(pd.volume);
      const p = pairMap.get(pd.pairId);
      if (!p) continue;
      volMap.set(p.token0, (volMap.get(p.token0) ?? 0) + vol);
      volMap.set(p.token1, (volMap.get(p.token1) ?? 0) + vol);
    }
    return volMap;
  }, [poolRiskData, pairMap]);

  // Compute TVL per token and count distinct counter-assets:
  const tvlMap = useMemo(() => {
    const tvlMapInner = new Map<string, number>();
    for (const p of pairs) {
      const t0 = p.token0;
      const t1 = p.token1;
      // Each pair has a TVL, count it for both tokens
      if (p.tvl) {
        tvlMapInner.set(t0, (tvlMapInner.get(t0) ?? 0) + p.tvl);
        tvlMapInner.set(t1, (tvlMapInner.get(t1) ?? 0) + p.tvl);
      }
    }
    return tvlMapInner;
  }, [pairs]);

  const tokenPairCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const token of filteredRealTokens) {
      map.set(token.id, token.pairs.length);
    }
    return map;
  }, [filteredRealTokens]);

  const topPairCountTokens = useMemo(() => {
    const arr = Array.from(tokenPairCountMap.entries());
    arr.sort((a, b) => b[1] - a[1]);
    return new Set<string>(arr.slice(0, 10).map((i) => i[0]));
  }, [tokenPairCountMap]);

  const topVolumeTokens = useMemo(() => {
    const arr = Array.from(volumeMap.entries());
    arr.sort((a, b) => b[1] - a[1]);
    return new Set<string>(arr.slice(0, 10).map((i) => i[0]));
  }, [volumeMap]);

  const hotTokens = useMemo(() => {
    const s = new Set<string>();
    for (const tid of Array.from(topPairCountTokens)) s.add(tid);
    for (const tid of Array.from(topVolumeTokens)) s.add(tid);
    return s;
  }, [topPairCountTokens, topVolumeTokens]);

  const filteredTokens = useMemo(() => {
    return filteredRealTokens.filter((token) => {
      const q = searchQuery.toLowerCase();
      const matches = token.name.toLowerCase().includes(q) || token.symbol.toLowerCase().includes(q);
      if (!matches) return false;

      if (selectedTab === "stablecoins") {
        return STABLECOIN_IDS.has(token.id);
      } else if (selectedTab === "hot") {
        return hotTokens.has(token.id);
      }

      return true;
    });
  }, [filteredRealTokens, searchQuery, selectedTab, hotTokens]);

  const totalPages = Math.ceil(filteredTokens.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const displayedTokens = filteredTokens.slice(startIndex, startIndex + rowsPerPage);

  const handleReset = () => {
    setSearchQuery("");
    setSelectedTab("all");
    setCurrentPage(1);
  };

  const explorerLink = (token: Token) => {
    if (token.symbol.toUpperCase() === "XLM") {
      return "https://stellar.expert/explorer/public/asset/native";
    } else {
      const [sym, iss] = token.name.split(":");
      return `https://stellar.expert/explorer/public/asset/${sym}-${iss}`;
    }
  };

  const getTokenTVL = (token: Token): number => {
    return tvlMap.get(token.id) ?? 0;
  };

  const getCounterAssetsCount = (token: Token): number => {
    // The token's pairs field lists pairs involving this token.
    // Count how many unique other tokens it trades against:
    const assetSet = new Set<string>();
    for (const tpp of token.pairs) {
      const p = pairMap.get(tpp.pairId);
      if (!p) continue;
      // If token is token0, counter is token1, else token0:
      const counterId = p.token0 === token.id ? p.token1 : p.token0;
      assetSet.add(counterId);
    }
    return assetSet.size;
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          variant={selectedTab === "all" ? "default" : "secondary"}
          onClick={() => {
            setSelectedTab("all");
            setCurrentPage(1);
          }}
          className="h-9"
        >
          All Tokens
        </Button>
        <Button
          variant={selectedTab === "stablecoins" ? "default" : "secondary"}
          onClick={() => {
            setSelectedTab("stablecoins");
            setCurrentPage(1);
          }}
          className="h-9"
        >
          Stablecoins
        </Button>
        <Button
          variant={selectedTab === "hot" ? "default" : "secondary"}
          onClick={() => {
            setSelectedTab("hot");
            setCurrentPage(1);
          }}
          className="h-9"
        >
          Hot Tokens
        </Button>

        <div className="flex-1 relative">
          <Search className="search-bar" aria-hidden="true" />
          <Input
            placeholder="Search by token name or symbol"
            className="pl-10 h-9"
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Search tokens"
          />
        </div>

        <Button variant="secondary" className="h-9" onClick={handleReset}>
          Reset
        </Button>
      </div>

      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">TVL</TableHead>
              <TableHead className="text-right">Counter Assets</TableHead>
              <TableHead className="text-right">Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedTokens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-10 px-4 text-center text-sm text-muted-foreground">
                  No tokens found
                </TableCell>
              </TableRow>
            ) : (
              displayedTokens.map((token) => {
                const [symbolName] = token.name.split(":");
                const priceDisplay =
                  token.price && token.price > 0
                    ? token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })
                    : "0.00";
                const tvl = getTokenTVL(token);
                const counterCount = getCounterAssetsCount(token);

                let detailsUrl: string;
                if (token.symbol.toUpperCase() === "XLM") {
                  detailsUrl = "/tokens/native";
                } else {
                  detailsUrl = `/tokens/${token.name.replace(/:/g, "-")}`;
                }

                return (
                  <TableRow
                    key={token.id}
                    className="hoverable-row group"
                    style={{ cursor: "pointer" }}
                    onClick={() => (window.location.href = detailsUrl)}
                  >
                    <TableCell className="h-10 px-4 align-middle">
                      <div className="flex items-center gap-2" title={token.symbol}>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden relative">
                          {token.symbol.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{symbolName}</div>
                          <div className="text-sm text-muted-foreground">{token.symbol}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">${priceDisplay}</TableCell>
                    <TableCell className="text-right">${tvl.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{counterCount}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(token.lastUpdated).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <a
                        href={explorerLink(token)}
                        className="underline text-primary hover:text-primary/80"
                        target="_blank"
                        rel="noreferrer"
                        title="View on Stellar Expert"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        Explorer
                      </a>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {filteredTokens.length > rowsPerPage && (
        <div className="table-footer">
          <div className="flex-center-g-4">
            <div className="flex-center-g-2">
              <span className="text-sm text-muted-foreground">Show</span>
              <Select
                value={rowsPerPage.toString()}
                onValueChange={(value) => {
                  setRowsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[70px] h-8" title="Select number of entries per page">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">entries</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredTokens.length)} of {filteredTokens.length} entries
            </div>
          </div>
          <div className="flex-center-g-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
              }}
              disabled={currentPage === 1}
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                .map((page, idx, arr) => (
                  <div key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && <span className="px-2 text-sm text-muted-foreground">...</span>}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setCurrentPage(page);
                      }}
                      title={`Go to page ${page}`}
                    >
                      {page}
                    </Button>
                  </div>
                ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
              }}
              disabled={currentPage === totalPages}
              title="Next page"
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
