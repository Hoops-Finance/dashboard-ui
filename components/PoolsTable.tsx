"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { PoolRiskApiResponseObject, Pair, Token } from "@/utils/newTypes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useDataContext } from "@/contexts/DataContext";

interface PoolsTableProps {
  data: PoolRiskApiResponseObject[];
  pairs: Pair[];
  tokens: Token[];
  period: string;
  initialEntriesPerPage?: number;
  showSearch?: boolean;
  showPagination?: boolean;
  showPeriodLabel?: boolean;
}

type SortKey = keyof PoolRiskApiResponseObject;
type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  key: SortKey | null;
  direction: SortDirection;
}

const PERIODS_LABELS: Record<string, string> = {
  '24h': '24H',
  '7d': '7D',
  '14d': '14D',
  '30d': '30D',
  '90d': '90D',
  '180d': '180D',
  '360d': '360D'
};

export function PoolsTable({
  data,
  pairs,
  tokens,
  period,
  initialEntriesPerPage = 10,
  showSearch = true,
  showPagination = true,
  showPeriodLabel = true
}: PoolsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(initialEntriesPerPage);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });
  const router = useRouter();
  const { buildPoolRoute } = useDataContext();

  const filteredData = useMemo(() => {
    return data.filter((pool) => {
      if (searchQuery === '') return true;
      const lowerQuery = searchQuery.toLowerCase();
      return pool.market.toLowerCase().includes(lowerQuery) 
          || pool.protocol.toLowerCase().includes(lowerQuery);
    });
  }, [data, searchQuery]);

  const handleSort = (key: SortKey) => {
    setSortConfig((current) => {
      if (current.key === key) {
        if (current.direction === 'asc') {
          return { key, direction: 'desc' };
        }
        if (current.direction === 'desc') {
          return { key: null, direction: null };
        }
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedData = useMemo(() => {
    const d = [...filteredData];
    if (sortConfig.key && sortConfig.direction) {
      const getVal = (val: unknown): number => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          const parsed = parseFloat(val.replace(/[^0-9.-]+/g, ''));
          return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
      };
      d.sort((a, b) => {
        const aVal = getVal(a[sortConfig.key!]);
        const bVal = getVal(b[sortConfig.key!]);
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return d;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = showPagination ? sortedData.slice(startIndex, startIndex + entriesPerPage) : sortedData;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const getProtocolDisplay = (proto: string) => {
    return proto.toLowerCase() === 'aqua' ? 'Aquarius' : proto;
  };

  const finalPeriodLabel = PERIODS_LABELS[period] || '24H';

  const onRowClick = (pool:PoolRiskApiResponseObject) => {
    const route = buildPoolRoute(pool);
    router.push(route);
  };

  const SortableHeader = ({
    children,
    sortKey,
    align = 'left'
  }: {
    children: React.ReactNode;
    sortKey: SortKey;
    align?: 'left'|'right';
  }) => (
    <TableHead 
      onClick={() => handleSort(sortKey)} 
      className={cn(
        "h-10 px-4 align-middle font-medium text-muted-foreground cursor-pointer select-none table-header-label",
        align === 'right' ? 'text-right' : 'text-left'
      )}
    >
      <div className="flex items-center gap-1" style={{ justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
        <span>{children}</span>
        <ArrowUpDown
          className={`h-4 w-4 ${
            sortConfig.key === sortKey 
              ? 'text-foreground' 
              : 'text-muted-foreground/50'
          }`}
        />
      </div>
    </TableHead>
  );

  return (
    <div className="pools-motion">
      {showSearch && (
        <div className="flex-center-g-4">
          <div className="flex-1 relative">
            <Search className="search-bar" aria-hidden="true" />
            <Input 
              placeholder="Search by token/pair/pool address"
              className="pl-10 h-9"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search pools"
            />
          </div>
          <Button 
            variant="secondary" 
            className="h-9"
            onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
            aria-label="Reset filters"
          >
            Reset
          </Button>
          <Select
            value={entriesPerPage.toString()}
            onValueChange={(value) => {
              const newVal = parseInt(value, 10);
              setEntriesPerPage(newVal);
              setCurrentPage(1);
            }}
            aria-label="Number of entries per page"
          >
            <SelectTrigger className="w-[70px] h-9">
              <SelectValue placeholder="10"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="table-header-label">Protocol</TableHead>
              <TableHead className="table-header-label">Pair/Pool</TableHead>
              <SortableHeader sortKey="apr">Est. {showPeriodLabel ? finalPeriodLabel : ''} APR</SortableHeader>
              <SortableHeader sortKey="totalValueLocked">TVL</SortableHeader>
              <SortableHeader sortKey="volume">{showPeriodLabel ? finalPeriodLabel : ''} Volume</SortableHeader>
              <SortableHeader sortKey="fees">{showPeriodLabel ? finalPeriodLabel : ''} Fees</SortableHeader>
              <SortableHeader sortKey="riskScore">Risk Score</SortableHeader>
              <TableHead className="table-header-label">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="table-cell-base">
                  No pools data available
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((pool, index) => (
                <TableRow 
                  key={index}
                  className="group table-row-hover"
                  onClick={() => onRowClick(pool)}
                >
                  <TableCell className="table-header-cell">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "capitalize px-3 py-1",
                        pool.protocol === "soroswap" && "bg-purple-500/10 text-purple-500 border-purple-500/20",
                        pool.protocol === "blend" && "bg-green-500/10 text-green-500 border-green-500/20",
                        pool.protocol === "phoenix" && "bg-orange-500/10 text-orange-500 border-orange-500/20",
                        pool.protocol === "aqua" && "bg-pink-500/10 text-pink-500 border-pink-500/20"
                      )}
                    >
                      {getProtocolDisplay(pool.protocol)}
                    </Badge>
                  </TableCell>
                  <TableCell className="table-header-cell">
                    {pool.market}
                  </TableCell>
                  <TableCell className="table-header-cell">
                    {pool.apr}
                  </TableCell>
                  <TableCell className="table-header-cell">
                    ${Number(pool.totalValueLocked).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="table-header-cell">
                    ${Number(pool.volume).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="table-header-cell">
                    ${Number(pool.fees).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="table-header-cell">
                    <span className={`font-medium ${Number(pool.riskScore) <= 50 ? 'text-green-500' : 'text-red-500'}`}>
                      {Number(pool.riskScore).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="table-header-cell">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="details-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(pool);
                      }}
                    >
                      View Details
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && sortedData.length > entriesPerPage && (
        <div className="table-footer">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + entriesPerPage, sortedData.length)} of {sortedData.length} entries
          </div>
          <div className="flex-center-g-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  return page === 1 || 
                        page === totalPages || 
                        Math.abs(page - currentPage) <= 1;
                })
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
